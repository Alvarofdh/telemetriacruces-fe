import React, { useState, useEffect } from 'react'
import { useData } from '../../hooks/useData'
import toast from 'react-hot-toast'

export function SimulatorPanel() {
	const { cruces, actualizarCruce } = useData()
	const [isSimulating, setIsSimulating] = useState(false)
	const [simulationHistory, setSimulationHistory] = useState([])
	const [selectedCruce, setSelectedCruce] = useState(null)

	// Eventos de simulación disponibles
	const simulationEvents = [
		{
			id: 'train_pass',
			name: 'Tren Pasa',
			description: 'Simula el paso de un tren por el cruce',
			icon: '🚂',
			color: 'blue',
			action: async (cruce) => {
				const updatedCruce = {
					...cruce,
					ultimaActividad: new Date().toISOString(),
					tipoTren: ['Carga', 'Pasajeros', 'Mixto'][Math.floor(Math.random() * 3)],
					velocidadPromedio: Math.floor(Math.random() * 40) + 30,
					sensoresActivos: Math.min(cruce.sensoresActivos + 1, 4)
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				return `Tren ${updatedCruce.tipoTren} pasó por ${cruce.nombre} a ${updatedCruce.velocidadPromedio} km/h`
			}
		},
		{
			id: 'battery_low',
			name: 'Batería Baja',
			description: 'Simula una descarga rápida de batería',
			icon: '🔋',
			color: 'yellow',
			action: async (cruce) => {
				const newBateria = Math.max(0, cruce.bateria - (Math.floor(Math.random() * 30) + 10))
				const updatedCruce = {
					...cruce,
					bateria: newBateria,
					estado: newBateria < 20 ? 'INACTIVO' : cruce.estado
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				return `Batería de ${cruce.nombre} descendió a ${newBateria}%`
			}
		},
		{
			id: 'sensor_failure',
			name: 'Falla de Sensor',
			description: 'Simula la falla de uno o más sensores',
			icon: '📡',
			color: 'red',
			action: async (cruce) => {
				const newSensores = Math.max(0, cruce.sensoresActivos - (Math.floor(Math.random() * 2) + 1))
				const updatedCruce = {
					...cruce,
					sensoresActivos: newSensores,
					estado: newSensores < 2 ? 'MANTENIMIENTO' : cruce.estado
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				return `${cruce.nombre} tiene ${newSensores} sensores activos (falla detectada)`
			}
		},
		{
			id: 'cruce_failure',
			name: 'Cruce Inactivo',
			description: 'Simula que el cruce deja de funcionar',
			icon: '⚠️',
			color: 'red',
			action: async (cruce) => {
				const updatedCruce = {
					...cruce,
					estado: 'INACTIVO',
					sensoresActivos: 0,
					bateria: Math.max(0, cruce.bateria - 5)
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				return `${cruce.nombre} está INACTIVO - Requiere intervención inmediata`
			}
		},
		{
			id: 'maintenance',
			name: 'Mantenimiento',
			description: 'Simula que el cruce entra en mantenimiento',
			icon: '🔧',
			color: 'yellow',
			action: async (cruce) => {
				const updatedCruce = {
					...cruce,
					estado: 'MANTENIMIENTO',
					bateria: Math.min(100, cruce.bateria + 10)
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				return `${cruce.nombre} está en MANTENIMIENTO`
			}
		},
		{
			id: 'recovery',
			name: 'Recuperación',
			description: 'Simula la recuperación del cruce a estado normal',
			icon: '✅',
			color: 'green',
			action: async (cruce) => {
				const updatedCruce = {
					...cruce,
					estado: 'ACTIVO',
					bateria: Math.min(100, cruce.bateria + 20),
					sensoresActivos: Math.min(4, cruce.sensoresActivos + 2)
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				return `${cruce.nombre} se recuperó y está ACTIVO`
			}
		}
	]

	const handleSimulate = async (event) => {
		if (!selectedCruce) {
			toast.error('Por favor selecciona un cruce primero')
			return
		}

		setIsSimulating(true)
		try {
			const cruce = cruces.find(c => c.id_cruce === selectedCruce)
			if (!cruce) {
				toast.error('Cruce no encontrado')
				return
			}

			const message = await event.action(cruce)
			
			// Agregar al historial
			setSimulationHistory(prev => [{
				id: Date.now(),
				event: event.name,
				cruce: cruce.nombre,
				message,
				timestamp: new Date().toLocaleTimeString('es-ES')
			}, ...prev].slice(0, 20)) // Mantener solo los últimos 20

			toast.success(message, {
				icon: event.icon,
				duration: 4000
			})
		} catch (error) {
			console.error('Error en simulación:', error)
			toast.error('Error al simular evento')
		} finally {
			setIsSimulating(false)
		}
	}

	const handleQuickDemo = async () => {
		if (cruces.length === 0) {
			toast.error('No hay cruces disponibles para la demostración')
			return
		}

		setIsSimulating(true)
		const demoSequence = [
			{ delay: 1000, event: simulationEvents[0], cruce: cruces[0] }, // Tren pasa
			{ delay: 2000, event: simulationEvents[1], cruce: cruces[0] }, // Batería baja
			{ delay: 3000, event: simulationEvents[2], cruce: cruces[Math.min(1, cruces.length - 1)] }, // Sensor falla
		]

		for (const step of demoSequence) {
			await new Promise(resolve => setTimeout(resolve, step.delay))
			try {
				const message = await step.event.action(step.cruce)
				setSimulationHistory(prev => [{
					id: Date.now(),
					event: step.event.name,
					cruce: step.cruce.nombre,
					message,
					timestamp: new Date().toLocaleTimeString('es-ES')
				}, ...prev].slice(0, 20))
				toast.success(message, {
					icon: step.event.icon,
					duration: 3000
				})
			} catch (error) {
				console.error('Error en demo:', error)
			}
		}

		setIsSimulating(false)
		toast.success('Demostración completada', {
			icon: '🎬'
		})
	}

	const getEventColor = (color) => {
		const colors = {
			blue: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700',
			yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700',
			red: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700',
			green: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700'
		}
		return colors[color] || colors.blue
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
							Panel de Simulación
						</h2>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Simula eventos en tiempo real para pruebas y demostraciones
						</p>
					</div>
					<button
						onClick={handleQuickDemo}
						disabled={isSimulating || cruces.length === 0}
						className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg"
					>
						🎬 Demo Rápida
					</button>
				</div>
			</div>

			{/* Selección de Cruce */}
			<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Seleccionar Cruce para Simulación
				</label>
				<select
					value={selectedCruce || ''}
					onChange={(e) => setSelectedCruce(Number(e.target.value))}
					className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
				>
					<option value="">-- Selecciona un cruce --</option>
					{cruces.map(cruce => (
						<option key={cruce.id_cruce} value={cruce.id_cruce}>
							{cruce.nombre} - {cruce.estado} ({cruce.bateria}% batería)
						</option>
					))}
				</select>
			</div>

			{/* Eventos de Simulación */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{simulationEvents.map(event => (
					<div
						key={event.id}
						className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all"
					>
						<div className="flex items-start justify-between mb-3">
							<div className="text-3xl">{event.icon}</div>
							<span className={`px-2.5 py-1 text-xs font-semibold rounded-full border-2 ${getEventColor(event.color)}`}>
								{event.name}
							</span>
						</div>
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
							{event.description}
						</p>
						<button
							onClick={() => handleSimulate(event)}
							disabled={isSimulating || !selectedCruce}
							className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
						>
							{isSimulating ? 'Simulando...' : 'Simular Evento'}
						</button>
					</div>
				))}
			</div>

			{/* Historial de Simulaciones */}
			{simulationHistory.length > 0 && (
				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
						Historial de Simulaciones
					</h3>
					<div className="space-y-2 max-h-64 overflow-y-auto">
						{simulationHistory.map(item => (
							<div
								key={item.id}
								className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
							>
								<div className="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0 w-20">
									{item.timestamp}
								</div>
								<div className="flex-1">
									<div className="text-sm font-semibold text-gray-900 dark:text-white">
										{item.event} - {item.cruce}
									</div>
									<div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
										{item.message}
									</div>
								</div>
							</div>
						))}
					</div>
					<button
						onClick={() => setSimulationHistory([])}
						className="mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
					>
						Limpiar historial
					</button>
				</div>
			)}
		</div>
	)
}

