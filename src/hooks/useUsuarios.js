import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usuariosAPI } from '../services'
import { usePermissions } from './usePermissions'
import toast from 'react-hot-toast'

// Logging condicional
const IS_DEBUG = import.meta.env.VITE_DEBUG_MODE === 'true'
const debugLog = (...args) => IS_DEBUG && console.log(...args)

// Query keys para React Query
const usuariosKeys = {
	all: ['usuarios'],
	lists: () => [...usuariosKeys.all, 'list'],
	list: (filters) => [...usuariosKeys.lists(), filters],
	details: () => [...usuariosKeys.all, 'detail'],
	detail: (id) => [...usuariosKeys.details(), id],
}

/**
 * Hook para gestión de usuarios del sistema usando React Query
 * Maneja carga, creación, actualización, activación y desactivación de usuarios
 */
export const useUsuarios = () => {
	const { hasPermission } = usePermissions()
	const queryClient = useQueryClient()

	// Query para cargar usuarios
	const usuariosQuery = useQuery({
		queryKey: usuariosKeys.list(),
		queryFn: async () => {
			const response = await usuariosAPI.getAll()
			const usuariosLista = response.results || response || []
			
			// Normalizar usuarios
			return usuariosLista.map(usuario => ({
				id: usuario.id,
				email: usuario.email,
				nombre: usuario.first_name && usuario.last_name 
					? `${usuario.first_name} ${usuario.last_name}`
					: usuario.email,
				first_name: usuario.first_name,
				last_name: usuario.last_name,
				rol: usuario.profile?.role || usuario.role || usuario.rol || 'OBSERVER', // ✅ Compatibilidad: usar 'rol' para consistencia
				role: usuario.profile?.role || usuario.role || usuario.rol || 'OBSERVER', // Mantener 'role' también para compatibilidad
				estado: usuario.is_active !== undefined ? (usuario.is_active ? 'ACTIVO' : 'INACTIVO') : 'ACTIVO',
				is_active: usuario.is_active !== undefined ? usuario.is_active : true,
				profile: usuario.profile || { role: usuario.role || usuario.rol || 'OBSERVER' },
				created_at: usuario.created_at,
				updated_at: usuario.updated_at,
				ultimoAcceso: usuario.last_login || usuario.ultimoAcceso || null,
			}))
		},
		enabled: hasPermission('canViewUsuarios'),
		staleTime: 5 * 60 * 1000, // 5 minutos
	})

	/**
	 * Cargar usuarios del sistema
	 */
	const loadUsuarios = async () => {
		if (!hasPermission('canViewUsuarios')) {
			debugLog('⏸️ Usuario sin permisos para ver usuarios')
			return
		}
		return usuariosQuery.refetch()
	}

	// Normalizar usuario
	const normalizarUsuario = (usuario) => ({
		id: usuario.id,
		email: usuario.email,
		nombre: usuario.first_name && usuario.last_name 
			? `${usuario.first_name} ${usuario.last_name}`
			: usuario.email,
		first_name: usuario.first_name,
		last_name: usuario.last_name,
		rol: usuario.profile?.role || usuario.role || usuario.rol || 'OBSERVER', // ✅ Compatibilidad: usar 'rol' para consistencia
		role: usuario.profile?.role || usuario.role || usuario.rol || 'OBSERVER', // Mantener 'role' también para compatibilidad
		estado: usuario.is_active !== undefined ? (usuario.is_active ? 'ACTIVO' : 'INACTIVO') : 'ACTIVO',
		is_active: usuario.is_active !== undefined ? usuario.is_active : true,
		profile: usuario.profile || { role: usuario.role || usuario.rol || 'OBSERVER' },
		created_at: usuario.created_at,
		updated_at: usuario.updated_at,
		ultimoAcceso: usuario.last_login || usuario.ultimoAcceso || null,
	})

	// Mutation para crear usuario
	const createMutation = useMutation({
		mutationFn: usuariosAPI.create,
		onSuccess: (nuevoUsuario) => {
			const usuarioNormalizado = normalizarUsuario(nuevoUsuario)
			queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() })
			queryClient.setQueryData(usuariosKeys.list(), (old) => {
				return old ? [...old, usuarioNormalizado] : [usuarioNormalizado]
			})
			toast.success('Usuario agregado exitosamente')
		},
		onError: () => {
			toast.error('Error al agregar usuario')
		},
	})

	// Mutation para actualizar usuario
	const updateMutation = useMutation({
		mutationFn: ({ id, data }) => usuariosAPI.update(id, data),
		onSuccess: (usuarioActualizado, variables) => {
			const usuarioNormalizado = normalizarUsuario(usuarioActualizado)
			queryClient.setQueryData(usuariosKeys.list(), (old) => {
				return old ? old.map(u => u.id === variables.id ? usuarioNormalizado : u) : [usuarioNormalizado]
			})
			queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(variables.id) })
			toast.success('Usuario actualizado exitosamente')
		},
		onError: () => {
			toast.error('Error al actualizar usuario')
		},
	})

	// Mutation para desactivar usuario
	const deactivateMutation = useMutation({
		mutationFn: usuariosAPI.delete,
		onSuccess: (_, id) => {
			queryClient.setQueryData(usuariosKeys.list(), (old) => {
				return old ? old.map(u => 
					u.id === id ? { ...u, estado: 'INACTIVO', is_active: false } : u
				) : []
			})
			toast.success('Usuario desactivado exitosamente')
		},
		onError: () => {
			toast.error('Error al desactivar usuario')
		},
	})

	// Mutation para activar usuario
	const activateMutation = useMutation({
		mutationFn: usuariosAPI.activate,
		onSuccess: (_, id) => {
			queryClient.setQueryData(usuariosKeys.list(), (old) => {
				return old ? old.map(u => 
					u.id === id ? { ...u, estado: 'ACTIVO', is_active: true } : u
				) : []
			})
			toast.success('Usuario activado exitosamente')
		},
		onError: () => {
			toast.error('Error al activar usuario')
		},
	})

	return {
		usuarios: usuariosQuery.data || [],
		isLoading: usuariosQuery.isLoading,
		error: usuariosQuery.error,
		loadUsuarios,
		agregarUsuario: createMutation.mutateAsync,
		actualizarUsuario: (id, data) => updateMutation.mutateAsync({ id, data }),
		desactivarUsuario: deactivateMutation.mutateAsync,
		activarUsuario: activateMutation.mutateAsync,
	}
}


