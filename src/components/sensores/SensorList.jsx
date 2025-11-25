import { useState, useEffect } from 'react';
import { getSensores } from '../../services/sensores';
import { getCruce } from '../../services/cruces';
import { combineSensoresWithTelemetria, getSensorStatusColor } from '../../utils/telemetriaHelpers';

const SensorList = ({ cruceId }) => {
	const [sensores, setSensores] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadSensores = async () => {
			try {
				// ✅ CORRECCIÓN: Cargar sensores registrados y telemetría según la guía
				const sensoresResponse = await getSensores({ cruce: cruceId });
				const sensoresData = sensoresResponse.results || sensoresResponse || [];
				
				// Obtener telemetría actual del cruce
				const cruceData = await getCruce(cruceId);
				const telemetria = cruceData.telemetria_actual || {};
				
				// Combinar sensores registrados con valores de telemetría
				const sensoresCompletos = combineSensoresWithTelemetria(sensoresData, telemetria);
				
				setSensores(sensoresCompletos);
			} catch (error) {
				console.error('Error al cargar sensores:', error);
			} finally {
				setLoading(false);
			}
		};

		loadSensores();
	}, [cruceId]);

	if (loading) return <div className="text-center py-4 text-gray-600 dark:text-gray-400">Cargando sensores...</div>;

	if (sensores.length === 0) {
		return <div className="text-center py-4 text-gray-500 dark:text-gray-400">No hay sensores registrados</div>;
	}

	return (
		<div className="space-y-2">
			{sensores.map((sensor) => (
				<div
					key={sensor.id}
					className={`p-3 rounded border-l-4 ${getSensorStatusColor(sensor.estado || (sensor.activo ? 'funcionando' : 'inactivo'))}`}
				>
					<div className="flex justify-between items-start">
						<div className="flex-1">
							<h4 className="font-semibold text-gray-900 dark:text-white">{sensor.nombre}</h4>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								{sensor.get_tipo_display || sensor.tipo_display || sensor.tipo}
							</p>
							{sensor.descripcion && (
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sensor.descripcion}</p>
							)}
							{/* ✅ CORRECCIÓN: Mostrar valor actual del sensor si está disponible */}
							{sensor.valor_actual !== null && sensor.valor_actual !== undefined && (
								<p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
									Valor ADC: <span className="font-semibold">{sensor.valor_actual}</span>
								</p>
							)}
							{/* Mostrar estado completo según la guía */}
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
								{sensor.estado_display || (sensor.activo ? 'Activo' : 'Inactivo')}
							</p>
						</div>
						<div className="flex flex-col items-end space-y-1">
							<span
								className={`px-2 py-1 rounded text-xs ${
									sensor.activo
										? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
										: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
								}`}
							>
								{sensor.activo ? '✓ Activo' : '✗ Inactivo'}
							</span>
							{/* ✅ CORRECCIÓN: Mostrar indicador si está enviando datos */}
							{sensor.enviando_datos && (
								<span className="text-xs text-green-600 dark:text-green-400">● Enviando datos</span>
							)}
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

export default SensorList;

