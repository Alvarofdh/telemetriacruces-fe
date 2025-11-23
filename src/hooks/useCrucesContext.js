import { useContext } from 'react'
import { CrucesContext } from '../contexts/CrucesContext'

/**
 * Hook para acceder al contexto de cruces
 */
export const useCrucesContext = () => {
	const context = useContext(CrucesContext)
	if (!context) {
		throw new Error('useCrucesContext debe ser usado dentro de un CrucesProvider')
	}
	return context
}

