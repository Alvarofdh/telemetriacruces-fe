import React, { createContext } from 'react'
import { useLogs } from '../hooks/useLogs'

/**
 * Contexto especializado para gestión de logs del sistema
 * Proporciona acceso a logs y funciones de agregado
 */
export const LogsContext = createContext()

export function LogsContextProvider({ children }) {
	const logsHook = useLogs()

	const value = {
		logs: logsHook.logs,
		isLoading: logsHook.isLoading,
		error: logsHook.error,
		loadLogs: logsHook.loadLogs,
		agregarLog: logsHook.agregarLog,
	}

	return (
		<LogsContext.Provider value={value}>
			{children}
		</LogsContext.Provider>
	)
}

