/**
 * Utilidades para sanitización de inputs
 * Protección contra XSS y validación de datos
 */

/**
 * Sanitizar string para prevenir XSS
 * @param {string} input - String a sanitizar
 * @returns {string} String sanitizado
 */
export const sanitizeString = (input) => {
	if (typeof input !== 'string') {
		return ''
	}

	// Crear un elemento temporal para escapar HTML
	const div = document.createElement('div')
	div.textContent = input
	return div.innerHTML
}

/**
 * Sanitizar email
 * @param {string} email - Email a sanitizar
 * @returns {string} Email sanitizado
 */
export const sanitizeEmail = (email) => {
	if (typeof email !== 'string') {
		return ''
	}

	// Remover espacios y convertir a minúsculas
	return email.trim().toLowerCase()
}

/**
 * Sanitizar número
 * @param {string|number} input - Número a sanitizar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number|null} Número sanitizado o null si es inválido
 */
export const sanitizeNumber = (input, min = -Infinity, max = Infinity) => {
	const num = typeof input === 'number' ? input : parseFloat(input)
	
	if (isNaN(num)) {
		return null
	}

	if (num < min || num > max) {
		return null
	}

	return num
}

/**
 * Sanitizar objeto completo
 * @param {Object} obj - Objeto a sanitizar
 * @param {Object} schema - Esquema de validación
 * @returns {Object} Objeto sanitizado
 */
export const sanitizeObject = (obj, schema) => {
	if (!obj || typeof obj !== 'object') {
		return {}
	}

	const sanitized = {}

	Object.keys(schema).forEach(key => {
		const fieldSchema = schema[key]
		const value = obj[key]

		if (fieldSchema.required && (value === undefined || value === null || value === '')) {
			throw new Error(`Campo requerido faltante: ${key}`)
		}

		if (value !== undefined && value !== null && value !== '') {
			switch (fieldSchema.type) {
				case 'string':
					sanitized[key] = sanitizeString(value)
					break
				case 'email':
					sanitized[key] = sanitizeEmail(value)
					break
				case 'number':
					sanitized[key] = sanitizeNumber(value, fieldSchema.min, fieldSchema.max)
					break
				case 'boolean':
					sanitized[key] = Boolean(value)
					break
				default:
					sanitized[key] = value
			}
		} else if (fieldSchema.default !== undefined) {
			sanitized[key] = fieldSchema.default
		}
	})

	return sanitized
}

/**
 * Validar y sanitizar email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export const isValidEmail = (email) => {
	if (typeof email !== 'string') {
		return false
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email.trim())
}

/**
 * Validar y sanitizar URL
 * @param {string} url - URL a validar
 * @returns {boolean} True si es válido
 */
export const isValidUrl = (url) => {
	if (typeof url !== 'string') {
		return false
	}

	try {
		new URL(url)
		return true
	} catch {
		return false
	}
}

