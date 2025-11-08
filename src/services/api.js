// Configuración de la API del ESP32
const API_CONFIG = {
	// Usa variables de entorno para configuración flexible entre ambientes
	BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://viametrica.local',
	TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 5000,
	DEBUG: import.meta.env.VITE_DEBUG_MODE === 'true',
}

// Log de configuración en modo debug
if (API_CONFIG.DEBUG) {
	console.log('🔧 API Configuration:', {
		BASE_URL: API_CONFIG.BASE_URL,
		TIMEOUT: API_CONFIG.TIMEOUT,
		ENV: import.meta.env.VITE_APP_ENV,
		VERSION: import.meta.env.VITE_APP_VERSION,
	})
}

// Función para hacer peticiones HTTP con timeout
const fetchWithTimeout = async (url, options = {}) => {
	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal,
		})
		clearTimeout(timeoutId)
		return response
	} catch (error) {
		clearTimeout(timeoutId)
		throw error
	}
}

// Mapeo de IDs del ESP32 a datos adicionales
const CRUCE_METADATA = {
	'CRUCE-HUASCO-01': { 
		id_cruce: 1, 
		ubicacion: 'Km 472.5, Ruta 5 Norte',
		fechaInstalacion: '2023-06-15',
		responsable: 'Carlos Mendoza',
		telefono: '+56 9 8765 4321'
	},
	'CRUCE-FREIRINA-02': { 
		id_cruce: 2, 
		ubicacion: 'Km 485.2, Ruta 5 Norte',
		fechaInstalacion: '2023-08-20',
		responsable: 'Ana García',
		telefono: '+56 9 7654 3210'
	},
	'CRUCE-VALLENAR-03': { 
		id_cruce: 3, 
		ubicacion: 'Km 412.8, Ruta 43',
		fechaInstalacion: '2023-05-10',
		responsable: 'Luis Rodriguez',
		telefono: '+56 9 6543 2109'
	},
	'CRUCE-VALLENAR-04': { 
		id_cruce: 4, 
		ubicacion: 'Km 398.1, Ruta 41',
		fechaInstalacion: '2023-07-25',
		responsable: 'María Silva',
		telefono: '+56 9 5432 1098'
	},
	'CRUCE-HUASCO-05': { 
		id_cruce: 5, 
		ubicacion: 'Km 234.7, Ruta 31',
		fechaInstalacion: '2023-04-18',
		responsable: 'Pedro Morales',
		telefono: '+56 9 4321 0987'
	},
	'CRUCE-FREIRINA-06': { 
		id_cruce: 6, 
		ubicacion: 'Km 287.3, Ruta 5 Norte',
		fechaInstalacion: '2023-09-12',
		responsable: 'Carmen López',
		telefono: '+56 9 3210 9876'
	}
}

// Mapeo de estado de barrera del ESP32 al formato de la aplicación
const mapBarrierStateToStatus = (barrierState, faults) => {
	if (faults > 0 || barrierState === 'FAULT') return 'INACTIVO'
	if (barrierState === 'MOVING') return 'MANTENIMIENTO'
	return 'ACTIVO'
}

// Formatear fecha del timestamp del ESP32
const formatTimestamp = (timestampMs) => {
	const date = new Date(timestampMs)
	return date.toISOString().replace('T', ' ').split('.')[0]
}

// Obtener lista de cruces desde el ESP32
export const fetchCruces = async () => {
	try {
		const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/api/cruces`)
		
		if (!response.ok) {
			throw new Error(`Error HTTP: ${response.status}`)
		}

		const cruces = await response.json()
		
		// Enriquecer datos con metadata adicional
		return cruces.map(cruce => {
			const metadata = CRUCE_METADATA[cruce.id] || {}
			return {
				...metadata,
				id_cruce: metadata.id_cruce || 0,
				nombre: cruce.name,
				estado: cruce.status === 'operational' ? 'ACTIVO' : 'MANTENIMIENTO',
				region: cruce.region,
				crossing_id: cruce.id,
			}
		})
	} catch (error) {
		// Solo loguear errores en modo debug para no saturar la consola
		if (API_CONFIG.DEBUG) {
			console.error('Error al obtener cruces del ESP32:', error)
		}
		throw error
	}
}

// Obtener telemetría detallada de un cruce específico
export const fetchTelemetry = async (crossingId) => {
	try {
		const response = await fetchWithTimeout(
			`${API_CONFIG.BASE_URL}/api/telemetry/latest?crossing_id=${crossingId}`
		)
		
		if (!response.ok) {
			throw new Error(`Error HTTP: ${response.status}`)
		}

		const telemetry = await response.json()
		const metadata = CRUCE_METADATA[crossingId] || {}
		
		// Convertir telemetría del ESP32 al formato de la aplicación
		return {
			...metadata,
			id_cruce: metadata.id_cruce || 0,
			nombre: crossingId.replace('CRUCE-', '').replace(/-\d+$/, '').replace('-', ' '),
			crossing_id: telemetry.crossing_id,
			estado: mapBarrierStateToStatus(telemetry.barrier_state, telemetry.faults),
			bateria: Math.round(telemetry.battery_soc),
			voltage: telemetry.voltage,
			temperature: telemetry.temperature,
			barrier_state: telemetry.barrier_state,
			sensoresActivos: telemetry.faults === 0 ? 4 : 1,
			ultimaActividad: formatTimestamp(telemetry.timestamp_ms),
			rssi: telemetry.rssi,
			vibration: telemetry.vibration_ms2,
			solar_power: telemetry.solar_power_w,
			faults: telemetry.faults,
			coordenadas: { 
				lat: telemetry.gps.lat, 
				lng: telemetry.gps.lon 
			},
			tipoTren: telemetry.barrier_state === 'DOWN' || telemetry.barrier_state === 'MOVING' ? 'Carga' : 'N/A',
			velocidadPromedio: telemetry.barrier_state === 'MOVING' ? 55 : 0,
		}
	} catch (error) {
		// Solo loguear errores en modo debug para no saturar la consola
		if (API_CONFIG.DEBUG) {
			console.error(`Error al obtener telemetría del cruce ${crossingId}:`, error)
		}
		throw error
	}
}

// Obtener telemetría de todos los cruces
export const fetchAllTelemetry = async () => {
	try {
		const crucesResponse = await fetchCruces()
		const telemetryPromises = crucesResponse.map(cruce => 
			fetchTelemetry(cruce.crossing_id)
		)
		
		const telemetryData = await Promise.all(telemetryPromises)
		return telemetryData
	} catch (error) {
		// Solo loguear errores en modo debug para no saturar la consola
		if (API_CONFIG.DEBUG) {
			console.error('Error al obtener telemetría de todos los cruces:', error)
		}
		throw error
	}
}

// Verificar salud de la API
export const checkHealth = async () => {
	try {
		const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/api/health`)
		
		if (!response.ok) {
			throw new Error(`Error HTTP: ${response.status}`)
		}

		return await response.json()
	} catch (error) {
		// Solo loguear errores en modo debug para no saturar la consola
		if (API_CONFIG.DEBUG) {
			console.error('Error al verificar salud de la API:', error)
		}
		throw error
	}
}

// Resetear datos del ESP32 (solo para pruebas)
export const resetESP32Data = async () => {
	try {
		const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/api/reset`, {
			method: 'POST',
		})
		
		if (!response.ok) {
			throw new Error(`Error HTTP: ${response.status}`)
		}

		return await response.json()
	} catch (error) {
		// Solo loguear errores en modo debug para no saturar la consola
		if (API_CONFIG.DEBUG) {
			console.error('Error al resetear datos del ESP32:', error)
		}
		throw error
	}
}

export { API_CONFIG }

