import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../hooks/useData'
import { useMetaTags } from '../hooks/useMetaTags'
import { getSocket, socketEvents } from '../services/socket'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import ResponsableInfo from './contacto/ResponsableInfo'
import { useSensores } from '../hooks/useSensores'
import { combineSensoresWithTelemetria, getSensorStatusColor, normalizeCruceData } from '../utils/telemetriaHelpers'
import { getBarrierEvents } from '../services/barrierEvents'
import { getHistorialMantenimiento } from '../services/mantenimiento'

// Configurar icono personalizado para el marcador
const createCustomIcon = (estado) => {
	const colors = {
		ACTIVO: '#22c55e',
		MANTENIMIENTO: '#eab308',
		INACTIVO: '#ef4444'
	}
	
	return L.divIcon({
		html: `
			<div style="
				background-color: ${colors[estado]};
				border: 3px solid white;
				border-radius: 50%;
				width: 24px;
				height: 24px;
				box-shadow: 0 3px 6px rgba(0,0,0,0.4);
			"></div>
		`,
		className: 'custom-marker',
		iconSize: [24, 24],
		iconAnchor: [12, 12]
	})
}

// Datos históricos de ejemplo
const datosHistoricos = {
	1: {
		historicoTrafico: [
			{ fecha: '2024-01-15', trenes: 12, velocidadMax: 75 },
			{ fecha: '2024-01-14', trenes: 8, velocidadMax: 70 },
			{ fecha: '2024-01-13', trenes: 15, velocidadMax: 80 },
			{ fecha: '2024-01-12', trenes: 10, velocidadMax: 65 },
			{ fecha: '2024-01-11', trenes: 14, velocidadMax: 72 }
		],
		proximoMantenimiento: '2024-02-10',
		sensores: [
			{ id: 1, tipo: 'Proximidad', estado: 'ACTIVO', ubicacion: 'Norte' },
			{ id: 2, tipo: 'Velocidad', estado: 'ACTIVO', ubicacion: 'Centro' },
			{ id: 3, tipo: 'Peso', estado: 'ACTIVO', ubicacion: 'Sur' },
			{ id: 4, tipo: 'Barrera', estado: 'ACTIVO', ubicacion: 'Cruce' }
		],
		configuracion: {
			tiempoAlerta: 30,
			velocidadMaxima: 80,
			tiempoBarrera: 15,
			modoOperacion: 'Automático'
		}
	},
	2: {
		historicoTrafico: [
			{ fecha: '2024-01-14', trenes: 6, velocidadMax: 50 },
			{ fecha: '2024-01-13', trenes: 4, velocidadMax: 45 },
			{ fecha: '2024-01-12', trenes: 8, velocidadMax: 55 },
			{ fecha: '2024-01-11', trenes: 7, velocidadMax: 48 },
			{ fecha: '2024-01-10', trenes: 9, velocidadMax: 52 }
		],
		proximoMantenimiento: '2024-01-20',
		sensores: [
			{ id: 1, tipo: 'Proximidad', estado: 'ACTIVO', ubicacion: 'Norte' },
			{ id: 2, tipo: 'Velocidad', estado: 'MANTENIMIENTO', ubicacion: 'Centro' },
			{ id: 3, tipo: 'Peso', estado: 'MANTENIMIENTO', ubicacion: 'Sur' },
			{ id: 4, tipo: 'Barrera', estado: 'ACTIVO', ubicacion: 'Cruce' }
		],
		configuracion: {
			tiempoAlerta: 25,
			velocidadMaxima: 60,
			tiempoBarrera: 12,
			modoOperacion: 'Manual'
		}
	}
}

export function CruceDetail() {
	const { id } = useParams()
	const navigate = useNavigate()
	const { cruces } = useData()
	const [cruce, setCruce] = useState(null)
	const [activeTab, setActiveTab] = useState('general')
	const socket = getSocket()
	
	// ✅ Cargar sensores del cruce
	const cruceId = id ? parseInt(id) : null
	const { sensores: sensoresData, loading: sensoresLoading, stats: sensoresStats } = useSensores(cruceId)
	
	// ✅ Cargar eventos de tráfico (eventos de barrera)
	const [eventosTrafico, setEventosTrafico] = useState([])
	const [loadingTrafico, setLoadingTrafico] = useState(false)
	const [estadisticasTrafico, setEstadisticasTrafico] = useState({
		total: 0,
		hoy: 0,
		estaSemana: 0
	})
	
	// ✅ Cargar datos de mantenimiento
	const [datosMantenimiento, setDatosMantenimiento] = useState({
		ultimoMantenimiento: null,
		proximoMantenimiento: null,
		loading: false
	})
	
	// Debug: verificar que el cruceId se está pasando correctamente
	useEffect(() => {
		if (cruceId) {
			console.log('🔍 [CruceDetail] Cargando sensores para cruce:', cruceId)
		}
	}, [cruceId])
	
	// Calcular total de sensores y activos basado en datos reales
	const totalSensores = sensoresStats?.total || cruce?.totalSensores || cruce?.sensores?.length || sensoresData?.length || 0
	const sensoresActivosCount = sensoresStats?.activos || cruce?.sensoresActivos || 0
	
	// Cargar datos de mantenimiento cuando cambie el cruce
	useEffect(() => {
		if (!cruceId) return
		
		const cargarDatosMantenimiento = async () => {
			setDatosMantenimiento(prev => ({ ...prev, loading: true }))
			try {
				// Cargar historial de mantenimientos del cruce
				const mantenimientosResponse = await getHistorialMantenimiento({
					cruce: cruceId,
					page: 1,
					page_size: 100
				})
				
				const mantenimientos = mantenimientosResponse.results || mantenimientosResponse || []
				
				// Obtener último mantenimiento completado
				const ultimoCompletado = mantenimientos
					.filter(m => m.estado === 'COMPLETADO' && m.fecha_fin)
					.sort((a, b) => new Date(b.fecha_fin) - new Date(a.fecha_fin))[0]
				
				// Obtener próximo mantenimiento programado (pendiente o en proceso)
				const proximoProgramado = mantenimientos
					.filter(m => (m.estado === 'PENDIENTE' || m.estado === 'EN_PROCESO') && m.fecha_programada)
					.sort((a, b) => new Date(a.fecha_programada) - new Date(b.fecha_programada))[0]
				
				setDatosMantenimiento({
					ultimoMantenimiento: ultimoCompletado?.fecha_fin || ultimoCompletado?.fecha_programada || null,
					proximoMantenimiento: proximoProgramado?.fecha_programada || null,
					loading: false
				})
			} catch (error) {
				console.error('Error al cargar datos de mantenimiento:', error)
				setDatosMantenimiento(prev => ({ ...prev, loading: false }))
			}
		}
		
		cargarDatosMantenimiento()
	}, [cruceId])
	
	// Cargar eventos de tráfico cuando se active la pestaña o cambie el cruce
	useEffect(() => {
		if (!cruceId || activeTab !== 'trafico') return
		
		const cargarEventosTrafico = async () => {
			setLoadingTrafico(true)
			try {
				// Cargar eventos de barrera recientes (últimos 30 días)
				const eventosResponse = await getBarrierEvents({
					cruce: cruceId,
					page: 1,
					page_size: 50
				})
				
				const eventos = eventosResponse.results || eventosResponse || []
				setEventosTrafico(eventos)
				
				// Calcular estadísticas
				const ahora = new Date()
				const inicioDia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
				const inicioSemana = new Date(ahora)
				inicioSemana.setDate(ahora.getDate() - ahora.getDay())
				inicioSemana.setHours(0, 0, 0, 0)
				
				const eventosHoy = eventos.filter(e => {
					const fechaEvento = new Date(e.event_time || e.timestamp)
					return fechaEvento >= inicioDia
				})
				
				const eventosSemana = eventos.filter(e => {
					const fechaEvento = new Date(e.event_time || e.timestamp)
					return fechaEvento >= inicioSemana
				})
				
				setEstadisticasTrafico({
					total: eventos.length,
					hoy: eventosHoy.length,
					estaSemana: eventosSemana.length
				})
			} catch (error) {
				console.error('Error al cargar eventos de tráfico:', error)
			} finally {
				setLoadingTrafico(false)
			}
		}
		
		cargarEventosTrafico()
	}, [cruceId, activeTab])

	// Cargar datos iniciales del cruce y datos de mantenimiento
	useEffect(() => {
		const cargarDatosCruce = async () => {
			const cruceData = cruces.find(c => c.id_cruce === parseInt(id))
			if (cruceData) {
				try {
					// Cargar datos completos del cruce desde el backend
					const { getCruce } = await import('../services/cruces')
					const cruceCompleto = await getCruce(parseInt(id))
					
					// Extraer datos de mantenimiento del backend
					// El backend puede enviar estos datos en el endpoint de cruce
					const fechaInstalacion = cruceCompleto.created_at || cruceData.created_at
					
					// Si el backend envía historial_mantenimientos, usarlo
					// Si no, usar datos de ejemplo como fallback
					const datosExtra = datosHistoricos[parseInt(id)] || {
						historicoTrafico: [],
						sensores: [],
						configuracion: {}
					}
					
					setCruce({ 
						...cruceData, 
						...cruceCompleto,
						// Usar created_at como fecha de instalación
						fechaInstalacion: fechaInstalacion || cruceData.fechaInstalacion,
						// Mantener datos extra si no vienen del backend
						...datosExtra
					})
				} catch (error) {
					console.error('Error al cargar datos completos del cruce:', error)
					// Fallback a datos básicos
					const datosExtra = datosHistoricos[parseInt(id)] || {
						historicoTrafico: [],
						sensores: [],
						configuracion: {}
					}
					setCruce({ ...cruceData, ...datosExtra })
				}
			}
		}
		
		cargarDatosCruce()
	}, [id, cruces])
	
	// ✅ CORRECCIÓN CRÍTICA: Suscribirse a todos los eventos de Socket.IO para actualización en tiempo real
	useEffect(() => {
		if (!socket || !id) {
			return
		}
		
		const cruceId = parseInt(id)
		const cruceRoom = `cruce_${cruceId}`
		
		// Función para suscribirse y configurar listeners
		const setupSocketListeners = () => {
			if (!socket.connected) {
				return
			}
			
			console.log(`📡 [CruceDetail] Configurando listeners para cruce ${cruceId}`)
			
			// ✅ CRÍTICO: Suscribirse a eventos Y unirse a la sala
			console.log(`📡 [CruceDetail] Suscribiéndose a eventos: ${cruceRoom}, telemetria, barrier_events`)
			socketEvents.subscribe([cruceRoom, 'telemetria', 'barrier_events', 'alertas'])
			
			// ✅ CRÍTICO: Unirse a la sala de Socket.IO (para que el backend vea al cliente)
			console.log(`🚪 [CruceDetail] Uniéndose a sala de Socket.IO: ${cruceRoom}`)
			socketEvents.joinCruceRoom(cruceId)
		}
		
		// Listener para actualización de cruce
		const handleCruceUpdate = (cruceInfo) => {
			console.log('🔄 [CruceDetail] Evento cruce_update recibido:', cruceInfo)
			
			// Verificar si es el cruce actual
			if (cruceInfo && (cruceInfo.id === cruceId || cruceInfo.id_cruce === cruceId)) {
				console.log(`✅ [CruceDetail] Actualizando cruce ${cruceId} en tiempo real`)
				
				// Normalizar datos del cruce usando el helper
				const cruceNormalizado = normalizeCruceData(cruceInfo)
				
				// Actualizar el estado del cruce manteniendo los datos extra
				setCruce(prevCruce => ({
					...prevCruce,
					...cruceNormalizado,
					// Mantener los datos históricos si existen
					historicoTrafico: prevCruce?.historicoTrafico || [],
					sensores: prevCruce?.sensores || [],
					configuracion: prevCruce?.configuracion || {}
				}))
			}
		}
		
		// Listener para nueva telemetría
		const handleNewTelemetria = (telemetriaData) => {
			console.log('📊 [CruceDetail] Nueva telemetría recibida:', telemetriaData)
			const telemetria = telemetriaData.data || telemetriaData
			
			// Verificar si es del cruce actual
			if (telemetria && (telemetria.cruce === cruceId || telemetria.cruce_id === cruceId)) {
				console.log(`✅ [CruceDetail] Actualizando telemetría del cruce ${cruceId}`)
				
				// Actualizar el cruce con la nueva telemetría
				setCruce(prevCruce => {
					if (!prevCruce) return prevCruce
					
					// Crear objeto de telemetría actual
					const telemetriaActual = {
						...telemetria,
						timestamp: telemetria.timestamp || new Date().toISOString()
					}
					
					// Normalizar con la nueva telemetría
					const cruceConTelemetria = {
						...prevCruce,
						telemetria_actual: telemetriaActual
					}
					
					return normalizeCruceData(cruceConTelemetria)
				})
			}
		}
		
		// Listener para eventos de barrera
		const handleBarrierEvent = (barrierData) => {
			console.log('🚧 [CruceDetail] Evento de barrera recibido:', barrierData)
			const evento = barrierData.data || barrierData
			
			// Verificar si es del cruce actual
			if (evento && (evento.cruce === cruceId || evento.cruce_id === cruceId || evento.id_cruce === cruceId)) {
				console.log(`✅ [CruceDetail] Actualizando evento de barrera del cruce ${cruceId}`)
				
				// Actualizar estado de barrera en el cruce
				setCruce(prevCruce => {
					if (!prevCruce) return prevCruce
					return {
						...prevCruce,
						barrier_status: evento.state || evento.barrier_status,
						barrier_state: evento.state || evento.barrier_status,
						ultimaActividad: evento.event_time || evento.timestamp || new Date().toISOString()
					}
				})
				
				// ✅ CORRECCIÓN: Siempre recargar eventos de tráfico cuando se recibe un evento de barrera
				// Esto asegura que la tabla se actualice automáticamente
				const recargarEventos = async () => {
					try {
						console.log(`🔄 [CruceDetail] Recargando eventos de tráfico para cruce ${cruceId}`)
						const eventosResponse = await getBarrierEvents({
							cruce: cruceId,
							page: 1,
							page_size: 50
						})
						const eventos = eventosResponse.results || eventosResponse || []
						setEventosTrafico(eventos)
						
						// Recalcular estadísticas
						const ahora = new Date()
						const inicioDia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
						const inicioSemana = new Date(ahora)
						inicioSemana.setDate(ahora.getDate() - ahora.getDay())
						inicioSemana.setHours(0, 0, 0, 0)
						
						const eventosHoy = eventos.filter(e => {
							const fechaEvento = new Date(e.event_time || e.timestamp)
							return fechaEvento >= inicioDia
						})
						
						const eventosSemana = eventos.filter(e => {
							const fechaEvento = new Date(e.event_time || e.timestamp)
							return fechaEvento >= inicioSemana
						})
						
						setEstadisticasTrafico({
							total: eventos.length,
							hoy: eventosHoy.length,
							estaSemana: eventosSemana.length
						})
						console.log(`✅ [CruceDetail] Eventos de tráfico recargados: ${eventos.length} eventos`)
					} catch (error) {
						console.error('❌ [CruceDetail] Error al recargar eventos de tráfico:', error)
					}
				}
				recargarEventos()
			}
		}
		
		// Si ya está conectado, configurar inmediatamente
		if (socket.connected) {
			setupSocketListeners()
		}
		
		// ✅ CRÍTICO: Registrar listener para cuando el socket se conecte (reconexión o conexión tardía)
		const handleConnect = () => {
			console.log('🔌 [CruceDetail] Socket conectado, configurando listeners...')
			setupSocketListeners()
		}
		
		// Registrar listeners usando socketEvents para mejor gestión
		// Guardar referencias para poder removerlos correctamente
		socketEvents.onConnected(handleConnect)
		socketEvents.onCruceUpdate(handleCruceUpdate)
		socketEvents.onNewTelemetria(handleNewTelemetria)
		socketEvents.onBarrierEvent(handleBarrierEvent)
		
		console.log(`✅ [CruceDetail] Listeners registrados para cruce ${cruceId}`)
		
		// Cleanup: remover listeners al desmontar o cambiar de cruce
		// NOTA: socketEvents.onX ya maneja la limpieza de handlers previos, pero
		// removemos explícitamente para asegurar limpieza completa
		return () => {
			console.log(`🧹 [CruceDetail] Limpiando listeners para cruce ${cruceId}`)
			// Remover listeners pasando los mismos callbacks
			socketEvents.off('connected', handleConnect)
			socketEvents.off('cruce_update', handleCruceUpdate)
			socketEvents.off('new_telemetria', handleNewTelemetria)
			socketEvents.off('barrier_event', handleBarrierEvent)
			if (socket.connected) {
				socketEvents.unsubscribe([cruceRoom, 'telemetria', 'barrier_events', 'alertas'])
				socketEvents.leaveCruceRoom(cruceId)
			}
		}
	}, [socket, id, activeTab])

	// Actualizar meta tags dinámicamente
	useMetaTags({
		title: cruce ? `${cruce.nombre} - Viametrica` : 'Detalle de Cruce - Viametrica',
		description: cruce ? `Información detallada del cruce ferroviario ${cruce.nombre} ubicado en ${cruce.ubicacion}` : 'Información detallada del cruce ferroviario',
		keywords: cruce ? `cruces ferroviarios, ${cruce.nombre}, ${cruce.ubicacion}, monitoreo, telemetría` : 'cruces ferroviarios, monitoreo',
	})

	if (!cruce) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600 dark:text-gray-300">Cargando información del cruce...</p>
				</div>
			</div>
		)
	}

	const getEstadoStyles = (estado) => {
		switch (estado) {
			case 'ACTIVO':
				return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700'
			case 'MANTENIMIENTO':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700'
			case 'INACTIVO':
				return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700'
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
		}
	}

	const getBateriaColor = (nivel) => {
		if (nivel >= 70) return 'text-green-600 dark:text-green-400'
		if (nivel >= 30) return 'text-yellow-600 dark:text-yellow-400'
		return 'text-red-600 dark:text-red-400'
	}

	const formatearFecha = (fecha) => {
		if (!fecha) return 'N/A'
		return new Date(fecha).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	}

	// Iconos SVG para estados de barrera y otros elementos
	const BarrierStateIcons = {
		UP: (className = "w-5 h-5") => (
			<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
			</svg>
		),
		DOWN: (className = "w-5 h-5") => (
			<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
			</svg>
		),
		MOVING: (className = "w-5 h-5") => (
			<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
			</svg>
		),
		FAULT: (className = "w-5 h-5") => (
			<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
			</svg>
		)
	}
	
	// Iconos adicionales
	const UtilityIcons = {
		sun: (className = "w-4 h-4") => (
			<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
			</svg>
		),
		wifi: (className = "w-4 h-4") => (
			<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
			</svg>
		),
		check: (className = "w-4 h-4") => (
			<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
			</svg>
		),
		cross: (className = "w-4 h-4") => (
			<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
			</svg>
		)
	}
	
	const getBarrierStateIcon = (state) => {
		const IconComponent = BarrierStateIcons[state] || BarrierStateIcons.FAULT
		return IconComponent("w-5 h-5")
	}

	// Componentes de iconos SVG para las tabs
	const TabIcons = {
		general: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
			</svg>
		),
		telemetria: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
			</svg>
		),
		sensores: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>
		),
		trafico: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
			</svg>
		),
		ubicacion: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>
		),
		contacto: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
			</svg>
		)
	}

	const tabs = [
		{ id: 'general', label: 'General', icon: TabIcons.general },
		{ id: 'telemetria', label: 'Telemetría ESP32', icon: TabIcons.telemetria },
		{ id: 'sensores', label: 'Sensores', icon: TabIcons.sensores },
		{ id: 'trafico', label: 'Tráfico', icon: TabIcons.trafico },
		{ id: 'ubicacion', label: 'Ubicación', icon: TabIcons.ubicacion },
		{ id: 'contacto', label: 'Contacto', icon: TabIcons.contacto }
	]

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
			{/* Header */}
			<header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 sm:py-6">
						<div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
							<button
								onClick={() => navigate('/')}
								className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors text-sm flex-shrink-0"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
								<span className="hidden sm:inline">Volver</span>
							</button>
							<div className="min-w-0 flex-1">
								<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">{cruce.nombre}</h1>
								<p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 truncate">{cruce.ubicacion}</p>
							</div>
						</div>
						<div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
							<span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full border whitespace-nowrap ${getEstadoStyles(cruce.estado)}`}>
								{cruce.estado}
							</span>
						</div>
					</div>
				</div>
			</header>

			{/* Contenido Principal */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
				{/* Estadísticas Rápidas */}
				<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Batería</p>
								<p className={`text-2xl font-bold ${getBateriaColor(cruce.bateria)}`}>
									{cruce.bateria}%
								</p>
								{cruce.battery_voltage && (
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
										{cruce.battery_voltage?.toFixed(2)}V
									</p>
								)}
							</div>
							<div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
								<svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							</div>
						</div>
					</div>

					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sensores Activos</p>
								<p className="text-2xl font-bold text-gray-900 dark:text-white">
									{totalSensores > 0 ? `${sensoresActivosCount}/${totalSensores}` : sensoresActivosCount}
								</p>
								{cruce.barrier_state && (
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
										{getBarrierStateIcon(cruce.barrier_state)} {cruce.barrier_state}
									</p>
								)}
							</div>
							<div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
								<svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
								</svg>
							</div>
						</div>
					</div>

					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Temperatura</p>
								<p className="text-2xl font-bold text-gray-900 dark:text-white">
									{cruce.temperature !== undefined && cruce.temperature !== null 
										? `${cruce.temperature.toFixed(1)}°C` 
										: cruce.velocidadPromedio !== undefined && cruce.velocidadPromedio !== null
										? `${cruce.velocidadPromedio} km/h`
										: 'N/A'}
								</p>
								{cruce.solar_power !== undefined && cruce.solar_power !== null && (
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
										{UtilityIcons.sun("w-3.5 h-3.5")}
										<span>{cruce.solar_power.toFixed(1)}W</span>
									</p>
								)}
							</div>
							<div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
								<svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
								</svg>
							</div>
						</div>
					</div>

					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Última Actividad</p>
								<p className="text-sm font-bold text-gray-900 dark:text-white">
									{new Date(cruce.ultimaActividad).toLocaleDateString('es-ES')}
								</p>
								{cruce.rssi && (
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
										{UtilityIcons.wifi("w-3.5 h-3.5")}
										<span>RSSI: {cruce.rssi} dBm</span>
									</p>
								)}
							</div>
							<div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
								<svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
						</div>
					</div>
				</div>

				{/* Navegación por Tabs */}
				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
					<div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
						<nav className="-mb-px flex space-x-4 md:space-x-8 px-6">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
										activeTab === tab.id
											? 'border-blue-500 text-blue-600 dark:text-blue-400'
											: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
									}`}
								>
									{tab.icon}
									<span>{tab.label}</span>
								</button>
							))}
						</nav>
					</div>

					{/* Contenido de los Tabs */}
					<div className="p-6">
						{activeTab === 'general' && (
							<div className="space-y-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información General</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Instalación</label>
											<p className="mt-1 text-sm text-gray-900 dark:text-white">
												{formatearFecha(cruce.fechaInstalacion || cruce.created_at || cruce.instalacion)}
											</p>
											{cruce.created_at && !cruce.fechaInstalacion && (
												<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
													(Usando fecha de creación del registro)
												</p>
											)}
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Último Mantenimiento</label>
											{datosMantenimiento.loading ? (
												<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
											) : (
												<>
													<p className="mt-1 text-sm text-gray-900 dark:text-white">
														{formatearFecha(
															datosMantenimiento.ultimoMantenimiento || 
															cruce.ultimo_mantenimiento || 
															cruce.ultimoMantenimiento
														)}
													</p>
													{!datosMantenimiento.ultimoMantenimiento && !cruce.ultimo_mantenimiento && !cruce.ultimoMantenimiento && (
														<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
															No hay registros de mantenimiento completados
														</p>
													)}
												</>
											)}
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Próximo Mantenimiento</label>
											{datosMantenimiento.loading ? (
												<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
											) : (
												<>
													<p className="mt-1 text-sm text-gray-900 dark:text-white">
														{formatearFecha(
															datosMantenimiento.proximoMantenimiento || 
															cruce.proximo_mantenimiento || 
															cruce.proximoMantenimiento
														)}
													</p>
													{!datosMantenimiento.proximoMantenimiento && !cruce.proximo_mantenimiento && !cruce.proximoMantenimiento && (
														<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
															No hay mantenimientos programados
														</p>
													)}
												</>
											)}
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Registro</label>
											<p className="mt-1 text-sm text-gray-900 dark:text-white">
												{formatearFecha(cruce.created_at)}
											</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Última Actualización</label>
											<p className="mt-1 text-sm text-gray-900 dark:text-white">
												{formatearFecha(cruce.updated_at)}
											</p>
										</div>
									</div>
									<div className="space-y-4">
										{cruce.configuracion && Object.keys(cruce.configuracion).length > 0 ? (
											<div>
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Configuración</label>
												<div className="mt-1 space-y-2">
													{cruce.configuracion.tiempoAlerta && (
														<p className="text-sm text-gray-900 dark:text-white">Tiempo de alerta: {cruce.configuracion.tiempoAlerta}s</p>
													)}
													{cruce.configuracion.velocidadMaxima && (
														<p className="text-sm text-gray-900 dark:text-white">Velocidad máxima: {cruce.configuracion.velocidadMaxima} km/h</p>
													)}
													{cruce.configuracion.tiempoBarrera && (
														<p className="text-sm text-gray-900 dark:text-white">Tiempo de barrera: {cruce.configuracion.tiempoBarrera}s</p>
													)}
													{cruce.configuracion.modoOperacion && (
														<p className="text-sm text-gray-900 dark:text-white">Modo: {cruce.configuracion.modoOperacion}</p>
													)}
												</div>
											</div>
										) : (
											<div>
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Configuración</label>
												<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
													No hay configuración disponible. Los parámetros de operación se gestionan desde el sistema de control.
												</p>
											</div>
										)}
										{cruce.estadisticas && (
											<div>
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estadísticas</label>
												<div className="mt-1 space-y-2">
													<p className="text-sm text-gray-900 dark:text-white">
														Total de telemetrías: {cruce.estadisticas.total_telemetrias || 0}
													</p>
													<p className="text-sm text-gray-900 dark:text-white">
														Total de eventos: {cruce.estadisticas.total_eventos || 0}
													</p>
													<p className="text-sm text-gray-900 dark:text-white">
														Alertas activas: {cruce.estadisticas.total_alertas_activas || 0}
													</p>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						)}

						{activeTab === 'telemetria' && (
							<div className="space-y-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Telemetría ESP32 en Tiempo Real</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{cruce.barrier_state && (
										<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
											<div className="flex items-center justify-between">
												<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado de Barrera</span>
												<div className="text-gray-600 dark:text-gray-400">
													{getBarrierStateIcon(cruce.barrier_state)}
												</div>
											</div>
											<p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{cruce.barrier_state}</p>
										</div>
									)}
									{cruce.barrier_voltage && (
										<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Voltaje de Barrera</span>
											<p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{cruce.barrier_voltage.toFixed(2)} V</p>
										</div>
									)}
									{cruce.battery_voltage && (
										<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Voltaje de Batería</span>
											<p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{cruce.battery_voltage.toFixed(2)} V</p>
										</div>
									)}
									{cruce.temperature !== undefined && (
										<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Temperatura</span>
											<p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{cruce.temperature.toFixed(1)} °C</p>
										</div>
									)}
									{cruce.rssi && (
										<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Señal WiFi (RSSI)</span>
											<p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{cruce.rssi} dBm</p>
										</div>
									)}
									{/* Sensores individuales */}
									{cruce.sensor_1 !== undefined && cruce.sensor_1 !== null && (
										<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sensor 1 (ADC)</span>
											<p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{cruce.sensor_1}</p>
										</div>
									)}
									{cruce.sensor_2 !== undefined && cruce.sensor_2 !== null && (
										<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sensor 2 (ADC)</span>
											<p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{cruce.sensor_2}</p>
										</div>
									)}
									{cruce.sensor_3 !== undefined && cruce.sensor_3 !== null && (
										<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sensor 3 (ADC)</span>
											<p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{cruce.sensor_3}</p>
										</div>
									)}
									{cruce.sensor_4 !== undefined && cruce.sensor_4 !== null && (
										<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sensor 4 (ADC)</span>
											<p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{cruce.sensor_4}</p>
										</div>
									)}
								</div>
							</div>
						)}

						{activeTab === 'sensores' && (
							<div className="space-y-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Estado de Sensores</h3>
								{sensoresLoading ? (
									<div className="text-center py-8 text-gray-500 dark:text-gray-400">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
										<p>Cargando sensores...</p>
									</div>
								) : sensoresData && sensoresData.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{sensoresData.map((sensor) => {
											const estadoDisplay = sensor.estado_display || (sensor.activo ? 'ACTIVO' : 'INACTIVO')
											const estadoColor = getSensorStatusColor(sensor.estado || (sensor.activo ? 'funcionando' : 'inactivo'))
											
											return (
												<div key={sensor.id} className={`border-2 rounded-lg p-4 ${estadoColor}`}>
													<div className="flex items-center justify-between mb-2">
														<h4 className="font-medium text-gray-900 dark:text-white">{sensor.nombre || sensor.tipo || `Sensor ${sensor.id}`}</h4>
														<span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoStyles(estadoDisplay)}`}>
															{estadoDisplay}
														</span>
													</div>
													<div className="space-y-1 text-sm">
														{sensor.descripcion && (
															<p className="text-gray-600 dark:text-gray-400">{sensor.descripcion}</p>
														)}
														{sensor.tipo && (
															<p className="text-gray-600 dark:text-gray-400">
																<span className="font-medium">Tipo:</span> {sensor.tipo}
															</p>
														)}
														{sensor.valor_actual !== undefined && sensor.valor_actual !== null && (
															<p className="text-gray-600 dark:text-gray-400">
																<span className="font-medium">Valor ADC:</span> {sensor.valor_actual}
															</p>
														)}
														{sensor.enviando_datos !== undefined && (
															<p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
																<span className="font-medium">Enviando datos:</span>
																<span className="flex items-center gap-1.5">
																	{sensor.enviando_datos ? (
																		<>
																			{UtilityIcons.check("w-4 h-4 text-green-600 dark:text-green-400")}
																			<span>Sí</span>
																		</>
																	) : (
																		<>
																			{UtilityIcons.cross("w-4 h-4 text-red-600 dark:text-red-400")}
																			<span>No</span>
																		</>
																	)}
																</span>
															</p>
														)}
													</div>
												</div>
											)
										})}
									</div>
								) : (
									<div className="text-center py-8 text-gray-500 dark:text-gray-400">
										<p>No hay sensores registrados para este cruce</p>
									</div>
								)}
							</div>
						)}

						{activeTab === 'trafico' && (
							<div className="space-y-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historial de Tráfico</h3>
								
								{/* Estadísticas de tráfico */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
									<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
										<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Eventos</p>
										<p className="text-2xl font-bold text-gray-900 dark:text-white">{estadisticasTrafico.total}</p>
										<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Todos los tiempos</p>
									</div>
									<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
										<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Eventos Hoy</p>
										<p className="text-2xl font-bold text-gray-900 dark:text-white">{estadisticasTrafico.hoy}</p>
										<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Últimas 24 horas</p>
									</div>
									<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
										<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Esta Semana</p>
										<p className="text-2xl font-bold text-gray-900 dark:text-white">{estadisticasTrafico.estaSemana}</p>
										<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Últimos 7 días</p>
									</div>
								</div>
								
								{loadingTrafico ? (
									<div className="text-center py-8 text-gray-500 dark:text-gray-400">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
										<p>Cargando eventos de tráfico...</p>
									</div>
								) : eventosTrafico && eventosTrafico.length > 0 ? (
									<div className="overflow-x-auto">
										<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
											<thead className="bg-gray-50 dark:bg-gray-700">
												<tr>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha y Hora</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Voltaje</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo de Evento</th>
												</tr>
											</thead>
											<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
												{eventosTrafico.map((evento) => {
													const fechaEvento = new Date(evento.event_time || evento.timestamp)
													const estadoColor = evento.state === 'DOWN' 
														? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
														: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
													const EstadoIcon = evento.state === 'DOWN' 
														? BarrierStateIcons.DOWN 
														: BarrierStateIcons.UP
													
													return (
														<tr key={evento.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
																{fechaEvento.toLocaleString('es-ES', {
																	year: 'numeric',
																	month: '2-digit',
																	day: '2-digit',
																	hour: '2-digit',
																	minute: '2-digit'
																})}
															</td>
															<td className="px-6 py-4 whitespace-nowrap">
																<span className={`px-2 py-1 text-xs font-medium rounded-full ${estadoColor} flex items-center gap-1.5 w-fit`}>
																	{EstadoIcon("w-4 h-4")}
																	{evento.state === 'DOWN' ? 'Baja' : 'Sube'}
																</span>
															</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
																{evento.voltage_at_event ? `${evento.voltage_at_event.toFixed(2)}V` : 'N/A'}
															</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
																{evento.state === 'DOWN' ? 'Tren Detectado / Barrera Baja' : 'Tren Pasó / Barrera Sube'}
															</td>
														</tr>
													)
												})}
											</tbody>
										</table>
									</div>
								) : (
									<div className="text-center py-8 text-gray-500 dark:text-gray-400">
										<p>No hay eventos de tráfico registrados para este cruce</p>
										<p className="text-sm mt-2">Los eventos de tráfico se registran cuando la barrera sube o baja</p>
									</div>
								)}
							</div>
						)}

						{activeTab === 'ubicacion' && (
							<div className="space-y-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ubicación y Coordenadas</h3>
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección</label>
											<p className="mt-1 text-sm text-gray-900 dark:text-white">{cruce.ubicacion}</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitud</label>
											<p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
												{cruce.coordenadas?.lat || cruce.coordenadas?.latitud || 'N/A'}
											</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitud</label>
											<p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
												{cruce.coordenadas?.lng || cruce.coordenadas?.longitud || 'N/A'}
											</p>
										</div>
									</div>
									<div className="lg:col-span-2">
										{/* Mapa interactivo */}
										{cruce.coordenadas && (cruce.coordenadas.lat || cruce.coordenadas.latitud) ? (
											<div className="rounded-lg overflow-hidden shadow-lg" style={{ height: '400px' }}>
												<MapContainer
													center={[
														cruce.coordenadas.lat || cruce.coordenadas.latitud,
														cruce.coordenadas.lng || cruce.coordenadas.longitud
													]}
													zoom={15}
													style={{ height: '100%', width: '100%' }}
												>
													<TileLayer
														url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
														attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
													/>
													<Marker
														position={[
															cruce.coordenadas.lat || cruce.coordenadas.latitud,
															cruce.coordenadas.lng || cruce.coordenadas.longitud
														]}
														icon={createCustomIcon(cruce.estado)}
													>
														<Popup>
															<div className="p-2">
																<h4 className="font-bold text-gray-900">{cruce.nombre}</h4>
																<p className="text-sm text-gray-600">{cruce.ubicacion}</p>
																<p className="text-sm font-semibold mt-2">Estado: {cruce.estado}</p>
															</div>
														</Popup>
													</Marker>
													<Circle
														center={[
															cruce.coordenadas.lat || cruce.coordenadas.latitud,
															cruce.coordenadas.lng || cruce.coordenadas.longitud
														]}
														radius={200}
														pathOptions={{
															color: cruce.estado === 'ACTIVO' ? '#22c55e' : 
																	 cruce.estado === 'MANTENIMIENTO' ? '#eab308' : '#ef4444',
															weight: 2,
															opacity: 0.5,
															fillOpacity: 0.1
														}}
													/>
												</MapContainer>
											</div>
										) : (
											<div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 flex items-center justify-center h-full">
												<div className="text-center">
													<svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
													</svg>
													<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Coordenadas no disponibles</p>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						)}

						{activeTab === 'contacto' && (
							<div className="space-y-6">
								<ResponsableInfo cruce={cruce} />
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
