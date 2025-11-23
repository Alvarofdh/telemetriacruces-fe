import React, { createContext } from 'react'
import { useUsuarios } from '../hooks/useUsuarios'

/**
 * Contexto especializado para gestión de usuarios
 * Proporciona acceso a usuarios y funciones CRUD
 */
export const UsuariosContext = createContext()

export function UsuariosProvider({ children }) {
	const usuariosHook = useUsuarios()

	const value = {
		usuarios: usuariosHook.usuarios,
		isLoading: usuariosHook.isLoading,
		error: usuariosHook.error,
		loadUsuarios: usuariosHook.loadUsuarios,
		agregarUsuario: usuariosHook.agregarUsuario,
		actualizarUsuario: usuariosHook.actualizarUsuario,
		desactivarUsuario: usuariosHook.desactivarUsuario,
		activarUsuario: usuariosHook.activarUsuario,
		eliminarUsuario: usuariosHook.desactivarUsuario, // Alias para compatibilidad
	}

	return (
		<UsuariosContext.Provider value={value}>
			{children}
		</UsuariosContext.Provider>
	)
}

