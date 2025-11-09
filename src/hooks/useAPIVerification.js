// Hook para verificar el consumo de la API
import { useEffect } from 'react'
import { verifyAPIConsumption, verifyCrucesList } from '../utils/apiDebug'

/**
 * Hook para verificar el consumo de la API
 * Expone funciones globales en window para verificación desde la consola
 */
export const useAPIVerification = () => {
	useEffect(() => {
		// Exponer funciones de verificación en window para uso desde la consola
		if (typeof window !== 'undefined') {
			window.verifyAPI = verifyAPIConsumption
			window.verifyCruces = verifyCrucesList
			
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log('🔧 Funciones de verificación de API disponibles:')
				console.log('   - window.verifyAPI() - Verificar todas las APIs')
				console.log('   - window.verifyCruces() - Verificar solo lista de cruces')
			}
		}
		
		return () => {
			if (typeof window !== 'undefined') {
				delete window.verifyAPI
				delete window.verifyCruces
			}
		}
	}, [])
}

