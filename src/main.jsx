import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { validateEnv } from './utils/envValidator'

// Validar variables de entorno al iniciar
try {
	validateEnv()
} catch (error) {
	console.error('Error de configuración:', error.message)
	// En desarrollo, mostrar error en pantalla
	if (import.meta.env.DEV) {
		document.body.innerHTML = `
			<div style="
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background: #f3f4f6;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				font-family: sans-serif;
				padding: 20px;
				box-sizing: border-box;
			">
				<h1 style="color: #dc2626; margin-bottom: 16px;">Error de Configuración</h1>
				<p style="color: #6b7280; margin-bottom: 24px; text-align: center; max-width: 600px;">
					${error.message}
				</p>
				<p style="color: #6b7280; text-align: center; max-width: 600px;">
					Por favor, crea un archivo <code>.env</code> basado en <code>.env.example</code>
				</p>
			</div>
		`
		throw error
	}
}

// Ocultar pantalla de carga cuando React se monta
document.body.classList.add('loaded')

// Registrar Service Worker para PWA (solo en producción)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js')
			.then(registration => {
				console.log('✅ Service Worker registrado:', registration.scope)
			})
			.catch(error => {
				console.log('❌ Error al registrar Service Worker:', error)
			})
	})
}

// Monitorear rendimiento en desarrollo
if (import.meta.env.DEV) {
	import('./utils/performanceMonitor').then(({ monitorMemory }) => {
		setInterval(() => {
			monitorMemory()
		}, 30000) // Cada 30 segundos
	})
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
