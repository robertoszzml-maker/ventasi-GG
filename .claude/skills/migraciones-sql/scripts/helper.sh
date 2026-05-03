#!/bin/bash
# Helper script para obtener el próximo número de migración

SQL_DIR="packages/api/sql"

# Verificar que existe el directorio
if [ ! -d "$SQL_DIR" ]; then
  echo "❌ Error: Directorio $SQL_DIR no encontrado"
  exit 1
fi

# Obtener el último número
last_number=$(ls "$SQL_DIR" | grep -E '^[0-9]+\.sql$' | sed 's/\.sql$//' | sort -n | tail -1)

if [ -z "$last_number" ]; then
  echo "📋 No hay migraciones existentes"
  next_number=1
else
  next_number=$((last_number + 1))
  echo "📋 Última migración: $last_number.sql"
fi

echo "✨ Próximo número disponible: $next_number"
echo ""
echo "Uso: /migraciones-sql $next_number"
echo "Archivo: $SQL_DIR/$next_number.sql"
