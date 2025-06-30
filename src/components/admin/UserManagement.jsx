import React, { useState } from 'react'
import { useData } from '../../contexts/DataContext'

export function UserManagement() {
  const { usuarios, agregarUsuario, actualizarUsuario, eliminarUsuario } = useData()
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const initialForm = {
    nombre: '',
    email: '',
    rol: 'OPERADOR',
    estado: 'ACTIVO',
    permisos: ['READ']
  }

  const [formData, setFormData] = useState(initialForm)

  const handleSubmit = (e) => {
    e.preventDefault()
    const userData = {
      ...formData,
      ultimoAcceso: new Date().toISOString().replace('T', ' ').split('.')[0]
    }

    if (editingUser) {
      actualizarUsuario(editingUser.id, userData)
    } else {
      agregarUsuario(userData)
    }

    setFormData(initialForm)
    setShowForm(false)
    setEditingUser(null)
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData(user)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      eliminarUsuario(id)
    }
  }

  const getRoleBadge = (rol) => {
    const styles = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-800',
      SUPERVISOR: 'bg-blue-100 text-blue-800',
      OPERADOR: 'bg-green-100 text-green-800',
      TECNICO: 'bg-yellow-100 text-yellow-800'
    }
    return `px-2 py-1 rounded-full text-xs font-medium ${styles[rol]}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h2>
        <button
          onClick={() => {
            setFormData(initialForm)
            setEditingUser(null)
            setShowForm(true)
          }}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Último Acceso</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{usuario.nombre}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{usuario.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getRoleBadge(usuario.rol)}>
                    {usuario.rol}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    usuario.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {usuario.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {usuario.ultimoAcceso}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(usuario)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(usuario.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal del Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />

                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />

                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({...formData, rol: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="OPERADOR">Operador</option>
                  <option value="TECNICO">Técnico</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>

                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingUser(null)
                      setFormData(initialForm)
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {editingUser ? 'Actualizar' : 'Crear'}
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