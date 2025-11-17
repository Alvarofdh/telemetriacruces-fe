import { useContext } from 'react'
import { DataContext } from '../contexts/DataContext.jsx'

/**
 * Hook personalizado para acceder al contexto de datos
 * @returns {Object} Contexto de datos con todos los estados y funciones
 */
export const useData = () => {
	const context = useContext(DataContext)
	if (!context) {
		throw new Error('useData debe ser usado dentro de un DataProvider')
	}
	return context
}

