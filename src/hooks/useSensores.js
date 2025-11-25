import { useState, useEffect } from 'react'
import { getSensores } from '../services/sensores'
import { getCruce } from '../services/cruces'
import { combineSensoresWithTelemetria, getSensorStats } from '../utils/telemetriaHelpers'

/**
 * Hook personalizado para obtener y gestionar sensores de un cruce
 * 
 * @param {number} cruceId - ID del cruce
 * @returns {Object} Objeto con sensores, estadísticas, loading y error
 * 
 * @example
 * const { sensores, sensoresActivos, sensoresFuncionando, loading } = useSensores(cruceId)
 */
export function useSensores(cruceId) {
	const [sensores, setSensores] = useState([])
	const [stats, setStats] = useState({
		total: 0,
		activos: 0,
		funcionando: 0,
		sinDatos: 0,
		inactivos: 0
	})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		if (!cruceId) {
			setLoading(false)
			return
		}

		async function fetchSensores() {
			try {
				setLoading(true)
				setError(null)
				
				// Obtener sensores registrados
				const sensoresResponse = await getSensores({ cruce: cruceId })
				const sensoresData = sensoresResponse.results || sensoresResponse || []
				
				// Obtener telemetría actual
				const cruceData = await getCruce(cruceId)
				const telemetria = cruceData.telemetria_actual || {}
				
				// Combinar datos
				const sensoresCompletos = combineSensoresWithTelemetria(sensoresData, telemetria)
				
				// Calcular estadísticas
				const estadisticas = getSensorStats(sensoresCompletos)
				
				setSensores(sensoresCompletos)
				setStats(estadisticas)
			} catch (err) {
				setError(err)
				console.error('Error al obtener sensores:', err)
			} finally {
				setLoading(false)
			}
		}

		fetchSensores()
		
		// Actualizar cada 30 segundos
		const interval = setInterval(fetchSensores, 30000)
		
		return () => clearInterval(interval)
	}, [cruceId])

	// Arrays filtrados para facilitar el uso
	const sensoresActivos = sensores.filter(s => s.activo)
	const sensoresFuncionando = sensores.filter(s => s.activo && s.enviando_datos)
	const sensoresSinDatos = sensores.filter(s => s.activo && !s.enviando_datos)
	const sensoresInactivos = sensores.filter(s => !s.activo)

	return {
		// Datos completos
		sensores,
		
		// Arrays filtrados
		sensoresActivos,
		sensoresFuncionando,
		sensoresSinDatos,
		sensoresInactivos,
		
		// Estadísticas
		stats,
		total: stats.total,
		activos: stats.activos,
		funcionando: stats.funcionando,
		sinDatos: stats.sinDatos,
		inactivos: stats.inactivos,
		
		// Estado
		loading,
		error
	}
}

