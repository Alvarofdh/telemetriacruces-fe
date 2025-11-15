import React, { useState, useEffect } from 'react'
import { useData } from '../../hooks/useData'

export function UserManagement() {
  const { 
    usuarios, 
    isLoadingUsuarios, 
    usuariosError,
    agregarUsuario, 
    actualizarUsuario, 
    eliminarUsuario,
    loadUsuarios 
  } = useData()
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initialForm = {
    nombre: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    rol: 'OBSERVER', // Roles disponibles: ADMIN, MAINTENANCE, OBSERVER
    estado: 'ACTIVO',
    permisos: ['READ']
  }

  const [formData, setFormData] = useState(initialForm)

  // Recargar usuarios cuando se monta el componente
  // Nota: loadUsuarios ya se llama desde DataContext cuando el usuario se autentica
  // Este useEffect solo se ejecuta una vez al montar el componente
  useEffect(() => {
    // Solo cargar si no hay usuarios y no está cargando
    if (!isLoadingUsuarios && usuarios.length === 0) {
      loadUsuarios()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Array vacío para ejecutar solo una vez

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
    const userData = {
      ...formData,
        // Solo incluir password si es un usuario nuevo
        ...(editingUser ? {} : { password: formData.password || 'TempPassword123!' })
    }

    if (editingUser) {
        await actualizarUsuario(editingUser.id, userData)
    } else {
        await agregarUsuario(userData)
    }

    setFormData(initialForm)
    setShowForm(false)
    setEditingUser(null)
    } catch (error) {
      // El error ya se maneja en el DataContext con toast
      console.error('Error al guardar usuario:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData(user)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await eliminarUsuario(id)
      } catch (error) {
        // El error ya se maneja en el DataContext con toast
        console.error('Error al eliminar usuario:', error)
      }
    }
  }

  const getRoleBadge = (rol) => {
    const styles = {
      ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      MAINTENANCE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      OBSERVER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }
    return `px-2 py-1 rounded-full text-xs font-medium ${styles[rol] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h2>
        <button
          onClick={() => {
            setFormData(initialForm)
            setEditingUser(null)
            setShowForm(true)
          }}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Mensaje de error */}
      {usuariosError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">
            Error: {usuariosError}
          </p>
          <button
            onClick={loadUsuarios}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {isLoadingUsuarios ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Cargando usuarios...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900 dark:text-white">No hay usuarios</h3>
            <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Comienza creando un nuevo usuario.
            </p>
          </div>
        ) : (
          <>
            {/* Vista de tabla para desktop */}
            <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Usuario</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Rol</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estado</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Último Acceso</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{usuario.nombre}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{usuario.email}</div>
                  </div>
                </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <span className={getRoleBadge(usuario.rol)}>
                    {usuario.rol}
                  </span>
                </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        usuario.estado === 'ACTIVO' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {usuario.estado}
                  </span>
                </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {usuario.ultimoAcceso ? new Date(usuario.ultimoAcceso).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(usuario)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(usuario.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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

            {/* Vista de cards para móvil */}
            <div className="md:hidden space-y-2 sm:space-y-3 p-2 sm:p-4">
              {usuarios.map((usuario) => (
                <div key={usuario.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">{usuario.nombre}</div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{usuario.email}</div>
                    </div>
                    <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(usuario)}
                        className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg touch-manipulation"
                        aria-label="Editar usuario"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(usuario.id)}
                        className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg touch-manipulation"
                        aria-label="Eliminar usuario"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={getRoleBadge(usuario.rol)}>
                      {usuario.rol}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      usuario.estado === 'ACTIVO' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {usuario.estado}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 break-words">
                    Último acceso: {usuario.ultimoAcceso ? new Date(usuario.ultimoAcceso).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
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
                  placeholder="Nombre"
                  required
                  value={formData.first_name || formData.nombre?.split(' ')[0] || ''}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value, nombre: `${e.target.value} ${formData.last_name || ''}`.trim()})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                
                <input
                  type="text"
                  placeholder="Apellido"
                  value={formData.last_name || formData.nombre?.split(' ').slice(1).join(' ') || ''}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value, nombre: `${formData.first_name || formData.nombre?.split(' ')[0] || ''} ${e.target.value}`.trim()})}
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

                {!editingUser && (
                  <input
                    type="password"
                    placeholder="Contraseña (opcional, se generará una por defecto)"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                )}

                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({...formData, rol: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="OBSERVER">Observador</option>
                  <option value="MAINTENANCE">Mantenimiento</option>
                  <option value="ADMIN">Administrador</option>
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
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear'}
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