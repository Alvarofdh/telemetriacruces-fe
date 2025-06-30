import React from 'react'
import { useData } from '../../contexts/DataContext'

export function AnalyticsPanel() {
  const { cruces, logs, stats } = useData()

  // Análisis por estado
  const estadisticasEstado = {
    activos: stats.activos,
    mantenimiento: stats.mantenimiento,
    inactivos: stats.inactivos
  }

  // Análisis de batería
  const bateriaStats = {
    critica: cruces.filter(c => c.bateria <= 20).length,
    baja: cruces.filter(c => c.bateria > 20 && c.bateria <= 50).length,
    media: cruces.filter(c => c.bateria > 50 && c.bateria <= 80).length,
    alta: cruces.filter(c => c.bateria > 80).length
  }

  // Análisis de actividad reciente
  const actividadReciente = logs.slice(0, 5)

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Análisis y Reportes</h2>
      
      {/* Estadísticas de Estado */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Estado de Cruces</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{estadisticasEstado.activos}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Activos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{estadisticasEstado.mantenimiento}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Mantenimiento</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{estadisticasEstado.inactivos}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Inactivos</div>
          </div>
        </div>
      </div>

      {/* Análisis de Batería */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Niveles de Batería</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Crítica (≤20%)</span>
            <span className="font-semibold text-red-600">{bateriaStats.critica} cruces</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Baja (21-50%)</span>
            <span className="font-semibold text-orange-600">{bateriaStats.baja} cruces</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Media (51-80%)</span>
            <span className="font-semibold text-yellow-600">{bateriaStats.media} cruces</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Alta (>80%)</span>
            <span className="font-semibold text-green-600">{bateriaStats.alta} cruces</span>
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          {actividadReciente.map(log => (
            <div key={log.id} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{log.accion}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{log.detalle}</div>
              </div>
              <div className="text-xs text-gray-400">{log.fecha.split(' ')[1]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen General */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumen del Sistema</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{stats.totalCruces}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Cruces</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">{stats.sensoresTotal}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sensores Activos</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{stats.promedioBateria}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Promedio Batería</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-indigo-600">{stats.usuariosActivos}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Usuarios Activos</div>
          </div>
        </div>
      </div>
    </div>
  )
} 