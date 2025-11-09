// Servicio para gestión de cruces ferroviarios
import { http } from './httpClient'

/**
 * Obtener lista de cruces (paginado)
 * @param {Object} params - Parámetros de paginación
 * @param {number} params.page - Número de página
 * @returns {Promise<Object>} Lista de cruces con paginación
 */
export const getCruces = async (params = {}) => {
	const queryParams = new URLSearchParams()
	if (params.page) {
		queryParams.append('page', params.page)
	}
	
	const queryString = queryParams.toString()
	const endpoint = `/api/cruces/${queryString ? `?${queryString}` : ''}`
	
	return await http.get(endpoint)
}

/**
 * Obtener un cruce por ID
 * @param {number} id - ID del cruce
 * @returns {Promise<Object>} Datos del cruce
 */
export const getCruce = async (id) => {
	return await http.get(`/api/cruces/${id}/`)
}

/**
 * Crear un nuevo cruce
 * @param {Object} cruceData - Datos del cruce
 * @param {string} cruceData.nombre - Nombre del cruce
 * @param {string} cruceData.ubicacion - Ubicación del cruce
 * @param {number} [cruceData.coordenadas_lat] - Latitud
 * @param {number} [cruceData.coordenadas_lng] - Longitud
 * @param {string} [cruceData.estado] - Estado del cruce
 * @returns {Promise<Object>} Cruce creado
 */
export const createCruce = async (cruceData) => {
	return await http.post('/api/cruces/', cruceData)
}

/**
 * Actualizar un cruce completo
 * @param {number} id - ID del cruce
 * @param {Object} cruceData - Datos actualizados del cruce
 * @returns {Promise<Object>} Cruce actualizado
 */
export const updateCruce = async (id, cruceData) => {
	return await http.put(`/api/cruces/${id}/`, cruceData)
}

/**
 * Actualizar un cruce parcialmente
 * @param {number} id - ID del cruce
 * @param {Object} cruceData - Datos parciales a actualizar
 * @returns {Promise<Object>} Cruce actualizado
 */
export const patchCruce = async (id, cruceData) => {
	return await http.patch(`/api/cruces/${id}/`, cruceData)
}

/**
 * Eliminar un cruce
 * @param {number} id - ID del cruce
 * @returns {Promise<void>}
 */
export const deleteCruce = async (id) => {
	await http.delete(`/api/cruces/${id}/`)
}

/**
 * Obtener dashboard de cruces (resumen con telemetría y alertas)
 * @param {Object} params - Parámetros de paginación
 * @param {number} params.page - Número de página
 * @returns {Promise<Object>} Dashboard de cruces
 */
export const getCrucesDashboard = async (params = {}) => {
	const queryParams = new URLSearchParams()
	if (params.page) {
		queryParams.append('page', params.page)
	}
	
	const queryString = queryParams.toString()
	const endpoint = `/api/cruces/dashboard/${queryString ? `?${queryString}` : ''}`
	
	return await http.get(endpoint)
}

/**
 * Obtener coordenadas de todos los cruces para el mapa
 * @param {Object} params - Parámetros de paginación
 * @param {number} params.page - Número de página
 * @returns {Promise<Object>} Lista de cruces con coordenadas
 */
export const getCrucesMapa = async (params = {}) => {
	const queryParams = new URLSearchParams()
	if (params.page) {
		queryParams.append('page', params.page)
	}
	
	const queryString = queryParams.toString()
	const endpoint = `/api/cruces/mapa/${queryString ? `?${queryString}` : ''}`
	
	return await http.get(endpoint)
}

