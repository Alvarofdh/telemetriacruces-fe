import React, { useState, useEffect, useRef } from 'react'
import { useData } from '../hooks/useData'
import toast from 'react-hot-toast'

// Iconos SVG
const NotificationIcons = {
	info: (className = "w-5 h-5") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	),
	warning: (className = "w-5 h-5") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
		</svg>
	),
	error: (className = "w-5 h-5") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	),
	success: (className = "w-5 h-5") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	),
	bell: (className = "w-5 h-5") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
		</svg>
	),
	close: (className = "w-4 h-4") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
		</svg>
	)
}

export function NotificationPanel() {
	const { cruces } = useData()
	const [notifications, setNotifications] = useState([])
	const [isOpen, setIsOpen] = useState(false)
	const [unreadCount, setUnreadCount] = useState(0)
	const previousCrucesRef = useRef([])

	// Detectar cambios en cruces y crear notificaciones
	useEffect(() => {
		if (previousCrucesRef.current.length === 0) {
			previousCrucesRef.current = cruces
			return
		}

		cruces.forEach(cruce => {
			const previousCruce = previousCrucesRef.current.find(p => p.id_cruce === cruce.id_cruce)
			if (!previousCruce) return

			// Detectar cambios críticos
			if (previousCruce.estado !== cruce.estado) {
				const type = cruce.estado === 'INACTIVO' ? 'error' : cruce.estado === 'MANTENIMIENTO' ? 'warning' : 'success'
				addNotification({
					type,
					title: `Estado de ${cruce.nombre} cambió`,
					message: `El cruce cambió de ${previousCruce.estado} a ${cruce.estado}`,
					timestamp: new Date(),
					cruceId: cruce.id_cruce
				})
			}

			if (previousCruce.bateria > 30 && cruce.bateria <= 30) {
				addNotification({
					type: 'warning',
					title: `Batería baja en ${cruce.nombre}`,
					message: `La batería descendió a ${cruce.bateria}%`,
					timestamp: new Date(),
					cruceId: cruce.id_cruce
				})
			}

			if (previousCruce.bateria > 20 && cruce.bateria <= 20) {
				addNotification({
					type: 'error',
					title: `Batería crítica en ${cruce.nombre}`,
					message: `La batería está en ${cruce.bateria}% - Acción requerida`,
					timestamp: new Date(),
					cruceId: cruce.id_cruce
				})
			}

			if (previousCruce.sensoresActivos > cruce.sensoresActivos && cruce.sensoresActivos < 2) {
				addNotification({
					type: 'warning',
					title: `Falla de sensores en ${cruce.nombre}`,
					message: `Solo ${cruce.sensoresActivos} sensores activos`,
					timestamp: new Date(),
					cruceId: cruce.id_cruce
				})
			}
		})

		previousCrucesRef.current = cruces
	}, [cruces])

	const addNotification = (notification) => {
		const newNotification = {
			id: Date.now(),
			...notification,
			read: false
		}
		setNotifications(prev => [newNotification, ...prev].slice(0, 50)) // Máximo 50 notificaciones
		setUnreadCount(prev => prev + 1)
		
		// Mostrar toast también
		const toastOptions = {
			duration: notification.type === 'error' ? 5000 : 4000,
			icon: notification.type === 'error' ? '🔴' : notification.type === 'warning' ? '⚠️' : '✅'
		}
		
		if (notification.type === 'error') {
			toast.error(notification.message, toastOptions)
		} else if (notification.type === 'warning') {
			toast(notification.message, { ...toastOptions, icon: '⚠️' })
		} else {
			toast.success(notification.message, toastOptions)
		}
	}

	const markAsRead = (id) => {
		setNotifications(prev => 
			prev.map(n => n.id === id ? { ...n, read: true } : n)
		)
		setUnreadCount(prev => Math.max(0, prev - 1))
	}

	const markAllAsRead = () => {
		setNotifications(prev => prev.map(n => ({ ...n, read: true })))
		setUnreadCount(0)
	}

	const clearAll = () => {
		setNotifications([])
		setUnreadCount(0)
	}

	const getNotificationStyles = (type) => {
		const styles = {
			error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
			warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
			success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
			info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
		}
		return styles[type] || styles.info
	}

	const getNotificationIcon = (type) => {
		switch(type) {
			case 'error':
				return <NotificationIcons.error className="w-5 h-5 text-red-600 dark:text-red-400" />
			case 'warning':
				return <NotificationIcons.warning className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
			case 'success':
				return <NotificationIcons.success className="w-5 h-5 text-green-600 dark:text-green-400" />
			default:
				return <NotificationIcons.info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
		}
	}

	const formatTime = (date) => {
		const now = new Date()
		const diff = now - date
		const minutes = Math.floor(diff / 60000)
		const hours = Math.floor(minutes / 60)
		const days = Math.floor(hours / 24)

		if (minutes < 1) return 'Ahora'
		if (minutes < 60) return `Hace ${minutes} min`
		if (hours < 24) return `Hace ${hours} h`
		if (days < 7) return `Hace ${days} d`
		return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
	}

	return (
		<div className="relative">
			{/* Botón de notificaciones */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
				aria-label="Notificaciones"
			>
				<NotificationIcons.bell className="w-6 h-6" />
				{unreadCount > 0 && (
					<span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
						{unreadCount > 9 ? '9+' : unreadCount}
					</span>
				)}
			</button>

			{/* Panel de notificaciones */}
			{isOpen && (
				<>
					<div 
						className="fixed inset-0 z-40"
						onClick={() => setIsOpen(false)}
					/>
					<div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] flex flex-col">
						{/* Header */}
						<div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<NotificationIcons.bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
									Notificaciones
								</h3>
								{unreadCount > 0 && (
									<span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
										{unreadCount}
									</span>
								)}
							</div>
							<div className="flex items-center gap-2">
								{unreadCount > 0 && (
									<button
										onClick={markAllAsRead}
										className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
									>
										Marcar todas
									</button>
								)}
								<button
									onClick={() => setIsOpen(false)}
									className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
								>
									<NotificationIcons.close className="w-4 h-4" />
								</button>
							</div>
						</div>

						{/* Lista de notificaciones */}
						<div className="flex-1 overflow-y-auto">
							{notifications.length === 0 ? (
								<div className="p-8 text-center">
									<NotificationIcons.bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
									<p className="text-sm text-gray-600 dark:text-gray-400">
										No hay notificaciones
									</p>
								</div>
							) : (
								<div className="divide-y divide-gray-200 dark:divide-gray-700">
									{notifications.map(notification => (
										<div
											key={notification.id}
											onClick={() => markAsRead(notification.id)}
											className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
												!notification.read ? getNotificationStyles(notification.type) : ''
											} ${notification.read ? 'opacity-75' : ''}`}
										>
											<div className="flex items-start gap-3">
												<div className="shrink-0 mt-0.5">
													{getNotificationIcon(notification.type)}
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-start justify-between gap-2">
														<h4 className="text-sm font-semibold text-gray-900 dark:text-white">
															{notification.title}
														</h4>
														{!notification.read && (
															<div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
														)}
													</div>
													<p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
														{notification.message}
													</p>
													<p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
														{formatTime(notification.timestamp)}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Footer */}
						{notifications.length > 0 && (
							<div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
								<button
									onClick={clearAll}
									className="w-full text-sm text-red-600 dark:text-red-400 hover:underline"
								>
									Limpiar todas
								</button>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	)
}

