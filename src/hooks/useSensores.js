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
				
				if (import.meta.env.DEV) {
					console.log('🔍 [useSensores] Obteniendo sensores para cruce:', cruceId)
				}
				
				// Obtener sensores registrados - ✅ CRÍTICO: Filtrar por cruce específico
				const sensoresResponse = await getSensores({ cruce: cruceId })
				const sensoresData = sensoresResponse.results || sensoresResponse || []
				
				if (import.meta.env.DEV) {
					console.log('🔍 [useSensores] Sensores recibidos:', sensoresData.length, 'para cruce', cruceId)
				}
				
				// ✅ FILTRAR: Asegurar que solo se muestren sensores del cruce correcto
				// El backend debería filtrar, pero hacemos un filtro adicional por seguridad
				const sensoresFiltrados = sensoresData.filter(sensor => {
					// El backend puede devolver el cruce como ID numérico o como objeto
					const sensorCruceId = typeof sensor.cruce === 'object' 
						? sensor.cruce?.id || sensor.cruce?.id_cruce 
						: sensor.cruce || sensor.cruce_id
					
					const matches = sensorCruceId === cruceId || sensorCruceId === parseInt(cruceId)
					
					if (import.meta.env.DEV && !matches) {
						console.warn('⚠️ [useSensores] Sensor filtrado (cruce incorrecto):', {
							sensorId: sensor.id,
							sensorCruceId,
							esperado: cruceId,
							sensor
						})
					}
					return matches
				})
				
				if (import.meta.env.DEV) {
					console.log('🔍 [useSensores] Sensores filtrados:', sensoresFiltrados.length, 'de', sensoresData.length)
				}
				
				// Obtener telemetría actual
				const cruceData = await getCruce(cruceId)
				const telemetria = cruceData.telemetria_actual || cruceData.ultima_telemetria || {}
				
				// Combinar datos
				const sensoresCompletos = combineSensoresWithTelemetria(sensoresFiltrados, telemetria)
				
				// Calcular estadísticas
				const estadisticas = getSensorStats(sensoresCompletos)
				
				setSensores(sensoresCompletos)
				setStats(estadisticas)
			} catch (err) {
				setError(err)
				console.error('❌ [useSensores] Error al obtener sensores:', err)
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

