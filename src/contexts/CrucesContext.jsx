import React, { createContext } from 'react'
import { useCruces } from '../hooks/useCruces'

/**
 * Contexto especializado para gestión de cruces
 * Proporciona acceso a cruces, telemetría y funciones CRUD
 */
export const CrucesContext = createContext()

export function CrucesProvider({ children }) {
	const crucesHook = useCruces()

	const value = {
		cruces: crucesHook.cruces,
		isLoading: crucesHook.isLoading,
		isESP32Connected: crucesHook.isESP32Connected,
		lastUpdate: crucesHook.lastUpdate,
		error: crucesHook.error,
		loadESP32Data: crucesHook.loadESP32Data,
		agregarCruce: crucesHook.agregarCruce,
		actualizarCruce: crucesHook.actualizarCruce,
		eliminarCruce: crucesHook.eliminarCruce,
		updateCruceInState: crucesHook.updateCruceInState,
		upsertCruceInState: crucesHook.upsertCruceInState,
	}

	return (
		<CrucesContext.Provider value={value}>
			{children}
		</CrucesContext.Provider>
	)
}

