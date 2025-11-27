import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { useData } from '../hooks/useData'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Configurar iconos personalizados para diferentes estados
const createCustomIcon = (estado) => {
  const colors = {
    ACTIVO: '#22c55e',     // Verde
    MANTENIMIENTO: '#eab308', // Amarillo
    INACTIVO: '#ef4444'    // Rojo
  }
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${colors[estado]};
        border: 3px solid white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })
}

export function MapView() {
  const { cruces } = useData()
  const [selectedCruce, setSelectedCruce] = useState(null)
  const [showRadius, setShowRadius] = useState(false)

  // Centro del mapa en Chile (región de Coquimbo)
  const mapCenter = [-30.0, -71.0]

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'ACTIVO': return 'text-green-600'
      case 'MANTENIMIENTO': return 'text-yellow-600'
      case 'INACTIVO': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getBatteryColor = (nivel) => {
    if (nivel >= 70) return 'text-green-600'
    if (nivel >= 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Mapa de Cruces</h2>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showRadius}
              onChange={(e) => setShowRadius(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Mostrar radio de cobertura
            </span>
          </label>
        </div>
      </div>

      {/* Leyenda */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Leyenda</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Activo</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Mantenimiento</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Inactivo</span>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div style={{ height: '600px', width: '100%' }}>
          <MapContainer
            center={mapCenter}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
            className="rounded-xl"
          >
            {/* Capa de mapa base */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Marcadores de cruces */}
            {cruces.map((cruce) => (
              <React.Fragment key={cruce.id_cruce}>
                <Marker
                  position={[cruce.coordenadas?.lat || -30.0, cruce.coordenadas?.lng || -71.0]}
                  icon={createCustomIcon(cruce.estado)}
                  eventHandlers={{
                    click: () => setSelectedCruce(cruce)
                  }}
                >
                  <Popup>
                    <div className="p-0 min-w-[200px] max-w-[240px]">
                      {/* Header con gradiente según estado */}
                      <div className={`px-3 py-2 rounded-t-lg ${
                        cruce.estado === 'ACTIVO' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                        cruce.estado === 'MANTENIMIENTO' ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                        'bg-gradient-to-r from-rose-500 to-red-600'
                      }`}>
                        <h3 className="font-bold text-sm text-white mb-1 truncate">
                        {cruce.nombre}
                      </h3>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 inline-block`}>
                            {cruce.estado}
                          </span>
                        </div>
                        
                      {/* Contenido */}
                      <div className="p-2.5 space-y-2 bg-white dark:bg-gray-800">
                        {/* Estado General - Compacto */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                              <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">Batería</p>
                              <p className={`text-xs font-semibold ${getBatteryColor(cruce.bateria)}`}>
                                {cruce.bateria || 0}%
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                              <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">Sensores</p>
                              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                {cruce.sensoresActivos || 0}/{cruce.totalSensores || cruce.total_sensores || cruce.sensores?.length || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Ubicación - Compacto */}
                        <div className="flex items-start gap-1.5 pt-1.5 border-t border-gray-200 dark:border-gray-700">
                          <div className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Ubicación</p>
                            <p className="text-xs text-gray-900 dark:text-white break-words leading-tight line-clamp-2">
                              {cruce.ubicacion || 'No especificada'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Responsable - Compacto */}
                        <div className="flex items-start gap-1.5">
                          <div className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Responsable</p>
                            <p className="text-xs text-gray-900 dark:text-white truncate">
                              {cruce.responsable_nombre || cruce.responsable || 'Sin asignar'}
                          </p>
                          </div>
                        </div>
                        
                        {/* Botón Ver Detalles - Compacto */}
                        <div className="pt-1.5 border-t border-gray-200 dark:border-gray-700">
                          <button 
                            onClick={() => window.open(`/cruce/${cruce.id_cruce}`, '_blank')}
                            className="w-full px-2.5 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Ver Detalles
                          </button>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Radio de cobertura (opcional) */}
                {showRadius && (
                  <Circle
                    center={[cruce.coordenadas?.lat || -30.0, cruce.coordenadas?.lng || -71.0]}
                    radius={500} // 500 metros de radio
                    pathOptions={{
                      color: cruce.estado === 'ACTIVO' ? '#22c55e' : 
                             cruce.estado === 'MANTENIMIENTO' ? '#eab308' : '#ef4444',
                      weight: 2,
                      opacity: 0.3,
                      fillOpacity: 0.1
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Panel lateral con información del cruce seleccionado */}
      {selectedCruce && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Información Detallada: {selectedCruce.nombre}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Estado General</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Estado:</span>
                  <span className={`font-semibold ${getStatusColor(selectedCruce.estado)}`}>
                    {selectedCruce.estado}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Batería:</span>
                  <span className={`font-semibold ${getBatteryColor(selectedCruce.bateria)}`}>
                    {selectedCruce.bateria}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sensores Activos:</span>
                  <span className="font-semibold">{selectedCruce.sensoresActivos || 0}/{selectedCruce.totalSensores || selectedCruce.total_sensores || selectedCruce.sensores?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Ubicación</h4>
              <div className="space-y-2 text-sm">
                <p>{selectedCruce.ubicacion}</p>
                <div className="flex justify-between">
                  <span>Latitud:</span>
                  <span className="font-mono">{selectedCruce.coordenadas?.lat || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Longitud:</span>
                  <span className="font-mono">{selectedCruce.coordenadas?.lng || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Contacto</h4>
              <div className="space-y-2 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedCruce.responsable_nombre || selectedCruce.responsable || 'Sin asignar'}
                    </span>
                  </div>
                  {selectedCruce.responsable_empresa && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {selectedCruce.responsable_empresa}
                      </span>
                    </div>
                  )}
                  {(selectedCruce.responsable_telefono || selectedCruce.telefono) && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.135a11.042 11.042 0 005.516 5.516l1.135-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-400">
                        {selectedCruce.responsable_telefono || selectedCruce.telefono}
                      </span>
                    </div>
                  )}
                  {selectedCruce.responsable_email && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-blue-600 dark:text-blue-400 break-words">
                        {selectedCruce.responsable_email}
                      </span>
                    </div>
                  )}
                  {selectedCruce.responsable_horario && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-400">
                        {selectedCruce.responsable_horario}
                      </span>
                    </div>
                  )}
                </div>
                <div className="pt-2">
                  <a 
                    href={`/cruce/${selectedCruce.id_cruce}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver Dashboard Completo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 