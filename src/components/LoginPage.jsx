import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { sanitizeEmail, isValidEmail } from '../utils/sanitize'
import { formRateLimiter } from '../utils/rateLimiter'

export function LoginPage() {
	const { login } = useAuth()
	const navigate = useNavigate()
	const [formData, setFormData] = useState({
		email: '',
		password: ''
	})
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	// Validación de contraseña
	const validatePassword = (password) => {
		return password.length >= 8
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		
		// Rate limiting
		if (!formRateLimiter.isAllowed('login')) {
			setError('Demasiados intentos. Por favor, espera unos segundos.')
			return
		}

		// Validación en cliente
		if (!formData.email || !formData.password) {
			setError('Por favor, completa todos los campos.')
			return
		}

		// Sanitizar y validar email
		const sanitizedEmail = sanitizeEmail(formData.email)
		if (!isValidEmail(sanitizedEmail)) {
			setError('Por favor, ingresa un email válido.')
			return
		}

		if (!validatePassword(formData.password)) {
			setError('La contraseña debe tener al menos 8 caracteres.')
			return
		}

		setLoading(true)
		setError('')

		try {
			// Usar email sanitizado
			await login(sanitizedEmail, formData.password)
			// Redirigir al dashboard después de login exitoso
			navigate('/')
		} catch (err) {
			// Mensajes de error más específicos
			let errorMessage = 'Credenciales inválidas. Por favor, verifica tu email y contraseña.'
			
			if (err.message) {
				if (err.message.includes('401') || err.message.includes('Unauthorized')) {
					errorMessage = 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.'
				} else if (err.message.includes('403') || err.message.includes('Forbidden')) {
					errorMessage = 'No tienes permisos para acceder. Contacta al administrador.'
				} else if (err.message.includes('Network') || err.message.includes('fetch')) {
					errorMessage = 'Error de conexión. Por favor, verifica tu conexión a internet.'
				} else if (err.message.includes('Demasiadas')) {
					errorMessage = err.message
				} else {
					errorMessage = err.message
				}
			}
			
			setError(errorMessage)
		} finally {
			setLoading(false)
		}
	}

  const demoCredentials = [
    { email: 'admin@cruces-ferro.cl', rol: 'SUPER_ADMIN' },
    { email: 'carlos.mendoza@cruces-ferro.cl', rol: 'OPERADOR' },
    { email: 'luis.rodriguez@cruces-ferro.cl', rol: 'SUPERVISOR' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="p-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Cruces Ferroviarios</p>
          </div>

          {/* Formulario de Login */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="tu@email.com"
                aria-label="Email"
                aria-required="true"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="••••••••"
                aria-label="Contraseña"
                aria-required="true"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Iniciar sesión"
              aria-busy={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Credenciales Demo */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              Credenciales de demostración:
            </p>
            <div className="space-y-2">
              {demoCredentials.map((cred, index) => (
                <button
                  key={index}
                  onClick={() => setFormData({ email: cred.email, password: 'admin123' })}
                  className="w-full text-left px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{cred.email}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{cred.rol} • Contraseña: admin123</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 