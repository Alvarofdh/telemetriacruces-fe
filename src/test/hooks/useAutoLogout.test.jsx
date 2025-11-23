import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { useAutoLogout } from '../../hooks/useAutoLogout'
import { AuthProvider } from '../../contexts/AuthContext'
import { ThemeProvider } from '../../contexts/ThemeContext'
import { DataProvider } from '../../contexts/DataContext'
import * as authService from '../../services/auth'

// Mock del servicio de autenticación
vi.mock('../../services/auth', () => ({
	login: vi.fn(),
	logout: vi.fn().mockResolvedValue(undefined),
	getStoredUser: vi.fn(),
	register: vi.fn(),
	getProfile: vi.fn(),
	updateProfile: vi.fn(),
	changePassword: vi.fn(),
}))

// Mock de useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom')
	return {
		...actual,
		useNavigate: () => mockNavigate,
	}
})

describe('useAutoLogout', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.useFakeTimers()
		localStorage.clear()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	const wrapper = ({ children }) => (
		<BrowserRouter>
			<ThemeProvider>
				<AuthProvider>
					<DataProvider>
						{children}
					</DataProvider>
				</AuthProvider>
			</ThemeProvider>
		</BrowserRouter>
	)

	it('should not trigger logout if user is active', async () => {
		const mockUser = {
			email: 'test@test.com',
			profile: { role: 'ADMIN' },
		}

		vi.mocked(authService.getStoredUser).mockReturnValue(mockUser)

		renderHook(() => useAutoLogout(1), { wrapper }) // 1 minuto para test rápido

		// Simular actividad del usuario cada 30 segundos (antes de que expire el timer)
		act(() => {
			vi.advanceTimersByTime(30000) // 30 segundos
			window.dispatchEvent(new Event('mousedown')) // Actividad resetea el timer
		})

		act(() => {
			vi.advanceTimersByTime(30000) // Otros 30 segundos (total 60)
			window.dispatchEvent(new Event('click')) // Actividad resetea el timer
		})

		// Avanzar otros 30 segundos (pero el timer fue reseteado, así que no debería disparar)
		act(() => {
			vi.advanceTimersByTime(30000)
		})

		// Verificar que NO se navegó porque hubo actividad que reseteó el timer
		expect(mockNavigate).not.toHaveBeenCalled()
	})

	it('should trigger logout after inactivity period', async () => {
		const mockUser = {
			email: 'test@test.com',
			profile: { role: 'ADMIN' },
		}

		vi.mocked(authService.getStoredUser).mockReturnValue(mockUser)

		renderHook(() => useAutoLogout(1), { wrapper }) // 1 minuto

		// Avanzar el tiempo sin actividad (1 minuto completo)
		await act(async () => {
			vi.advanceTimersByTime(60000) // 1 minuto completo
			await new Promise(resolve => setTimeout(resolve, 10))
		})

		// Verificar que se llamó a logout
		expect(authService.logout).toHaveBeenCalled()
		expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
	}, { timeout: 10000 })

	it('should not activate if no user is logged in', () => {
		vi.mocked(authService.getStoredUser).mockReturnValue(null)

		renderHook(() => useAutoLogout(1), { wrapper })

		// Avanzar tiempo
		act(() => {
			vi.advanceTimersByTime(60000)
		})

		// Verificar que NO se llamó a logout
		expect(authService.logout).not.toHaveBeenCalled()
	})
})

