# Instrucciones de Integración con ESP32

## 📋 Cambios Realizados

Se ha integrado completamente el sistema con tu ESP32 para visualizar datos en tiempo real. Los cambios incluyen:

### 1. **Servicio API para ESP32** (`src/services/api.js`)
- Comunicación completa con los endpoints del ESP32
- Manejo automático de timeout (5 segundos)
- Fallback a datos de respaldo si el ESP32 no está disponible
- Mapeo automático de datos de telemetría al formato de la aplicación

### 2. **Sistema de Autenticación Completo**
- **Todas las rutas ahora requieren login**
- Persistencia de sesión con `localStorage`
- Redirección automática al login si no hay sesión activa
- Botón de logout en el header

### 3. **Actualización Automática de Datos**
- Los datos se refrescan automáticamente cada **5 segundos**
- Indicador visual de estado de conexión (verde = conectado, amarillo = respaldo)
- Timestamp de última actualización en el header

---

## 🔧 Configuración Inicial

### Paso 1: Configurar la URL del ESP32

Edita el archivo `src/services/api.js` y configura la URL de tu ESP32:

```javascript
const API_CONFIG = {
	// Opción 1: Usar mDNS (si tu red lo soporta)
	BASE_URL: 'http://viametrica.local',
	
	// Opción 2: Usar la IP directa (más confiable)
	// BASE_URL: 'http://192.168.1.100', // Cambia por la IP de tu ESP32
	
	TIMEOUT: 5000,
}
```

**Para encontrar la IP de tu ESP32:**
1. Abre el Monitor Serial de Arduino IDE
2. Reinicia el ESP32
3. La IP aparecerá en la línea: `WiFi OK -> Korbo  IP: 192.168.X.X`

### Paso 2: Actualizar las credenciales WiFi del ESP32 (si es necesario)

En tu código del ESP32, cambia las siguientes líneas si es necesario:

```cpp
const char* WIFI_SSID = "Korbo";
const char* WIFI_PASS = "BP28AX303305";
```

### Paso 3: Subir el código al ESP32

1. Conecta tu ESP32 al PC
2. Abre el código en Arduino IDE
3. Selecciona el puerto correcto: `Herramientas > Puerto`
4. Sube el código

---

## 🚀 Iniciar la Aplicación

### 1. Asegúrate de que el ESP32 esté encendido y conectado a WiFi

Verifica en el Monitor Serial que veas:
```
WiFi OK -> Korbo  IP: 192.168.X.X
mDNS: http://viametrica.local
API escuchando en puerto 80
```

### 2. Inicia el servidor de desarrollo

```bash
cd /home/psicosiao/Escritorio/cruces-ferroviario-fe/cruces-ferroviarios-fe
npm run dev
```

### 3. Abre la aplicación en tu navegador

La aplicación abrirá en `http://localhost:5173`

---

## 🔐 Sistema de Autenticación

### Credenciales de Acceso

La aplicación **ahora requiere login para acceder**. Usa cualquiera de estas credenciales:

| Email | Contraseña | Rol | Acceso Admin |
|-------|-----------|-----|--------------|
| `admin@cruces-ferro.cl` | `admin123` | SUPER_ADMIN | ✅ Sí |
| `luis.rodriguez@cruces-ferro.cl` | `admin123` | SUPERVISOR | ✅ Sí |
| `carlos.mendoza@cruces-ferro.cl` | `admin123` | OPERADOR | ❌ No |
| `ana.garcia@cruces-ferro.cl` | `admin123` | TÉCNICO | ❌ No |

### Flujo de Autenticación

1. Al abrir la aplicación, serás redirigido automáticamente al **login**
2. Ingresa tus credenciales
3. Si el login es exitoso, serás redirigido al **dashboard principal**
4. Tu sesión se guarda en `localStorage` (permanece activa aunque refresques la página)
5. Para cerrar sesión, haz clic en el botón **"Salir"** en el header

---

## 📊 Endpoints del ESP32 Utilizados

La aplicación consume los siguientes endpoints de tu ESP32:

### `GET /health`
- Verifica que el ESP32 esté respondiendo
- Respuesta: `{"status": "ok", "uptime_ms": 123456}`

### `GET /api/cruces`
- Obtiene la lista de todos los cruces
- Respuesta: 
```json
[
  {
    "id": "CRUCE-HUASCO-01",
    "name": "Huasco 01",
    "region": "Atacama",
    "status": "operational"
  },
  ...
]
```

### `GET /api/telemetry/latest?crossing_id=CRUCE-XXXX`
- Obtiene la telemetría detallada de un cruce específico
- Respuesta:
```json
{
  "crossing_id": "CRUCE-HUASCO-01",
  "timestamp_ms": 123456789,
  "barrier_state": "UP",
  "battery_soc": 92.5,
  "voltage": 12.4,
  "temperature": 26.3,
  "rssi": -65,
  "vibration_ms2": 0.012,
  "solar_power_w": 150.5,
  "faults": 0,
  "status": "operational",
  "gps": {
    "lat": -28.5750,
    "lon": -70.7600
  }
}
```

### `POST /api/reset`
- Reinicia la telemetría simulada del ESP32
- Respuesta: `{"reset": "ok"}`

---

## 🎨 Características Implementadas

### Dashboard Principal
- ✅ Visualización de todos los cruces con datos del ESP32
- ✅ Actualización automática cada 5 segundos
- ✅ Indicador de conexión ESP32 (verde/amarillo)
- ✅ Filtros por estado (ACTIVO, MANTENIMIENTO, INACTIVO)
- ✅ Búsqueda por nombre
- ✅ Estadísticas en tiempo real
- ✅ Información de usuario logueado
- ✅ Botón de logout

### Vista Detallada del Cruce
- ✅ Telemetría completa del cruce seleccionado
- ✅ Estado de barrera (UP, DOWN, MOVING, FAULT)
- ✅ Nivel de batería y voltaje
- ✅ Temperatura del sistema
- ✅ Potencia solar
- ✅ RSSI (calidad de señal)
- ✅ Vibración detectada
- ✅ Coordenadas GPS
- ✅ Fallas detectadas

### Sistema de Autenticación
- ✅ Página de login obligatoria
- ✅ Protección de todas las rutas
- ✅ Persistencia de sesión (localStorage)
- ✅ Redirección automática
- ✅ Logout seguro

---

## 🔍 Mapeo de Datos ESP32 → Aplicación

| Campo ESP32 | Campo Aplicación | Descripción |
|-------------|------------------|-------------|
| `crossing_id` | `crossing_id` | ID único del cruce |
| `barrier_state` | `barrier_state` | Estado de barrera (UP/DOWN/MOVING/FAULT) |
| `battery_soc` | `bateria` | % de batería (SOC) |
| `voltage` | `voltage` | Voltaje en V |
| `temperature` | `temperature` | Temperatura en °C |
| `rssi` | `rssi` | Calidad de señal WiFi |
| `vibration_ms2` | `vibration` | Vibración en m/s² |
| `solar_power_w` | `solar_power` | Potencia solar en W |
| `faults` | `faults` | Bitmask de fallas |
| `gps.lat` | `coordenadas.lat` | Latitud GPS |
| `gps.lon` | `coordenadas.lng` | Longitud GPS |

### Mapeo de Estados

**Estado de Barrera → Estado del Cruce:**
- `FAULT` o `faults > 0` → **INACTIVO** (rojo)
- `MOVING` → **MANTENIMIENTO** (amarillo)
- `UP` o `DOWN` (sin fallas) → **ACTIVO** (verde)

---

## 🛠️ Solución de Problemas

### El ESP32 no se conecta

1. **Verifica la IP en el Monitor Serial**
   ```
   WiFi OK -> Korbo  IP: 192.168.1.100
   ```

2. **Prueba el endpoint manualmente**
   ```bash
   curl http://192.168.1.100/health
   # Debe responder: {"status":"ok","uptime_ms":123456}
   ```

3. **Actualiza la URL en `src/services/api.js`**
   ```javascript
   BASE_URL: 'http://192.168.1.100',  // Usa tu IP real
   ```

4. **Verifica el firewall**
   - Asegúrate de que tu PC puede comunicarse con el ESP32
   - Prueba hacer ping: `ping 192.168.1.100`

### La aplicación muestra "Datos de Respaldo"

- Esto es **normal** si el ESP32 no está disponible
- La aplicación usará datos de ejemplo automáticamente
- El indicador será amarillo en lugar de verde
- Verifica la consola del navegador (F12) para ver los errores

### Error de CORS

Si ves errores de CORS en la consola:
1. El ESP32 ya tiene configurado CORS (`Access-Control-Allow-Origin: *`)
2. Verifica que el ESP32 esté respondiendo correctamente
3. Intenta acceder directamente: `http://192.168.1.100/api/cruces`

### No puedo iniciar sesión

- La contraseña para **todos** los usuarios es: `admin123`
- Si olvidaste cerrar sesión, puedes limpiar manualmente:
  ```javascript
  // En la consola del navegador (F12):
  localStorage.clear()
  location.reload()
  ```

---

## 📝 Datos de los Cruces

Tu ESP32 simula **6 cruces ferroviarios**:

1. **CRUCE-HUASCO-01** - Huasco 01
2. **CRUCE-FREIRINA-02** - Freirina 02
3. **CRUCE-VALLENAR-03** - Vallenar 03
4. **CRUCE-VALLENAR-04** - Vallenar 04
5. **CRUCE-HUASCO-05** - Huasco 05
6. **CRUCE-FREIRINA-06** - Freirina 06

Todos ubicados en la **Región de Atacama, Chile**.

---

## 🔄 Cómo Funciona la Actualización Automática

1. Al cargar la aplicación, se intenta conectar con el ESP32
2. Si tiene éxito, carga los datos de telemetría de todos los cruces
3. Cada **5 segundos**, vuelve a cargar los datos automáticamente
4. Si falla la conexión, usa datos de respaldo sin interrumpir la aplicación
5. El header muestra el estado de conexión y la hora de última actualización

---

## 🎯 Próximos Pasos Opcionales

Si quieres mejorar la integración, puedes:

1. **Ajustar el intervalo de actualización** (actualmente 5 segundos)
   - Edita `src/contexts/DataContext.jsx` línea ~278
   ```javascript
   const interval = setInterval(() => {
     loadESP32Data()
   }, 3000) // Cambia 5000 a 3000 para 3 segundos
   ```

2. **Agregar gráficos históricos** usando ChartsPanel
   - Ya tienes `src/components/ChartsPanel.jsx`
   - Puedes almacenar datos históricos y visualizarlos

3. **Implementar notificaciones**
   - Alertas cuando `battery_soc < 25%`
   - Alertas cuando `barrier_state === 'FAULT'`

4. **Mejorar el sistema de autenticación**
   - Conectar con un backend real
   - Implementar JWT tokens
   - Agregar diferentes niveles de permisos

---

## 📞 Contacto y Soporte

Si tienes problemas o dudas:

1. Revisa la consola del navegador (F12)
2. Revisa el Monitor Serial del ESP32
3. Verifica que ambos dispositivos estén en la misma red WiFi

---

**¡Listo! Tu aplicación ahora está completamente integrada con el ESP32 y protegida con autenticación.** 🎉

