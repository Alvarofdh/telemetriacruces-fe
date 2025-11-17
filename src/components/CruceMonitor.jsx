import React, { useEffect, useState } from 'react';
import { getSocket } from '../services/socket';
import { crucesAPI, telemetriaAPI, alertasAPI } from '../services/api';
import { getBarrierEvents } from '../services/barrierEvents';
import '../assets/styles/CruceMonitor.css';

/**
 * Componente para monitorear un cruce en tiempo real
 * Basado en el manual de integración Socket.IO
 * 
 * @param {number} cruceId - ID del cruce a monitorear
 */
const CruceMonitor = ({ cruceId }) => {
	// Usar la conexión Socket.IO compartida del DataContext
	const socket = getSocket();
	const [connected, setConnected] = useState(socket?.connected || false);
	const [error, setError] = useState(null);
	
	// Estados para datos en tiempo real
	const [cruceData, setCruceData] = useState(null);
	const [telemetrias, setTelemetrias] = useState([]);
	const [alertas, setAlertas] = useState([]);
	const [barrierEvents, setBarrierEvents] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState(null);

	// Cargar datos iniciales del cruce específico (solo una vez al montar)
	useEffect(() => {
		if (!cruceId) return;

		const loadCruceData = async () => {
			setIsLoading(true);
			setLoadError(null);

			try {
				// 1. Cargar información del cruce específico
				const cruceResponse = await crucesAPI.getById(cruceId);
				setCruceData(cruceResponse.data || cruceResponse);

				// 2. Cargar telemetría reciente solo de este cruce (filtrado en backend)
				try {
					const telemetriaResponse = await telemetriaAPI.getByCruce(cruceId, { 
						page: 1, 
						page_size: 10 
					});
					const telemetriaList = telemetriaResponse.data?.results || telemetriaResponse.data || telemetriaResponse.results || [];
					setTelemetrias(telemetriaList);
				} catch (err) {
					console.warn('⚠️ No se pudo cargar telemetría inicial:', err);
				}

				// 3. Cargar alertas activas solo de este cruce (filtrado en backend)
				try {
					const alertasResponse = await alertasAPI.getByCruce(cruceId, { 
						resolved: false, 
						page: 1, 
						page_size: 10 
					});
					const alertasList = alertasResponse.data?.results || alertasResponse.data || alertasResponse.results || [];
					setAlertas(alertasList);
				} catch (err) {
					console.warn('⚠️ No se pudo cargar alertas iniciales:', err);
				}

				// 4. Cargar eventos de barrera recientes solo de este cruce (filtrado en backend)
				try {
					const eventosResponse = await getBarrierEvents({ 
						cruce: cruceId, 
						page: 1, 
						page_size: 10 
					});
					const eventosList = eventosResponse.results || eventosResponse.data?.results || eventosResponse || [];
					setBarrierEvents(eventosList);
				} catch (err) {
					console.warn('⚠️ No se pudo cargar eventos de barrera iniciales:', err);
				}

			} catch (err) {
				console.error('❌ Error al cargar datos del cruce:', err);
				setLoadError(err.message || 'Error al cargar datos del cruce');
			} finally {
				setIsLoading(false);
			}
		};

		loadCruceData();
	}, [cruceId]); // Solo se ejecuta cuando cambia el cruceId

	// Verificar estado de conexión Socket.IO
	useEffect(() => {
		if (!socket) {
			setError('Socket.IO no está conectado. Por favor, inicia sesión.');
			return;
		}

		// Verificar estado de conexión
		const checkConnection = () => {
			setConnected(socket.connected);
		};

		// Listeners para estado de conexión
		const onConnect = () => {
			setConnected(true);
			setError(null);
		};

		const onDisconnect = () => {
			setConnected(false);
		};

		const onConnected = () => {
			setError(null);
		};

		const onConnectError = (err) => {
			setError(err.message || 'Error de conexión Socket.IO');
			setConnected(false);
		};

		socket.on('connect', onConnect);
		socket.on('disconnect', onDisconnect);
		socket.on('connected', onConnected);
		socket.on('connect_error', onConnectError);

		// Verificar estado inicial
		checkConnection();
		if (socket.connected) {
			// Si ya está conectado, verificar autenticación
			// El evento 'connected' se emitirá si ya está autenticado
		}

		return () => {
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisconnect);
			socket.off('connected', onConnected);
			socket.off('connect_error', onConnectError);
		};
	}, [socket]);

	// Configurar Socket.IO listeners (solo cuando está autenticado)
	useEffect(() => {
		// Solo proceder si hay socket y está conectado
		if (!socket || !connected) return;

		// CORRECCIÓN: Según SOLUCION_CRUCE_UPDATE_FRONTEND.md
		// El backend emite eventos de cruce a salas específicas: 'cruce_21', 'cruce_22', etc.
		// Debemos suscribirnos a la sala específica del cruce, NO a 'cruce_update' general
		
		// 1. Suscribirse a eventos generales
		const generalEvents = ['telemetria', 'barrier_events', 'alertas'];
		console.log('📡 [CruceMonitor] Suscribiéndose a eventos generales:', generalEvents);
		socket.emit('subscribe', {
			events: generalEvents
		});

		// 2. ✅ CORRECCIÓN CRÍTICA: Suscribirse a la sala específica del cruce
		// El backend emite 'cruce_update' a la sala 'cruce_{id}', no a 'cruce_update'
		const cruceRoom = `cruce_${cruceId}`;
		console.log(`📡 [CruceMonitor] Suscribiéndose a sala específica del cruce: ${cruceRoom}`);
		socket.emit('subscribe', {
			events: [cruceRoom]  // ✅ Esto es lo que faltaba: suscribirse a 'cruce_21'
		});

		// 3. Unirse a sala de notificaciones generales (opcional, el backend ya une automáticamente)
		console.log('🚪 [CruceMonitor] Uniéndose a sala: notifications');
		socket.emit('join_room', { 
			room: 'notifications' 
		});

		// === LISTENERS DE EVENTOS ===

		// Listener: Actualización de cruce
		const handleCruceUpdate = (data) => {
			console.log('🔄 Cruce actualizado:', data);
			const cruceInfo = data.data || data;
			if (cruceInfo && cruceInfo.id === cruceId) {
				setCruceData(cruceInfo);
			}
		};

		// Listener: Nueva telemetría
		const handleTelemetria = (data) => {
			console.log('📊 Nueva telemetría:', data);
			const telemetriaInfo = data.data || data;
			if (telemetriaInfo && telemetriaInfo.cruce === cruceId) {
				setTelemetrias(prev => [telemetriaInfo, ...prev].slice(0, 10)); // Mantener últimas 10
			}
		};

		// Listener: Nueva alerta
		const handleAlerta = (data) => {
			console.log('🚨 Nueva alerta:', data);
			const alertaInfo = data.data || data;
			if (alertaInfo && alertaInfo.cruce === cruceId) {
				setAlertas(prev => [alertaInfo, ...prev].slice(0, 10));
			}
		};

		// Listener: Alerta resuelta
		const handleAlertaResuelta = (data) => {
			console.log('✅ Alerta resuelta:', data);
			const alertaInfo = data.data || data;
			if (alertaInfo && alertaInfo.cruce === cruceId) {
				// Actualizar el estado de la alerta en la lista
				setAlertas(prev => prev.map(alerta => 
					alerta.id === alertaInfo.id 
						? { ...alerta, resolved: true }
						: alerta
				));
			}
		};

		// Listener: Evento de barrera
		const handleBarrierEvent = (data) => {
			console.log('🚧 Evento de barrera:', data);
			const barrierInfo = data.data || data;
			if (barrierInfo && barrierInfo.cruce === cruceId) {
				setBarrierEvents(prev => [barrierInfo, ...prev].slice(0, 10));
			}
		};

		// Listener: Notificación general
		const handleNotification = (data) => {
			console.log('🔔 Notificación:', data);
			// Aquí puedes mostrar una notificación toast/snackbar
		};

		// Listener: Confirmación de suscripción
		const handleSubscribed = (data) => {
			console.log('✅ [CruceMonitor] Suscripción confirmada:', data.events || data);
		};

		// Listener: Confirmación de unión a sala
		const handleJoinedRoom = (data) => {
			console.log('✅ [CruceMonitor] Unido a sala:', data.room || data);
		};

		// Registrar todos los listeners
		socket.on('cruce_update', handleCruceUpdate);
		socket.on('new_telemetria', handleTelemetria);
		socket.on('new_alerta', handleAlerta);
		socket.on('alerta_resolved', handleAlertaResuelta);
		socket.on('barrier_event', handleBarrierEvent);
		socket.on('notification', handleNotification);
		socket.on('subscribed', handleSubscribed);
		socket.on('joined_room', handleJoinedRoom);

		// IMPORTANTE: Cleanup - remover listeners al desmontar
		return () => {
			socket.off('cruce_update', handleCruceUpdate);
			socket.off('new_telemetria', handleTelemetria);
			socket.off('new_alerta', handleAlerta);
			socket.off('alerta_resolved', handleAlertaResuelta);
			socket.off('barrier_event', handleBarrierEvent);
			socket.off('notification', handleNotification);
			socket.off('subscribed', handleSubscribed);
			socket.off('joined_room', handleJoinedRoom);
			
			// ✅ Desuscribirse de la sala específica del cruce
			const cruceRoom = `cruce_${cruceId}`;
			console.log(`🚪 [CruceMonitor] Desuscribiéndose de sala: ${cruceRoom}`);
			socket.emit('unsubscribe', { 
				events: [cruceRoom] 
			});
			
			// Salir de las salas
			socket.emit('leave_room', { room: cruceRoom });
			socket.emit('leave_room', { room: 'notifications' });
		};
	}, [socket, connected, cruceId]);

	// === RENDERIZADO ===

	// Mostrar error de carga inicial
	if (loadError) {
		return (
			<div className="error-container">
				<h3>❌ Error al Cargar Datos</h3>
				<p>{loadError}</p>
				<button onClick={() => window.location.reload()}>
					Reintentar
				</button>
			</div>
		);
	}

	// Mostrar loading mientras se cargan los datos iniciales
	if (isLoading) {
		return (
			<div className="loading-container">
				<div className="spinner"></div>
				<p>Cargando información del cruce {cruceId}...</p>
			</div>
		);
	}

	// Mostrar error de conexión Socket.IO
	if (error) {
		return (
			<div className="error-container">
				<h3>❌ Error de Conexión Socket.IO</h3>
				<p>{error}</p>
				<p className="text-sm mt-2">Los datos iniciales se cargaron correctamente, pero la conexión en tiempo real falló.</p>
				<button onClick={() => window.location.reload()}>
					Reintentar
				</button>
			</div>
		);
	}

	if (!connected) {
		return (
			<div className="loading-container">
				<div className="spinner"></div>
				<p>Conectando al servidor...</p>
			</div>
		);
	}

	if (!connected) {
		return (
			<div className="loading-container">
				<div className="spinner"></div>
				<p>Conectando a Socket.IO...</p>
			</div>
		);
	}

	return (
		<div className="cruce-monitor">
			{/* Indicador de conexión */}
			<div className="status-indicator">
				<span className={connected ? 'connected' : 'disconnected'}>
					{connected ? '🟢 Conectado' : '🔴 Desconectado'}
				</span>
			</div>

			{/* Información del cruce */}
			{cruceData && (
				<div className="cruce-info">
					<h2>{cruceData.nombre}</h2>
					<p><strong>Ubicación:</strong> {cruceData.ubicacion}</p>
					<p><strong>Estado:</strong> <span className={`estado-badge ${cruceData.estado?.toLowerCase()}`}>{cruceData.estado}</span></p>
					<p><strong>Sensores Activos:</strong> {cruceData.sensores_activos}/{cruceData.total_sensores}</p>
					<p><strong>Alertas Activas:</strong> {cruceData.alertas_activas}</p>
					
					{/* Información de responsable */}
					{cruceData.responsable_nombre && (
						<div className="responsable-info">
							<h3>Responsable de Mantenimiento</h3>
							<p><strong>Nombre:</strong> {cruceData.responsable_nombre}</p>
							<p><strong>Empresa:</strong> {cruceData.responsable_empresa}</p>
							<p><strong>Teléfono:</strong> {cruceData.responsable_telefono}</p>
							<p><strong>Email:</strong> {cruceData.responsable_email}</p>
							<p><strong>Horario:</strong> {cruceData.responsable_horario}</p>
						</div>
					)}
				</div>
			)}

			{/* Telemetría en tiempo real */}
			<div className="telemetrias-section">
				<h3>📊 Telemetría en Tiempo Real</h3>
				{telemetrias.length === 0 ? (
					<p className="empty-message">Esperando datos de telemetría...</p>
				) : (
					<div className="telemetrias-list">
						{telemetrias.map((t, index) => (
							<div key={index} className="telemetria-item">
								<div className="telemetria-grid">
									<div>
										<label>Voltaje Barrera:</label>
										<span>{t.barrier_voltage}V</span>
									</div>
									<div>
										<label>Voltaje Batería:</label>
										<span>{t.battery_voltage}V</span>
									</div>
									<div>
										<label>Temperatura:</label>
										<span>{t.temperature}°C</span>
									</div>
									<div>
										<label>Señal:</label>
										<span>{t.signal_strength} dBm</span>
									</div>
								</div>
								<small>{new Date(t.timestamp).toLocaleString()}</small>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Alertas activas */}
			<div className="alertas-section">
				<h3>🚨 Alertas Recientes</h3>
				{alertas.length === 0 ? (
					<p className="empty-message">No hay alertas recientes</p>
				) : (
					<div className="alertas-list">
						{alertas.map((alerta, index) => (
							<div 
								key={index} 
								className={`alerta-item ${alerta.severity?.toLowerCase()} ${alerta.resolved ? 'resolved' : ''}`}
							>
								<div className="alerta-header">
									<span className="alerta-type">{alerta.type}</span>
									<span className="alerta-severity">{alerta.severity}</span>
									{alerta.resolved && <span className="alerta-resolved">✅ Resuelta</span>}
								</div>
								<p>{alerta.description}</p>
								<small>{new Date(alerta.created_at).toLocaleString()}</small>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Eventos de barrera */}
			<div className="barrier-events-section">
				<h3>🚧 Eventos de Barrera</h3>
				{barrierEvents.length === 0 ? (
					<p className="empty-message">No hay eventos de barrera recientes</p>
				) : (
					<div className="barrier-events-list">
						{barrierEvents.map((event, index) => (
							<div key={index} className={`barrier-event-item ${event.state?.toLowerCase()}`}>
								<span className="barrier-state">
									{event.state === 'DOWN' ? '⬇️ Barrera Abajo' : '⬆️ Barrera Arriba'}
								</span>
								<span className="barrier-voltage">{event.voltage_at_event}V</span>
								<small>{new Date(event.event_time).toLocaleString()}</small>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default CruceMonitor;

