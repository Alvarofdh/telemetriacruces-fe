import React, { useState } from 'react'
import { useData } from '../../hooks/useData'
import { useDebounce } from '../../hooks/useDebounce'
import CruceForm from '../cruces/CruceForm'
import CruceDeleteModal from '../cruces/CruceDeleteModal'
import { crucesAPI } from '../../services/api'

export function CruceManagement() {
  const { cruces, agregarCruce, actualizarCruce, eliminarCruce } = useData()
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
    // Recargar datos desde el contexto o API
    window.location.reload() // O usar un método de refetch si está disponible
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
        await crucesAPI.delete(deletingCruce.id || deletingCruce.id_cruce)
        eliminarCruce(deletingCruce.id || deletingCruce.id_cruce)
        setDeletingCruce(null)
      } catch (error) {
        console.error('Error al eliminar:', error)
        alert('Error al eliminar cruce')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Cruces</h2>
        <button
          onClick={() => {
            setEditingCruce(null)
            setShowForm(true)
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          + Nuevo Cruce
        </button>
      </div>

      {/* Búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <input
          type="text"
          placeholder="Buscar cruces..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de Cruces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCruces.map((cruce) => (
          <div key={cruce.id_cruce} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{cruce.nombre}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                cruce.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' :
                cruce.estado === 'MANTENIMIENTO' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {cruce.estado}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p>📍 {cruce.ubicacion}</p>
              <p>🔋 {cruce.bateria}%</p>
              <p>📡 {cruce.sensoresActivos} sensores</p>
              <p>👤 {cruce.responsable}</p>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => handleEdit(cruce)}
                className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(cruce)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal del Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingCruce ? 'Editar Cruce' : 'Nuevo Cruce'}
              </h3>
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