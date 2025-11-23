import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '../../contexts/ThemeContext'
import { AuthProvider } from '../../contexts/AuthContext'
// DataProvider será mockeado en setupTests.js antes de esta importación
import { DataProvider } from '../../contexts/DataContext'

/**
 * Utilidad para renderizar componentes con todos los providers necesarios
 */
export const renderWithProviders = (
	ui,
	{
		initialEntries = ['/'],
		user = null,
		...renderOptions
	} = {}
) => {
	const Wrapper = ({ children }) => {
		return (
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
	}

	return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Mock de usuario para tests
 */
export const mockUser = {
	id: 1,
	email: 'test@test.com',
	nombre: 'Test User',
	profile: {
		role: 'ADMIN',
		is_active: true,
	},
	role: 'ADMIN',
}

/**
 * Mock de usuario OBSERVER
 */
export const mockObserverUser = {
	...mockUser,
	profile: {
		role: 'OBSERVER',
		is_active: true,
	},
	role: 'OBSERVER',
}

/**
 * Mock de usuario MAINTENANCE
 */
export const mockMaintenanceUser = {
	...mockUser,
	profile: {
		role: 'MAINTENANCE',
		is_active: true,
	},
	role: 'MAINTENANCE',
}

