// Servicio para gestión de telemetría
import { http } from './httpClient'

/**
 * Obtener lista de telemetría (paginado)
 * @param {Object} params - Parámetros de paginación y filtros
 * @param {number} params.page - Número de página
 * @param {number} params.page_size - Tamaño de página
 * @param {number} [params.cruce] - Filtrar por ID de cruce
 * @param {string} [params.timestamp] - Filtrar por fecha/hora (formato ISO 8601)
 * @param {string} [params.barrier_status] - Filtrar por estado de barrera (UP, DOWN)
 * @returns {Promise<Object>} Lista de telemetría con paginación
 */
export const getTelemetria = async (params = {}) => {
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
	if (params.timestamp) {
		queryParams.append('timestamp', params.timestamp)
	}
	if (params.barrier_status) {
		queryParams.append('barrier_status', params.barrier_status)
	}
	
	const queryString = queryParams.toString()
	const endpoint = `/api/telemetria/${queryString ? `?${queryString}` : ''}`
	
	return await http.get(endpoint)
}

/**
 * Obtener telemetría por ID
 * @param {number} id - ID de la telemetría
 * @returns {Promise<Object>} Datos de la telemetría
 */
export const getTelemetriaById = async (id) => {
	return await http.get(`/api/telemetria/${id}/`)
}

/**
 * Crear nueva telemetría (con detección automática de eventos y alertas)
 * @param {Object} telemetriaData - Datos de la telemetría
 * @param {number} telemetriaData.barrier_voltage - Voltaje de la barrera
 * @param {number} telemetriaData.battery_voltage - Voltaje de la batería
 * @param {number} telemetriaData.cruce - ID del cruce
 * @param {number} [telemetriaData.sensor_1] - Valor del sensor 1
 * @param {number} [telemetriaData.sensor_2] - Valor del sensor 2
 * @param {number} [telemetriaData.sensor_3] - Valor del sensor 3
 * @param {number} [telemetriaData.sensor_4] - Valor del sensor 4
 * @param {number} [telemetriaData.signal_strength] - Intensidad de señal
 * @param {number} [telemetriaData.temperature] - Temperatura
 * @returns {Promise<Object>} Telemetría creada
 */
export const createTelemetria = async (telemetriaData) => {
	return await http.post('/api/telemetria/', telemetriaData)
}

/**
 * Actualizar telemetría completa
 * @param {number} id - ID de la telemetría
 * @param {Object} telemetriaData - Datos actualizados
 * @returns {Promise<Object>} Telemetría actualizada
 */
export const updateTelemetria = async (id, telemetriaData) => {
	return await http.put(`/api/telemetria/${id}/`, telemetriaData)
}

/**
 * Actualizar telemetría parcialmente
 * @param {number} id - ID de la telemetría
 * @param {Object} telemetriaData - Datos parciales a actualizar
 * @returns {Promise<Object>} Telemetría actualizada
 */
export const patchTelemetria = async (id, telemetriaData) => {
	return await http.patch(`/api/telemetria/${id}/`, telemetriaData)
}

/**
 * Eliminar telemetría
 * @param {number} id - ID de la telemetría
 * @returns {Promise<void>}
 */
export const deleteTelemetria = async (id) => {
	await http.delete(`/api/telemetria/${id}/`)
}

/**
 * Enviar telemetría desde ESP32 (endpoint público con token ESP32)
 * @param {Object} telemetriaData - Datos de telemetría del ESP32
 * @param {string} telemetriaData.esp32_token - Token del ESP32
 * @param {number} telemetriaData.cruce_id - ID del cruce
 * @param {number} telemetriaData.barrier_voltage - Voltaje de la barrera
 * @param {number} telemetriaData.battery_voltage - Voltaje de la batería
 * @param {number} [telemetriaData.sensor_1] - Valor del sensor 1
 * @param {number} [telemetriaData.sensor_2] - Valor del sensor 2
 * @param {number} [telemetriaData.sensor_3] - Valor del sensor 3
 * @param {number} [telemetriaData.sensor_4] - Valor del sensor 4
 * @param {number} [telemetriaData.signal_strength] - Intensidad de señal
 * @param {number} [telemetriaData.temperature] - Temperatura
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const sendESP32Telemetria = async (telemetriaData) => {
	return await http.post('/api/esp32/telemetria', telemetriaData)
}

/**
 * Exportar telemetría a CSV
 * @param {Object} params - Parámetros de filtrado
 * @param {number} [params.cruce] - Filtrar por ID de cruce
 * @param {string} [params.timestamp] - Filtrar por fecha/hora
 * @param {string} [params.barrier_status] - Filtrar por estado de barrera
 * @returns {Promise<Blob>} Archivo CSV
 */
export const exportTelemetria = async (params = {}) => {
	const queryParams = new URLSearchParams()
	if (params.cruce) {
		queryParams.append('cruce', params.cruce)
	}
	if (params.timestamp) {
		queryParams.append('timestamp', params.timestamp)
	}
	if (params.barrier_status) {
		queryParams.append('barrier_status', params.barrier_status)
	}
	
	const queryString = queryParams.toString()
	const endpoint = `/api/telemetria/exportar${queryString ? `?${queryString}` : ''}`
	
	return await http.get(endpoint, { responseType: 'blob' })
}
