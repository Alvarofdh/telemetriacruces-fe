import { Navigate } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import { Loading } from '../Loading'

/**
 * Componente para proteger rutas basado en roles
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente a renderizar si tiene permisos
 * @param {string[]} props.allowedRoles - Roles permitidos (ej: ['ADMIN', 'MAINTENANCE'])
 * @param {string} props.redirectTo - Ruta a la que redirigir si no tiene permisos (default: '/')
 * @param {string} props.permission - Permiso específico requerido (opcional, sobreescribe allowedRoles)
 */
export const RoleGuard = ({ 
	children, 
	allowedRoles = [], 
	redirectTo = '/',
	permission = null 
}) => {
	const { role, hasPermission: checkPermission, isAdmin, isMaintenance, isObserver } = usePermissions()

	// Si no hay usuario, mostrar loading (el ProtectedRoute ya maneja la redirección)
	if (!role) {
		return <Loading message="Verificando permisos..." />
	}

	// Si se especifica un permiso, verificar ese permiso
	if (permission) {
		if (checkPermission(permission)) {
			return children
		}
		return <Navigate to={redirectTo} replace />
	}

	// Si se especifican roles, verificar que el usuario tenga uno de esos roles
	if (allowedRoles.length > 0) {
		const hasAllowedRole = allowedRoles.includes(role)
		if (hasAllowedRole) {
			return children
		}
		return <Navigate to={redirectTo} replace />
	}

	// Si no se especifica nada, permitir acceso (útil para rutas que solo requieren autenticación)
	return children
}

