# Referencia Técnica: Migración de Rules a Skills

## Estructura de Archivos

### SKILL.md (Requerido)

**Propósito:** Overview y navegación principal

**Estructura:**
```markdown
---
name: skill-name
description: Descripción corta (1 línea)
license: MIT
---

# Título Principal

Descripción breve del skill (1-2 líneas).

## Input

- `<param>`: Qué recibe

## Steps

### 1. Paso Alto Nivel
### 2. Otro Paso
### 3. Confirmar

## Output

Qué retorna o muestra

## Errores

Casos de error comunes

## Notes

Solo info crítica

## See Also

- [Referencia Técnica](reference.md)
- [Ejemplos](examples.md)
```

**Límites:**
- Máximo ~100 líneas
- Sin código extenso (usar reference.md)
- Sin ejemplos largos (usar examples.md)

---

### reference.md (Opcional)

**Propósito:** Documentación API detallada

**Contenido:**
- Patrones técnicos completos
- Templates con código extenso
- Reglas de validación
- Anti-patrones
- Checklists detallados
- Configuraciones avanzadas

**Cuándo crear:**
- Si la rule tiene secciones técnicas extensas
- Si hay múltiples templates/patrones
- Si requiere documentación API

---

### examples.md (Opcional)

**Propósito:** Casos de uso prácticos

**Contenido:**
- Ejemplos completos end-to-end
- Casos de uso reales del proyecto
- Comparaciones antes/después
- Outputs esperados

**Cuándo crear:**
- Si la rule tiene sección de ejemplos
- Si hay múltiples escenarios de uso
- Si los ejemplos son extensos

---

### template.md (Opcional)

**Propósito:** Template para que Claude complete

**Contenido:**
- Estructura base con placeholders
- Comentarios guía
- Secciones predefinidas

**Ejemplo:**
```markdown
# <NOMBRE_ENTIDAD> Component

## Props

- `value`: <TIPO> - <DESCRIPCIÓN>
- `onChange`: (value: <TIPO>) => void

## Usage

\`\`\`typescript
<EJEMPLO_USO>
\`\`\`

## Implementation

\`\`\`typescript
// TODO: Complete implementation
\`\`\`
```

**Cuándo crear:**
- Si el skill genera código repetitivo
- Si hay estructura predefinida
- Si Claude debe completar templates

---

### scripts/helper.sh (Opcional)

**Propósito:** Scripts bash reutilizables

**Contenido:**
- Validaciones automáticas
- Generación de código
- Operaciones de filesystem
- Utilidades CLI

**Ejemplo:**
```bash
#!/bin/bash
# Validar estructura de módulo

MODULE_NAME=$1

if [ -z "$MODULE_NAME" ]; then
  echo "Error: Nombre de módulo requerido"
  exit 1
fi

# Verificar archivos requeridos
FILES=(
  "src/modules/$MODULE_NAME/$MODULE_NAME.module.ts"
  "src/modules/$MODULE_NAME/$MODULE_NAME.controller.ts"
  "src/modules/$MODULE_NAME/$MODULE_NAME.service.ts"
)

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Falta: $file"
    exit 1
  fi
done

echo "✅ Estructura válida"
```

**Cuándo crear:**
- Si hay validaciones complejas
- Si requiere operaciones bash
- Si puede automatizar pasos

---

## Proceso de Migración

### 1. Análisis de Contenido

**Mapeo de secciones:**

| Sección en Rule | Destino en Skill |
|----------------|------------------|
| Descripción inicial | SKILL.md (overview) |
| Template Base | reference.md o template.md |
| Reglas Críticas | reference.md |
| Ejemplo Completo | examples.md |
| Anti-patrones | reference.md |
| Checklist | reference.md |
| Comandos bash | scripts/helper.sh |

### 2. Distribución de Contenido

**SKILL.md recibe:**
- Primeras 1-2 líneas descriptivas
- Input esperado (simplificado)
- Steps de alto nivel (3-5 pasos)
- Output básico
- Enlaces a otros archivos

**reference.md recibe:**
- Todo el contenido técnico detallado
- Templates completos
- Reglas de implementación
- Anti-patrones con código
- Checklists completos

**examples.md recibe:**
- Todos los bloques de ejemplo
- Casos de uso completos
- Comparaciones ❌/✅

**template.md recibe:**
- Estructura base extraída de templates
- Placeholders generados automáticamente
- Comentarios guía

**scripts/helper.sh recibe:**
- Comandos bash de la rule
- Scripts de validación
- Utilidades CLI

### 3. Actualización de Referencias

**En CLAUDE.md:**

Cambiar:
```markdown
- **[Formularios](rules/formularios.md)**: Patrón para formularios
```

Por:
```markdown
- **/formularios**: Crear formularios (react-hook-form + Zod)
```

O eliminar si el skill es auto-documentado.

### 4. Backup y Eliminación

1. Crear `.claude/skills/<name>/original-rule.md` con contenido completo
2. Eliminar `.claude/rules/<name>.md`
3. Verificar que no queden referencias rotas en CLAUDE.md

---

## Validaciones

### Pre-migración

- [ ] Rule existe en `.claude/rules/`
- [ ] Skill no existe (o confirmar sobrescribir)
- [ ] Rule tiene contenido válido (no vacía)

### Post-migración

- [ ] SKILL.md creado y válido
- [ ] Archivos opcionales creados según necesidad
- [ ] Backup en original-rule.md
- [ ] Rule original eliminada
- [ ] CLAUDE.md actualizado
- [ ] Sin referencias rotas

---

## Convenciones de Naming

**Skill name:** Mismo nombre que la rule en kebab-case
- Rule: `formularios.md` → Skill: `formularios/`
- Rule: `modulos-backend.md` → Skill: `modulos-backend/`

**Archivos:**
- `SKILL.md` (uppercase, requerido)
- `reference.md` (lowercase, opcional)
- `examples.md` (lowercase, opcional)
- `template.md` (lowercase, opcional)
- `scripts/helper.sh` (lowercase, opcional)

**Invocación:**
- `/formularios` (sin prefijo /skill)
- `/modulos-backend`

---

## Límites de Tamaño

| Archivo | Límite Recomendado |
|---------|-------------------|
| SKILL.md | ~100 líneas |
| reference.md | Ilimitado (cargar solo cuando se necesita) |
| examples.md | Ilimitado (cargar solo cuando se necesita) |
| template.md | ~200 líneas |
| helper.sh | ~100 líneas |

**Razón:** SKILL.md se carga siempre, los demás solo on-demand.
