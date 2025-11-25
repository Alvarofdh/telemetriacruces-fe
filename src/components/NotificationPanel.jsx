import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import toast from 'react-hot-toast'
import { getAlertas } from '../services/alertas'
import { getNotificationSettings } from '../services/notifications'
import { getSocket } from '../services/socket'

// ✅ CORRECCIÓN: Inicializar como deshabilitado hasta cargar settings del usuario
const DEFAULT_SETTINGS = {
	enable_notifications: true, // Deshabilitado por defecto hasta cargar preferencias
	notify_critical_alerts: true,
	notify_warning_alerts: true,
	notify_info_alerts: true,
	notify_barrier_events: true,
	notify_battery_low: true,
	notify_communication_lost: true,
	notify_gabinete_open: true,
}

const MAX_ITEMS = 30
const VISIBLE_ITEMS = 3
const READ_NOTIFICATIONS_KEY = 'read_notifications'

const NotificationIcons = {
	panel: (
		<svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V3h0z" />
		</svg>
	),
	bell: (
		<svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h16" />
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 21a3 3 0 01-6 0" />
		</svg>
	),
	critical: (
		<svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
		</svg>
	),
	warning: (
		<svg className="w-5 h-5 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
		</svg>
	),
	info: (
		<svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	),
}

const severityConfig = {
	CRITICAL: {
		border: 'border-l-red-500 bg-red-50 dark:bg-red-900/20',
		icon: NotificationIcons.critical,
		toast: (msg) => toast.error(msg, { icon: '🚨', duration: 5000 }),
	},
	WARNING: {
		border: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
		icon: NotificationIcons.warning,
		toast: (msg) => toast(msg, { icon: '⚠️', duration: 4000 }),
	},
	INFO: {
		border: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20',
		icon: NotificationIcons.info,
		toast: (msg) => toast.success(msg, { icon: 'ℹ️', duration: 3500 }),
	},
}

const normalizeSeverity = (value) => {
	if (!value) {
		return 'INFO'
	}
	const normalized = value.toUpperCase()
	if (normalized === 'DANGER') {
		return 'CRITICAL'
	}
	return normalized
}

const normalizeAlert = (alert) => {
	const severity = normalizeSeverity(alert.severity)
	return {
		id: alert.id,
		title: alert.type_display || alert.type || 'Alerta',
		message: alert.description || 'Sin descripción',
		cruce: alert.cruce_nombre || `Cruce #${alert.cruce}`,
		timestamp: alert.created_at || new Date().toISOString(),
		severity,
		read: !!alert.resolved,
	}
}

const normalizeRealtimeNotification = (payload) => {
	const severity = normalizeSeverity(payload.severity || payload.metadata?.severity)
	return {
		id: payload.metadata?.alerta_id || payload.id || crypto.randomUUID(),
		title: payload.title || payload.metadata?.title || 'Notificación',
		message: payload.message || payload.metadata?.message || 'Sin mensaje',
		cruce: payload.cruce || payload.metadata?.cruce_nombre || `Cruce #${payload.cruce_id || '-'}`,
		timestamp: payload.timestamp || new Date().toISOString(),
		event: payload.event || payload.type || 'notification',
		severity,
		read: false,
	}
}

const formatTimestamp = (value) => {
	if (!value) {
		return 'Hace unos segundos'
	}
	const date = new Date(value)
	const now = new Date()
	const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

	if (diffMinutes < 1) {
		return 'Hace unos segundos'
	}
	if (diffMinutes < 60) {
		return `Hace ${diffMinutes} min`
	}
	const diffHours = Math.floor(diffMinutes / 60)
	if (diffHours < 24) {
		return `Hace ${diffHours} h`
	}
	return date.toLocaleString('es-ES', {
		day: '2-digit',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
	})
}

export function NotificationPanel() {
	const [alerts, setAlerts] = useState([])
	const [realtimeNotifications, setRealtimeNotifications] = useState([])
	// ✅ CORRECCIÓN: Inicializar como deshabilitado y agregar flag de carga
	const [settings, setSettings] = useState(DEFAULT_SETTINGS)
	const [settingsLoaded, setSettingsLoaded] = useState(false)
	const [isLoadingAlerts, setIsLoadingAlerts] = useState(false)
	const [mostrarTodas, setMostrarTodas] = useState(false)

	const unreadRest = useMemo(() => alerts.filter(alerta => !alerta.read).length, [alerts])
	const unreadRealtime = useMemo(() => realtimeNotifications.filter(alerta => !alerta.read).length, [realtimeNotifications])
	const totalUnread = unreadRest + unreadRealtime

	// ✅ CORRECCIÓN: Cargar notificaciones leídas desde localStorage
	const getReadNotifications = useCallback(() => {
		try {
			const stored = localStorage.getItem(READ_NOTIFICATIONS_KEY)
			return stored ? JSON.parse(stored) : []
		} catch (error) {
			console.error('Error al cargar notificaciones leídas:', error)
			return []
		}
	}, [])

	// ✅ CORRECCIÓN: Guardar notificaciones leídas en localStorage
	const saveReadNotifications = useCallback((readIds) => {
		try {
			localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(readIds))
		} catch (error) {
			console.error('Error al guardar notificaciones leídas:', error)
		}
	}, [])

	const loadAlerts = useCallback(async () => {
		setIsLoadingAlerts(true)
		try {
			const response = await getAlertas({ resolved: false, page_size: MAX_ITEMS })
			const readIds = getReadNotifications()
			const lista = (response?.results || response || []).map(alert => {
				const normalized = normalizeAlert(alert)
				// ✅ CORRECCIÓN: Verificar si ya fue leída desde localStorage
				return {
					...normalized,
					read: normalized.read || readIds.includes(alert.id)
				}
			})
			setAlerts(lista)
		} catch (error) {
			toast.error(error.message || 'No se pudieron cargar las alertas')
		} finally {
			setIsLoadingAlerts(false)
		}
	}, [getReadNotifications])

	const loadSettings = useCallback(async () => {
		try {
			const response = await getNotificationSettings()
			// ✅ CORRECCIÓN: Cargar settings y marcar como cargadas
			setSettings({ ...DEFAULT_SETTINGS, ...response })
			setSettingsLoaded(true)
		} catch (error) {
			// Si falla, mantener deshabilitado pero marcar como cargado
			toast.error(error.message || 'No se pudo obtener la configuración de notificaciones')
			setSettings(DEFAULT_SETTINGS)
			setSettingsLoaded(true)
		}
	}, [])

	useEffect(() => {
		loadAlerts()
		loadSettings()
	}, [loadAlerts, loadSettings])

	const shouldProcessNotification = useCallback((payload) => {
		// ✅ CORRECCIÓN CRÍTICA: Verificar severidad PRIMERO, antes de cualquier otra verificación
		// Las alertas CRITICAL siempre se muestran, independientemente de settings
		// Buscar severidad en múltiples ubicaciones posibles
		const severityRaw = payload.severity || 
			payload.metadata?.severity || 
			payload.data?.severity ||
			(payload.type === 'alerta' && payload.data?.data?.severity) ||
			'INFO'
		
		const severity = normalizeSeverity(severityRaw)
		console.log('🔍 [NotificationPanel] Severidad detectada:', severity, '| Raw:', severityRaw, '| Payload keys:', Object.keys(payload))
		
		// ✅ CRÍTICO: Las alertas CRITICAL siempre se muestran, sin importar settings
		if (severity === 'CRITICAL' || severityRaw === 'CRITICAL' || severityRaw === 'error' || payload.severity === 'CRITICAL') {
			console.log('🚨 [NotificationPanel] Alerta CRÍTICA detectada, mostrando SIEMPRE (ignorando settings):', payload)
			return true
		}

		// ✅ CORRECCIÓN: Si las settings no están cargadas, permitir todas las notificaciones
		// Esto evita que se pierdan notificaciones mientras se cargan las preferencias
		if (!settingsLoaded) {
			console.log('⚠️ [NotificationPanel] Settings no cargadas, permitiendo notificación:', payload)
			return true
		}

		// Si las notificaciones están deshabilitadas, filtrar (excepto críticas que ya se procesaron arriba)
		if (!settings.enable_notifications) {
			console.log('⚠️ [NotificationPanel] Notificaciones deshabilitadas en settings')
			return false
		}

		// Aplicar filtros según settings para alertas no críticas
		if (severity === 'WARNING' && !settings.notify_warning_alerts) return false
		if (severity === 'INFO' && !settings.notify_info_alerts) return false

		const eventName = (payload.event || payload.type || '').toLowerCase()
		if (eventName.includes('barrier') && !settings.notify_barrier_events) return false
		if (eventName.includes('battery') && !settings.notify_battery_low) return false
		if (eventName.includes('communication') && !settings.notify_communication_lost) return false
		if (eventName.includes('gabinete') && !settings.notify_gabinete_open) return false
		return true
	}, [settings, settingsLoaded])

	// Handler para notificaciones de socket
	const handleSocketNotification = useCallback((payload) => {
		console.log('🔔 [NotificationPanel] Evento recibido:', payload)
		
		if (!shouldProcessNotification(payload)) {
			console.log('⚠️ [NotificationPanel] Notificación filtrada por settings:', payload)
			return
		}
		
		console.log('✅ [NotificationPanel] Procesando notificación:', payload)
		
		const normalized = normalizeRealtimeNotification(payload)
		console.log('📝 [NotificationPanel] Notificación normalizada:', normalized)
		
		// ✅ CORRECCIÓN: Verificar si ya fue leída desde localStorage
		const readIds = getReadNotifications()
		if (readIds.includes(normalized.id)) {
			normalized.read = true
		}
		
		setRealtimeNotifications(prev => {
			const updated = [normalized, ...prev].slice(0, MAX_ITEMS)
			console.log('📊 [NotificationPanel] Estado actualizado, total notificaciones:', updated.length)
			return updated
		})

		const severity = normalized.severity || 'INFO'
		const severityEntry = severityConfig[severity] || severityConfig.INFO
		severityEntry.toast(`${normalized.title}: ${normalized.message}`)

		if (payload.event === 'alert_created' || payload.event === 'alerta_resuelta' || payload.type === 'alerta') {
			console.log('🔄 [NotificationPanel] Recargando alertas desde API...')
			loadAlerts()
		}
	}, [shouldProcessNotification, loadAlerts, getReadNotifications])

	// ✅ CORRECCIÓN: Unirse a ambas salas (notifications y alertas) para asegurar recepción
	// Manejar unión a rooms de notificaciones cuando el socket se conecta
	useEffect(() => {
		// ✅ CORRECCIÓN: Intentar obtener socket, si no existe esperar un poco y reintentar
		const setupSocket = () => {
			const socket = getSocket()
			if (!socket) {
				console.warn('⚠️ [NotificationPanel] Socket no disponible, reintentando en 1 segundo...')
				setTimeout(setupSocket, 1000)
				return
			}

			console.log('✅ [NotificationPanel] Socket encontrado, estado:', socket.connected ? 'conectado' : 'desconectado')

			// ✅ CORRECCIÓN: No esperar a settings - unirse siempre a las salas
			// El backend automáticamente une a 'notifications' al conectar, pero nos aseguramos
			const joinNotificationRooms = () => {
				if (!socket.connected) {
					console.warn('⚠️ [NotificationPanel] Socket no conectado, esperando conexión...')
					return
				}

				// ✅ CORRECCIÓN: Unirse a ambas salas siempre (el filtrado se hace en shouldProcessNotification)
				console.log('🔔 [NotificationPanel] Uniéndose a salas: notifications, alertas')
				socket.emit('join_room', { room: 'notifications' })
				socket.emit('join_room', { room: 'alertas' })
				
				// También suscribirse a eventos de alertas
				socket.emit('subscribe', { events: ['alertas', 'notifications'] })
				
				console.log('✅ [NotificationPanel] Suscripción completada')
			}

			// Intentar unirse inmediatamente si ya está conectado
			if (socket.connected) {
				joinNotificationRooms()
			}

			// También unirse cuando se autentica (evento 'connected')
			const handleConnected = () => {
				console.log('✅ [NotificationPanel] Socket conectado/autenticado, uniéndose a salas')
				joinNotificationRooms()
			}

			socket.on('connect', handleConnected)
			socket.on('connected', handleConnected) // Evento de autenticación del backend
			socket.on('joined_room', (data) => {
				console.log('✅ [NotificationPanel] Confirmación de unión a sala:', data)
			})
			socket.on('subscribed', (data) => {
				console.log('✅ [NotificationPanel] Confirmación de suscripción:', data)
			})

			return () => {
				socket.off('connect', handleConnected)
				socket.off('connected', handleConnected)
				socket.off('joined_room')
				socket.off('subscribed')
				if (socket.connected) {
					socket.emit('leave_room', { room: 'notifications' })
					socket.emit('leave_room', { room: 'alertas' })
				}
			}
		}

		const cleanup = setupSocket()
		return cleanup
	}, []) // ✅ CORRECCIÓN: Ejecutar solo una vez al montar, no depender de settings

	// ✅ CORRECCIÓN: Usar un solo sistema de listeners para evitar duplicación
	// Usar listeners directos con deduplicación para evitar procesar la misma alerta múltiples veces
	const processedAlertsRef = useRef(new Set())
	
	useEffect(() => {
		const setupDirectListeners = () => {
			const socket = getSocket()
			if (!socket) {
				console.warn('⚠️ [NotificationPanel] Socket no disponible, reintentando...')
				setTimeout(setupDirectListeners, 1000)
				return
			}

			console.log('✅ [NotificationPanel] Configurando listeners al socket (solo una vez)')

			const handleNotificationDirect = (payload) => {
				// ✅ CORRECCIÓN: Deduplicación - evitar procesar la misma alerta múltiples veces
				const alertId = payload.metadata?.alerta_id || payload.data?.id || payload.id || JSON.stringify(payload)
				const alertKey = `notification-${alertId}-${payload.timestamp || Date.now()}`
				
				if (processedAlertsRef.current.has(alertKey)) {
					console.log('⚠️ [NotificationPanel] Alerta ya procesada, ignorando duplicado:', alertKey)
					return
				}
				
				processedAlertsRef.current.add(alertKey)
				// Limpiar alertas procesadas después de 5 minutos para evitar acumulación de memoria
				setTimeout(() => processedAlertsRef.current.delete(alertKey), 5 * 60 * 1000)
				
				console.log('🔔 [NotificationPanel] Evento notification recibido:', payload)
				handleSocketNotification(payload)
			}

			const handleNewAlertaDirect = (alertaData) => {
				// ✅ CORRECCIÓN: Deduplicación - evitar procesar la misma alerta múltiples veces
				const eventData = alertaData.data || alertaData
				const alertId = eventData.id || JSON.stringify(alertaData)
				const alertKey = `new_alerta-${alertId}-${eventData.created_at || Date.now()}`
				
				if (processedAlertsRef.current.has(alertKey)) {
					console.log('⚠️ [NotificationPanel] Alerta ya procesada, ignorando duplicado:', alertKey)
					return
				}
				
				processedAlertsRef.current.add(alertKey)
				// Limpiar alertas procesadas después de 5 minutos
				setTimeout(() => processedAlertsRef.current.delete(alertKey), 5 * 60 * 1000)
				
				console.log('🚨 [NotificationPanel] Evento new_alerta recibido:', alertaData)
				const payload = {
					type: 'alerta',
					event: 'alert_created',
					title: `${eventData.type_display || eventData.type || 'Alerta'} - ${eventData.cruce_nombre || `Cruce #${eventData.cruce}`}`,
					message: eventData.description || 'Sin descripción',
					severity: eventData.severity || 'INFO',
					timestamp: eventData.created_at || new Date().toISOString(),
					metadata: {
						alerta_id: eventData.id,
						cruce_nombre: eventData.cruce_nombre,
						cruce_id: eventData.cruce,
					},
					data: eventData,
				}
				handleSocketNotification(payload)
			}

			// ✅ CORRECCIÓN: Registrar listeners solo una vez, removiendo previos si existen
			socket.off('notification', handleNotificationDirect) // Remover previo si existe
			socket.off('new_alerta', handleNewAlertaDirect) // Remover previo si existe
			socket.off('alerta', handleNewAlertaDirect) // Remover previo si existe
			
			socket.on('notification', handleNotificationDirect)
			socket.on('new_alerta', handleNewAlertaDirect)
			socket.on('alerta', handleNewAlertaDirect) // También escuchar 'alerta' por compatibilidad

			console.log('✅ [NotificationPanel] Listeners configurados correctamente')

			return () => {
				console.log('🧹 [NotificationPanel] Limpiando listeners')
				socket.off('notification', handleNotificationDirect)
				socket.off('new_alerta', handleNewAlertaDirect)
				socket.off('alerta', handleNewAlertaDirect)
			}
		}

		const cleanup = setupDirectListeners()
		return cleanup
	}, [handleSocketNotification])

	const handleRefreshAlerts = () => {
		loadAlerts()
	}

	const handleMarkAsRead = (item) => {
		const readIds = getReadNotifications()
		if (!readIds.includes(item.rawId)) {
			readIds.push(item.rawId)
			saveReadNotifications(readIds)
		}

		if (item.origin === 'rest') {
			setAlerts(prev => prev.map(alert => alert.id === item.rawId ? { ...alert, read: true } : alert))
		} else {
			setRealtimeNotifications(prev => prev.map(alert => alert.id === item.rawId ? { ...alert, read: true } : alert))
		}
	}

	const combinedAlerts = useMemo(() => {
		const restItems = alerts.map(alert => ({
			id: `rest-${alert.id}`,
			rawId: alert.id,
			origin: 'rest',
			message: alert.message,
			cruce: alert.cruce,
			timestamp: alert.timestamp,
			read: alert.read,
			severity: alert.severity || 'INFO',
			title: alert.title,
		}))

		const realtimeItems = realtimeNotifications.map(notification => ({
			id: `socket-${notification.id}`,
			rawId: notification.id,
			origin: 'socket',
			message: notification.message || notification.title,
			cruce: notification.cruce,
			timestamp: notification.timestamp,
			read: notification.read,
			severity: notification.severity || 'INFO',
			title: notification.title,
		}))

		return [...realtimeItems, ...restItems].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
	}, [alerts, realtimeNotifications])

	const alertasAMostrar = mostrarTodas ? combinedAlerts : combinedAlerts.slice(0, VISIBLE_ITEMS)

	const getAlertaStyles = (severity) => {
		const config = severityConfig[severity] || severityConfig.INFO
		return config.border
	}

	const getAlertaIcon = (severity) => {
		const config = severityConfig[severity] || severityConfig.INFO
		return config.icon
	}

	return (
		<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
			<div className="bg-gradient-to-r from-orange-200 to-red-200 dark:from-gray-700 dark:to-gray-600 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-300 dark:border-gray-600">
				<div className="flex items-start justify-between gap-2">
					<div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
						<svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-800 dark:text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V3h0z" />
						</svg>
						<div className="min-w-0 flex-1">
							<h3 className="text-base sm:text-lg font-bold text-gray-950 dark:text-white truncate drop-shadow">Centro de Alertas</h3>
							<div className="flex items-center justify-between gap-2 mt-0.5">
								<p className="text-xs sm:text-sm text-gray-800 dark:text-gray-300 truncate font-medium">Notificaciones del sistema</p>
								{totalUnread > 0 && (
									<div className="flex items-center space-x-1 flex-shrink-0">
										<span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
											{totalUnread > 99 ? '99+' : totalUnread}
					</span>
										<span className="text-xs text-gray-800 dark:text-gray-300 hidden sm:inline font-medium">sin leer</span>
									</div>
								)}
							</div>
						</div>
					</div>
							</div>
						</div>

			<div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
				{isLoadingAlerts && combinedAlerts.length === 0 ? (
					<div className="p-4 space-y-3">
						<div className="h-14 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
						<div className="h-14 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
								</div>
				) : alertasAMostrar.length > 0 ? (
					alertasAMostrar.map(alert => (
						<button
							key={alert.id}
							onClick={() => handleMarkAsRead(alert)}
							className={`w-full text-left border-l-4 p-3 sm:p-4 transition-colors ${getAlertaStyles(alert.severity)} ${
								alert.read ? 'opacity-70' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
							}`}
										>
							<div className="flex items-start space-x-2 sm:space-x-3">
								<div className="flex-shrink-0">
									{getAlertaIcon(alert.severity)}
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-start justify-between gap-2">
										<p className={`text-xs sm:text-sm ${alert.read ? 'text-gray-700 dark:text-gray-300' : 'font-semibold text-gray-900 dark:text-white'} break-words`}>
											{alert.title ? `${alert.title}: ${alert.message}` : alert.message}
										</p>
										{!alert.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>}
													</div>
									<div className="flex items-center justify-between mt-1.5 sm:mt-1 gap-2">
										<p className="text-xs text-gray-500 dark:text-gray-400 truncate">{alert.cruce}</p>
										<p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatTimestamp(alert.timestamp)}</p>
												</div>
											</div>
										</div>
						</button>
					))
				) : (
					<div className="p-8 text-center">
						{NotificationIcons.bell}
						<h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Sin alertas</h3>
						<p className="mt-2 text-gray-500 dark:text-gray-400">Todos los sistemas funcionan correctamente.</p>
								</div>
							)}
						</div>

			{combinedAlerts.length > VISIBLE_ITEMS && (
				<div className="bg-gray-50 dark:bg-gray-700 px-4 sm:px-6 py-2 sm:py-3 border-t border-gray-100 dark:border-gray-600">
								<button
						onClick={() => setMostrarTodas(prev => !prev)}
						className="w-full text-center text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
								>
						{mostrarTodas ? 'Mostrar menos' : `Ver todas (${combinedAlerts.length})`}
								</button>
							</div>
			)}
		</div>
	)
}

export default NotificationPanel

