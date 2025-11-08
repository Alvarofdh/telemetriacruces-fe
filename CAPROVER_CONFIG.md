# 🚀 Configuración de Caprover para Viametrica

## ⚠️ IMPORTANTE: Variables de Entorno

Las variables de entorno en Caprover se deben configurar de **DOS formas diferentes**:

### 1️⃣ Variables de Entorno de la Aplicación (App Configs)

Estas **NO funcionan** para el build de Vite porque se aplican en tiempo de ejecución, no en tiempo de build.

### 2️⃣ Build Arguments (Pre-Deploy Script)

Para que las variables funcionen en el build de Vite, debes usar el **Pre-Deploy Script** en Caprover.

## 🔧 Configuración Paso a Paso

### Opción A: Usando Pre-Deploy Script (Recomendado)

1. Ve a tu aplicación en Caprover
2. Ve a la pestaña **"Configuraciones de la App"**
3. Baja hasta **"Pre-Deploy Script"**
4. Pega este código:

```javascript
var preDeployFunction = function (capRoverAppObj, dockerUpdateObject) {
    // Configurar build args con las variables de entorno
    dockerUpdateObject.buildArgs = {
        VITE_API_BASE_URL: 'https://viametrica-be.psicosiodev.me',
        VITE_API_TIMEOUT: '10000',
        VITE_APP_ENV: 'production',
        VITE_APP_NAME: 'Viametrica',
        VITE_APP_VERSION: '1.0.0',
        VITE_DEBUG_MODE: 'true',
        VITE_MAP_TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        VITE_REFRESH_INTERVAL: '30000'
    };
    
    return Promise.resolve();
};
```

5. **Guarda** y **Redesplega**

### Opción B: Modificar captain-definition (Alternativa)

Si prefieres no usar el Pre-Deploy Script, puedes modificar el `captain-definition`:

```json
{
    "schemaVersion": 2,
    "dockerfilePath": "./Dockerfile",
    "dockerfileLines": [
        "ARG VITE_API_BASE_URL=https://viametrica-be.psicosiodev.me",
        "ARG VITE_API_TIMEOUT=10000",
        "ARG VITE_DEBUG_MODE=true"
    ]
}
```

**⚠️ NOTA:** Esta opción expone las variables en el repositorio, por lo que **NO es recomendada para producción**.

## 🔐 Mejores Prácticas de Seguridad

### ❌ NO HACER:

```dockerfile
# NO hardcodear URLs en el Dockerfile
ARG VITE_API_BASE_URL=https://mi-api-secreta.com
```

### ✅ HACER:

```dockerfile
# Dejar sin valor por defecto
ARG VITE_API_BASE_URL

# O usar un placeholder
ARG VITE_API_BASE_URL=http://localhost:3000
```

Y configurar el valor real en:
- Pre-Deploy Script de Caprover
- Variables de entorno del sistema
- Secrets de CI/CD

## 📋 Variables Requeridas

Estas son las variables que **DEBES** configurar en el Pre-Deploy Script:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | URL del backend | `https://viametrica-be.psicosiodev.me` |
| `VITE_API_TIMEOUT` | Timeout en ms | `10000` |
| `VITE_APP_ENV` | Entorno | `production` |
| `VITE_APP_NAME` | Nombre de la app | `Viametrica` |
| `VITE_APP_VERSION` | Versión | `1.0.0` |
| `VITE_DEBUG_MODE` | Debug mode | `false` (prod) / `true` (dev) |
| `VITE_MAP_TILE_URL` | URL del mapa | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` |
| `VITE_REFRESH_INTERVAL` | Intervalo de actualización | `30000` |

## 🔄 Diferentes Entornos

### Desarrollo/Staging

```javascript
dockerUpdateObject.buildArgs = {
    VITE_API_BASE_URL: 'https://staging-api.psicosiodev.me',
    VITE_DEBUG_MODE: 'true',
    VITE_APP_ENV: 'staging'
};
```

### Producción

```javascript
dockerUpdateObject.buildArgs = {
    VITE_API_BASE_URL: 'https://viametrica-be.psicosiodev.me',
    VITE_DEBUG_MODE: 'false',
    VITE_APP_ENV: 'production'
};
```

## 🐛 Troubleshooting

### Problema: Variables no se aplican

**Solución:** Verifica que estás usando el Pre-Deploy Script, no las variables de entorno normales.

### Problema: Build falla con "VITE_API_BASE_URL is undefined"

**Solución:** 
1. Verifica que el Pre-Deploy Script está configurado
2. Verifica que la sintaxis del script es correcta
3. Redesplega la aplicación

### Problema: La aplicación muestra la página de Caprover

**Solución:**
1. Verifica que el build se completó exitosamente
2. Revisa los logs del build
3. Verifica que los archivos están en `/usr/share/nginx/html`

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del build en Caprover
2. Verifica que el Pre-Deploy Script está configurado
3. Asegúrate de que todas las variables están definidas

---

**Última actualización:** Noviembre 8, 2025  
**Versión:** 1.0.0

