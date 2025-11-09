import React from 'react'

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props)
		this.state = { hasError: false, error: null, errorInfo: null }
	}

	static getDerivedStateFromError() {
		// Actualiza el estado para que la próxima renderización muestre la UI de fallback
		return { hasError: true }
	}

	componentDidCatch(error, errorInfo) {
		// Log del error a un servicio de reporte de errores
		console.error('Error capturado por ErrorBoundary:', error, errorInfo)
		
		this.setState({
			error,
			errorInfo,
		})

		// Aquí puedes enviar el error a un servicio de monitoreo como Sentry
		// if (window.Sentry) {
		//   window.Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })
		// }
	}

	handleReload = () => {
		window.location.reload()
	}

	handleGoHome = () => {
		window.location.href = '/'
	}

	render() {
		if (this.state.hasError) {
			// Puedes renderizar cualquier UI de fallback personalizada
			return (
				<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-8">
						<div className="text-center">
							{/* Icono de error */}
							<div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mx-auto mb-4">
								<svg
									className="w-8 h-8 text-red-600 dark:text-red-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
									/>
								</svg>
							</div>

							{/* Título */}
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
								Algo salió mal
							</h1>
							<p className="text-gray-600 dark:text-gray-300 mb-6">
								Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta recargar la página.
							</p>

							{/* Información del error (solo en modo debug) */}
							{import.meta.env.VITE_DEBUG_MODE === 'true' && this.state.error && (
								<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-left">
									<p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
										Error:
									</p>
									<p className="text-xs text-red-700 dark:text-red-400 font-mono mb-4 break-all">
										{this.state.error.toString()}
									</p>
									{this.state.errorInfo && (
										<details className="mt-2">
											<summary className="text-sm font-semibold text-red-800 dark:text-red-300 cursor-pointer">
												Stack trace
											</summary>
											<pre className="text-xs text-red-700 dark:text-red-400 mt-2 overflow-auto max-h-48 font-mono whitespace-pre-wrap">
												{this.state.errorInfo.componentStack}
											</pre>
										</details>
									)}
								</div>
							)}

							{/* Botones de acción */}
							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<button
									onClick={this.handleReload}
									className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-medium"
								>
									Recargar Página
								</button>
								<button
									onClick={this.handleGoHome}
									className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
								>
									Ir al Inicio
								</button>
							</div>

							{/* Información adicional */}
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
								Si el problema persiste, por favor contacta al soporte técnico.
							</p>
						</div>
					</div>
				</div>
			)
		}

		return this.props.children
	}
}

export default ErrorBoundary

