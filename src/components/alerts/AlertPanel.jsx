import React, { useState } from 'react';

export function AlertPanel() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      tipo: 'CRITICO',
      mensaje: 'Cruce Illapel: Batería crítica (15%)',
      timestamp: '2024-01-15 09:45',
      leido: false,
      cruce: 'Cruce Illapel'
    },
    {
      id: 2,
      tipo: 'ADVERTENCIA',
      mensaje: 'Cruce Salamanca: Sensor 3 desconectado',
      timestamp: '2024-01-15 08:30',
      leido: false,
      cruce: 'Cruce Salamanca'
    },
    {
      id: 3,
      tipo: 'INFO',
      mensaje: 'Mantenimiento programado completado',
      timestamp: '2024-01-15 07:00',
      leido: true,
      cruce: 'Cruce Coquimbo'
    },
    {
      id: 4,
      tipo: 'ADVERTENCIA',
      mensaje: 'Velocidad elevada detectada (85 km/h)',
      timestamp: '2024-01-15 06:15',
      leido: true,
      cruce: 'Cruce La Serena'
    }
  ]);

  const [mostrarTodas, setMostrarTodas] = useState(false);

  const marcarComoLeido = (id) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, leido: true } : alert
    ));
  };

  const getAlertaIcon = (tipo) => {
    switch (tipo) {
      case 'CRITICO':
        return (
          <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'ADVERTENCIA':
        return (
          <svg className="w-5 h-5 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'INFO':
        return (
          <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getAlertaStyles = (tipo) => {
    switch (tipo) {
      case 'CRITICO':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'ADVERTENCIA':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'INFO':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-700/20';
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const alertasNoLeidas = alerts.filter(alert => !alert.leido);
  const alertasAMostrar = mostrarTodas ? alerts : alerts.slice(0, 3);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header del panel */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-600 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-600">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V3h0z" />
            </svg>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">Centro de Alertas</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">Notificaciones del sistema</p>
            </div>
          </div>
          {alertasNoLeidas.length > 0 && (
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {alertasNoLeidas.length}
              </span>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">sin leer</span>
            </div>
          )}
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {alertasAMostrar.length > 0 ? (
          alertasAMostrar.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-4 p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${getAlertaStyles(alert.tipo)} ${
                !alert.leido ? 'bg-opacity-80' : 'bg-opacity-30'
              }`}
              onClick={() => marcarComoLeido(alert.id)}
            >
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="flex-shrink-0">
                  {getAlertaIcon(alert.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs sm:text-sm ${!alert.leido ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'} break-words`}>
                      {alert.mensaje}
                    </p>
                    {!alert.leido && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1.5 sm:mt-1 gap-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{alert.cruce}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatearFecha(alert.timestamp)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Sin alertas</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Todos los sistemas funcionan correctamente.</p>
          </div>
        )}
      </div>

      {/* Footer del panel */}
      {alerts.length > 3 && (
        <div className="bg-gray-50 dark:bg-gray-700 px-4 sm:px-6 py-2 sm:py-3 border-t border-gray-100 dark:border-gray-600">
          <button
            onClick={() => setMostrarTodas(!mostrarTodas)}
            className="w-full text-center text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            {mostrarTodas ? 'Mostrar menos' : `Ver todas (${alerts.length})`}
          </button>
        </div>
      )}
    </div>
  );
} 