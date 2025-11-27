import React, { createContext, useEffect, useRef } from 'react'
import { connectSocket, disconnectSocket, socketEvents, getSocket } from '../services/socket'
import { getAccessToken } from '../services/httpClient'
import { useAuth } from '../hooks/useAuth'
import { useContext } from 'react'
import { CrucesContext } from './CrucesContext'
import { normalizeCruceData, voltageToPercentage } from '../utils/telemetriaHelpers'

// Logging condicional
const IS_DEBUG = import.meta.env.VITE_DEBUG_MODE === 'true'
const debugLog = (...args) => IS_DEBUG && console.log(...args)

/**
 * Contexto especializado para gestión de Socket.IO
 * Maneja conexión, suscripciones y eventos en tiempo real
 */
export const SocketContext = createContext()

export function SocketProvider({ children }) {
	const { user, isAuthenticated: checkAuth } = useAuth()
	const { cruces, updateCruceInState, upsertCruceInState } = useContext(CrucesContext)

	// Referencias para Socket.IO
	const crucesRef = useRef([])
	const subscribedRoomsRef = useRef(new Set())
	const previousCruceIdsStringRef = useRef('')

	// Sincronizar crucesRef con cruces para uso en callbacks de Socket.IO
	useEffect(() => {
		crucesRef.current = cruces
	}, [cruces])

	// Efecto para conectar Socket.IO
	useEffect(() => {
		if (user && checkAuth()) {
			const token = getAccessToken()
			if (token) {
				connectSocket(token)
			}

			return () => {
				disconnectSocket()
			}
		}
	}, [user, checkAuth])

	// Suscribirse a salas de cruces cuando cambian los IDs
	useEffect(() => {
		if (!user || !checkAuth()) {
			return
		}

		const socket = getSocket()
		if (!socket || !socket.connected || !cruces || cruces.length === 0) {
			return
		}

		const currentCruceIdsString = cruces.map(c => String(c.id || c.id_cruce)).sort().join(',')

		if (currentCruceIdsString === previousCruceIdsStringRef.current) {
			return
		}

		const currentCruceIds = new Set(cruces.map(cruce => cruce.id || cruce.id_cruce))
		const cruceRooms = Array.from(currentCruceIds).map(id => `cruce_${id}`)

		const nuevasSalas = cruceRooms.filter(room => !subscribedRoomsRef.current.has(room))

		if (nuevasSalas.length > 0) {
			debugLog('📡 [SocketContext] Nuevos cruces detectados, suscribiéndose a:', nuevasSalas)
			socketEvents.subscribe(nuevasSalas)

			nuevasSalas.forEach(room => {
				socket.emit('join_room', { room })
				subscribedRoomsRef.current.add(room)
			})
		}

		const salasRemovidas = Array.from(subscribedRoomsRef.current).filter(room => 
			!cruceRooms.includes(room)
		)
		if (salasRemovidas.length > 0) {
			debugLog('🧹 [SocketContext] Cruces removidos, limpiando suscripciones:', salasRemovidas)
			salasRemovidas.forEach(room => {
				socket.emit('leave_room', { room })
				subscribedRoomsRef.current.delete(room)
			})
		}

		subscribedRoomsRef.current = new Set(cruceRooms)
		previousCruceIdsStringRef.current = currentCruceIdsString
	}, [cruces, user, checkAuth])

	// Escuchar eventos de Socket.IO
	useEffect(() => {
		if (!user || !checkAuth()) {
			return
		}

		const handleConnected = (data) => {
			debugLog('✅ [SocketContext] Usuario autenticado en Socket.IO:', data.user)

			const generalEvents = ['telemetria', 'barrier_events', 'alertas']
			debugLog('📡 [SocketContext] Suscribiéndose a eventos generales:', generalEvents)
			socketEvents.subscribe(generalEvents)

			if (crucesRef.current && crucesRef.current.length > 0) {
				const socket = getSocket()
				const cruceRooms = crucesRef.current.map(cruce => `cruce_${cruce.id || cruce.id_cruce}`)
				debugLog('📡 [SocketContext] Re-suscribiéndose tras reconexión a cruces:', cruceRooms)
				socketEvents.subscribe(cruceRooms)

				cruceRooms.forEach(room => {
					socket.emit('join_room', { room })
				})
			}
		}

		const handleSubscribed = (data) => {
			debugLog('✅ [SocketContext] Suscripción confirmada:', data)
		}

		const handleJoinedRoom = (data) => {
			debugLog('✅ [SocketContext] Unido a sala:', data)
		}

		const handleNotification = (notificationData) => {
			debugLog('🔔 Notificación:', notificationData)
		}

		const handleDashboardUpdate = (data) => {
			debugLog('📊 Dashboard actualizado:', data)
		}

		// ✅ CORRECCIÓN: Usar normalizeCruceData de helpers para consumir telemetria_actual correctamente
		const transformCruceData = (cruceData) => {
			// Si ya está normalizado, retornarlo
			if (cruceData.id_cruce && cruceData.bateria !== undefined) {
				return cruceData
			}

			// Usar normalizeCruceData si tiene telemetria_actual
			if (cruceData.telemetria_actual || cruceData.ultima_telemetria || cruceData.telemetria) {
				// Normalizar el objeto para que tenga la estructura esperada
				const cruceParaNormalizar = {
					...cruceData,
					telemetria_actual: cruceData.telemetria_actual || cruceData.ultima_telemetria || cruceData.telemetria,
				}
				const normalized = normalizeCruceData(cruceParaNormalizar)
				return {
					...normalized,
					id_cruce: cruceData.id || cruceData.id_cruce || normalized.id,
					coordenadas: {
						lat: cruceData.coordenadas_lat || cruceData.coordenadas?.lat || normalized.coordenadas_lat || 0,
						lng: cruceData.coordenadas_lng || cruceData.coordenadas?.lng || normalized.coordenadas_lng || 0,
					},
					alertas: cruceData.alertas || [],
					alertasActivas: (cruceData.alertas || []).filter(a => !a.resolved).length,
				}
			}

			// Fallback para datos sin telemetría
			return {
				id_cruce: cruceData.id || cruceData.id_cruce,
				nombre: cruceData.nombre,
				ubicacion: cruceData.ubicacion,
				estado: cruceData.estado || 'ACTIVO',
				coordenadas: {
					lat: cruceData.coordenadas_lat || 0,
					lng: cruceData.coordenadas_lng || 0,
				},
				bateria: cruceData.bateria || 0,
				sensoresActivos: cruceData.sensoresActivos || 0,
				ultimaActividad: cruceData.ultimaActividad || cruceData.updated_at || cruceData.created_at,
				...cruceData,
			}
		}

		const handleCruceUpdate = (cruceData) => {
			debugLog('🔄 [SocketContext] Evento cruce_update recibido:', cruceData)
			const cruceTransformado = transformCruceData(cruceData)
			upsertCruceInState(cruceTransformado)
		}

		const handleTelemetriaUpdated = (telemetriaData) => {
			debugLog('📊 Telemetría actualizada:', telemetriaData)
			const cruceId = telemetriaData.cruce || telemetriaData.id_cruce
			if (!cruceId) return

			updateCruceInState(cruceId, (cruce) => {
				// ✅ CORRECCIÓN: Usar voltageToPercentage de helpers para calcular batería correctamente
				const batteryVoltage = telemetriaData.battery_voltage
				const batteryPercentage = batteryVoltage ? voltageToPercentage(batteryVoltage) : cruce.bateria

				return {
					...cruce,
					bateria: batteryPercentage,
					voltage: telemetriaData.barrier_voltage || cruce.voltage,
					battery_voltage: telemetriaData.battery_voltage || cruce.battery_voltage,
					temperature: telemetriaData.temperature !== undefined ? telemetriaData.temperature : cruce.temperature,
					barrier_state: telemetriaData.barrier_status || cruce.barrier_state,
					signal_strength: telemetriaData.signal_strength !== undefined ? telemetriaData.signal_strength : cruce.signal_strength,
					rssi: telemetriaData.signal_strength !== undefined ? telemetriaData.signal_strength : cruce.rssi,
					sensor_1: telemetriaData.sensor_1 !== undefined ? telemetriaData.sensor_1 : cruce.sensor_1,
					sensor_2: telemetriaData.sensor_2 !== undefined ? telemetriaData.sensor_2 : cruce.sensor_2,
					sensor_3: telemetriaData.sensor_3 !== undefined ? telemetriaData.sensor_3 : cruce.sensor_3,
					sensor_4: telemetriaData.sensor_4 !== undefined ? telemetriaData.sensor_4 : cruce.sensor_4,
					ultimaActividad: telemetriaData.timestamp || new Date().toISOString(),
					telemetria: telemetriaData,
					telemetria_actual: telemetriaData, // Mantener referencia a telemetría actual
				}
			})
		}

		const handleNewAlerta = (alertaData) => {
			debugLog('⚠️ Nueva alerta:', alertaData)
			const cruceId = alertaData.cruce || alertaData.id_cruce
			if (!cruceId) return

			updateCruceInState(cruceId, (cruce) => {
				const alertasActuales = cruce.alertas || []
				const nuevaAlerta = {
					...alertaData,
					resolved: false,
				}
				return {
					...cruce,
					alertas: [nuevaAlerta, ...alertasActuales],
					alertasActivas: (cruce.alertasActivas || 0) + 1,
				}
			})
		}

		const handleAlertaResolved = (alertaData) => {
			debugLog('✅ Alerta resuelta:', alertaData)
			const cruceId = alertaData.cruce || alertaData.id_cruce
			if (!cruceId) return

			updateCruceInState(cruceId, (cruce) => {
				const alertasActualizadas = (cruce.alertas || []).map(alerta => 
					alerta.id === alertaData.id ? { ...alerta, resolved: true } : alerta
				)
				return {
					...cruce,
					alertas: alertasActualizadas,
					alertasActivas: Math.max(0, (cruce.alertasActivas || 0) - 1),
				}
			})
		}

		const handleBarrierEvent = (barrierData) => {
			debugLog('🚧 Evento de barrera:', barrierData)
			const cruceId = barrierData.cruce || barrierData.id_cruce
			if (cruceId) {
				updateCruceInState(cruceId, (cruce) => ({
					...cruce,
					barrier_state: barrierData.barrier_status || barrierData.event_type,
					ultimaActividad: barrierData.timestamp || new Date().toISOString(),
				}))
			}
		}

		// Registrar listeners
		socketEvents.onConnected(handleConnected)
		socketEvents.onSubscribed(handleSubscribed)
		socketEvents.onJoinedRoom(handleJoinedRoom)
		socketEvents.onNotification(handleNotification)
		socketEvents.onDashboardUpdate(handleDashboardUpdate)
		socketEvents.onCruceUpdate(handleCruceUpdate)
		socketEvents.onNewTelemetria(handleTelemetriaUpdated)
		socketEvents.onNewAlerta(handleNewAlerta)
		socketEvents.onAlertaResolved(handleAlertaResolved)
		socketEvents.onBarrierEvent(handleBarrierEvent)

		// Cleanup
		return () => {
			debugLog('🧹 [SocketContext] Limpiando listeners')
			// ✅ CORRECCIÓN: Usar off() con las referencias correctas en lugar de removeAllListeners
			// Esto evita afectar otros componentes que también usan estos eventos
			socketEvents.off('connected', handleConnected)
			socketEvents.off('subscribed', handleSubscribed)
			socketEvents.off('joined_room', handleJoinedRoom)
			socketEvents.off('notification', handleNotification)
			socketEvents.off('dashboard_update', handleDashboardUpdate)
			socketEvents.off('cruce_update', handleCruceUpdate)
			socketEvents.off('new_telemetria', handleTelemetriaUpdated)
			socketEvents.off('new_alerta', handleNewAlerta)
			socketEvents.off('alerta_resolved', handleAlertaResolved)
			socketEvents.off('barrier_event', handleBarrierEvent)
		}
	}, [user, updateCruceInState, upsertCruceInState, checkAuth])

	const value = {
		// Socket.IO está conectado si hay socket y está connected
		isConnected: () => {
			const socket = getSocket()
			return socket && socket.connected
		},
	}

	return (
		<SocketContext.Provider value={value}>
			{children}
		</SocketContext.Provider>
	)
}

