import { useContext } from 'react'
import { UsuariosContext } from '../contexts/UsuariosContext'

/**
 * Hook para acceder al contexto de usuarios
 */
export const useUsuariosContext = () => {
	const context = useContext(UsuariosContext)
	if (!context) {
		throw new Error('useUsuariosContext debe ser usado dentro de un UsuariosProvider')
	}
	return context
}

