// Cliente HTTP centralizado con manejo de autenticación JWT y errores
import { apiRateLimiter } from '../utils/rateLimiter'

const API_CONFIG = {
	BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://viametrica-be.psicosiodev.me',
	TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
	DEBUG: import.meta.env.VITE_DEBUG_MODE === 'true',
}

// Storage keys
const STORAGE_KEYS = {
	ACCESS_TOKEN: 'auth_access_token',
	REFRESH_TOKEN: 'auth_refresh_token',
	USER: 'auth_user',
}

// ✅ CORRECCIÓN: Callback global para limpiar usuario cuando hay 401
// Será registrado por AuthContext para sincronizar el estado
let onUnauthorizedCallback = null

/**
 * Registrar callback para cuando hay 401 (no autorizado)
 * @param {Function} callback - Función a llamar cuando hay 401
 */
export const setOnUnauthorized = (callback) => {
	onUnauthorizedCallback = callback
}

// Log de configuración en modo debug
if (API_CONFIG.DEBUG) {
	console.log('🔧 API Configuration:', {
		BASE_URL: API_CONFIG.BASE_URL,
		TIMEOUT: API_CONFIG.TIMEOUT,
		ENV: import.meta.env.MODE,
	})
}

/**
 * Obtener token de acceso del localStorage
 */
export const getAccessToken = () => {
	return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
}

/**
 * Obtener refresh token del localStorage
 */
export const getRefreshToken = () => {
	return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
}

/**
 * Guardar tokens en localStorage
 */
export const setTokens = (accessToken, refreshToken) => {
	if (accessToken) {
		localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
	}
	if (refreshToken) {
		localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
	}
}

/**
 * Eliminar tokens del localStorage
 */
export const clearTokens = () => {
	localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
	localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
	localStorage.removeItem(STORAGE_KEYS.USER)
}

/**
 * Verificar si hay un token válido
 */
export const isAuthenticated = () => {
	return !!getAccessToken()
}

/**
 * Refrescar token de acceso usando refresh token
 */
const refreshAccessToken = async () => {
	const refreshToken = getRefreshToken()
	if (!refreshToken) {
		throw new Error('No hay refresh token disponible')
	}

	try {
		const response = await fetch(`${API_CONFIG.BASE_URL}/api/token/refresh`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ refresh: refreshToken }),
		})

		if (!response.ok) {
			throw new Error('Error al refrescar token')
		}

		const data = await response.json()
		if (data.access) {
			setTokens(data.access, refreshToken)
			return data.access
		}
		throw new Error('No se recibió access token')
	} catch (error) {
		clearTokens()
		throw error
	}
}

/**
 * Clase de error personalizada para errores de API
 */
export class APIError extends Error {
	constructor(message, status, data = null) {
		super(message)
		this.name = 'APIError'
		this.status = status
		this.data = data
	}
}

/**
 * Función para hacer peticiones HTTP con timeout, autenticación y manejo de errores
 */
const fetchWithTimeout = async (url, options = {}) => {
	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

	try {
		// Obtener token de acceso
		const accessToken = getAccessToken()
		
		// Preparar headers
		const headers = {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			...options.headers,
		}

		// Agregar token de autenticación si existe
		if (accessToken && !url.includes('/api/login') && !url.includes('/api/register') && !url.includes('/api/esp32/telemetria')) {
			headers['Authorization'] = `Bearer ${accessToken}`
		}

		const response = await fetch(url, {
			...options,
			signal: controller.signal,
			headers,
		})

		clearTimeout(timeoutId)

		// Si la respuesta es 401 (no autorizado), intentar refrescar el token
		if (response.status === 401 && accessToken && !url.includes('/api/token/refresh') && !url.includes('/api/login')) {
			if (API_CONFIG.DEBUG) {
				console.log('🔄 Token expirado, intentando refrescar...')
			}
			
			try {
				const newAccessToken = await refreshAccessToken()
				// Reintentar la petición original con el nuevo token
				headers['Authorization'] = `Bearer ${newAccessToken}`
				
				const retryResponse = await fetch(url, {
					...options,
					signal: controller.signal,
					headers,
				})
				
				return retryResponse
			} catch (refreshError) {
				if (API_CONFIG.DEBUG) {
					console.error('❌ Error al refrescar token:', refreshError)
				}
				// Si falla el refresh, limpiar tokens y lanzar error
				clearTokens()
				throw new APIError('Sesión expirada. Por favor, inicia sesión nuevamente.', 401)
			}
		}

		return response
	} catch (error) {
		clearTimeout(timeoutId)
		
		if (error.name === 'AbortError') {
			throw new APIError('La petición tardó demasiado tiempo', 408)
		}
		
		if (error instanceof APIError) {
			throw error
		}
		
		if (API_CONFIG.DEBUG) {
			console.error('❌ Fetch error:', {
				url,
				error: error.message,
				type: error.name,
			})
		}
		
		throw new APIError(error.message || 'Error de conexión', 0)
	}
}

/**
 * Función helper para parsear respuestas JSON con mejor manejo de errores
 */
const parseJSON = async (response) => {
	try {
		const text = await response.text()
		if (!text) {
			return null
		}
		return JSON.parse(text)
	} catch (error) {
		if (API_CONFIG.DEBUG) {
			console.error('❌ Error parsing JSON:', error)
		}
		throw new APIError(`Error al parsear respuesta JSON: ${error.message}`, response.status)
	}
}

/**
 * Función principal para hacer peticiones HTTP
 */
export const httpClient = async (endpoint, options = {}) => {
	const url = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.BASE_URL}${endpoint}`
	
	// Rate limiting para requests GET
	if ((options.method === 'GET' || !options.method) && !apiRateLimiter.isAllowed(endpoint)) {
		throw new APIError('Demasiadas peticiones. Por favor, espera un momento.', 429)
	}
	
	try {
		const response = await fetchWithTimeout(url, options)
		
		// ✅ CORRECCIÓN: Soporte para responseType: 'blob' (exportaciones CSV)
		if (options.responseType === 'blob') {
			if (!response.ok) {
				// Intentar parsear error como JSON si es posible
				const errorText = await response.text()
				let errorData = null
				try {
					errorData = JSON.parse(errorText)
				} catch {
					// Si no es JSON, usar el texto como mensaje
					throw new APIError(errorText || `Error HTTP ${response.status}`, response.status)
				}
				const errorMessage = errorData?.error || errorData?.detail || errorData?.message || `Error HTTP ${response.status}`
				throw new APIError(errorMessage, response.status, errorData)
			}
			
			if (API_CONFIG.DEBUG) {
				console.log(`✅ ${response.status} ${options.method || 'GET'} ${url} (blob)`)
			}
			
			return await response.blob()
		}
		
		// Parsear como JSON para respuestas normales
		const data = await parseJSON(response)

		if (API_CONFIG.DEBUG) {
			console.log(`✅ ${response.status} ${options.method || 'GET'} ${url}`)
			if (data && typeof data === 'object' && data.results) {
				console.log(`   📊 ${data.results.length} items${data.count ? ` de ${data.count} total` : ''}`)
			}
		}

		// Si la respuesta no es exitosa, lanzar error
		if (!response.ok) {
			const errorMessage = data?.error || data?.detail || data?.message || `Error HTTP ${response.status}`
			if (API_CONFIG.DEBUG) {
				console.error(`❌ ${response.status} ${options.method || 'GET'} ${url}:`, errorMessage)
			}
			throw new APIError(errorMessage, response.status, data)
		}

		return data
	} catch (error) {
		// Retry logic para errores de red o 5xx (solo para GET requests)
		if (
			!error.status || 
			(error.status >= 500 && error.status < 600) ||
			error.message?.includes('conexión') ||
			error.message?.includes('timeout')
		) {
			// Solo reintentar para GET requests (no para POST/PUT/DELETE)
			if (options.method === 'GET' || !options.method) {
				const maxRetries = 3
				const retryDelay = 1000
				
				for (let attempt = 1; attempt <= maxRetries; attempt++) {
					try {
						if (API_CONFIG.DEBUG) {
							console.log(`🔄 Reintentando (${attempt}/${maxRetries})...`)
						}
						
						await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
						const retryResponse = await fetchWithTimeout(url, options)
						const retryData = await parseJSON(retryResponse)
						
						if (retryResponse.ok) {
							return retryData
						}
						
						// Si sigue fallando y es el último intento, lanzar error
						if (attempt === maxRetries) {
							const errorMessage = retryData?.error || retryData?.detail || retryData?.message || `Error HTTP ${retryResponse.status}`
							throw new APIError(errorMessage, retryResponse.status, retryData)
						}
					} catch (retryError) {
						if (attempt === maxRetries) {
							if (API_CONFIG.DEBUG) {
								console.error(`❌ Error después de ${maxRetries} intentos:`, retryError.message)
							}
							throw retryError
						}
					}
				}
			}
		}
		
		// Manejo especial de errores 401 (desloguear)
		if (error.status === 401) {
			clearTokens()
			
			// ✅ CORRECCIÓN: Llamar callback para resetear user en AuthContext
			if (onUnauthorizedCallback) {
				try {
					onUnauthorizedCallback()
				} catch (callbackError) {
					if (API_CONFIG.DEBUG) {
						console.error('Error en callback de 401:', callbackError)
					}
				}
			}
			
			if (API_CONFIG.DEBUG) {
				console.warn('⚠️ Token expirado o inválido. Sesión cerrada.')
			}
			// Redirigir a login si estamos en el navegador
			if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
				window.location.href = '/login'
			}
		}
		
		if (error instanceof APIError) {
			if (API_CONFIG.DEBUG) {
				console.error(`❌ API Error en ${options.method || 'GET'} ${url}:`, error.message, error.status)
			}
			throw error
		}
		
		// Convertir otros errores a APIError
		if (API_CONFIG.DEBUG) {
			console.error(`❌ Error desconocido en ${options.method || 'GET'} ${url}:`, error.message)
		}
		throw new APIError(error.message || 'Error desconocido', 0)
	}
}

/**
 * Métodos HTTP helpers
 */
export const http = {
	get: (endpoint, options = {}) => httpClient(endpoint, { ...options, method: 'GET' }),
	post: (endpoint, data, options = {}) => httpClient(endpoint, {
		...options,
		method: 'POST',
		body: JSON.stringify(data),
	}),
	put: (endpoint, data, options = {}) => httpClient(endpoint, {
		...options,
		method: 'PUT',
		body: JSON.stringify(data),
	}),
	patch: (endpoint, data, options = {}) => httpClient(endpoint, {
		...options,
		method: 'PATCH',
		body: JSON.stringify(data),
	}),
	delete: (endpoint, options = {}) => httpClient(endpoint, { ...options, method: 'DELETE' }),
}

export { API_CONFIG, STORAGE_KEYS }

