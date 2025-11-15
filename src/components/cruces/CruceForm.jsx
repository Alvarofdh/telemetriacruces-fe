import { useState, useEffect } from 'react';
import { crucesAPI } from '../../services/api';

const CruceForm = ({ cruceId, onSuccess, onCancel }) => {
	const [formData, setFormData] = useState({
		nombre: '',
		ubicacion: '',
		coordenadas_lat: '',
		coordenadas_lng: '',
		estado: 'ACTIVO',
		responsable_nombre: '',
		responsable_telefono: '',
		responsable_email: '',
		responsable_empresa: '',
		responsable_horario: '',
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (cruceId) {
			// Cargar datos del cruce para editar
			crucesAPI.getById(cruceId)
				.then((response) => {
					const cruce = response.data;
					setFormData({
						nombre: cruce.nombre || '',
						ubicacion: cruce.ubicacion || '',
						coordenadas_lat: cruce.coordenadas_lat || '',
						coordenadas_lng: cruce.coordenadas_lng || '',
						estado: cruce.estado || 'ACTIVO',
						responsable_nombre: cruce.responsable_nombre || '',
						responsable_telefono: cruce.responsable_telefono || '',
						responsable_email: cruce.responsable_email || '',
						responsable_empresa: cruce.responsable_empresa || '',
						responsable_horario: cruce.responsable_horario || '',
					});
				})
				.catch((err) => setError(err.response?.data?.error || 'Error al cargar cruce'));
		}
	}, [cruceId]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			// Convertir coordenadas a números
			const data = {
				...formData,
				coordenadas_lat: formData.coordenadas_lat ? parseFloat(formData.coordenadas_lat) : null,
				coordenadas_lng: formData.coordenadas_lng ? parseFloat(formData.coordenadas_lng) : null,
			};

			if (cruceId) {
				await crucesAPI.update(cruceId, data);
			} else {
				await crucesAPI.create(data);
			}

			onSuccess?.();
		} catch (err) {
			setError(err.response?.data?.error || err.response?.data?.detail || 'Error al guardar cruce');
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900/20 dark:border-red-500 dark:text-red-300">
					{error}
				</div>
			)}

			{/* Información Básica */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Nombre del Cruce *
					</label>
					<input
						type="text"
						name="nombre"
						value={formData.nombre}
						onChange={handleChange}
						required
						className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Ubicación *
					</label>
					<input
						type="text"
						name="ubicacion"
						value={formData.ubicacion}
						onChange={handleChange}
						required
						className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
					/>
				</div>
			</div>

			{/* Coordenadas GPS */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Latitud
					</label>
					<input
						type="number"
						step="any"
						name="coordenadas_lat"
						value={formData.coordenadas_lat}
						onChange={handleChange}
						placeholder="-33.4489"
						className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Longitud
					</label>
					<input
						type="number"
						step="any"
						name="coordenadas_lng"
						value={formData.coordenadas_lng}
						onChange={handleChange}
						placeholder="-70.6693"
						className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
					/>
				</div>
			</div>

			{/* Estado */}
			<div>
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					Estado *
				</label>
				<select
					name="estado"
					value={formData.estado}
					onChange={handleChange}
					required
					className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
				>
					<option value="ACTIVO">Activo</option>
					<option value="MANTENIMIENTO">Mantenimiento</option>
					<option value="INACTIVO">Inactivo</option>
				</select>
			</div>

			{/* Información de Responsable */}
			<div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
				<h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Información de Contacto del Responsable</h3>
				
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Nombre del Responsable
						</label>
						<input
							type="text"
							name="responsable_nombre"
							value={formData.responsable_nombre}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Teléfono
						</label>
						<input
							type="tel"
							name="responsable_telefono"
							value={formData.responsable_telefono}
							onChange={handleChange}
							placeholder="+56 9 1234 5678"
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Email
						</label>
						<input
							type="email"
							name="responsable_email"
							value={formData.responsable_email}
							onChange={handleChange}
							placeholder="responsable@empresa.com"
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Empresa
						</label>
						<input
							type="text"
							name="responsable_empresa"
							value={formData.responsable_empresa}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
						/>
					</div>
				</div>

				<div className="mt-4">
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Horario de Atención
					</label>
					<input
						type="text"
						name="responsable_horario"
						value={formData.responsable_horario}
						onChange={handleChange}
						placeholder="Lunes a Viernes 8:00-18:00"
						className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
					/>
				</div>
			</div>

			{/* Botones */}
			<div className="flex justify-end space-x-3 pt-4">
				<button
					type="button"
					onClick={onCancel}
					className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
				>
					Cancelar
				</button>
				<button
					type="submit"
					disabled={loading}
					className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
				>
					{loading ? 'Guardando...' : cruceId ? 'Actualizar' : 'Crear'}
				</button>
			</div>
		</form>
	);
};

export default CruceForm;

