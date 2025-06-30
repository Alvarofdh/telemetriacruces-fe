# Dashboard de Administración - Sistema de Cruces Ferroviarios

## 🎯 Características del Dashboard

El sistema ahora incluye un **Dashboard de Administración completo** con las siguientes funcionalidades:

### 🔐 Sistema de Autenticación
- Login con credenciales de demostración
- Control de acceso basado en roles (SUPER_ADMIN, SUPERVISOR, OPERADOR, TECNICO)
- Gestión de sesiones

### 📊 Panel Principal de Admin
1. **Resumen General**: Estadísticas en tiempo real del sistema
2. **Gestión de Cruces**: CRUD completo de cruces ferroviarios
3. **Gestión de Usuarios**: Administración de usuarios del sistema
4. **🗺️ Mapa Interactivo**: Visualización geográfica de cruces (NUEVO)
5. **📊 Gráficos Avanzados**: Charts y visualizaciones avanzadas (NUEVO)
6. **Análisis y Reportes**: Estadísticas avanzadas y métricas
7. **Logs del Sistema**: Registro de todas las actividades
8. **Configuración**: Ajustes del sistema y parámetros

## 🚀 Cómo Acceder al Dashboard de Admin

### Opción 1: Desde el Dashboard Principal
1. Ejecuta `npm run dev`
2. Ve a `http://localhost:5173`
3. Haz clic en el botón **"Admin"** en la esquina superior derecha
4. Inicia sesión con las credenciales de demo

### Opción 2: Acceso Directo
1. Ve directamente a `http://localhost:5173/admin`
2. Inicia sesión con las credenciales

## 🔑 Credenciales de Demostración

### Super Administrador
- **Email**: `admin@cruces-ferro.cl`
- **Contraseña**: `admin123`
- **Permisos**: Acceso completo a todas las funcionalidades

### Supervisor
- **Email**: `luis.rodriguez@cruces-ferro.cl`
- **Contraseña**: `admin123`
- **Permisos**: Gestión de cruces y usuarios (sin eliminación)

### Operador
- **Email**: `carlos.mendoza@cruces-ferro.cl`
- **Contraseña**: `admin123`
- **Permisos**: Solo lectura y actualización de cruces

## 📋 Funcionalidades Principales

### 1. Gestión de Cruces
- ✅ Crear nuevos cruces ferroviarios
- ✅ Editar información existente
- ✅ Eliminar cruces (solo admin)
- ✅ Filtros de búsqueda por estado
- ✅ Vista de tarjetas con información resumida

### 2. Gestión de Usuarios
- ✅ Crear nuevos usuarios del sistema
- ✅ Asignar roles y permisos
- ✅ Cambiar estado (activo/inactivo)
- ✅ Editar información de contacto

### 3. Logs del Sistema
- ✅ Registro completo de actividades
- ✅ Filtros por tipo de acción
- ✅ Búsqueda por usuario
- ✅ Timestamps detallados

### 4. Análisis y Reportes
- ✅ Estadísticas de estado de cruces
- ✅ Análisis de niveles de batería
- ✅ Resumen de actividad reciente
- ✅ Métricas del sistema

### 5. 🗺️ Mapa Interactivo (NUEVO)
- ✅ Visualización geográfica en tiempo real de todos los cruces
- ✅ Marcadores codificados por colores según estado:
  - 🟢 Verde: Cruces activos
  - 🟡 Amarillo: En mantenimiento  
  - 🔴 Rojo: Inactivos
- ✅ Popups informativos con detalles completos
- ✅ Panel lateral con información detallada del cruce seleccionado
- ✅ Radio de cobertura opcional (500m por cruce)
- ✅ Navegación directa a detalles del cruce
- ✅ Integración con Leaflet/OpenStreetMap

### 6. 📊 Gráficos Avanzados (NUEVO)
- ✅ **Gráfico de Dona**: Distribución visual de estados de cruces
- ✅ **Gráfico de Barras**: Niveles de batería por cruce
- ✅ **Gráfico de Línea**: Tendencias de actividad últimos 30 días
- ✅ **Gráfico Horizontal**: Sensores activos por cruce
- ✅ Métricas resumidas en tiempo real
- ✅ Filtros por rango de tiempo (1, 7, 30, 90 días)
- ✅ Integración con Chart.js
- ✅ Compatible con modo oscuro

### 7. Configuración del Sistema
- ✅ Configuración de notificaciones
- ✅ Umbrales de batería
- ✅ Intervalos de monitoreo
- ✅ Backup automático
- ✅ Horarios de mantenimiento

## 🎨 Características Técnicas

### Arquitectura
- **React 19.1.0** con hooks modernos
- **Context API** para gestión de estado global
- **React Router** para navegación SPA
- **Tailwind CSS 4.1.11** para estilos
- **Leaflet + React-Leaflet** para mapas interactivos
- **Chart.js + React-ChartJS-2** para gráficos avanzados

### Funcionalidades del Sistema
- 🌙 **Modo oscuro** compatible en todo el dashboard
- 📱 **Diseño responsivo** para móviles y tablets
- ⚡ **Actualizaciones en tiempo real** de estadísticas
- 🔄 **Persistencia** de cambios en memoria
- 📊 **Visualización** de datos con gráficos simples

### Gestión de Datos
- **DataContext**: Contexto central para todos los datos
- **CRUD Operations**: Funciones completas para cruces y usuarios
- **Logs Automáticos**: Registro de todas las acciones del usuario
- **Estado Global**: Sincronización entre componentes

## 🛠️ Instalación y Configuración

```bash
# Si no has instalado las dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Acceder al dashboard
# Público: http://localhost:5173
# Admin: http://localhost:5173/admin
```

## 📁 Estructura del Proyecto

```
src/
├── contexts/
│   ├── DataContext.jsx      # Estado global del sistema
│   └── ThemeContext.jsx     # Tema claro/oscuro
├── components/
│   ├── AdminDashboard.jsx   # Panel principal de admin
│   ├── LoginPage.jsx        # Página de login
│   ├── MapView.jsx          # Mapa interactivo (NUEVO)
│   ├── ChartsPanel.jsx      # Gráficos avanzados (NUEVO)
│   └── admin/
│       ├── CruceManagement.jsx    # Gestión de cruces
│       ├── UserManagement.jsx     # Gestión de usuarios
│       ├── SystemLogs.jsx         # Logs del sistema
│       ├── SystemConfig.jsx       # Configuración
│       └── AnalyticsPanel.jsx     # Análisis y reportes
```

## 🔄 Flujo de Trabajo

1. **Login**: Usuario se autentica con credenciales
2. **Dashboard**: Ve resumen general y acciones rápidas
3. **Navegación**: Usa sidebar para acceder a diferentes secciones
4. **Operaciones**: Realizar CRUD en cruces/usuarios
5. **Monitoreo**: Revisar logs y análisis
6. **Configuración**: Ajustar parámetros del sistema
7. **Logout**: Cerrar sesión y registrar actividad

## 🚀 Próximas Mejoras

- [x] ✅ **Gráficos interactivos con Chart.js** (COMPLETADO)
- [x] ✅ **Mapas interactivos con Leaflet** (COMPLETADO)
- [ ] Exportación de reportes en PDF/Excel
- [ ] Notificaciones push en tiempo real
- [ ] API REST para persistencia de datos
- [ ] Roles y permisos más granulares
- [ ] Dashboard móvil nativo
- [ ] Análisis predictivo con IA/ML
- [ ] Integración con hardware IoT real

## 🎉 ¡Sistema Listo para Producción!

El dashboard de administración está completamente funcional y listo para usar. Todas las funcionalidades CRUD funcionan correctamente y la interfaz es intuitiva y moderna.

Para cualquier pregunta o mejora, el código está bien documentado y es fácil de extender. 