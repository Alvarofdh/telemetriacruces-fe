// Servicio para gestión de mantenimientos
import { http } from './httpClient'

/**
 * Obtener historial de mantenimientos (paginado)
 * @param {Object} params - Parámetros de paginación y filtros
 * @param {number} params.page - Número de página
 * @param {number} params.page_size - Tamaño de página
 * @param {number} [params.cruce] - Filtrar por ID de cruce
 * @param {string} [params.estado] - Filtrar por estado (PENDIENTE, EN_PROCESO, COMPLETADO, CANCELADO)
 * @param {string} [params.fecha_desde] - Filtrar desde fecha (ISO 8601)
 * @param {string} [params.fecha_hasta] - Filtrar hasta fecha (ISO 8601)
 * @returns {Promise<Object>} Lista de mantenimientos con paginación
 */
export const getHistorialMantenimiento = async (params = {}) => {
	const queryParams = new URLSearchParams()
	if (params.page) {
		queryParams.append('page', params.page)
	}
	if (params.page_size) {
		queryParams.append('page_size', params.page_size)
	}
	if (params.cruce) {
		queryParams.append('cruce', params.cruce)
	}
	if (params.estado) {
		queryParams.append('estado', params.estado)
	}
	if (params.fecha_desde) {
		queryParams.append('fecha_desde', params.fecha_desde)
	}
	if (params.fecha_hasta) {
		queryParams.append('fecha_hasta', params.fecha_hasta)
	}
	
	const queryString = queryParams.toString()
	const endpoint = queryString ? `/api/historial-mantenimiento/?${queryString}` : '/api/historial-mantenimiento/'
	
	return await http.get(endpoint)
}

/**
 * Obtener un mantenimiento por ID
 * @param {number} id - ID del mantenimiento
 * @returns {Promise<Object>} Datos del mantenimiento
 */
export const getMantenimiento = async (id) => {
	return await http.get(`/api/historial-mantenimiento/${id}/`)
}

