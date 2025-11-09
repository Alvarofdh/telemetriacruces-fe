// Servicio de autenticación
import { http, setTokens, clearTokens, getAccessToken, STORAGE_KEYS } from './httpClient'

/**
 * Iniciar sesión
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} Datos del usuario y tokens
 */
export const login = async (email, password) => {
	const response = await http.post('/api/login', {
		email,
		password,
	})

	if (response.access && response.refresh) {
		setTokens(response.access, response.refresh)
		
		// Guardar usuario en localStorage
		if (response.user) {
			localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user))
		}

		return {
			user: response.user,
			accessToken: response.access,
			refreshToken: response.refresh,
		}
	}

	throw new Error('No se recibieron tokens de autenticación')
}

/**
 * Registrar nuevo usuario
 * @param {Object} userData - Datos del usuario a registrar
 * @returns {Promise<Object>} Usuario creado
 */
export const register = async (userData) => {
	return await http.post('/api/register', {
		email: userData.email,
		password: userData.password,
		password_confirm: userData.passwordConfirm || userData.password_confirm,
		first_name: userData.firstName || userData.first_name,
		last_name: userData.lastName || userData.last_name,
		role: userData.role || 'OBSERVER',
	})
}

/**
 * Cerrar sesión
 * @returns {Promise<void>}
 */
export const logout = async () => {
	// Intentar invalidar el token en el servidor
	const token = getAccessToken()
	if (token) {
		try {
			await http.post('/api/logout')
		} catch {
			// Si falla, continuar con el logout local
			// No loguear en producción para evitar ruido
		}
	}
	// Siempre limpiar tokens localmente
	clearTokens()
}

/**
 * Obtener perfil del usuario autenticado
 * @returns {Promise<Object>} Perfil del usuario
 */
export const getProfile = async () => {
	return await http.get('/api/profile')
}

/**
 * Actualizar perfil del usuario autenticado
 * @param {Object} profileData - Datos del perfil a actualizar
 * @returns {Promise<Object>} Perfil actualizado
 */
export const updateProfile = async (profileData) => {
	const response = await http.put('/api/profile', profileData)
	
	// Actualizar usuario en localStorage si se actualiza
	if (response) {
		const savedUser = localStorage.getItem(STORAGE_KEYS.USER)
		if (savedUser) {
			const user = JSON.parse(savedUser)
			const updatedUser = { ...user, ...response }
			localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
		}
	}
	
	return response
}

/**
 * Cambiar contraseña
 * @param {string} currentPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña
 * @param {string} confirmPassword - Confirmación de nueva contraseña
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
	return await http.post('/api/change-password', {
		current_password: currentPassword,
		new_password: newPassword,
		confirm_password: confirmPassword,
	})
}

/**
 * Obtener usuario guardado en localStorage
 * @returns {Object|null} Usuario o null
 */
export const getStoredUser = () => {
	try {
		const userStr = localStorage.getItem(STORAGE_KEYS.USER)
		return userStr ? JSON.parse(userStr) : null
	} catch {
		return null
	}
}
