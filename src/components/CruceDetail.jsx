import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Datos ampliados de los cruces con información detallada
const crucesDetallados = {
  1: {
    id_cruce: 1,
    nombre: 'Cruce La Serena',
    estado: 'ACTIVO',
    bateria: 92,
    sensoresActivos: 4,
    ubicacion: 'Km 472.5, Ruta 5 Norte',
    ultimaActividad: '2024-01-15 08:30',
    tipoTren: 'Carga',
    velocidadPromedio: 65,
    coordenadas: {
      latitud: -29.9027,
      longitud: -71.2495
    },
    instalacion: '2022-03-15',
    ultimoMantenimiento: '2024-01-10',
    proximoMantenimiento: '2024-02-10',
    historicoTrafico: [
      { fecha: '2024-01-15', trenes: 12, velocidadMax: 75 },
      { fecha: '2024-01-14', trenes: 8, velocidadMax: 70 },
      { fecha: '2024-01-13', trenes: 15, velocidadMax: 80 },
      { fecha: '2024-01-12', trenes: 10, velocidadMax: 65 },
      { fecha: '2024-01-11', trenes: 14, velocidadMax: 72 }
    ],
    sensores: [
      { id: 1, tipo: 'Proximidad', estado: 'ACTIVO', ubicacion: 'Norte' },
      { id: 2, tipo: 'Velocidad', estado: 'ACTIVO', ubicacion: 'Centro' },
      { id: 3, tipo: 'Peso', estado: 'ACTIVO', ubicacion: 'Sur' },
      { id: 4, tipo: 'Barrera', estado: 'ACTIVO', ubicacion: 'Cruce' }
    ],
    configuracion: {
      tiempoAlerta: 30,
      velocidadMaxima: 80,
      tiempoBarrera: 15,
      modoOperacion: 'Automático'
    },
    contacto: {
      responsable: 'Juan Pérez',
      telefono: '+56 9 8765 4321',
      email: 'juan.perez@ferrocarriles.cl'
    }
  },
  2: {
    id_cruce: 2,
    nombre: 'Cruce Coquimbo',
    estado: 'MANTENIMIENTO',
    bateria: 56,
    sensoresActivos: 2,
    ubicacion: 'Km 485.2, Ruta 5 Norte',
    ultimaActividad: '2024-01-14 14:20',
    tipoTren: 'Pasajeros',
    velocidadPromedio: 45,
    coordenadas: {
      latitud: -29.9533,
      longitud: -71.3436
    },
    instalacion: '2021-11-20',
    ultimoMantenimiento: '2024-01-13',
    proximoMantenimiento: '2024-01-20',
    historicoTrafico: [
      { fecha: '2024-01-14', trenes: 6, velocidadMax: 50 },
      { fecha: '2024-01-13', trenes: 4, velocidadMax: 45 },
      { fecha: '2024-01-12', trenes: 8, velocidadMax: 55 },
      { fecha: '2024-01-11', trenes: 7, velocidadMax: 48 },
      { fecha: '2024-01-10', trenes: 9, velocidadMax: 52 }
    ],
    sensores: [
      { id: 1, tipo: 'Proximidad', estado: 'ACTIVO', ubicacion: 'Norte' },
      { id: 2, tipo: 'Velocidad', estado: 'MANTENIMIENTO', ubicacion: 'Centro' },
      { id: 3, tipo: 'Peso', estado: 'MANTENIMIENTO', ubicacion: 'Sur' },
      { id: 4, tipo: 'Barrera', estado: 'ACTIVO', ubicacion: 'Cruce' }
    ],
    configuracion: {
      tiempoAlerta: 25,
      velocidadMaxima: 60,
      tiempoBarrera: 12,
      modoOperacion: 'Manual'
    },
    contacto: {
      responsable: 'María González',
      telefono: '+56 9 7654 3210',
      email: 'maria.gonzalez@ferrocarriles.cl'
    }
  }
};

export function CruceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cruce, setCruce] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const cruceData = crucesDetallados[parseInt(id)];
    if (cruceData) {
      setCruce(cruceData);
    }
  }, [id]);

  if (!cruce) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando información del cruce...</p>
        </div>
      </div>
    );
  }

  const getEstadoStyles = (estado) => {
    switch (estado) {
      case 'ACTIVO':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700';
      case 'MANTENIMIENTO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700';
      case 'INACTIVO':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getBateriaColor = (nivel) => {
    if (nivel >= 70) return 'text-green-600 dark:text-green-400';
    if (nivel >= 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '📊' },
    { id: 'sensores', label: 'Sensores', icon: '🔧' },
    { id: 'trafico', label: 'Tráfico', icon: '🚆' },
    { id: 'ubicacion', label: 'Ubicación', icon: '📍' },
    { id: 'contacto', label: 'Contacto', icon: '👤' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Volver</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{cruce.nombre}</h1>
                <p className="text-gray-600 dark:text-gray-300">{cruce.ubicacion}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getEstadoStyles(cruce.estado)}`}>
                {cruce.estado}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Batería</p>
                <p className={`text-2xl font-bold ${getBateriaColor(cruce.bateria)}`}>
                  {cruce.bateria}%
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sensores Activos</p>
                <p className="text-2xl font-bold text-gray-900">{cruce.sensoresActivos}/4</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Velocidad Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{cruce.velocidadPromedio} km/h</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Última Actividad</p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(cruce.ultimaActividad).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación por Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Contenido de los Tabs */}
          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Instalación</label>
                      <p className="mt-1 text-sm text-gray-900">{formatearFecha(cruce.instalacion)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Último Mantenimiento</label>
                      <p className="mt-1 text-sm text-gray-900">{formatearFecha(cruce.ultimoMantenimiento)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Próximo Mantenimiento</label>
                      <p className="mt-1 text-sm text-gray-900">{formatearFecha(cruce.proximoMantenimiento)}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Configuración</label>
                      <div className="mt-1 space-y-2">
                        <p className="text-sm text-gray-900">Tiempo de alerta: {cruce.configuracion.tiempoAlerta}s</p>
                        <p className="text-sm text-gray-900">Velocidad máxima: {cruce.configuracion.velocidadMaxima} km/h</p>
                        <p className="text-sm text-gray-900">Tiempo de barrera: {cruce.configuracion.tiempoBarrera}s</p>
                        <p className="text-sm text-gray-900">Modo: {cruce.configuracion.modoOperacion}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sensores' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Sensores</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cruce.sensores.map((sensor) => (
                    <div key={sensor.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{sensor.tipo}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoStyles(sensor.estado)}`}>
                          {sensor.estado}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Ubicación: {sensor.ubicacion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'trafico' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Tráfico</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trenes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Velocidad Máxima</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cruce.historicoTrafico.map((dia, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(dia.fecha).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dia.trenes}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dia.velocidadMax} km/h</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'ubicacion' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación y Coordenadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Dirección</label>
                      <p className="mt-1 text-sm text-gray-900">{cruce.ubicacion}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Latitud</label>
                      <p className="mt-1 text-sm text-gray-900">{cruce.coordenadas.latitud}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Longitud</label>
                      <p className="mt-1 text-sm text-gray-900">{cruce.coordenadas.longitud}</p>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">Mapa interactivo</p>
                      <p className="text-xs text-gray-400">(Próximamente)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contacto' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Responsable</label>
                      <p className="mt-1 text-sm text-gray-900">{cruce.contacto.responsable}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <p className="mt-1 text-sm text-gray-900">{cruce.contacto.telefono}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                      <p className="mt-1 text-sm text-gray-900">{cruce.contacto.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 