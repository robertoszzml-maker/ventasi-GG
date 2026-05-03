#!/bin/bash
set -e  # Detiene el script si hay errores

# Verificar que exista el archivo .env en la raíz
if [ ! -f .env ]; then
  echo "❌ Error: No se encontró el archivo .env en la raíz"
  echo "📝 Por favor, copia uno de los archivos de ejemplo:"
  echo "   - Para desarrollo: cp .env.development.example .env"
  echo "   - Para producción: cp .env.example .env"
  exit 1
fi

# Cargar variables desde el archivo .env de la raíz
export $(grep -v '^#' .env | xargs)

# Verificar que APP_ENV esté definido
if [ -z "$APP_ENV" ]; then
  echo "❌ Error: La variable APP_ENV no está definida en .env"
  exit 1
fi

# Verificar que SERVER_NAME esté definido (necesario para nginx)
if [ -z "$SERVER_NAME" ]; then
  echo "❌ Error: La variable SERVER_NAME no está definida en .env"
  echo "📝 Ejemplo: SERVER_NAME=mi-dominio.com"
  exit 1
fi

echo "📢 Entorno: $APP_ENV"
echo "📢 Servidor: $SERVER_NAME"
echo "📢 Usando archivo .env de la raíz y archivos .env de cada paquete"

# Verificar que existan los archivos .env en cada paquete
echo "🔍 Verificando archivos .env de los paquetes..."
for package in "packages/front" "packages/api" "packages/afip-api"; do
  if [ ! -f "$package/.env" ]; then
    echo "❌ Error: No se encontró $package/.env"
    echo "📝 Copia el archivo de ejemplo correspondiente al entorno:"
    echo "   cd $package && cp .env.development.example .env  (desarrollo)"
    echo "   cd $package && cp .env.example .env              (producción)"
    exit 1
  fi
done
echo "✅ Todos los archivos .env están presentes"

# Elimina Cache de construccion
echo "🧹 Limpiando cache de Docker..."
docker builder prune -f

# Generar nginx.conf desde el template usando las variables de entorno
echo "📋 Generando configuración de Nginx desde template..."
if [ ! -f "nginx.conf.template" ]; then
  echo "❌ Error: nginx.conf.template no encontrado"
  exit 1
fi

# Usar envsubst para reemplazar variables en el template
envsubst '${SERVER_NAME}' < nginx.conf.template > nginx.conf
echo "✅ nginx.conf generado para $SERVER_NAME"

# Detener y eliminar contenedores, redes y volúmenes anónimos
echo "🛑 Deteniendo contenedores existentes..."
docker compose down

# Eliminar imágenes dangling si existen
if [ -n "$(docker images -f "dangling=true" -q)" ]; then
  echo "🗑️  Eliminando imágenes dangling..."
  docker rmi $(docker images -f "dangling=true" -q)
else
  echo "✅ No hay imágenes dangling para eliminar."
fi

# Construir y levantar contenedores en modo detach (-d)
echo "🚀 Construyendo y levantando contenedores..."
docker compose up --build -d

echo "✅ Stack levantado exitosamente en modo $APP_ENV"

