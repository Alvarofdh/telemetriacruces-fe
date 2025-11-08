# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir al proyecto Cruces Ferroviarios!

## 📋 Antes de Empezar

1. Lee el `README.md` para entender el proyecto
2. Revisa `SECURITY.md` para conocer las mejores prácticas de seguridad
3. Familiarízate con el código existente

## 🔧 Configuración del Entorno de Desarrollo

1. **Clonar el repositorio**:
```bash
git clone <url-del-repositorio>
cd cruces-ferroviarios-fe
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
```bash
cp .env.example .env
# Edita .env con tus configuraciones locales
```

4. **Iniciar el servidor de desarrollo**:
```bash
npm run dev
```

## 📝 Estándares de Código

### Estilo de Código

Este proyecto usa:
- **Tabulaciones** para indentación (4 espacios)
- **ESLint** para linting
- **Prettier** para formateo automático

### Convenciones

1. **Nombres de archivos**: 
   - Componentes: `PascalCase.jsx` (ej: `CruceDetail.jsx`)
   - Utilidades: `camelCase.js` (ej: `api.js`)
   - Constantes: `UPPER_SNAKE_CASE` (ej: `API_CONFIG`)

2. **Nombres de variables**:
   - Variables: `camelCase`
   - Constantes: `UPPER_SNAKE_CASE`
   - Componentes: `PascalCase`

3. **Comentarios**:
   - Usa comentarios para explicar "por qué", no "qué"
   - Documenta funciones complejas
   - Mantén los comentarios actualizados

## 🌿 Flujo de Trabajo con Git

### Branches

- `main`: Código en producción
- `pruebas`: Código en pruebas/staging
- `feature/nombre-feature`: Nuevas características
- `fix/nombre-bug`: Corrección de bugs
- `hotfix/nombre-urgente`: Correcciones urgentes en producción

### Commits

Usa mensajes de commit descriptivos siguiendo este formato:

```
tipo(alcance): descripción breve

Descripción más detallada si es necesario.

- Punto adicional 1
- Punto adicional 2
```

**Tipos de commit**:
- `feat`: Nueva característica
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan el código)
- `refactor`: Refactorización de código
- `test`: Añadir o modificar tests
- `chore`: Tareas de mantenimiento

**Ejemplos**:
```bash
git commit -m "feat(cruces): añadir filtro por región"
git commit -m "fix(api): corregir timeout en peticiones"
git commit -m "docs(deploy): actualizar guía de Caprover"
```

## 🔄 Proceso de Contribución

1. **Crear un branch**:
```bash
git checkout -b feature/mi-nueva-caracteristica
```

2. **Hacer cambios**:
   - Escribe código limpio y bien documentado
   - Sigue los estándares del proyecto
   - Prueba tus cambios localmente

3. **Commit de cambios**:
```bash
git add .
git commit -m "feat(componente): descripción del cambio"
```

4. **Push al repositorio**:
```bash
git push origin feature/mi-nueva-caracteristica
```

5. **Crear Pull Request**:
   - Describe claramente los cambios
   - Referencia issues relacionados
   - Espera revisión del código

## ✅ Checklist antes de Pull Request

- [ ] El código sigue los estándares del proyecto
- [ ] Los cambios han sido probados localmente
- [ ] No hay errores de linting (`npm run lint`)
- [ ] El build funciona correctamente (`npm run build`)
- [ ] Se actualizó la documentación si es necesario
- [ ] Los commits tienen mensajes descriptivos
- [ ] No se incluyeron archivos sensibles (.env, etc.)

## 🧪 Testing

Antes de enviar tu PR:

```bash
# Verificar linting
npm run lint

# Verificar build
npm run build

# Previsualizar build
npm run preview
```

## 📚 Áreas donde Puedes Contribuir

### Características Nuevas
- Mejoras en el dashboard
- Nuevos tipos de gráficos
- Filtros adicionales
- Notificaciones push
- Integración con otros servicios

### Mejoras
- Optimización de rendimiento
- Mejoras de UI/UX
- Accesibilidad
- Internacionalización (i18n)
- Tests automatizados

### Documentación
- Mejorar README
- Añadir ejemplos
- Traducir documentación
- Crear tutoriales

### Bugs
- Reportar bugs encontrados
- Corregir bugs existentes
- Mejorar manejo de errores

## 🐛 Reportar Bugs

Cuando reportes un bug, incluye:

1. **Descripción clara** del problema
2. **Pasos para reproducir**:
   - Paso 1
   - Paso 2
   - ...
3. **Comportamiento esperado**
4. **Comportamiento actual**
5. **Screenshots** (si aplica)
6. **Entorno**:
   - Navegador y versión
   - Sistema operativo
   - Versión de la aplicación

## 💡 Sugerir Características

Para sugerir nuevas características:

1. Verifica que no exista ya una sugerencia similar
2. Describe claramente la característica
3. Explica por qué sería útil
4. Proporciona ejemplos de uso si es posible

## 📞 Contacto

Si tienes preguntas o necesitas ayuda:
- Abre un issue en GitHub
- Contacta al equipo de desarrollo

## 📜 Código de Conducta

- Sé respetuoso con otros contribuidores
- Acepta críticas constructivas
- Enfócate en lo mejor para el proyecto
- Mantén un ambiente profesional y amigable

---

¡Gracias por contribuir! 🎉

