// src/App.jsx
import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { ConfigProvider } from './contexts/ConfigContext'
import { CrucesProvider } from './contexts/CrucesContext'
import { UsuariosProvider } from './contexts/UsuariosContext'
import { LogsContextProvider } from './contexts/LogsContext'
import { StatsProvider } from './contexts/StatsContext'
import { SocketProvider } from './contexts/SocketContext'
import { DataProvider } from './contexts/DataContext.jsx'
import { queryClient } from './config/queryClient'
import { useData } from './hooks/useData'
import { useAuth } from './hooks/useAuth'
import { Loading } from './components/Loading'
import ErrorBoundary from './components/ErrorBoundary'
import { useAPIVerification } from './hooks/useAPIVerification'
import { useAutoLogout } from './hooks/useAutoLogout'
import { getEnvConfig } from './utils/envValidator'
import { useMetaTags } from './hooks/useMetaTags'

// Lazy loading de componentes para mejor performance
const CrossingList = lazy(() => import('./components/CrossingList').then(module => ({ default: module.CrossingList })))
const CruceDetail = lazy(() => import('./components/CruceDetail').then(module => ({ default: module.CruceDetail })))
const ThemeToggle = lazy(() => import('./components/ThemeToggle').then(module => ({ default: module.ThemeToggle })))
const NotificationPanel = lazy(() => import('./components/NotificationPanel'))
const ControlPanel = lazy(() => import('./components/control/ControlPanel').then(module => ({ default: module.ControlPanel })))
const LoginPage = lazy(() => import('./components/LoginPage').then(module => ({ default: module.LoginPage })))
const CruceMonitorPage = lazy(() => import('./components/CruceMonitorPage'))

// Componente para proteger rutas
function ProtectedRoute({ children }) {
	const { user } = useAuth()
	
	if (!user) {
		return <Navigate to="/login" replace />
	}
	
	return children
}

// Dashboard no se carga lazy porque es la página principal
function Dashboard() {
	const { stats, isESP32Connected, lastUpdate } = useData()
	const { logout, user, isAdmin } = useAuth()
	
	// Actualizar meta tags para el dashboard
	useMetaTags({
		title: 'Dashboard - Viametrica',
		description: 'Sistema de monitoreo en tiempo real de cruces ferroviarios inteligentes',
		keywords: 'cruces ferroviarios, monitoreo, dashboard, telemetría, alertas',
	})

	const handleLogout = () => {
		if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
			logout()
		}
	}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header Principal */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 sm:py-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 dark:bg-blue-500 rounded-lg shrink-0">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white break-words leading-tight">Sistema de Monitoreo</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 break-words leading-tight mt-0.5">Cruces Ferroviarios Inteligentes</p>
              </div>
            </div>
						<div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
							{/* Estado de conexión ESP32 */}
							<div className="flex items-center space-x-2 sm:space-x-3">
								<div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full shrink-0 ${isESP32Connected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
								<div className="text-left sm:text-right">
									<p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
										{isESP32Connected ? 'Conectado' : 'Respaldo'}
									</p>
									{lastUpdate && (
										<p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
											{lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
										</p>
									)}
								</div>
							</div>
							
							{/* Usuario - Ocultar en móviles muy pequeños */}
							<div className="hidden sm:block text-right border-l pl-3 sm:pl-4 border-gray-200 dark:border-gray-600">
								<p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Usuario</p>
								<p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px]">{user?.nombre || user?.email || 'Invitado'}</p>
							</div>
							
							{/* Botones - Stack en móviles */}
							<div className="flex items-center gap-2 ml-auto sm:ml-0">
								{(isAdmin || user?.profile?.role === 'MAINTENANCE' || user?.profile?.role === 'OBSERVER' || user?.role === 'MAINTENANCE' || user?.role === 'OBSERVER') && (
									<Link
										to="/control"
										className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors text-xs sm:text-sm whitespace-nowrap"
									>
										Panel de Control
									</Link>
								)}
								
								<button
									onClick={handleLogout}
									className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm whitespace-nowrap"
									title="Cerrar sesión"
								>
									Salir
								</button>
								
								<ThemeToggle />
							</div>
						</div>
          </div>
        </div>
      </header>

			{/* Panel de Estadísticas */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 sm:p-4 lg:p-6 fade-in border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Total Cruces</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCruces}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center shrink-0 ml-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 sm:p-4 lg:p-6 fade-in border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Activos</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400">{stats.activos}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center shrink-0 ml-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 sm:p-4 lg:p-6 fade-in border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Mantenimiento</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.mantenimiento}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center shrink-0 ml-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 sm:p-4 lg:p-6 fade-in border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Inactivos</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 dark:text-red-400">{stats.inactivos}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center shrink-0 ml-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 sm:p-4 lg:p-6 fade-in border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Alertas Batería</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.alertasBateria}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center shrink-0 ml-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
					</div>
				</div>

				{/* Contenido Principal */}
				<div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
					{/* Lista de Cruces - Columna principal */}
					<main className="lg:col-span-3 fade-in order-2 lg:order-1">
						<Suspense fallback={<Loading message="Cargando cruces..." />}>
							<CrossingList />
						</Suspense>
					</main>
          
          {/* Panel de Alertas - Sidebar */}
          <aside className="lg:col-span-1 fade-in order-1 lg:order-2" style={{ animationDelay: '0.2s' }}>
            <div className="sticky top-4 sm:top-8 space-y-4">
							<Suspense fallback={<Loading message="Cargando notificaciones..." />}>
								<NotificationPanel />
							</Suspense>
            </div>
					</aside>
				</div>
			</div>
		</div>
	)
}

// Componente interno para manejar hooks que requieren Router
function RouterContent() {
	const { user, isAdmin } = useAuth()
	const envConfig = getEnvConfig()
	
	// Activar auto-logout después de inactividad (debe estar dentro del Router)
	useAutoLogout(envConfig.AUTO_LOGOUT_MINUTES)

	return (
			<Routes>
				{/* Ruta de login - pública */}
				<Route 
					path="/login" 
					element={user ? <Navigate to="/" replace /> : <LoginPage />} 
				/>
				
				{/* Rutas protegidas - requieren autenticación */}
				<Route 
					path="/" 
					element={
						<ProtectedRoute>
							<Dashboard />
						</ProtectedRoute>
					} 
				/>
				<Route 
					path="/cruce/:id" 
					element={
						<ProtectedRoute>
							<CruceDetail />
						</ProtectedRoute>
					} 
				/>
				<Route 
					path="/monitor/:id" 
					element={
						<ProtectedRoute>
							<Suspense fallback={<Loading />}>
								<CruceMonitorPage />
							</Suspense>
						</ProtectedRoute>
					} 
				/>
				<Route 
					path="/control" 
					element={
						<ProtectedRoute>
							<Suspense fallback={<Loading />}>
								<ControlPanel />
							</Suspense>
						</ProtectedRoute>
					} 
				/>
				{/* Redirigir /admin a /control para mantener compatibilidad */}
				<Route 
					path="/admin" 
					element={<Navigate to="/control" replace />} 
				/>
				
				{/* Ruta por defecto - redirige a login */}
				<Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
			</Routes>
	)
}

function AppContent() {
	// Activar verificación de API (expone funciones en window)
	useAPIVerification()

	return (
		<Router>
			<RouterContent />
		</Router>
	)
}

export default function App() {
	return (
		<ErrorBoundary>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider>
					<AuthProvider>
						<ConfigProvider>
							<CrucesProvider>
								<UsuariosProvider>
									<LogsContextProvider>
										<StatsProvider>
											<SocketProvider>
												<DataProvider>
													<Toaster
														position="top-right"
														toastOptions={{
															duration: 4000,
															style: {
																background: '#363636',
																color: '#fff',
															},
															success: {
																duration: 3000,
																iconTheme: {
																	primary: '#22c55e',
																	secondary: '#fff',
																},
															},
															error: {
																duration: 4000,
																iconTheme: {
																	primary: '#ef4444',
																	secondary: '#fff',
																},
															},
														}}
													/>
													<AppContent />
												</DataProvider>
											</SocketProvider>
										</StatsProvider>
									</LogsContextProvider>
								</UsuariosProvider>
							</CrucesProvider>
						</ConfigProvider>
					</AuthProvider>
				</ThemeProvider>
			</QueryClientProvider>
		</ErrorBoundary>
	)
}
