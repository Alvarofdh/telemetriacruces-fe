import { QueryClient } from '@tanstack/react-query'

// Logging condicional
const IS_DEBUG = import.meta.env.VITE_DEBUG_MODE === 'true'
const debugLog = (...args) => IS_DEBUG && console.log(...args)

/**
 * Configuración del QueryClient para React Query
 * 
 * Opciones configuradas:
 * - staleTime: Tiempo que los datos se consideran frescos (5 minutos)
 * - cacheTime: Tiempo que los datos se mantienen en cache (10 minutos)
 * - retry: Reintentos automáticos en caso de error
 * - refetchOnWindowFocus: No refetch automático al cambiar de ventana
 * - refetchOnReconnect: Refetch automático al reconectar
 */
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutos - datos frescos
			gcTime: 10 * 60 * 1000, // 10 minutos - tiempo de cache (antes cacheTime)
			retry: (failureCount, error) => {
				// No reintentar en errores 4xx (client errors)
				if (error?.response?.status >= 400 && error?.response?.status < 500) {
					return false
				}
				// Reintentar hasta 3 veces para errores de servidor
				return failureCount < 3
			},
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
			refetchOnWindowFocus: false, // No refetch al cambiar de ventana
			refetchOnReconnect: true, // Refetch al reconectar
			refetchOnMount: true, // Refetch al montar componente
			refetchInterval: false, // No polling automático (se puede configurar por query)
		},
		mutations: {
			retry: 1, // Reintentar mutaciones 1 vez
			retryDelay: 1000,
		},
	},
})

// Logging de queries en modo debug
if (IS_DEBUG) {
	queryClient.getQueryCache().subscribe((event) => {
		if (event?.type === 'updated') {
			debugLog('🔄 [React Query] Query updated:', event.query.queryKey)
		}
	})

	queryClient.getMutationCache().subscribe((event) => {
		if (event?.type === 'updated') {
			debugLog('🔄 [React Query] Mutation updated:', event.mutation.mutationKey)
		}
	})
}

