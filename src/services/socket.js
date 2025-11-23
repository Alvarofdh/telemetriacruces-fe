import { io } from 'socket.io-client';
import { getAccessToken } from './httpClient';

// ✅ CORRECCIÓN: Soportar VITE_SOCKETIO_URL o derivar de VITE_API_BASE_URL
const SOCKETIO_URL = import.meta.env.VITE_SOCKETIO_URL || 
	(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');

const DEBUG = import.meta.env.VITE_DEBUG_MODE === 'true';

// Helper para logging condicional (solo en modo debug)
const debugLog = (...args) => {
	if (DEBUG) {
		console.log(...args);
	}
};

const debugWarn = (...args) => {
	if (DEBUG) {
		console.warn(...args);
	}
};

// Los errores siempre se muestran (son críticos)
const debugError = (...args) => {
	console.error(...args);
};

let socket = null;

// ✅ CORRECCIÓN: Guardar referencias de handlers para poder removerlos correctamente
const handlerRefs = new Map();

/**
 * Conectar a Socket.IO con autenticación JWT
 * Según manual de integración: usar polling primero para mejor compatibilidad
 */
export const connectSocket = (token) => {
	if (socket?.connected) {
		return socket;
	}

	// Si no se pasa token, intentar obtenerlo del localStorage
	const authToken = token || getAccessToken();

	socket = io(SOCKETIO_URL, {
		path: import.meta.env.VITE_SOCKETIO_PATH || '/socket.io',
		// IMPORTANTE: Polling primero según manual de integración
		transports: ['polling', 'websocket'],
		auth: {
			token: authToken, // Token JWT requerido
		},
		reconnection: true,
		reconnectionDelay: 1000,
		reconnectionDelayMax: 5000,
		reconnectionAttempts: 5,
		timeout: 20000,
	});

	// IMPORTANTE: Según documentación oficial, los handlers deben registrarse FUERA del handler de connect
	// para evitar que se registren múltiples veces en cada reconexión
	
	// Evento: Conexión establecida (se dispara en conexión inicial Y reconexión)
	socket.on('connect', () => {
		debugLog('✅ [Socket.IO] Conectado - Socket ID:', socket.id);
		debugLog('   📊 Estado:', socket.connected ? 'Conectado' : 'Desconectado');
	});

	// Evento: Autenticación exitosa (evento personalizado del backend)
	socket.on('connected', (data) => {
		debugLog('✅ [Socket.IO] Autenticado exitosamente:', data);
		if (data?.user) {
			debugLog('   👤 Usuario:', data.user.email || data.user.username, `(ID: ${data.user.id})`);
		}
	});

	// Evento: Confirmación de suscripción
	socket.on('subscribed', (data) => {
		debugLog('✅ [Socket.IO] Suscrito a eventos:', data.events || data);
	});

	// Evento: Confirmación de unión a sala
	socket.on('joined_room', (data) => {
		debugLog('✅ [Socket.IO] Unido a sala:', data.room || data);
	});

	// Evento: Desconexión
	socket.on('disconnect', (reason, details) => {
		debugLog('❌ [Socket.IO] Desconectado:', reason);
		if (socket.active) {
			debugLog('   🔄 Reconexión automática activada');
		} else {
			debugWarn('   ⚠️ Reconexión manual requerida');
		}
	});

	// Evento: Error de conexión
	socket.on('connect_error', (error) => {
		debugError('❌ [Socket.IO] Error de conexión:', error.message);
		if (socket.active) {
			debugLog('   🔄 Intentando reconectar automáticamente...');
		} else {
			debugError('   ⚠️ La conexión fue denegada por el servidor');
			debugError('   💡 Debes llamar manualmente a socket.connect() para reconectar');
		}
		// Mensajes más descriptivos según manual
		if (error.message?.includes('token') || error.message?.includes('auth') || error.message?.includes('403')) {
			debugError('   🔑 Token inválido o expirado. Por favor, inicia sesión nuevamente.');
		} else if (error.message?.includes('CORS')) {
			debugError('   🌐 Error de CORS. Verifica la configuración del servidor.');
		} else if (error.message?.includes('timeout')) {
			debugError('   ⏱️ Timeout de conexión. Verifica que el servidor esté corriendo.');
		}
	});

	// Evento: Error general (evento personalizado del backend)
	socket.on('error', (data) => {
		debugError('❌ [Socket.IO] Error:', data);
	});

	return socket;
};

export const disconnectSocket = () => {
	if (socket) {
		debugLog('🔌 [Socket.IO] Desconectando socket...');
		// Remover todos los listeners antes de desconectar para evitar memory leaks
		socket.removeAllListeners();
		handlerRefs.clear(); // ✅ CORRECCIÓN: Limpiar referencias al desconectar
		socket.disconnect();
		socket = null;
	}
};

export const getSocket = () => socket;

// Eventos de Socket.IO
export const socketEvents = {
	// Escuchar confirmación de conexión autenticada
	// ✅ CORRECCIÓN: Guardar referencia del handler wrapper para poder removerlo correctamente
	onConnected: (callback) => {
		if (socket) {
			const key = 'connected';
			// Remover listener previo usando la referencia guardada
			const prevHandler = handlerRefs.get(key);
			if (prevHandler) {
				socket.off(key, prevHandler);
			}
			// Crear nuevo handler wrapper
			const handler = (data) => {
				debugLog('✅ [Socket.IO] Evento connected recibido:', data);
				callback(data);
			};
			// Guardar referencia y registrar
			handlerRefs.set(key, handler);
			socket.on(key, handler);
		}
	},
	
	// Escuchar confirmación de suscripción
	// ✅ CORRECCIÓN: Guardar referencia del handler wrapper
	onSubscribed: (callback) => {
		if (socket) {
			const key = 'subscribed';
			const prevHandler = handlerRefs.get(key);
			if (prevHandler) {
				socket.off(key, prevHandler);
			}
			const handler = (data) => {
				debugLog('✅ [Socket.IO] Evento subscribed recibido:', data);
				callback(data);
			};
			handlerRefs.set(key, handler);
			socket.on(key, handler);
		}
	},
	
	// Escuchar confirmación de unión a sala
	// ✅ CORRECCIÓN: Guardar referencia del handler wrapper
	onJoinedRoom: (callback) => {
		if (socket) {
			const key = 'joined_room';
			const prevHandler = handlerRefs.get(key);
			if (prevHandler) {
				socket.off(key, prevHandler);
			}
			const handler = (data) => {
				debugLog('✅ [Socket.IO] Evento joined_room recibido:', data);
				callback(data);
			};
			handlerRefs.set(key, handler);
			socket.on(key, handler);
		}
	},
	
	// Escuchar nuevas alertas (estructura: { type: 'alerta', data: {...}, timestamp: '...' })
	// ✅ CORRECCIÓN: Guardar referencia del handler wrapper
	onNewAlerta: (callback) => {
		if (socket) {
			const key = 'new_alerta';
			const prevHandler = handlerRefs.get(key);
			if (prevHandler) {
				socket.off(key, prevHandler);
			}
			const handler = (eventData) => {
				debugLog('🚨 [Socket.IO] Evento new_alerta recibido:', eventData);
				const alertaData = eventData.data || eventData;
				callback(alertaData);
			};
			handlerRefs.set(key, handler);
			socket.on(key, handler);
		}
	},
	
	// Escuchar alertas resueltas (estructura: { type: 'alerta_resuelta', data: {...}, timestamp: '...' })
	// ✅ CORRECCIÓN: Guardar referencia del handler wrapper
	onAlertaResolved: (callback) => {
		if (socket) {
			const key = 'alerta_resolved';
			const prevHandler = handlerRefs.get(key);
			if (prevHandler) {
				socket.off(key, prevHandler);
			}
			const handler = (eventData) => {
				const alertaData = eventData.data || eventData;
				callback(alertaData);
			};
			handlerRefs.set(key, handler);
			socket.on(key, handler);
		}
	},
	
	// Escuchar nueva telemetría (estructura: { type: 'telemetria', data: {...}, timestamp: '...' })
	// ✅ CORRECCIÓN: Guardar referencia del handler wrapper
	onNewTelemetria: (callback) => {
		if (socket) {
			const key = 'new_telemetria';
			const prevHandler = handlerRefs.get(key);
			if (prevHandler) {
				socket.off(key, prevHandler);
			}
			const handler = (eventData) => {
				debugLog('📊 [Socket.IO] Evento new_telemetria recibido:', eventData);
				const telemetriaData = eventData.data || eventData;
				callback(telemetriaData);
			};
			handlerRefs.set(key, handler);
			socket.on(key, handler);
		}
	},
	
	// Escuchar eventos de barrera (estructura: { type: 'barrier_event', data: {...}, timestamp: '...' })
	// ✅ CORRECCIÓN: Guardar referencia del handler wrapper
	onBarrierEvent: (callback) => {
		if (socket) {
			const key = 'barrier_event';
			const prevHandler = handlerRefs.get(key);
			if (prevHandler) {
				socket.off(key, prevHandler);
			}
			const handler = (eventData) => {
				debugLog('🚧 [Socket.IO] Evento barrier_event recibido:', eventData);
				const barrierData = eventData.data || eventData;
				callback(barrierData);
			};
			handlerRefs.set(key, handler);
			socket.on(key, handler);
		}
	},
	
	// Escuchar actualizaciones de cruce (estructura: { type: 'cruce_update', data: {...}, timestamp: '...' })
	// ✅ CORRECCIÓN: Guardar referencia del handler wrapper
	onCruceUpdate: (callback) => {
		if (socket) {
			const key = 'cruce_update';
			const prevHandler = handlerRefs.get(key);
			if (prevHandler) {
				socket.off(key, prevHandler);
			}
			const handler = (eventData) => {
				debugLog('🔄 [Socket.IO] Evento cruce_update recibido:', eventData);
				const cruceData = eventData.data || eventData;
				callback(cruceData);
			};
			handlerRefs.set(key, handler);
			socket.on(key, handler);
		}
	},
	
	// ⚠️ NOTA: Los siguientes eventos NO están implementados en el backend actual
	// El backend solo emite: cruce_update, new_telemetria, barrier_event, new_alerta, alerta_resolved
	// Estos listeners están comentados para evitar confusión. Si el backend implementa estos eventos,
	// descomentar y actualizar los handlers en DataContext.jsx
	
	/*
	// Escuchar cuando se crea un nuevo cruce (NO IMPLEMENTADO EN BACKEND)
	onCruceCreated: (callback) => {
		if (socket) {
			socket.on('cruce_created', (eventData) => {
				const cruceData = eventData.data || eventData;
				callback(cruceData);
			});
		}
	},
	
	// Escuchar cuando se actualiza un cruce (NO IMPLEMENTADO EN BACKEND)
	onCruceUpdated: (callback) => {
		if (socket) {
			socket.on('cruce_updated', (eventData) => {
				const cruceData = eventData.data || eventData;
				callback(cruceData);
			});
		}
	},
	
	// Escuchar cuando se elimina un cruce (NO IMPLEMENTADO EN BACKEND)
	onCruceDeleted: (callback) => {
		if (socket) {
			socket.on('cruce_deleted', (eventData) => {
				const data = eventData.data || eventData;
				callback(data);
			});
		}
	},
	
	// Escuchar actualización de lista completa de cruces (NO IMPLEMENTADO EN BACKEND)
	onCrucesListUpdated: (callback) => {
		if (socket) {
			socket.on('cruces_list_updated', (eventData) => {
				callback(eventData);
			});
		}
	},
	
	// Escuchar actualizaciones de sensores (NO IMPLEMENTADO EN BACKEND)
	onSensoresUpdated: (callback) => {
		if (socket) {
			socket.on('sensores_updated', (eventData) => {
				const data = eventData.data || eventData;
				callback(data);
			});
		}
	},
	*/
	
	// Escuchar notificaciones generales
	// ✅ CORRECCIÓN: Guardar referencia del handler wrapper
	onNotification: (callback) => {
		if (socket) {
			const key = 'notification';
			const prevHandler = handlerRefs.get(key);
			if (prevHandler) {
				socket.off(key, prevHandler);
			}
			const handler = (eventData) => {
				callback(eventData);
			};
			handlerRefs.set(key, handler);
			socket.on(key, handler);
		}
	},
	
	// Escuchar actualizaciones del dashboard
	// ✅ CORRECCIÓN: Guardar referencia del handler wrapper
	onDashboardUpdate: (callback) => {
		if (socket) {
			const key = 'dashboard_update';
			const prevHandler = handlerRefs.get(key);
			if (prevHandler) {
				socket.off(key, prevHandler);
			}
			const handler = (eventData) => {
				callback(eventData);
			};
			handlerRefs.set(key, handler);
			socket.on(key, handler);
		}
	},
	
	// Suscribirse a eventos específicos
	// IMPORTANTE: Según SOLUCION_CRUCE_UPDATE_FRONTEND.md
	// Para recibir eventos de cruce, debes suscribirte a 'cruce_{id}', no a 'cruce_update'
	subscribe: (events) => {
		if (socket && socket.connected) {
			debugLog('📡 [Socket.IO] Suscribiéndose a eventos:', events);
			socket.emit('subscribe', { events });
		} else {
			debugWarn('⚠️ [Socket.IO] No se puede suscribir - Socket no conectado');
		}
	},
	
	// Desuscribirse de eventos específicos
	unsubscribe: (events) => {
		if (socket && socket.connected) {
			debugLog('📡 [Socket.IO] Desuscribiéndose de eventos:', events);
			socket.emit('unsubscribe', { events });
		} else {
			debugWarn('⚠️ [Socket.IO] No se puede desuscribir - Socket no conectado');
		}
	},
	
	// Unirse a sala de un cruce específico
	joinCruceRoom: (cruceId) => {
		if (socket && socket.connected) {
			const room = `cruce_${cruceId}`;
			debugLog('🚪 [Socket.IO] Uniéndose a sala:', room);
			socket.emit('join_room', { room });
		} else {
			debugWarn('⚠️ [Socket.IO] No se puede unir a sala - Socket no conectado');
		}
	},
	
	// Salir de sala de un cruce
	leaveCruceRoom: (cruceId) => {
		if (socket) {
			socket.emit('leave_room', { room: `cruce_${cruceId}` });
		}
	},
	
	// Health check
	ping: () => {
		if (socket) {
			socket.emit('ping');
		}
	},
	
	// Escuchar pong
	onPong: (callback) => {
		if (socket) {
			socket.on('pong', callback);
		}
	},
	
	// Remover listeners
	// IMPORTANTE: Para remover un listener, debe ser la misma referencia de función
	// Si usaste socketEvents.onX(callback), debes pasar el mismo callback a off()
	off: (event, callback) => {
		if (socket) {
			// Remover el listener específico
			socket.off(event, callback);
			// También intentar remover sin callback para asegurar limpieza completa
			// (esto removerá todos los listeners de ese evento si callback no coincide)
			if (!callback) {
				socket.removeAllListeners(event);
			}
		}
	},
	
	// Remover todos los listeners de un evento específico
	// ✅ CORRECCIÓN: Limpiar referencias guardadas al remover listeners
	removeAllListeners: (event) => {
		if (socket) {
			if (event) {
				socket.removeAllListeners(event);
				handlerRefs.delete(event);
			} else {
				socket.removeAllListeners();
				handlerRefs.clear();
			}
		}
	},
	
	// Verificar si está conectado
	isConnected: () => {
		return socket?.connected || false;
	},
	
	// Obtener Socket ID (según documentación: es efímero, solo para debugging)
	getSocketId: () => {
		return socket?.id || null;
	},
	
	// Verificar si el socket está activo (intentará reconectar automáticamente)
	isActive: () => {
		return socket?.active || false;
	},
	
	// Obtener referencia al Manager (para eventos de reconexión)
	getManager: () => {
		return socket?.io || null;
	},
};

