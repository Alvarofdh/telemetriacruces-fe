// Servicio para gestión de configuración de notificaciones
import { http } from './httpClient'

/**
 * Obtener configuración de notificaciones del usuario autenticado
 * @returns {Promise<Object>} Configuración de notificaciones
 */
export const getNotificationSettings = async () => {
	return await http.get('/api/notification-settings')
}

/**
 * Actualizar configuración de notificaciones del usuario autenticado
 * @param {Object} settings - Configuración de notificaciones
 * @param {boolean} [settings.enable_notifications] - Activar notificaciones
 * @param {boolean} [settings.enable_push_notifications] - Notificaciones push
 * @param {boolean} [settings.enable_email_notifications] - Notificaciones por email
 * @param {boolean} [settings.notify_critical_alerts] - Alertas críticas
 * @param {boolean} [settings.notify_warning_alerts] - Alertas de advertencia
 * @param {boolean} [settings.notify_info_alerts] - Alertas informativas
 * @param {boolean} [settings.notify_barrier_events] - Eventos de barrera
 * @param {boolean} [settings.notify_battery_low] - Batería baja
 * @param {boolean} [settings.notify_communication_lost] - Comunicación perdida
 * @param {boolean} [settings.notify_gabinete_open] - Gabinete abierto
 * @param {string} [settings.notification_frequency] - Frecuencia (IMMEDIATE, HOURLY, DAILY, WEEKLY)
 * @returns {Promise<Object>} Configuración actualizada
 */
export const updateNotificationSettings = async (settings) => {
	return await http.put('/api/notification-settings', settings)
}
