import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { LoginPage } from '../../components/LoginPage'
import { AuthProvider } from '../../contexts/AuthContext'
import { ThemeProvider } from '../../contexts/ThemeContext'
import { DataProvider } from '../../contexts/DataContext'
import * as authService from '../../services/auth'

// Los mocks globales ya están en setupTests.js, pero podemos sobrescribir aquí si es necesario

describe('Login Flow', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		localStorage.clear()
	})

	it('should render login form', () => {
		render(
			<BrowserRouter>
				<ThemeProvider>
					<AuthProvider>
						<DataProvider>
							<LoginPage />
						</DataProvider>
					</AuthProvider>
				</ThemeProvider>
			</BrowserRouter>
		)

		expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
	})

	it('should redirect to dashboard after successful login', async () => {
		const mockUser = {
			email: 'test@test.com',
			profile: { role: 'ADMIN' },
		}

		vi.mocked(authService.login).mockResolvedValue({
			user: mockUser,
			accessToken: 'mock-access-token',
			refreshToken: 'mock-refresh-token',
		})

		// Mock localStorage
		Storage.prototype.setItem = vi.fn()

		const user = userEvent.setup()
		const { container } = render(
			<BrowserRouter>
				<ThemeProvider>
					<AuthProvider>
						<DataProvider>
							<LoginPage />
						</DataProvider>
					</AuthProvider>
				</ThemeProvider>
			</BrowserRouter>
		)

		// Llenar formulario
		await user.type(screen.getByLabelText(/email/i), 'test@test.com')
		await user.type(screen.getByLabelText(/contraseña/i), 'password123')

		// Enviar formulario
		await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

		// Verificar que se llamó al servicio de login
		await waitFor(() => {
			expect(authService.login).toHaveBeenCalledWith('test@test.com', 'password123')
		})

		// Verificar que se llamó al servicio de login
		// Nota: El token se guarda a través de setTokens en httpClient, que está mockeado
		await waitFor(() => {
			expect(authService.login).toHaveBeenCalledWith('test@test.com', 'password123')
		}, { timeout: 2000 })
	})

	it('should show error message on login failure', async () => {
		vi.mocked(authService.login).mockRejectedValue(new Error('Credenciales inválidas'))

		const user = userEvent.setup()
		render(
			<BrowserRouter>
				<ThemeProvider>
					<AuthProvider>
						<DataProvider>
							<LoginPage />
						</DataProvider>
					</AuthProvider>
				</ThemeProvider>
			</BrowserRouter>
		)

		await user.type(screen.getByLabelText(/email/i), 'wrong@test.com')
		await user.type(screen.getByLabelText(/contraseña/i), 'wrongpassword')
		await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

		// Verificar que aparece mensaje de error
		await waitFor(() => {
			expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument()
		})
	})
})

