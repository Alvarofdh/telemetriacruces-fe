import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Limpiar después de cada test
afterEach(() => {
	cleanup()
})

// Mock global de servicios de autenticación
vi.mock('../services/auth', async () => {
	const actual = await vi.importActual('../services/auth')
	const mockLogin = vi.fn()
	const mockLogout = vi.fn().mockResolvedValue(undefined)
	const mockGetStoredUser = vi.fn(() => null)
	return {
		...actual,
		login: mockLogin,
		logout: mockLogout,
		getStoredUser: mockGetStoredUser,
		register: vi.fn(),
		getProfile: vi.fn(),
		updateProfile: vi.fn(),
		changePassword: vi.fn(),
		// Aliases usados en AuthContext
		apiLogin: mockLogin,
		apiLogout: mockLogout,
	}
})

// Mock global de servicios de socket
vi.mock('../services/socket', async () => {
	const actual = await vi.importActual('../services/socket')
	const mockSocket = {
		connected: true,
		on: vi.fn(),
		off: vi.fn(),
		emit: vi.fn(),
		disconnect: vi.fn(),
	}
	return {
		...actual,
		connectSocket: vi.fn(() => mockSocket),
		disconnectSocket: vi.fn(),
		getSocket: vi.fn(() => mockSocket),
		socketEvents: {
			onNotification: vi.fn(),
			off: vi.fn(),
			removeAllListeners: vi.fn(),
			subscribe: vi.fn(),
			unsubscribe: vi.fn(),
			joinCruceRoom: vi.fn(),
			leaveCruceRoom: vi.fn(),
			onNewAlerta: vi.fn(),
			onNewTelemetria: vi.fn(),
			onBarrierEvent: vi.fn(),
			onCruceUpdate: vi.fn(),
		},
	}
})

// Mock global de DataContext para evitar problemas de importación .jsx
// IMPORTANTE: Este mock debe ser síncrono y ejecutarse ANTES de cualquier importación
const mockDataContext = () => {
	const React = require('react')
	const defaultContextValue = {
		cruces: [],
		isLoading: false,
		stats: { totalCruces: 0, activos: 0, mantenimiento: 0, inactivos: 0, alertasBateria: 0 },
		isESP32Connected: false,
		lastUpdate: null,
		loadESP32Data: vi.fn(),
		activarUsuario: vi.fn(),
		desactivarUsuario: vi.fn(),
		usuarios: [],
		logs: [],
	}
	const DataContext = React.createContext(defaultContextValue)
	const DataProvider = ({ children, value = defaultContextValue }) => 
		React.createElement(DataContext.Provider, { value }, children)
	return {
		DataContext,
		DataProvider,
	}
}

// Mockear tanto con como sin extensión .jsx
vi.mock('../contexts/DataContext', mockDataContext)
vi.mock('../contexts/DataContext.jsx', mockDataContext)

// Mock de window.matchMedia (requerido por algunos componentes)
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
})

// Mock de IntersectionObserver (requerido por algunos componentes)
global.IntersectionObserver = class IntersectionObserver {
	constructor() {}
	observe() {
		return null
	}
	disconnect() {
		return null
	}
	unobserve() {
		return null
	}
}

// Mock de ResizeObserver (requerido por algunos componentes)
global.ResizeObserver = class ResizeObserver {
	constructor() {}
	observe() {
		return null
	}
	disconnect() {
		return null
	}
	unobserve() {
		return null
	}
}

