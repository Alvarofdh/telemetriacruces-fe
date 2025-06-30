# 🚆 Sistema de Monitoreo de Cruces Ferroviarios

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
- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone [url-del-repositorio]
cd telemetriacruces-fe
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

4. **Construir para producción**
```bash
npm run build
```

5. **Previsualizar la construcción**
```bash
npm run preview
```

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
npm run dev      # Servidor de desarrollo
npm run build    # Construcción para producción
npm run preview  # Previsualizar construcción
npm run lint     # Linter de código
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

## 🔮 Próximas Características

- Integración con API backend
- Mapas interactivos con ubicación de cruces
- Gráficos de estadísticas históricas
- Sistema de usuarios y autenticación
- Notificaciones push en tiempo real
- Exportación de reportes en PDF

