import { useState, useEffect, useCallback } from 'react';
import { getTelemetria } from '../../services/telemetria';
import { useSocketSubscription } from '../../hooks/useSocketSubscription';

const TelemetriaView = ({ cruceId }) => {
	const [telemetria, setTelemetria] = useState(null);
	const [historial, setHistorial] = useState([]);
	const [loading, setLoading] = useState(true);

	// Handler para nuevas telemetrías
	const handleNewTelemetria = useCallback((data) => {
		if (data.cruce === cruceId || data.id_cruce === cruceId) {
			setTelemetria(data);
			setHistorial((prev) => [data, ...prev.slice(0, 19)]);
		}
	}, [cruceId]);

	// Cargar telemetría inicial
	useEffect(() => {
		const loadTelemetria = async () => {
			try {
				const response = await getTelemetria({ cruce: cruceId, page_size: 20 });
				const results = response.results || response || [];
				if (results.length > 0) {
					setTelemetria(results[0]);
					setHistorial(results);
				}
			} catch (error) {
				console.error('Error al cargar telemetría:', error);
			} finally {
				setLoading(false);
			}
		};

		loadTelemetria();
	}, [cruceId]);

	// Suscripción a telemetría en tiempo real
	useSocketSubscription({
		events: 'new_telemetria',
		handlers: handleNewTelemetria,
		cruceIds: cruceId,
		enabled: !!cruceId
	}, [cruceId, handleNewTelemetria]);

	if (loading) {
		return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Cargando telemetría...</div>;
	}

	if (!telemetria) {
		return <div className="text-center py-8 text-gray-500 dark:text-gray-400">No hay telemetría disponible</div>;
	}

	return (
		<div className="space-y-6">
			{/* Telemetría Actual */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
				<h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Telemetría Actual del ESP32</h3>
				
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
						<p className="text-sm text-gray-600 dark:text-gray-400">Voltaje Barrera</p>
						<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
							{telemetria.barrier_voltage || telemetria.voltaje_barrera || 'N/A'}V
						</p>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
							Estado: {telemetria.barrier_status === 'DOWN' || telemetria.estado_barrera === 'DOWN' ? '🔴 Abajo' : '🟢 Arriba'}
						</p>
					</div>

					<div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
						<p className="text-sm text-gray-600 dark:text-gray-400">Voltaje Batería</p>
						<p className="text-2xl font-bold text-green-600 dark:text-green-400">
							{telemetria.battery_voltage || telemetria.voltaje_bateria || 'N/A'}V
						</p>
						<p className={`text-xs mt-1 ${
							(telemetria.battery_voltage || telemetria.voltaje_bateria || 0) < 11.5 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
						}`}>
							{(telemetria.battery_voltage || telemetria.voltaje_bateria || 0) < 11.5 ? '⚠️ Batería Baja' : '✅ Normal'}
						</p>
					</div>

					<div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded">
						<p className="text-sm text-gray-600 dark:text-gray-400">Señal WiFi</p>
						<p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
							{telemetria.signal_strength || telemetria.senal_wifi || 'N/A'} dBm
						</p>
					</div>

					<div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded">
						<p className="text-sm text-gray-600 dark:text-gray-400">Temperatura</p>
						<p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
							{telemetria.temperature || telemetria.temperatura ? `${telemetria.temperature || telemetria.temperatura}°C` : 'N/A'}
						</p>
					</div>
				</div>

				{/* Sensores */}
				<div className="mt-6 grid grid-cols-4 gap-4">
					{telemetria.sensor_1 !== null && telemetria.sensor_1 !== undefined && (
						<div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
							<p className="text-xs text-gray-600 dark:text-gray-400">Sensor 1</p>
							<p className="text-lg font-semibold text-gray-900 dark:text-white">{telemetria.sensor_1}</p>
						</div>
					)}
					{telemetria.sensor_2 !== null && telemetria.sensor_2 !== undefined && (
						<div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
							<p className="text-xs text-gray-600 dark:text-gray-400">Sensor 2</p>
							<p className="text-lg font-semibold text-gray-900 dark:text-white">{telemetria.sensor_2}</p>
						</div>
					)}
					{telemetria.sensor_3 !== null && telemetria.sensor_3 !== undefined && (
						<div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
							<p className="text-xs text-gray-600 dark:text-gray-400">Sensor 3</p>
							<p className="text-lg font-semibold text-gray-900 dark:text-white">{telemetria.sensor_3}</p>
						</div>
					)}
					{telemetria.sensor_4 !== null && telemetria.sensor_4 !== undefined && (
						<div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
							<p className="text-xs text-gray-600 dark:text-gray-400">Sensor 4</p>
							<p className="text-lg font-semibold text-gray-900 dark:text-white">{telemetria.sensor_4}</p>
						</div>
					)}
				</div>

				<p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
					Última actualización: {new Date(telemetria.timestamp || telemetria.fecha_creacion).toLocaleString()}
				</p>
			</div>

			{/* Historial */}
			{historial.length > 0 && (
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
					<h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Historial Reciente</h3>
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha</th>
									<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Barrera (V)</th>
									<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Batería (V)</th>
									<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estado</th>
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
								{historial.map((item) => (
									<tr key={item.id}>
										<td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
											{new Date(item.timestamp || item.fecha_creacion).toLocaleString()}
										</td>
										<td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
											{item.barrier_voltage || item.voltaje_barrera || 'N/A'}V
										</td>
										<td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
											{item.battery_voltage || item.voltaje_bateria || 'N/A'}V
										</td>
										<td className="px-4 py-2 text-sm">
											<span className={`px-2 py-1 rounded ${
												(item.barrier_status || item.estado_barrera) === 'DOWN') 
													? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' 
													: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
											}`}>
												{(item.barrier_status || item.estado_barrera) === 'DOWN' ? 'Abajo' : 'Arriba'}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
};

export default TelemetriaView;

