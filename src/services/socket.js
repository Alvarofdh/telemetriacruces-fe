import { io } from 'socket.io-client';
import { getAccessToken } from './httpClient';

// ✅ CORRECCIÓN: Soportar VITE_SOCKETIO_URL o derivar de VITE_API_BASE_URL
const SOCKETIO_URL = import.meta.env.VITE_SOCKETIO_URL || 
	(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');

let socket = null;

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
		console.log('✅ [Socket.IO] Conectado - Socket ID:', socket.id);
		console.log('   📊 Estado:', socket.connected ? 'Conectado' : 'Desconectado');
	});

	// Evento: Autenticación exitosa (evento personalizado del backend)
	socket.on('connected', (data) => {
		console.log('✅ [Socket.IO] Autenticado exitosamente:', data);
		if (data?.user) {
			console.log('   👤 Usuario:', data.user.email || data.user.username, `(ID: ${data.user.id})`);
		}
	});

	// Evento: Confirmación de suscripción
	socket.on('subscribed', (data) => {
		console.log('✅ [Socket.IO] Suscrito a eventos:', data.events || data);
	});

	// Evento: Confirmación de unión a sala
	socket.on('joined_room', (data) => {
		console.log('✅ [Socket.IO] Unido a sala:', data.room || data);
	});

	// Evento: Desconexión
	socket.on('disconnect', (reason, details) => {
		console.log('❌ [Socket.IO] Desconectado:', reason);
		if (socket.active) {
			console.log('   🔄 Reconexión automática activada');
		} else {
			console.log('   ⚠️ Reconexión manual requerida');
		}
	});

	// Evento: Error de conexión
	socket.on('connect_error', (error) => {
		console.error('❌ [Socket.IO] Error de conexión:', error.message);
		if (socket.active) {
			console.log('   🔄 Intentando reconectar automáticamente...');
		} else {
			console.error('   ⚠️ La conexión fue denegada por el servidor');
			console.error('   💡 Debes llamar manualmente a socket.connect() para reconectar');
		}
		// Mensajes más descriptivos según manual
		if (error.message?.includes('token') || error.message?.includes('auth') || error.message?.includes('403')) {
			console.error('   🔑 Token inválido o expirado. Por favor, inicia sesión nuevamente.');
		} else if (error.message?.includes('CORS')) {
			console.error('   🌐 Error de CORS. Verifica la configuración del servidor.');
		} else if (error.message?.includes('timeout')) {
			console.error('   ⏱️ Timeout de conexión. Verifica que el servidor esté corriendo.');
		}
	});

	// Evento: Error general (evento personalizado del backend)
	socket.on('error', (data) => {
		console.error('❌ [Socket.IO] Error:', data);
	});

	return socket;
};

export const disconnectSocket = () => {
	if (socket) {
		console.log('🔌 [Socket.IO] Desconectando socket...');
		// Remover todos los listeners antes de desconectar para evitar memory leaks
		socket.removeAllListeners();
		socket.disconnect();
		socket = null;
	}
};

export const getSocket = () => socket;

// Eventos de Socket.IO
export const socketEvents = {
	// Escuchar confirmación de conexión autenticada
	// IMPORTANTE: Este handler se puede registrar múltiples veces, pero socket.on() maneja esto
	// Si necesitas evitar duplicados, usa socket.off() antes o verifica si ya está registrado
	onConnected: (callback) => {
		if (socket) {
			// Remover listener previo si existe para evitar duplicados
			socket.off('connected', callback);
			socket.on('connected', (data) => {
				console.log('✅ [Socket.IO] Evento connected recibido:', data);
				callback(data);
			});
		}
	},
	
	// Escuchar confirmación de suscripción
	onSubscribed: (callback) => {
		if (socket) {
			// Remover listener previo para evitar duplicados
			socket.off('subscribed', callback);
			socket.on('subscribed', (data) => {
				console.log('✅ [Socket.IO] Evento subscribed recibido:', data);
				callback(data);
			});
		}
	},
	
	// Escuchar confirmación de unión a sala
	onJoinedRoom: (callback) => {
		if (socket) {
			// Remover listener previo para evitar duplicados
			socket.off('joined_room', callback);
			socket.on('joined_room', (data) => {
				console.log('✅ [Socket.IO] Evento joined_room recibido:', data);
				callback(data);
			});
		}
	},
	
	// Escuchar nuevas alertas (estructura: { type: 'alerta', data: {...}, timestamp: '...' })
	onNewAlerta: (callback) => {
		if (socket) {
			socket.on('new_alerta', (eventData) => {
				console.log('🚨 [Socket.IO] Evento new_alerta recibido:', eventData);
				// Extraer data.data según estructura del backend
				const alertaData = eventData.data || eventData;
				callback(alertaData);
			});
		}
	},
	
	// Escuchar alertas resueltas (estructura: { type: 'alerta_resuelta', data: {...}, timestamp: '...' })
	onAlertaResolved: (callback) => {
		if (socket) {
			socket.on('alerta_resolved', (eventData) => {
				// Extraer data.data según estructura del backend
				const alertaData = eventData.data || eventData;
				callback(alertaData);
			});
		}
	},
	
	// Escuchar nueva telemetría (estructura: { type: 'telemetria', data: {...}, timestamp: '...' })
	onNewTelemetria: (callback) => {
		if (socket) {
			socket.on('new_telemetria', (eventData) => {
				console.log('📊 [Socket.IO] Evento new_telemetria recibido:', eventData);
				// Extraer data.data según estructura del backend
				const telemetriaData = eventData.data || eventData;
				callback(telemetriaData);
			});
		}
	},
	
	// Escuchar eventos de barrera (estructura: { type: 'barrier_event', data: {...}, timestamp: '...' })
	onBarrierEvent: (callback) => {
		if (socket) {
			socket.on('barrier_event', (eventData) => {
				console.log('🚧 [Socket.IO] Evento barrier_event recibido:', eventData);
				// Extraer data.data según estructura del backend
				const barrierData = eventData.data || eventData;
				callback(barrierData);
			});
		}
	},
	
	// Escuchar actualizaciones de cruce (estructura: { type: 'cruce_update', data: {...}, timestamp: '...' })
	onCruceUpdate: (callback) => {
		if (socket) {
			socket.on('cruce_update', (eventData) => {
				console.log('🔄 [Socket.IO] Evento cruce_update recibido:', eventData);
				// Extraer data.data según estructura del backend
				const cruceData = eventData.data || eventData;
				callback(cruceData);
			});
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
	onNotification: (callback) => {
		if (socket) {
			socket.on('notification', (eventData) => {
				callback(eventData);
			});
		}
	},
	
	// Escuchar actualizaciones del dashboard
	onDashboardUpdate: (callback) => {
		if (socket) {
			socket.on('dashboard_update', (eventData) => {
				callback(eventData);
			});
		}
	},
	
	// Suscribirse a eventos específicos
	// IMPORTANTE: Según SOLUCION_CRUCE_UPDATE_FRONTEND.md
	// Para recibir eventos de cruce, debes suscribirte a 'cruce_{id}', no a 'cruce_update'
	subscribe: (events) => {
		if (socket && socket.connected) {
			console.log('📡 [Socket.IO] Suscribiéndose a eventos:', events);
			socket.emit('subscribe', { events });
		} else {
			console.warn('⚠️ [Socket.IO] No se puede suscribir - Socket no conectado');
		}
	},
	
	// Desuscribirse de eventos específicos
	unsubscribe: (events) => {
		if (socket && socket.connected) {
			console.log('📡 [Socket.IO] Desuscribiéndose de eventos:', events);
			socket.emit('unsubscribe', { events });
		} else {
			console.warn('⚠️ [Socket.IO] No se puede desuscribir - Socket no conectado');
		}
	},
	
	// Unirse a sala de un cruce específico
	joinCruceRoom: (cruceId) => {
		if (socket && socket.connected) {
			const room = `cruce_${cruceId}`;
			console.log('🚪 [Socket.IO] Uniéndose a sala:', room);
			socket.emit('join_room', { room });
		} else {
			console.warn('⚠️ [Socket.IO] No se puede unir a sala - Socket no conectado');
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
	removeAllListeners: (event) => {
		if (socket) {
			if (event) {
				socket.removeAllListeners(event);
			} else {
				socket.removeAllListeners();
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

