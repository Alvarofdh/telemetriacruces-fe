import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { useData } from '../contexts/DataContext'
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
                    <div className="p-2 min-w-[200px]">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        {cruce.nombre}
                      </h3>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estado:</span>
                          <span className={`font-semibold ${getStatusColor(cruce.estado)}`}>
                            {cruce.estado}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Batería:</span>
                          <span className={`font-semibold ${getBatteryColor(cruce.bateria)}`}>
                            {cruce.bateria}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sensores:</span>
                          <span className="font-semibold text-blue-600">
                            {cruce.sensoresActivos}/4
                          </span>
                        </div>
                        
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-gray-600 text-xs">
                            📍 {cruce.ubicacion}
                          </p>
                          <p className="text-gray-600 text-xs mt-1">
                            👤 {cruce.responsable}
                          </p>
                        </div>
                        
                        <div className="pt-2">
                          <button 
                            onClick={() => window.open(`/cruce/${cruce.id_cruce}`, '_blank')}
                            className="w-full px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                          >
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
                  <span className="font-semibold">{selectedCruce.sensoresActivos}/4</span>
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
                <div>
                  <span className="block font-medium">{selectedCruce.responsable}</span>
                  <span className="text-gray-600 dark:text-gray-400">{selectedCruce.telefono}</span>
                </div>
                <div className="pt-2">
                  <a 
                    href={`/cruce/${selectedCruce.id_cruce}`}
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
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