import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { CruceManagement } from './admin/CruceManagement'
import { UserManagement } from './admin/UserManagement'
import { SystemLogs } from './admin/SystemLogs'
import { SystemConfig } from './admin/SystemConfig'
import { AnalyticsPanel } from './admin/AnalyticsPanel'
import { MapView } from './MapView'
import { ChartsPanel } from './ChartsPanel'
import { ThemeToggle } from './ThemeToggle'
import { AlertSystem } from './AlertSystem'
import { HistoricalCharts } from './HistoricalCharts'
import { ExportData } from './ExportData'

export function AdminDashboard() {
	const navigate = useNavigate()
	const { stats, user, logout, isESP32Connected, lastUpdate } = useData()
	const [activeTab, setActiveTab] = useState('overview')

	const menuItems = [
		{ id: 'overview', label: 'Resumen General', icon: 'chart' },
		{ id: 'alerts', label: 'Sistema de Alertas', icon: 'alert', badge: 'NUEVO' },
		{ id: 'historical', label: 'Gráficos Históricos', icon: 'timeline', badge: 'NUEVO' },
		{ id: 'export', label: 'Exportar Datos', icon: 'download', badge: 'NUEVO' },
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
					<div className="space-y-6">
						{/* Estadísticas principales */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600 dark:text-gray-400">Total Cruces</p>
										<p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCruces}</p>
									</div>
									<div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
										<svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
										</svg>
									</div>
								</div>
							</div>

							<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600 dark:text-gray-400">Activos</p>
										<p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.activos}</p>
									</div>
									<div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
										<svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
								</div>
							</div>

							<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600 dark:text-gray-400">Mantenimiento</p>
										<p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.mantenimiento}</p>
									</div>
									<div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
										<svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
										</svg>
									</div>
								</div>
							</div>

							<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600 dark:text-gray-400">Alertas Batería</p>
										<p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.alertasBateria}</p>
									</div>
									<div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
										<svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
										</svg>
									</div>
								</div>
							</div>
						</div>

						{/* Información del sistema */}
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
							<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Estado del Sistema</h3>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-gray-600 dark:text-gray-400">Conexión Backend:</span>
									<span className={`px-3 py-1 rounded-full text-sm font-medium ${isESP32Connected ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
										{isESP32Connected ? 'Conectado' : 'Desconectado'}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-600 dark:text-gray-400">Última actualización:</span>
									<span className="text-gray-900 dark:text-white font-medium">
										{lastUpdate ? lastUpdate.toLocaleTimeString('es-ES') : 'N/A'}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-600 dark:text-gray-400">Usuario activo:</span>
									<span className="text-gray-900 dark:text-white font-medium">{user?.nombre || user?.email}</span>
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
			<header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<div className="flex items-center space-x-4">
							<div className="flex items-center justify-center w-12 h-12 bg-red-600 dark:bg-red-500 rounded-lg">
								<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
							</div>
							<div>
								<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
								<p className="text-sm text-gray-600 dark:text-gray-300">Gestión del Sistema</p>
							</div>
						</div>
						<div className="flex items-center space-x-4">
							<ThemeToggle />
							<button
								onClick={() => navigate('/')}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
							>
								Dashboard
							</button>
							<button
								onClick={handleLogout}
								className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 transition-colors"
							>
								Cerrar Sesión
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex flex-col lg:flex-row gap-6">
					{/* Sidebar */}
					<div className="lg:w-64 flex-shrink-0">
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
							<div className="p-4">
								<h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Menú</h2>
								<nav className="space-y-1">
									{menuItems.map((item) => (
										<button
											key={item.id}
											onClick={() => setActiveTab(item.id)}
											className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
												activeTab === item.id
													? 'bg-blue-600 text-white'
													: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
											}`}
										>
											<div className="flex items-center space-x-3">
												{getIcon(item.icon)}
												<span className="text-sm font-medium">{item.label}</span>
											</div>
											{item.badge && (
												<span className="px-2 py-1 text-xs font-bold bg-green-500 text-white rounded-full">
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
					<div className="flex-1">
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
							{renderContent()}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
