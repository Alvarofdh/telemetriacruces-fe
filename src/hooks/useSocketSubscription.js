import { useEffect, useRef, useCallback } from 'react'
import { socketEvents, getSocket } from '../services/socket'

const DEBUG = import.meta.env.VITE_DEBUG_MODE === 'true'

/**
 * Hook personalizado para manejar suscripciones de Socket.IO con cleanup automático
 * Simplifica el manejo de listeners, rooms y cleanup
 * 
 * @param {Object} options - Opciones de configuración
 * @param {string|string[]} options.events - Eventos a escuchar
 * @param {Function|Object} options.handlers - Handlers (función única o objeto {event: handler})
 * @param {number|number[]} options.cruceIds - IDs de cruces para unirse a sus rooms
 * @param {string|string[]} options.rooms - Salas adicionales a las que unirse
 * @param {boolean} options.enabled - Si la suscripción está habilitada
 * @param {Array} deps - Dependencias para re-ejecutar el efecto
 * 
 * @example
 * useSocketSubscription({
 *   events: 'new_alerta',
 *   handlers: (data) => setAlertas(prev => [...prev, data])
 * })
 */
export const useSocketSubscription = (options = {}, deps = []) => {
	const {
		events = [],
		handlers = null,
		cruceIds = [],
		rooms = [],
		enabled = true
	} = options

	const handlersRef = useRef(handlers)
	const cleanupFunctionsRef = useRef([])

	// Actualizar referencia de handlers
	useEffect(() => {
		handlersRef.current = handlers
	}, [handlers])

	useEffect(() => {
		if (!enabled) {
			return
		}

		const socket = getSocket()
		if (!socket) {
			if (DEBUG) {
				console.warn('⚠️ [useSocketSubscription] Socket no disponible')
			}
			return
		}

		const cleanupFunctions = []

		// Normalizar eventos
		const eventsArray = Array.isArray(events) ? events : (events ? [events] : [])
		if (eventsArray.length === 0 || !handlersRef.current) {
			return
		}

		// Normalizar handlers
		const isSingleHandler = typeof handlersRef.current === 'function'
		const handlersMap = isSingleHandler
			? eventsArray.reduce((acc, event) => {
				acc[event] = handlersRef.current
				return acc
			}, {})
			: handlersRef.current

		// Registrar listeners usando métodos específicos de socketEvents cuando sea posible
		eventsArray.forEach(event => {
			const handler = handlersMap[event]
			if (!handler) return

			// Mapeo de eventos a métodos de socketEvents
			const eventMethodMap = {
				'notification': 'onNotification',
				'new_alerta': 'onNewAlerta',
				'alerta_resolved': 'onAlertaResolved',
				'new_telemetria': 'onNewTelemetria',
				'cruce_update': 'onCruceUpdate',
				'barrier_event': 'onBarrierEvent',
				'dashboard_update': 'onDashboardUpdate'
			}

			const methodName = eventMethodMap[event]
			if (methodName && socketEvents[methodName]) {
				// Usar método específico de socketEvents
				socketEvents[methodName](handler)
				cleanupFunctions.push(() => {
					// Usar removeAllListeners para asegurar limpieza completa
					socketEvents.removeAllListeners(event)
				})
			} else {
				// Fallback: usar socket.on directamente
				socket.on(event, handler)
				cleanupFunctions.push(() => {
					socket.off(event, handler)
				})
			}
		})

		// Unirse a rooms de cruces
		const cruceIdsArray = Array.isArray(cruceIds) ? cruceIds : (cruceIds ? [cruceIds] : [])
		cruceIdsArray.forEach(id => {
			if (id) {
				socketEvents.joinCruceRoom(id)
				cleanupFunctions.push(() => {
					socketEvents.leaveCruceRoom(id)
				})
			}
		})

		// Unirse a rooms adicionales
		const roomsArray = Array.isArray(rooms) ? rooms : (rooms ? [rooms] : [])
		roomsArray.forEach(room => {
			if (room) {
				socket.emit('join_room', { room })
				cleanupFunctions.push(() => {
					socket.emit('leave_room', { room })
				})
			}
		})

		if (DEBUG && (eventsArray.length > 0 || cruceIdsArray.length > 0 || roomsArray.length > 0)) {
			console.log('✅ [useSocketSubscription] Suscrito:', {
				events: eventsArray,
				cruceIds: cruceIdsArray,
				rooms: roomsArray
			})
		}

		cleanupFunctionsRef.current = cleanupFunctions

		// Cleanup
		return () => {
			cleanupFunctions.forEach(cleanup => {
				try {
					cleanup()
				} catch (error) {
					if (DEBUG) {
						console.error('❌ [useSocketSubscription] Error en cleanup:', error)
					}
				}
			})
			cleanupFunctionsRef.current = []
		}
	}, [enabled, JSON.stringify(events), JSON.stringify(cruceIds), JSON.stringify(rooms), ...deps])
}

