// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { DataProvider, useData } from './contexts/DataContext'
import { CrossingList } from './components/CrossingList'
import { AlertPanel } from './components/AlertPanel'
import { CruceDetail } from './components/CruceDetail'
import { ThemeToggle } from './components/ThemeToggle'
import { AdminDashboard } from './components/AdminDashboard'
import { LoginPage } from './components/LoginPage'

// Componente para proteger rutas
function ProtectedRoute({ children }) {
	const { user } = useData()
	
	if (!user) {
		return <Navigate to="/login" replace />
	}
	
	return children
}

function Dashboard() {
	const { stats, logout, user, isESP32Connected, lastUpdate } = useData()

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
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sistema de Monitoreo</h1>
                <p className="text-gray-600 dark:text-gray-300">Cruces Ferroviarios Inteligentes</p>
              </div>
            </div>
						<div className="flex items-center space-x-4">
							{/* Estado de conexión ESP32 */}
							<div className="text-right">
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{isESP32Connected ? 'ESP32 Conectado' : 'Datos de Respaldo'}
								</p>
								<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
									{lastUpdate ? lastUpdate.toLocaleTimeString('es-ES') : 'Sin datos'}
								</p>
							</div>
							<div className={`w-3 h-3 rounded-full ${isESP32Connected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
							
							{/* Usuario */}
							<div className="text-right border-l pl-4 border-gray-200 dark:border-gray-600">
								<p className="text-sm text-gray-500 dark:text-gray-400">Usuario</p>
								<p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.nombre || 'Invitado'}</p>
							</div>
							
							<a
								href="/admin"
								className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors text-sm"
							>
								Admin
							</a>
							
							<button
								onClick={handleLogout}
								className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 transition-colors text-sm"
								title="Cerrar sesión"
							>
								Salir
							</button>
							
							<ThemeToggle />
						</div>
          </div>
        </div>
      </header>

			{/* Panel de Estadísticas */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 fade-in border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cruces</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCruces}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 fade-in border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Activos</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.activos}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 fade-in border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mantenimiento</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.mantenimiento}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 fade-in border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactivos</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.inactivos}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 fade-in border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Alertas Batería</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.alertasBateria}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
					</div>
				</div>

				{/* Contenido Principal */}
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
					{/* Lista de Cruces - Columna principal */}
					<main className="lg:col-span-3 fade-in">
						<CrossingList />
					</main>
          
          {/* Panel de Alertas - Sidebar */}
          <aside className="lg:col-span-1 fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="sticky top-8">
              <AlertPanel />
            </div>
					</aside>
				</div>
			</div>
		</div>
	)
}

function AppContent() {
	const { user, isAdmin } = useData()

	return (
		<Router>
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
					path="/admin" 
					element={
						<ProtectedRoute>
							{user && isAdmin ? <AdminDashboard /> : <Navigate to="/" replace />}
						</ProtectedRoute>
					} 
				/>
				
				{/* Ruta por defecto - redirige a login */}
				<Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
			</Routes>
		</Router>
	)
}

export default function App() {
	return (
		<ThemeProvider>
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
		</ThemeProvider>
	)
}
