import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'

/**
 * Hook para auto-logout después de inactividad
 * @param {number} minutes - Minutos de inactividad antes de logout
 */
export const useAutoLogout = (minutes = 30) => {
	const { user, logout } = useData()
	const navigate = useNavigate()
	const timeoutRef = useRef(null)
	const lastActivityRef = useRef(Date.now())

	useEffect(() => {
		// Solo activar si hay usuario autenticado
		if (!user) {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
			return
		}

		// Eventos que indican actividad del usuario
		const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

		const resetTimer = () => {
			// Limpiar timer anterior
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}

			// Actualizar última actividad
			lastActivityRef.current = Date.now()

			// Configurar nuevo timer
			const timeoutMs = minutes * 60 * 1000
			timeoutRef.current = setTimeout(() => {
				if (user) {
					console.warn(`⚠️ Sesión cerrada por inactividad (${minutes} minutos)`)
					logout()
					navigate('/login', { replace: true })
				}
			}, timeoutMs)
		}

		// Iniciar timer
		resetTimer()

		// Agregar listeners de actividad
		activityEvents.forEach(event => {
			window.addEventListener(event, resetTimer, { passive: true })
		})

		// Cleanup
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
			activityEvents.forEach(event => {
				window.removeEventListener(event, resetTimer)
			})
		}
	}, [user, minutes, logout, navigate])
}

