import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CrossingList } from '../../components/CrossingList'
import { renderWithProviders, mockUser } from '../utils/testUtils'
import * as crucesService from '../../services/cruces'

// Mock del servicio de cruces
vi.mock('../../services/cruces', () => ({
	getCruces: vi.fn(),
}))

// Mock de useData
vi.mock('../../hooks/useData', () => ({
	useData: vi.fn(),
}))

describe('CrossingList - Data Loading', () => {
	const mockCruces = [
		{
			id: 1,
			nombre: 'Cruce Test 1',
			ubicacion: 'Ruta 1',
			estado: 'ACTIVO',
			bateria: 85,
			sensoresActivos: 4,
		},
		{
			id: 2,
			nombre: 'Cruce Test 2',
			ubicacion: 'Ruta 2',
			estado: 'MANTENIMIENTO',
			bateria: 45,
			sensoresActivos: 2,
		},
	]

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should render empty state when no crossings', () => {
		const { useData } = require('../../hooks/useData')
		vi.mocked(useData).mockReturnValue({
			cruces: [],
			isLoading: false,
			stats: { totalCruces: 0, activos: 0, mantenimiento: 0, inactivos: 0, alertasBateria: 0 },
			isESP32Connected: false,
			lastUpdate: null,
		})

		renderWithProviders(<CrossingList />, { user: mockUser })

		// Verificar que se renderiza el componente con estado vacío
		expect(screen.getByText(/cruces ferroviarios/i)).toBeInTheDocument()
		expect(screen.getByText(/mostrando 0 cruces/i)).toBeInTheDocument()
	})

	it('should render crossing cards after loading', async () => {
		const { useData } = require('../../hooks/useData')
		vi.mocked(useData).mockReturnValue({
			cruces: mockCruces,
			isLoading: false,
			stats: { totalCruces: 2, activos: 1, mantenimiento: 1, inactivos: 0, alertasBateria: 0 },
			isESP32Connected: true,
			lastUpdate: new Date(),
		})

		renderWithProviders(<CrossingList />, { user: mockUser })

		await waitFor(() => {
			expect(screen.getByText('Cruce Test 1')).toBeInTheDocument()
			expect(screen.getByText('Cruce Test 2')).toBeInTheDocument()
		}, { timeout: 2000 })
	})

	it('should filter crossings by status', async () => {
		const user = userEvent.setup()
		const { useData } = require('../../hooks/useData')
		vi.mocked(useData).mockReturnValue({
			cruces: mockCruces,
			isLoading: false,
			stats: { totalCruces: 2, activos: 1, mantenimiento: 1, inactivos: 0, alertasBateria: 0 },
			isESP32Connected: true,
			lastUpdate: new Date(),
		})

		renderWithProviders(<CrossingList />, { user: mockUser })

		await waitFor(() => {
			expect(screen.getByText('Cruce Test 1')).toBeInTheDocument()
		}, { timeout: 2000 })

		// Filtrar por ACTIVO - buscar el botón de filtro
		const activoButtons = screen.getAllByText(/activos/i)
		const activoButton = activoButtons.find(btn => btn.tagName === 'BUTTON' || btn.closest('button'))
		if (activoButton) {
			await user.click(activoButton)
		} else {
			// Si no hay botón, intentar con el texto directamente
			await user.click(screen.getByText(/activos/i))
		}

		await waitFor(() => {
			expect(screen.getByText('Cruce Test 1')).toBeInTheDocument()
			expect(screen.queryByText('Cruce Test 2')).not.toBeInTheDocument()
		}, { timeout: 2000 })
	})

	it('should search crossings by name or location', async () => {
		const user = userEvent.setup()
		const { useData } = require('../../hooks/useData')
		vi.mocked(useData).mockReturnValue({
			cruces: mockCruces,
			isLoading: false,
			stats: { totalCruces: 2, activos: 1, mantenimiento: 1, inactivos: 0, alertasBateria: 0 },
			isESP32Connected: true,
			lastUpdate: new Date(),
		})

		renderWithProviders(<CrossingList />, { user: mockUser })

		await waitFor(() => {
			expect(screen.getByText('Cruce Test 1')).toBeInTheDocument()
		}, { timeout: 2000 })

		// Buscar por nombre
		const searchInput = screen.getByPlaceholderText(/buscar/i)
		await user.clear(searchInput)
		await user.type(searchInput, 'Test 1')

		await waitFor(() => {
			expect(screen.getByText('Cruce Test 1')).toBeInTheDocument()
			expect(screen.queryByText('Cruce Test 2')).not.toBeInTheDocument()
		}, { timeout: 2000 })
	})
})

