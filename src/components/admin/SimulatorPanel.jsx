import React, { useState, useEffect } from 'react'
import { useData } from '../../hooks/useData'
import { createAlerta } from '../../services/alertas'
import { getSocket } from '../../services/socket'
import toast from 'react-hot-toast'

// Iconos SVG para simulaciones
const SimulationIcons = {
	train: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
		</svg>
	),
	lightning: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
		</svg>
	),
	bell: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
		</svg>
	),
	battery: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
		</svg>
	),
	critical: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	),
	plug: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
		</svg>
	),
	sensor: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
		</svg>
	),
	check: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	),
	alert: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
		</svg>
	),
	arrowDown: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
		</svg>
	),
	arrowUp: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
		</svg>
	),
	wifi: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
		</svg>
	),
	wifiOff: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
		</svg>
	),
	thermometer: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
		</svg>
	),
	door: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
		</svg>
	),
	wrench: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
		</svg>
	),
	circle: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	),
	stop: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
		</svg>
	),
	explosion: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
		</svg>
	),
	chart: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
		</svg>
	),
	voltage: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
		</svg>
	),
	play: (className = "w-6 h-6") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	)
}

export function SimulatorPanel() {
	const { cruces, actualizarCruce } = useData()
	const [isSimulating, setIsSimulating] = useState(false)
	const [simulationHistory, setSimulationHistory] = useState([])
	const [selectedCruce, setSelectedCruce] = useState(null)

	// Eventos de simulación disponibles - Expandido con todos los contextos posibles
	const simulationEvents = [
		// === EVENTOS DE TREN ===
		{
			id: 'train_pass',
			name: 'Tren Pasa',
			description: 'Simula el paso de un tren por el cruce',
			icon: 'train',
			color: 'blue',
			category: 'tren',
			action: async (cruce) => {
				const updatedCruce = {
					...cruce,
					ultimaActividad: new Date().toISOString(),
					tipoTren: ['Carga', 'Pasajeros', 'Mixto'][Math.floor(Math.random() * 3)],
					velocidadPromedio: Math.floor(Math.random() * 40) + 30,
					sensoresActivos: Math.min(cruce.sensoresActivos + 1, 4)
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				return `Tren ${updatedCruce.tipoTren} pasó por ${cruce.nombre} a ${updatedCruce.velocidadPromedio} km/h`
			}
		},
		{
			id: 'train_high_speed',
			name: 'Tren Alta Velocidad',
			description: 'Simula un tren pasando a alta velocidad',
			icon: 'lightning',
			color: 'blue',
			category: 'tren',
			action: async (cruce) => {
				const updatedCruce = {
					...cruce,
					ultimaActividad: new Date().toISOString(),
					tipoTren: 'Pasajeros',
					velocidadPromedio: Math.floor(Math.random() * 30) + 80,
					sensoresActivos: 4
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				return `Tren de alta velocidad pasó por ${cruce.nombre} a ${updatedCruce.velocidadPromedio} km/h`
			}
		},
		{
			id: 'train_detected',
			name: 'Tren Detectado',
			description: 'Simula la detección de un tren acercándose',
			icon: 'bell',
			color: 'blue',
			category: 'tren',
			action: async (cruce) => {
				try {
					await createAlerta({
						type: 'TRAIN_DETECTED',
						severity: 'INFO',
						description: `Tren detectado acercándose a ${cruce.nombre}`,
						cruce: cruce.id_cruce || cruce.id
					})
					return `Alerta: Tren detectado acercándose a ${cruce.nombre}`
				} catch (error) {
					console.error('Error creando alerta:', error)
					return `Simulación de tren detectado en ${cruce.nombre}`
				}
			}
		},
		
		// === EVENTOS DE BATERÍA ===
		{
			id: 'battery_low',
			name: 'Batería Baja',
			description: 'Simula una descarga rápida de batería',
			icon: 'battery',
			color: 'yellow',
			category: 'bateria',
			action: async (cruce) => {
				const newBateria = Math.max(0, cruce.bateria - (Math.floor(Math.random() * 30) + 10))
				const updatedCruce = {
					...cruce,
					bateria: newBateria,
					estado: newBateria < 20 ? 'INACTIVO' : cruce.estado
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				return `Batería de ${cruce.nombre} descendió a ${newBateria}%`
			}
		},
		{
			id: 'battery_critical',
			name: 'Batería Crítica',
			description: 'Simula batería en nivel crítico (<20%)',
			icon: 'critical',
			color: 'red',
			category: 'bateria',
			action: async (cruce) => {
				const newBateria = Math.floor(Math.random() * 20)
				const updatedCruce = {
					...cruce,
					bateria: newBateria,
					estado: 'INACTIVO'
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				try {
					await createAlerta({
						type: 'LOW_BATTERY',
						severity: 'CRITICAL',
						description: `Batería crítica en ${cruce.nombre}: ${newBateria}%`,
						cruce: cruce.id_cruce || cruce.id
					})
				} catch (error) {
					console.error('Error creando alerta:', error)
				}
				return `BATERÍA CRÍTICA: ${cruce.nombre} tiene ${newBateria}%`
			}
		},
		{
			id: 'battery_charging',
			name: 'Batería Cargando',
			description: 'Simula carga de batería durante mantenimiento',
			icon: 'plug',
			color: 'green',
			category: 'bateria',
			action: async (cruce) => {
				const newBateria = Math.min(100, cruce.bateria + (Math.floor(Math.random() * 30) + 20))
				const updatedCruce = {
					...cruce,
					bateria: newBateria,
					estado: newBateria > 50 ? 'ACTIVO' : cruce.estado
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				return `Batería de ${cruce.nombre} cargada a ${newBateria}%`
			}
		},
		
		// === EVENTOS DE SENSORES ===
		{
			id: 'sensor_failure',
			name: 'Falla de Sensor',
			description: 'Simula la falla de uno o más sensores',
			icon: 'sensor',
			color: 'red',
			category: 'sensores',
			action: async (cruce) => {
				const newSensores = Math.max(0, cruce.sensoresActivos - (Math.floor(Math.random() * 2) + 1))
				const updatedCruce = {
					...cruce,
					sensoresActivos: newSensores,
					estado: newSensores < 2 ? 'MANTENIMIENTO' : cruce.estado
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				try {
					await createAlerta({
						type: 'SENSOR_ERROR',
						severity: newSensores < 2 ? 'CRITICAL' : 'WARNING',
						description: `Falla de sensores en ${cruce.nombre}: ${newSensores}/4 activos`,
						cruce: cruce.id_cruce || cruce.id
					})
				} catch (error) {
					console.error('Error creando alerta:', error)
				}
				return `${cruce.nombre} tiene ${newSensores} sensores activos (falla detectada)`
			}
		},
		{
			id: 'sensor_recovery',
			name: 'Recuperación de Sensor',
			description: 'Simula la recuperación de sensores',
			icon: 'check',
			color: 'green',
			category: 'sensores',
			action: async (cruce) => {
				const newSensores = Math.min(4, cruce.sensoresActivos + (Math.floor(Math.random() * 2) + 1))
				const updatedCruce = {
					...cruce,
					sensoresActivos: newSensores,
					estado: newSensores >= 3 ? 'ACTIVO' : cruce.estado
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				return `Sensores de ${cruce.nombre} recuperados: ${newSensores}/4 activos`
			}
		},
		{
			id: 'sensor_all_fail',
			name: 'Falla Total de Sensores',
			description: 'Simula falla de todos los sensores',
			icon: 'alert',
			color: 'red',
			category: 'sensores',
			action: async (cruce) => {
				const updatedCruce = {
					...cruce,
					sensoresActivos: 0,
					estado: 'INACTIVO'
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				try {
					await createAlerta({
						type: 'SENSOR_ERROR',
						severity: 'CRITICAL',
						description: `FALLA TOTAL: Todos los sensores de ${cruce.nombre} están inactivos`,
						cruce: cruce.id_cruce || cruce.id
					})
				} catch (error) {
					console.error('Error creando alerta:', error)
				}
				return `FALLA TOTAL: ${cruce.nombre} sin sensores activos`
			}
		},
		
		// === EVENTOS DE BARRERA ===
		{
			id: 'barrier_down',
			name: 'Barrera Baja',
			description: 'Simula que la barrera se baja',
			icon: 'arrowDown',
			color: 'blue',
			category: 'barrera',
			action: async (cruce) => {
				const socket = getSocket()
				if (socket && socket.connected) {
					socket.emit('barrier_event', {
						cruce: cruce.id_cruce || cruce.id,
						barrier_status: 'DOWN',
						timestamp: new Date().toISOString()
					})
				}
				return `Barrera de ${cruce.nombre} bajada`
			}
		},
		{
			id: 'barrier_up',
			name: 'Barrera Sube',
			description: 'Simula que la barrera se sube',
			icon: 'arrowUp',
			color: 'green',
			category: 'barrera',
			action: async (cruce) => {
				const socket = getSocket()
				if (socket && socket.connected) {
					socket.emit('barrier_event', {
						cruce: cruce.id_cruce || cruce.id,
						barrier_status: 'UP',
						timestamp: new Date().toISOString()
					})
				}
				return `Barrera de ${cruce.nombre} subida`
			}
		},
		{
			id: 'barrier_error',
			name: 'Error de Barrera',
			description: 'Simula un error en el mecanismo de la barrera',
			icon: 'alert',
			color: 'red',
			category: 'barrera',
			action: async (cruce) => {
				try {
					await createAlerta({
						type: 'BARRIER_ERROR',
						severity: 'CRITICAL',
						description: `Error en el mecanismo de barrera de ${cruce.nombre}`,
						cruce: cruce.id_cruce || cruce.id
					})
					return `Error de barrera detectado en ${cruce.nombre}`
				} catch (error) {
					console.error('Error creando alerta:', error)
					return `Simulación de error de barrera en ${cruce.nombre}`
				}
			}
		},
		
		// === EVENTOS DE COMUNICACIÓN ===
		{
			id: 'communication_lost',
			name: 'Comunicación Perdida',
			description: 'Simula pérdida de comunicación con el cruce',
			icon: 'wifiOff',
			color: 'red',
			category: 'comunicacion',
			action: async (cruce) => {
				const updatedCruce = {
					...cruce,
					estado: 'INACTIVO',
					ultimaActividad: new Date(Date.now() - 3600000).toISOString() // 1 hora atrás
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				try {
					await createAlerta({
						type: 'COMMUNICATION_ERROR',
						severity: 'CRITICAL',
						description: `Pérdida de comunicación con ${cruce.nombre}`,
						cruce: cruce.id_cruce || cruce.id
					})
				} catch (error) {
					console.error('Error creando alerta:', error)
				}
				return `Comunicación perdida con ${cruce.nombre}`
			}
		},
		{
			id: 'communication_restored',
			name: 'Comunicación Restaurada',
			description: 'Simula restauración de comunicación',
			icon: 'wifi',
			color: 'green',
			category: 'comunicacion',
			action: async (cruce) => {
				const updatedCruce = {
					...cruce,
					estado: cruce.bateria > 20 ? 'ACTIVO' : 'MANTENIMIENTO',
					ultimaActividad: new Date().toISOString()
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				return `Comunicación restaurada con ${cruce.nombre}`
			}
		},
		
		// === EVENTOS DE TEMPERATURA ===
		{
			id: 'temperature_high',
			name: 'Temperatura Alta',
			description: 'Simula temperatura elevada en el gabinete',
			icon: 'thermometer',
			color: 'red',
			category: 'temperatura',
			action: async (cruce) => {
				try {
					await createAlerta({
						type: 'OTHER',
						severity: 'WARNING',
						description: `Temperatura alta detectada en ${cruce.nombre}: ${Math.floor(Math.random() * 10) + 40}°C`,
						cruce: cruce.id_cruce || cruce.id
					})
					return `Temperatura alta en ${cruce.nombre}`
				} catch (error) {
					console.error('Error creando alerta:', error)
					return `Simulación de temperatura alta en ${cruce.nombre}`
				}
			}
		},
		{
			id: 'temperature_normal',
			name: 'Temperatura Normal',
			description: 'Simula temperatura normalizada',
			icon: 'thermometer',
			color: 'green',
			category: 'temperatura',
			action: async (cruce) => {
				return `Temperatura normalizada en ${cruce.nombre}`
			}
		},
		
		// === EVENTOS DE GABINETE ===
		{
			id: 'gabinete_open',
			name: 'Gabinete Abierto',
			description: 'Simula que el gabinete fue abierto',
			icon: 'door',
			color: 'yellow',
			category: 'gabinete',
			action: async (cruce) => {
				try {
					await createAlerta({
						type: 'OTHER',
						severity: 'WARNING',
						description: `Gabinete abierto en ${cruce.nombre}`,
						cruce: cruce.id_cruce || cruce.id
					})
					return `Gabinete de ${cruce.nombre} abierto`
				} catch (error) {
					console.error('Error creando alerta:', error)
					return `Simulación de gabinete abierto en ${cruce.nombre}`
				}
			}
		},
		
		// === EVENTOS DE ESTADO ===
		{
			id: 'cruce_failure',
			name: 'Cruce Inactivo',
			description: 'Simula que el cruce deja de funcionar',
			icon: 'alert',
			color: 'red',
			category: 'estado',
			action: async (cruce) => {
				const updatedCruce = {
					...cruce,
					estado: 'INACTIVO',
					sensoresActivos: 0,
					bateria: Math.max(0, cruce.bateria - 5)
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				try {
					await createAlerta({
						type: 'OTHER',
						severity: 'CRITICAL',
						description: `${cruce.nombre} está INACTIVO - Requiere intervención inmediata`,
						cruce: cruce.id_cruce || cruce.id
					})
				} catch (error) {
					console.error('Error creando alerta:', error)
				}
				return `${cruce.nombre} está INACTIVO - Requiere intervención inmediata`
			}
		},
		{
			id: 'maintenance',
			name: 'Mantenimiento',
			description: 'Simula que el cruce entra en mantenimiento',
			icon: 'wrench',
			color: 'yellow',
			category: 'estado',
			action: async (cruce) => {
				const updatedCruce = {
					...cruce,
					estado: 'MANTENIMIENTO',
					bateria: Math.min(100, cruce.bateria + 10)
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				return `${cruce.nombre} está en MANTENIMIENTO`
			}
		},
		{
			id: 'recovery',
			name: 'Recuperación',
			description: 'Simula la recuperación del cruce a estado normal',
			icon: 'check',
			color: 'green',
			category: 'estado',
			action: async (cruce) => {
				const updatedCruce = {
					...cruce,
					estado: 'ACTIVO',
					bateria: Math.min(100, cruce.bateria + 20),
					sensoresActivos: Math.min(4, cruce.sensoresActivos + 2)
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				return `${cruce.nombre} se recuperó y está ACTIVO`
			}
		},
		{
			id: 'cruce_activated',
			name: 'Cruce Activado',
			description: 'Simula activación completa del cruce',
			icon: 'circle',
			color: 'green',
			category: 'estado',
			action: async (cruce) => {
				const updatedCruce = {
					...cruce,
					estado: 'ACTIVO',
					bateria: Math.min(100, cruce.bateria + 30),
					sensoresActivos: 4,
					ultimaActividad: new Date().toISOString()
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				return `${cruce.nombre} activado completamente`
			}
		},
		
		// === EVENTOS DE EMERGENCIA ===
		{
			id: 'emergency_shutdown',
			name: 'Apagado de Emergencia',
			description: 'Simula apagado de emergencia del cruce',
			icon: 'stop',
			color: 'red',
			category: 'emergencia',
			action: async (cruce) => {
				const updatedCruce = {
					...cruce,
					estado: 'INACTIVO',
					sensoresActivos: 0,
					bateria: cruce.bateria
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				try {
					await createAlerta({
						type: 'OTHER',
						severity: 'CRITICAL',
						description: `APAGADO DE EMERGENCIA en ${cruce.nombre}`,
						cruce: cruce.id_cruce || cruce.id
					})
				} catch (error) {
					console.error('Error creando alerta:', error)
				}
				return `APAGADO DE EMERGENCIA: ${cruce.nombre}`
			}
		},
		{
			id: 'multiple_failures',
			name: 'Múltiples Fallas',
			description: 'Simula múltiples fallas simultáneas',
			icon: 'explosion',
			color: 'red',
			category: 'emergencia',
			action: async (cruce) => {
				const updatedCruce = {
					...cruce,
					estado: 'INACTIVO',
					sensoresActivos: Math.max(0, cruce.sensoresActivos - 2),
					bateria: Math.max(0, cruce.bateria - 20)
				}
				await actualizarCruce(cruce.id_cruce, updatedCruce)
				try {
					await createAlerta({
						type: 'OTHER',
						severity: 'CRITICAL',
						description: `Múltiples fallas detectadas en ${cruce.nombre}`,
						cruce: cruce.id_cruce || cruce.id
					})
				} catch (error) {
					console.error('Error creando alerta:', error)
				}
				return `Múltiples fallas en ${cruce.nombre}`
			}
		},
		
		// === EVENTOS DE TELEMETRÍA ===
		{
			id: 'telemetry_update',
			name: 'Actualización Telemetría',
			description: 'Simula actualización de datos de telemetría',
			icon: 'chart',
			color: 'blue',
			category: 'telemetria',
			action: async (cruce) => {
				const socket = getSocket()
				if (socket && socket.connected) {
					socket.emit('new_telemetria', {
						cruce: cruce.id_cruce || cruce.id,
						barrier_voltage: (Math.random() * 2 + 12).toFixed(2),
						battery_voltage: (Math.random() * 5 + 10).toFixed(2),
						timestamp: new Date().toISOString()
					})
				}
				return `Telemetría actualizada para ${cruce.nombre}`
			}
		},
		{
			id: 'voltage_drop',
			name: 'Caída de Voltaje',
			description: 'Simula caída de voltaje en barrera',
			icon: 'voltage',
			color: 'yellow',
			category: 'telemetria',
			action: async (cruce) => {
				const socket = getSocket()
				if (socket && socket.connected) {
					socket.emit('new_telemetria', {
						cruce: cruce.id_cruce || cruce.id,
						barrier_voltage: (Math.random() * 2 + 8).toFixed(2), // Voltaje bajo
						battery_voltage: (Math.random() * 3 + 9).toFixed(2),
						timestamp: new Date().toISOString()
					})
				}
				return `Caída de voltaje detectada en ${cruce.nombre}`
			}
		}
	]

	const handleSimulate = async (event) => {
		if (!selectedCruce) {
			toast.error('Por favor selecciona un cruce primero')
			return
		}

		setIsSimulating(true)
		try {
			const cruce = cruces.find(c => c.id_cruce === selectedCruce)
			if (!cruce) {
				toast.error('Cruce no encontrado')
				return
			}

			const message = await event.action(cruce)
			
			// Agregar al historial
			setSimulationHistory(prev => [{
				id: Date.now(),
				event: event.name,
				cruce: cruce.nombre,
				message,
				timestamp: new Date().toLocaleTimeString('es-ES')
			}, ...prev].slice(0, 20)) // Mantener solo los últimos 20

			toast.success(message, {
				duration: 4000
			})
		} catch (error) {
			console.error('Error en simulación:', error)
			toast.error('Error al simular evento')
		} finally {
			setIsSimulating(false)
		}
	}

	const handleQuickDemo = async () => {
		if (cruces.length === 0) {
			toast.error('No hay cruces disponibles para la demostración')
			return
		}

		setIsSimulating(true)
		const demoSequence = [
			{ delay: 1000, event: simulationEvents.find(e => e.id === 'train_pass'), cruce: cruces[0] },
			{ delay: 2000, event: simulationEvents.find(e => e.id === 'battery_low'), cruce: cruces[0] },
			{ delay: 3000, event: simulationEvents.find(e => e.id === 'sensor_failure'), cruce: cruces[Math.min(1, cruces.length - 1)] },
			{ delay: 4000, event: simulationEvents.find(e => e.id === 'barrier_down'), cruce: cruces[0] },
			{ delay: 5000, event: simulationEvents.find(e => e.id === 'barrier_up'), cruce: cruces[0] },
			{ delay: 6000, event: simulationEvents.find(e => e.id === 'communication_lost'), cruce: cruces[Math.min(1, cruces.length - 1)] },
			{ delay: 7000, event: simulationEvents.find(e => e.id === 'recovery'), cruce: cruces[0] },
		]

		for (const step of demoSequence) {
			if (!step.event || !step.cruce) continue
			await new Promise(resolve => setTimeout(resolve, step.delay))
			try {
				const message = await step.event.action(step.cruce)
				setSimulationHistory(prev => [{
					id: Date.now(),
					event: step.event.name,
					cruce: step.cruce.nombre,
					message,
					timestamp: new Date().toLocaleTimeString('es-ES')
				}, ...prev].slice(0, 20))
				toast.success(message, {
					duration: 3000
				})
			} catch (error) {
				console.error('Error en demo:', error)
			}
		}

		setIsSimulating(false)
		toast.success('Demostración completada')
	}
	
	// Agrupar eventos por categoría
	const eventsByCategory = simulationEvents.reduce((acc, event) => {
		const category = event.category || 'otros'
		if (!acc[category]) acc[category] = []
		acc[category].push(event)
		return acc
	}, {})
	
	const categoryNames = {
		tren: 'Eventos de Tren',
		bateria: 'Eventos de Batería',
		sensores: 'Eventos de Sensores',
		barrera: 'Eventos de Barrera',
		comunicacion: 'Eventos de Comunicación',
		temperatura: 'Eventos de Temperatura',
		gabinete: 'Eventos de Gabinete',
		estado: 'Cambios de Estado',
		emergencia: 'Emergencias',
		telemetria: 'Telemetría',
		otros: 'Otros'
	}

	const getEventColor = (color) => {
		const colors = {
			blue: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700',
			yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700',
			red: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700',
			green: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700'
		}
		return colors[color] || colors.blue
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
							Panel de Simulación
						</h2>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Simula eventos en tiempo real para pruebas y demostraciones
						</p>
					</div>
					<button
						onClick={handleQuickDemo}
						disabled={isSimulating || cruces.length === 0}
						className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg flex items-center gap-2"
					>
						{SimulationIcons.play("w-5 h-5")}
						Demo Rápida
					</button>
				</div>
			</div>

			{/* Selección de Cruce */}
			<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Seleccionar Cruce para Simulación
				</label>
				<select
					value={selectedCruce || ''}
					onChange={(e) => setSelectedCruce(Number(e.target.value))}
					className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
				>
					<option value="">-- Selecciona un cruce --</option>
					{cruces.map(cruce => (
						<option key={cruce.id_cruce} value={cruce.id_cruce}>
							{cruce.nombre} - {cruce.estado} ({cruce.bateria}% batería)
						</option>
					))}
				</select>
			</div>

			{/* Eventos de Simulación por Categoría */}
			{Object.entries(eventsByCategory).map(([category, events]) => (
				<div key={category} className="space-y-4">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
						{categoryNames[category] || category}
						<span className="text-sm font-normal text-gray-500 dark:text-gray-400">
							({events.length} eventos)
						</span>
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{events.map(event => {
							const IconComponent = SimulationIcons[event.icon] || SimulationIcons.circle
							return (
								<div
									key={event.id}
									className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all"
								>
									<div className="flex items-start justify-between mb-3">
										<div className="text-gray-700 dark:text-gray-300">
											{IconComponent("w-8 h-8")}
										</div>
										<span className={`px-2.5 py-1 text-xs font-semibold rounded-full border-2 ${getEventColor(event.color)}`}>
											{event.name}
										</span>
									</div>
								<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
									{event.description}
								</p>
								<button
									onClick={() => handleSimulate(event)}
									disabled={isSimulating || !selectedCruce}
									className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
								>
									{isSimulating ? 'Simulando...' : 'Simular Evento'}
								</button>
							</div>
							)
						})}
					</div>
				</div>
			))}

			{/* Historial de Simulaciones */}
			{simulationHistory.length > 0 && (
				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
						Historial de Simulaciones
					</h3>
					<div className="space-y-2 max-h-64 overflow-y-auto">
						{simulationHistory.map(item => (
							<div
								key={item.id}
								className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
							>
								<div className="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0 w-20">
									{item.timestamp}
								</div>
								<div className="flex-1">
									<div className="text-sm font-semibold text-gray-900 dark:text-white">
										{item.event} - {item.cruce}
									</div>
									<div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
										{item.message}
									</div>
								</div>
							</div>
						))}
					</div>
					<button
						onClick={() => setSimulationHistory([])}
						className="mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
					>
						Limpiar historial
					</button>
				</div>
			)}
		</div>
	)
}

