# Evaluación: httpOnly Cookies para Tokens JWT

## 📋 Resumen

Este documento evalúa la migración de tokens JWT desde `localStorage` a cookies `httpOnly` para mejorar la seguridad de la aplicación.

---

## 🔍 Estado Actual

### Implementación Actual
- **Almacenamiento**: `localStorage`
- **Tokens**: `auth_access_token` y `auth_refresh_token`
- **Ubicación**: `src/services/httpClient.js` y `src/services/auth.js`
- **Riesgo**: Vulnerable a XSS (Cross-Site Scripting)

### Problemas Identificados
1. **XSS**: Si un atacante ejecuta JavaScript malicioso, puede acceder a `localStorage` y robar tokens
2. **Accesibilidad**: JavaScript puede leer/escribir tokens fácilmente
3. **Persistencia**: Los tokens persisten incluso después de cerrar el navegador

---

## ✅ Beneficios de httpOnly Cookies

### Seguridad
- ✅ **Protección contra XSS**: JavaScript no puede acceder a cookies `httpOnly`
- ✅ **Protección CSRF**: Requiere configuración adicional (SameSite, CSRF tokens)
- ✅ **Expiración automática**: Las cookies pueden expirar automáticamente

### Desventajas
- ⚠️ **Complejidad**: Requiere cambios en backend y frontend
- ⚠️ **CSRF**: Necesita protección adicional contra CSRF
- ⚠️ **CORS**: Requiere configuración cuidadosa de CORS
- ⚠️ **SPA**: Las SPAs requieren configuración especial

---

## 🏗️ Implementación Requerida

### Backend (Django)

#### 1. Configurar Cookies en Respuestas de Login
```python
# settings.py
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = True  # Solo HTTPS en producción
SESSION_COOKIE_SAMESITE = 'Lax'  # o 'Strict'
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'Lax'

# views.py o serializers.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt  # Temporal, luego usar CSRF tokens
def login_view(request):
    # ... lógica de autenticación ...
    
    response = JsonResponse({
        'user': user_data,
        # NO incluir tokens en el body
    })
    
    # Establecer cookies httpOnly
    response.set_cookie(
        'access_token',
        access_token,
        httponly=True,
        secure=True,  # Solo HTTPS
        samesite='Lax',
        max_age=3600,  # 1 hora
        path='/'
    )
    
    response.set_cookie(
        'refresh_token',
        refresh_token,
        httponly=True,
        secure=True,
        samesite='Lax',
        max_age=604800,  # 7 días
        path='/'
    )
    
    return response
```

#### 2. Middleware para Leer Tokens de Cookies
```python
# middleware.py
class JWTCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Leer token de cookie en lugar de header
        access_token = request.COOKIES.get('access_token')
        if access_token:
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
        
        response = self.get_response(request)
        return response
```

#### 3. Endpoint de Refresh Token
```python
@csrf_exempt
def refresh_token_view(request):
    refresh_token = request.COOKIES.get('refresh_token')
    if not refresh_token:
        return JsonResponse({'error': 'No refresh token'}, status=401)
    
    # Validar y generar nuevo access token
    # ... lógica de refresh ...
    
    response = JsonResponse({'user': user_data})
    response.set_cookie(
        'access_token',
        new_access_token,
        httponly=True,
        secure=True,
        samesite='Lax',
        max_age=3600,
        path='/'
    )
    
    return response
```

#### 4. Endpoint de Logout
```python
@csrf_exempt
def logout_view(request):
    response = JsonResponse({'message': 'Logged out'})
    
    # Eliminar cookies
    response.delete_cookie('access_token', path='/')
    response.delete_cookie('refresh_token', path='/')
    
    return response
```

### Frontend (React)

#### 1. Actualizar httpClient.js
```javascript
// src/services/httpClient.js

// Eliminar lectura de localStorage
// const token = localStorage.getItem('auth_access_token')

// Las cookies se envían automáticamente con las peticiones
// No necesitamos leerlas manualmente

// Para peticiones, axios/envío automático incluye cookies si:
// - withCredentials: true
// - CORS configurado correctamente en backend
```

#### 2. Actualizar auth.js
```javascript
// src/services/auth.js

export const login = async (email, password) => {
  const response = await api.post('/api/login', {
    email,
    password
  }, {
    withCredentials: true  // ✅ Importante: enviar cookies
  })
  
  // NO guardar tokens en localStorage
  // Las cookies se establecen automáticamente por el backend
  
  // Solo guardar datos del usuario
  if (response.data.user) {
    localStorage.setItem('auth_user', JSON.stringify(response.data.user))
  }
  
  return response.data
}

export const logout = async () => {
  await api.post('/api/logout', {}, {
    withCredentials: true
  })
  
  // Limpiar localStorage
  localStorage.removeItem('auth_user')
  // NO limpiar tokens (ya están en cookies httpOnly)
}

export const refreshToken = async () => {
  const response = await api.post('/api/token/refresh', {}, {
    withCredentials: true
  })
  
  // El nuevo token se establece automáticamente en cookie
  return response.data
}
```

#### 3. Configurar Axios para Cookies
```javascript
// src/services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,  // ✅ Enviar cookies en todas las peticiones
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await refreshToken()
        // Reintentar petición original
        return api.request(error.config)
      } catch (refreshError) {
        // Redirigir a login
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)
```

#### 4. Actualizar Socket.IO
```javascript
// src/services/socket.js

// Las cookies se envían automáticamente con Socket.IO si:
// - withCredentials: true en la conexión
// - Backend configurado para aceptar cookies

const socket = io(socketUrl, {
  withCredentials: true,  // ✅ Enviar cookies
  transports: ['polling', 'websocket'],
})
```

---

## 🔒 Protección CSRF

### Backend
```python
# settings.py
CSRF_TRUSTED_ORIGINS = [
    'https://tu-dominio.com',
    'http://localhost:5173',  # Desarrollo
]

# views.py
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'csrfToken': request.META.get('CSRF_COOKIE')})
```

### Frontend
```javascript
// Obtener CSRF token al iniciar
const getCsrfToken = async () => {
  const response = await api.get('/api/csrf-token', {
    withCredentials: true
  })
  return response.data.csrfToken
}

// Incluir en headers de peticiones mutantes (POST, PUT, DELETE)
api.interceptors.request.use((config) => {
  if (['post', 'put', 'delete'].includes(config.method)) {
    config.headers['X-CSRFToken'] = getCsrfToken()
  }
  return config
})
```

---

## ⚠️ Consideraciones

### CORS
El backend debe configurar CORS para aceptar cookies:
```python
# settings.py o CORS config
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    'https://tu-dominio.com',
    'http://localhost:5173',
]
```

### Desarrollo vs Producción
- **Desarrollo**: `secure=False` (permite HTTP)
- **Producción**: `secure=True` (solo HTTPS)

### Compatibilidad
- ✅ Todos los navegadores modernos soportan `httpOnly`
- ⚠️ Requiere HTTPS en producción para `secure=True`
- ⚠️ SPAs requieren configuración especial de CORS

---

## 📊 Comparación

| Aspecto | localStorage | httpOnly Cookies |
|---------|--------------|------------------|
| **Seguridad XSS** | ❌ Vulnerable | ✅ Protegido |
| **Seguridad CSRF** | ✅ No vulnerable | ⚠️ Requiere protección |
| **Accesibilidad JS** | ✅ Fácil acceso | ❌ No accesible |
| **Complejidad** | ✅ Simple | ⚠️ Más complejo |
| **CORS** | ✅ Simple | ⚠️ Requiere configuración |
| **SPA** | ✅ Funciona bien | ⚠️ Requiere ajustes |

---

## 🎯 Recomendación

### Fase 1: Preparación (Actual)
- ✅ Documentar evaluación
- ✅ Identificar cambios necesarios
- ⏳ Planificar migración

### Fase 2: Backend (Prioritario)
1. Implementar cookies `httpOnly` en endpoints de autenticación
2. Configurar CORS correctamente
3. Implementar protección CSRF
4. Probar en entorno de desarrollo

### Fase 3: Frontend
1. Actualizar `httpClient.js` para usar `withCredentials`
2. Eliminar lectura/escritura de tokens en `localStorage`
3. Actualizar `auth.js` para trabajar con cookies
4. Actualizar Socket.IO para enviar cookies
5. Probar flujo completo

### Fase 4: Testing
1. Probar login/logout
2. Probar refresh token
3. Probar Socket.IO
4. Probar protección CSRF
5. Probar en diferentes navegadores

### Fase 5: Producción
1. Desplegar backend con cookies
2. Desplegar frontend actualizado
3. Monitorear errores
4. Verificar seguridad

---

## 📝 Checklist de Migración

### Backend
- [ ] Configurar cookies `httpOnly` en login
- [ ] Configurar cookies en refresh token
- [ ] Implementar middleware para leer cookies
- [ ] Configurar CORS con `allow_credentials=True`
- [ ] Implementar protección CSRF
- [ ] Actualizar endpoint de logout
- [ ] Probar en desarrollo

### Frontend
- [ ] Actualizar `httpClient.js` con `withCredentials`
- [ ] Eliminar lectura de tokens de `localStorage`
- [ ] Actualizar `auth.js` para trabajar con cookies
- [ ] Actualizar Socket.IO con `withCredentials`
- [ ] Implementar obtención de CSRF token
- [ ] Actualizar interceptores
- [ ] Probar flujo completo

### Testing
- [ ] Probar login/logout
- [ ] Probar refresh token automático
- [ ] Probar Socket.IO
- [ ] Probar protección CSRF
- [ ] Probar en diferentes navegadores
- [ ] Probar en producción

---

## 🔗 Referencias

- [OWASP: Secure Cookie Attributes](https://owasp.org/www-community/HttpOnly)
- [MDN: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [Django: CSRF Protection](https://docs.djangoproject.com/en/stable/ref/csrf/)
- [Axios: withCredentials](https://axios-http.com/docs/config_defaults)

---

**Estado**: 📋 Evaluación completada  
**Fecha**: 2025-01-15  
**Próximo paso**: Implementar en backend (Fase 2)

