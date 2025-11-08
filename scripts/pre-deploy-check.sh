#!/bin/bash

# Script de verificación pre-despliegue
# Verifica que todo esté listo para producción

set -e

echo "🔍 Verificación Pre-Despliegue - Viametrica"
echo "=================================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir éxito
print_success() {
	echo -e "${GREEN}✓${NC} $1"
}

# Función para imprimir error
print_error() {
	echo -e "${RED}✗${NC} $1"
}

# Función para imprimir advertencia
print_warning() {
	echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Verificar que existe .env.example
echo "1. Verificando archivos de configuración..."
if [ -f ".env.example" ]; then
	print_success ".env.example existe"
else
	print_error ".env.example no encontrado"
	exit 1
fi

# 2. Verificar que .env no está en git
echo ""
echo "2. Verificando .gitignore..."
if grep -q "^\.env$" .gitignore; then
	print_success ".env está en .gitignore"
else
	print_warning ".env no está en .gitignore - AGRÉGALO"
fi

# 3. Verificar que existen archivos de Docker
echo ""
echo "3. Verificando archivos de Docker..."
if [ -f "Dockerfile" ]; then
	print_success "Dockerfile existe"
else
	print_error "Dockerfile no encontrado"
	exit 1
fi

if [ -f "captain-definition" ]; then
	print_success "captain-definition existe"
else
	print_error "captain-definition no encontrado"
	exit 1
fi

if [ -f ".dockerignore" ]; then
	print_success ".dockerignore existe"
else
	print_warning ".dockerignore no encontrado"
fi

# 4. Verificar que existe nginx.conf
echo ""
echo "4. Verificando configuración de Nginx..."
if [ -f "nginx.conf" ]; then
	print_success "nginx.conf existe"
else
	print_error "nginx.conf no encontrado"
	exit 1
fi

# 5. Verificar dependencias
echo ""
echo "5. Verificando dependencias..."
if [ -d "node_modules" ]; then
	print_success "node_modules existe"
else
	print_warning "node_modules no encontrado - ejecuta 'npm install'"
fi

# 6. Ejecutar linter
echo ""
echo "6. Ejecutando linter..."
if npm run lint > /dev/null 2>&1; then
	print_success "Linter pasó sin errores"
else
	print_warning "Linter encontró problemas - revisa con 'npm run lint'"
fi

# 7. Intentar build
echo ""
echo "7. Intentando build de producción..."
if npm run build > /dev/null 2>&1; then
	print_success "Build completado exitosamente"
	
	# Verificar que dist existe
	if [ -d "dist" ]; then
		print_success "Directorio dist creado"
		
		# Verificar tamaño del build
		BUILD_SIZE=$(du -sh dist | cut -f1)
		echo "   Tamaño del build: $BUILD_SIZE"
	fi
else
	print_error "Build falló - revisa los errores"
	exit 1
fi

# 8. Verificar documentación
echo ""
echo "8. Verificando documentación..."
DOCS=("README.md" "DEPLOY.md" "SECURITY.md" "CONTRIBUTING.md" "CHANGELOG.md")
for doc in "${DOCS[@]}"; do
	if [ -f "$doc" ]; then
		print_success "$doc existe"
	else
		print_warning "$doc no encontrado"
	fi
done

# 9. Verificar variables de entorno críticas
echo ""
echo "9. Verificando variables de entorno en .env.example..."
REQUIRED_VARS=("VITE_API_BASE_URL" "VITE_APP_ENV" "VITE_ADMIN_USERNAME" "VITE_ADMIN_PASSWORD")
for var in "${REQUIRED_VARS[@]}"; do
	if grep -q "^$var=" .env.example; then
		print_success "$var definida"
	else
		print_error "$var no encontrada en .env.example"
		exit 1
	fi
done

# Resumen final
echo ""
echo "=================================================="
echo -e "${GREEN}✓ Verificación completada exitosamente${NC}"
echo ""
echo "📋 Checklist antes de desplegar:"
echo "  1. Configura las variables de entorno en Caprover"
echo "  2. Cambia las credenciales de administrador"
echo "  3. Configura la URL de la API de producción"
echo "  4. Habilita HTTPS en Caprover"
echo "  5. Configura tu dominio personalizado"
echo ""
echo "🚀 Listo para desplegar con: npm run deploy:caprover"
echo "=================================================="

