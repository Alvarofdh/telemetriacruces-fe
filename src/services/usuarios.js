import api from './api'

/**
 * Servicio para gestión de usuarios
 */
export const usuariosAPI = {
	/**
	 * Obtener todos los usuarios
	 * @param {Object} params - Parámetros de consulta (page, page_size, search, etc.)
	 * @returns {Promise<Object>} Lista de usuarios
	 */
	getAll: (params = {}) => {
		return api.get('/users/', { params })
			.then(response => {
				// Normalizar respuesta del backend
				if (response.data.results) {
					return response.data
				}
				// Si es un array directo
				if (Array.isArray(response.data)) {
					return {
						results: response.data,
						count: response.data.length
					}
				}
				return response.data
			})
	},

	/**
	 * Obtener un usuario por ID
	 * @param {number|string} id - ID del usuario
	 * @returns {Promise<Object>} Datos del usuario
	 */
	getById: (id) => api.get(`/users/${id}/`).then(response => response.data),

	/**
	 * Crear un nuevo usuario
	 * @param {Object} data - Datos del usuario
	 * @returns {Promise<Object>} Usuario creado
	 */
	create: (data) => {
		return api.post('/users/', data)
			.then(response => response.data)
			.catch(error => {
				console.error('Error al crear usuario:', error)
				throw error
			})
	},

	/**
	 * Actualizar un usuario
	 * @param {number|string} id - ID del usuario
	 * @param {Object} data - Datos a actualizar
	 * @returns {Promise<Object>} Usuario actualizado
	 */
	update: (id, data) => {
		return api.put(`/users/${id}/`, data)
			.then(response => response.data)
			.catch(error => {
				console.error('Error al actualizar usuario:', error)
				throw error
			})
	},

	/**
	 * Actualización parcial de un usuario
	 * @param {number|string} id - ID del usuario
	 * @param {Object} data - Datos a actualizar
	 * @returns {Promise<Object>} Usuario actualizado
	 */
	patch: (id, data) => {
		return api.patch(`/users/${id}/`, data)
			.then(response => response.data)
			.catch(error => {
				console.error('Error al actualizar usuario:', error)
				throw error
			})
	},

	/**
	 * Eliminar un usuario
	 * @param {number|string} id - ID del usuario
	 * @returns {Promise<void>}
	 */
	delete: (id) => {
		return api.delete(`/users/${id}/`)
			.catch(error => {
				console.error('Error al eliminar usuario:', error)
				throw error
			})
	},

	/**
	 * Reactivar un usuario previamente desactivado
	 * @param {number|string} id - ID del usuario
	 * @returns {Promise<Object>} Usuario actualizado
	 */
	activate: (id) => {
		return api.post(`/users/${id}/activate/`)
			.then(response => response.data)
			.catch(error => {
				console.error('Error al activar usuario:', error)
				throw error
			})
	},

	/**
	 * Cambiar estado de un usuario (activar/desactivar)
	 * @param {number|string} id - ID del usuario
	 * @param {string} estado - Nuevo estado (ACTIVO, INACTIVO)
	 * @returns {Promise<Object>} Usuario actualizado
	 */
	changeStatus: (id, estado) => {
		return api.patch(`/users/${id}/`, { estado })
			.then(response => response.data)
	}
}

export default usuariosAPI

