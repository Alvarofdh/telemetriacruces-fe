/**
 * Validador de variables de entorno
 * Verifica que todas las variables requeridas estén configuradas
 */

const REQUIRED_VARS = [
	'VITE_API_BASE_URL',
]

const OPTIONAL_VARS = {
	VITE_API_TIMEOUT: 30000,
	VITE_DEBUG_MODE: 'false',
	VITE_APP_VERSION: '1.0.0',
	VITE_APP_ENV: 'production',
	VITE_AUTO_LOGOUT_MINUTES: 30,
}

/**
 * Validar variables de entorno requeridas
 */
export const validateEnv = () => {
	const missing = []
	const warnings = []

	// Verificar variables requeridas
	REQUIRED_VARS.forEach(varName => {
		if (!import.meta.env[varName]) {
			missing.push(varName)
		}
	})

	// Verificar variables opcionales y mostrar advertencias
	Object.keys(OPTIONAL_VARS).forEach(varName => {
		if (!import.meta.env[varName]) {
			warnings.push({
				var: varName,
				default: OPTIONAL_VARS[varName],
			})
		}
	})

	// Si faltan variables requeridas, lanzar error
	if (missing.length > 0) {
		const errorMessage = `❌ Variables de entorno faltantes: ${missing.join(', ')}\n\nPor favor, crea un archivo .env con estas variables. Puedes usar .env.example como plantilla.`
		console.error(errorMessage)
		throw new Error(errorMessage)
	}

	// Mostrar advertencias en modo desarrollo
	if (import.meta.env.DEV && warnings.length > 0) {
		console.warn('⚠️ Variables de entorno no configuradas (usando valores por defecto):')
		warnings.forEach(({ var: varName, default: defaultValue }) => {
			console.warn(`   - ${varName}: ${defaultValue}`)
		})
	}

	// Validar formato de URL
	const apiUrl = import.meta.env.VITE_API_BASE_URL
	if (apiUrl && !apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
		console.warn(`⚠️ VITE_API_BASE_URL no parece ser una URL válida: ${apiUrl}`)
	}

	// Validar timeout
	const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || OPTIONAL_VARS.VITE_API_TIMEOUT)
	if (isNaN(timeout) || timeout < 1000) {
		console.warn(`⚠️ VITE_API_TIMEOUT debe ser un número mayor a 1000ms. Usando valor por defecto: ${OPTIONAL_VARS.VITE_API_TIMEOUT}`)
	}

	return {
		valid: true,
		missing,
		warnings,
	}
}

/**
 * Obtener configuración validada
 */
export const getEnvConfig = () => {
	return {
		API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
		API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || OPTIONAL_VARS.VITE_API_TIMEOUT),
		DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
		APP_VERSION: import.meta.env.VITE_APP_VERSION || OPTIONAL_VARS.VITE_APP_VERSION,
		APP_ENV: import.meta.env.VITE_APP_ENV || OPTIONAL_VARS.VITE_APP_ENV,
		AUTO_LOGOUT_MINUTES: parseInt(import.meta.env.VITE_AUTO_LOGOUT_MINUTES || OPTIONAL_VARS.VITE_AUTO_LOGOUT_MINUTES),
		GA_ID: import.meta.env.VITE_GA_ID || null,
		SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || null,
	}
}

