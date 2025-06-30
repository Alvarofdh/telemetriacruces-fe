// src/components/CrossingList.jsx
import React from 'react'
import { CrossingCard } from './Crossingcard'
import { useData } from '../contexts/DataContext'

export function CrossingList({ searchTerm, filterStatus }) {
  const { cruces } = useData()
  
  // Filtrar cruces basado en búsqueda y estado
  const filteredCruces = cruces.filter(cruce => {
    const matchesSearch = cruce.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cruce.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'TODOS' || cruce.estado === filterStatus
    
    return matchesSearch && matchesFilter
  })

  // Ordenar por estado (activos primero) y luego por nombre
  const sortedCruces = [...filteredCruces].sort((a, b) => {
    if (a.estado === 'ACTIVO' && b.estado !== 'ACTIVO') return -1
    if (a.estado !== 'ACTIVO' && b.estado === 'ACTIVO') return 1
    return a.nombre.localeCompare(b.nombre)
  })

  return (
    <div className="space-y-6">
      {/* Encabezado de resultados */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cruces Ferroviarios
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Mostrando {filteredCruces.length} de {cruces.length} cruces
            {searchTerm && ` para "${searchTerm}"`}
            {filterStatus !== 'TODOS' && ` con estado ${filterStatus}`}
          </p>
        </div>
        
        {/* Indicador de estado general */}
        <div className="flex items-center space-x-2 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-300">En línea</span>
          </div>
          <div className="text-gray-400 dark:text-gray-500">•</div>
          <span className="text-gray-600 dark:text-gray-300">
            {sortedCruces.filter(c => c.estado === 'ACTIVO').length} activos
          </span>
        </div>
      </div>

      {/* Grid de tarjetas */}
      {sortedCruces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            No hay cruces que coincidan con los filtros seleccionados.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}
