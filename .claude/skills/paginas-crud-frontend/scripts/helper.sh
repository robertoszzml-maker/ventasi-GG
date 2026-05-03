#!/bin/bash

# Helper script para validar páginas CRUD

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para validar estructura
validate_structure() {
    local modulo=$1
    local base_path="packages/front/src/app/(admin)/${modulo}"

    echo "Validando estructura para módulo: ${modulo}"
    echo ""

    # Verificar carpeta principal
    if [ ! -d "${base_path}" ]; then
        echo -e "${RED}✗${NC} Carpeta principal no existe: ${base_path}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Carpeta principal existe"

    # Verificar page.tsx (listado)
    if [ ! -f "${base_path}/page.tsx" ]; then
        echo -e "${YELLOW}⚠${NC} Falta página de listado: ${base_path}/page.tsx"
    else
        echo -e "${GREEN}✓${NC} Página de listado existe"
    fi

    # Verificar crear/page.tsx
    if [ ! -f "${base_path}/crear/page.tsx" ]; then
        echo -e "${RED}✗${NC} Falta página de creación: ${base_path}/crear/page.tsx"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Página de creación existe"

    # Verificar [id]/page.tsx
    if [ ! -f "${base_path}/[id]/page.tsx" ]; then
        echo -e "${RED}✗${NC} Falta página de edición: ${base_path}/[id]/page.tsx"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Página de edición existe"

    echo ""
    echo -e "${GREEN}Estructura validada correctamente${NC}"
}

# Función para validar página de edición
validate_edit_page() {
    local modulo=$1
    local file="packages/front/src/app/(admin)/${modulo}/[id]/page.tsx"

    if [ ! -f "${file}" ]; then
        echo -e "${RED}✗${NC} Archivo no existe: ${file}"
        exit 1
    fi

    echo "Validando página de edición..."
    echo ""

    local errors=0

    # Verificar 'use client' con comilla simple
    if ! grep -q "^'use client'$" "${file}"; then
        echo -e "${RED}✗${NC} Falta 'use client' con comilla simple al inicio"
        ((errors++))
    else
        echo -e "${GREEN}✓${NC} 'use client' correcto"
    fi

    # Verificar función se llama Page
    if ! grep -q "export default function Page" "${file}"; then
        echo -e "${RED}✗${NC} Función debe llamarse 'Page'"
        ((errors++))
    else
        echo -e "${GREEN}✓${NC} Función se llama 'Page'"
    fi

    # Verificar params: Promise
    if ! grep -q "params: Promise<{ id: string }>" "${file}"; then
        echo -e "${RED}✗${NC} params debe ser Promise<{ id: string }>"
        ((errors++))
    else
        echo -e "${GREEN}✓${NC} params correcto"
    fi

    # Verificar React.use(params)
    if ! grep -q "React.use(params)" "${file}"; then
        echo -e "${RED}✗${NC} Debe usar React.use(params)"
        ((errors++))
    else
        echo -e "${GREEN}✓${NC} Usa React.use(params)"
    fi

    # Verificar no usa parseInt
    if grep -q "parseInt(id)" "${file}"; then
        echo -e "${RED}✗${NC} NO debe usar parseInt(id)"
        ((errors++))
    else
        echo -e "${GREEN}✓${NC} No usa parseInt(id)"
    fi

    # Verificar fragment vacío
    if ! grep -q "<>Cargando...</>" "${file}"; then
        echo -e "${YELLOW}⚠${NC} Debería usar fragment vacío <>"
    else
        echo -e "${GREEN}✓${NC} Usa fragment vacío"
    fi

    echo ""
    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}Página de edición validada correctamente${NC}"
    else
        echo -e "${RED}Se encontraron ${errors} errores${NC}"
        exit 1
    fi
}

# Función principal
main() {
    if [ $# -eq 0 ]; then
        echo "Uso: $0 <modulo> [--edit]"
        echo ""
        echo "Ejemplos:"
        echo "  $0 proveedores              # Valida estructura completa"
        echo "  $0 proveedores --edit       # Valida página de edición"
        exit 1
    fi

    local modulo=$1
    local validate_edit=false

    if [ "$2" = "--edit" ]; then
        validate_edit=true
    fi

    if [ "$validate_edit" = true ]; then
        validate_edit_page "$modulo"
    else
        validate_structure "$modulo"
    fi
}

main "$@"
