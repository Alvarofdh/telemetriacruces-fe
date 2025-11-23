import { useContext } from 'react'
import { ConfigContext } from '../contexts/ConfigContext'

/**
 * Hook para acceder al contexto de configuración
 */
export const useConfigContext = () => {
	const context = useContext(ConfigContext)
	if (!context) {
		throw new Error('useConfigContext debe ser usado dentro de un ConfigProvider')
	}
	return context
}

