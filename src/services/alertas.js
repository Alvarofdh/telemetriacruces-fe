// Servicio para gestión de alertas
import { http } from './httpClient'

/**
 * Obtener lista de alertas (paginado)
 * @param {Object} params - Parámetros de paginación y filtros
 * @param {number} params.page - Número de página
 * @param {number} params.page_size - Tamaño de página
 * @param {number} [params.cruce] - Filtrar por ID de cruce
 * @param {boolean} [params.resolved] - Filtrar por estado resuelto (false = solo no resueltas)
 * @param {string} [params.type] - Filtrar por tipo de alerta (LOW_BATTERY, SENSOR_ERROR, etc.)
 * @param {string} [params.severity] - Filtrar por severidad (CRITICAL, WARNING, INFO)
 * @param {string} [params.created_at] - Filtrar por fecha de creación
 * @returns {Promise<Object>} Lista de alertas con paginación
 */
export const getAlertas = async (params = {}) => {
	const queryParams = new URLSearchParams()
	if (params.page) {
		queryParams.append('page', params.page)
	}
	if (params.page_size) {
		queryParams.append('page_size', params.page_size)
	}
	if (params.cruce !== undefined) {
		queryParams.append('cruce', params.cruce)
	}
	if (params.resolved !== undefined) {
		queryParams.append('resolved', params.resolved)
	}
	if (params.type) {
		queryParams.append('type', params.type)
	}
	if (params.severity) {
		queryParams.append('severity', params.severity)
	}
	if (params.created_at) {
		queryParams.append('created_at', params.created_at)
	}
	
	const queryString = queryParams.toString()
	const endpoint = `/api/alertas/${queryString ? `?${queryString}` : ''}`
	
	return await http.get(endpoint)
}

/**
 * Obtener una alerta por ID
 * @param {number} id - ID de la alerta
 * @returns {Promise<Object>} Datos de la alerta
 */
export const getAlerta = async (id) => {
	return await http.get(`/api/alertas/${id}/`)
}

/**
 * Crear una nueva alerta
 * @param {Object} alertaData - Datos de la alerta
 * @param {string} alertaData.type - Tipo de alerta (LOW_BATTERY, SENSOR_ERROR, etc.)
 * @param {string} alertaData.severity - Severidad (CRITICAL, WARNING, INFO)
 * @param {string} alertaData.description - Descripción de la alerta
 * @param {number} alertaData.cruce - ID del cruce
 * @param {number} [alertaData.telemetria] - ID de la telemetría relacionada
 * @param {number} [alertaData.sensor] - ID del sensor relacionado
 * @returns {Promise<Object>} Alerta creada
 */
export const createAlerta = async (alertaData) => {
	return await http.post('/api/alertas/', alertaData)
}

/**
 * Actualizar una alerta completa
 * @param {number} id - ID de la alerta
 * @param {Object} alertaData - Datos actualizados de la alerta
 * @returns {Promise<Object>} Alerta actualizada
 */
export const updateAlerta = async (id, alertaData) => {
	return await http.put(`/api/alertas/${id}/`, alertaData)
}

/**
 * Actualizar una alerta parcialmente (útil para resolver alertas)
 * @param {number} id - ID de la alerta
 * @param {Object} alertaData - Datos parciales a actualizar
 * @returns {Promise<Object>} Alerta actualizada
 */
export const patchAlerta = async (id, alertaData) => {
	return await http.patch(`/api/alertas/${id}/`, alertaData)
}

/**
 * Resolver una alerta
 * @param {number} id - ID de la alerta
 * @returns {Promise<Object>} Alerta resuelta
 */
export const resolveAlerta = async (id) => {
	return await http.patch(`/api/alertas/${id}/`, {
		resolved: true,
	})
}

/**
 * Eliminar una alerta
 * @param {number} id - ID de la alerta
 * @returns {Promise<void>}
 */
export const deleteAlerta = async (id) => {
	await http.delete(`/api/alertas/${id}/`)
}

/**
 * Obtener dashboard de alertas (resumen de alertas activas por cruce)
 * @param {Object} params - Parámetros de paginación
 * @param {number} params.page - Número de página
 * @returns {Promise<Object>} Dashboard de alertas
 */
export const getAlertasDashboard = async (params = {}) => {
	const queryParams = new URLSearchParams()
	if (params.page) {
		queryParams.append('page', params.page)
	}
	
	const queryString = queryParams.toString()
	const endpoint = `/api/alertas/dashboard/${queryString ? `?${queryString}` : ''}`
	
	return await http.get(endpoint)
}

/**
 * Exportar alertas a CSV
 * @param {Object} params - Parámetros de filtrado
 * @param {number} [params.cruce] - Filtrar por ID de cruce
 * @param {boolean} [params.resolved] - Filtrar por estado resuelto
 * @param {string} [params.type] - Filtrar por tipo de alerta
 * @param {string} [params.severity] - Filtrar por severidad
 * @returns {Promise<Blob>} Archivo CSV
 */
export const exportAlertas = async (params = {}) => {
	const queryParams = new URLSearchParams()
	if (params.cruce) {
		queryParams.append('cruce', params.cruce)
	}
	if (params.resolved !== undefined) {
		queryParams.append('resolved', params.resolved)
	}
	if (params.type) {
		queryParams.append('type', params.type)
	}
	if (params.severity) {
		queryParams.append('severity', params.severity)
	}
	
	const queryString = queryParams.toString()
	const endpoint = `/api/alertas/exportar${queryString ? `?${queryString}` : ''}`
	
	return await http.get(endpoint, { responseType: 'blob' })
}
