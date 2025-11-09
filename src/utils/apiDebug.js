// Utilidad para debug y verificación de llamadas a la API
import { getCruces, getCruce, getTelemetria, getAlertas, getSensores, getBarrierEvents, checkHealth, isAuthenticated } from '../services'

/**
 * Verificar que las APIs se estén consumiendo correctamente
 */
export const verifyAPIConsumption = async () => {
	const results = {
		health: null,
		authentication: null,
		cruces: null,
		cruceDetail: null,
		telemetria: null,
		alertas: null,
		sensores: null,
		barrierEvents: null,
		errors: [],
	}

	console.log('🔍 Iniciando verificación de consumo de API...')
	console.log('='.repeat(60))

	// 1. Verificar health
	try {
		console.log('1️⃣ Verificando health check...')
		results.health = await checkHealth()
		console.log('✅ Health check OK:', results.health)
	} catch (error) {
		results.errors.push({ endpoint: 'health', error: error.message })
		console.error('❌ Health check falló:', error.message)
	}

	// 2. Verificar autenticación
	console.log('\n2️⃣ Verificando autenticación...')
	results.authentication = isAuthenticated()
	console.log(results.authentication ? '✅ Usuario autenticado' : '⚠️ Usuario no autenticado')

	if (!results.authentication) {
		console.warn('⚠️ No se puede continuar sin autenticación')
		return results
	}

	// 3. Obtener lista de cruces
	try {
		console.log('\n3️⃣ Obteniendo lista de cruces...')
		results.cruces = await getCruces()
		const crucesLista = results.cruces.results || results.cruces || []
		console.log(`✅ Se obtuvieron ${crucesLista.length} cruces`)
		
		if (crucesLista.length > 0) {
			console.log('📋 Cruces encontrados:')
			crucesLista.forEach((cruce, index) => {
				console.log(`   ${index + 1}. ID: ${cruce.id}, Nombre: ${cruce.nombre}, Estado: ${cruce.estado}`)
			})

			// 4. Obtener detalles de un cruce
			const primerCruce = crucesLista[0]
			try {
				console.log(`\n4️⃣ Obteniendo detalles del cruce ID: ${primerCruce.id}...`)
				results.cruceDetail = await getCruce(primerCruce.id)
				console.log('✅ Detalles del cruce obtenidos:', {
					id: results.cruceDetail.id,
					nombre: results.cruceDetail.nombre,
					ubicacion: results.cruceDetail.ubicacion,
					estado: results.cruceDetail.estado,
					coordenadas: {
						lat: results.cruceDetail.coordenadas_lat,
						lng: results.cruceDetail.coordenadas_lng,
					},
				})
			} catch (error) {
				results.errors.push({ endpoint: `cruce/${primerCruce.id}`, error: error.message })
				console.error(`❌ Error al obtener detalles del cruce ${primerCruce.id}:`, error.message)
			}

			// 5. Obtener telemetría del cruce
			try {
				console.log(`\n5️⃣ Obteniendo telemetría del cruce ID: ${primerCruce.id}...`)
				results.telemetria = await getTelemetria({ cruce: primerCruce.id, page: 1 })
				const telemetriaLista = results.telemetria.results || results.telemetria || []
				console.log(`✅ Se obtuvieron ${telemetriaLista.length} registros de telemetría`)
				if (telemetriaLista.length > 0) {
					const ultimaTelemetria = telemetriaLista[0]
					console.log('📊 Última telemetría:', {
						timestamp: ultimaTelemetria.timestamp,
						barrier_voltage: ultimaTelemetria.barrier_voltage,
						battery_voltage: ultimaTelemetria.battery_voltage,
						temperature: ultimaTelemetria.temperature,
						barrier_status: ultimaTelemetria.barrier_status,
					})
				}
			} catch (error) {
				results.errors.push({ endpoint: `telemetria?cruce=${primerCruce.id}`, error: error.message })
				console.error(`❌ Error al obtener telemetría del cruce ${primerCruce.id}:`, error.message)
			}

			// 6. Obtener alertas
			try {
				console.log(`\n6️⃣ Obteniendo alertas...`)
				results.alertas = await getAlertas({ page: 1 })
				const alertasLista = results.alertas.results || results.alertas || []
				const alertasDelCruce = alertasLista.filter(a => a.cruce === primerCruce.id)
				console.log(`✅ Se obtuvieron ${alertasLista.length} alertas totales, ${alertasDelCruce.length} del cruce ${primerCruce.id}`)
				if (alertasDelCruce.length > 0) {
					console.log('🚨 Alertas del cruce:')
					alertasDelCruce.forEach((alerta, index) => {
						console.log(`   ${index + 1}. Tipo: ${alerta.type}, Severidad: ${alerta.severity}, Resuelta: ${alerta.resolved}`)
					})
				}
			} catch (error) {
				results.errors.push({ endpoint: 'alertas', error: error.message })
				console.error('❌ Error al obtener alertas:', error.message)
			}

			// 7. Obtener sensores del cruce
			try {
				console.log(`\n7️⃣ Obteniendo sensores del cruce ID: ${primerCruce.id}...`)
				results.sensores = await getSensores({ cruce: primerCruce.id })
				const sensoresLista = results.sensores.results || results.sensores || []
				console.log(`✅ Se obtuvieron ${sensoresLista.length} sensores`)
				if (sensoresLista.length > 0) {
					console.log('🔧 Sensores encontrados:')
					sensoresLista.forEach((sensor, index) => {
						console.log(`   ${index + 1}. Nombre: ${sensor.nombre}, Tipo: ${sensor.tipo}, Activo: ${sensor.activo}`)
					})
				}
			} catch (error) {
				results.errors.push({ endpoint: `sensores?cruce=${primerCruce.id}`, error: error.message })
				console.error(`❌ Error al obtener sensores del cruce ${primerCruce.id}:`, error.message)
			}

			// 8. Obtener eventos de barrera
			try {
				console.log(`\n8️⃣ Obteniendo eventos de barrera del cruce ID: ${primerCruce.id}...`)
				results.barrierEvents = await getBarrierEvents({ cruce: primerCruce.id, page: 1 })
				const eventosLista = results.barrierEvents.results || results.barrierEvents || []
				console.log(`✅ Se obtuvieron ${eventosLista.length} eventos de barrera`)
				if (eventosLista.length > 0) {
					console.log('🚧 Eventos de barrera:')
					eventosLista.slice(0, 3).forEach((evento, index) => {
						console.log(`   ${index + 1}. Estado: ${evento.state}, Fecha: ${evento.event_time}`)
					})
				}
			} catch (error) {
				results.errors.push({ endpoint: `barrier-events?cruce=${primerCruce.id}`, error: error.message })
				console.error(`❌ Error al obtener eventos de barrera:`, error.message)
			}
		}
	} catch (error) {
		results.errors.push({ endpoint: 'cruces', error: error.message })
		console.error('❌ Error al obtener lista de cruces:', error.message)
	}

	console.log('\n' + '='.repeat(60))
	console.log('📊 Resumen de verificación:')
	console.log(`   ✅ Endpoints exitosos: ${Object.values(results).filter(r => r !== null && !Array.isArray(r)).length}`)
	console.log(`   ❌ Errores encontrados: ${results.errors.length}`)
	
	if (results.errors.length > 0) {
		console.log('\n❌ Errores detallados:')
		results.errors.forEach((err, index) => {
			console.log(`   ${index + 1}. ${err.endpoint}: ${err.error}`)
		})
	}

	return results
}

// Función para verificar solo la lista de cruces
export const verifyCrucesList = async () => {
	try {
		console.log('🔍 Verificando lista de cruces...')
		const response = await getCruces()
		const cruces = response.results || response || []
		console.log(`✅ Se obtuvieron ${cruces.length} cruces`)
		console.log('📋 Cruces:', cruces.map(c => ({ id: c.id, nombre: c.nombre, estado: c.estado })))
		return { success: true, count: cruces.length, cruces }
	} catch (error) {
		console.error('❌ Error al obtener cruces:', error)
		return { success: false, error: error.message }
	}
}

