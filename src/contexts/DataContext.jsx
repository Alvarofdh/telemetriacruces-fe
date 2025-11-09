import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import {
	checkHealth,
	getCruces,
	getCruce,
	createCruce,
	updateCruce,
	deleteCruce,
	getTelemetria,
	getAlertas,
	getSensores,
	getBarrierEvents,
	login as apiLogin,
	logout as apiLogout,
	getStoredUser,
	isAuthenticated,
} from '../services'

const DataContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
	const context = useContext(DataContext)
	if (!context) {
		throw new Error('useData debe ser usado dentro de un DataProvider')
	}
	return context
}

export function DataProvider({ children }) {
	// Estado de autenticación con persistencia en localStorage
	const [user, setUser] = useState(() => {
		return getStoredUser()
	})
	const [isAdmin, setIsAdmin] = useState(() => {
		if (!user) return false
		return user.profile?.role === 'ADMIN' || user.profile?.role === 'MAINTENANCE'
	})

	// Estados para datos del ESP32
	const [cruces, setCruces] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [isESP32Connected, setIsESP32Connected] = useState(false)
	const [lastUpdate, setLastUpdate] = useState(null)
	const [error, setError] = useState(null)

	// Datos mock de cruces (fallback cuando no hay conexión con ESP32)
	const crucesBackup = [
		{
			id_cruce: 1,
			nombre: 'Cruce La Serena',
			estado: 'ACTIVO',
			bateria: 92,
			sensoresActivos: 4,
			ubicacion: 'Km 472.5, Ruta 5 Norte',
			ultimaActividad: '2024-01-15 08:30',
			tipoTren: 'Carga',
			velocidadPromedio: 65,
			coordenadas: { lat: -29.9027, lng: -71.2507 },
			fechaInstalacion: '2023-06-15',
			ultimoMantenimiento: '2024-01-10',
			responsable: 'Carlos Mendoza',
			telefono: '+56 9 8765 4321'
		},
		{
			id_cruce: 2,
			nombre: 'Cruce Coquimbo',
			estado: 'MANTENIMIENTO',
			bateria: 56,
			sensoresActivos: 2,
			ubicacion: 'Km 485.2, Ruta 5 Norte',
			ultimaActividad: '2024-01-14 14:20',
			tipoTren: 'Pasajeros',
			velocidadPromedio: 45,
			coordenadas: { lat: -29.9533, lng: -71.3395 },
			fechaInstalacion: '2023-08-20',
			ultimoMantenimiento: '2024-01-05',
			responsable: 'Ana García',
			telefono: '+56 9 7654 3210'
		},
		{
			id_cruce: 3,
			nombre: 'Cruce Ovalle',
			estado: 'ACTIVO',
			bateria: 78,
			sensoresActivos: 3,
			ubicacion: 'Km 412.8, Ruta 43',
			ultimaActividad: '2024-01-15 09:15',
			tipoTren: 'Mixto',
			velocidadPromedio: 55,
			coordenadas: { lat: -30.5978, lng: -71.2005 },
			fechaInstalacion: '2023-05-10',
			ultimoMantenimiento: '2024-01-08',
			responsable: 'Luis Rodriguez',
			telefono: '+56 9 6543 2109'
		},
		{
			id_cruce: 4,
			nombre: 'Cruce Vicuña',
			estado: 'ACTIVO',
			bateria: 65,
			sensoresActivos: 1,
			ubicacion: 'Km 398.1, Ruta 41',
			ultimaActividad: '2024-01-15 07:45',
			tipoTren: 'Carga',
			velocidadPromedio: 70,
			coordenadas: { lat: -30.0332, lng: -70.7081 },
			fechaInstalacion: '2023-07-25',
			ultimoMantenimiento: '2024-01-12',
			responsable: 'María Silva',
			telefono: '+56 9 5432 1098'
		},
		{
			id_cruce: 5,
			nombre: 'Cruce Illapel',
			estado: 'INACTIVO',
			bateria: 15,
			sensoresActivos: 0,
			ubicacion: 'Km 234.7, Ruta 31',
			ultimaActividad: '2024-01-12 16:30',
			tipoTren: 'N/A',
			velocidadPromedio: 0,
			coordenadas: { lat: -31.6321, lng: -71.1704 },
			fechaInstalacion: '2023-04-18',
			ultimoMantenimiento: '2023-12-20',
			responsable: 'Pedro Morales',
			telefono: '+56 9 4321 0987'
		},
		{
			id_cruce: 6,
			nombre: 'Cruce Los Vilos',
			estado: 'ACTIVO',
			bateria: 89,
			sensoresActivos: 4,
			ubicacion: 'Km 287.3, Ruta 5 Norte',
			ultimaActividad: '2024-01-15 09:50',
			tipoTren: 'Pasajeros',
			velocidadPromedio: 50,
			coordenadas: { lat: -31.9069, lng: -71.5033 },
			fechaInstalacion: '2023-09-12',
			ultimoMantenimiento: '2024-01-14',
			responsable: 'Carmen López',
			telefono: '+56 9 3210 9876'
		},
		{
			id_cruce: 7,
			nombre: 'Cruce Salamanca',
			estado: 'MANTENIMIENTO',
			bateria: 34,
			sensoresActivos: 1,
			ubicacion: 'Km 256.9, Ruta 43',
			ultimaActividad: '2024-01-13 11:20',
			tipoTren: 'Carga',
			velocidadPromedio: 30,
			coordenadas: { lat: -31.7765, lng: -70.9665 },
			fechaInstalacion: '2023-03-22',
			ultimoMantenimiento: '2023-12-28',
			responsable: 'Diego Fernández',
			telefono: '+56 9 2109 8765'
		},
		{
			id_cruce: 8,
			nombre: 'Cruce Combarbalá',
			estado: 'ACTIVO',
			bateria: 91,
			sensoresActivos: 3,
			ubicacion: 'Km 345.6, Ruta 43',
			ultimaActividad: '2024-01-15 08:55',
			tipoTren: 'Mixto',
			velocidadPromedio: 60,
			coordenadas: { lat: -31.1745, lng: -71.0364 },
			fechaInstalacion: '2023-11-08',
			ultimoMantenimiento: '2024-01-11',
			responsable: 'Andrea Castro',
			telefono: '+56 9 1098 7654'
		}
	]

	// Usuarios del sistema
	const [usuarios, setUsuarios] = useState([
		{
			id: 1,
			nombre: 'Admin Principal',
			email: 'admin@cruces-ferro.cl',
			rol: 'SUPER_ADMIN',
			estado: 'ACTIVO',
			ultimoAcceso: '2024-01-15 10:30',
			permisos: ['READ', 'WRITE', 'DELETE', 'ADMIN']
		},
		{
			id: 2,
			nombre: 'Carlos Mendoza',
			email: 'carlos.mendoza@cruces-ferro.cl',
			rol: 'OPERADOR',
			estado: 'ACTIVO',
			ultimoAcceso: '2024-01-15 09:15',
			permisos: ['READ', 'WRITE']
		},
		{
			id: 3,
			nombre: 'Ana García',
			email: 'ana.garcia@cruces-ferro.cl',
			rol: 'TECNICO',
			estado: 'ACTIVO',
			ultimoAcceso: '2024-01-14 16:45',
			permisos: ['READ', 'WRITE']
		},
		{
			id: 4,
			nombre: 'Luis Rodriguez',
			email: 'luis.rodriguez@cruces-ferro.cl',
			rol: 'SUPERVISOR',
			estado: 'ACTIVO',
			ultimoAcceso: '2024-01-15 08:20',
			permisos: ['READ', 'WRITE', 'DELETE']
		}
	])

	// Logs de actividad del sistema
	const [logs, setLogs] = useState([
		{
			id: 1,
			fecha: '2024-01-15 10:30:15',
			usuario: 'Admin Principal',
			accion: 'LOGIN',
			detalle: 'Inicio de sesión exitoso',
			ip: '192.168.1.100'
		},
		{
			id: 2,
			fecha: '2024-01-15 10:25:32',
			usuario: 'Carlos Mendoza',
			accion: 'UPDATE_CRUCE',
			detalle: 'Actualizado estado del Cruce La Serena',
			ip: '192.168.1.105'
		},
		{
			id: 3,
			fecha: '2024-01-15 09:45:18',
			usuario: 'Ana García',
			accion: 'MAINTENANCE',
			detalle: 'Programado mantenimiento para Cruce Coquimbo',
			ip: '192.168.1.108'
		}
	])

	// Configuración del sistema
	const [configuracion, setConfiguracion] = useState({
		nombre_sistema: 'Sistema de Monitoreo Cruces Ferroviarios',
		version: '2.1.3',
		notificaciones_email: true,
		notificaciones_sms: false,
		intervalo_monitoreo: 30,
		umbral_bateria_critica: 20,
		umbral_bateria_baja: 50,
		backup_automatico: true,
		mantenimiento_programado: '02:00'
	})

	// Rate limiting para logs de error (evitar saturar la consola)
	const lastErrorLogTime = useRef(0)
	const ERROR_LOG_INTERVAL = 30000 // Solo loguear errores cada 30 segundos

	// Función para cargar datos del backend con toda la información
	const loadESP32Data = async () => {
		// Solo cargar si hay autenticación
		if (!isAuthenticated()) {
			setIsESP32Connected(false)
			setError('No autenticado. Por favor, inicia sesión.')
			setCruces([])
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			await checkHealth()
			setIsESP32Connected(true)

			// Obtener lista completa de cruces
			const crucesResponse = await getCruces()
			const crucesLista = crucesResponse.results || crucesResponse || []
			
			// Para cada cruce, obtener sus detalles completos (incluye telemetría según el esquema)
			const crucesCompletos = await Promise.allSettled(
				crucesLista.map(async (cruce) => {
					try {
						// Obtener detalles completos del cruce (incluye telemetría)
						const cruceDetalle = await getCruce(cruce.id)
						
						// Obtener telemetría más reciente del cruce
						let telemetriaReciente = null
						try {
							const telemetriaResponse = await getTelemetria({ cruce: cruce.id, page: 1 })
							const telemetriaLista = telemetriaResponse.results || telemetriaResponse || []
							telemetriaReciente = telemetriaLista.length > 0 ? telemetriaLista[0] : null
						} catch (err) {
							if (import.meta.env.VITE_DEBUG_MODE === 'true') {
								console.warn(`⚠️ No se pudo obtener telemetría del cruce ${cruce.id}:`, err)
							}
						}
						
						// Obtener alertas activas del cruce
						let alertasActivas = []
						try {
							const alertasResponse = await getAlertas({ page: 1 })
							const alertasLista = alertasResponse.results || alertasResponse || []
							alertasActivas = alertasLista.filter(a => 
								a.cruce === cruce.id && !a.resolved
							)
						} catch (err) {
							if (import.meta.env.VITE_DEBUG_MODE === 'true') {
								console.warn(`⚠️ No se pudo obtener alertas del cruce ${cruce.id}:`, err)
							}
						}
						
						// Obtener sensores del cruce
						let sensores = []
						try {
							const sensoresResponse = await getSensores({ cruce: cruce.id })
							const sensoresLista = sensoresResponse.results || sensoresResponse || []
							sensores = sensoresLista
						} catch (err) {
							if (import.meta.env.VITE_DEBUG_MODE === 'true') {
								console.warn(`⚠️ No se pudo obtener sensores del cruce ${cruce.id}:`, err)
							}
						}
						
						// Obtener eventos de barrera recientes
						let eventosBarrera = []
						try {
							const eventosResponse = await getBarrierEvents({ cruce: cruce.id, page: 1 })
							const eventosLista = eventosResponse.results || eventosResponse || []
							eventosBarrera = eventosLista.slice(0, 5) // Últimos 5 eventos
						} catch (err) {
							if (import.meta.env.VITE_DEBUG_MODE === 'true') {
								console.warn(`⚠️ No se pudo obtener eventos de barrera del cruce ${cruce.id}:`, err)
							}
						}
						
						// Calcular batería desde telemetría o usar valor por defecto
						const batteryVoltage = telemetriaReciente?.battery_voltage || 0
						const bateriaPorcentaje = batteryVoltage > 0 
							? Math.min(100, Math.max(0, ((batteryVoltage - 10) / (14.4 - 10)) * 100))
							: 0
						
						// Contar sensores activos
						const sensoresActivos = sensores.filter(s => s.activo !== false).length
						
						// Transformar datos al formato esperado por el frontend
						return {
							// Campos básicos del cruce
							id_cruce: cruce.id,
							nombre: cruce.nombre || cruceDetalle.nombre,
							ubicacion: cruce.ubicacion || cruceDetalle.ubicacion,
							estado: cruce.estado || cruceDetalle.estado || 'ACTIVO',
							coordenadas: {
								lat: cruce.coordenadas_lat || cruceDetalle.coordenadas_lat || 0,
								lng: cruce.coordenadas_lng || cruceDetalle.coordenadas_lng || 0,
							},
							created_at: cruce.created_at || cruceDetalle.created_at,
							updated_at: cruce.updated_at || cruceDetalle.updated_at,
							
							// Datos de telemetría
							bateria: Math.round(bateriaPorcentaje),
							voltage: telemetriaReciente?.barrier_voltage || 0,
							battery_voltage: telemetriaReciente?.battery_voltage || 0,
							temperature: telemetriaReciente?.temperature || 0,
							barrier_state: telemetriaReciente?.barrier_status || null,
							signal_strength: telemetriaReciente?.signal_strength || 0,
							rssi: telemetriaReciente?.signal_strength || 0,
							sensor_1: telemetriaReciente?.sensor_1 || null,
							sensor_2: telemetriaReciente?.sensor_2 || null,
							sensor_3: telemetriaReciente?.sensor_3 || null,
							sensor_4: telemetriaReciente?.sensor_4 || null,
							ultimaActividad: telemetriaReciente?.timestamp || cruce.updated_at || cruce.created_at,
							
							// Sensores
							sensores: sensores,
							sensoresActivos: sensoresActivos,
							
							// Alertas
							alertas: alertasActivas,
							alertasActivas: alertasActivas.length,
							
							// Eventos de barrera
							eventosBarrera: eventosBarrera,
							
							// Campos adicionales calculados
							tipoTren: telemetriaReciente?.barrier_status === 'DOWN' ? 'Carga' : 'N/A',
							velocidadPromedio: 0, // Se puede calcular desde eventos si hay datos
							
							// Incluir todos los campos originales del backend
							...cruce,
							...cruceDetalle,
							telemetria: telemetriaReciente,
						}
					} catch (err) {
						if (import.meta.env.VITE_DEBUG_MODE === 'true') {
							console.warn(`⚠️ Error al obtener detalles del cruce ${cruce.id}:`, err)
						}
						// Retornar datos básicos si falla la obtención de detalles
						return {
							id_cruce: cruce.id,
							nombre: cruce.nombre,
							ubicacion: cruce.ubicacion,
							estado: cruce.estado || 'ACTIVO',
							coordenadas: {
								lat: cruce.coordenadas_lat || 0,
								lng: cruce.coordenadas_lng || 0,
							},
							bateria: 0,
							sensoresActivos: 0,
							ultimaActividad: cruce.updated_at || cruce.created_at,
							...cruce,
						}
					}
				})
			)
			
			// Filtrar solo los cruces que se cargaron exitosamente
			const crucesTransformados = crucesCompletos
				.filter(result => result.status === 'fulfilled')
				.map(result => result.value)
				.filter(cruce => cruce !== null)

			setCruces(crucesTransformados)
			setLastUpdate(new Date())
			
			// Solo loguear éxito en modo debug
			if (import.meta.env.VITE_DEBUG_MODE === 'true') {
				console.log(`✅ Datos del backend cargados exitosamente: ${crucesTransformados.length} cruces`)
			}
		} catch (err) {
			setIsESP32Connected(false)
			setError('No se pudo conectar con el backend. Usando datos de respaldo.')
			setCruces(crucesBackup)
			
			// Rate limiting: solo loguear errores cada 30 segundos
			const now = Date.now()
			if (now - lastErrorLogTime.current > ERROR_LOG_INTERVAL) {
				const debugMode = import.meta.env.VITE_DEBUG_MODE === 'true'
				if (debugMode) {
					console.warn('⚠️ No se pudo conectar con el backend. Usando datos de respaldo.', err)
				}
				lastErrorLogTime.current = now
			}
		} finally {
			setIsLoading(false)
		}
	}

	// Efecto para cargar datos al montar y refrescar cada 30 segundos (reducido para producción)
	useEffect(() => {
		if (user && isAuthenticated()) {
			loadESP32Data()

			const interval = setInterval(() => {
				if (isAuthenticated()) {
					loadESP32Data()
				}
			}, 30000) // 30 segundos para producción

			return () => clearInterval(interval)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user])

	// Funciones CRUD para cruces
	const agregarCruce = async (nuevoCruce) => {
		try {
			const cruceCreado = await createCruce({
				nombre: nuevoCruce.nombre,
				ubicacion: nuevoCruce.ubicacion,
				coordenadas_lat: nuevoCruce.coordenadas?.lat,
				coordenadas_lng: nuevoCruce.coordenadas?.lng,
				estado: nuevoCruce.estado || 'ACTIVO',
			})
			
			// Recargar datos después de crear
			await loadESP32Data()
			agregarLog('CREATE_CRUCE', `Creado nuevo cruce: ${nuevoCruce.nombre}`)
			return cruceCreado
		} catch (error) {
			agregarLog('ERROR', `Error al crear cruce: ${error.message}`)
			throw error
		}
	}

	const actualizarCruce = async (id, datosActualizados) => {
		try {
			const cruceActualizado = await updateCruce(id, {
				nombre: datosActualizados.nombre,
				ubicacion: datosActualizados.ubicacion,
				coordenadas_lat: datosActualizados.coordenadas?.lat,
				coordenadas_lng: datosActualizados.coordenadas?.lng,
				estado: datosActualizados.estado,
			})
			
			// Recargar datos después de actualizar
			await loadESP32Data()
			agregarLog('UPDATE_CRUCE', `Actualizado cruce ID: ${id}`)
			return cruceActualizado
		} catch (error) {
			agregarLog('ERROR', `Error al actualizar cruce: ${error.message}`)
			throw error
		}
	}

	const eliminarCruce = async (id) => {
		try {
			const cruce = cruces.find(c => c.id_cruce === id)
			await deleteCruce(id)
			
			// Recargar datos después de eliminar
			await loadESP32Data()
			agregarLog('DELETE_CRUCE', `Eliminado cruce: ${cruce?.nombre || id}`)
		} catch (error) {
			agregarLog('ERROR', `Error al eliminar cruce: ${error.message}`)
			throw error
		}
	}

	// Funciones CRUD para usuarios
	const agregarUsuario = (nuevoUsuario) => {
		const id = Math.max(...usuarios.map(u => u.id)) + 1
		const usuario = { ...nuevoUsuario, id }
		setUsuarios([...usuarios, usuario])
		agregarLog('CREATE_USER', `Creado nuevo usuario: ${nuevoUsuario.email}`)
	}

	const actualizarUsuario = (id, datosActualizados) => {
		setUsuarios(usuarios.map(usuario => 
			usuario.id === id ? { ...usuario, ...datosActualizados } : usuario
		))
		agregarLog('UPDATE_USER', `Actualizado usuario ID: ${id}`)
	}

	const eliminarUsuario = (id) => {
		const usuario = usuarios.find(u => u.id === id)
		setUsuarios(usuarios.filter(u => u.id !== id))
		agregarLog('DELETE_USER', `Eliminado usuario: ${usuario?.email || id}`)
	}

	// Función para agregar logs
	const agregarLog = (accion, detalle, ip = '192.168.1.100') => {
		const nuevoLog = {
			id: logs.length + 1,
			fecha: new Date().toISOString().replace('T', ' ').split('.')[0],
			usuario: user?.nombre || 'Sistema',
			accion,
			detalle,
			ip
		}
		setLogs([nuevoLog, ...logs])
	}

	// Función de login con persistencia
	const login = async (email, password) => {
		try {
			const response = await apiLogin(email, password)
			setUser(response.user)
			
			const isAdminUser = response.user?.profile?.role === 'ADMIN' || response.user?.profile?.role === 'MAINTENANCE'
			setIsAdmin(isAdminUser)
			
			agregarLog('LOGIN', 'Inicio de sesión exitoso')
			
			// Recargar datos después de login
			await loadESP32Data()
			
			return true
		} catch (error) {
			agregarLog('ERROR', `Error al iniciar sesión: ${error.message}`)
			throw error
		}
	}

	const logout = async () => {
		try {
			await apiLogout()
		} catch (error) {
			console.warn('Error al cerrar sesión en el servidor:', error)
		} finally {
			agregarLog('LOGOUT', 'Cierre de sesión')
			setUser(null)
			setIsAdmin(false)
			setCruces([])
		}
	}

	// Calcular estadísticas
	const stats = {
		totalCruces: cruces.length,
		activos: cruces.filter(c => c.estado === 'ACTIVO').length,
		mantenimiento: cruces.filter(c => c.estado === 'MANTENIMIENTO').length,
		inactivos: cruces.filter(c => c.estado === 'INACTIVO').length,
		alertasBateria: cruces.filter(c => c.bateria < configuracion.umbral_bateria_baja).length,
		totalUsuarios: usuarios.length,
		usuariosActivos: usuarios.filter(u => u.estado === 'ACTIVO').length,
		promedioBateria: Math.round(cruces.reduce((acc, c) => acc + c.bateria, 0) / cruces.length) || 0,
		sensoresTotal: cruces.reduce((acc, c) => acc + c.sensoresActivos, 0)
	}

	const value = {
		cruces,
		usuarios,
		logs,
		configuracion,
		user,
		isAdmin,
		stats,
		isLoading,
		isESP32Connected,
		lastUpdate,
		error,
		agregarCruce,
		actualizarCruce,
		eliminarCruce,
		agregarUsuario,
		actualizarUsuario,
		eliminarUsuario,
		setConfiguracion,
		login,
		logout,
		agregarLog,
		loadESP32Data
	}

	return (
		<DataContext.Provider value={value}>
			{children}
		</DataContext.Provider>
	)
}
