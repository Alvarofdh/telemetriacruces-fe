import React, { useState } from 'react'
import { useData } from '../../../hooks/useData'
import { useAuth } from '../../../hooks/useAuth'
import { MapView } from '../../MapView'
import { ChartsPanel } from '../../charts/ChartsPanel'
import { AlertSystem } from '../../AlertSystem'
import { HistoricalCharts } from '../../charts/HistoricalCharts'
import { BasePanelLayout } from '../BasePanelLayout'

/**
 * Panel de Observador
 * Solo puede ver información, NO puede modificar nada
 */
export function ObserverPanel() {
	const { stats, isESP32Connected, lastUpdate } = useData()
	const { user } = useAuth()
	const [activeTab, setActiveTab] = useState('overview')
	const [sidebarOpen, setSidebarOpen] = useState(false)

	// Menú muy limitado para observadores (solo visualización)
	const menuItems = [
		{ id: 'overview', label: 'Resumen General', icon: 'chart' },
		{ id: 'alerts', label: 'Sistema de Alertas', icon: 'alert' },
		{ id: 'historical', label: 'Gráficos Históricos', icon: 'timeline' },
		{ id: 'map', label: 'Mapa Interactivo', icon: 'map' },
		{ id: 'charts', label: 'Gráficos Avanzados', icon: 'barChart' },
	]

	const renderContent = () => {
		switch (activeTab) {
			case 'overview':
				return (
					<div className="space-y-3 sm:space-y-4 lg:space-y-6">
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
							</div>
						</div>
					</div>
				)
			case 'alerts':
				return <AlertSystem />
			case 'historical':
				return <HistoricalCharts />
			case 'map':
				return <MapView />
			case 'charts':
				return <ChartsPanel />
			default:
				return <div>Selecciona una opción del menú</div>
		}
	}

	return (
		<BasePanelLayout
			title="Panel de Observación"
			subtitle="Visualización y Monitoreo"
			menuItems={menuItems}
			activeTab={activeTab}
			setActiveTab={setActiveTab}
			sidebarOpen={sidebarOpen}
			setSidebarOpen={setSidebarOpen}
			renderContent={renderContent}
		/>
	)
}

