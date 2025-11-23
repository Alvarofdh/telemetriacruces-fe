import { useMemo } from 'react'
import { useAuth } from './useAuth'
import { getUserPermissions, hasPermission, hasRole, getUserRole, isAdmin, isMaintenance, isObserver } from '../utils/permissions'

/**
 * Hook para acceder a permisos del usuario actual
 * @returns {Object} Objeto con permisos y funciones de verificación
 */
export const usePermissions = () => {
	const { user } = useAuth()

	const permissions = useMemo(() => {
		return getUserPermissions(user)
	}, [user])

	const role = useMemo(() => {
		return getUserRole(user)
	}, [user])

	const checkPermission = useMemo(() => {
		return (permission) => hasPermission(user, permission)
	}, [user])

	const checkRole = useMemo(() => {
		return (roles) => hasRole(user, roles)
	}, [user])

	return {
		permissions,
		role,
		hasPermission: checkPermission,
		hasRole: checkRole,
		isAdmin: isAdmin(user),
		isMaintenance: isMaintenance(user),
		isObserver: isObserver(user),
	}
}

