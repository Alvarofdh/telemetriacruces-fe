import { useContext } from 'react'
import { StatsContext } from '../contexts/StatsContext'

/**
 * Hook para acceder al contexto de estadísticas
 */
export const useStatsContext = () => {
	const context = useContext(StatsContext)
	if (!context) {
		throw new Error('useStatsContext debe ser usado dentro de un StatsProvider')
	}
	return context
}

