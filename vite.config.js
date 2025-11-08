import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	// Cargar variables de entorno basadas en el modo
	// eslint-disable-next-line no-undef
	const env = loadEnv(mode, process.cwd(), '')
	
	return {
		plugins: [react(), tailwindcss()],
		
		// Configuración del servidor de desarrollo
		server: {
			port: 5173,
			host: true,
			open: true,
		},
		
		// Configuración de preview
		preview: {
			port: 8080,
			host: true,
		},
		
		// Optimizaciones de build
		build: {
			outDir: 'dist',
			sourcemap: mode !== 'production',
			minify: 'esbuild',
			target: 'es2015',
			rollupOptions: {
				output: {
					manualChunks: {
						'react-vendor': ['react', 'react-dom', 'react-router-dom'],
						'chart-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],
						'map-vendor': ['leaflet', 'react-leaflet'],
						'utils': ['jspdf', 'jspdf-autotable', 'react-hot-toast'],
					},
				},
			},
			chunkSizeWarningLimit: 1000,
		},
		
		// Definir variables de entorno adicionales
		define: {
			__APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
			__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
		},
	}
})
