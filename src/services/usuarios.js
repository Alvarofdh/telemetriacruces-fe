import { http } from './httpClient'

/**
 * Servicio para gestión de usuarios
 */
export const usuariosAPI = {
	/**
	 * Obtener todos los usuarios
	 * @param {Object} params - Parámetros de consulta (page, page_size, search, etc.)
	 * @returns {Promise<Object>} Lista de usuarios
	 */
	getAll: async (params = {}) => {
		const queryParams = new URLSearchParams()
		Object.keys(params).forEach(key => {
			if (params[key] !== undefined && params[key] !== null) {
				queryParams.append(key, params[key])
			}
		})
		
		const queryString = queryParams.toString()
		const endpoint = `/api/users/${queryString ? `?${queryString}` : ''}`
		
		const data = await http.get(endpoint)
		
				// Normalizar respuesta del backend
		if (data.results) {
			return data
				}
				// Si es un array directo
		if (Array.isArray(data)) {
					return {
				results: data,
				count: data.length
					}
				}
		return data
	},

	/**
	 * Obtener un usuario por ID
	 * @param {number|string} id - ID del usuario
	 * @returns {Promise<Object>} Datos del usuario
	 */
	getById: (id) => http.get(`/api/users/${id}/`),

	/**
	 * Crear un nuevo usuario
	 * @param {Object} data - Datos del usuario
	 * @returns {Promise<Object>} Usuario creado
	 */
	create: async (data) => {
		try {
			return await http.post('/api/users/', data)
		} catch (error) {
				console.error('Error al crear usuario:', error)
				throw error
		}
	},

	/**
	 * Actualizar un usuario
	 * @param {number|string} id - ID del usuario
	 * @param {Object} data - Datos a actualizar
	 * @returns {Promise<Object>} Usuario actualizado
	 */
	update: async (id, data) => {
		try {
			return await http.put(`/api/users/${id}/`, data)
		} catch (error) {
				console.error('Error al actualizar usuario:', error)
				throw error
		}
	},

	/**
	 * Actualización parcial de un usuario
	 * @param {number|string} id - ID del usuario
	 * @param {Object} data - Datos a actualizar
	 * @returns {Promise<Object>} Usuario actualizado
	 */
	patch: async (id, data) => {
		try {
			return await http.patch(`/api/users/${id}/`, data)
		} catch (error) {
				console.error('Error al actualizar usuario:', error)
				throw error
		}
	},

	/**
	 * Eliminar un usuario
	 * @param {number|string} id - ID del usuario
	 * @returns {Promise<void>}
	 */
	delete: async (id) => {
		try {
			await http.delete(`/api/users/${id}/`)
		} catch (error) {
				console.error('Error al eliminar usuario:', error)
				throw error
		}
	},

	/**
	 * Reactivar un usuario previamente desactivado
	 * @param {number|string} id - ID del usuario
	 * @returns {Promise<Object>} Usuario actualizado
	 */
	activate: async (id) => {
		try {
			return await http.post(`/api/users/${id}/activate/`)
		} catch (error) {
			console.error('Error al activar usuario:', error)
			throw error
		}
	},

	/**
	 * Cambiar estado de un usuario (activar/desactivar)
	 * @param {number|string} id - ID del usuario
	 * @param {string} estado - Nuevo estado (ACTIVO, INACTIVO)
	 * @returns {Promise<Object>} Usuario actualizado
	 */
	changeStatus: (id, estado) => http.patch(`/api/users/${id}/`, { estado })
}

export default usuariosAPI

