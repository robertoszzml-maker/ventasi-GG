# Template: Skill Generado desde Rule

Este template se usa como base cuando se genera un skill desde una rule.

## SKILL.md Template

```markdown
---
name: <RULE_NAME>
description: <DESCRIPCION_CORTA>
license: MIT
---

<DESCRIPCION_INICIAL>

## Input

<INPUTS_IDENTIFICADOS>

## Steps

### 1. <PASO_1>

<DESCRIPCION_PASO_1>

### 2. <PASO_2>

<DESCRIPCION_PASO_2>

### 3. Confirmar

Mostrar resultado.

## Output

\`\`\`
<OUTPUT_ESPERADO>
\`\`\`

## Errores

<CASOS_ERROR>

## Notes

<NOTAS_CRITICAS>

## See Also

- [Referencia Técnica](reference.md)
- [Ejemplos](examples.md)
<SI_APLICA_TEMPLATE>- [Template](template.md)</SI_APLICA_TEMPLATE>
<SI_APLICA_SCRIPT>- [Script Helper](scripts/helper.sh)</SI_APLICA_SCRIPT>
```

---

## reference.md Template

```markdown
# Referencia Técnica: <RULE_NAME>

<CONTENIDO_TECNICO_DETALLADO>

## Patrones

<TEMPLATES_COMPLETOS>

## Reglas Críticas

<REGLAS_NUMERADAS>

## Anti-patrones

<CODIGO_INCORRECTO_Y_CORRECTO>

## Checklist

<CHECKLIST_COMPLETO>

## Resumen

<TABLA_RESUMEN>
```

---

## examples.md Template

```markdown
# Ejemplos: <RULE_NAME>

## Ejemplo 1: <CASO_USO_1>

<EJEMPLO_COMPLETO_1>

## Ejemplo 2: <CASO_USO_2>

<EJEMPLO_COMPLETO_2>

## Comparaciones

### ❌ Incorrecto

\`\`\`<LENGUAJE>
<CODIGO_INCORRECTO>
\`\`\`

### ✅ Correcto

\`\`\`<LENGUAJE>
<CODIGO_CORRECTO>
\`\`\`
```

---

## template.md Template (Condicional)

```markdown
# <NOMBRE_COMPONENTE> Template

<DESCRIPCION_TEMPLATE>

## Placeholders

- `<PLACEHOLDER_1>`: <DESCRIPCION>
- `<PLACEHOLDER_2>`: <DESCRIPCION>

## Template Base

\`\`\`<LENGUAJE>
<CODIGO_BASE_CON_PLACEHOLDERS>
\`\`\`

## Ejemplo Completado

\`\`\`<LENGUAJE>
<CODIGO_EJEMPLO_COMPLETO>
\`\`\`
```

---

## scripts/helper.sh Template (Condicional)

```bash
#!/bin/bash
# Helper script para <RULE_NAME>

<NOMBRE_PARAM>=$1

# Validaciones
if [ -z "$<NOMBRE_PARAM>" ]; then
  echo "❌ Error: <MENSAJE_ERROR>"
  echo "Uso: ./helper.sh <parametros>"
  exit 1
fi

# Lógica principal
<COMANDOS_BASH>

# Confirmación
echo "✅ <MENSAJE_EXITO>"
```

---

## Guía de Placeholders

### Para SKILL.md

| Placeholder | Fuente | Ejemplo |
|------------|--------|---------|
| `<RULE_NAME>` | Nombre del archivo .md | `formularios` |
| `<DESCRIPCION_CORTA>` | Primera línea después del título | `Patrón para formularios con react-hook-form` |
| `<DESCRIPCION_INICIAL>` | Primeras 2-3 líneas | `Formularios con react-hook-form + Zod + shadcn/ui` |
| `<INPUTS_IDENTIFICADOS>` | Extraer de contexto | `- \`<entidad>\`: Nombre de la entidad` |
| `<PASO_N>` | Secciones principales | `Validar Datos`, `Crear Formulario` |
| `<OUTPUT_ESPERADO>` | Sección de output | `✅ Formulario creado: <nombre>` |
| `<CASOS_ERROR>` | Sección anti-patrones | `- Schema inválido → Verificar tipos` |

### Para reference.md

| Placeholder | Fuente |
|------------|--------|
| `<CONTENIDO_TECNICO_DETALLADO>` | Todo excepto ejemplos básicos |
| `<TEMPLATES_COMPLETOS>` | Sección "Template" o "Patrón" |
| `<REGLAS_NUMERADAS>` | Sección "Reglas Críticas" |
| `<CODIGO_INCORRECTO_Y_CORRECTO>` | Sección "Anti-patrones" |
| `<CHECKLIST_COMPLETO>` | Sección "Checklist" |
| `<TABLA_RESUMEN>` | Sección "Resumen" |

### Para examples.md

| Placeholder | Fuente |
|------------|--------|
| `<CASO_USO_N>` | Título de ejemplo | `Formulario Simple` |
| `<EJEMPLO_COMPLETO_N>` | Bloque de código completo | Todo el código del ejemplo |
| `<LENGUAJE>` | Detectar del bloque | `typescript`, `bash`, `sql` |
| `<CODIGO_INCORRECTO>` | Ejemplos con ❌ | Código con comentario `// ❌` |
| `<CODIGO_CORRECTO>` | Ejemplos con ✅ | Código con comentario `// ✅` |

### Para template.md

| Placeholder | Fuente |
|------------|--------|
| `<NOMBRE_COMPONENTE>` | Extraer del contexto | `FormularioEntidad` |
| `<DESCRIPCION_TEMPLATE>` | Descripción del patrón | `Template base para formularios` |
| `<CODIGO_BASE_CON_PLACEHOLDERS>` | Template con `<VAR>` | Código genérico |
| `<CODIGO_EJEMPLO_COMPLETO>` | Ejemplo real | Template aplicado |

### Para helper.sh

| Placeholder | Fuente |
|------------|--------|
| `<NOMBRE_PARAM>` | Parámetro principal | `MODULE_NAME`, `ENTITY_NAME` |
| `<MENSAJE_ERROR>` | Contexto | `Nombre de módulo requerido` |
| `<COMANDOS_BASH>` | Comandos de la rule | `nest g resource`, `mkdir -p` |
| `<MENSAJE_EXITO>` | Confirmación | `Módulo creado exitosamente` |

---

## Decisiones de Creación

### ¿Crear template.md?

**SÍ** si la rule contiene:
- Sección "Template Base" o "Patrón"
- Código con placeholders explícitos
- Estructura repetible

**NO** si:
- Solo tiene ejemplos específicos
- No hay patrón genérico
- Es principalmente conceptual

### ¿Crear helper.sh?

**SÍ** si la rule contiene:
- Comandos bash
- Secuencias de CLI
- Validaciones automáticas
- Generación de archivos

**NO** si:
- Solo conceptos
- No hay comandos ejecutables
- Es puramente documentación

### ¿Qué va en reference.md vs SKILL.md?

**SKILL.md:**
- Overview (2-3 líneas)
- Steps alto nivel
- Input/Output básico
- Enlaces

**reference.md:**
- TODO lo demás
- Código extenso
- Detalles técnicos
- Checklists completos
