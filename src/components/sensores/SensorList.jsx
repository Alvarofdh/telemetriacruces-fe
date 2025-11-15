import { useState, useEffect } from 'react';
import { sensoresAPI } from '../../services/api';

const SensorList = ({ cruceId }) => {
	const [sensores, setSensores] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadSensores = async () => {
			try {
				const response = await sensoresAPI.getByCruce(cruceId);
				setSensores(response.data.results || response.data || []);
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
					className={`p-3 rounded border-l-4 ${
						sensor.activo
							? 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-400'
							: 'bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600'
					}`}
				>
					<div className="flex justify-between items-start">
						<div>
							<h4 className="font-semibold text-gray-900 dark:text-white">{sensor.nombre}</h4>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								{sensor.get_tipo_display || sensor.tipo_display || sensor.tipo}
							</p>
							{sensor.descripcion && (
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sensor.descripcion}</p>
							)}
						</div>
						<span
							className={`px-2 py-1 rounded text-xs ${
								sensor.activo
									? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
									: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
							}`}
						>
							{sensor.activo ? 'Activo' : 'Inactivo'}
						</span>
					</div>
				</div>
			))}
		</div>
	);
};

export default SensorList;

