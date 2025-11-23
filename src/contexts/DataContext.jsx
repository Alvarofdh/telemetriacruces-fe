import React, { createContext, useContext, useEffect, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePermissions } from '../hooks/usePermissions'
import { CrucesContext } from './CrucesContext'
import { UsuariosContext } from './UsuariosContext'
import { LogsContext } from './LogsContext'
import { ConfigContext } from './ConfigContext'
import { StatsContext } from './StatsContext'

/**
 * Contexto de datos global de la aplicación (COMPATIBILIDAD HACIA ATRÁS)
 * 
 * Este contexto combina todos los contextos especializados para mantener
 * compatibilidad con código existente que usa useData().
 * 
 * Para nuevo código, se recomienda usar los contextos especializados directamente:
 * - CrucesContext para cruces
 * - UsuariosContext para usuarios
 * - LogsContext para logs
 * - ConfigContext para configuración
 * - StatsContext para estadísticas
 * - SocketContext para Socket.IO
 */
export const DataContext = createContext()

export function DataProvider({ children }) {
	const { user, isAuthenticated: checkAuth } = useAuth()
	const { hasPermission } = usePermissions()

	// Obtener valores de contextos especializados
	const crucesContext = useContext(CrucesContext)
	const usuariosContext = useContext(UsuariosContext)
	const logsContext = useContext(LogsContext)
	const configContext = useContext(ConfigContext)
	const statsContext = useContext(StatsContext)

	// Cargar datos iniciales cuando el usuario se autentica
	useEffect(() => {
		if (user && checkAuth()) {
			// Cargar datos básicos
			if (crucesContext?.loadESP32Data) {
				crucesContext.loadESP32Data(false)
			}

			// Cargar usuarios y logs solo si tiene permisos
			if (hasPermission('canViewUsuarios') && usuariosContext?.loadUsuarios) {
				usuariosContext.loadUsuarios()
			}
			if (hasPermission('canViewLogs') && logsContext?.loadLogs) {
				logsContext.loadLogs()
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, hasPermission])

	// ✅ CORRECCIÓN: Memoizar el valor del provider para evitar re-renders innecesarios
	// Combinar todos los valores de los contextos especializados
	const value = useMemo(() => ({
		// Cruces
		cruces: crucesContext?.cruces || [],
		isLoading: crucesContext?.isLoading || false,
		isESP32Connected: crucesContext?.isESP32Connected || false,
		lastUpdate: crucesContext?.lastUpdate || null,
		error: crucesContext?.error || null,
		loadESP32Data: crucesContext?.loadESP32Data,
		agregarCruce: crucesContext?.agregarCruce,
		actualizarCruce: crucesContext?.actualizarCruce,
		eliminarCruce: crucesContext?.eliminarCruce,
		updateCruceInState: crucesContext?.updateCruceInState,
		upsertCruceInState: crucesContext?.upsertCruceInState,

		// Usuarios
		usuarios: usuariosContext?.usuarios || [],
		isLoadingUsuarios: usuariosContext?.isLoading || false,
		usuariosError: usuariosContext?.error || null,
		loadUsuarios: usuariosContext?.loadUsuarios,
		agregarUsuario: usuariosContext?.agregarUsuario,
		actualizarUsuario: usuariosContext?.actualizarUsuario,
		desactivarUsuario: usuariosContext?.desactivarUsuario,
		activarUsuario: usuariosContext?.activarUsuario,
		eliminarUsuario: usuariosContext?.eliminarUsuario,

		// Logs
		logs: logsContext?.logs || [],
		isLoadingLogs: logsContext?.isLoading || false,
		logsError: logsContext?.error || null,
		loadLogs: logsContext?.loadLogs,
		agregarLog: logsContext?.agregarLog,

		// Configuración
		configuracion: configContext?.configuracion || {},
		setConfiguracion: configContext?.setConfiguracion,

		// Estadísticas
		stats: statsContext?.stats || {},
	}), [
		crucesContext?.cruces,
		crucesContext?.isLoading,
		crucesContext?.isESP32Connected,
		crucesContext?.lastUpdate,
		crucesContext?.error,
		crucesContext?.loadESP32Data,
		crucesContext?.agregarCruce,
		crucesContext?.actualizarCruce,
		crucesContext?.eliminarCruce,
		crucesContext?.updateCruceInState,
		crucesContext?.upsertCruceInState,
		usuariosContext?.usuarios,
		usuariosContext?.isLoading,
		usuariosContext?.error,
		usuariosContext?.loadUsuarios,
		usuariosContext?.agregarUsuario,
		usuariosContext?.actualizarUsuario,
		usuariosContext?.desactivarUsuario,
		usuariosContext?.activarUsuario,
		usuariosContext?.eliminarUsuario,
		logsContext?.logs,
		logsContext?.isLoading,
		logsContext?.error,
		logsContext?.loadLogs,
		logsContext?.agregarLog,
		configContext?.configuracion,
		configContext?.setConfiguracion,
		statsContext?.stats,
	])

	return (
		<DataContext.Provider value={value}>
			{children}
		</DataContext.Provider>
	)
}
