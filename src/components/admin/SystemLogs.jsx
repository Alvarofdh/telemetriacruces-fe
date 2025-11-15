import React, { useState, useEffect } from 'react'
import { useData } from '../../hooks/useData'
import { useDebounce } from '../../hooks/useDebounce'

export function SystemLogs() {
  const { 
    logs, 
    isLoadingLogs, 
    logsError,
    loadLogs 
  } = useData()
  const [filterAction, setFilterAction] = useState('TODOS')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Recargar logs cuando se monta el componente
  // Nota: loadLogs ya se llama desde DataContext cuando el usuario se autentica
  // Este useEffect solo se ejecuta una vez al montar el componente
  useEffect(() => {
    // Solo cargar si no hay logs y no está cargando
    if (!isLoadingLogs && logs.length === 0) {
      loadLogs()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Array vacío para ejecutar solo una vez

  // Recargar logs periódicamente (cada 30 segundos)
  // Usar una referencia estable para evitar recrear el intervalo
  useEffect(() => {
    const interval = setInterval(() => {
      // Solo recargar si no está cargando actualmente
      if (!isLoadingLogs) {
        loadLogs()
      }
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Array vacío para que el intervalo se cree solo una vez

  const filteredLogs = logs.filter(log => {
    if (!log) return false
    const matchesAction = filterAction === 'TODOS' || log.accion === filterAction
    const search = debouncedSearchTerm.toLowerCase()
    const usuario = (log.usuario || '').toLowerCase()
    const detalle = (log.detalle || '').toLowerCase()
    const matchesSearch = !search || usuario.includes(search) || detalle.includes(search)
    return matchesAction && matchesSearch
  })

  const getActionBadge = (accion) => {
    const styles = {
      LOGIN: 'bg-green-100 text-green-800',
      LOGOUT: 'bg-gray-100 text-gray-800',
      CREATE_CRUCE: 'bg-blue-100 text-blue-800',
      UPDATE_CRUCE: 'bg-yellow-100 text-yellow-800',
      DELETE_CRUCE: 'bg-red-100 text-red-800',
      CREATE_USER: 'bg-purple-100 text-purple-800',
      UPDATE_USER: 'bg-indigo-100 text-indigo-800',
      DELETE_USER: 'bg-red-100 text-red-800',
      MAINTENANCE: 'bg-orange-100 text-orange-800'
    }
    return `px-2 py-1 rounded-full text-xs font-medium ${styles[accion] || 'bg-gray-100 text-gray-800'}`
  }

  const actions = ['TODOS', 'LOGIN', 'LOGOUT', 'CREATE_CRUCE', 'UPDATE_CRUCE', 'DELETE_CRUCE', 'MAINTENANCE']

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Logs del Sistema</h2>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => loadLogs()}
            disabled={isLoadingLogs}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
          >
            {isLoadingLogs ? 'Actualizando...' : 'Actualizar'}
          </button>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
            Total: {filteredLogs.length}
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {logsError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">
            Error: {logsError}
          </p>
          <button
            onClick={loadLogs}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por usuario o detalle..."
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {actions.map((action) => (
              <button
                key={action}
                onClick={() => setFilterAction(action)}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  filterAction === action
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {isLoadingLogs ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Cargando logs...</p>
          </div>
        ) : (
          <>
            {/* Vista de tabla para desktop */}
            <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Usuario</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acción</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Detalle</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {log.fecha}
                  </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {log.usuario}
                  </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span className={getActionBadge(log.accion)}>
                      {log.accion}
                    </span>
                  </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {log.detalle}
                  </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

            {/* Vista de cards para móvil */}
            <div className="md:hidden space-y-2 sm:space-y-3 p-2 sm:p-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{log.usuario || 'Sistema'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {log.fecha ? (typeof log.fecha === 'string' ? new Date(log.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : log.fecha) : 'N/A'}
                      </div>
                    </div>
                    <span className={`${getActionBadge(log.accion)} flex-shrink-0`}>
                      {log.accion || 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 break-words">
                    {log.detalle || 'Sin detalles'}
                  </div>
                  {log.ip && log.ip !== 'N/A' && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      IP: {log.ip}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {!isLoadingLogs && filteredLogs.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No hay logs disponibles</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {logsError 
              ? `Error: ${logsError}` 
              : 'El endpoint de logs no está disponible en el backend actual. Los logs se registran automáticamente en el servidor.'}
          </p>
          {logsError && (
            <button
              onClick={loadLogs}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          )}
        </div>
      )}
    </div>
  )
} 