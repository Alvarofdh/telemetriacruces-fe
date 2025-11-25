import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { checkHealth, getCruces, getCruce, createCruce, updateCruce, deleteCruce, getTelemetria, getAlertas } from '../services'
import { useAuth } from './useAuth'
import { normalizeCruceData } from '../utils/telemetriaHelpers'
import toast from 'react-hot-toast'

// Logging condicional
const IS_DEBUG = import.meta.env.VITE_DEBUG_MODE === 'true'
const debugLog = (...args) => IS_DEBUG && console.log(...args)
const debugWarn = (...args) => IS_DEBUG && console.warn(...args)

// Datos mock de cruces (fallback cuando no hay conexión con ESP32)
const crucesBackup = [
	{
		id_cruce: 1,
		nombre: 'Cruce La Serena',
		estado: 'ACTIVO',
		bateria: 92,
		sensoresActivos: 4,
		ubicacion: 'Km 472.5, Ruta 5 Norte',
		ultimaActividad: '2024-01-15 08:30',
		tipoTren: 'Carga',
		velocidadPromedio: 65,
		coordenadas: { lat: -29.9027, lng: -71.2507 },
		fechaInstalacion: '2023-06-15',
		ultimoMantenimiento: '2024-01-10',
		responsable: 'Carlos Mendoza',
		telefono: '+56 9 8765 4321'
	},
	{
		id_cruce: 2,
		nombre: 'Cruce Coquimbo',
		estado: 'MANTENIMIENTO',
		bateria: 56,
		sensoresActivos: 2,
		ubicacion: 'Km 485.2, Ruta 5 Norte',
		ultimaActividad: '2024-01-14 14:20',
		tipoTren: 'Pasajeros',
		velocidadPromedio: 45,
		coordenadas: { lat: -29.9533, lng: -71.3395 },
		fechaInstalacion: '2023-08-20',
		ultimoMantenimiento: '2024-01-05',
		responsable: 'Ana García',
		telefono: '+56 9 7654 3210'
	},
	{
		id_cruce: 3,
		nombre: 'Cruce Ovalle',
		estado: 'ACTIVO',
		bateria: 78,
		sensoresActivos: 3,
		ubicacion: 'Km 412.8, Ruta 43',
		ultimaActividad: '2024-01-15 09:15',
		tipoTren: 'Mixto',
		velocidadPromedio: 55,
		coordenadas: { lat: -30.5978, lng: -71.2005 },
		fechaInstalacion: '2023-05-10',
		ultimoMantenimiento: '2024-01-08',
		responsable: 'Luis Rodriguez',
		telefono: '+56 9 6543 2109'
	},
]

// ✅ CORRECCIÓN: Normalizar datos de cruces usando normalizeCruceData cuando hay telemetria_actual
const normalizarCruce = (cruce) => {
	// Si el cruce tiene telemetria_actual del backend, usar normalizeCruceData
	if (cruce.telemetria_actual || cruce.ultima_telemetria) {
		const normalized = normalizeCruceData(cruce)
		return {
			...normalized,
			// Mantener campos adicionales y asegurar id_cruce
			id_cruce: cruce.id || cruce.id_cruce || normalized.id,
			coordenadas: {
				lat: cruce.coordenadas_lat || cruce.coordenadas?.lat || normalized.coordenadas_lat || 0,
				lng: cruce.coordenadas_lng || cruce.coordenadas?.lng || normalized.coordenadas_lng || 0,
			},
			fechaInstalacion: cruce.fechaInstalacion || cruce.instalacion || normalized.instalacion,
			ultimoMantenimiento: cruce.ultimoMantenimiento || normalized.ultimoMantenimiento,
			responsable: cruce.responsable || cruce.contacto?.responsable || normalized.responsable,
			telefono: cruce.telefono || cruce.contacto?.telefono || normalized.telefono,
		}
	}
	
	// Fallback para cruces sin telemetría (mantener compatibilidad)
	return {
		id_cruce: cruce.id || cruce.id_cruce,
		nombre: cruce.nombre || 'Sin nombre',
		ubicacion: cruce.ubicacion || 'Sin ubicación',
		estado: cruce.estado || 'ACTIVO',
		coordenadas: {
			lat: cruce.coordenadas_lat || cruce.coordenadas?.lat || 0,
			lng: cruce.coordenadas_lng || cruce.coordenadas?.lng || 0,
		},
		bateria: cruce.bateria || 0,
		sensoresActivos: cruce.sensoresActivos || 0,
		ultimaActividad: cruce.ultimaActividad || cruce.updated_at || cruce.created_at,
		tipoTren: cruce.tipoTren,
		velocidadPromedio: cruce.velocidadPromedio,
		fechaInstalacion: cruce.fechaInstalacion || cruce.instalacion,
		ultimoMantenimiento: cruce.ultimoMantenimiento,
		responsable: cruce.responsable || cruce.contacto?.responsable,
		telefono: cruce.telefono || cruce.contacto?.telefono,
		...cruce,
	}
}

// Query keys para React Query
const crucesKeys = {
	all: ['cruces'],
	lists: () => [...crucesKeys.all, 'list'],
	list: (filters) => [...crucesKeys.lists(), filters],
	details: () => [...crucesKeys.all, 'detail'],
	detail: (id) => [...crucesKeys.details(), id],
}

/**
 * Hook para gestión de cruces ferroviarios usando React Query
 * Maneja carga, creación, actualización y eliminación de cruces con cacheo automático
 */
export const useCruces = () => {
	const { isAuthenticated: checkAuth } = useAuth()
	const queryClient = useQueryClient()

	// Query para verificar salud del backend
	const healthQuery = useQuery({
		queryKey: ['health'],
		queryFn: checkHealth,
		enabled: checkAuth(),
		staleTime: 30 * 1000, // 30 segundos
		retry: 2,
	})

	// Query para cargar lista de cruces
	const crucesQuery = useQuery({
		queryKey: crucesKeys.list(),
		queryFn: async () => {
			const crucesResponse = await getCruces()
			const crucesLista = crucesResponse.results || crucesResponse || []
			return crucesLista.map(normalizarCruce)
		},
		enabled: checkAuth() && healthQuery.isSuccess,
		staleTime: 2 * 60 * 1000, // 2 minutos
		refetchInterval: 30 * 1000, // Refetch cada 30 segundos
		placeholderData: crucesBackup.map(normalizarCruce), // Datos de respaldo mientras carga
	})

	// Mutation para crear cruce
	const createMutation = useMutation({
		mutationFn: createCruce,
		onSuccess: (nuevoCruce) => {
			const cruceNormalizado = normalizarCruce(nuevoCruce)
			// Invalidar y refetch lista de cruces
			queryClient.invalidateQueries({ queryKey: crucesKeys.lists() })
			// Agregar al cache optimísticamente
			queryClient.setQueryData(crucesKeys.list(), (old) => {
				return old ? [...old, cruceNormalizado] : [cruceNormalizado]
			})
			toast.success('Cruce agregado exitosamente')
		},
		onError: () => {
			toast.error('Error al agregar cruce')
		},
	})

	// Mutation para actualizar cruce
	const updateMutation = useMutation({
		mutationFn: ({ id, data }) => updateCruce(id, data),
		onSuccess: (cruceActualizado, variables) => {
			const cruceNormalizado = normalizarCruce(cruceActualizado)
			// Actualizar en cache
			queryClient.setQueryData(crucesKeys.list(), (old) => {
				return old ? old.map(c => c.id_cruce === variables.id ? cruceNormalizado : c) : [cruceNormalizado]
			})
			// Invalidar query de detalle si existe
			queryClient.invalidateQueries({ queryKey: crucesKeys.detail(variables.id) })
			toast.success('Cruce actualizado exitosamente')
		},
		onError: () => {
			toast.error('Error al actualizar cruce')
		},
	})

	// Mutation para eliminar cruce
	const deleteMutation = useMutation({
		mutationFn: deleteCruce,
		onSuccess: (_, id) => {
			// Remover del cache
			queryClient.setQueryData(crucesKeys.list(), (old) => {
				return old ? old.filter(c => c.id_cruce !== id) : []
			})
			// Invalidar query de detalle
			queryClient.invalidateQueries({ queryKey: crucesKeys.detail(id) })
			toast.success('Cruce eliminado exitosamente')
		},
		onError: () => {
			toast.error('Error al eliminar cruce')
		},
	})

	/**
	 * Cargar datos de cruces desde el backend
	 * @param {boolean} loadFullDetails - Si true, carga detalles completos de cada cruce
	 */
	const loadESP32Data = async (loadFullDetails = false) => {
		if (loadFullDetails && crucesQuery.data) {
			// Cargar detalles completos de cada cruce
			await Promise.allSettled(
				crucesQuery.data.map(async (cruce) => {
					try {
						const cruceDetalle = await getCruce(cruce.id_cruce)
						const alertasResponse = await getAlertas({ cruce: cruce.id_cruce, resolved: false, page: 1 })
						
						const alertasActivas = alertasResponse.results || []
						
						// ✅ CORRECCIÓN: Usar normalizeCruceData que ya procesa telemetria_actual del backend
						const cruceNormalizado = normalizarCruce(cruceDetalle)
						
						updateCruceInState(cruce.id_cruce, (c) => ({
							...c,
							...cruceNormalizado,
							alertasActivas: alertasActivas.length,
						}))
					} catch (err) {
						debugWarn(`⚠️ Error al cargar detalles del cruce ${cruce.id_cruce}:`, err)
					}
				})
			)
		}
		return crucesQuery.refetch()
	}

	/**
	 * Actualizar un cruce en el estado (usado por Socket.IO)
	 * @param {number} id - ID del cruce
	 * @param {Function} updater - Función que recibe el cruce actual y retorna el cruce actualizado
	 */
	const updateCruceInState = (id, updater) => {
		queryClient.setQueryData(crucesKeys.list(), (old) => {
			if (!old) return old
			return old.map(c => {
				if (c.id_cruce === id || c.id === id) {
					return updater(c)
				}
				return c
			})
		})
	}

	/**
	 * Agregar o actualizar un cruce en el estado (usado por Socket.IO)
	 * @param {Object} cruceData - Datos del cruce
	 */
	const upsertCruceInState = (cruceData) => {
		const cruceNormalizado = normalizarCruce(cruceData)
		queryClient.setQueryData(crucesKeys.list(), (old) => {
			if (!old) return [cruceNormalizado]
			const existingIndex = old.findIndex(c => 
				c.id_cruce === cruceNormalizado.id_cruce || c.id === cruceNormalizado.id_cruce
			)
			if (existingIndex >= 0) {
				const updated = [...old]
				updated[existingIndex] = cruceNormalizado
				return updated
			}
			return [...old, cruceNormalizado]
		})
	}

	// Determinar si ESP32 está conectado
	const isESP32Connected = healthQuery.isSuccess && !healthQuery.isError

	// Manejar fallback a datos de respaldo
	const cruces = crucesQuery.data || (crucesQuery.isError ? crucesBackup.map(normalizarCruce) : [])

	return {
		cruces,
		isLoading: crucesQuery.isLoading || healthQuery.isLoading,
		isESP32Connected,
		lastUpdate: crucesQuery.dataUpdatedAt ? new Date(crucesQuery.dataUpdatedAt) : null,
		error: crucesQuery.error || healthQuery.error,
		loadESP32Data,
		agregarCruce: createMutation.mutateAsync,
		actualizarCruce: (id, data) => updateMutation.mutateAsync({ id, data }),
		eliminarCruce: deleteMutation.mutateAsync,
		updateCruceInState,
		upsertCruceInState,
	}
}

