---
name: create-rule
description: Crear nueva regla en .claude/rules/ y enlazarla en CLAUDE.md
license: MIT
metadata:
  author: pinte-crm
  version: "2.0"
---

Crea reglas concisas (~200 líneas) en `.claude/rules/` y las enlaza automáticamente en orden alfabético.

## Input

- `<nombre>`: kebab-case (ej: `validaciones-backend`)
- `[descripción]`: Opcional, 1 línea

**Ejemplo:** `/create-rule validaciones-backend "Reglas para DTOs"`

## Steps

### 1. Validar & Parsear

- Validar kebab-case (solo minúsculas, números, guiones)
- Si falta descripción → `AskUserQuestion`
- Si existe → preguntar (sobrescribir/renombrar/cancelar)

### 2. Crear Archivo

Crear `.claude/rules/<nombre>.md` con template minimalista:

```markdown
# <Título>

<Descripción 1 línea>

## Patrón

<Regla principal en 2-3 líneas>

## Ejemplos Clave

**✅ Correcto:**
\`\`\`typescript
// Código directo
\`\`\`

**❌ Incorrecto:**
\`\`\`typescript
// Anti-patrón directo
\`\`\`

**Razón:** <Por qué en 1 línea>

## Casos Completos

Solo 1-2 ejemplos reales y concisos.

## Checklist

- [ ] Items específicos
- [ ] Sin repetir conceptos

## Resumen

| Aspecto | Valor |
|---------|-------|
| Solo info clave | Sin redundancia |
```

**Principios:**
- ✅ Directo al grano
- ✅ Un ejemplo por concepto
- ✅ Máximo 250 líneas
- ❌ NO repetir información
- ❌ NO secciones vacías

### 3. Enlazar en CLAUDE.md

1. Buscar `## 📚 Reglas Modulares`
2. Insertar en orden alfabético:
   `- **[<Título>](rules/<nombre>.md)**: <Descripción>`
3. Ruta relativa: `rules/` (NO `.claude/rules/`)

### 4. Confirmar

```
✅ Regla creada: <nombre>

📄 .claude/rules/<nombre>.md
🔗 Enlazada en CLAUDE.md

Edítala para agregar contenido específico.
```

## Guardrails

- Nombre inválido → error con ejemplos
- Sin directorio → crearlo automáticamente
- Archivo existe → confirmar antes de sobrescribir

## Meta-Reglas

Las reglas deben ser:
1. **Concisas**: ~200-250 líneas máximo
2. **Directas**: Sin introducción larga
3. **Ejemplos**: Solo lo esencial
4. **Sin repetir**: Cada concepto una vez
