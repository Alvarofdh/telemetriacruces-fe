/**
 * Utilidades para trabajar con datos de telemetría
 * Convierte datos del backend a formato usable en el frontend
 */

/**
 * Convertir voltaje de batería (10-15V) a porcentaje (0-100%)
 * Fórmula: (voltage - 10) / (15 - 10) * 100
 * 
 * @param {number} voltage - Voltaje en voltios (10-15V)
 * @returns {number} Porcentaje de batería (0-100)
 * 
 * @example
 * voltageToPercentage(12.5) // 50%
 * voltageToPercentage(10) // 0%
 * voltageToPercentage(15) // 100%
 */
export const voltageToPercentage = (voltage) => {
	if (!voltage || voltage < 10) return 0
	if (voltage > 15) return 100
	
	// Fórmula: (voltage - 10) / (15 - 10) * 100
	// Batería 12V típica: 10V = 0%, 12V = 40%, 15V = 100%
	const percentage = ((voltage - 10) / 5) * 100
	return Math.round(Math.max(0, Math.min(100, percentage)))
}

/**
 * Obtener color según nivel de batería (para Tailwind CSS)
 * 
 * @param {number} percentage - Porcentaje de batería (0-100)
 * @returns {string} Clase de color de Tailwind
 * 
 * @example
 * getBatteryColor(80) // 'text-green-600 dark:text-green-400'
 * getBatteryColor(50) // 'text-yellow-600 dark:text-yellow-400'
 * getBatteryColor(20) // 'text-red-600 dark:text-red-400'
 */
export const getBatteryColor = (percentage) => {
	if (percentage >= 70) return 'text-green-600 dark:text-green-400'
	if (percentage >= 30) return 'text-yellow-600 dark:text-yellow-400'
	return 'text-red-600 dark:text-red-400'
}

/**
 * Obtener color de fondo según nivel de batería (para Tailwind CSS)
 * 
 * @param {number} percentage - Porcentaje de batería (0-100)
 * @returns {string} Clase de color de fondo de Tailwind
 */
export const getBatteryBgColor = (percentage) => {
	if (percentage >= 70) return 'bg-green-100 dark:bg-green-900'
	if (percentage >= 30) return 'bg-yellow-100 dark:bg-yellow-900'
	return 'bg-red-100 dark:bg-red-900'
}

/**
 * Obtener estado de batería como texto
 * 
 * @param {number} voltage - Voltaje en voltios
 * @returns {string} Estado de batería
 * 
 * @example
 * getBatteryStatus(10.5) // 'Batería Baja'
 * getBatteryStatus(12.0) // 'Batería Media'
 * getBatteryStatus(13.5) // 'Batería OK'
 */
export const getBatteryStatus = (voltage) => {
	if (!voltage) return 'Sin datos'
	if (voltage < 11.0) return 'Batería Baja'
	if (voltage < 12.0) return 'Batería Media'
	return 'Batería OK'
}

/**
 * Contar sensores activos desde array de sensores
 * 
 * @param {Array} sensores - Array de sensores del backend
 * @returns {number} Cantidad de sensores activos
 * 
 * @example
 * countActiveSensors([{activo: true}, {activo: false}]) // 1
 */
export const countActiveSensors = (sensores) => {
	if (!sensores || !Array.isArray(sensores)) return 0
	return sensores.filter(s => s.activo === true).length
}

/**
 * Contar sensores activos desde valores de telemetría
 * Un sensor se considera activo si tiene un valor válido (no null/undefined)
 * 
 * @param {Object} telemetria - Objeto de telemetría
 * @returns {number} Cantidad de sensores con valores válidos
 * 
 * @example
 * countActiveSensorsFromTelemetria({
 *   sensor_1: 1023,
 *   sensor_2: null,
 *   sensor_3: 500,
 *   sensor_4: undefined
 * }) // 2
 */
export const countActiveSensorsFromTelemetria = (telemetria) => {
	if (!telemetria) return 0
	let count = 0
	if (telemetria.sensor_1 !== null && telemetria.sensor_1 !== undefined) count++
	if (telemetria.sensor_2 !== null && telemetria.sensor_2 !== undefined) count++
	if (telemetria.sensor_3 !== null && telemetria.sensor_3 !== undefined) count++
	if (telemetria.sensor_4 !== null && telemetria.sensor_4 !== undefined) count++
	return count
}

/**
 * Formatear fecha para mostrar
 * 
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 * 
 * @example
 * formatDate('2025-01-24T10:30:00Z') // '24 de enero de 2025'
 */
export const formatDate = (dateString) => {
	if (!dateString) return 'N/A'
	try {
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	} catch (e) {
		return 'N/A'
	}
}

/**
 * Formatear fecha y hora para mostrar
 * 
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha y hora formateada
 * 
 * @example
 * formatDateTime('2025-01-24T10:30:00Z') // '24 de enero de 2025, 10:30'
 */
export const formatDateTime = (dateString) => {
	if (!dateString) return 'N/A'
	try {
		return new Date(dateString).toLocaleString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	} catch (e) {
		return 'N/A'
	}
}

/**
 * Formatear fecha relativa (hace X tiempo)
 * 
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Tiempo relativo
 * 
 * @example
 * formatRelativeTime('2025-01-24T10:30:00Z') // 'hace 5 minutos'
 */
export const formatRelativeTime = (dateString) => {
	if (!dateString) return 'N/A'
	try {
		const date = new Date(dateString)
		const now = new Date()
		const diffMs = now - date
		const diffMins = Math.floor(diffMs / 60000)
		const diffHours = Math.floor(diffMs / 3600000)
		const diffDays = Math.floor(diffMs / 86400000)

		if (diffMins < 1) return 'hace menos de un minuto'
		if (diffMins < 60) return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`
		if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
		if (diffDays < 7) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
		
		return formatDate(dateString)
	} catch (e) {
		return 'N/A'
	}
}

/**
 * Normalizar datos de cruce para el frontend
 * Convierte la estructura del backend a formato esperado por el frontend
 * 
 * @param {Object} cruce - Objeto de cruce del backend
 * @returns {Object} Cruce normalizado para el frontend
 * 
 * @example
 * const cruce = {
 *   id: 1,
 *   nombre: 'Cruce 1',
 *   telemetria_actual: { battery_voltage: 12.5, temperature: 25.5 },
 *   sensores: [{ activo: true }, { activo: false }]
 * }
 * normalizeCruceData(cruce)
 * // {
 * //   ...cruce,
 * //   bateria: 50,
 * //   battery_voltage: 12.5,
 * //   sensoresActivos: 1,
 * //   ...
 * // }
 */
export const normalizeCruceData = (cruce) => {
	if (!cruce) return null
	
	const telemetria = cruce.telemetria_actual || cruce.ultima_telemetria || {}
	const batteryVoltage = telemetria.battery_voltage
	const batteryPercentage = voltageToPercentage(batteryVoltage)
	
	// ✅ CORRECCIÓN: Calcular sensores activos usando ambos métodos según la guía
	// Método 1: Contar sensores registrados con activo: true
	const sensoresRegistradosActivos = countActiveSensors(cruce.sensores || [])
	// Método 2: Contar sensores con valores válidos en telemetría
	const sensoresConDatos = countActiveSensorsFromTelemetria(telemetria)
	// Usar sensores registrados si existen, sino usar conteo desde telemetría
	const sensoresActivosCount = cruce.sensores && cruce.sensores.length > 0 
		? sensoresRegistradosActivos 
		: sensoresConDatos
	
	return {
		...cruce,
		// Datos de batería
		bateria: batteryPercentage,
		battery_voltage: batteryVoltage,
		battery_status: getBatteryStatus(batteryVoltage),
		
		// Datos de voltaje de barrera
		voltage: telemetria.barrier_voltage,
		barrier_voltage: telemetria.barrier_voltage,
		barrier_status: telemetria.barrier_status,
		
		// Sensores
		sensoresActivos: sensoresActivosCount,
		totalSensores: cruce.total_sensores || cruce.sensores?.length || 4, // Máximo 4 sensores según la guía
		
		// Datos de telemetría
		temperature: telemetria.temperature,
		rssi: telemetria.signal_strength,
		
		// Sensores individuales
		sensor_1: telemetria.sensor_1,
		sensor_2: telemetria.sensor_2,
		sensor_3: telemetria.sensor_3,
		sensor_4: telemetria.sensor_4,
		
		// Fechas
		ultimaActividad: telemetria.timestamp || cruce.updated_at,
		ultimaActualizacion: telemetria.timestamp || cruce.updated_at,
		
		// Mantener telemetría original para referencia
		telemetria_actual: telemetria,
	}
}

/**
 * Obtener estado de barrera como emoji
 * 
 * @param {string} status - Estado de barrera ('UP', 'DOWN', etc.)
 * @returns {string} Emoji representando el estado
 */
export const getBarrierStateIcon = (status) => {
	switch (status) {
		case 'UP':
			return '⬆️'
		case 'DOWN':
			return '⬇️'
		case 'MOVING':
			return '↕️'
		case 'FAULT':
			return '⚠️'
		default:
			return '❓'
	}
}

/**
 * Obtener color según estado de barrera
 * 
 * @param {string} status - Estado de barrera
 * @returns {string} Clase de color de Tailwind
 */
export const getBarrierStatusColor = (status) => {
	switch (status) {
		case 'UP':
			return 'text-green-600 dark:text-green-400'
		case 'DOWN':
			return 'text-red-600 dark:text-red-400'
		case 'MOVING':
			return 'text-yellow-600 dark:text-yellow-400'
		case 'FAULT':
			return 'text-red-600 dark:text-red-400'
		default:
			return 'text-gray-600 dark:text-gray-400'
	}
}

/**
 * Verificar si hay datos de telemetría disponibles
 * 
 * @param {Object} cruce - Objeto de cruce
 * @returns {boolean} True si hay datos de telemetría
 */
export const hasTelemetriaData = (cruce) => {
	const telemetria = cruce?.telemetria_actual || cruce?.ultima_telemetria
	return telemetria !== null && telemetria !== undefined
}

/**
 * Obtener valor de sensor o mostrar 'N/A'
 * 
 * @param {number|null|undefined} sensorValue - Valor del sensor
 * @returns {string|number} Valor del sensor o 'N/A'
 */
export const getSensorValue = (sensorValue) => {
	if (sensorValue === null || sensorValue === undefined) return 'N/A'
	return sensorValue
}

/**
 * Obtener información completa de sensores combinando
 * sensores registrados con valores de telemetría
 * 
 * @param {Array} sensoresRegistrados - Array de sensores del backend
 * @param {Object} telemetria - Objeto de telemetría con sensor_1, sensor_2, etc.
 * @returns {Array} Array de sensores con información completa
 * 
 * @example
 * const sensores = combineSensoresWithTelemetria(
 *   [{ id: 1, nombre: 'Sensor 1', activo: true }],
 *   { sensor_1: 1023, sensor_2: null }
 * )
 */
export const combineSensoresWithTelemetria = (sensoresRegistrados, telemetria) => {
	if (!sensoresRegistrados || !Array.isArray(sensoresRegistrados)) {
		return []
	}

	const telemetriaData = telemetria || {}

	return sensoresRegistrados.map((sensor, index) => {
		const sensorValue = telemetriaData[`sensor_${index + 1}`]
		const tieneValor = sensorValue !== null && sensorValue !== undefined

		return {
			...sensor,
			valor_actual: sensorValue,
			enviando_datos: tieneValor,
			estado: sensor.activo
				? (tieneValor ? 'funcionando' : 'sin_datos')
				: 'inactivo',
			estado_display: sensor.activo
				? (tieneValor ? 'Activo y Funcionando' : 'Activo pero Sin Datos')
				: 'Inactivo'
		}
	})
}

/**
 * Contar sensores activos y funcionando
 * 
 * @param {Array} sensores - Array de sensores (puede ser combinado o solo registrados)
 * @returns {Object} Objeto con conteos
 * 
 * @example
 * const stats = getSensorStats(sensores)
 * // { total: 4, activos: 3, funcionando: 2, sinDatos: 1, inactivos: 1 }
 */
export const getSensorStats = (sensores) => {
	if (!sensores || !Array.isArray(sensores)) {
		return {
			total: 0,
			activos: 0,
			funcionando: 0,
			sinDatos: 0,
			inactivos: 0
		}
	}

	return {
		total: sensores.length,
		activos: sensores.filter(s => s.activo).length,
		funcionando: sensores.filter(s => s.activo && s.enviando_datos).length,
		sinDatos: sensores.filter(s => s.activo && !s.enviando_datos).length,
		inactivos: sensores.filter(s => !s.activo).length
	}
}

/**
 * Obtener color según estado del sensor (para Tailwind CSS)
 * 
 * @param {string} estado - Estado del sensor ('funcionando', 'sin_datos', 'inactivo')
 * @returns {string} Clase de color de Tailwind
 */
export const getSensorStatusColor = (estado) => {
	switch (estado) {
		case 'funcionando':
			return 'bg-green-100 text-green-800 border-green-500 dark:bg-green-900/30 dark:text-green-300 dark:border-green-400'
		case 'sin_datos':
			return 'bg-yellow-100 text-yellow-800 border-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-400'
		case 'inactivo':
			return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
	}
}

/**
 * Obtener icono según tipo de sensor
 * 
 * @param {string} tipo - Tipo de sensor (BARRERA, GABINETE, BATERIA, PLC, TEMPERATURA)
 * @returns {string} Emoji o icono
 */
export const getSensorTypeIcon = (tipo) => {
	switch (tipo) {
		case 'BARRERA':
			return '🚧'
		case 'GABINETE':
			return '📦'
		case 'BATERIA':
			return '🔋'
		case 'PLC':
			return '⚙️'
		case 'TEMPERATURA':
			return '🌡️'
		default:
			return '🔧'
	}
}

