import { useState, useEffect, useCallback } from 'react';
import { getCruce, createCruce, updateCruce } from '../../services/cruces';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';

// Componente para manejar clicks en el mapa
const MapClickHandler = ({ onMapClick }) => {
	useMapEvents({
		click: (e) => {
			onMapClick(e.latlng);
		},
	});
	return null;
};

// Icono personalizado para el marcador
const createMarkerIcon = () => {
	return L.divIcon({
		html: `
			<div style="
				background-color: #3b82f6;
				border: 3px solid white;
				border-radius: 50%;
				width: 24px;
				height: 24px;
				box-shadow: 0 3px 6px rgba(0,0,0,0.4);
			"></div>
		`,
		className: 'custom-marker',
		iconSize: [24, 24],
		iconAnchor: [12, 12]
	});
};

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
	const [markerPosition, setMarkerPosition] = useState(null);

	useEffect(() => {
		if (cruceId) {
			// Cargar datos del cruce para editar
			getCruce(cruceId)
				.then((cruce) => {
					const lat = cruce.coordenadas_lat || '';
					const lng = cruce.coordenadas_lng || '';
					setFormData({
						nombre: cruce.nombre || '',
						ubicacion: cruce.ubicacion || '',
						coordenadas_lat: lat,
						coordenadas_lng: lng,
						estado: cruce.estado || 'ACTIVO',
						responsable_nombre: cruce.responsable_nombre || '',
						responsable_telefono: cruce.responsable_telefono || '',
						responsable_email: cruce.responsable_email || '',
						responsable_empresa: cruce.responsable_empresa || '',
						responsable_horario: cruce.responsable_horario || '',
					});
					// Establecer posición del marcador si hay coordenadas
					if (lat && lng) {
						setMarkerPosition([parseFloat(lat), parseFloat(lng)]);
					}
				})
				.catch((err) => {
					const errorMsg = err.response?.data?.error || err.response?.data?.detail || err.message || 'Error al cargar cruce';
					setError(errorMsg);
					toast.error(errorMsg);
				});
		}
	}, [cruceId]);

	// Actualizar marcador cuando cambian las coordenadas manualmente
	useEffect(() => {
		if (formData.coordenadas_lat && formData.coordenadas_lng) {
			const lat = parseFloat(formData.coordenadas_lat);
			const lng = parseFloat(formData.coordenadas_lng);
			if (!isNaN(lat) && !isNaN(lng)) {
				setMarkerPosition([lat, lng]);
			}
		}
	}, [formData.coordenadas_lat, formData.coordenadas_lng]);

	const handleMapClick = useCallback((latlng) => {
		const lat = latlng.lat.toFixed(6);
		const lng = latlng.lng.toFixed(6);
		setFormData((prev) => ({
			...prev,
			coordenadas_lat: lat,
			coordenadas_lng: lng,
		}));
		setMarkerPosition([latlng.lat, latlng.lng]);
	}, []);

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
				await updateCruce(cruceId, data);
				toast.success('Cruce actualizado exitosamente');
			} else {
				await createCruce(data);
				toast.success('Cruce creado exitosamente');
			}

			onSuccess?.();
		} catch (err) {
			const errorMsg = err.response?.data?.error || err.response?.data?.detail || err.message || 'Error al guardar cruce';
			setError(errorMsg);
			toast.error(errorMsg);
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

			{/* Mapa Interactivo */}
			<div>
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Seleccionar ubicación en el mapa
				</label>
				<div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden" style={{ height: '300px' }}>
					<MapContainer
						center={markerPosition || [-33.4489, -70.6693]}
						zoom={markerPosition ? 15 : 6}
						style={{ height: '100%', width: '100%' }}
						className="z-0"
					>
						<TileLayer
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						/>
						<MapClickHandler onMapClick={handleMapClick} />
						{markerPosition && (
							<Marker
								position={markerPosition}
								icon={createMarkerIcon()}
							/>
						)}
					</MapContainer>
				</div>
				<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
					Haz clic en el mapa para seleccionar la ubicación del cruce. Las coordenadas se actualizarán automáticamente.
				</p>
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

