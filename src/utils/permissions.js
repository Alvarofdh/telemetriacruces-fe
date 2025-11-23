/**
 * Sistema de permisos basado en roles
 * Define qué puede hacer cada rol en el sistema
 */

export const ROLES = {
	ADMIN: 'ADMIN',
	MAINTENANCE: 'MAINTENANCE',
	OBSERVER: 'OBSERVER',
}

/**
 * Permisos por rol
 */
export const PERMISSIONS = {
	[ROLES.ADMIN]: {
		// Cruces
		canViewCruces: true,
		canManageCruces: true,
		canDeleteCruces: true,
		// Alertas
		canViewAlertas: true,
		canManageAlertas: true,
		canResolveAlertas: true,
		// Telemetría
		canViewTelemetria: true,
		// Usuarios
		canViewUsuarios: true,
		canManageUsuarios: true,
		canChangeRoles: true,
		// Sistema
		canViewLogs: true,
		canViewConfig: true,
		canManageConfig: true,
		canExportData: true,
	},
	[ROLES.MAINTENANCE]: {
		// Cruces
		canViewCruces: true,
		canManageCruces: true,
		canDeleteCruces: false,
		// Alertas
		canViewAlertas: true,
		canManageAlertas: true,
		canResolveAlertas: true,
		// Telemetría
		canViewTelemetria: true,
		// Usuarios
		canViewUsuarios: false,
		canManageUsuarios: false,
		canChangeRoles: false,
		// Sistema
		canViewLogs: false,
		canViewConfig: false,
		canManageConfig: false,
		canExportData: true,
	},
	[ROLES.OBSERVER]: {
		// Cruces
		canViewCruces: true,
		canManageCruces: false,
		canDeleteCruces: false,
		// Alertas
		canViewAlertas: true,
		canManageAlertas: false,
		canResolveAlertas: false,
		// Telemetría
		canViewTelemetria: true,
		// Usuarios
		canViewUsuarios: false,
		canManageUsuarios: false,
		canChangeRoles: false,
		// Sistema
		canViewLogs: false,
		canViewConfig: false,
		canManageConfig: false,
		canExportData: false,
	},
}

/**
 * Obtener el rol del usuario
 * @param {Object} user - Usuario
 * @returns {string} Rol del usuario
 */
export const getUserRole = (user) => {
	if (!user) return null
	return user.profile?.role || user.role || ROLES.OBSERVER
}

/**
 * Verificar si el usuario tiene un permiso específico
 * @param {Object} user - Usuario
 * @param {string} permission - Nombre del permiso (ej: 'canManageCruces')
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
	const role = getUserRole(user)
	if (!role || !PERMISSIONS[role]) return false
	return PERMISSIONS[role][permission] === true
}

/**
 * Verificar si el usuario tiene uno de los roles especificados
 * @param {Object} user - Usuario
 * @param {string[]} roles - Array de roles permitidos
 * @returns {boolean}
 */
export const hasRole = (user, roles) => {
	const userRole = getUserRole(user)
	return roles.includes(userRole)
}

/**
 * Verificar si el usuario es administrador
 * @param {Object} user - Usuario
 * @returns {boolean}
 */
export const isAdmin = (user) => {
	return hasRole(user, [ROLES.ADMIN])
}

/**
 * Verificar si el usuario es de mantenimiento
 * @param {Object} user - Usuario
 * @returns {boolean}
 */
export const isMaintenance = (user) => {
	return hasRole(user, [ROLES.MAINTENANCE])
}

/**
 * Verificar si el usuario es observador
 * @param {Object} user - Usuario
 * @returns {boolean}
 */
export const isObserver = (user) => {
	return hasRole(user, [ROLES.OBSERVER])
}

/**
 * Obtener todos los permisos del usuario
 * @param {Object} user - Usuario
 * @returns {Object} Objeto con todos los permisos
 */
export const getUserPermissions = (user) => {
	const role = getUserRole(user)
	return PERMISSIONS[role] || PERMISSIONS[ROLES.OBSERVER]
}

