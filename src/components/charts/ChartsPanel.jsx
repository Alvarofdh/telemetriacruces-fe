import React, { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import {
  Line,
  Bar,
  Doughnut,
  Radar,
  PolarArea,
  Scatter
} from 'react-chartjs-2'
import { useData } from '../../hooks/useData'

// Registrar todos los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export function ChartsPanel() {
  const { cruces } = useData()
  const [timeRange, setTimeRange] = useState('7days')

  // Configuración de opciones comunes
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#374151',
          font: {
            size: 12
          }
        }
      }
    }
  }

  // Datos para gráfico de estados de cruces (Doughnut)
  const estadosData = {
    labels: ['Activos', 'En Mantenimiento', 'Inactivos'],
    datasets: [
      {
        data: [
          cruces.filter(c => c.estado === 'ACTIVO').length,
          cruces.filter(c => c.estado === 'MANTENIMIENTO').length,
          cruces.filter(c => c.estado === 'INACTIVO').length,
        ],
        backgroundColor: [
          '#22c55e',
          '#eab308',
          '#ef4444',
        ],
        borderColor: [
          '#16a34a',
          '#ca8a04',
          '#dc2626',
        ],
        borderWidth: 2
      }
    ]
  }

  // Datos para gráfico de niveles de batería (Bar)
  const bateriaData = {
    labels: cruces.map(c => c.nombre.replace('Cruce ', '')),
    datasets: [
      {
        label: 'Nivel de Batería (%)',
        data: cruces.map(c => c.bateria),
        backgroundColor: cruces.map(c => {
          if (c.bateria >= 80) return 'rgba(34, 197, 94, 0.8)'
          if (c.bateria >= 50) return 'rgba(234, 179, 8, 0.8)'
          if (c.bateria >= 20) return 'rgba(249, 115, 22, 0.8)'
          return 'rgba(239, 68, 68, 0.8)'
        }),
        borderColor: cruces.map(c => {
          if (c.bateria >= 80) return '#16a34a'
          if (c.bateria >= 50) return '#ca8a04'
          if (c.bateria >= 20) return '#ea580c'
          return '#dc2626'
        }),
        borderWidth: 2
      }
    ]
  }

  // Datos simulados para tendencias de actividad (Line)
  const generateTrendData = () => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toLocaleDateString('es-CL', { month: 'short', day: 'numeric' })
    })

    return {
      labels: days,
      datasets: [
        {
          label: 'Activaciones Diarias',
          data: days.map(() => Math.floor(Math.random() * 50) + 10),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Alertas',
          data: days.map(() => Math.floor(Math.random() * 10)),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Análisis y Gráficos</h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="1day">Último día</option>
            <option value="7days">Últimos 7 días</option>
            <option value="30days">Últimos 30 días</option>
            <option value="90days">Últimos 90 días</option>
          </select>
        </div>
      </div>

      {/* Grid de gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Estados (Doughnut) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Estado de Cruces
          </h3>
          <div style={{ height: '300px' }}>
            <Doughnut data={estadosData} options={commonOptions} />
          </div>
        </div>

        {/* Gráfico de Niveles de Batería (Bar) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Niveles de Batería
          </h3>
          <div style={{ height: '300px' }}>
            <Bar data={bateriaData} options={commonOptions} />
          </div>
        </div>

        {/* Tendencias de Actividad (Line) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Tendencias de Actividad (30 días)
          </h3>
          <div style={{ height: '300px' }}>
            <Line data={generateTrendData()} options={commonOptions} />
          </div>
        </div>

        {/* Análisis de Sensores (Bar horizontal) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Sensores Activos por Cruce
          </h3>
          <div style={{ height: '300px' }}>
            <Bar 
              data={{
                labels: cruces.map(c => c.nombre.replace('Cruce ', '')),
                datasets: [
                  {
                    label: 'Sensores Activos',
                    data: cruces.map(c => c.sensoresActivos),
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: '#16a34a',
                    borderWidth: 2
                  }
                ]
              }} 
              options={{
                ...commonOptions,
                indexAxis: 'y'
              }} 
            />
          </div>
        </div>
      </div>

      {/* Métricas resumidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {cruces.reduce((acc, c) => acc + c.sensoresActivos, 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Sensores Totales
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Math.round(cruces.reduce((acc, c) => acc + c.bateria, 0) / cruces.length)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Batería Promedio
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {cruces.filter(c => c.estado === 'ACTIVO').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Cruces Activos
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            98.5%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Uptime Promedio
          </div>
        </div>
      </div>
    </div>
  )
} 