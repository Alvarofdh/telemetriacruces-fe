import React, { useState, useMemo } from 'react'
import { useData } from '../../hooks/useData'
import {
	LineChart,
	Line,
	AreaChart,
	Area,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell
} from 'recharts'

export function HistoricalCharts() {
	const { cruces } = useData()
	const [selectedCruce, setSelectedCruce] = useState('all')
	const [timeRange, setTimeRange] = useState('24h')

	// Generar datos históricos simulados (en producción vendrían del backend)
	const generateHistoricalData = (cruce, hours = 24) => {
		const data = []
		const now = new Date()

		for (let i = hours; i >= 0; i--) {
			const time = new Date(now.getTime() - i * 60 * 60 * 1000)
			data.push({
				time: time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
				bateria: Math.max(0, Math.min(100, cruce.bateria + (Math.random() - 0.5) * 10)),
				temperatura: cruce.temperature ? cruce.temperature + (Math.random() - 0.5) * 5 : 25 + (Math.random() - 0.5) * 10,
				solar: cruce.solar_power !== undefined ? Math.max(0, cruce.solar_power + (Math.random() - 0.5) * 50) : Math.random() * 200,
				rssi: cruce.rssi ? cruce.rssi + (Math.random() - 0.5) * 10 : -70 + (Math.random() - 0.5) * 20
			})
		}

		return data
	}

	// Datos de batería por cruce
	const batteryData = useMemo(() => {
		return cruces.map(cruce => ({
			nombre: cruce.nombre.replace('Cruce ', ''),
			bateria: cruce.bateria,
			color: cruce.bateria >= 70 ? '#22c55e' : cruce.bateria >= 30 ? '#eab308' : '#ef4444'
		}))
	}, [cruces])

	// Datos de estado general
	const statusData = useMemo(() => {
		const activos = cruces.filter(c => c.estado === 'ACTIVO').length
		const mantenimiento = cruces.filter(c => c.estado === 'MANTENIMIENTO').length
		const inactivos = cruces.filter(c => c.estado === 'INACTIVO').length

		return [
			{ name: 'Activos', value: activos, color: '#22c55e' },
			{ name: 'Mantenimiento', value: mantenimiento, color: '#eab308' },
			{ name: 'Inactivos', value: inactivos, color: '#ef4444' }
		]
	}, [cruces])

	// Datos históricos del cruce seleccionado
	const selectedCruceData = useMemo(() => {
		if (selectedCruce === 'all') return []
		const cruce = cruces.find(c => c.id_cruce === parseInt(selectedCruce))
		if (!cruce) return []

		const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720
		return generateHistoricalData(cruce, hours)
	}, [selectedCruce, timeRange, cruces])

	// Datos comparativos de todos los cruces
	const comparativeData = useMemo(() => {
		return cruces.map(cruce => ({
			nombre: cruce.nombre.replace('Cruce ', ''),
			bateria: cruce.bateria,
			temperatura: cruce.temperature || 25,
			sensores: cruce.sensoresActivos
		}))
	}, [cruces])

	const COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899']

	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
					<p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
					{payload.map((entry, index) => (
						<p key={index} style={{ color: entry.color }} className="text-sm">
							<strong>{entry.name}:</strong> {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
							{entry.name === 'Batería' && '%'}
							{entry.name === 'Temperatura' && '°C'}
							{entry.name === 'Solar' && 'W'}
							{entry.name === 'RSSI' && ' dBm'}
						</p>
					))}
				</div>
			)
		}
		return null
	}

	return (
		<div className="space-y-6">
			{/* Controles */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
				<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
					<div className="flex items-center space-x-4">
						<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
							Seleccionar Cruce:
						</label>
						<select
							value={selectedCruce}
							onChange={(e) => setSelectedCruce(e.target.value)}
							className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
						>
							<option value="all">Todos (Comparativo)</option>
							{cruces.map(cruce => (
								<option key={cruce.id_cruce} value={cruce.id_cruce}>
									{cruce.nombre}
								</option>
							))}
						</select>
					</div>

					{selectedCruce !== 'all' && (
						<div className="flex items-center space-x-2">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
								Período:
							</label>
							{['24h', '7d', '30d'].map((range) => (
								<button
									key={range}
									onClick={() => setTimeRange(range)}
									className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
										timeRange === range
											? 'bg-blue-600 text-white'
											: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
									}`}
								>
									{range}
								</button>
							))}
						</div>
					)}
				</div>
			</div>

			{selectedCruce === 'all' ? (
				<>
					{/* Gráficos comparativos */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Gráfico de barras - Niveles de batería */}
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
								📊 Niveles de Batería por Cruce
							</h3>
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={batteryData}>
									<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
									<XAxis dataKey="nombre" stroke="#9ca3af" />
									<YAxis stroke="#9ca3af" />
									<Tooltip content={<CustomTooltip />} />
									<Bar dataKey="bateria" fill="#3b82f6">
										{batteryData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>

						{/* Gráfico de pastel - Estados */}
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
								📈 Distribución de Estados
							</h3>
							<ResponsiveContainer width="100%" height={300}>
								<PieChart>
									<Pie
										data={statusData}
										cx="50%"
										cy="50%"
										labelLine={false}
										label={({ name, value }) => `${name}: ${value}`}
										outerRadius={100}
										fill="#8884d8"
										dataKey="value"
									>
										{statusData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
						</div>

						{/* Gráfico comparativo - Temperatura y Sensores */}
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 lg:col-span-2">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
								🌡️ Comparativa: Temperatura y Sensores Activos
							</h3>
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={comparativeData}>
									<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
									<XAxis dataKey="nombre" stroke="#9ca3af" />
									<YAxis yAxisId="left" stroke="#9ca3af" />
									<YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
									<Tooltip content={<CustomTooltip />} />
									<Legend />
									<Bar yAxisId="left" dataKey="temperatura" fill="#f59e0b" name="Temperatura (°C)" />
									<Bar yAxisId="right" dataKey="sensores" fill="#3b82f6" name="Sensores Activos" />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>
				</>
			) : (
				<>
					{/* Gráficos históricos del cruce seleccionado */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Historial de Batería */}
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
								🔋 Historial de Batería
							</h3>
							<ResponsiveContainer width="100%" height={250}>
								<AreaChart data={selectedCruceData}>
									<defs>
										<linearGradient id="colorBateria" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
											<stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
									<XAxis dataKey="time" stroke="#9ca3af" />
									<YAxis stroke="#9ca3af" domain={[0, 100]} />
									<Tooltip content={<CustomTooltip />} />
									<Area type="monotone" dataKey="bateria" stroke="#22c55e" fillOpacity={1} fill="url(#colorBateria)" name="Batería" />
								</AreaChart>
							</ResponsiveContainer>
						</div>

						{/* Historial de Temperatura */}
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
								🌡️ Historial de Temperatura
							</h3>
							<ResponsiveContainer width="100%" height={250}>
								<LineChart data={selectedCruceData}>
									<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
									<XAxis dataKey="time" stroke="#9ca3af" />
									<YAxis stroke="#9ca3af" />
									<Tooltip content={<CustomTooltip />} />
									<Line type="monotone" dataKey="temperatura" stroke="#f59e0b" strokeWidth={2} name="Temperatura" />
								</LineChart>
							</ResponsiveContainer>
						</div>

						{/* Historial de Potencia Solar */}
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
								☀️ Historial de Potencia Solar
							</h3>
							<ResponsiveContainer width="100%" height={250}>
								<AreaChart data={selectedCruceData}>
									<defs>
										<linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
											<stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
									<XAxis dataKey="time" stroke="#9ca3af" />
									<YAxis stroke="#9ca3af" />
									<Tooltip content={<CustomTooltip />} />
									<Area type="monotone" dataKey="solar" stroke="#fbbf24" fillOpacity={1} fill="url(#colorSolar)" name="Solar" />
								</AreaChart>
							</ResponsiveContainer>
						</div>

						{/* Historial de RSSI (Señal WiFi) */}
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
								📶 Historial de Señal WiFi (RSSI)
							</h3>
							<ResponsiveContainer width="100%" height={250}>
								<LineChart data={selectedCruceData}>
									<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
									<XAxis dataKey="time" stroke="#9ca3af" />
									<YAxis stroke="#9ca3af" domain={[-100, -40]} />
									<Tooltip content={<CustomTooltip />} />
									<Line type="monotone" dataKey="rssi" stroke="#3b82f6" strokeWidth={2} name="RSSI" />
								</LineChart>
							</ResponsiveContainer>
						</div>
					</div>
				</>
			)}

			{/* Nota informativa */}
			<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
				<p className="text-sm text-blue-800 dark:text-blue-300">
					<strong>ℹ️ Nota:</strong> Los datos históricos se generan en tiempo real. En producción, estos datos vendrían del backend con información real almacenada.
				</p>
			</div>
		</div>
	)
}

