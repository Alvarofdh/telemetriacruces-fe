import React, { useState, useEffect, useMemo } from 'react'
import { useData } from '../../hooks/useData'

// Iconos SVG profesionales
const UserIcons = {
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
	plus: (className = "w-5 h-5") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
		</svg>
	),
	search: (className = "w-5 h-5") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>
	),
	shield: (className = "w-5 h-5") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
		</svg>
	),
	tools: (className = "w-5 h-5") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
		</svg>
	),
	eye: (className = "w-5 h-5") => (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
		</svg>
	)
}

export function UserManagement() {
  const { 
    usuarios, 
    isLoadingUsuarios, 
    usuariosError,
    agregarUsuario, 
    actualizarUsuario, 
    desactivarUsuario,
    activarUsuario,
    loadUsuarios 
  } = useData()
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRol, setFilterRol] = useState('ALL')
  const [filterEstado, setFilterEstado] = useState('ALL')

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

  const handleDeactivate = async (usuario) => {
    if (window.confirm(`¿Desactivar al usuario ${usuario.email}? Podrás reactivarlo posteriormente.`)) {
      try {
        await desactivarUsuario(usuario.id)
      } catch (error) {
        console.error('Error al desactivar usuario:', error)
      }
    }
  }

  const handleActivate = async (usuario) => {
    try {
      await activarUsuario(usuario.id)
    } catch (error) {
      console.error('Error al activar usuario:', error)
    }
  }

  // Filtrar usuarios
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(usuario => {
      const matchesSearch = !searchTerm || 
        usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRol = filterRol === 'ALL' || usuario.rol === filterRol
      const matchesEstado = filterEstado === 'ALL' || usuario.estado === filterEstado
      return matchesSearch && matchesRol && matchesEstado
    })
  }, [usuarios, searchTerm, filterRol, filterEstado])

  // Estadísticas
  const stats = useMemo(() => {
    return {
      total: usuarios.length,
      activos: usuarios.filter(u => u.estado === 'ACTIVO').length,
      inactivos: usuarios.filter(u => u.estado === 'INACTIVO').length,
      admin: usuarios.filter(u => u.rol === 'ADMIN').length,
      maintenance: usuarios.filter(u => u.rol === 'MAINTENANCE').length,
      observer: usuarios.filter(u => u.rol === 'OBSERVER').length
    }
  }, [usuarios])

  const getRoleBadge = (rol) => {
    const styles = {
      ADMIN: 'bg-purple-100 text-purple-800 border-2 border-purple-300 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-700',
      MAINTENANCE: 'bg-blue-100 text-blue-800 border-2 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700',
      OBSERVER: 'bg-green-100 text-green-800 border-2 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700'
    }
    return `px-2.5 py-1 rounded-full text-xs font-semibold ${styles[rol] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`
  }

  const getRoleIcon = (rol) => {
    switch(rol) {
      case 'ADMIN':
        return <UserIcons.shield className="w-4 h-4" />
      case 'MAINTENANCE':
        return <UserIcons.tools className="w-4 h-4" />
      case 'OBSERVER':
        return <UserIcons.eye className="w-4 h-4" />
      default:
        return <UserIcons.user className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Administra usuarios, roles y permisos del sistema</p>
        </div>
        <button
          onClick={() => {
            setFormData(initialForm)
            setEditingUser(null)
            setShowForm(true)
          }}
          className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          <UserIcons.plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nuevo Usuario</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <UserIcons.user className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Usuarios</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activos}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Activos</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <UserIcons.shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.admin}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Administradores</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <UserIcons.tools className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.maintenance}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Mantenimiento</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <UserIcons.eye className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.observer}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Observadores</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.inactivos}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Inactivos</div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcons.search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <select
            value={filterRol}
            onChange={(e) => setFilterRol(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="ALL">Todos los roles</option>
            <option value="ADMIN">Administrador</option>
            <option value="MAINTENANCE">Mantenimiento</option>
            <option value="OBSERVER">Observador</option>
          </select>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>
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

      {/* Lista de Usuarios - Vista de Cards */}
      {isLoadingUsuarios ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Cargando usuarios...</p>
        </div>
      ) : filteredUsuarios.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UserIcons.user className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No se encontraron usuarios
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {usuarios.length === 0 
              ? 'Comienza creando un nuevo usuario'
              : 'Intenta con otros filtros de búsqueda'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {filteredUsuarios.map((usuario) => (
            <div
              key={usuario.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Header con gradiente según rol */}
              <div className={`px-4 sm:px-6 py-3 sm:py-4 ${
                usuario.rol === 'ADMIN' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                usuario.rol === 'MAINTENANCE' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                'bg-gradient-to-r from-green-500 to-green-600'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shrink-0">
                      {getRoleIcon(usuario.rol)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-white break-words leading-tight">
                        {usuario.nombre}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/80 truncate mt-0.5">
                        {usuario.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4 sm:p-6 space-y-3">
                {/* Rol y Estado */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 ${getRoleBadge(usuario.rol)}`}>
                    {getRoleIcon(usuario.rol)}
                    {usuario.rol}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border-2 ${
                    usuario.estado === 'ACTIVO' 
                      ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700' 
                      : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700'
                  }`}>
                    {usuario.estado}
                  </span>
                </div>

                {/* Último Acceso */}
                <div className="flex items-start gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Último Acceso</p>
                    <p className="text-sm text-gray-900 dark:text-white break-words">
                      {usuario.ultimoAcceso 
                        ? new Date(usuario.ultimoAcceso).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Nunca'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(usuario)}
                    className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <UserIcons.edit className="w-4 h-4" />
                    Editar
                  </button>
                  {usuario.estado === 'ACTIVO' ? (
                    <button
                      onClick={() => handleDeactivate(usuario)}
                      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                    >
                      <UserIcons.trash className="w-4 h-4" />
                      Desactivar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(usuario)}
                      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium text-green-600 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    >
                      <UserIcons.user className="w-4 h-4" />
                      Activar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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