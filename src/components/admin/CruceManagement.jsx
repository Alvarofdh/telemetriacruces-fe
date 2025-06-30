import React, { useState } from 'react'
import { useData } from '../../contexts/DataContext'

export function CruceManagement() {
  const { cruces, agregarCruce, actualizarCruce, eliminarCruce } = useData()
  const [showForm, setShowForm] = useState(false)
  const [editingCruce, setEditingCruce] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const initialForm = {
    nombre: '',
    ubicacion: '',
    estado: 'ACTIVO',
    bateria: 100,
    sensoresActivos: 4,
    responsable: '',
    telefono: ''
  }

  const [formData, setFormData] = useState(initialForm)

  const filteredCruces = cruces.filter(cruce => 
    cruce.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cruce.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    const cruceData = {
      ...formData,
      ultimaActividad: new Date().toISOString().replace('T', ' ').split('.')[0]
    }

    if (editingCruce) {
      actualizarCruce(editingCruce.id_cruce, cruceData)
    } else {
      agregarCruce(cruceData)
    }

    setFormData(initialForm)
    setShowForm(false)
    setEditingCruce(null)
  }

  const handleEdit = (cruce) => {
    setEditingCruce(cruce)
    setFormData(cruce)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cruce?')) {
      eliminarCruce(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Cruces</h2>
        <button
          onClick={() => {
            setFormData(initialForm)
            setEditingCruce(null)
            setShowForm(true)
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                onClick={() => handleDelete(cruce.id_cruce)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingCruce ? 'Editar Cruce' : 'Nuevo Cruce'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre del cruce"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />

                <input
                  type="text"
                  placeholder="Ubicación"
                  required
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />

                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="MANTENIMIENTO">Mantenimiento</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>

                <input
                  type="number"
                  placeholder="Nivel de batería (%)"
                  min="0"
                  max="100"
                  value={formData.bateria}
                  onChange={(e) => setFormData({...formData, bateria: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />

                <input
                  type="number"
                  placeholder="Sensores activos"
                  min="0"
                  max="4"
                  value={formData.sensoresActivos}
                  onChange={(e) => setFormData({...formData, sensoresActivos: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />

                <input
                  type="text"
                  placeholder="Responsable"
                  value={formData.responsable}
                  onChange={(e) => setFormData({...formData, responsable: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />

                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingCruce(null)
                      setFormData(initialForm)
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingCruce ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 