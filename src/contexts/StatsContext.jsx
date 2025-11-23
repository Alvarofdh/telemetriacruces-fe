import React, { createContext, useContext } from 'react'
import { useStats } from '../hooks/useStats'
import { CrucesContext } from './CrucesContext'
import { UsuariosContext } from './UsuariosContext'
import { ConfigContext } from './ConfigContext'

/**
 * Contexto especializado para estadísticas del sistema
 * Calcula y proporciona estadísticas basadas en cruces, usuarios y configuración
 */
export const StatsContext = createContext()

export function StatsProvider({ children }) {
	// Obtener datos necesarios de otros contextos
	const crucesContext = useContext(CrucesContext)
	const usuariosContext = useContext(UsuariosContext)
	const configContext = useContext(ConfigContext)

	// Calcular estadísticas usando el hook especializado
	const stats = useStats(
		crucesContext?.cruces || [],
		usuariosContext?.usuarios || [],
		configContext?.configuracion || {}
	)

	const value = {
		stats,
	}

	return (
		<StatsContext.Provider value={value}>
			{children}
		</StatsContext.Provider>
	)
}

