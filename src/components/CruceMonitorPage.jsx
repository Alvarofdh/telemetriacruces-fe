import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CruceMonitor from './CruceMonitor';
import { useAuth } from '../hooks/useAuth';

/**
 * Página wrapper para CruceMonitor que maneja el parámetro de ruta
 */
const CruceMonitorPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const cruceId = parseInt(id);

	const handleLogout = () => {
		if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
			logout();
		}
	};

	const handleBack = () => {
		navigate('/');
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
			{/* Header */}
			<header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<div className="flex items-center space-x-4">
							<button
								onClick={handleBack}
								className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
								title="Volver al dashboard"
							>
								<svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
								</svg>
							</button>
							<div>
								<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
									Monitor en Tiempo Real - Cruce {cruceId}
								</h1>
								<p className="text-sm text-gray-600 dark:text-gray-300">
									Monitoreo con Socket.IO
								</p>
							</div>
						</div>
						<div className="flex items-center gap-4">
							<div className="text-right">
								<p className="text-sm text-gray-500 dark:text-gray-400">Usuario</p>
								<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
									{user?.nombre || user?.email || 'Invitado'}
								</p>
							</div>
							<button
								onClick={handleLogout}
								className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
							>
								Cerrar Sesión
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Contenido principal */}
			<main className="py-6">
				<CruceMonitor cruceId={cruceId} />
			</main>
		</div>
	);
};

export default CruceMonitorPage;

