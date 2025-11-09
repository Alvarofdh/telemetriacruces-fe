// Servicio para gestión de eventos de barrera
import { http } from './httpClient'

/**
 * Obtener lista de eventos de barrera (paginado)
 * @param {Object} params - Parámetros de paginación y filtros
 * @param {number} params.page - Número de página
 * @param {number} [params.cruce] - Filtrar por ID de cruce
 * @returns {Promise<Object>} Lista de eventos con paginación
 */
export const getBarrierEvents = async (params = {}) => {
	const queryParams = new URLSearchParams()
	if (params.page) {
		queryParams.append('page', params.page)
	}
	if (params.cruce) {
		queryParams.append('cruce', params.cruce)
	}
	
	const queryString = queryParams.toString()
	const endpoint = `/api/barrier-events/${queryString ? `?${queryString}` : ''}`
	
	return await http.get(endpoint)
}

/**
 * Obtener un evento de barrera por ID
 * @param {number} id - ID del evento
 * @returns {Promise<Object>} Datos del evento
 */
export const getBarrierEvent = async (id) => {
	return await http.get(`/api/barrier-events/${id}/`)
}

/**
 * Crear un nuevo evento de barrera
 * @param {Object} eventData - Datos del evento
 * @param {string} eventData.state - Estado de la barrera (DOWN, UP)
 * @param {string} eventData.event_time - Fecha y hora del evento (ISO 8601)
 * @param {number} eventData.voltage_at_event - Voltaje al momento del evento
 * @param {number} eventData.telemetria - ID de la telemetría relacionada
 * @param {number} eventData.cruce - ID del cruce
 * @returns {Promise<Object>} Evento creado
 */
export const createBarrierEvent = async (eventData) => {
	return await http.post('/api/barrier-events/', eventData)
}

/**
 * Actualizar un evento de barrera completo
 * @param {number} id - ID del evento
 * @param {Object} eventData - Datos actualizados del evento
 * @returns {Promise<Object>} Evento actualizado
 */
export const updateBarrierEvent = async (id, eventData) => {
	return await http.put(`/api/barrier-events/${id}/`, eventData)
}

/**
 * Actualizar un evento de barrera parcialmente
 * @param {number} id - ID del evento
 * @param {Object} eventData - Datos parciales a actualizar
 * @returns {Promise<Object>} Evento actualizado
 */
export const patchBarrierEvent = async (id, eventData) => {
	return await http.patch(`/api/barrier-events/${id}/`, eventData)
}

/**
 * Eliminar un evento de barrera
 * @param {number} id - ID del evento
 * @returns {Promise<void>}
 */
export const deleteBarrierEvent = async (id) => {
	await http.delete(`/api/barrier-events/${id}/`)
}
