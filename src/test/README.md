# Tests - Sistema de Monitoreo de Cruces Ferroviarios

## 📋 Descripción

Este directorio contiene los **smoke tests** básicos para verificar la funcionalidad crítica del sistema.

## 🧪 Tests Implementados

### 1. **Login + Routing** (`auth/login.test.jsx`)
- ✅ Renderiza formulario de login
- ✅ Redirige al dashboard después de login exitoso
- ✅ Muestra mensaje de error en caso de fallo

### 2. **Auto-logout** (`hooks/useAutoLogout.test.jsx`)
- ✅ No dispara logout si hay actividad del usuario
- ✅ Dispara logout después del período de inactividad
- ✅ No se activa si no hay usuario logueado

### 3. **Data Loading** (`data/cruces.test.jsx`)
- ✅ Renderiza estado de carga inicialmente
- ✅ Renderiza tarjetas de cruces después de cargar
- ✅ Filtra cruces por estado
- ✅ Busca cruces por nombre o ubicación

### 4. **ControlPanel Roles** (`control/controlpanel.test.jsx`)
- ✅ Renderiza AdminPanel para rol ADMIN
- ✅ Renderiza MaintenancePanel para rol MAINTENANCE
- ✅ Renderiza ObserverPanel para rol OBSERVER
- ✅ Redirige al dashboard si no tiene rol válido

### 5. **NotificationPanel** (`notifications/notificationpanel.test.jsx`)
- ✅ Renderiza panel de notificaciones con título
- ✅ Muestra alertas después de cargar
- ✅ Muestra contador de no leídas
- ✅ Marca notificación como leída al hacer click
- ✅ Muestra estado vacío cuando no hay alertas

## 🚀 Ejecutar Tests

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests en modo watch
npm run test

# Ejecutar tests una vez (CI)
npm run test:run

# Ejecutar tests con UI
npm run test:ui

# Ejecutar tests con coverage
npm run test:coverage
```

## ⚠️ Problema Conocido

**Error con Rollup**: Hay un problema conocido con npm y las dependencias opcionales de rollup. Si encuentras el error:

```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

**Solución temporal**:
```bash
rm -rf node_modules package-lock.json
npm install --include=optional
```

O instalar manualmente:
```bash
npm install --save-optional @rollup/rollup-linux-x64-gnu
```

## 📁 Estructura

```
src/test/
├── README.md                    # Este archivo
├── setupTests.js                # Configuración global de tests
├── utils/
│   └── testUtils.jsx          # Utilidades para tests (renderWithProviders, mocks)
├── auth/
│   └── login.test.jsx          # Tests de autenticación
├── hooks/
│   └── useAutoLogout.test.jsx  # Tests de auto-logout
├── data/
│   └── cruces.test.jsx         # Tests de carga de datos
├── control/
│   └── controlpanel.test.jsx   # Tests de paneles de control
└── notifications/
    └── notificationpanel.test.jsx # Tests de panel de notificaciones
```

## 🛠️ Configuración

### `vitest.config.js`
- Entorno: `jsdom` (simula DOM del navegador)
- Setup: `src/test/setupTests.js`
- Aliases: `@` → `src/`

### `setupTests.js`
- Configura `@testing-library/jest-dom`
- Mocks de `window.matchMedia`
- Mocks de `IntersectionObserver` y `ResizeObserver`
- Limpieza automática después de cada test

## 📝 Escribir Nuevos Tests

### Ejemplo Básico

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyComponent } from '../../components/MyComponent'
import { renderWithProviders } from '../utils/testUtils'

describe('MyComponent', () => {
  it('should render correctly', () => {
    renderWithProviders(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Mocking de Servicios

```jsx
import * as myService from '../../services/myService'

vi.mock('../../services/myService', () => ({
  getData: vi.fn(),
}))

// En el test
vi.mocked(myService.getData).mockResolvedValue({ data: 'test' })
```

### Mocking de Hooks

```jsx
import * as useMyHook from '../../hooks/useMyHook'

vi.mock('../../hooks/useMyHook', () => ({
  useMyHook: vi.fn(),
}))

// En el test
vi.mocked(useMyHook.useMyHook).mockReturnValue({ value: 'test' })
```

## ✅ Checklist para Nuevos Tests

- [ ] Usar `renderWithProviders` para componentes que usan contextos
- [ ] Mockear servicios externos (API, Socket.IO)
- [ ] Mockear hooks personalizados si es necesario
- [ ] Limpiar mocks en `beforeEach`
- [ ] Usar `waitFor` para operaciones asíncronas
- [ ] Verificar estados de carga y error
- [ ] Verificar interacciones del usuario (clicks, inputs)

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro)

---

**Última actualización**: 2025-01-15  
**Versión**: 1.0.0


