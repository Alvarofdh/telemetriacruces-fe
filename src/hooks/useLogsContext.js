import { useContext } from 'react'
import { LogsContext } from '../contexts/LogsContext'

/**
 * Hook para acceder al contexto de logs
 */
export const useLogsContext = () => {
	const context = useContext(LogsContext)
	if (!context) {
		throw new Error('useLogsContext debe ser usado dentro de un LogsContextProvider')
	}
	return context
}

