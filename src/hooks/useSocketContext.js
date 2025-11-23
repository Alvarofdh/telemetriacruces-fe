import { useContext } from 'react'
import { SocketContext } from '../contexts/SocketContext'

/**
 * Hook para acceder al contexto de Socket.IO
 */
export const useSocketContext = () => {
	const context = useContext(SocketContext)
	if (!context) {
		throw new Error('useSocketContext debe ser usado dentro de un SocketProvider')
	}
	return context
}

