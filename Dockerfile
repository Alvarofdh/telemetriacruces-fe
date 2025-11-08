# Dockerfile para Viametrica Frontend
# Optimizado para producción con Caprover
# Basado en mejores prácticas de Docker multi-stage builds

# ============================================
# ETAPA 1: BUILD
# ============================================
FROM node:20-alpine AS builder

# Metadatos de la imagen
LABEL maintainer="Viametrica Team"
LABEL description="Viametrica Frontend - Sistema de Monitoreo de Cruces Ferroviarios"
LABEL version="1.0.0"

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias para el build
RUN apk add --no-cache \
	git \
	&& rm -rf /var/cache/apk/*

# Copiar archivos de dependencias primero (mejor cache de Docker)
COPY package.json package-lock.json* ./

# Instalar dependencias con npm ci (más rápido y determinístico)
RUN npm ci --prefer-offline --no-audit --progress=false && \
	npm cache clean --force

# Copiar el resto del código fuente
COPY . .

# Argumentos de build (Caprover los pasa automáticamente desde App Configs)
ARG VITE_API_BASE_URL
ARG VITE_API_TIMEOUT=5000
ARG VITE_APP_ENV=production
ARG VITE_APP_NAME=Viametrica
ARG VITE_APP_VERSION=1.0.0
ARG VITE_DEBUG_MODE=false
ARG VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
ARG VITE_REFRESH_INTERVAL=30000

# Establecer variables de entorno para el build de Vite
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_TIMEOUT=$VITE_API_TIMEOUT
ENV VITE_APP_ENV=$VITE_APP_ENV
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_DEBUG_MODE=$VITE_DEBUG_MODE
ENV VITE_MAP_TILE_URL=$VITE_MAP_TILE_URL
ENV VITE_REFRESH_INTERVAL=$VITE_REFRESH_INTERVAL

# Variables de Node.js para optimizar el build
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Mostrar configuración del build (solo si DEBUG está activo)
RUN if [ "$VITE_DEBUG_MODE" = "true" ]; then \
	echo "🔧 Building Viametrica Frontend" && \
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && \
	echo "VITE_API_BASE_URL=$VITE_API_BASE_URL" && \
	echo "VITE_APP_ENV=$VITE_APP_ENV" && \
	echo "VITE_APP_NAME=$VITE_APP_NAME" && \
	echo "VITE_APP_VERSION=$VITE_APP_VERSION" && \
	echo "VITE_DEBUG_MODE=$VITE_DEBUG_MODE" && \
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; \
	fi

# Build de la aplicación con Vite
RUN npm run build

# Verificar que el build fue exitoso
RUN if [ ! -d "/app/dist" ] || [ -z "$(ls -A /app/dist)" ]; then \
	echo "❌ ERROR: Build failed - dist directory is empty or missing" && \
	exit 1; \
	fi

# Mostrar información del build
RUN echo "✅ Build completed successfully!" && \
	echo "📦 Build size:" && \
	du -sh /app/dist && \
	echo "📁 Files in dist:" && \
	ls -lah /app/dist | head -10

# ============================================
# ETAPA 2: PRODUCCIÓN CON NGINX
# ============================================
FROM nginx:alpine

# Metadatos de la imagen de producción
LABEL maintainer="Viametrica Team"
LABEL description="Viametrica Frontend - Nginx Production Server"
LABEL version="1.0.0"

# Instalar wget para health check
RUN apk add --no-cache wget && \
	rm -rf /var/cache/apk/*

# Crear directorio para logs personalizados
RUN mkdir -p /var/log/nginx/viametrica

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar los archivos build desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Verificar que los archivos se copiaron correctamente
RUN if [ ! -f "/usr/share/nginx/html/index.html" ]; then \
	echo "❌ ERROR: index.html not found in nginx html directory" && \
	exit 1; \
	fi

# Crear archivo de versión para debugging
RUN echo "Viametrica v${VITE_APP_VERSION:-1.0.0}" > /usr/share/nginx/html/version.txt && \
	echo "Build date: $(date -u +'%Y-%m-%d %H:%M:%S UTC')" >> /usr/share/nginx/html/version.txt

# Establecer permisos correctos
RUN chown -R nginx:nginx /usr/share/nginx/html && \
	chmod -R 755 /usr/share/nginx/html && \
	chown -R nginx:nginx /var/log/nginx && \
	chmod -R 755 /var/log/nginx

# Exponer puerto 80
EXPOSE 80

# Health check mejorado
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
	CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Comando para iniciar Nginx en modo foreground
CMD ["nginx", "-g", "daemon off;"]
