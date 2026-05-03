#!/bin/bash

# Script para configurar archivos .env según el entorno

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "================================================"
echo "   Configuración de Variables de Entorno"
echo "================================================"
echo ""

# Preguntar por el entorno
echo "Selecciona el entorno a configurar:"
echo "  1) Desarrollo (development)"
echo "  2) Producción (production)"
echo "  3) Test (test)"
echo ""
read -p "Opción [1-3]: " env_option

case $env_option in
  1)
    ENV_TYPE="development"
    SOURCE_SUFFIX=".development.example"
    ;;
  2)
    ENV_TYPE="production"
    SOURCE_SUFFIX=".example"
    ;;
  3)
    ENV_TYPE="test"
    SOURCE_SUFFIX=".example"
    ;;
  *)
    echo -e "${RED}❌ Opción inválida${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${YELLOW}📋 Configurando entorno: $ENV_TYPE${NC}"
echo ""

# Función para copiar archivo .env
copy_env_file() {
  local source=$1
  local dest=$2
  local package_name=$3
  
  if [ -f "$dest" ]; then
    read -p "⚠️  $dest ya existe. ¿Sobrescribir? [s/N]: " overwrite
    if [[ ! $overwrite =~ ^[Ss]$ ]]; then
      echo -e "${YELLOW}⏭️  Omitiendo $package_name${NC}"
      return
    fi
  fi
  
  if [ -f "$source" ]; then
    cp "$source" "$dest"
    echo -e "${GREEN}✅ $package_name configurado${NC}"
  else
    echo -e "${RED}❌ Error: $source no encontrado${NC}"
    exit 1
  fi
}

# Copiar archivos .env
echo "Copiando archivos de configuración..."
echo ""

copy_env_file ".env${SOURCE_SUFFIX}" ".env" "Raíz"
copy_env_file "packages/front/.env${SOURCE_SUFFIX}" "packages/front/.env" "Frontend"
copy_env_file "packages/api/.env${SOURCE_SUFFIX}" "packages/api/.env" "Backend"
copy_env_file "packages/afip-api/.env${SOURCE_SUFFIX}" "packages/afip-api/.env" "AFIP API"

echo ""
echo -e "${GREEN}✅ Configuración completada${NC}"
echo ""

if [ "$ENV_TYPE" = "production" ] || [ "$ENV_TYPE" = "test" ]; then
  echo -e "${YELLOW}⚠️  IMPORTANTE: Recuerda editar los archivos .env para:${NC}"
  echo "   - Actualizar contraseñas de base de datos"
  echo "   - Configurar secrets de JWT"
  echo "   - Verificar dominios y URLs"
  echo "   - Actualizar credenciales de servicios externos"
  echo ""
fi

echo "Ahora puedes ejecutar:"
echo -e "${GREEN}  ./entrypoint.sh${NC}"
echo ""
