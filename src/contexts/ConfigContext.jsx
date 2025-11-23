import React, { createContext, useState } from 'react'

/**
 * Contexto especializado para configuración del sistema
 * Proporciona acceso a configuración y funciones de actualización
 */
export const ConfigContext = createContext()

export function ConfigProvider({ children }) {
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

	const value = {
		configuracion,
		setConfiguracion,
	}

	return (
		<ConfigContext.Provider value={value}>
			{children}
		</ConfigContext.Provider>
	)
}

