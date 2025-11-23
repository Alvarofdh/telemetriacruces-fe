import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../hooks/useData'
import toast from 'react-hot-toast'

export function SystemConfig() {
	const navigate = useNavigate()
	const { configuracion, setConfiguracion } = useData()
	const [config, setConfig] = useState(configuracion)
	const [unsavedChanges, setUnsavedChanges] = useState(false)

  const handleChange = (key, value) => {
    setConfig({ ...config, [key]: value })
    setUnsavedChanges(true)
  }

  const handleSave = () => {
    setConfiguracion(config)
    setUnsavedChanges(false)
    toast.success('Configuración guardada exitosamente')
  }

  const handleReset = () => {
    setConfig(configuracion)
    setUnsavedChanges(false)
  }

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div className="flex items-center space-x-4">
					<button
						onClick={() => navigate('/control')}
						className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 transition-colors"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						<span>Volver</span>
					</button>
					<h2 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración del Sistema</h2>
				</div>
				<div className="flex space-x-4">
          {unsavedChanges && (
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Descartar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!unsavedChanges}
            className={`px-6 py-2 rounded-lg transition-colors ${
              unsavedChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Guardar Cambios
          </button>
        </div>
      </div>

      {unsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Tienes cambios sin guardar. No olvides guardar tu configuración.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información General */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Sistema
              </label>
              <input
                type="text"
                value={config.nombre_sistema}
                onChange={(e) => handleChange('nombre_sistema', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Versión
              </label>
              <input
                type="text"
                value={config.version}
                onChange={(e) => handleChange('version', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notificaciones</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notificaciones por Email
              </span>
              <button
                onClick={() => handleChange('notificaciones_email', !config.notificaciones_email)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.notificaciones_email ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.notificaciones_email ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notificaciones por SMS
              </span>
              <button
                onClick={() => handleChange('notificaciones_sms', !config.notificaciones_sms)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.notificaciones_sms ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.notificaciones_sms ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Monitoreo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuración de Monitoreo</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Intervalo de Monitoreo (segundos)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={config.intervalo_monitoreo}
                onChange={(e) => handleChange('intervalo_monitoreo', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Umbral Batería Crítica (%)
              </label>
              <input
                type="number"
                min="5"
                max="30"
                value={config.umbral_bateria_critica}
                onChange={(e) => handleChange('umbral_bateria_critica', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Umbral Batería Baja (%)
              </label>
              <input
                type="number"
                min="30"
                max="70"
                value={config.umbral_bateria_baja}
                onChange={(e) => handleChange('umbral_bateria_baja', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Sistema */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuración del Sistema</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Backup Automático
              </span>
              <button
                onClick={() => handleChange('backup_automatico', !config.backup_automatico)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.backup_automatico ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.backup_automatico ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Horario de Mantenimiento
              </label>
              <input
                type="time"
                value={config.mantenimiento_programado}
                onChange={(e) => handleChange('mantenimiento_programado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 