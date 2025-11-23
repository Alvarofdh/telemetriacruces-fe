import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ThemeToggle } from '../ThemeToggle'

/**
 * Componente base compartido para todos los paneles de control
 * Proporciona la estructura común (header, sidebar, content area)
 */
export function BasePanelLayout({
	title,
	subtitle,
	menuItems,
	activeTab,
	setActiveTab,
	sidebarOpen,
	setSidebarOpen,
	renderContent
}) {
	const navigate = useNavigate()
	const { logout } = useAuth()

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
			navigate('/login')
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
							<div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 dark:bg-blue-500 rounded-lg shrink-0">
								<svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
								</svg>
							</div>
							<div className="min-w-0 flex-1">
								<h1 className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900 dark:text-white break-words leading-tight">{title}</h1>
								<p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 dark:text-gray-300 hidden sm:block truncate">{subtitle}</p>
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
					{/* Sidebar */}
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
												setSidebarOpen(false)
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

