import React, { createContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, logout as apiLogout, getStoredUser } from '../services/auth'
import { isAuthenticated as checkAuth, clearTokens, STORAGE_KEYS } from '../services/httpClient'
import { connectSocket, disconnectSocket } from '../services/socket'
import toast from 'react-hot-toast'

/**
 * Contexto de autenticación
 * Maneja el estado del usuario, login, logout y permisos
 */
export const AuthContext = createContext()

export function AuthProvider({ children }) {
	// Estado de autenticación con persistencia en localStorage
	const [user, setUser] = useState(() => {
		return getStoredUser()
	})
	
	const [isAdmin, setIsAdmin] = useState(() => {
		if (!user) return false
		const userRole = user.profile?.role || user.role
		return userRole === 'ADMIN' || userRole === 'MAINTENANCE'
	})

	// Actualizar isAdmin cuando cambia el usuario
	useEffect(() => {
		if (!user) {
			setIsAdmin(false)
			return
		}
		const userRole = user.profile?.role || user.role
		const admin = userRole === 'ADMIN' || userRole === 'MAINTENANCE'
		setIsAdmin(admin)
		
		if (import.meta.env.VITE_DEBUG_MODE === 'true') {
			console.log('👤 [AuthContext] Usuario actualizado:', user.email, '| Rol:', userRole, '| isAdmin:', admin)
		}
	}, [user])

	/**
	 * Iniciar sesión
	 * @param {string} email - Email del usuario
	 * @param {string} password - Contraseña del usuario
	 * @returns {Promise<void>}
	 */
	const login = useCallback(async (email, password) => {
		try {
			const response = await apiLogin(email, password)
			
			// El servicio auth.js ya guarda el usuario en localStorage
			// Solo necesitamos actualizar el estado
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log('🔐 [AuthContext] Login exitoso:', response.user)
			}
			
			setUser(response.user)
			
			// Verificar si es admin (puede venir en profile.role o directamente en role)
			const userRole = response.user?.profile?.role || response.user?.role
			const isAdminUser = userRole === 'ADMIN' || userRole === 'MAINTENANCE'
			setIsAdmin(isAdminUser)
			
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log('👤 [AuthContext] Rol del usuario:', userRole, '| isAdmin:', isAdminUser)
			}

			// Conectar Socket.IO después del login
			connectSocket()

			toast.success(`Bienvenido, ${response.user?.email || email}`)
		} catch (error) {
			console.error('Error al iniciar sesión:', error)
			const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Error al iniciar sesión'
			toast.error(errorMsg)
			throw error
		}
	}, [])

	/**
	 * Cerrar sesión
	 * @returns {Promise<void>}
	 */
	const logout = useCallback(async () => {
		try {
			// Desconectar Socket.IO antes de limpiar tokens
			disconnectSocket()
			
			// Cerrar sesión en el backend
			await apiLogout()
			
			// Limpiar estado local
			setUser(null)
			setIsAdmin(false)
			
			// Limpiar tokens (apiLogout ya lo hace, pero por si acaso)
			clearTokens()
			
			toast.success('Sesión cerrada exitosamente')
		} catch (error) {
			console.error('Error al cerrar sesión:', error)
			// Aún así limpiar estado local
			setUser(null)
			setIsAdmin(false)
			clearTokens()
			disconnectSocket()
		}
	}, [])

	/**
	 * Verificar si el usuario está autenticado
	 * @returns {boolean}
	 */
	const isAuthenticated = useCallback(() => {
		return checkAuth() && !!user
	}, [user])

	/**
	 * Actualizar datos del usuario (útil después de actualizar perfil)
	 * @param {Object} userData - Datos actualizados del usuario
	 */
	const updateUser = useCallback((userData) => {
		setUser(prev => {
			const updated = { ...prev, ...userData }
			// Actualizar en localStorage
			if (updated) {
				localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated))
			}
			return updated
		})
	}, [])

	const value = {
		user,
		isAdmin,
		login,
		logout,
		isAuthenticated,
		updateUser,
	}

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}

