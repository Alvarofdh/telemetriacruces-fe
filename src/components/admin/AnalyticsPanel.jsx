import React, { useMemo } from 'react'
import { useData } from '../../hooks/useData'

export function AnalyticsPanel() {
  const { cruces, logs, stats, isLoading, isLoadingLogs } = useData()

  // Análisis por estado - usando datos reales del backend
  const estadisticasEstado = useMemo(() => ({
    activos: stats?.activos || 0,
    mantenimiento: stats?.mantenimiento || 0,
    inactivos: stats?.inactivos || 0,
    total: stats?.totalCruces || cruces?.length || 0
  }), [stats, cruces])

  // Análisis de batería - usando datos reales de los cruces
  const bateriaStats = useMemo(() => {
    if (!cruces || cruces.length === 0) {
      return {
        critica: 0,
        baja: 0,
        media: 0,
        alta: 0,
        sinDatos: 0
      }
    }
    
    return {
      critica: cruces.filter(c => (c.bateria || 0) <= 20).length,
      baja: cruces.filter(c => (c.bateria || 0) > 20 && (c.bateria || 0) <= 50).length,
      media: cruces.filter(c => (c.bateria || 0) > 50 && (c.bateria || 0) <= 80).length,
      alta: cruces.filter(c => (c.bateria || 0) > 80).length,
      sinDatos: cruces.filter(c => !c.bateria || c.bateria === 0).length
    }
  }, [cruces])

  // Análisis de actividad reciente - usando logs reales del backend
  const actividadReciente = useMemo(() => {
    if (!logs || logs.length === 0) return []
    return logs.slice(0, 10).map(log => ({
      id: log.id,
      accion: log.accion || log.action || 'Acción',
      detalle: log.detalle || log.detail || log.mensaje || log.message || 'Sin detalles',
      fecha: log.fecha || log.timestamp || log.created_at || new Date().toISOString(),
      usuario: log.usuario || log.user || 'Sistema'
    }))
  }, [logs])

  // Estadísticas adicionales calculadas desde los cruces reales
  const estadisticasAdicionales = useMemo(() => {
    if (!cruces || cruces.length === 0) {
      return {
        promedioBateria: 0,
        sensoresActivos: 0,
        alertasActivas: 0,
        crucesConTelemetria: 0
      }
    }

    const crucesConBateria = cruces.filter(c => c.bateria && c.bateria > 0)
    const promedioBateria = crucesConBateria.length > 0
      ? Math.round(crucesConBateria.reduce((acc, c) => acc + (c.bateria || 0), 0) / crucesConBateria.length)
      : 0

    const sensoresActivos = cruces.reduce((acc, c) => acc + (c.sensoresActivos || 0), 0)
    const alertasActivas = cruces.reduce((acc, c) => acc + (c.alertasActivas || 0), 0)
    const crucesConTelemetria = cruces.filter(c => c.telemetria || c.ultimaActividad).length

    return {
      promedioBateria,
      sensoresActivos,
      alertasActivas,
      crucesConTelemetria
    }
  }, [cruces])

  // Mostrar loading si los datos están cargando
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Análisis y Reportes</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600 dark:text-gray-400">Cargando datos...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Análisis y Reportes</h2>
      
      {/* Estadísticas de Estado */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Estado de Cruces</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{estadisticasEstado.activos}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Activos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{estadisticasEstado.mantenimiento}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Mantenimiento</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{estadisticasEstado.inactivos}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Inactivos</div>
          </div>
        </div>
        {estadisticasEstado.total > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total: <span className="font-semibold text-gray-900 dark:text-white">{estadisticasEstado.total}</span> cruces</div>
          </div>
        )}
      </div>

      {/* Análisis de Batería */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Niveles de Batería</h3>
        {cruces && cruces.length > 0 ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Crítica (≤20%)</span>
              <span className="font-semibold text-red-600 dark:text-red-400">{bateriaStats.critica} cruces</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Baja (21-50%)</span>
              <span className="font-semibold text-orange-600 dark:text-orange-400">{bateriaStats.baja} cruces</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Media (51-80%)</span>
              <span className="font-semibold text-yellow-600 dark:text-yellow-400">{bateriaStats.media} cruces</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Alta (&gt;80%)</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{bateriaStats.alta} cruces</span>
            </div>
            {bateriaStats.sinDatos > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-500">Sin datos de batería</span>
                <span className="font-semibold text-gray-500 dark:text-gray-400">{bateriaStats.sinDatos} cruces</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hay datos de cruces disponibles
          </div>
        )}
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actividad Reciente</h3>
        {isLoadingLogs ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Cargando logs...</p>
          </div>
        ) : actividadReciente.length > 0 ? (
          <div className="space-y-3">
            {actividadReciente.map(log => {
              const fecha = new Date(log.fecha)
              const fechaFormateada = fecha.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })
              
              return (
                <div key={log.id} className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-2 last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{log.accion}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{log.detalle}</div>
                    <div className="text-xs text-gray-400 mt-1">Por: {log.usuario}</div>
                  </div>
                  <div className="text-xs text-gray-400 ml-4 shrink-0">{fechaFormateada}</div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hay actividad reciente registrada
          </div>
        )}
      </div>

      {/* Resumen General */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumen del Sistema</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats?.totalCruces || estadisticasEstado.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Cruces</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats?.sensoresTotal || estadisticasAdicionales.sensoresActivos}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sensores Activos</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{stats?.promedioBateria || estadisticasAdicionales.promedioBateria}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Promedio Batería</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{stats?.usuariosActivos || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Usuarios Activos</div>
          </div>
        </div>
        
        {/* Estadísticas adicionales */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-lg font-bold text-red-600 dark:text-red-400">{estadisticasAdicionales.alertasActivas}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Alertas Activas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-teal-600 dark:text-teal-400">{estadisticasAdicionales.crucesConTelemetria}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Cruces con Telemetría</div>
          </div>
          <div className="text-center col-span-2 md:col-span-1">
            <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{bateriaStats.alta + bateriaStats.media}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Batería Óptima</div>
          </div>
        </div>
      </div>
    </div>
  )
} 