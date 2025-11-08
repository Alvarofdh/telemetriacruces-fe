# 🚆 Viametrica - Sistema de Monitoreo de Cruces Ferroviarios

Sistema web moderno para el monitoreo en tiempo real de cruces ferroviarios inteligentes, desarrollado con React + Vite y Tailwind CSS.

## ✨ Características Principales

### 🎯 Dashboard Principal
- **Panel de estadísticas** con métricas en tiempo real
- **Indicadores visuales** de estado del sistema
- **Diseño responsivo** que se adapta a cualquier dispositivo
- **Actualizaciones en tiempo real** del estado de conexión

### 🔍 Sistema de Filtrado y Búsqueda
- **Búsqueda inteligente** por nombre de cruce o ubicación
- **Filtros por estado**: Todos, Activo, Mantenimiento, Inactivo
- **Resultados dinámicos** que se actualizan en tiempo real
- **Contador de resultados** con información contextual

### 📊 Tarjetas de Cruces Inteligentes
- **Información detallada** de cada cruce ferroviario
- **Indicadores visuales** del estado de batería
- **Barras de progreso** para nivel de batería
- **Información expandible** con detalles adicionales
- **Estados visuales** con códigos de color intuitivos

### 🚨 Centro de Alertas
- **Panel de notificaciones** en tiempo real
- **Clasificación de alertas**: Crítico, Advertencia, Información
- **Sistema de lectura** para marcar alertas como vistas
- **Contador de alertas** no leídas
- **Historial completo** de eventos

### 🎨 Diseño y UX
- **Interfaz moderna** con gradientes y sombras
- **Animaciones suaves** para mejor experiencia de usuario
- **Iconografía consistente** con SVG optimizados
- **Tema coherente** con paleta de colores profesional
- **Microinteracciones** que mejoran la usabilidad

## 🛠️ Tecnologías Utilizadas

- **React 19.1.0** - Biblioteca de interfaz de usuario
- **Vite 7.0.0** - Herramienta de construcción rápida
- **Tailwind CSS 4.1.11** - Framework de CSS utilitario
- **JavaScript ES6+** - Lenguaje de programación moderno

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── AlertPanel.jsx      # Panel de alertas y notificaciones
│   ├── CrossingCard.jsx    # Tarjeta individual de cruce
│   ├── CrossingList.jsx    # Lista de cruces con filtros
├── App.jsx                 # Componente principal de la aplicación
├── main.jsx               # Punto de entrada de React
└── index.css              # Estilos globales y Tailwind
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn
- Git

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone [url-del-repositorio]
cd cruces-ferroviarios-fe
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Edita .env con tus configuraciones
```

Variables de entorno disponibles:
- `VITE_API_BASE_URL`: URL de la API del ESP32
- `VITE_API_TIMEOUT`: Timeout para peticiones (ms)
- `VITE_DEBUG_MODE`: Habilitar logs de debug
- Ver `.env.example` para todas las opciones

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

5. **Construir para producción**
```bash
npm run build
```

6. **Previsualizar la construcción**
```bash
npm run preview
```

### 🐳 Despliegue con Docker/Caprover

Ver la guía completa en [DEPLOY.md](./DEPLOY.md) para instrucciones detalladas de despliegue en producción.

## 📱 Funcionalidades del Sistema

### Panel de Estadísticas
- Total de cruces en el sistema
- Número de cruces activos
- Cruces en mantenimiento
- Cruces inactivos
- Alertas de batería crítica

### Monitoreo de Cruces
- **Estado en tiempo real**: Activo, Mantenimiento, Inactivo
- **Nivel de batería**: Con alertas visuales para niveles críticos
- **Sensores activos**: Contador de sensores funcionando
- **Ubicación**: Información de kilómetro y ruta
- **Última actividad**: Timestamp de la última detección
- **Tipo de tren**: Clasificación del último tren detectado
- **Velocidad promedio**: Estadística de velocidad

### Sistema de Alertas
- **Alertas críticas**: Batería baja, fallos de sistema
- **Advertencias**: Sensores desconectados, velocidades elevadas
- **Información**: Mantenimientos completados, actualizaciones
- **Gestión de lectura**: Marcar alertas como leídas/no leídas

## 🎨 Guía de Estilos

### Colores del Sistema
- **Azul**: #3B82F6 (Primario)
- **Verde**: #10B981 (Activo/Éxito)
- **Amarillo**: #F59E0B (Advertencia)
- **Rojo**: #EF4444 (Crítico/Error)
- **Gris**: #6B7280 (Neutro)

### Estados Visuales
- **🟢 Activo**: Verde - Sistema funcionando correctamente
- **🟡 Mantenimiento**: Amarillo - En proceso de mantenimiento
- **🔴 Inactivo**: Rojo - Sistema no operativo

## 🔧 Scripts Disponibles

```bash
npm run dev                  # Servidor de desarrollo
npm run build                # Construcción para producción
npm run build:production     # Build optimizado para producción
npm run preview              # Previsualizar construcción
npm run preview:production   # Preview en puerto 8080
npm run lint                 # Linter de código
npm run clean                # Limpiar archivos de build
npm run deploy:caprover      # Desplegar a Caprover
npm run check                # Verificar linting y build
```

## 🌐 Configuración de Vite

El proyecto utiliza Vite con las siguientes configuraciones:
- Plugin de React para JSX
- Plugin de Tailwind CSS v4
- Hot Module Replacement (HMR)
- Optimizaciones de desarrollo

## 📊 Datos de Ejemplo

El sistema incluye datos de ejemplo para 8 cruces ferroviarios:
- Cruce La Serena
- Cruce Coquimbo  
- Cruce Ovalle
- Cruce Vicuña
- Cruce Illapel
- Cruce Los Vilos
- Cruce Salamanca
- Cruce Combarbalá

## 📚 Documentación Adicional

- [DEPLOY.md](./DEPLOY.md) - Guía completa de despliegue en producción
- [SECURITY.md](./SECURITY.md) - Mejores prácticas de seguridad
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guía para contribuidores
- [CHANGELOG.md](./CHANGELOG.md) - Historial de cambios
- [README_ADMIN.md](./README_ADMIN.md) - Documentación del panel de administración

## 🔒 Seguridad

Este proyecto implementa las siguientes medidas de seguridad:
- Variables de entorno para datos sensibles
- Headers de seguridad en Nginx
- HTTPS en producción
- Protección contra XSS y CSRF
- Credenciales configurables

Ver [SECURITY.md](./SECURITY.md) para más detalles.

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee [CONTRIBUTING.md](./CONTRIBUTING.md) para conocer el proceso.

## 📄 Licencia

Este proyecto es de código cerrado y propiedad de [Tu Organización].

## 👥 Equipo

Desarrollado por Viametrica para el monitoreo inteligente de cruces ferroviarios.

## 📞 Soporte

Para soporte técnico o reportar problemas:
- Abre un issue en GitHub
- Contacta al equipo de desarrollo

