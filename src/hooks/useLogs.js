import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { logsAPI } from '../services'
import { usePermissions } from './usePermissions'

// Logging condicional
const IS_DEBUG = import.meta.env.VITE_DEBUG_MODE === 'true'
const debugLog = (...args) => IS_DEBUG && console.log(...args)

// Query keys para React Query
const logsKeys = {
	all: ['logs'],
	lists: () => [...logsKeys.all, 'list'],
	list: (filters) => [...logsKeys.lists(), filters],
}

/**
 * Hook para gestión de logs del sistema usando React Query
 * Maneja carga y agregado de logs
 */
export const useLogs = () => {
	const { hasPermission } = usePermissions()
	const queryClient = useQueryClient()

	// Query para cargar logs
	const logsQuery = useQuery({
		queryKey: logsKeys.list(),
		queryFn: async () => {
			// NOTA: El endpoint de logs no está implementado en el backend actual
			// Por ahora, retornamos un array vacío
			const response = await logsAPI.getAll().catch(() => ({ results: [] }))
			const logsLista = response.results || response || []
			
			// Normalizar logs
			return logsLista.map(log => ({
				id: log.id,
				tipo: log.tipo || log.type || 'INFO',
				mensaje: log.mensaje || log.message || 'Sin mensaje',
				usuario: log.usuario || log.user || 'Sistema',
				fecha: log.fecha || log.created_at || log.timestamp || new Date().toISOString(),
				detalles: log.detalles || log.details || {},
			}))
		},
		enabled: hasPermission('canViewLogs'),
		staleTime: 1 * 60 * 1000, // 1 minuto (logs cambian frecuentemente)
		refetchInterval: 30 * 1000, // Refetch cada 30 segundos
	})

	/**
	 * Cargar logs del sistema
	 */
	const loadLogs = async () => {
		if (!hasPermission('canViewLogs')) {
			debugLog('⏸️ Usuario sin permisos para ver logs')
			return
		}
		return logsQuery.refetch()
	}

	/**
	 * Agregar un log (solo actualiza la lista local)
	 * Los logs se crean automáticamente en el backend
	 */
	const agregarLog = () => {
		// Los logs se crean automáticamente en el backend
		// Invalidar cache para refetch
		setTimeout(() => {
			queryClient.invalidateQueries({ queryKey: logsKeys.lists() })
		}, 1000)
	}

	return {
		logs: logsQuery.data || [],
		isLoading: logsQuery.isLoading,
		error: logsQuery.error,
		loadLogs,
		agregarLog,
	}
}


