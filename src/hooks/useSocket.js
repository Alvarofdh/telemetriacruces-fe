import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * Hook personalizado para manejar conexión Socket.IO
 * Basado en la documentación oficial de Socket.IO v4 y el manual de integración
 * 
 * @param {string} token - Token JWT para autenticación
 * @param {object} options - Opciones adicionales de conexión
 * @returns {object} - { socket, connected, authenticated, error }
 */
export const useSocket = (token, options = {}) => {
	const [connected, setConnected] = useState(false);
	const [authenticated, setAuthenticated] = useState(false);
	const [error, setError] = useState(null);
	const socketRef = useRef(null);

	useEffect(() => {
		// Validar que haya token
		if (!token) {
			setError('Token JWT requerido');
			return;
		}

		// URL del servidor desde variables de entorno
		const serverUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

		// Crear conexión Socket.IO según manual de integración
		const socket = io(serverUrl, {
			path: import.meta.env.VITE_SOCKETIO_PATH || '/socket.io',
			// IMPORTANTE: Usar polling primero para mejor compatibilidad con CORS
			transports: ['polling', 'websocket'],
			// Autenticación JWT
			auth: {
				token: token
			},
			// Reconexión automática
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			reconnectionAttempts: 5,
			// Timeout
			timeout: 20000,
			// Opciones adicionales
			...options
		});

		socketRef.current = socket;

		// Evento: Conexión establecida
		const onConnect = () => {
			console.log('✅ Socket.IO conectado');
			setConnected(true);
			setError(null);
		};

		// Evento: Autenticación exitosa (evento personalizado del servidor)
		const onConnected = (data) => {
			console.log('✅ Autenticado:', data.user);
			setAuthenticated(true);
			setError(null);
		};

		// Evento: Desconexión
		const onDisconnect = (reason) => {
			console.log('❌ Desconectado:', reason);
			setConnected(false);
			setAuthenticated(false);
			
			// Si fue desconectado por el servidor (error de auth)
			if (reason === 'io server disconnect') {
				setError('Desconectado por el servidor (posible error de autenticación)');
			}
		};

		// Evento: Error de conexión con mensajes más descriptivos
		const onConnectError = (err) => {
			console.error('❌ Error de conexión:', err);
			let errorMsg = err.message || 'Error desconocido';
			
			// Mensajes más descriptivos según el manual
			if (errorMsg.includes('websocket')) {
				errorMsg = 'Error de WebSocket. Intentando con polling...';
			} else if (errorMsg.includes('CORS')) {
				errorMsg = 'Error de CORS. Verifica la configuración del servidor.';
			} else if (errorMsg.includes('timeout')) {
				errorMsg = 'Timeout de conexión. Verifica que el servidor esté corriendo.';
			} else if (errorMsg.includes('403')) {
				errorMsg = 'Error 403: Token inválido o expirado.';
			}
			
			setError(errorMsg);
			setConnected(false);
		};

		// Evento: Error general
		const onError = (data) => {
			console.error('❌ Error:', data);
			setError(data.message || 'Error desconocido');
		};

		// Registrar event listeners
		socket.on('connect', onConnect);
		socket.on('connected', onConnected);
		socket.on('disconnect', onDisconnect);
		socket.on('connect_error', onConnectError);
		socket.on('error', onError);

		// Cleanup al desmontar
		return () => {
			if (socket.connected) {
				socket.disconnect();
			}
		};
	}, [token, options]);

	return {
		socket: socketRef.current,
		connected,
		authenticated,
		error
	};
};

