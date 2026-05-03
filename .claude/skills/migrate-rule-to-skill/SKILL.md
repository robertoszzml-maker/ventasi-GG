---
name: migrate-rule-to-skill
description: Migra una rule existente a formato skill y elimina la rule original
license: MIT
---

Convierte rules de `.claude/rules/` a skills en `.claude/skills/` con estructura completa.

## Input

- `<rule-name>`: Nombre de la rule (sin extensión .md)

**Ejemplo:** `/migrate-rule-to-skill formularios`

## Steps

### 1. Validar Rule

- Verificar que existe `.claude/rules/<rule-name>.md`
- Si no existe → Error y listar rules disponibles
- Leer contenido completo de la rule

### 2. Analizar Contenido

- Extraer secciones principales
- Identificar:
  - Descripción/overview
  - Patrones y templates
  - Ejemplos
  - Referencias técnicas
  - Anti-patrones
  - Checklists

### 3. Crear Estructura Skill

Crear directorio y archivos:

```
.claude/skills/<rule-name>/
├── SKILL.md          # Overview + navegación
├── reference.md      # Documentación técnica detallada
├── examples.md       # Ejemplos de uso
├── template.md       # Template para completar
└── scripts/
    └── helper.sh     # Script de utilidad (si aplica)
```

### 4. Distribuir Contenido

**SKILL.md:**
- Frontmatter (name, description, license)
- Descripción breve (1-2 líneas)
- Input esperado
- Steps principales (alto nivel)
- Output esperado
- Enlaces a reference.md y examples.md

**reference.md:**
- Patrones técnicos detallados
- Templates completos
- Reglas críticas
- Anti-patrones
- Checklists

**examples.md:**
- Ejemplos completos
- Casos de uso reales
- Comparaciones ❌/✅

**template.md:**
- Template base para que Claude complete
- Placeholders claros
- Estructura predefinida

**scripts/helper.sh:**
- Crear solo si hay lógica bash útil
- Scripts de validación o generación

### 5. Actualizar CLAUDE.md

- Eliminar referencia a la rule en `.claude/CLAUDE.md`
- Agregar link al nuevo skill si es relevante

### 6. Eliminar Rule Original

- Hacer backup en `.claude/skills/<rule-name>/original-rule.md`
- Eliminar `.claude/rules/<rule-name>.md`

### 7. Confirmar

Mostrar resumen de migración.

## Output

```
✅ Rule migrada a skill: <rule-name>

📁 Estructura creada:
   .claude/skills/<rule-name>/
   ├── SKILL.md
   ├── reference.md
   ├── examples.md
   ├── template.md
   ├── original-rule.md (backup)
   └── scripts/
       └── helper.sh

🗑️  Rule eliminada: .claude/rules/<rule-name>.md
📝 CLAUDE.md actualizado

Usa: /<rule-name> para invocar el skill
```

## Errores

- Rule no existe → Listar rules disponibles con `ls .claude/rules/`
- Skill ya existe → Preguntar si sobrescribir
- Error al eliminar → Mantener backup y reportar

## Notes

- El backup original-rule.md siempre se mantiene
- SKILL.md debe ser conciso (~100 líneas)
- reference.md contiene detalles técnicos
- examples.md para casos de uso prácticos
- helper.sh solo si hay lógica bash reutilizable
