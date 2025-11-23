import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ControlPanel } from '../../components/control/ControlPanel'
import { renderWithProviders, mockUser, mockObserverUser, mockMaintenanceUser } from '../utils/testUtils'
import * as usePermissionsHook from '../../hooks/usePermissions'

// Mock de usePermissions
vi.mock('../../hooks/usePermissions', () => ({
	usePermissions: vi.fn(),
}))

describe('ControlPanel - Roles', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should render AdminPanel for ADMIN role', () => {
		vi.mocked(usePermissionsHook.usePermissions).mockReturnValue({
			isAdmin: true,
			isMaintenance: false,
			isObserver: false,
			role: 'ADMIN',
			hasPermission: vi.fn(() => true),
			hasRole: vi.fn(() => true),
		})

		renderWithProviders(<ControlPanel />, { user: mockUser })

		// Verificar que se renderiza el panel de administración
		expect(screen.getByText(/panel de administración/i)).toBeInTheDocument()
	})

	it('should render MaintenancePanel for MAINTENANCE role', () => {
		vi.mocked(usePermissionsHook.usePermissions).mockReturnValue({
			isAdmin: false,
			isMaintenance: true,
			isObserver: false,
			role: 'MAINTENANCE',
			hasPermission: vi.fn(() => true),
			hasRole: vi.fn(() => true),
		})

		renderWithProviders(<ControlPanel />, { user: mockMaintenanceUser })

		// Verificar que se renderiza el panel de mantenimiento
		expect(screen.getByText(/panel de mantenimiento/i)).toBeInTheDocument()
	})

	it('should render ObserverPanel for OBSERVER role', () => {
		vi.mocked(usePermissionsHook.usePermissions).mockReturnValue({
			isAdmin: false,
			isMaintenance: false,
			isObserver: true,
			role: 'OBSERVER',
			hasPermission: vi.fn(() => true),
			hasRole: vi.fn(() => true),
		})

		renderWithProviders(<ControlPanel />, { user: mockObserverUser })

		// Verificar que se renderiza el panel de observador
		expect(screen.getByText(/panel de observación/i)).toBeInTheDocument()
	})

	it('should redirect to dashboard if no valid role', () => {
		vi.mocked(usePermissionsHook.usePermissions).mockReturnValue({
			isAdmin: false,
			isMaintenance: false,
			isObserver: false,
			role: null,
			hasPermission: vi.fn(() => false),
			hasRole: vi.fn(() => false),
		})

		const { container } = renderWithProviders(<ControlPanel />, { user: null })

		// Verificar que se redirige (Navigate component)
		// En este caso, el componente Navigate no renderiza nada visible
		// pero podemos verificar que no se renderiza ningún panel
		expect(screen.queryByText(/panel de administración/i)).not.toBeInTheDocument()
		expect(screen.queryByText(/panel de mantenimiento/i)).not.toBeInTheDocument()
		expect(screen.queryByText(/panel de observador/i)).not.toBeInTheDocument()
	})
})

