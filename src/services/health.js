// Servicio para verificación de salud de la API
import { http } from './httpClient'

/**
 * Verificar salud de la API
 * @returns {Promise<Object>} Estado de salud de la API
 */
export const checkHealth = async () => {
	return await http.get('/api/health')
}

/**
 * Obtener información de la API (endpoint raíz)
 * @returns {Promise<Object>} Información de endpoints disponibles
 */
export const getApiInfo = async () => {
	return await http.get('/api/')
}
