// src/components/CrossingList.jsx
import React from 'react'
import { CrossingCard } from './Crossingcard'

const sampleCruces = [
  {
    id_cruce: 1,
    nombre: 'Cruce La Serena',
    estado: 'ACTIVO',
    bateria: 92,
    sensoresActivos: 4,
    ubicacion: 'Km 472.5, Ruta 5 Norte',
    ultimaActividad: '2024-01-15 08:30',
    tipoTren: 'Carga',
    velocidadPromedio: 65
  },
  {
    id_cruce: 2,
    nombre: 'Cruce Coquimbo',
    estado: 'MANTENIMIENTO',
    bateria: 56,
    sensoresActivos: 2,
    ubicacion: 'Km 485.2, Ruta 5 Norte',
    ultimaActividad: '2024-01-14 14:20',
    tipoTren: 'Pasajeros',
    velocidadPromedio: 45
  },
  {
    id_cruce: 3,
    nombre: 'Cruce Ovalle',
    estado: 'ACTIVO',
    bateria: 78,
    sensoresActivos: 3,
    ubicacion: 'Km 412.8, Ruta 43',
    ultimaActividad: '2024-01-15 09:15',
    tipoTren: 'Mixto',
    velocidadPromedio: 55
  },
  {
    id_cruce: 4,
    nombre: 'Cruce Vicuña',
    estado: 'ACTIVO',
    bateria: 65,
    sensoresActivos: 1,
    ubicacion: 'Km 398.1, Ruta 41',
    ultimaActividad: '2024-01-15 07:45',
    tipoTren: 'Carga',
    velocidadPromedio: 70
  },
  {
    id_cruce: 5,
    nombre: 'Cruce Illapel',
    estado: 'INACTIVO',
    bateria: 15,
    sensoresActivos: 0,
    ubicacion: 'Km 234.7, Ruta 31',
    ultimaActividad: '2024-01-12 16:30',
    tipoTren: 'N/A',
    velocidadPromedio: 0
  },
  {
    id_cruce: 6,
    nombre: 'Cruce Los Vilos',
    estado: 'ACTIVO',
    bateria: 89,
    sensoresActivos: 4,
    ubicacion: 'Km 287.3, Ruta 5 Norte',
    ultimaActividad: '2024-01-15 09:50',
    tipoTren: 'Pasajeros',
    velocidadPromedio: 50
  },
  {
    id_cruce: 7,
    nombre: 'Cruce Salamanca',
    estado: 'MANTENIMIENTO',
    bateria: 34,
    sensoresActivos: 1,
    ubicacion: 'Km 256.9, Ruta 43',
    ultimaActividad: '2024-01-13 11:20',
    tipoTren: 'Carga',
    velocidadPromedio: 30
  },
  {
    id_cruce: 8,
    nombre: 'Cruce Combarbalá',
    estado: 'ACTIVO',
    bateria: 91,
    sensoresActivos: 3,
    ubicacion: 'Km 345.6, Ruta 43',
    ultimaActividad: '2024-01-15 08:55',
    tipoTren: 'Mixto',
    velocidadPromedio: 60
  }
]

export function CrossingList({ searchTerm, filterStatus }) {
  // Filtrar cruces basado en búsqueda y estado
  const filteredCruces = sampleCruces.filter(cruce => {
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
          <h2 className="text-2xl font-bold text-gray-900">
            Cruces Ferroviarios
          </h2>
          <p className="text-gray-600 mt-1">
            Mostrando {filteredCruces.length} de {sampleCruces.length} cruces
            {searchTerm && ` para "${searchTerm}"`}
            {filterStatus !== 'TODOS' && ` con estado ${filterStatus}`}
          </p>
        </div>
        
        {/* Indicador de estado general */}
        <div className="flex items-center space-x-2 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">En línea</span>
          </div>
          <div className="text-gray-400">•</div>
          <span className="text-gray-600">
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
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No se encontraron cruces</h3>
          <p className="mt-2 text-gray-500">
            No hay cruces que coincidan con los filtros seleccionados.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}
