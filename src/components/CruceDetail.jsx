import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Configurar icono personalizado para el marcador
const createCustomIcon = (estado) => {
	const colors = {
		ACTIVO: '#22c55e',
		MANTENIMIENTO: '#eab308',
		INACTIVO: '#ef4444'
	}
	
	return L.divIcon({
		html: `
			<div style="
				background-color: ${colors[estado]};
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
	})
}

// Datos históricos de ejemplo
const datosHistoricos = {
	1: {
		historicoTrafico: [
			{ fecha: '2024-01-15', trenes: 12, velocidadMax: 75 },
			{ fecha: '2024-01-14', trenes: 8, velocidadMax: 70 },
			{ fecha: '2024-01-13', trenes: 15, velocidadMax: 80 },
			{ fecha: '2024-01-12', trenes: 10, velocidadMax: 65 },
			{ fecha: '2024-01-11', trenes: 14, velocidadMax: 72 }
		],
		proximoMantenimiento: '2024-02-10',
		sensores: [
			{ id: 1, tipo: 'Proximidad', estado: 'ACTIVO', ubicacion: 'Norte' },
			{ id: 2, tipo: 'Velocidad', estado: 'ACTIVO', ubicacion: 'Centro' },
			{ id: 3, tipo: 'Peso', estado: 'ACTIVO', ubicacion: 'Sur' },
			{ id: 4, tipo: 'Barrera', estado: 'ACTIVO', ubicacion: 'Cruce' }
		],
		configuracion: {
			tiempoAlerta: 30,
			velocidadMaxima: 80,
			tiempoBarrera: 15,
			modoOperacion: 'Automático'
		}
	},
	2: {
		historicoTrafico: [
			{ fecha: '2024-01-14', trenes: 6, velocidadMax: 50 },
			{ fecha: '2024-01-13', trenes: 4, velocidadMax: 45 },
			{ fecha: '2024-01-12', trenes: 8, velocidadMax: 55 },
			{ fecha: '2024-01-11', trenes: 7, velocidadMax: 48 },
			{ fecha: '2024-01-10', trenes: 9, velocidadMax: 52 }
		],
		proximoMantenimiento: '2024-01-20',
		sensores: [
			{ id: 1, tipo: 'Proximidad', estado: 'ACTIVO', ubicacion: 'Norte' },
			{ id: 2, tipo: 'Velocidad', estado: 'MANTENIMIENTO', ubicacion: 'Centro' },
			{ id: 3, tipo: 'Peso', estado: 'MANTENIMIENTO', ubicacion: 'Sur' },
			{ id: 4, tipo: 'Barrera', estado: 'ACTIVO', ubicacion: 'Cruce' }
		],
		configuracion: {
			tiempoAlerta: 25,
			velocidadMaxima: 60,
			tiempoBarrera: 12,
			modoOperacion: 'Manual'
		}
	}
}

export function CruceDetail() {
	const { id } = useParams()
	const navigate = useNavigate()
	const { cruces } = useData()
	const [cruce, setCruce] = useState(null)
	const [activeTab, setActiveTab] = useState('general')

	useEffect(() => {
		const cruceData = cruces.find(c => c.id_cruce === parseInt(id))
		if (cruceData) {
			const datosExtra = datosHistoricos[parseInt(id)] || {
				historicoTrafico: [],
				sensores: [],
				configuracion: {}
			}
			setCruce({ ...cruceData, ...datosExtra })
		}
	}, [id, cruces])

	if (!cruce) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600 dark:text-gray-300">Cargando información del cruce...</p>
				</div>
			</div>
		)
	}

	const getEstadoStyles = (estado) => {
		switch (estado) {
			case 'ACTIVO':
				return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700'
			case 'MANTENIMIENTO':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700'
			case 'INACTIVO':
				return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700'
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
		}
	}

	const getBateriaColor = (nivel) => {
		if (nivel >= 70) return 'text-green-600 dark:text-green-400'
		if (nivel >= 30) return 'text-yellow-600 dark:text-yellow-400'
		return 'text-red-600 dark:text-red-400'
	}

	const formatearFecha = (fecha) => {
		if (!fecha) return 'N/A'
		return new Date(fecha).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	}

	const getBarrierStateIcon = (state) => {
		switch (state) {
			case 'UP':
				return '⬆️'
			case 'DOWN':
				return '⬇️'
			case 'MOVING':
				return '↕️'
			case 'FAULT':
				return '⚠️'
			default:
				return '❓'
		}
	}

	const tabs = [
		{ id: 'general', label: 'General', icon: '📊' },
		{ id: 'telemetria', label: 'Telemetría ESP32', icon: '📡' },
		{ id: 'sensores', label: 'Sensores', icon: '🔧' },
		{ id: 'trafico', label: 'Tráfico', icon: '🚆' },
		{ id: 'ubicacion', label: 'Ubicación', icon: '📍' },
		{ id: 'contacto', label: 'Contacto', icon: '👤' }
	]

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
			{/* Header */}
			<header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between py-6">
						<div className="flex items-center space-x-4">
							<button
								onClick={() => navigate('/')}
								className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
								<span>Volver</span>
							</button>
							<div>
								<h1 className="text-3xl font-bold text-gray-900 dark:text-white">{cruce.nombre}</h1>
								<p className="text-gray-600 dark:text-gray-300">{cruce.ubicacion}</p>
							</div>
						</div>
						<div className="flex items-center space-x-4">
							<span className={`px-3 py-1 text-sm font-medium rounded-full border ${getEstadoStyles(cruce.estado)}`}>
								{cruce.estado}
							</span>
						</div>
					</div>
				</div>
			</header>

			{/* Contenido Principal */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Estadísticas Rápidas */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Batería</p>
								<p className={`text-2xl font-bold ${getBateriaColor(cruce.bateria)}`}>
									{cruce.bateria}%
								</p>
								{cruce.voltage && (
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
										{cruce.voltage?.toFixed(2)}V
									</p>
								)}
							</div>
							<div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
								<svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							</div>
						</div>
					</div>

					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sensores Activos</p>
								<p className="text-2xl font-bold text-gray-900 dark:text-white">{cruce.sensoresActivos}/4</p>
								{cruce.barrier_state && (
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
										{getBarrierStateIcon(cruce.barrier_state)} {cruce.barrier_state}
									</p>
								)}
							</div>
							<div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
								<svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
								</svg>
							</div>
						</div>
					</div>

					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Temperatura</p>
								<p className="text-2xl font-bold text-gray-900 dark:text-white">
									{cruce.temperature ? `${cruce.temperature?.toFixed(1)}°C` : `${cruce.velocidadPromedio} km/h`}
								</p>
								{cruce.solar_power !== undefined && (
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
										☀️ {cruce.solar_power?.toFixed(1)}W
									</p>
								)}
							</div>
							<div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
								<svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
								</svg>
							</div>
						</div>
					</div>

					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Última Actividad</p>
								<p className="text-sm font-bold text-gray-900 dark:text-white">
									{new Date(cruce.ultimaActividad).toLocaleDateString('es-ES')}
								</p>
								{cruce.rssi && (
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
										📶 RSSI: {cruce.rssi} dBm
									</p>
								)}
							</div>
							<div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
								<svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
						</div>
					</div>
				</div>

				{/* Navegación por Tabs */}
				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
					<div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
						<nav className="-mb-px flex space-x-4 md:space-x-8 px-6">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
										activeTab === tab.id
											? 'border-blue-500 text-blue-600 dark:text-blue-400'
											: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
									}`}
								>
									<span>{tab.icon}</span>
									<span>{tab.label}</span>
								</button>
							))}
						</nav>
					</div>

					{/* Contenido de los Tabs */}
					<div className="p-6">
						{activeTab === 'general' && (
							<div className="space-y-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información General</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Instalación</label>
											<p className="mt-1 text-sm text-gray-900 dark:text-white">{formatearFecha(cruce.fechaInstalacion)}</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Último Mantenimiento</label>
											<p className="mt-1 text-sm text-gray-900 dark:text-white">{formatearFecha(cruce.ultimoMantenimiento)}</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Próximo Mantenimiento</label>
											<p className="mt-1 text-sm text-gray-900 dark:text-white">{formatearFecha(cruce.proximoMantenimiento)}</p>
										</div>
									</div>
									<div className="space-y-4">
										{cruce.configuracion && (
											<div>
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Configuración</label>
												<div className="mt-1 space-y-2">
													<p className="text-sm text-gray-900 dark:text-white">Tiempo de alerta: {cruce.configuracion.tiempoAlerta}s</p>
													<p className="text-sm text-gray-900 dark:text-white">Velocidad máxima: {cruce.configuracion.velocidadMaxima} km/h</p>
													<p className="text-sm text-gray-900 dark:text-white">Tiempo de barrera: {cruce.configuracion.tiempoBarrera}s</p>
													<p className="text-sm text-gray-900 dark:text-white">Modo: {cruce.configuracion.modoOperacion}</p>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						)}

						{activeTab === 'telemetria' && (
							<div className="space-y-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Telemetría ESP32 en Tiempo Real</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{cruce.barrier_state && (
										<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
											<div className="flex items-center justify-between">
												<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado de Barrera</span>
												<span className="text-2xl">{getBarrierStateIcon(cruce.barrier_state)}</span>
											</div>
											<p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{cruce.barrier_state}</p>
										</div>
									)}
									{cruce.voltage && (
										<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Voltaje</span>
											<p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{cruce.voltage.toFixed(2)} V</p>
										</div>
									)}
									{cruce.temperature !== undefined && (
										<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Temperatura</span>
											<p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{cruce.temperature.toFixed(1)} °C</p>
										</div>
									)}
									{cruce.rssi && (
										<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Señal WiFi (RSSI)</span>
											<p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{cruce.rssi} dBm</p>
										</div>
									)}
									{cruce.vibration !== undefined && (
										<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vibración</span>
											<p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{cruce.vibration.toFixed(3)} m/s²</p>
										</div>
									)}
									{cruce.solar_power !== undefined && (
										<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Potencia Solar</span>
											<p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{cruce.solar_power.toFixed(1)} W</p>
										</div>
									)}
									{cruce.faults !== undefined && (
										<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fallas Detectadas</span>
											<p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{cruce.faults}</p>
											<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
												{cruce.faults === 0 ? '✅ Sin fallas' : '⚠️ Revisar sistema'}
											</p>
										</div>
									)}
								</div>
							</div>
						)}

						{activeTab === 'sensores' && (
							<div className="space-y-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Estado de Sensores</h3>
								{cruce.sensores && cruce.sensores.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{cruce.sensores.map((sensor) => (
											<div key={sensor.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
												<div className="flex items-center justify-between mb-2">
													<h4 className="font-medium text-gray-900 dark:text-white">{sensor.tipo}</h4>
													<span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoStyles(sensor.estado)}`}>
														{sensor.estado}
													</span>
												</div>
												<p className="text-sm text-gray-600 dark:text-gray-400">Ubicación: {sensor.ubicacion}</p>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8 text-gray-500 dark:text-gray-400">
										<p>No hay información detallada de sensores disponible</p>
									</div>
								)}
							</div>
						)}

						{activeTab === 'trafico' && (
							<div className="space-y-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historial de Tráfico</h3>
								{cruce.historicoTrafico && cruce.historicoTrafico.length > 0 ? (
									<div className="overflow-x-auto">
										<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
											<thead className="bg-gray-50 dark:bg-gray-700">
												<tr>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trenes</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Velocidad Máxima</th>
												</tr>
											</thead>
											<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
												{cruce.historicoTrafico.map((dia, index) => (
													<tr key={index}>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
															{new Date(dia.fecha).toLocaleDateString('es-ES')}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{dia.trenes}</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{dia.velocidadMax} km/h</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								) : (
									<div className="text-center py-8 text-gray-500 dark:text-gray-400">
										<p>No hay datos históricos de tráfico disponibles</p>
									</div>
								)}
							</div>
						)}

						{activeTab === 'ubicacion' && (
							<div className="space-y-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ubicación y Coordenadas</h3>
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección</label>
											<p className="mt-1 text-sm text-gray-900 dark:text-white">{cruce.ubicacion}</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitud</label>
											<p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
												{cruce.coordenadas?.lat || cruce.coordenadas?.latitud || 'N/A'}
											</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitud</label>
											<p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
												{cruce.coordenadas?.lng || cruce.coordenadas?.longitud || 'N/A'}
											</p>
										</div>
									</div>
									<div className="lg:col-span-2">
										{/* Mapa interactivo */}
										{cruce.coordenadas && (cruce.coordenadas.lat || cruce.coordenadas.latitud) ? (
											<div className="rounded-lg overflow-hidden shadow-lg" style={{ height: '400px' }}>
												<MapContainer
													center={[
														cruce.coordenadas.lat || cruce.coordenadas.latitud,
														cruce.coordenadas.lng || cruce.coordenadas.longitud
													]}
													zoom={15}
													style={{ height: '100%', width: '100%' }}
												>
													<TileLayer
														url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
														attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
													/>
													<Marker
														position={[
															cruce.coordenadas.lat || cruce.coordenadas.latitud,
															cruce.coordenadas.lng || cruce.coordenadas.longitud
														]}
														icon={createCustomIcon(cruce.estado)}
													>
														<Popup>
															<div className="p-2">
																<h4 className="font-bold text-gray-900">{cruce.nombre}</h4>
																<p className="text-sm text-gray-600">{cruce.ubicacion}</p>
																<p className="text-sm font-semibold mt-2">Estado: {cruce.estado}</p>
															</div>
														</Popup>
													</Marker>
													<Circle
														center={[
															cruce.coordenadas.lat || cruce.coordenadas.latitud,
															cruce.coordenadas.lng || cruce.coordenadas.longitud
														]}
														radius={200}
														pathOptions={{
															color: cruce.estado === 'ACTIVO' ? '#22c55e' : 
																	 cruce.estado === 'MANTENIMIENTO' ? '#eab308' : '#ef4444',
															weight: 2,
															opacity: 0.5,
															fillOpacity: 0.1
														}}
													/>
												</MapContainer>
											</div>
										) : (
											<div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 flex items-center justify-center h-full">
												<div className="text-center">
													<svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
													</svg>
													<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Coordenadas no disponibles</p>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						)}

						{activeTab === 'contacto' && (
							<div className="space-y-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información de Contacto</h3>
								<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Responsable</label>
											<p className="mt-1 text-sm text-gray-900 dark:text-white">{cruce.responsable || 'N/A'}</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
											<p className="mt-1 text-sm text-gray-900 dark:text-white">{cruce.telefono || 'N/A'}</p>
										</div>
										{cruce.contacto?.email && (
											<div>
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
												<p className="mt-1 text-sm text-gray-900 dark:text-white">{cruce.contacto.email}</p>
											</div>
										)}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
