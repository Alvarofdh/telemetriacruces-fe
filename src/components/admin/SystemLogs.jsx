import React, { useState } from 'react'
import { useData } from '../../contexts/DataContext'

export function SystemLogs() {
  const { logs } = useData()
  const [filterAction, setFilterAction] = useState('TODOS')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLogs = logs.filter(log => {
    const matchesAction = filterAction === 'TODOS' || log.accion === filterAction
    const matchesSearch = log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.detalle.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Logs del Sistema</h2>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Total: {filteredLogs.length} registros
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por usuario o detalle..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {actions.map((action) => (
              <button
                key={action}
                onClick={() => setFilterAction(action)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Detalle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {log.fecha}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {log.usuario}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getActionBadge(log.accion)}>
                      {log.accion}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {log.detalle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLogs.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No se encontraron logs</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            No hay registros que coincidan con los filtros seleccionados.
          </p>
        </div>
      )}
    </div>
  )
} 