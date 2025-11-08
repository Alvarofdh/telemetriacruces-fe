# Etapa 1: Build
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production=false

# Copiar el resto del código
COPY . .

# Argumentos de build para variables de entorno
ARG VITE_API_BASE_URL
ARG VITE_API_TIMEOUT=5000
ARG VITE_APP_ENV=production
ARG VITE_APP_NAME="Viametrica"
ARG VITE_APP_VERSION=1.0.0
ARG VITE_DEBUG_MODE=false
ARG VITE_MAP_TILE_URL="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
ARG VITE_REFRESH_INTERVAL=30000

# Establecer variables de entorno para el build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_TIMEOUT=$VITE_API_TIMEOUT
ENV VITE_APP_ENV=$VITE_APP_ENV
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_DEBUG_MODE=$VITE_DEBUG_MODE
ENV VITE_MAP_TILE_URL=$VITE_MAP_TILE_URL
ENV VITE_REFRESH_INTERVAL=$VITE_REFRESH_INTERVAL

# Build de la aplicación
RUN npm run build

# Etapa 2: Producción con Nginx
FROM nginx:alpine

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar los archivos build desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
	CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]

