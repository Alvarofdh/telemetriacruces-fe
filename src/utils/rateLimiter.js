/**
 * Rate limiter para frontend
 * Previene múltiples requests en un período corto
 */

class RateLimiter {
	constructor(maxRequests = 5, windowMs = 1000) {
		this.maxRequests = maxRequests
		this.windowMs = windowMs
		this.requests = new Map()
	}

	/**
	 * Verificar si una request está permitida
	 * @param {string} key - Clave única para identificar la request
	 * @returns {boolean} True si está permitida
	 */
	isAllowed(key) {
		const now = Date.now()
		const requestHistory = this.requests.get(key) || []

		// Filtrar requests fuera de la ventana de tiempo
		const recentRequests = requestHistory.filter(timestamp => now - timestamp < this.windowMs)

		// Si hay demasiadas requests recientes, denegar
		if (recentRequests.length >= this.maxRequests) {
			return false
		}

		// Agregar nueva request
		recentRequests.push(now)
		this.requests.set(key, recentRequests)

		return true
	}

	/**
	 * Limpiar requests antiguas
	 */
	cleanup() {
		const now = Date.now()
		this.requests.forEach((timestamps, key) => {
			const recent = timestamps.filter(timestamp => now - timestamp < this.windowMs)
			if (recent.length === 0) {
				this.requests.delete(key)
			} else {
				this.requests.set(key, recent)
			}
		})
	}

	/**
	 * Resetear todas las requests
	 */
	reset() {
		this.requests.clear()
	}
}

// Instancia global para rate limiting de API
export const apiRateLimiter = new RateLimiter(10, 1000) // 10 requests por segundo

// Instancia para rate limiting de formularios
export const formRateLimiter = new RateLimiter(3, 5000) // 3 requests por 5 segundos

// Limpiar requests antiguas cada minuto
if (typeof window !== 'undefined') {
	setInterval(() => {
		apiRateLimiter.cleanup()
		formRateLimiter.cleanup()
	}, 60000)
}

/**
 * Decorador para rate limiting de funciones
 * @param {Function} func - Función a proteger
 * @param {RateLimiter} limiter - Rate limiter a usar
 * @param {string} key - Clave única para identificar la función
 * @returns {Function} Función protegida
 */
export const withRateLimit = (func, limiter = apiRateLimiter, key = 'default') => {
	return async (...args) => {
		if (!limiter.isAllowed(key)) {
			throw new Error('Demasiadas peticiones. Por favor, espera un momento.')
		}

		return func(...args)
	}
}

