// src/components/CrossingCard.jsx
import React, { useState } from 'react';

export function CrossingCard({ 
  nombre, 
  estado, 
  bateria, 
  sensores, 
  ubicacion, 
  ultimaActividad, 
  tipoTren, 
  velocidadPromedio 
}) {
  const [showDetails, setShowDetails] = useState(false);

  // Función para obtener estilos del estado
  const getEstadoStyles = (estado) => {
    switch (estado) {
      case 'ACTIVO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MANTENIMIENTO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'INACTIVO':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Función para obtener color de la batería
  const getBateriaColor = (nivel) => {
    if (nivel >= 70) return 'text-green-600';
    if (nivel >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Función para obtener icono del estado
  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'ACTIVO':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'MANTENIMIENTO':
        return (
          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'INACTIVO':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
      {/* Header de la tarjeta */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 truncate">{nombre}</h3>
          <div className="flex items-center space-x-2">
            {getEstadoIcon(estado)}
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getEstadoStyles(estado)}`}>
              {estado}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1 truncate">{ubicacion}</p>
      </div>

      {/* Contenido principal */}
      <div className="p-6 space-y-4">
        {/* Información principal en grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Batería */}
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div>
              <p className="text-xs text-gray-500">Batería</p>
              <p className={`text-sm font-bold ${getBateriaColor(bateria)}`}>
                {bateria}%
              </p>
            </div>
          </div>

          {/* Sensores */}
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <p className="text-xs text-gray-500">Sensores</p>
              <p className="text-sm font-bold text-gray-900">
                {sensores}/4
              </p>
            </div>
          </div>
        </div>

        {/* Barra de progreso de batería */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              bateria >= 70 ? 'bg-green-500' : 
              bateria >= 30 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.max(bateria, 0)}%` }}
          ></div>
        </div>

        {/* Información adicional */}
        {showDetails && (
          <div className="space-y-3 pt-3 border-t border-gray-100 fade-in">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Última actividad:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formatearFecha(ultimaActividad)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Tipo de tren:</span>
                <span className="ml-2 font-medium text-gray-900">{tipoTren}</span>
              </div>
              <div>
                <span className="text-gray-500">Velocidad promedio:</span>
                <span className="ml-2 font-medium text-gray-900">{velocidadPromedio} km/h</span>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            {showDetails ? 'Ocultar' : 'Ver detalles'}
          </button>
          
          {estado === 'ACTIVO' && (
            <button className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Indicador de estado en el borde inferior */}
      <div className={`h-1 w-full ${
        estado === 'ACTIVO' ? 'bg-green-500' :
        estado === 'MANTENIMIENTO' ? 'bg-yellow-500' : 'bg-red-500'
      }`}></div>
    </div>
  );
}
