// Servicio para gestión de sensores
import { http } from './httpClient'

/**
 * Obtener lista de sensores (paginado)
 * @param {Object} params - Parámetros de paginación y filtros
 * @param {number} params.page - Número de página
 * @param {number} [params.cruce] - Filtrar por ID de cruce
 * @returns {Promise<Object>} Lista de sensores con paginación
 */
export const getSensores = async (params = {}) => {
	const queryParams = new URLSearchParams()
	if (params.page) {
		queryParams.append('page', params.page)
	}
	if (params.cruce) {
		queryParams.append('cruce', params.cruce)
	}
	
	const queryString = queryParams.toString()
	const endpoint = `/api/sensores/${queryString ? `?${queryString}` : ''}`
	
	return await http.get(endpoint)
}

/**
 * Obtener un sensor por ID
 * @param {number} id - ID del sensor
 * @returns {Promise<Object>} Datos del sensor
 */
export const getSensor = async (id) => {
	return await http.get(`/api/sensores/${id}/`)
}

/**
 * Crear un nuevo sensor
 * @param {Object} sensorData - Datos del sensor
 * @param {string} sensorData.nombre - Nombre del sensor
 * @param {string} sensorData.tipo - Tipo de sensor (BARRERA, GABINETE, BATERIA, PLC, TEMPERATURA)
 * @param {number} sensorData.cruce - ID del cruce
 * @param {string} [sensorData.descripcion] - Descripción del sensor
 * @param {boolean} [sensorData.activo] - Si el sensor está activo
 * @returns {Promise<Object>} Sensor creado
 */
export const createSensor = async (sensorData) => {
	return await http.post('/api/sensores/', sensorData)
}

/**
 * Actualizar un sensor completo
 * @param {number} id - ID del sensor
 * @param {Object} sensorData - Datos actualizados del sensor
 * @returns {Promise<Object>} Sensor actualizado
 */
export const updateSensor = async (id, sensorData) => {
	return await http.put(`/api/sensores/${id}/`, sensorData)
}

/**
 * Actualizar un sensor parcialmente
 * @param {number} id - ID del sensor
 * @param {Object} sensorData - Datos parciales a actualizar
 * @returns {Promise<Object>} Sensor actualizado
 */
export const patchSensor = async (id, sensorData) => {
	return await http.patch(`/api/sensores/${id}/`, sensorData)
}

/**
 * Eliminar un sensor
 * @param {number} id - ID del sensor
 * @returns {Promise<void>}
 */
export const deleteSensor = async (id) => {
	await http.delete(`/api/sensores/${id}/`)
}
