import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../hooks/useData'
import { useAuth } from '../../hooks/useAuth'
import { CruceManagement } from './CruceManagement'
import { UserManagement } from './UserManagement'
import { SystemLogs } from './SystemLogs'
import { SystemConfig } from './SystemConfig'
import { AnalyticsPanel } from './AnalyticsPanel'
import { MapView } from '../MapView'
import { ChartsPanel } from '../charts/ChartsPanel'
import { ThemeToggle } from '../ThemeToggle'
import { AlertSystem } from '../AlertSystem'
import { HistoricalCharts } from '../charts/HistoricalCharts'
import { ExportData } from '../ExportData'
import { SimulatorPanel } from './SimulatorPanel'

export function AdminDashboard() {
	const navigate = useNavigate()
	const { stats, isESP32Connected, lastUpdate } = useData()
	const { user, logout } = useAuth()
	const [activeTab, setActiveTab] = useState('overview')
	const [sidebarOpen, setSidebarOpen] = useState(false)

	const menuItems = [
		{ id: 'overview', label: 'Resumen General', icon: 'chart' },
		{ id: 'alerts', label: 'Sistema de Alertas', icon: 'alert', badge: 'NUEVO' },
		{ id: 'historical', label: 'Gráficos Históricos', icon: 'timeline', badge: 'NUEVO' },
		{ id: 'export', label: 'Exportar Datos', icon: 'download', badge: 'NUEVO' },
		{ id: 'simulator', label: 'Panel de Simulación', icon: 'simulator', badge: 'DEMO' },
		{ id: 'cruces', label: 'Gestión de Cruces', icon: 'location' },
		{ id: 'usuarios', label: 'Gestión de Usuarios', icon: 'users' },
		{ id: 'map', label: 'Mapa Interactivo', icon: 'map' },
		{ id: 'charts', label: 'Gráficos Avanzados', icon: 'barChart' },
		{ id: 'analytics', label: 'Análisis y Reportes', icon: 'analytics' },
		{ id: 'logs', label: 'Logs del Sistema', icon: 'list' },
		{ id: 'config', label: 'Configuración', icon: 'settings' }
	]

	const getIcon = (iconName) => {
		const icons = {
			chart: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
				</svg>
			),
			alert: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
				</svg>
			),
			timeline: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			),
			download: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
				</svg>
			),
			simulator: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			),
			compare: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			),
			location: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			),
			users: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
				</svg>
			),
			map: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
				</svg>
			),
			barChart: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
				</svg>
			),
			analytics: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
				</svg>
			),
			list: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
				</svg>
			),
			settings: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			)
		}
		return icons[iconName] || null
	}

	const handleLogout = () => {
		if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
			logout()
		}
	}

	const renderContent = () => {
		switch (activeTab) {
			case 'overview':
				return (
					<div className="space-y-3 sm:space-y-4 lg:space-y-6">
						{/* Estadísticas principales */}
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6">
							<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-2 sm:p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
									<div className="min-w-0 flex-1">
										<p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 dark:text-gray-400 break-words leading-tight">Total Cruces</p>
										<p className="text-lg sm:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCruces}</p>
									</div>
									<div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center shrink-0 sm:ml-2 self-start sm:self-auto">
										<svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
										</svg>
									</div>
								</div>
							</div>

							<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-2 sm:p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
									<div className="min-w-0 flex-1">
										<p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 dark:text-gray-400 break-words leading-tight">Activos</p>
										<p className="text-lg sm:text-xl lg:text-3xl font-bold text-green-600 dark:text-green-400">{stats.activos}</p>
									</div>
									<div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center shrink-0 sm:ml-2 self-start sm:self-auto">
										<svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
								</div>
							</div>

							<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-2 sm:p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
									<div className="min-w-0 flex-1">
										<p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 dark:text-gray-400 break-words leading-tight">Mantenimiento</p>
										<p className="text-lg sm:text-xl lg:text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.mantenimiento}</p>
									</div>
									<div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center shrink-0 sm:ml-2 self-start sm:self-auto">
										<svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
										</svg>
									</div>
								</div>
							</div>

							<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-2 sm:p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
									<div className="min-w-0 flex-1">
										<p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 dark:text-gray-400 break-words leading-tight">Alertas Batería</p>
										<p className="text-lg sm:text-xl lg:text-3xl font-bold text-red-600 dark:text-red-400">{stats.alertasBateria}</p>
									</div>
									<div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center shrink-0 sm:ml-2 self-start sm:self-auto">
										<svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
										</svg>
									</div>
								</div>
							</div>
						</div>

						{/* Información del sistema */}
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
							<h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 lg:mb-4 break-words">Estado del Sistema</h3>
							<div className="space-y-2 sm:space-y-3">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
									<span className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 break-words">Conexión Backend:</span>
									<span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs lg:text-sm font-medium shrink-0 ${isESP32Connected ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
										{isESP32Connected ? 'Conectado' : 'Desconectado'}
									</span>
								</div>
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
									<span className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 break-words">Última actualización:</span>
									<span className="text-xs sm:text-sm lg:text-base text-gray-900 dark:text-white font-medium break-words">
										{lastUpdate ? lastUpdate.toLocaleTimeString('es-ES') : 'N/A'}
									</span>
								</div>
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
									<span className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 break-words">Usuario activo:</span>
									<span className="text-xs sm:text-sm lg:text-base text-gray-900 dark:text-white font-medium break-all">{user?.nombre || user?.email || 'N/A'}</span>
								</div>
							</div>
						</div>
					</div>
				)
			case 'alerts':
				return <AlertSystem />
			case 'historical':
				return <HistoricalCharts />
			case 'export':
				return <ExportData />
			case 'simulator':
				return <SimulatorPanel />
			case 'cruces':
				return <CruceManagement />
			case 'usuarios':
				return <UserManagement />
			case 'map':
				return <MapView />
			case 'charts':
				return <ChartsPanel />
			case 'analytics':
				return <AnalyticsPanel />
			case 'logs':
				return <SystemLogs />
			case 'config':
				return <SystemConfig />
			default:
				return <div>Selecciona una opción del menú</div>
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
			{/* Header */}
			<header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-8">
					<div className="flex justify-between items-center py-2 sm:py-3 lg:py-6">
						<div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
							{/* Botón menú hamburguesa para móvil */}
							<button
								onClick={() => setSidebarOpen(!sidebarOpen)}
								className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 touch-manipulation"
								aria-label="Toggle menu"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									{sidebarOpen ? (
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									) : (
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
									)}
								</svg>
							</button>
							<div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-red-600 dark:bg-red-500 rounded-lg shrink-0">
								<svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
							</div>
							<div className="min-w-0 flex-1">
								<h1 className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900 dark:text-white break-words leading-tight">Panel de Administración</h1>
								<p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 dark:text-gray-300 hidden sm:block truncate">Gestión del Sistema</p>
							</div>
						</div>
						<div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
							<ThemeToggle />
							<button
								onClick={() => navigate('/')}
								className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors whitespace-nowrap touch-manipulation active:bg-blue-800"
							>
								<span className="hidden sm:inline">Dashboard</span>
								<span className="sm:hidden">Home</span>
							</button>
							<button
								onClick={handleLogout}
								className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 transition-colors whitespace-nowrap touch-manipulation active:bg-gray-800"
							>
								<span className="hidden sm:inline">Cerrar Sesión</span>
								<span className="sm:hidden">Salir</span>
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-8 py-3 sm:py-4 lg:py-8">
				<div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
					{/* Sidebar - Oculto en móvil, visible en desktop */}
					<div className={`lg:w-64 xl:w-72 shrink-0 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
						{/* Overlay para móvil */}
						{sidebarOpen && (
							<div 
								className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
								onClick={() => setSidebarOpen(false)}
							/>
						)}
						<div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden ${
							sidebarOpen ? 'fixed left-0 top-[64px] sm:top-[72px] bottom-0 w-72 sm:w-80 z-50 lg:static lg:z-auto lg:top-auto lg:w-64 xl:w-72' : ''
						}`}>
							<div className="p-2 sm:p-3 lg:p-4">
								<div className="flex items-center justify-between mb-3 sm:mb-4">
									<h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white">Menú</h2>
									<button
										onClick={() => setSidebarOpen(false)}
										className="lg:hidden p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation"
										aria-label="Cerrar menú"
									>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
								<nav className="space-y-0.5 sm:space-y-1 max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-8rem)] overflow-y-auto -mx-2 sm:mx-0 px-2 sm:px-0">
									{menuItems.map((item) => (
										<button
											key={item.id}
											onClick={() => {
												setActiveTab(item.id)
												setSidebarOpen(false) // Cerrar sidebar en móvil al seleccionar
											}}
											className={`w-full flex items-center justify-between px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 rounded-lg transition-colors text-left touch-manipulation ${
												activeTab === item.id
													? 'bg-blue-600 text-white'
													: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
											}`}
										>
											<div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
												<div className="shrink-0">
												{getIcon(item.icon)}
												</div>
												<span className="text-xs sm:text-sm font-medium break-words leading-tight">{item.label}</span>
											</div>
											{item.badge && (
												<span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold bg-green-500 text-white rounded-full shrink-0 ml-2 whitespace-nowrap">
													{item.badge}
												</span>
											)}
										</button>
									))}
								</nav>
							</div>
						</div>
					</div>

					{/* Content Area */}
					<div className="flex-1 min-w-0 w-full lg:w-auto">
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-2 sm:p-3 lg:p-6 overflow-x-hidden">
							{renderContent()}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
