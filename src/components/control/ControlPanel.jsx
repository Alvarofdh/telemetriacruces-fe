import React from 'react'
import { Navigate } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import { AdminPanel } from './admin/AdminPanel'
import { MaintenancePanel } from './maintenance/MaintenancePanel'
import { ObserverPanel } from './observer/ObserverPanel'

/**
 * Panel de Control principal
 * Muestra diferentes vistas según el rol del usuario
 */
export function ControlPanel() {
	const { isAdmin, isMaintenance, isObserver } = usePermissions()

	// Renderizar panel según el rol
	if (isAdmin) {
		return <AdminPanel />
	}
	if (isMaintenance) {
		return <MaintenancePanel />
	}
	if (isObserver) {
		return <ObserverPanel />
	}
	// Fallback: redirigir al dashboard principal si no tiene rol válido
	return <Navigate to="/" replace />
}

