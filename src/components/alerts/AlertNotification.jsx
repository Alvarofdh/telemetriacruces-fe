import { useEffect, useState } from 'react';
import { socketEvents } from '../../../services/socket';

const AlertNotification = ({ token }) => {
	const [alerts, setAlerts] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		if (!token) return;

		// Escuchar nuevas alertas
		const handleNewAlerta = (data) => {
			setAlerts((prev) => [data, ...prev]);
			setUnreadCount((prev) => prev + 1);
			
			// Mostrar notificación del navegador
			if ('Notification' in window && Notification.permission === 'granted') {
				new Notification(`Nueva Alerta: ${data.type_display || data.tipo}`, {
					body: data.description || data.descripcion,
					icon: '/icon.png',
					tag: `alerta-${data.id}`,
				});
			}
		};

		// Escuchar alertas resueltas
		const handleAlertaResolved = (data) => {
			setAlerts((prev) =>
				prev.map((alert) =>
					alert.id === data.id ? { ...alert, resolved: true } : alert
				)
			);
		};

		socketEvents.onNewAlerta(handleNewAlerta);
		socketEvents.onAlertaResolved(handleAlertaResolved);

		// Solicitar permiso para notificaciones
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission();
		}

		return () => {
			socketEvents.off('new_alerta', handleNewAlerta);
			socketEvents.off('alerta_resolved', handleAlertaResolved);
		};
	}, [token]);

	const markAsRead = (alertId) => {
		setAlerts((prev) =>
			prev.map((alert) =>
				alert.id === alertId ? { ...alert, read: true } : alert
			)
		);
		setUnreadCount((prev) => Math.max(0, prev - 1));
	};

	return (
		<div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
			{/* Contador de no leídas */}
			{unreadCount > 0 && (
				<div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
					{unreadCount} alertas no leídas
				</div>
			)}

			{/* Lista de alertas recientes */}
			<div className="space-y-2 max-h-96 overflow-y-auto">
				{alerts.slice(0, 5).map((alert) => (
					<div
						key={alert.id}
						onClick={() => markAsRead(alert.id)}
						className={`p-4 rounded-lg shadow-lg cursor-pointer transition-all ${
							alert.severity === 'CRITICAL' || alert.severidad === 'CRITICAL'
								? 'bg-red-100 border-l-4 border-red-500 dark:bg-red-900/20 dark:border-red-400'
								: alert.severity === 'WARNING' || alert.severidad === 'WARNING'
								? 'bg-yellow-100 border-l-4 border-yellow-500 dark:bg-yellow-900/20 dark:border-yellow-400'
								: 'bg-blue-100 border-l-4 border-blue-500 dark:bg-blue-900/20 dark:border-blue-400'
						} ${!alert.read ? 'ring-2 ring-offset-2 ring-red-500' : ''}`}
					>
						<div className="flex justify-between items-start">
							<div>
								<h4 className="font-bold text-sm text-gray-900 dark:text-white">
									{alert.type_display || alert.tipo || 'Alerta'}
								</h4>
								<p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
									{alert.description || alert.descripcion}
								</p>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									{alert.cruce_nombre || alert.cruce?.nombre || 'N/A'} - {new Date(alert.created_at || alert.fecha_creacion).toLocaleString()}
								</p>
							</div>
							{!alert.read && (
								<div className="w-3 h-3 bg-red-500 rounded-full"></div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default AlertNotification;

