// Hook para gestión de alertas usando React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAlertas, getAlerta, resolveAlerta, patchAlerta, deleteAlerta } from '../services/alertas'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

// Query keys para React Query
const alertasKeys = {
	all: ['alertas'],
	lists: () => [...alertasKeys.all, 'list'],
	list: (filters) => [...alertasKeys.lists(), filters],
	details: () => [...alertasKeys.all, 'detail'],
	detail: (id) => [...alertasKeys.details(), id],
}

/**
 * Hook para obtener alertas del backend
 * @param {Object} filters - Filtros para las alertas
 * @param {number} filters.page - Número de página
 * @param {number} filters.page_size - Tamaño de página
 * @param {number} filters.cruce - Filtrar por ID de cruce
 * @param {boolean} filters.resolved - Filtrar por estado resuelto
 * @param {string} filters.type - Filtrar por tipo de alerta
 * @param {string} filters.severity - Filtrar por severidad
 * @returns {Object} Datos de alertas, loading, error, refetch
 */
export const useAlertas = (filters = {}) => {
	const { isAuthenticated: checkAuth } = useAuth()
	const queryClient = useQueryClient()
	
	// Query para obtener alertas
	const alertasQuery = useQuery({
		queryKey: alertasKeys.list(filters),
		queryFn: async () => {
			const response = await getAlertas({
				page: filters.page || 1,
				page_size: filters.page_size || 50,
				cruce: filters.cruce,
				resolved: filters.resolved,
				type: filters.type,
				severity: filters.severity,
			})
			return response
		},
		enabled: checkAuth(),
		staleTime: 30 * 1000, // 30 segundos
		refetchInterval: 30 * 1000, // Refetch cada 30 segundos
	})
	
	// Mutation para resolver alerta
	const resolveMutation = useMutation({
		mutationFn: resolveAlerta,
		onSuccess: () => {
			toast.success('Alerta resuelta correctamente')
			// Invalidar queries de alertas
			queryClient.invalidateQueries({ queryKey: alertasKeys.lists() })
		},
		onError: () => {
			toast.error('Error al resolver alerta')
		},
	})
	
	// Mutation para actualizar alerta
	const updateMutation = useMutation({
		mutationFn: ({ id, data }) => patchAlerta(id, data),
		onSuccess: () => {
			toast.success('Alerta actualizada correctamente')
			queryClient.invalidateQueries({ queryKey: alertasKeys.lists() })
		},
		onError: () => {
			toast.error('Error al actualizar alerta')
		},
	})
	
	// Mutation para eliminar alerta
	const deleteMutation = useMutation({
		mutationFn: deleteAlerta,
		onSuccess: () => {
			toast.success('Alerta eliminada correctamente')
			queryClient.invalidateQueries({ queryKey: alertasKeys.lists() })
		},
		onError: () => {
			toast.error('Error al eliminar alerta')
		},
	})
	
	return {
		alertas: alertasQuery.data?.results || [],
		total: alertasQuery.data?.count || 0,
		loading: alertasQuery.isLoading,
		error: alertasQuery.error,
		refetch: alertasQuery.refetch,
		resolveAlerta: resolveMutation.mutate,
		updateAlerta: updateMutation.mutate,
		deleteAlerta: deleteMutation.mutate,
		isResolving: resolveMutation.isPending,
		isUpdating: updateMutation.isPending,
		isDeleting: deleteMutation.isPending,
	}
}

