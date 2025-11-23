import React, { useState } from 'react'
import { useData } from '../../hooks/useData'
import { useDebounce } from '../../hooks/useDebounce'
import CruceForm from '../cruces/CruceForm'
import CruceDeleteModal from '../cruces/CruceDeleteModal'
import { deleteCruce } from '../../services/cruces'
import toast from 'react-hot-toast'

// Iconos SVG profesionales
const ManagementIcons = {
	location: (className = "w-5 h-5") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
		</svg>
	),
	battery: (className = "w-5 h-5") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
		</svg>
	),
	sensor: (className = "w-5 h-5") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
		</svg>
	),
	user: (className = "w-5 h-5") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
		</svg>
	),
	edit: (className = "w-4 h-4") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
		</svg>
	),
	trash: (className = "w-4 h-4") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
		</svg>
	),
	search: (className = "w-5 h-5") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>
	),
	plus: (className = "w-5 h-5") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
		</svg>
	)
}

export function CruceManagement() {
  const { cruces, agregarCruce, actualizarCruce, eliminarCruce, loadESP32Data } = useData()
  const [showForm, setShowForm] = useState(false)
  const [editingCruce, setEditingCruce] = useState(null)
  const [deletingCruce, setDeletingCruce] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const filteredCruces = cruces.filter(cruce => {
    const search = debouncedSearchTerm.toLowerCase()
    return (
      cruce.nombre.toLowerCase().includes(search) ||
      cruce.ubicacion.toLowerCase().includes(search)
    )
  })

  const handleFormSuccess = async () => {
    setShowForm(false)
    setEditingCruce(null)
    // Recargar datos desde el contexto sin recargar la página
    await loadESP32Data(false)
  }

  const handleEdit = (cruce) => {
    setEditingCruce(cruce)
    setShowForm(true)
  }

  const handleDelete = (cruce) => {
    setDeletingCruce(cruce)
  }

  const handleDeleteConfirm = async () => {
    if (deletingCruce) {
      try {
        await deleteCruce(deletingCruce.id || deletingCruce.id_cruce)
        eliminarCruce(deletingCruce.id || deletingCruce.id_cruce)
        setDeletingCruce(null)
        toast.success('Cruce eliminado exitosamente')
      } catch (error) {
        console.error('Error al eliminar:', error)
        const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Error al eliminar cruce'
        toast.error(errorMsg)
      }
    }
  }

  // Función para obtener estilos del estado
  const getEstadoStyles = (estado) => {
    switch (estado) {
      case 'ACTIVO':
        return {
          badge: 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/40 dark:text-green-200 dark:border-green-700',
          gradient: 'from-green-50 to-emerald-50 border border-green-100 dark:from-green-900/25 dark:to-emerald-900/10 dark:border-green-800',
          icon: 'text-green-600 dark:text-green-300'
        }
      case 'MANTENIMIENTO':
        return {
          badge: 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700',
          gradient: 'from-yellow-50 to-amber-50 border border-amber-100 dark:from-amber-900/25 dark:to-yellow-900/10 dark:border-amber-800',
          icon: 'text-amber-500 dark:text-amber-300'
        }
      case 'INACTIVO':
        return {
          badge: 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-800',
          gradient: 'from-rose-50 to-red-50 border border-rose-100 dark:from-rose-900/25 dark:to-red-900/10 dark:border-rose-800',
          icon: 'text-rose-500 dark:text-rose-300'
        }
      default:
        return {
          badge: 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
          gradient: 'from-gray-50 to-slate-50 border border-gray-100 dark:from-gray-800/40 dark:to-slate-800/30 dark:border-gray-700',
          icon: 'text-slate-500 dark:text-slate-300'
        }
    }
  }

  // Función para obtener color de la batería
  const getBateriaColor = (nivel) => {
    if (nivel >= 70) return 'text-green-600 dark:text-green-400';
    if (nivel >= 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Función para obtener icono del estado
  const getEstadoIcon = (estado) => {
    const styles = getEstadoStyles(estado);
    switch (estado) {
      case 'ACTIVO':
        return (
          <svg className={`w-4 h-4 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'MANTENIMIENTO':
        return (
          <svg className={`w-4 h-4 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'INACTIVO':
        return (
          <svg className={`w-4 h-4 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Gestión de Cruces</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Administra y edita los cruces ferroviarios</p>
        </div>
        <button
          onClick={() => {
            setEditingCruce(null)
            setShowForm(true)
          }}
          className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600 font-medium shadow-md hover:shadow-lg"
        >
          <ManagementIcons.plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nuevo Cruce</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {/* Búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ManagementIcons.search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar cruces por nombre o ubicación..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Cruces */}
      {filteredCruces.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ManagementIcons.search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No se encontraron cruces
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay cruces registrados'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {filteredCruces.map((cruce) => {
            const estadoStyles = getEstadoStyles(cruce.estado);
            return (
              <div 
                key={cruce.id_cruce} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Header con gradiente */}
                <div className={`bg-gradient-to-r ${estadoStyles.gradient} px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl min-h-[4rem] flex items-center`}>
                  <div className="flex items-center justify-between gap-2 w-full">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white leading-tight flex-1 min-w-0 pr-3 uppercase tracking-normal break-words drop-shadow">
                      {cruce.nombre}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {getEstadoIcon(cruce.estado)}
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${estadoStyles.badge}`}>
                        {cruce.estado}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4 sm:p-6 space-y-3">
                  {/* Ubicación */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 flex items-center justify-center shrink-0 text-gray-600 dark:text-white">
                      <ManagementIcons.location className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-600 dark:text-white/70 uppercase tracking-[0.25em] mb-0.5">Ubicación</p>
                      <p className="text-sm text-gray-900 dark:text-white break-words leading-tight">{cruce.ubicacion || 'No especificada'}</p>
                    </div>
                  </div>

                  {/* Batería */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 flex items-center justify-center shrink-0 text-gray-600 dark:text-white">
                      <ManagementIcons.battery className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-600 dark:text-white/70 uppercase tracking-[0.25em] mb-0.5">Batería</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${getBateriaColor(cruce.bateria || 0)} drop-shadow`}>
                          {cruce.bateria || 0}%
                        </p>
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              (cruce.bateria || 0) >= 70 ? 'bg-green-400' :
                              (cruce.bateria || 0) >= 30 ? 'bg-amber-400' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(cruce.bateria || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sensores */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 flex items-center justify-center shrink-0 text-gray-600 dark:text-white">
                      <ManagementIcons.sensor className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-600 dark:text-white/70 uppercase tracking-[0.25em] mb-0.5">Sensores activos</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {cruce.sensoresActivos || 0} / 4 sensores
                      </p>
                    </div>
                  </div>

                  {/* Responsable */}
                  {(cruce.responsable_nombre ||
                    cruce.responsable ||
                    cruce.responsable_empresa ||
                    cruce.responsable_telefono ||
                    cruce.responsable_email ||
                    cruce.responsable_horario) && (
                    <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 flex items-center justify-center shrink-0 text-gray-600 dark:text-white">
                      <ManagementIcons.user className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-600 dark:text-white/70 uppercase tracking-[0.25em] mb-1">Responsable</p>
                      <div className="space-y-0.5 text-sm text-gray-900 dark:text-white">
                        <p className="font-semibold leading-tight">
                            {cruce.responsable_nombre || cruce.responsable || 'Sin asignar'}
                          </p>
                          {cruce.responsable_empresa && (
                          <p className="text-xs text-gray-600 dark:text-white/70">
                              {cruce.responsable_empresa}
                            </p>
                          )}
                          {cruce.responsable_telefono && (
                          <p className="text-xs text-gray-700 dark:text-white/80 flex items-center gap-1">
                            <span aria-hidden>📞</span>{cruce.responsable_telefono}
                            </p>
                          )}
                          {cruce.responsable_email && (
                          <p className="text-xs text-blue-600 dark:text-blue-200 break-words flex items-center gap-1">
                            <span aria-hidden>✉️</span>{cruce.responsable_email}
                            </p>
                          )}
                          {cruce.responsable_horario && (
                          <p className="text-xs text-gray-700 dark:text-white/80 flex items-center gap-1">
                            <span aria-hidden>🕒</span>{cruce.responsable_horario}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(cruce)}
                      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <ManagementIcons.edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cruce)}
                      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <ManagementIcons.trash className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal del Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {editingCruce ? 'Editar Cruce' : 'Nuevo Cruce'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingCruce(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Contenido del Modal */}
            <div className="flex-1 overflow-y-auto p-6">
              <CruceForm
                cruceId={editingCruce?.id || editingCruce?.id_cruce}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowForm(false)
                  setEditingCruce(null)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deletingCruce && (
        <CruceDeleteModal
          cruce={deletingCruce}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingCruce(null)}
        />
      )}
    </div>
  )
} 