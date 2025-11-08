import React, { useMemo } from 'react'
import { useData } from '../contexts/DataContext'
import toast from 'react-hot-toast'

export function AlertSystem() {
	const { cruces } = useData()

	// Definir reglas de alertas
	const alertRules = useMemo(() => [
		{
			id: 'battery_critical',
			type: 'CRITICAL',
			priority: 1,
			condition: (cruce) => cruce.bateria < 20,
			message: (cruce) => `Batería crítica en ${cruce.nombre}: ${cruce.bateria}%`,
			action: 'Revisar inmediatamente',
			icon: '🔋',
			color: 'red'
		},
		{
			id: 'battery_low',
			type: 'WARNING',
			priority: 2,
			condition: (cruce) => cruce.bateria >= 20 && cruce.bateria < 50,
			message: (cruce) => `Batería baja en ${cruce.nombre}: ${cruce.bateria}%`,
			action: 'Programar mantenimiento',
			icon: '⚠️',
			color: 'yellow'
		},
		{
			id: 'temperature_high',
			type: 'WARNING',
			priority: 2,
			condition: (cruce) => cruce.temperature && cruce.temperature > 45,
			message: (cruce) => `Temperatura alta en ${cruce.nombre}: ${cruce.temperature?.toFixed(1)}°C`,
			action: 'Monitorear temperatura',
			icon: '🌡️',
			color: 'orange'
		},
		{
			id: 'temperature_critical',
			type: 'CRITICAL',
			priority: 1,
			condition: (cruce) => cruce.temperature && cruce.temperature > 55,
			message: (cruce) => `Temperatura crítica en ${cruce.nombre}: ${cruce.temperature?.toFixed(1)}°C`,
			action: 'Apagar sistema inmediatamente',
			icon: '🔥',
			color: 'red'
		},
		{
			id: 'faults_detected',
			type: 'WARNING',
			priority: 2,
			condition: (cruce) => cruce.faults && cruce.faults > 0,
			message: (cruce) => `Fallas detectadas en ${cruce.nombre} (Código: ${cruce.faults})`,
			action: 'Revisar logs del sistema',
			icon: '⚙️',
			color: 'red'
		},
		{
			id: 'barrier_fault',
			type: 'CRITICAL',
			priority: 1,
			condition: (cruce) => cruce.barrier_state === 'FAULT',
			message: (cruce) => `Falla en barrera de ${cruce.nombre}`,
			action: 'Intervención inmediata requerida',
			icon: '🚧',
			color: 'red'
		},
		{
			id: 'sensors_offline',
			type: 'WARNING',
			priority: 2,
			condition: (cruce) => cruce.sensoresActivos < 2,
			message: (cruce) => `Sensores limitados en ${cruce.nombre}: ${cruce.sensoresActivos}/4 activos`,
			action: 'Revisar sensores',
			icon: '📡',
			color: 'orange'
		},
		{
			id: 'wifi_weak',
			type: 'INFO',
			priority: 3,
			condition: (cruce) => cruce.rssi && cruce.rssi < -80,
			message: (cruce) => `Señal WiFi débil en ${cruce.nombre}: ${cruce.rssi} dBm`,
			action: 'Verificar conectividad',
			icon: '📶',
			color: 'yellow'
		},
		{
			id: 'inactive_status',
			type: 'CRITICAL',
			priority: 1,
			condition: (cruce) => cruce.estado === 'INACTIVO',
			message: (cruce) => `${cruce.nombre} está INACTIVO`,
			action: 'Restablecer operación',
			icon: '❌',
			color: 'red'
		},
		{
			id: 'maintenance_needed',
			type: 'INFO',
			priority: 3,
			condition: (cruce) => cruce.estado === 'MANTENIMIENTO',
			message: (cruce) => `${cruce.nombre} en mantenimiento`,
			action: 'Completar mantenimiento',
			icon: '🔧',
			color: 'blue'
		}
	], [])

	// Generar alertas activas
	const activeAlerts = useMemo(() => {
		const alerts = []
		
		cruces.forEach(cruce => {
			alertRules.forEach(rule => {
				if (rule.condition(cruce)) {
					alerts.push({
						...rule,
						cruce: cruce,
						timestamp: new Date()
					})
				}
			})
		})

		// Ordenar por prioridad (1 = más urgente)
		return alerts.sort((a, b) => a.priority - b.priority)
	}, [cruces, alertRules])

	const getAlertStyles = (type) => {
		switch (type) {
			case 'CRITICAL':
				return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
			case 'WARNING':
				return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
			case 'INFO':
				return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
			default:
				return 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
		}
	}

	const getAlertTextColor = (type) => {
		switch (type) {
			case 'CRITICAL':
				return 'text-red-800 dark:text-red-300'
			case 'WARNING':
				return 'text-yellow-800 dark:text-yellow-300'
			case 'INFO':
				return 'text-blue-800 dark:text-blue-300'
			default:
				return 'text-gray-800 dark:text-gray-300'
		}
	}

	const getAlertBadge = (type) => {
		const baseClasses = 'px-2 py-1 text-xs font-bold rounded-full uppercase'
		switch (type) {
			case 'CRITICAL':
				return `${baseClasses} bg-red-600 text-white`
			case 'WARNING':
				return `${baseClasses} bg-yellow-600 text-white`
			case 'INFO':
				return `${baseClasses} bg-blue-600 text-white`
			default:
				return `${baseClasses} bg-gray-600 text-white`
		}
	}

	const criticalCount = activeAlerts.filter(a => a.type === 'CRITICAL').length
	const warningCount = activeAlerts.filter(a => a.type === 'WARNING').length
	const infoCount = activeAlerts.filter(a => a.type === 'INFO').length

	return (
		<div className="space-y-4">
			{/* Resumen de alertas */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-red-800 dark:text-red-300">Críticas</p>
							<p className="text-3xl font-bold text-red-900 dark:text-red-200">{criticalCount}</p>
						</div>
						<div className="text-4xl">🔴</div>
					</div>
				</div>

				<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Advertencias</p>
							<p className="text-3xl font-bold text-yellow-900 dark:text-yellow-200">{warningCount}</p>
						</div>
						<div className="text-4xl">⚠️</div>
					</div>
				</div>

				<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-blue-800 dark:text-blue-300">Informativas</p>
							<p className="text-3xl font-bold text-blue-900 dark:text-blue-200">{infoCount}</p>
						</div>
						<div className="text-4xl">ℹ️</div>
					</div>
				</div>
			</div>

			{/* Lista de alertas */}
			<div className="space-y-3">
				{activeAlerts.length === 0 ? (
					<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
						<div className="text-4xl mb-2">✅</div>
						<p className="text-lg font-semibold text-green-800 dark:text-green-300">
							¡Todos los sistemas operando normalmente!
						</p>
						<p className="text-sm text-green-600 dark:text-green-400 mt-1">
							No hay alertas activas en este momento
						</p>
					</div>
				) : (
					activeAlerts.map((alert, index) => (
						<div
							key={`${alert.id}-${alert.cruce.id_cruce}-${index}`}
							className={`${getAlertStyles(alert.type)} border rounded-lg p-4 transition-all hover:shadow-md`}
						>
							<div className="flex items-start justify-between">
								<div className="flex items-start space-x-3 flex-1">
									<div className="text-2xl mt-1">{alert.icon}</div>
									<div className="flex-1">
										<div className="flex items-center space-x-2 mb-1">
											<span className={getAlertBadge(alert.type)}>
												{alert.type}
											</span>
											<span className={`text-xs ${getAlertTextColor(alert.type)}`}>
												{alert.timestamp.toLocaleTimeString('es-ES')}
											</span>
										</div>
										<p className={`font-semibold ${getAlertTextColor(alert.type)}`}>
											{alert.message(alert.cruce)}
										</p>
										<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
											<strong>Acción recomendada:</strong> {alert.action}
										</p>
										<div className="flex items-center space-x-2 mt-2">
											<span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
												📍 {alert.cruce.ubicacion}
											</span>
											{alert.cruce.responsable && (
												<span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
													👤 {alert.cruce.responsable}
												</span>
											)}
										</div>
									</div>
								</div>
								<button
									onClick={() => {
										toast.success(`Alerta reconocida: ${alert.cruce.nombre}`, {
											icon: '✅',
											duration: 3000
										})
									}}
									className="ml-4 px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
								>
									Reconocer
								</button>
							</div>
						</div>
					))
				)}
			</div>

			{/* Estadísticas adicionales */}
			{activeAlerts.length > 0 && (
				<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
					<p className="text-sm text-gray-600 dark:text-gray-400">
						<strong>Total de alertas activas:</strong> {activeAlerts.length} | 
						<strong className="ml-2">Cruces afectados:</strong> {new Set(activeAlerts.map(a => a.cruce.id_cruce)).size}
					</p>
				</div>
			)}
		</div>
	)
}

