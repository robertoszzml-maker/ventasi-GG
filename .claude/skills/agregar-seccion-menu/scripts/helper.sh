#!/bin/bash

# Helper script para validar secciones del menú

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para validar permisos
validate_permissions() {
    local permiso=$1
    local backend_file="packages/api/src/constants/permisos.ts"
    local frontend_file="packages/front/src/constants/permisos.ts"

    echo "Validando permiso: ${permiso}"
    echo ""

    local errors=0

    # Verificar en backend
    if ! grep -q "${permiso}:" "${backend_file}"; then
        echo -e "${RED}✗${NC} Permiso no existe en backend: ${backend_file}"
        ((errors++))
    else
        echo -e "${GREEN}✓${NC} Permiso existe en backend"
    fi

    # Verificar en frontend
    if ! grep -q "${permiso}:" "${frontend_file}"; then
        echo -e "${RED}✗${NC} Permiso no existe en frontend: ${frontend_file}"
        ((errors++))
    else
        echo -e "${GREEN}✓${NC} Permiso existe en frontend"
    fi

    # Verificar que sean idénticos
    local backend_value=$(grep "${permiso}:" "${backend_file}" | sed "s/.*: '\(.*\)'.*/\1/")
    local frontend_value=$(grep "${permiso}:" "${frontend_file}" | sed "s/.*: '\(.*\)'.*/\1/")

    if [ "${backend_value}" != "${frontend_value}" ]; then
        echo -e "${RED}✗${NC} Permisos diferentes entre backend y frontend"
        echo "   Backend: ${backend_value}"
        echo "   Frontend: ${frontend_value}"
        ((errors++))
    else
        echo -e "${GREEN}✓${NC} Permisos idénticos"
    fi

    echo ""
    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}Permiso validado correctamente${NC}"
    else
        echo -e "${RED}Se encontraron ${errors} errores${NC}"
        exit 1
    fi
}

# Función para validar iconos
validate_icon() {
    local icon=$1

    echo "Validando icono: ${icon}"
    echo ""

    # Verificar que sea PascalCase (primera letra mayúscula)
    if [[ ${icon:0:1} != [A-Z] ]]; then
        echo -e "${RED}✗${NC} Icono debe estar en PascalCase (primera letra mayúscula)"
        echo "   Actual: ${icon}"
        echo "   Ejemplo: Truck (no truck)"
        exit 1
    fi

    # Verificar que no sea JSX
    if [[ $icon == *"<"* ]] || [[ $icon == *">"* ]]; then
        echo -e "${RED}✗${NC} Icono no debe ser JSX"
        echo "   Usar: Truck"
        echo "   No usar: <Truck />"
        exit 1
    fi

    # Verificar que no sea FontAwesome
    if [[ $icon == fa-* ]]; then
        echo -e "${RED}✗${NC} No usar FontAwesome, usar Lucide React"
        echo "   Buscar en: https://lucide.dev/icons"
        exit 1
    fi

    echo -e "${GREEN}✓${NC} Icono válido"
}

# Función para validar routes.ts
validate_routes() {
    local routes_file="packages/api/src/constants/routes.ts"

    echo "Validando routes.ts..."
    echo ""

    local errors=0

    # Verificar que el archivo existe
    if [ ! -f "${routes_file}" ]; then
        echo -e "${RED}✗${NC} Archivo no existe: ${routes_file}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Archivo routes.ts existe"

    # Verificar estructura MENU
    if ! grep -q "export const MENU" "${routes_file}"; then
        echo -e "${RED}✗${NC} Falta export const MENU"
        ((errors++))
    else
        echo -e "${GREEN}✓${NC} export const MENU encontrado"
    fi

    # Verificar uso de PERMISOS
    if ! grep -q "PERMISOS\." "${routes_file}"; then
        echo -e "${YELLOW}⚠${NC} No se encontraron constantes PERMISOS"
    else
        echo -e "${GREEN}✓${NC} Usa constantes PERMISOS"
    fi

    echo ""
    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}routes.ts validado correctamente${NC}"
    else
        echo -e "${RED}Se encontraron ${errors} errores${NC}"
        exit 1
    fi
}

# Función principal
main() {
    if [ $# -eq 0 ]; then
        echo "Uso: $0 <comando> [argumentos]"
        echo ""
        echo "Comandos:"
        echo "  permission <PERMISO>    # Validar permiso en backend y frontend"
        echo "  icon <ICONO>            # Validar formato de icono"
        echo "  routes                  # Validar archivo routes.ts"
        echo ""
        echo "Ejemplos:"
        echo "  $0 permission RUTA_EQUIPAMIENTO"
        echo "  $0 icon Truck"
        echo "  $0 routes"
        exit 1
    fi

    local command=$1
    shift

    case $command in
        permission)
            if [ $# -eq 0 ]; then
                echo "Uso: $0 permission <PERMISO>"
                exit 1
            fi
            validate_permissions "$1"
            ;;
        icon)
            if [ $# -eq 0 ]; then
                echo "Uso: $0 icon <ICONO>"
                exit 1
            fi
            validate_icon "$1"
            ;;
        routes)
            validate_routes
            ;;
        *)
            echo "Comando desconocido: $command"
            echo "Usa: $0 --help"
            exit 1
            ;;
    esac
}

main "$@"
