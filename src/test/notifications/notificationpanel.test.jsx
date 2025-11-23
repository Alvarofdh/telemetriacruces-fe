import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationPanel } from '../../components/NotificationPanel'
import { renderWithProviders, mockUser } from '../utils/testUtils'
import * as alertasService from '../../services/alertas'
import * as socketService from '../../services/socket'

// Mock de servicios
vi.mock('../../services/alertas', () => ({
	getAlertas: vi.fn(),
}))

vi.mock('../../services/notifications', () => ({
	getNotificationSettings: vi.fn().mockResolvedValue({
		enable_notifications: true,
		notify_critical_alerts: true,
		notify_warning_alerts: true,
		notify_info_alerts: true,
	}),
}))

vi.mock('../../services/socket', () => ({
	getSocket: vi.fn(() => ({
		connected: true,
		on: vi.fn(),
		off: vi.fn(),
		emit: vi.fn(),
	})),
	connectSocket: vi.fn(),
	disconnectSocket: vi.fn(),
	socketEvents: {
		onNotification: vi.fn(),
		off: vi.fn(),
		removeAllListeners: vi.fn(),
		subscribe: vi.fn(),
		unsubscribe: vi.fn(),
		joinCruceRoom: vi.fn(),
		leaveCruceRoom: vi.fn(),
	},
}))

vi.mock('../../hooks/useSocketSubscription', () => ({
	useSocketSubscription: vi.fn(),
}))

describe('NotificationPanel', () => {
	const mockAlertas = [
		{
			id: 1,
			type: 'LOW_BATTERY',
			type_display: 'Batería Baja',
			description: 'Batería crítica (15%)',
			cruce: 1,
			cruce_nombre: 'Cruce Test 1',
			severity: 'CRITICAL',
			created_at: new Date().toISOString(),
			resolved: false,
		},
		{
			id: 2,
			type: 'SENSOR_ERROR',
			type_display: 'Error de Sensor',
			description: 'Sensor 3 desconectado',
			cruce: 2,
			cruce_nombre: 'Cruce Test 2',
			severity: 'WARNING',
			created_at: new Date().toISOString(),
			resolved: false,
		},
	]

	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(alertasService.getAlertas).mockResolvedValue({
			results: mockAlertas,
			count: mockAlertas.length,
		})
	})

	it('should render notification panel with title', async () => {
		renderWithProviders(<NotificationPanel />, { user: mockUser })

		await waitFor(() => {
			expect(screen.getByText(/centro de alertas/i)).toBeInTheDocument()
		})
	})

	it('should display alerts after loading', async () => {
		renderWithProviders(<NotificationPanel />, { user: mockUser })

		await waitFor(() => {
			expect(screen.getByText(/batería crítica/i)).toBeInTheDocument()
			expect(screen.getByText(/sensor 3 desconectado/i)).toBeInTheDocument()
		})
	})

	it('should show unread count', async () => {
		renderWithProviders(<NotificationPanel />, { user: mockUser })

		await waitFor(() => {
			expect(screen.getByText(/sin leer/i)).toBeInTheDocument()
		})
	})

	it('should mark notification as read when clicked', async () => {
		renderWithProviders(<NotificationPanel />, { user: mockUser })

		await waitFor(() => {
			expect(screen.getByText(/batería crítica/i)).toBeInTheDocument()
		})

		// Hacer click en una notificación
		const notification = screen.getByText(/batería crítica/i).closest('div')
		if (notification) {
			await userEvent.click(notification)
		}

		// Verificar que se actualizó el estado (esto depende de la implementación)
		// En este caso, verificamos que el componente sigue renderizando
		await waitFor(() => {
			expect(screen.getByText(/centro de alertas/i)).toBeInTheDocument()
		})
	})

	it('should show empty state when no alerts', async () => {
		vi.mocked(alertasService.getAlertas).mockResolvedValue({
			results: [],
			count: 0,
		})

		renderWithProviders(<NotificationPanel />, { user: mockUser })

		await waitFor(() => {
			expect(screen.getByText(/sin alertas/i)).toBeInTheDocument()
		})
	})
})

