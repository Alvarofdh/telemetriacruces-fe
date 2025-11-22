import React, { createContext, useState, useEffect, useRef, useCallback } from 'react'
import {
	checkHealth,
	getCruces,
	getCruce,
	createCruce,
	updateCruce,
	deleteCruce,
	getTelemetria,
	getAlertas,
	getSensores,
	getBarrierEvents,
	login as apiLogin,
	logout as apiLogout,
	getStoredUser,
	isAuthenticated,
	usuariosAPI,
	logsAPI,
} from '../services'
import { connectSocket, disconnectSocket, socketEvents, getSocket } from '../services/socket'
import { getAccessToken } from '../services/httpClient'
import toast from 'react-hot-toast'

/**
 * Contexto de datos global de la aplicación
 * Proporciona acceso a cruces, usuarios, logs, y funciones de gestión
 */
export const DataContext = createContext()

export function DataProvider({ children }) {
	// Estado de autenticación con persistencia en localStorage
	const [user, setUser] = useState(() => {
		return getStoredUser()
	})
	const [isAdmin, setIsAdmin] = useState(() => {
		if (!user) return false
		return user.profile?.role === 'ADMIN' || user.profile?.role === 'MAINTENANCE'
	})

	// Estados para datos del ESP32
	const [cruces, setCruces] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [isESP32Connected, setIsESP32Connected] = useState(false)
	const [lastUpdate, setLastUpdate] = useState(null)
	const [error, setError] = useState(null)
	const crucesRef = useRef([]) // ✅ NUEVO: Referencia para acceder a cruces en callbacks
	const isLoadingRef = useRef(false) // ✅ NUEVO: Prevenir múltiples cargas simultáneas
	const subscribedRoomsRef = useRef(new Set()) // ✅ NUEVO: Rastrear salas ya suscritas para evitar re-suscripciones
	const previousCruceIdsStringRef = useRef('') // ✅ NUEVO: Rastrear string de IDs anterior para comparación

	// Datos mock de cruces (fallback cuando no hay conexión con ESP32)
	const crucesBackup = [
		{
			id_cruce: 1,
			nombre: 'Cruce La Serena',
			estado: 'ACTIVO',
			bateria: 92,
			sensoresActivos: 4,
			ubicacion: 'Km 472.5, Ruta 5 Norte',
			ultimaActividad: '2024-01-15 08:30',
			tipoTren: 'Carga',
			velocidadPromedio: 65,
			coordenadas: { lat: -29.9027, lng: -71.2507 },
			fechaInstalacion: '2023-06-15',
			ultimoMantenimiento: '2024-01-10',
			responsable: 'Carlos Mendoza',
			telefono: '+56 9 8765 4321'
		},
		{
			id_cruce: 2,
			nombre: 'Cruce Coquimbo',
			estado: 'MANTENIMIENTO',
			bateria: 56,
			sensoresActivos: 2,
			ubicacion: 'Km 485.2, Ruta 5 Norte',
			ultimaActividad: '2024-01-14 14:20',
			tipoTren: 'Pasajeros',
			velocidadPromedio: 45,
			coordenadas: { lat: -29.9533, lng: -71.3395 },
			fechaInstalacion: '2023-08-20',
			ultimoMantenimiento: '2024-01-05',
			responsable: 'Ana García',
			telefono: '+56 9 7654 3210'
		},
		{
			id_cruce: 3,
			nombre: 'Cruce Ovalle',
			estado: 'ACTIVO',
			bateria: 78,
			sensoresActivos: 3,
			ubicacion: 'Km 412.8, Ruta 43',
			ultimaActividad: '2024-01-15 09:15',
			tipoTren: 'Mixto',
			velocidadPromedio: 55,
			coordenadas: { lat: -30.5978, lng: -71.2005 },
			fechaInstalacion: '2023-05-10',
			ultimoMantenimiento: '2024-01-08',
			responsable: 'Luis Rodriguez',
			telefono: '+56 9 6543 2109'
		},
		{
			id_cruce: 4,
			nombre: 'Cruce Vicuña',
			estado: 'ACTIVO',
			bateria: 65,
			sensoresActivos: 1,
			ubicacion: 'Km 398.1, Ruta 41',
			ultimaActividad: '2024-01-15 07:45',
			tipoTren: 'Carga',
			velocidadPromedio: 70,
			coordenadas: { lat: -30.0332, lng: -70.7081 },
			fechaInstalacion: '2023-07-25',
			ultimoMantenimiento: '2024-01-12',
			responsable: 'María Silva',
			telefono: '+56 9 5432 1098'
		},
		{
			id_cruce: 5,
			nombre: 'Cruce Illapel',
			estado: 'INACTIVO',
			bateria: 15,
			sensoresActivos: 0,
			ubicacion: 'Km 234.7, Ruta 31',
			ultimaActividad: '2024-01-12 16:30',
			tipoTren: 'N/A',
			velocidadPromedio: 0,
			coordenadas: { lat: -31.6321, lng: -71.1704 },
			fechaInstalacion: '2023-04-18',
			ultimoMantenimiento: '2023-12-20',
			responsable: 'Pedro Morales',
			telefono: '+56 9 4321 0987'
		},
		{
			id_cruce: 6,
			nombre: 'Cruce Los Vilos',
			estado: 'ACTIVO',
			bateria: 89,
			sensoresActivos: 4,
			ubicacion: 'Km 287.3, Ruta 5 Norte',
			ultimaActividad: '2024-01-15 09:50',
			tipoTren: 'Pasajeros',
			velocidadPromedio: 50,
			coordenadas: { lat: -31.9069, lng: -71.5033 },
			fechaInstalacion: '2023-09-12',
			ultimoMantenimiento: '2024-01-14',
			responsable: 'Carmen López',
			telefono: '+56 9 3210 9876'
		},
		{
			id_cruce: 7,
			nombre: 'Cruce Salamanca',
			estado: 'MANTENIMIENTO',
			bateria: 34,
			sensoresActivos: 1,
			ubicacion: 'Km 256.9, Ruta 43',
			ultimaActividad: '2024-01-13 11:20',
			tipoTren: 'Carga',
			velocidadPromedio: 30,
			coordenadas: { lat: -31.7765, lng: -70.9665 },
			fechaInstalacion: '2023-03-22',
			ultimoMantenimiento: '2023-12-28',
			responsable: 'Diego Fernández',
			telefono: '+56 9 2109 8765'
		},
		{
			id_cruce: 8,
			nombre: 'Cruce Combarbalá',
			estado: 'ACTIVO',
			bateria: 91,
			sensoresActivos: 3,
			ubicacion: 'Km 345.6, Ruta 43',
			ultimaActividad: '2024-01-15 08:55',
			tipoTren: 'Mixto',
			velocidadPromedio: 60,
			coordenadas: { lat: -31.1745, lng: -71.0364 },
			fechaInstalacion: '2023-11-08',
			ultimoMantenimiento: '2024-01-11',
			responsable: 'Andrea Castro',
			telefono: '+56 9 1098 7654'
		}
	]

	const normalizeContactoBackup = (cruce) => ({
		...cruce,
		responsable_nombre: cruce.responsable_nombre || cruce.responsable || '',
		responsable_telefono: cruce.responsable_telefono || cruce.telefono || '',
		responsable_email: cruce.responsable_email || '',
		responsable_empresa: cruce.responsable_empresa || '',
		responsable_horario: cruce.responsable_horario || ''
	})

	const crucesBackupNormalizados = crucesBackup.map(normalizeContactoBackup)

	// Usuarios del sistema (cargados del backend)
	const [usuarios, setUsuarios] = useState([])
	const [isLoadingUsuarios, setIsLoadingUsuarios] = useState(false)
	const [usuariosError, setUsuariosError] = useState(null)
	const isLoadingUsuariosRef = useRef(false)

	// Logs de actividad del sistema (cargados del backend)
	const [logs, setLogs] = useState([])
	const [isLoadingLogs, setIsLoadingLogs] = useState(false)
	const [logsError, setLogsError] = useState(null)
	const isLoadingLogsRef = useRef(false)

	// Configuración del sistema
	const [configuracion, setConfiguracion] = useState({
		nombre_sistema: 'Sistema de Monitoreo Cruces Ferroviarios',
		version: '2.1.3',
		notificaciones_email: true,
		notificaciones_sms: false,
		intervalo_monitoreo: 30,
		umbral_bateria_critica: 20,
		umbral_bateria_baja: 50,
		backup_automatico: true,
		mantenimiento_programado: '02:00'
	})

	// Rate limiting para logs de error (evitar saturar la consola)
	const lastErrorLogTime = useRef(0)
	const ERROR_LOG_INTERVAL = 30000 // Solo loguear errores cada 30 segundos

	// ✅ isLoadingRef ya está declarado arriba (línea 49), no se necesita declarar nuevamente

	// Función optimizada para cargar solo datos básicos inicialmente
	// Los detalles se cargarán bajo demanda o vía Socket.IO
	const loadESP32Data = async (loadFullDetails = false) => {
		// Evitar múltiples cargas simultáneas
		if (isLoadingRef.current) {
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log('⏸️ Carga ya en progreso, omitiendo...')
			}
			return
		}

		// Solo cargar si hay autenticación
		if (!isAuthenticated()) {
			setIsESP32Connected(false)
			setError('No autenticado. Por favor, inicia sesión.')
			setCruces([])
			return
		}

		isLoadingRef.current = true
		setIsLoading(true)
		setError(null)

		try {
			await checkHealth()
			setIsESP32Connected(true)

			// Obtener lista básica de cruces (sin detalles)
			const crucesResponse = await getCruces()
			const crucesLista = crucesResponse.results || crucesResponse || []
			
			// Si loadFullDetails es false, solo cargar datos básicos
			// Los detalles se obtendrán vía Socket.IO o bajo demanda
			if (!loadFullDetails) {
				// Cargar solo datos básicos de cada cruce
				const crucesBasicos = crucesLista.map(cruce => ({
					id_cruce: cruce.id,
					nombre: cruce.nombre,
					ubicacion: cruce.ubicacion,
					estado: cruce.estado || 'ACTIVO',
					coordenadas: {
						lat: cruce.coordenadas_lat || 0,
						lng: cruce.coordenadas_lng || 0,
					},
					created_at: cruce.created_at,
					updated_at: cruce.updated_at,
					bateria: 0, // Se actualizará vía Socket.IO
					sensoresActivos: 0, // Se actualizará vía Socket.IO
					alertasActivas: 0, // Se actualizará vía Socket.IO
					ultimaActividad: cruce.updated_at || cruce.created_at,
					...cruce,
				}))

				setCruces(crucesBasicos)
				setLastUpdate(new Date())
				
				if (import.meta.env.VITE_DEBUG_MODE === 'true') {
					console.log(`✅ Datos básicos cargados: ${crucesBasicos.length} cruces`)
				}
			} else {
				// Cargar detalles completos solo si se solicita explícitamente
				const crucesCompletos = await Promise.allSettled(
					crucesLista.map(async (cruce) => {
						try {
							// Obtener detalles completos del cruce
							const cruceDetalle = await getCruce(cruce.id)
							
							// Obtener telemetría más reciente del cruce
							let telemetriaReciente = null
							try {
								const telemetriaResponse = await getTelemetria({ cruce: cruce.id, page: 1 })
								const telemetriaLista = telemetriaResponse.results || telemetriaResponse || []
								telemetriaReciente = telemetriaLista.length > 0 ? telemetriaLista[0] : null
							} catch (err) {
								if (import.meta.env.VITE_DEBUG_MODE === 'true') {
									console.warn(`⚠️ No se pudo obtener telemetría del cruce ${cruce.id}:`, err)
								}
							}
							
							// Obtener alertas activas del cruce (FILTRADO EN BACKEND)
							let alertasActivas = []
							try {
								const alertasResponse = await getAlertas({ cruce: cruce.id, resolved: false, page: 1 })
								const alertasLista = alertasResponse.results || alertasResponse || []
								alertasActivas = alertasLista
							} catch (err) {
								if (import.meta.env.VITE_DEBUG_MODE === 'true') {
									console.warn(`⚠️ No se pudo obtener alertas del cruce ${cruce.id}:`, err)
								}
							}
							
							// Obtener sensores del cruce
							let sensores = []
							try {
								const sensoresResponse = await getSensores({ cruce: cruce.id })
								const sensoresLista = sensoresResponse.results || sensoresResponse || []
								sensores = sensoresLista
							} catch (err) {
								if (import.meta.env.VITE_DEBUG_MODE === 'true') {
									console.warn(`⚠️ No se pudo obtener sensores del cruce ${cruce.id}:`, err)
								}
							}
							
							// Obtener eventos de barrera recientes
							let eventosBarrera = []
							try {
								const eventosResponse = await getBarrierEvents({ cruce: cruce.id, page: 1 })
								const eventosLista = eventosResponse.results || eventosResponse || []
								eventosBarrera = eventosLista.slice(0, 5) // Últimos 5 eventos
							} catch (err) {
								if (import.meta.env.VITE_DEBUG_MODE === 'true') {
									console.warn(`⚠️ No se pudo obtener eventos de barrera del cruce ${cruce.id}:`, err)
								}
							}
						
						// Calcular batería desde telemetría o usar valor por defecto
						const batteryVoltage = telemetriaReciente?.battery_voltage || 0
						const bateriaPorcentaje = batteryVoltage > 0 
							? Math.min(100, Math.max(0, ((batteryVoltage - 10) / (14.4 - 10)) * 100))
							: 0
						
						// Contar sensores activos
						const sensoresActivos = sensores.filter(s => s.activo !== false).length
						
						// Transformar datos al formato esperado por el frontend
						return {
							// Campos básicos del cruce
							id_cruce: cruce.id,
							nombre: cruce.nombre || cruceDetalle.nombre,
							ubicacion: cruce.ubicacion || cruceDetalle.ubicacion,
							estado: cruce.estado || cruceDetalle.estado || 'ACTIVO',
							coordenadas: {
								lat: cruce.coordenadas_lat || cruceDetalle.coordenadas_lat || 0,
								lng: cruce.coordenadas_lng || cruceDetalle.coordenadas_lng || 0,
							},
							created_at: cruce.created_at || cruceDetalle.created_at,
							updated_at: cruce.updated_at || cruceDetalle.updated_at,
							
							// Datos de telemetría
							bateria: Math.round(bateriaPorcentaje),
							voltage: telemetriaReciente?.barrier_voltage || 0,
							battery_voltage: telemetriaReciente?.battery_voltage || 0,
							temperature: telemetriaReciente?.temperature || 0,
							barrier_state: telemetriaReciente?.barrier_status || null,
							signal_strength: telemetriaReciente?.signal_strength || 0,
							rssi: telemetriaReciente?.signal_strength || 0,
							sensor_1: telemetriaReciente?.sensor_1 || null,
							sensor_2: telemetriaReciente?.sensor_2 || null,
							sensor_3: telemetriaReciente?.sensor_3 || null,
							sensor_4: telemetriaReciente?.sensor_4 || null,
							ultimaActividad: telemetriaReciente?.timestamp || cruce.updated_at || cruce.created_at,
							
							// Sensores
							sensores: sensores,
							sensoresActivos: sensoresActivos,
							
							// Alertas
							alertas: alertasActivas,
							alertasActivas: alertasActivas.length,
							
							// Eventos de barrera
							eventosBarrera: eventosBarrera,
							
							// Campos adicionales calculados
							tipoTren: telemetriaReciente?.barrier_status === 'DOWN' ? 'Carga' : 'N/A',
							velocidadPromedio: 0, // Se puede calcular desde eventos si hay datos
							
							// Incluir todos los campos originales del backend
							...cruce,
							...cruceDetalle,
							telemetria: telemetriaReciente,
						}
					} catch (err) {
						if (import.meta.env.VITE_DEBUG_MODE === 'true') {
							console.warn(`⚠️ Error al obtener detalles del cruce ${cruce.id}:`, err)
						}
						// Retornar datos básicos si falla la obtención de detalles
						return {
							id_cruce: cruce.id,
							nombre: cruce.nombre,
							ubicacion: cruce.ubicacion,
							estado: cruce.estado || 'ACTIVO',
							coordenadas: {
								lat: cruce.coordenadas_lat || 0,
								lng: cruce.coordenadas_lng || 0,
							},
							bateria: 0,
							sensoresActivos: 0,
							ultimaActividad: cruce.updated_at || cruce.created_at,
							...cruce,
						}
					}
				})
			)
			
			// Filtrar solo los cruces que se cargaron exitosamente
			const crucesTransformados = crucesCompletos
				.filter(result => result.status === 'fulfilled')
				.map(result => result.value)
				.filter(cruce => cruce !== null)

				setCruces(crucesTransformados)
				setLastUpdate(new Date())
				
				if (import.meta.env.VITE_DEBUG_MODE === 'true') {
					console.log(`✅ Datos completos cargados: ${crucesTransformados.length} cruces`)
				}
			}
		} catch (err) {
			setIsESP32Connected(false)
			setError('No se pudo conectar con el backend. Usando datos de respaldo.')
			setCruces(crucesBackupNormalizados)
			
			// Rate limiting: solo loguear errores cada 30 segundos
			const now = Date.now()
			if (now - lastErrorLogTime.current > ERROR_LOG_INTERVAL) {
				const debugMode = import.meta.env.VITE_DEBUG_MODE === 'true'
				if (debugMode) {
					console.warn('⚠️ No se pudo conectar con el backend. Usando datos de respaldo.', err)
				}
				lastErrorLogTime.current = now
			}
		} finally {
			setIsLoading(false)
			isLoadingRef.current = false
		}
	}

	// Efecto para cargar datos iniciales y conectar Socket.IO
	useEffect(() => {
		if (user && isAuthenticated()) {
			// Cargar solo datos básicos inicialmente (sin detalles completos)
			// Los detalles se cargarán vía Socket.IO o bajo demanda
			loadESP32Data(false)

			// Cargar usuarios y logs del sistema
			loadUsuarios()
			loadLogs()

			// Conectar Socket.IO
			const token = getAccessToken()
			if (token) {
				connectSocket(token)
			}

			// Cleanup: desconectar Socket.IO al desmontar o cambiar de usuario
			return () => {
				disconnectSocket()
			}
		} else {
			// Si no hay usuario, desconectar Socket.IO y limpiar datos
			disconnectSocket()
			setUsuarios([])
			setLogs([])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user])
	
	// ✅ NUEVO: Sincronizar crucesRef con cruces
	useEffect(() => {
		crucesRef.current = cruces
	}, [cruces])
	
	// ✅ CORRECCIÓN CRÍTICA: Suscribirse SOLO cuando cambia el conjunto de IDs (no en cada actualización)
	useEffect(() => {
		if (!user || !isAuthenticated()) {
			return
		}
		
		const socket = getSocket()
		if (!socket || !socket.connected || !cruces || cruces.length === 0) {
			return
		}
		
		// Calcular string de IDs actual
		const currentCruceIdsString = cruces.map(c => String(c.id || c.id_cruce)).sort().join(',')
		
		// Comparar con el anterior (solo IDs, no datos completos)
		if (currentCruceIdsString === previousCruceIdsStringRef.current) {
			// No hay cambios en el conjunto de IDs, solo actualizaciones individuales
			// No re-suscribirse para evitar rate limiting
			return
		}
		
		// El conjunto de IDs cambió: actualizar suscripciones
		const currentCruceIds = new Set(cruces.map(cruce => cruce.id || cruce.id_cruce))
		const cruceRooms = Array.from(currentCruceIds).map(id => `cruce_${id}`)
		
		// Suscribirse solo a las nuevas salas
		const nuevasSalas = cruceRooms.filter(room => !subscribedRoomsRef.current.has(room))
		
		if (nuevasSalas.length > 0) {
			console.log('📡 [DataContext] Nuevos cruces detectados, suscribiéndose a:', nuevasSalas)
			socketEvents.subscribe(nuevasSalas)
			
			// También hacer join_room para cada nueva sala
			nuevasSalas.forEach(room => {
				socket.emit('join_room', { room })
				subscribedRoomsRef.current.add(room)
			})
		}
		
		// Limpiar salas de cruces que ya no existen
		const salasRemovidas = Array.from(subscribedRoomsRef.current).filter(room => 
			!cruceRooms.includes(room)
		)
		if (salasRemovidas.length > 0) {
			console.log('🧹 [DataContext] Cruces removidos, limpiando suscripciones:', salasRemovidas)
			salasRemovidas.forEach(room => {
				socket.emit('leave_room', { room })
				subscribedRoomsRef.current.delete(room)
			})
		}
		
		// Actualizar referencias
		subscribedRoomsRef.current = new Set(cruceRooms)
		previousCruceIdsStringRef.current = currentCruceIdsString
	}, [cruces, user]) // ✅ Re-ejecutar cuando cruces cambia, pero dentro verificamos si los IDs cambiaron

	// Efecto para escuchar eventos de Socket.IO y actualizar estado en tiempo real
	useEffect(() => {
		if (!user || !isAuthenticated()) {
			return
		}

		// ✅ CORRECCIÓN CRÍTICA: Handler usa crucesRef para tener siempre la lista actualizada
		const handleConnected = (data) => {
			console.log('✅ [DataContext] Usuario autenticado en Socket.IO:', data.user)
			
			// Suscribirse a eventos generales
			const generalEvents = ['telemetria', 'barrier_events', 'alertas']
			console.log('📡 [DataContext] Suscribiéndose a eventos generales:', generalEvents)
			socketEvents.subscribe(generalEvents)
			
			// ✅ USAR crucesRef (no cruces) para evitar cierre sobre valor obsoleto
			if (crucesRef.current && crucesRef.current.length > 0) {
				const socket = getSocket()
				const cruceRooms = crucesRef.current.map(cruce => `cruce_${cruce.id || cruce.id_cruce}`)
				console.log('📡 [DataContext] Re-suscribiéndose tras reconexión a cruces:', cruceRooms)
				socketEvents.subscribe(cruceRooms)
				
				// También hacer join_room para cada cruce
				cruceRooms.forEach(room => {
					socket.emit('join_room', { room })
				})
			}
		}
		
		// Handler para confirmación de suscripción
		const handleSubscribed = (data) => {
			console.log('✅ [DataContext] Suscripción confirmada:', data)
		}
		
		// Handler para confirmación de unión a sala
		const handleJoinedRoom = (data) => {
			console.log('✅ [DataContext] Unido a sala:', data)
		}

		// Handler para notificaciones generales
		const handleNotification = (notificationData) => {
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log('🔔 Notificación:', notificationData)
			}
			// Aquí puedes agregar lógica para mostrar notificaciones al usuario
			// Por ejemplo, usando react-hot-toast o un sistema de notificaciones
		}

		// Handler para actualizaciones del dashboard
		const handleDashboardUpdate = (data) => {
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log('📊 Dashboard actualizado:', data)
			}
			// NO recargar todos los datos - Socket.IO ya actualiza los cambios individuales
			// Solo actualizar estadísticas si es necesario
			setLastUpdate(new Date())
		}

		// ⚠️ NOTA: Handlers comentados porque el backend NO emite estos eventos
		/*
		// Handler para cuando se crea un nuevo cruce (NO IMPLEMENTADO EN BACKEND)
		const handleCruceCreated = (cruceData) => {
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log('🆕 Nuevo cruce creado:', cruceData)
			}
			const cruceTransformado = transformCruceData(cruceData)
			setCruces(prev => [...prev, cruceTransformado])
			setLastUpdate(new Date())
		}

		// Handler para cuando se actualiza un cruce (NO IMPLEMENTADO EN BACKEND)
		const handleCruceUpdated = (cruceData) => {
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log('🔄 Cruce actualizado (cruce_updated):', cruceData)
			}
			const cruceTransformado = transformCruceData(cruceData)
			setCruces(prev => prev.map(c => 
				c.id_cruce === cruceTransformado.id_cruce ? cruceTransformado : c
			))
			setLastUpdate(new Date())
		}
		*/
		
		// ✅ Handler para evento 'cruce_update' (emitido a salas específicas: cruce_21, cruce_22, etc.)
		// Este es el evento principal que emite el backend cuando se actualiza un cruce
		const handleCruceUpdate = (cruceData) => {
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log('🔄 [DataContext] Evento cruce_update recibido:', cruceData)
			}
			// Transformar y actualizar el cruce existente
			const cruceTransformado = transformCruceData(cruceData)
			setCruces(prev => prev.map(c => 
				c.id_cruce === cruceTransformado.id_cruce ? cruceTransformado : c
			))
			setLastUpdate(new Date())
		}

		// ⚠️ NOTA: Los siguientes handlers están comentados porque el backend NO emite estos eventos
		// El backend solo emite: cruce_update, new_telemetria, barrier_event, new_alerta, alerta_resolved
		
		/*
		// Handler para cuando se elimina un cruce (NO IMPLEMENTADO EN BACKEND)
		const handleCruceDeleted = (data) => {
			const cruceId = data.id || data.cruce_id || data.id_cruce
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log('🗑️ Cruce eliminado:', cruceId)
			}
			setCruces(prev => prev.filter(c => c.id_cruce !== cruceId))
			setLastUpdate(new Date())
		}

		// Handler para actualización de lista completa (NO IMPLEMENTADO EN BACKEND)
		const handleCrucesListUpdated = async () => {
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log('📋 Lista de cruces actualizada')
			}
			await loadESP32Data(false)
		}
		*/

		// Handler para actualización de telemetría
		const handleTelemetriaUpdated = (telemetriaData) => {
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log('📊 Telemetría actualizada:', telemetriaData)
			}
			const cruceId = telemetriaData.cruce || telemetriaData.id_cruce
			if (!cruceId) return

			// Actualizar telemetría del cruce correspondiente
			setCruces(prev => prev.map(cruce => {
				if (cruce.id_cruce === cruceId) {
					const batteryVoltage = telemetriaData.battery_voltage || 0
					const bateriaPorcentaje = batteryVoltage > 0 
						? Math.min(100, Math.max(0, ((batteryVoltage - 10) / (14.4 - 10)) * 100))
						: cruce.bateria

					return {
						...cruce,
						bateria: Math.round(bateriaPorcentaje),
						voltage: telemetriaData.barrier_voltage || cruce.voltage,
						battery_voltage: telemetriaData.battery_voltage || cruce.battery_voltage,
						temperature: telemetriaData.temperature || cruce.temperature,
						barrier_state: telemetriaData.barrier_status || cruce.barrier_state,
						signal_strength: telemetriaData.signal_strength || cruce.signal_strength,
						rssi: telemetriaData.signal_strength || cruce.rssi,
						sensor_1: telemetriaData.sensor_1 !== undefined ? telemetriaData.sensor_1 : cruce.sensor_1,
						sensor_2: telemetriaData.sensor_2 !== undefined ? telemetriaData.sensor_2 : cruce.sensor_2,
						sensor_3: telemetriaData.sensor_3 !== undefined ? telemetriaData.sensor_3 : cruce.sensor_3,
						sensor_4: telemetriaData.sensor_4 !== undefined ? telemetriaData.sensor_4 : cruce.sensor_4,
						ultimaActividad: telemetriaData.timestamp || new Date().toISOString(),
						telemetria: telemetriaData,
					}
				}
				return cruce
			}))
			setLastUpdate(new Date())
		}

		/*
		// Handler para actualización de sensores (NO IMPLEMENTADO EN BACKEND)
		const handleSensoresUpdated = (data) => {
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log('🔌 Sensores actualizados:', data)
			}
			const cruceId = data.cruce || data.id_cruce
			if (!cruceId) return

			const sensores = Array.isArray(data.sensores) ? data.sensores : [data]
			const sensoresActivos = sensores.filter(s => s.activo !== false).length

			setCruces(prev => prev.map(cruce => {
				if (cruce.id_cruce === cruceId) {
					return {
						...cruce,
						sensores: sensores,
						sensoresActivos: sensoresActivos,
					}
				}
				return cruce
			}))
			setLastUpdate(new Date())
		}
		*/

		// Handler para nuevas alertas
		const handleNewAlerta = (alertaData) => {
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log('⚠️ Nueva alerta:', alertaData)
			}
			const cruceId = alertaData.cruce || alertaData.id_cruce
			if (!cruceId) return

			setCruces(prev => prev.map(cruce => {
				if (cruce.id_cruce === cruceId) {
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
				}
				return cruce
			}))
			setLastUpdate(new Date())
		}

		// Handler para alertas resueltas
		const handleAlertaResolved = (alertaData) => {
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log('✅ Alerta resuelta:', alertaData)
			}
			const cruceId = alertaData.cruce || alertaData.id_cruce
			if (!cruceId) return

			setCruces(prev => prev.map(cruce => {
				if (cruce.id_cruce === cruceId) {
					const alertasActualizadas = (cruce.alertas || []).map(alerta => 
						alerta.id === alertaData.id ? { ...alerta, resolved: true } : alerta
					)
					return {
						...cruce,
						alertas: alertasActualizadas,
						alertasActivas: Math.max(0, (cruce.alertasActivas || 0) - 1),
					}
				}
				return cruce
			}))
			setLastUpdate(new Date())
		}

		// Registrar todos los listeners (SOLO eventos implementados en backend)
		socketEvents.onConnected(handleConnected)
		socketEvents.onSubscribed(handleSubscribed)
		socketEvents.onJoinedRoom(handleJoinedRoom)
		socketEvents.onNotification(handleNotification)
		socketEvents.onDashboardUpdate(handleDashboardUpdate)
		
		// ⚠️ Eventos comentados porque NO están implementados en el backend:
		// socketEvents.onCruceCreated(handleCruceCreated)
		// socketEvents.onCruceUpdated(handleCruceUpdated)
		// socketEvents.onCruceDeleted(handleCruceDeleted)
		// socketEvents.onCrucesListUpdated(handleCrucesListUpdated)
		// socketEvents.onSensoresUpdated(handleSensoresUpdated)
		
		// ✅ CRÍTICO: Listener para 'cruce_update' (evento principal emitido a salas específicas)
		socketEvents.onCruceUpdate(handleCruceUpdate)
		socketEvents.onNewTelemetria(handleTelemetriaUpdated)
		socketEvents.onNewAlerta(handleNewAlerta)
		socketEvents.onAlertaResolved(handleAlertaResolved)
		
		// Handler para eventos de barrera (guardado en variable para cleanup)
		const handleBarrierEvent = (barrierData) => {
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log('🚧 Evento de barrera:', barrierData)
			}
			// Actualizar estado de barrera en el cruce correspondiente
			const cruceId = barrierData.cruce || barrierData.id_cruce
			if (cruceId) {
				setCruces(prev => prev.map(cruce => {
					if (cruce.id_cruce === cruceId) {
						return {
							...cruce,
							barrier_state: barrierData.barrier_status || barrierData.event_type,
							ultimaActividad: barrierData.timestamp || new Date().toISOString(),
						}
					}
					return cruce
				}))
				setLastUpdate(new Date())
			}
		}
		
		socketEvents.onBarrierEvent(handleBarrierEvent)

		// Cleanup: remover todos los listeners
		// IMPORTANTE: Según documentación Socket.IO, debemos remover listeners para evitar memory leaks
		// NOTA: Como los handlers usan wrappers internos, usamos removeAllListeners() para cada evento
		return () => {
			const socket = getSocket()
			if (socket) {
				// Remover todos los listeners de cada evento específico
				// Esto es más seguro que intentar hacer match de callbacks con wrappers
				socketEvents.removeAllListeners('connected')
				socketEvents.removeAllListeners('subscribed')
				socketEvents.removeAllListeners('joined_room')
				socketEvents.removeAllListeners('notification')
				socketEvents.removeAllListeners('dashboard_update')
				socketEvents.removeAllListeners('cruce_created')
				socketEvents.removeAllListeners('cruce_updated')
				socketEvents.removeAllListeners('cruce_update')  // ✅ Agregar cleanup para cruce_update
				socketEvents.removeAllListeners('cruce_deleted')
				socketEvents.removeAllListeners('cruces_list_updated')
				socketEvents.removeAllListeners('new_telemetria')
				socketEvents.removeAllListeners('sensores_updated')
				socketEvents.removeAllListeners('new_alerta')
				socketEvents.removeAllListeners('alerta_resolved')
				socketEvents.removeAllListeners('barrier_event')
			}
		}
	}, [user])

	// Función helper para transformar datos de cruce desde el backend
	const transformCruceData = (cruceData) => {
		// Si ya está transformado, retornarlo
		if (cruceData.id_cruce) {
			return cruceData
		}

		// Transformar desde formato del backend
		const telemetria = cruceData.telemetria || cruceData.ultima_telemetria
		const batteryVoltage = telemetria?.battery_voltage || 0
		const bateriaPorcentaje = batteryVoltage > 0 
			? Math.min(100, Math.max(0, ((batteryVoltage - 10) / (14.4 - 10)) * 100))
			: 0

		const sensores = cruceData.sensores || []
		const sensoresActivos = sensores.filter(s => s.activo !== false).length

		return {
			id_cruce: cruceData.id || cruceData.id_cruce,
			nombre: cruceData.nombre,
			ubicacion: cruceData.ubicacion,
			estado: cruceData.estado || 'ACTIVO',
			coordenadas: {
				lat: cruceData.coordenadas_lat || 0,
				lng: cruceData.coordenadas_lng || 0,
			},
			bateria: Math.round(bateriaPorcentaje),
			voltage: telemetria?.barrier_voltage || 0,
			battery_voltage: telemetria?.battery_voltage || 0,
			temperature: telemetria?.temperature || 0,
			barrier_state: telemetria?.barrier_status || null,
			signal_strength: telemetria?.signal_strength || 0,
			rssi: telemetria?.signal_strength || 0,
			sensor_1: telemetria?.sensor_1 || null,
			sensor_2: telemetria?.sensor_2 || null,
			sensor_3: telemetria?.sensor_3 || null,
			sensor_4: telemetria?.sensor_4 || null,
			ultimaActividad: telemetria?.timestamp || cruceData.updated_at || cruceData.created_at,
			sensores: sensores,
			sensoresActivos: sensoresActivos,
			alertas: cruceData.alertas || [],
			alertasActivas: (cruceData.alertas || []).filter(a => !a.resolved).length,
			...cruceData,
			telemetria: telemetria,
		}
	}

	// Funciones CRUD para cruces
	// Nota: No recargamos datos manualmente, Socket.IO se encargará de actualizar el estado
	const agregarCruce = async (nuevoCruce) => {
		try {
			const cruceCreado = await createCruce({
				nombre: nuevoCruce.nombre,
				ubicacion: nuevoCruce.ubicacion,
				coordenadas_lat: nuevoCruce.coordenadas?.lat,
				coordenadas_lng: nuevoCruce.coordenadas?.lng,
				estado: nuevoCruce.estado || 'ACTIVO',
				responsable_nombre: nuevoCruce.responsable_nombre,
				responsable_telefono: nuevoCruce.responsable_telefono,
				responsable_email: nuevoCruce.responsable_email,
				responsable_empresa: nuevoCruce.responsable_empresa,
				responsable_horario: nuevoCruce.responsable_horario,
			})
			
			// Socket.IO emitirá 'cruce_created' y actualizará el estado automáticamente
			// Solo agregamos el log, no recargamos datos
			agregarLog()
			return cruceCreado
		} catch (error) {
			agregarLog()
			throw error
		}
	}

	const actualizarCruce = async (id, datosActualizados) => {
		try {
			const cruceActualizado = await updateCruce(id, {
				nombre: datosActualizados.nombre,
				ubicacion: datosActualizados.ubicacion,
				coordenadas_lat: datosActualizados.coordenadas?.lat,
				coordenadas_lng: datosActualizados.coordenadas?.lng,
				estado: datosActualizados.estado,
				responsable_nombre: datosActualizados.responsable_nombre,
				responsable_telefono: datosActualizados.responsable_telefono,
				responsable_email: datosActualizados.responsable_email,
				responsable_empresa: datosActualizados.responsable_empresa,
				responsable_horario: datosActualizados.responsable_horario,
			})
			
			// Socket.IO emitirá 'cruce_updated' y actualizará el estado automáticamente
			// Solo agregamos el log, no recargamos datos
			agregarLog()
			return cruceActualizado
		} catch (error) {
			agregarLog()
			throw error
		}
	}

	const eliminarCruce = async (id) => {
		try {
			await deleteCruce(id)
			
			// Socket.IO emitirá 'cruce_deleted' y actualizará el estado automáticamente
			// Solo agregamos el log, no recargamos datos
			agregarLog()
		} catch (error) {
			agregarLog()
			throw error
		}
	}

	// Función para cargar usuarios del backend
	const loadUsuarios = async () => {
		if (!isAuthenticated()) return
		
		// Prevenir llamadas concurrentes
		if (isLoadingUsuariosRef.current) {
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log('⏸️ Carga de usuarios ya en progreso, omitiendo...')
			}
			return
		}
		
		isLoadingUsuariosRef.current = true
		setIsLoadingUsuarios(true)
		setUsuariosError(null)
		
		try {
			const response = await usuariosAPI.getAll()
			const usuariosList = response.results || response || []
			
			// Normalizar datos de usuarios según el modelo del backend
			const usuariosNormalizados = usuariosList.map(usuario => ({
				id: usuario.id,
				nombre: usuario.full_name || `${usuario.first_name || ''} ${usuario.last_name || ''}`.trim() || usuario.username || 'Sin nombre',
				email: usuario.email || '',
				username: usuario.username || '',
				first_name: usuario.first_name || '',
				last_name: usuario.last_name || '',
				rol: usuario.profile?.role || usuario.rol || usuario.role || 'OBSERVER',
				estado: usuario.profile?.is_active !== undefined 
					? (usuario.profile.is_active ? 'ACTIVO' : 'INACTIVO')
					: (usuario.is_active !== undefined ? (usuario.is_active ? 'ACTIVO' : 'INACTIVO') : 'ACTIVO'),
				ultimoAcceso: usuario.profile?.last_login || usuario.last_login || usuario.date_joined || 'N/A',
				permisos: usuario.profile?.permissions || usuario.permisos || usuario.permissions || ['READ'],
				date_joined: usuario.date_joined,
				profile: usuario.profile,
				...usuario
			}))
			
			setUsuarios(usuariosNormalizados)
			
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log(`✅ Usuarios cargados: ${usuariosNormalizados.length}`)
			}
		} catch (error) {
			console.error('Error al cargar usuarios:', error)
			setUsuariosError(error.message || 'Error al cargar usuarios')
			toast.error('Error al cargar usuarios del sistema')
			// Mantener array vacío en caso de error
			setUsuarios([])
		} finally {
			setIsLoadingUsuarios(false)
			isLoadingUsuariosRef.current = false
		}
	}

	// Funciones CRUD para usuarios (conectadas al backend)
	const agregarUsuario = async (nuevoUsuario) => {
		try {
			setIsLoadingUsuarios(true)
			
			// Preparar datos para el backend según el modelo User
			const datosUsuario = {
				username: nuevoUsuario.username || nuevoUsuario.email?.split('@')[0] || `user_${Date.now()}`,
				email: nuevoUsuario.email,
				first_name: nuevoUsuario.first_name || nuevoUsuario.nombre?.split(' ')[0] || '',
				last_name: nuevoUsuario.last_name || nuevoUsuario.nombre?.split(' ').slice(1).join(' ') || '',
				password: nuevoUsuario.password || 'TempPassword123!', // El backend requiere password
				profile: {
					role: nuevoUsuario.rol || 'OBSERVER',
					is_active: nuevoUsuario.estado === 'ACTIVO' || nuevoUsuario.estado === true
				},
				...nuevoUsuario
			}
			
			const usuarioCreado = await usuariosAPI.create(datosUsuario)
			
			// Recargar lista de usuarios
			await loadUsuarios()
			
			toast.success(`Usuario ${nuevoUsuario.email} creado exitosamente`)
			
			// El log se creará automáticamente en el backend
			return usuarioCreado
		} catch (error) {
			console.error('Error al crear usuario:', error)
			const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Error al crear usuario'
			toast.error(errorMsg)
			throw error
		} finally {
			setIsLoadingUsuarios(false)
		}
	}

	const actualizarUsuario = async (id, datosActualizados) => {
		try {
			setIsLoadingUsuarios(true)
			
			// Preparar datos para el backend según el modelo User
			const datosUpdate = {
				email: datosActualizados.email,
				first_name: datosActualizados.first_name || datosActualizados.nombre?.split(' ')[0] || '',
				last_name: datosActualizados.last_name || datosActualizados.nombre?.split(' ').slice(1).join(' ') || '',
				profile: {
					role: datosActualizados.rol || datosActualizados.profile?.role,
					is_active: datosActualizados.estado === 'ACTIVO' || datosActualizados.estado === true || datosActualizados.profile?.is_active
				},
				...datosActualizados
			}
			
			await usuariosAPI.update(id, datosUpdate)
			
			// Recargar lista de usuarios
			await loadUsuarios()
			
			toast.success('Usuario actualizado exitosamente')
			
			// El log se creará automáticamente en el backend
		} catch (error) {
			console.error('Error al actualizar usuario:', error)
			const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Error al actualizar usuario'
			toast.error(errorMsg)
			throw error
		} finally {
			setIsLoadingUsuarios(false)
		}
	}

	const desactivarUsuario = async (id) => {
		try {
			setIsLoadingUsuarios(true)
			
		const usuario = usuarios.find(u => u.id === id)
			
			await usuariosAPI.delete(id)
			
			// Recargar lista de usuarios
			await loadUsuarios()
			
			toast.success(`Usuario ${usuario?.email || id} desactivado`)
			
			// El log se creará automáticamente en el backend
		} catch (error) {
			console.error('Error al desactivar usuario:', error)
			const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Error al desactivar usuario'
			toast.error(errorMsg)
			throw error
		} finally {
			setIsLoadingUsuarios(false)
		}
	}

	const activarUsuario = async (id) => {
		try {
			setIsLoadingUsuarios(true)
			const usuario = usuarios.find(u => u.id === id)

			await usuariosAPI.activate(id)

			await loadUsuarios()

			toast.success(`Usuario ${usuario?.email || id} activado`)
		} catch (error) {
			console.error('Error al activar usuario:', error)
			const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Error al activar usuario'
			toast.error(errorMsg)
			throw error
		} finally {
			setIsLoadingUsuarios(false)
		}
	}

	const eliminarUsuario = desactivarUsuario

	// Función para cargar logs del backend
	const loadLogs = useCallback(async (params = {}) => {
		if (!isAuthenticated()) return
		
		// Prevenir llamadas concurrentes
		if (isLoadingLogsRef.current) {
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log('⏸️ Carga de logs ya en progreso, omitiendo...')
			}
			return
		}
		
		isLoadingLogsRef.current = true
		setIsLoadingLogs(true)
		setLogsError(null)
		
		try {
			const response = await logsAPI.getAll({
				page_size: params.page_size || 100, // Cargar últimos 100 logs por defecto
				ordering: '-fecha', // Más recientes primero
				...params
			})
			
			const logsList = response.results || response || []
			
			// Normalizar datos de logs
			const logsNormalizados = logsList.map(log => ({
				id: log.id || log.id_log,
				fecha: log.fecha || log.timestamp || log.created_at || new Date().toISOString(),
				usuario: log.usuario || log.user || log.usuario_nombre || 'Sistema',
				accion: log.accion || log.action || log.tipo || 'UNKNOWN',
				detalle: log.detalle || log.detail || log.mensaje || log.message || '',
				ip: log.ip || log.ip_address || log.ipAddress || 'N/A',
				...log
			}))
			
			setLogs(logsNormalizados)
			
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log(`✅ Logs cargados: ${logsNormalizados.length}`)
			}
		} catch (error) {
			console.error('Error al cargar logs:', error)
			setLogsError(error.message || 'Error al cargar logs')
			// No mostrar toast para logs ya que puede ser molesto
			// Mantener array vacío en caso de error
			setLogs([])
		} finally {
			setIsLoadingLogs(false)
			isLoadingLogsRef.current = false
		}
	}, []) // Array vacío porque no depende de ningún estado que cambie

	// Función para agregar logs (ahora solo para logs locales, el backend los crea automáticamente)
	const agregarLog = () => {
		// Los logs se crean automáticamente en el backend
		// Esta función solo actualiza la lista local si es necesario
		// Recargar logs después de un tiempo para ver el nuevo log
		setTimeout(() => {
			loadLogs()
		}, 1000)
	}

	// Función de login con persistencia
	const login = async (email, password) => {
		try {
			const response = await apiLogin(email, password)
			setUser(response.user)
			
			const isAdminUser = response.user?.profile?.role === 'ADMIN' || response.user?.profile?.role === 'MAINTENANCE'
			setIsAdmin(isAdminUser)
			
			agregarLog()
			
			// Socket.IO se conectará automáticamente y cargará los datos iniciales
			// No necesitamos llamar a loadESP32Data() aquí, el useEffect lo hará
			
			return true
		} catch (error) {
			agregarLog()
			throw error
		}
	}

	const logout = async () => {
		try {
			await apiLogout()
		} catch (error) {
			console.warn('Error al cerrar sesión en el servidor:', error)
		} finally {
			agregarLog()
			setUser(null)
			setIsAdmin(false)
			setCruces([])
		}
	}

	// Calcular estadísticas
	const stats = {
		totalCruces: cruces.length,
		activos: cruces.filter(c => c.estado === 'ACTIVO').length,
		mantenimiento: cruces.filter(c => c.estado === 'MANTENIMIENTO').length,
		inactivos: cruces.filter(c => c.estado === 'INACTIVO').length,
		alertasBateria: cruces.filter(c => c.bateria < configuracion.umbral_bateria_baja).length,
		totalUsuarios: usuarios.length,
		usuariosActivos: usuarios.filter(u => u.estado === 'ACTIVO').length,
		promedioBateria: Math.round(cruces.reduce((acc, c) => acc + c.bateria, 0) / cruces.length) || 0,
		sensoresTotal: cruces.reduce((acc, c) => acc + c.sensoresActivos, 0)
	}

	const value = {
		cruces,
		usuarios,
		logs,
		configuracion,
		user,
		isAdmin,
		stats,
		isLoading,
		isLoadingUsuarios,
		isLoadingLogs,
		isESP32Connected,
		lastUpdate,
		error,
		usuariosError,
		logsError,
		agregarCruce,
		actualizarCruce,
		eliminarCruce,
		agregarUsuario,
		actualizarUsuario,
		desactivarUsuario,
		activarUsuario,
		eliminarUsuario,
		loadUsuarios,
		loadLogs,
		setConfiguracion,
		login,
		logout,
		agregarLog,
		loadESP32Data
	}

	return (
		<DataContext.Provider value={value}>
			{children}
		</DataContext.Provider>
	)
}
