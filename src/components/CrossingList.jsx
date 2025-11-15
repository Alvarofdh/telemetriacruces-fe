// src/components/CrossingList.jsx
import React, { useMemo, useState } from 'react'
import { CrossingCard } from './Crossingcard'
import { useData } from '../hooks/useData'
import { useDebounce } from '../hooks/useDebounce'

export function CrossingList() {
  const { cruces } = useData()
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [busqueda, setBusqueda] = useState('')
  const busquedaDebounced = useDebounce(busqueda, 300)

  // Filtrar por estado y búsqueda
  const crucesFiltrados = useMemo(() => {
    let resultado = cruces

    // Filtrar por estado
    if (filtroEstado !== 'TODOS') {
      resultado = resultado.filter(c => c.estado === filtroEstado)
    }

    // Filtrar por búsqueda
    if (busquedaDebounced.trim()) {
      const searchLower = busquedaDebounced.toLowerCase().trim()
      resultado = resultado.filter(c => 
        c.nombre.toLowerCase().includes(searchLower) ||
        c.ubicacion.toLowerCase().includes(searchLower)
      )
    }

    return resultado
  }, [cruces, filtroEstado, busquedaDebounced])

  // Ordenar por estado (activos primero) y luego por nombre (memoizado)
  const sortedCruces = useMemo(() => {
    return [...crucesFiltrados].sort((a, b) => {
      if (a.estado === 'ACTIVO' && b.estado !== 'ACTIVO') return -1
      if (a.estado !== 'ACTIVO' && b.estado === 'ACTIVO') return 1
      return a.nombre.localeCompare(b.nombre)
    })
  }, [crucesFiltrados])

  // Calcular estadísticas (memoizado)
  const stats = useMemo(() => {
    const activos = cruces.filter(c => c.estado === 'ACTIVO').length
    const mantenimiento = cruces.filter(c => c.estado === 'MANTENIMIENTO').length
    const inactivos = cruces.filter(c => c.estado === 'INACTIVO').length
    return { 
      activos, 
      mantenimiento, 
      inactivos, 
      total: cruces.length,
      filtrados: sortedCruces.length
    }
  }, [cruces, sortedCruces.length])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Encabezado de resultados */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Cruces Ferroviarios
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
            {filtroEstado === 'TODOS' 
              ? `Mostrando ${stats.total} cruces en total`
              : `Mostrando ${stats.filtrados} de ${stats.total} cruces`
            }
          </p>
        </div>
        
        {/* Indicador de estado general */}
        <div className="flex items-center space-x-2 text-xs sm:text-sm whitespace-nowrap">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-300">En línea</span>
          </div>
          <div className="text-gray-400 dark:text-gray-500 hidden sm:inline">•</div>
          <span className="text-gray-600 dark:text-gray-300">
            {stats.activos} activos
          </span>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <label htmlFor="busqueda" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Buscar:
          </label>
          <div className="relative w-full sm:flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="busqueda"
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o ubicación..."
              className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
              aria-label="Buscar cruces por nombre o ubicación"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Limpiar búsqueda"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros de estado */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Filtrar por estado:
          </span>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFiltroEstado('TODOS')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                filtroEstado === 'TODOS'
                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Todos ({stats.total})
            </button>
            <button
              onClick={() => setFiltroEstado('ACTIVO')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                filtroEstado === 'ACTIVO'
                  ? 'bg-green-600 text-white shadow-md hover:bg-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${filtroEstado === 'ACTIVO' ? 'bg-white' : 'bg-green-500'}`}></div>
              <span>Activos ({stats.activos})</span>
            </button>
            <button
              onClick={() => setFiltroEstado('MANTENIMIENTO')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                filtroEstado === 'MANTENIMIENTO'
                  ? 'bg-yellow-600 text-white shadow-md hover:bg-yellow-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${filtroEstado === 'MANTENIMIENTO' ? 'bg-white' : 'bg-yellow-500'}`}></div>
              <span>Mantenimiento ({stats.mantenimiento})</span>
            </button>
            <button
              onClick={() => setFiltroEstado('INACTIVO')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                filtroEstado === 'INACTIVO'
                  ? 'bg-red-600 text-white shadow-md hover:bg-red-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${filtroEstado === 'INACTIVO' ? 'bg-white' : 'bg-red-500'}`}></div>
              <span>Inactivos ({stats.inactivos})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid de tarjetas */}
      {sortedCruces.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-5 lg:gap-6 xl:gap-8">
          {sortedCruces.map((cruce, index) => (
            <div 
              key={cruce.id_cruce} 
              className="fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CrossingCard
                id_cruce={cruce.id_cruce}
                nombre={cruce.nombre}
                estado={cruce.estado}
                bateria={cruce.bateria}
                sensores={cruce.sensoresActivos}
                ubicacion={cruce.ubicacion}
                ultimaActividad={cruce.ultimaActividad}
                tipoTren={cruce.tipoTren}
                velocidadPromedio={cruce.velocidadPromedio}
              />
            </div>
          ))}
        </div>
      ) : (
        // Estado vacío
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No se encontraron cruces</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {busqueda ? 
              `No hay cruces que coincidan con "${busqueda}"` :
              'No hay cruces que coincidan con los filtros seleccionados.'
            }
          </p>
          <button 
            onClick={() => {
              setBusqueda('')
              setFiltroEstado('TODOS')
            }} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}
