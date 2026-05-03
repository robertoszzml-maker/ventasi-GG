#!/bin/bash
# Helper script para listar rules disponibles

RULES_DIR=".claude/rules"

# Verificar que existe el directorio
if [ ! -d "$RULES_DIR" ]; then
  echo "❌ Error: Directorio .claude/rules/ no encontrado"
  exit 1
fi

# Listar todas las rules
echo "📋 Rules disponibles para migrar:"
echo ""

count=0
for rule in "$RULES_DIR"/*.md; do
  if [ -f "$rule" ]; then
    basename=$(basename "$rule" .md)
    lines=$(wc -l < "$rule")
    echo "  • $basename ($lines líneas)"
    ((count++))
  fi
done

echo ""
echo "Total: $count rules"
echo ""
echo "Uso: /migrate-rule-to-skill <nombre-rule>"
