import React, { useMemo, useState, useEffect } from 'react'
import { useData } from '../hooks/useData'
import { useAlertas } from '../hooks/useAlertas'
import { connectSocket, socketEvents } from '../services/socket'
import toast from 'react-hot-toast'

// Componentes de iconos profesionales
const AlertIcons = {
	battery: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
		</svg>
	),
	warning: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
		</svg>
	),
	temperature: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
		</svg>
	),
	fire: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
		</svg>
	),
	cog: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
		</svg>
	),
	barrier: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
		</svg>
	),
	sensor: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
		</svg>
	),
	wifi: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
		</svg>
	),
	xCircle: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	),
	wrench: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
		</svg>
	),
	critical: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	),
	info: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	),
	checkCircle: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	)
}

export function AlertSystem() {
	const { cruces } = useData()
	const [filterType, setFilterType] = useState('ALL')
	const [searchTerm, setSearchTerm] = useState('')
	const [sortBy, setSortBy] = useState('priority') // priority, timestamp, cruce
	
	// ✅ CONECTAR AL BACKEND: Obtener alertas reales del backend
	const { alertas: alertasBackend, loading: loadingAlertas, refetch: refetchAlertas, resolveAlerta } = useAlertas({
		resolved: false, // Solo alertas no resueltas
		page_size: 100 // Obtener todas las alertas activas
	})
	
	// Mapear tipos de alerta del backend a iconos
	const getAlertIcon = (type) => {
		const iconMap = {
			'LOW_BATTERY': 'battery',
			'SENSOR_ERROR': 'sensor',
			'BARRIER_STUCK': 'barrier',
			'VOLTAGE_CRITICAL': 'warning',
			'COMMUNICATION_LOST': 'wifi',
			'GABINETE_ABIERTO': 'warning',
		}
		return iconMap[type] || 'warning'
	}
	
	// Obtener cruce por ID para las alertas del backend
	const getCruceById = (cruceId) => {
		return cruces.find(c => c.id_cruce === cruceId || c.id === cruceId) || { nombre: `Cruce #${cruceId}`, ubicacion: 'N/A' }
	}
	
	// Función para obtener acción recomendada según tipo de alerta
	const getActionForAlertType = (type) => {
		const actionMap = {
			'LOW_BATTERY': 'Revisar batería inmediatamente',
			'SENSOR_ERROR': 'Verificar sensores y conexiones',
			'BARRIER_STUCK': 'Revisar mecánicamente la barrera',
			'VOLTAGE_CRITICAL': 'Verificar suministro eléctrico',
			'COMMUNICATION_LOST': 'Verificar conectividad WiFi',
			'GABINETE_ABIERTO': 'Verificar seguridad física del cruce',
		}
		return actionMap[type] || 'Revisar el sistema'
	}
	
	// Transformar alertas del backend al formato esperado
	const activeAlerts = useMemo(() => {
		const alertasTransformadas = alertasBackend.map(alerta => {
			const cruce = getCruceById(alerta.cruce)
			return {
				id: alerta.id,
				type: alerta.severity || 'INFO',
				priority: alerta.severity === 'CRITICAL' ? 1 : alerta.severity === 'WARNING' ? 2 : 3,
				message: () => alerta.description,
				action: getActionForAlertType(alerta.type),
				icon: getAlertIcon(alerta.type),
				cruce: cruce,
				timestamp: new Date(alerta.created_at),
				alertaBackend: alerta, // Guardar referencia a la alerta original
			}
		})
		
		// Ordenar según criterio seleccionado
		if (sortBy === 'priority') {
			alertasTransformadas.sort((a, b) => a.priority - b.priority)
		} else if (sortBy === 'timestamp') {
			alertasTransformadas.sort((a, b) => b.timestamp - a.timestamp)
		} else if (sortBy === 'cruce') {
			alertasTransformadas.sort((a, b) => a.cruce.nombre.localeCompare(b.cruce.nombre))
		}
		
		return alertasTransformadas
	}, [alertasBackend, cruces, sortBy])
	
	// ✅ CONECTAR SOCKET.IO: Escuchar nuevas alertas en tiempo real
	useEffect(() => {
		const socket = connectSocket()
		if (!socket) return
		
		const handleNewAlerta = (alertaData) => {
			console.log('🔔 [AlertSystem] Nueva alerta recibida:', alertaData)
			// Refrescar alertas cuando se recibe una nueva
			refetchAlertas()
		}
		
		const handleAlertaResolved = (alertaData) => {
			console.log('✅ [AlertSystem] Alerta resuelta:', alertaData)
			// Refrescar alertas cuando se resuelve una
			refetchAlertas()
		}
		
		// Función para unirse a salas cuando el socket se conecte
		const joinRooms = () => {
			if (socket.connected) {
				console.log('🔔 [AlertSystem] Uniéndose a sala de alertas')
				socket.emit('join_room', { room: 'alertas' })
				socket.emit('subscribe', { events: ['alertas'] })
			}
		}
		
		// Suscribirse a eventos de alertas
		socketEvents.onNewAlerta(handleNewAlerta)
		socketEvents.onAlertaResolved(handleAlertaResolved)
		
		// Unirse a sala de alertas si ya está conectado
		if (socket.connected) {
			joinRooms()
		}
		
		// También unirse cuando se conecte/autentique
		const handleConnect = () => {
			console.log('✅ [AlertSystem] Socket conectado, uniéndose a salas')
			joinRooms()
		}
		
		socket.on('connect', handleConnect)
		socket.on('connected', handleConnect) // Evento de autenticación
		
		return () => {
			console.log('🧹 [AlertSystem] Limpiando listeners')
			socketEvents.off('new_alerta', handleNewAlerta)
			socketEvents.off('alerta_resolved', handleAlertaResolved)
			socket.off('connect', handleConnect)
			socket.off('connected', handleConnect)
			if (socket.connected) {
				socket.emit('leave_room', { room: 'alertas' })
			}
		}
	}, [refetchAlertas])

	// Filtrar alertas
	const filteredAlerts = useMemo(() => {
		let filtered = activeAlerts

		// Filtrar por tipo
		if (filterType !== 'ALL') {
			filtered = filtered.filter(alert => alert.type === filterType)
		}

		// Filtrar por búsqueda
		if (searchTerm) {
			const term = searchTerm.toLowerCase()
			filtered = filtered.filter(alert => {
				const message = typeof alert.message === 'function' ? alert.message(alert.cruce) : alert.message
				return alert.cruce.nombre.toLowerCase().includes(term) ||
					alert.cruce.ubicacion.toLowerCase().includes(term) ||
					message.toLowerCase().includes(term)
			})
		}

		return filtered
	}, [activeAlerts, filterType, searchTerm])

	const getAlertStyles = (type) => {
		// ✅ Sin bordes de color, solo borde estándar
		return 'bg-white dark:bg-gray-800'
	}

	const getAlertIconBg = (type) => {
		switch (type) {
			case 'CRITICAL':
				return 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
			case 'WARNING':
				return 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
			case 'INFO':
				return 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
			default:
				return 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
		}
	}

	const getAlertTextColor = (type) => {
		switch (type) {
			case 'CRITICAL':
				return 'text-gray-900 dark:text-gray-100'
			case 'WARNING':
				return 'text-gray-900 dark:text-gray-100'
			case 'INFO':
				return 'text-gray-900 dark:text-gray-100'
			default:
				return 'text-gray-900 dark:text-gray-100'
		}
	}

	const getAlertBadge = (type) => {
		const baseClasses = 'px-2.5 py-1 text-xs font-medium rounded-md uppercase tracking-wide'
		switch (type) {
			case 'CRITICAL':
				return `${baseClasses} bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800`
			case 'WARNING':
				return `${baseClasses} bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800`
			case 'INFO':
				return `${baseClasses} bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800`
			default:
				return `${baseClasses} bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600`
		}
	}

	const criticalCount = activeAlerts.filter(a => a.type === 'CRITICAL').length
	const warningCount = activeAlerts.filter(a => a.type === 'WARNING').length
	const infoCount = activeAlerts.filter(a => a.type === 'INFO').length

	return (
		<div className="space-y-6">
			{/* Header mejorado */}
			<div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-md">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					<div className="flex items-center gap-4">
						<div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
							<svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
							</svg>
						</div>
						<div>
							<h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Sistema de Alertas</h2>
							<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monitoreo en tiempo real de eventos del sistema</p>
						</div>
					</div>
					{activeAlerts.length > 0 && (
						<button
							onClick={async () => {
								try {
									// Resolver todas las alertas
									await Promise.all(
										activeAlerts.map(alert => 
											resolveAlerta(alert.id)
										)
									)
									toast.success('Todas las alertas han sido reconocidas', {
										icon: '✅',
										duration: 3000
									})
									refetchAlertas()
								} catch (error) {
									toast.error('Error al reconocer alertas')
								}
							}}
							className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-md"
							disabled={loadingAlertas}
						>
							{loadingAlertas ? 'Procesando...' : '✓ Reconocer Todas'}
						</button>
					)}
				</div>
			</div>

			{/* Resumen de alertas mejorado */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
				{/* Críticas */}
				<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
					<div className="flex items-center justify-between mb-4">
						<div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
							{AlertIcons.critical("w-6 h-6 text-red-600 dark:text-red-400")}
						</div>
						<span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-xs font-semibold uppercase tracking-wider">
							Urgente
						</span>
					</div>
					<div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">{criticalCount}</div>
					<div className="text-gray-700 dark:text-gray-300 font-semibold text-sm mb-1">Alertas Críticas</div>
					<div className="text-gray-500 dark:text-gray-400 text-xs">Requieren acción inmediata</div>
				</div>

				{/* Advertencias */}
				<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
					<div className="flex items-center justify-between mb-4">
						<div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center">
							{AlertIcons.warning("w-6 h-6 text-yellow-600 dark:text-yellow-400")}
						</div>
						<span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-lg text-xs font-semibold uppercase tracking-wider">
							Atención
						</span>
					</div>
					<div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">{warningCount}</div>
					<div className="text-gray-700 dark:text-gray-300 font-semibold text-sm mb-1">Advertencias</div>
					<div className="text-gray-500 dark:text-gray-400 text-xs">Monitorear de cerca</div>
				</div>

				{/* Informativas */}
				<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
					<div className="flex items-center justify-between mb-4">
						<div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
							{AlertIcons.info("w-6 h-6 text-blue-600 dark:text-blue-400")}
						</div>
						<span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold uppercase tracking-wider">
							Info
						</span>
					</div>
					<div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{infoCount}</div>
					<div className="text-gray-700 dark:text-gray-300 font-semibold text-sm mb-1">Informativas</div>
					<div className="text-gray-500 dark:text-gray-400 text-xs">Solo informativas</div>
				</div>
			</div>

			{/* Filtros y búsqueda mejorados */}
			{activeAlerts.length > 0 && (
				<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-md">
					<div className="flex flex-col lg:flex-row gap-4">
						{/* Búsqueda */}
						<div className="flex-1">
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
									<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
									</svg>
								</div>
								<input
									type="text"
									placeholder="Buscar por cruce, ubicación o mensaje..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-12 pr-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
								/>
							</div>
						</div>

						{/* Filtros */}
						<div className="flex flex-wrap gap-2">
							<button
								onClick={() => setFilterType('ALL')}
								className={`px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
									filterType === 'ALL'
										? 'bg-blue-600 text-white'
										: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
								}`}
							>
								Todas
							</button>
							<button
								onClick={() => setFilterType('CRITICAL')}
								className={`px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
									filterType === 'CRITICAL'
										? 'bg-red-600 text-white'
										: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
								}`}
							>
								Críticas
							</button>
							<button
								onClick={() => setFilterType('WARNING')}
								className={`px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
									filterType === 'WARNING'
										? 'bg-yellow-600 text-white'
										: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
								}`}
							>
								Advertencias
							</button>
							<button
								onClick={() => setFilterType('INFO')}
								className={`px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
									filterType === 'INFO'
										? 'bg-blue-600 text-white'
										: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
								}`}
							>
								Info
							</button>
						</div>

						{/* Ordenar */}
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value)}
							className="px-4 py-3 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
						>
							<option value="priority">Por Prioridad</option>
							<option value="timestamp">Más Recientes</option>
							<option value="cruce">Por Cruce</option>
						</select>
					</div>
				</div>
			)}

			{/* Lista de alertas mejorada */}
			<div className="space-y-4">
				{loadingAlertas ? (
					<div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-md border border-gray-200 dark:border-gray-700">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p className="text-gray-600 dark:text-gray-400">Cargando alertas...</p>
					</div>
				) : filteredAlerts.length === 0 ? (
					<div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-md border border-gray-200 dark:border-gray-700">
						<div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mx-auto mb-4">
							{AlertIcons.checkCircle("w-12 h-12 text-green-600 dark:text-green-400")}
						</div>
						<p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
							¡Todo en orden!
						</p>
						<p className="text-base text-gray-600 dark:text-gray-400">
							{activeAlerts.length === 0 
								? 'No hay alertas activas en este momento'
								: 'No hay alertas que coincidan con los filtros seleccionados'
							}
						</p>
					</div>
				) : (
					filteredAlerts.map((alert, index) => (
						<div
							key={`${alert.id}-${alert.cruce.id_cruce}-${index}`}
							className={`${getAlertStyles(alert.type)} rounded-lg p-4 lg:p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700`}
						>
							<div className="flex flex-col lg:flex-row lg:items-start gap-4">
								{/* Icono */}
								<div className={`w-12 h-12 ${getAlertIconBg(alert.type)} rounded-lg flex items-center justify-center shrink-0`}>
									{AlertIcons[alert.icon] ? AlertIcons[alert.icon](`w-6 h-6 ${getAlertTextColor(alert.type)}`) : AlertIcons.warning(`w-6 h-6 ${getAlertTextColor(alert.type)}`)}
								</div>

								{/* Contenido */}
								<div className="flex-1 min-w-0">
									{/* Header */}
									<div className="flex flex-wrap items-center gap-2 mb-2">
										<span className={getAlertBadge(alert.type)}>
											{alert.type}
										</span>
										<span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400">
											<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											{alert.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
										</span>
										<span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400">
											Prioridad {alert.priority}
										</span>
									</div>

									{/* Mensaje */}
									<h3 className={`font-semibold text-base lg:text-lg mb-2 ${getAlertTextColor(alert.type)}`}>
										{typeof alert.message === 'function' ? alert.message(alert.cruce) : alert.message}
									</h3>

									{/* Acción */}
									<div className="bg-gray-50 dark:bg-gray-700/30 rounded-md p-3 mb-3 border border-gray-100 dark:border-gray-700">
										<div className="flex items-start gap-2">
											<svg className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											<div>
												<p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">Acción recomendada:</p>
												<p className="text-sm text-gray-700 dark:text-gray-300">{alert.action}</p>
											</div>
										</div>
									</div>

									{/* Detalles */}
									<div className="flex flex-wrap gap-2">
										<span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 rounded-md text-xs font-medium">
											<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
											</svg>
											{alert.cruce.ubicacion}
										</span>
										<span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 rounded-md text-xs font-medium">
											<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
											</svg>
											{alert.cruce.nombre}
										</span>
									</div>
								</div>

								{/* Botón de acción */}
								<button
									onClick={async () => {
										try {
											await resolveAlerta(alert.id)
											toast.success(`Alerta reconocida: ${alert.cruce.nombre}`, {
												icon: '✅',
												duration: 3000
											})
											refetchAlertas()
										} catch (error) {
											toast.error('Error al reconocer alerta')
										}
									}}
									className="px-4 py-2.5 text-sm font-medium bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600 shrink-0 w-full lg:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
									disabled={loadingAlertas}
								>
									{loadingAlertas ? 'Procesando...' : 'Reconocer'}
								</button>
							</div>
						</div>
					))
				)}
			</div>

			{/* Estadísticas mejoradas */}
			{activeAlerts.length > 0 && (
				<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-md">
					<div className="flex flex-wrap items-center gap-6 text-sm">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
							<span className="font-semibold text-gray-900 dark:text-white">Total de alertas:</span>
							<span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg font-bold">{activeAlerts.length}</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-orange-600 dark:bg-orange-400 rounded-full"></div>
							<span className="font-semibold text-gray-900 dark:text-white">Cruces afectados:</span>
							<span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-lg font-bold">{new Set(activeAlerts.map(a => a.cruce.id_cruce)).size}</span>
						</div>
						{filteredAlerts.length !== activeAlerts.length && (
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
								<span className="font-semibold text-gray-900 dark:text-white">Mostrando:</span>
								<span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg font-bold">{filteredAlerts.length} de {activeAlerts.length}</span>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
