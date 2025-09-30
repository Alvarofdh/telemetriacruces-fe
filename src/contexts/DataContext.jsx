import React, { createContext, useContext, useState, useEffect } from 'react'
import { fetchAllTelemetry, checkHealth } from '../services/api'

const DataContext = createContext()

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
		const savedUser = localStorage.getItem('currentUser')
		return savedUser ? JSON.parse(savedUser) : null
	})
	const [isAdmin, setIsAdmin] = useState(() => {
		const savedIsAdmin = localStorage.getItem('isAdmin')
		return savedIsAdmin === 'true'
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

	// Función para cargar datos del ESP32
	const loadESP32Data = async () => {
		setIsLoading(true)
		setError(null)

		try {
			await checkHealth()
			setIsESP32Connected(true)

			const telemetryData = await fetchAllTelemetry()
			setCruces(telemetryData)
			setLastUpdate(new Date())
			
			console.log('Datos del ESP32 cargados exitosamente:', telemetryData)
		} catch (err) {
			console.error('Error al conectar con ESP32, usando datos de respaldo:', err)
			setIsESP32Connected(false)
			setError('No se pudo conectar con el ESP32. Usando datos de respaldo.')
			setCruces(crucesBackup)
		} finally {
			setIsLoading(false)
		}
	}

	// Efecto para cargar datos al montar y refrescar cada 5 segundos
	useEffect(() => {
		loadESP32Data()

		const interval = setInterval(() => {
			loadESP32Data()
		}, 5000)

		return () => clearInterval(interval)
	}, [])

	// Funciones CRUD para cruces
	const agregarCruce = (nuevoCruce) => {
		const id = Math.max(...cruces.map(c => c.id_cruce)) + 1
		const cruce = { ...nuevoCruce, id_cruce: id }
		setCruces([...cruces, cruce])
		agregarLog('CREATE_CRUCE', `Creado nuevo cruce: ${nuevoCruce.nombre}`)
	}

	const actualizarCruce = (id, datosActualizados) => {
		setCruces(cruces.map(cruce => 
			cruce.id_cruce === id ? { ...cruce, ...datosActualizados } : cruce
		))
		agregarLog('UPDATE_CRUCE', `Actualizado cruce ID: ${id}`)
	}

	const eliminarCruce = (id) => {
		const cruce = cruces.find(c => c.id_cruce === id)
		setCruces(cruces.filter(c => c.id_cruce !== id))
		agregarLog('DELETE_CRUCE', `Eliminado cruce: ${cruce?.nombre || id}`)
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
	const login = (email, password) => {
		const usuario = usuarios.find(u => u.email === email)
		if (usuario && password === 'admin123') {
			setUser(usuario)
			const isAdminUser = ['SUPER_ADMIN', 'SUPERVISOR'].includes(usuario.rol)
			setIsAdmin(isAdminUser)
			
			localStorage.setItem('currentUser', JSON.stringify(usuario))
			localStorage.setItem('isAdmin', isAdminUser.toString())
			
			agregarLog('LOGIN', 'Inicio de sesión exitoso')
			return true
		}
		return false
	}

	const logout = () => {
		agregarLog('LOGOUT', 'Cierre de sesión')
		setUser(null)
		setIsAdmin(false)
		
		localStorage.removeItem('currentUser')
		localStorage.removeItem('isAdmin')
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
