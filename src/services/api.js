// Configuración de la API de Viametrica Backend (Django)
const API_CONFIG = {
	// Usa variables de entorno para configuración flexible entre ambientes
	BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://viametrica.local',
	TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
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

// Función para hacer peticiones HTTP con timeout y mejor manejo de errores
const fetchWithTimeout = async (url, options = {}) => {
	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal,
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				...options.headers,
			},
		})
		clearTimeout(timeoutId)
		return response
	} catch (error) {
		clearTimeout(timeoutId)
		if (API_CONFIG.DEBUG) {
			console.error('❌ Fetch error:', {
				url,
				error: error.message,
				type: error.name,
			})
		}
		throw error
	}
}

// Función helper para parsear respuestas JSON con mejor manejo de errores
const parseJSON = async (response) => {
	try {
		const text = await response.text()
		if (!text) {
			throw new Error('Respuesta vacía del servidor')
		}
		return JSON.parse(text)
	} catch (error) {
		if (API_CONFIG.DEBUG) {
			console.error('❌ Error parsing JSON:', error)
		}
		throw new Error(`Error al parsear respuesta JSON: ${error.message}`)
	}
}

// Mapeo de IDs del ESP32 a datos adicionales (metadata local)
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
	if (!timestampMs) return 'N/A'
	const date = new Date(timestampMs)
	return date.toISOString().replace('T', ' ').split('.')[0]
}

// Verificar salud de la API
export const checkHealth = async () => {
	try {
		const url = `${API_CONFIG.BASE_URL}/api/health`
		if (API_CONFIG.DEBUG) {
			console.log('🔍 Checking health:', url)
		}
		
		const response = await fetchWithTimeout(url)
		
		if (!response.ok) {
			const errorText = await response.text()
			throw new Error(`Error HTTP ${response.status}: ${errorText}`)
		}

		const data = await parseJSON(response)
		
		if (API_CONFIG.DEBUG) {
			console.log('✅ Health check OK:', data)
		}
		
		return data
	} catch (error) {
		// Solo loguear errores en modo debug para no saturar la consola
		if (API_CONFIG.DEBUG) {
			console.error('❌ Error al verificar salud de la API:', error)
		}
		throw error
	}
}

// Obtener lista de cruces desde el backend Django
export const fetchCruces = async () => {
	try {
		// Intentar diferentes formatos de endpoint (Django puede usar trailing slash)
		const endpoints = [
			`${API_CONFIG.BASE_URL}/api/cruces/`,
			`${API_CONFIG.BASE_URL}/api/cruces`,
			`${API_CONFIG.BASE_URL}/api/crossings/`,
			`${API_CONFIG.BASE_URL}/api/crossings`,
		]
		
		let lastError = null
		for (const url of endpoints) {
			try {
				if (API_CONFIG.DEBUG) {
					console.log('🔍 Fetching cruces from:', url)
				}
				
				const response = await fetchWithTimeout(url)
				
				if (response.ok) {
					const data = await parseJSON(response)
					
					// Django puede devolver los datos directamente o en un campo 'results'
					const cruces = Array.isArray(data) ? data : (data.results || data.data || [])
					
					if (API_CONFIG.DEBUG) {
						console.log('✅ Cruces obtenidos:', cruces.length)
					}
					
					// Enriquecer datos con metadata adicional
					return cruces.map(cruce => {
						const metadata = CRUCE_METADATA[cruce.id || cruce.crossing_id] || {}
						return {
							...metadata,
							id_cruce: metadata.id_cruce || cruce.id || 0,
							nombre: cruce.name || cruce.nombre || cruce.crossing_id || 'Sin nombre',
							estado: cruce.status === 'operational' || cruce.estado === 'ACTIVO' ? 'ACTIVO' : 'MANTENIMIENTO',
							region: cruce.region || 'N/A',
							crossing_id: cruce.id || cruce.crossing_id || cruce.codigo,
							...cruce, // Incluir todos los campos del backend
						}
					})
				}
			} catch (error) {
				lastError = error
				if (API_CONFIG.DEBUG) {
					console.warn(`⚠️ Endpoint ${url} falló, intentando siguiente...`)
				}
				continue
			}
		}
		
		throw lastError || new Error('No se pudo obtener cruces de ningún endpoint')
	} catch (error) {
		// Solo loguear errores en modo debug para no saturar la consola
		if (API_CONFIG.DEBUG) {
			console.error('❌ Error al obtener cruces:', error)
		}
		throw error
	}
}

// Obtener telemetría detallada de un cruce específico
export const fetchTelemetry = async (crossingId) => {
	try {
		// Intentar diferentes formatos de endpoint
		const endpoints = [
			`${API_CONFIG.BASE_URL}/api/telemetry/latest/?crossing_id=${crossingId}`,
			`${API_CONFIG.BASE_URL}/api/telemetry/latest?crossing_id=${crossingId}`,
			`${API_CONFIG.BASE_URL}/api/telemetry/?crossing_id=${crossingId}`,
			`${API_CONFIG.BASE_URL}/api/telemetry?crossing_id=${crossingId}`,
			`${API_CONFIG.BASE_URL}/api/cruces/${crossingId}/telemetry/`,
			`${API_CONFIG.BASE_URL}/api/cruces/${crossingId}/telemetry`,
		]
		
		let lastError = null
		for (const url of endpoints) {
			try {
				if (API_CONFIG.DEBUG) {
					console.log('🔍 Fetching telemetry from:', url)
				}
				
				const response = await fetchWithTimeout(url)
				
				if (response.ok) {
					const telemetry = await parseJSON(response)
					
					if (API_CONFIG.DEBUG) {
						console.log('✅ Telemetría obtenida:', telemetry)
					}
					
					const metadata = CRUCE_METADATA[crossingId] || {}
					
					// Convertir telemetría del backend al formato de la aplicación
					return {
						...metadata,
						id_cruce: metadata.id_cruce || telemetry.id || 0,
						nombre: crossingId.replace('CRUCE-', '').replace(/-\d+$/, '').replace('-', ' ') || telemetry.nombre || 'Sin nombre',
						crossing_id: telemetry.crossing_id || telemetry.id || crossingId,
						estado: mapBarrierStateToStatus(telemetry.barrier_state || telemetry.estado, telemetry.faults || 0),
						bateria: Math.round(telemetry.battery_soc || telemetry.bateria || 0),
						voltage: telemetry.voltage || telemetry.voltaje || 0,
						temperature: telemetry.temperature || telemetry.temperatura || 0,
						barrier_state: telemetry.barrier_state || telemetry.estado_barrera || 'UNKNOWN',
						sensoresActivos: (telemetry.faults === 0 || telemetry.fallos === 0) ? 4 : 1,
						ultimaActividad: formatTimestamp(telemetry.timestamp_ms || telemetry.timestamp || telemetry.ultima_actividad),
						rssi: telemetry.rssi || 0,
						vibration: telemetry.vibration_ms2 || telemetry.vibracion || 0,
						solar_power: telemetry.solar_power_w || telemetry.potencia_solar || 0,
						faults: telemetry.faults || telemetry.fallos || 0,
						coordenadas: { 
							lat: telemetry.gps?.lat || telemetry.latitud || telemetry.lat || 0, 
							lng: telemetry.gps?.lon || telemetry.longitud || telemetry.lng || 0 
						},
						tipoTren: (telemetry.barrier_state === 'DOWN' || telemetry.estado_barrera === 'DOWN' || telemetry.barrier_state === 'MOVING') ? 'Carga' : 'N/A',
						velocidadPromedio: telemetry.barrier_state === 'MOVING' ? 55 : 0,
						...telemetry, // Incluir todos los campos del backend
					}
				}
			} catch (error) {
				lastError = error
				if (API_CONFIG.DEBUG) {
					console.warn(`⚠️ Endpoint ${url} falló, intentando siguiente...`)
				}
				continue
			}
		}
		
		throw lastError || new Error(`No se pudo obtener telemetría del cruce ${crossingId}`)
	} catch (error) {
		// Solo loguear errores en modo debug para no saturar la consola
		if (API_CONFIG.DEBUG) {
			console.error(`❌ Error al obtener telemetría del cruce ${crossingId}:`, error)
		}
		throw error
	}
}

// Obtener telemetría de todos los cruces
export const fetchAllTelemetry = async () => {
	try {
		const crucesResponse = await fetchCruces()
		
		// Usar Promise.allSettled para que si un cruce falla, los demás continúen
		const telemetryPromises = crucesResponse.map(cruce => 
			fetchTelemetry(cruce.crossing_id || cruce.id).catch(error => {
				if (API_CONFIG.DEBUG) {
					console.warn(`⚠️ Error al obtener telemetría del cruce ${cruce.crossing_id}:`, error)
				}
				return null // Retornar null si falla
			})
		)
		
		const results = await Promise.allSettled(telemetryPromises)
		const telemetryData = results
			.map(result => result.status === 'fulfilled' ? result.value : null)
			.filter(data => data !== null) // Filtrar los que fallaron
		
		if (API_CONFIG.DEBUG) {
			console.log(`✅ Telemetría obtenida: ${telemetryData.length}/${crucesResponse.length} cruces`)
		}
		
		return telemetryData
	} catch (error) {
		// Solo loguear errores en modo debug para no saturar la consola
		if (API_CONFIG.DEBUG) {
			console.error('❌ Error al obtener telemetría de todos los cruces:', error)
		}
		throw error
	}
}

// Resetear datos del ESP32 (solo para pruebas)
export const resetESP32Data = async () => {
	try {
		const url = `${API_CONFIG.BASE_URL}/api/reset/`
		const response = await fetchWithTimeout(url, {
			method: 'POST',
		})
		
		if (!response.ok) {
			const errorText = await response.text()
			throw new Error(`Error HTTP ${response.status}: ${errorText}`)
		}

		return await parseJSON(response)
	} catch (error) {
		// Solo loguear errores en modo debug para no saturar la consola
		if (API_CONFIG.DEBUG) {
			console.error('❌ Error al resetear datos:', error)
		}
		throw error
	}
}

export { API_CONFIG }
