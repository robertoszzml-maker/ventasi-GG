# Ejemplos de Migración

## Ejemplo 1: Rule Simple → Skill Básico

### Input
```
/migrate-rule-to-skill idioma-nomenclatura
```

### Rule Original (idioma-nomenclatura.md)

```markdown
# Idioma y Nomenclatura

Todo en español excepto términos técnicos estándar.

## Formatos

| Contexto | Formato | Ejemplo |
|----------|---------|---------|
| Archivos | kebab-case | `equipamiento-tipo.entity.ts` |
| Columnas BD | snake_case | `proceso_general_id` |

## Ejemplos

\`\`\`typescript
// ✅ Correcto
@Column({ name: 'proceso_general_id' })
procesoGeneralId: number;
\`\`\`
```

### Output Generado

```
.claude/skills/idioma-nomenclatura/
├── SKILL.md
├── reference.md
├── examples.md
└── original-rule.md
```

**SKILL.md:**
```markdown
---
name: idioma-nomenclatura
description: Convenciones de idioma y nomenclatura para el proyecto
license: MIT
---

Aplicar convenciones de nomenclatura en español con formatos estándar.

## Input

- `<contexto>`: archivo | columna | variable | clase

## Steps

### 1. Identificar Contexto

Determinar tipo de código a nombrar.

### 2. Aplicar Formato

- Archivos: kebab-case
- Columnas BD: snake_case
- Variables: camelCase
- Clases: PascalCase

### 3. Validar

Verificar consistencia con reglas.

## See Also

- [Referencia Completa](reference.md)
- [Ejemplos](examples.md)
```

**reference.md:**
```markdown
# Referencia: Idioma y Nomenclatura

## Formatos por Contexto

[Tabla completa de formatos]

## Reglas Detalladas

[Reglas completas de la rule original]

## Anti-patrones

[Anti-patrones completos]
```

**examples.md:**
```markdown
# Ejemplos: Idioma y Nomenclatura

## Backend

\`\`\`typescript
// ✅ Correcto
@Column({ name: 'proceso_general_id' })
procesoGeneralId: number;
\`\`\`

[Más ejemplos completos]
```

---

## Ejemplo 2: Rule con Template → Skill con template.md

### Input
```
/migrate-rule-to-skill formularios
```

### Rule Original

Contiene:
- Template base de formulario
- Múltiples ejemplos
- Schema Zod
- Hooks

### Output Generado

```
.claude/skills/formularios/
├── SKILL.md
├── reference.md
├── examples.md
├── template.md
└── original-rule.md
```

**template.md:**
```markdown
# <ENTIDAD> Form Template

\`\`\`typescript
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const formSchema = z.object({
    id: z.number().optional(),
    // <AGREGAR_CAMPOS>
});

export default function <ENTIDAD>Form({ data }: { data?: <TIPO> }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            // <AGREGAR_DEFAULTS>
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // <LOGICA_SUBMIT>
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* <AGREGAR_CAMPOS_FORM> */}
            </form>
        </Form>
    )
}
\`\`\`
```

---

## Ejemplo 3: Rule con Bash → Skill con helper.sh

### Input
```
/migrate-rule-to-skill modulos-backend
```

### Rule Original

Contiene:
```markdown
## Comando Base

\`\`\`bash
cd packages/api
nest g resource modules/<nombre>
\`\`\`

## Validaciones

Verificar estructura...
```

### Output Generado

**scripts/helper.sh:**
```bash
#!/bin/bash
# Helper para crear módulos backend

MODULE_NAME=$1

if [ -z "$MODULE_NAME" ]; then
  echo "❌ Error: Nombre de módulo requerido"
  echo "Uso: ./helper.sh <nombre-modulo>"
  exit 1
fi

echo "📦 Creando módulo: $MODULE_NAME"
cd packages/api
nest g resource "modules/$MODULE_NAME" --no-spec

# Validar creación
if [ -f "src/modules/$MODULE_NAME/$MODULE_NAME.module.ts" ]; then
  echo "✅ Módulo creado exitosamente"
  echo "📁 Ubicación: src/modules/$MODULE_NAME/"
else
  echo "❌ Error al crear módulo"
  exit 1
fi
```

---

## Ejemplo 4: Migración con CLAUDE.md Update

### Antes de Migrar

**.claude/CLAUDE.md:**
```markdown
## 📚 Reglas Modulares

- **[Formularios](rules/formularios.md)**: Patrón para formularios
- **[Módulos Backend](rules/modulos-backend.md)**: Crear módulos NestJS
```

### Comando
```
/migrate-rule-to-skill formularios
```

### Después de Migrar

**.claude/CLAUDE.md:**
```markdown
## 📚 Reglas Modulares

- **/formularios**: Crear formularios (react-hook-form + Zod)
- **[Módulos Backend](rules/modulos-backend.md)**: Crear módulos NestJS
```

**Nota:** La referencia cambió de link a rule a invocación de skill.

---

## Ejemplo 5: Error - Rule No Existe

### Input
```
/migrate-rule-to-skill componentes-ui
```

### Output
```
❌ Error: Rule no encontrada

La rule 'componentes-ui.md' no existe en .claude/rules/

📋 Rules disponibles:
- formularios.md
- modulos-backend.md
- tablas-frontend.md
- hooks-frontend.md
- selectores-frontend.md
[...]

Usa: /migrate-rule-to-skill <nombre-rule>
```

---

## Ejemplo 6: Skill Ya Existe

### Input
```
/migrate-rule-to-skill formularios
```

### Output (si ya existe)
```
⚠️  El skill 'formularios' ya existe

¿Deseas sobrescribirlo? Esto eliminará:
- .claude/skills/formularios/SKILL.md
- .claude/skills/formularios/reference.md
- .claude/skills/formularios/examples.md
- .claude/skills/formularios/template.md

El backup original-rule.md se mantendrá.

[Sí] [No]
```

---

## Resultado Final Típico

### Comando
```
/migrate-rule-to-skill hooks-frontend
```

### Output
```
✅ Rule migrada a skill: hooks-frontend

📁 Estructura creada:
   .claude/skills/hooks-frontend/
   ├── SKILL.md (97 líneas)
   ├── reference.md (245 líneas)
   ├── examples.md (180 líneas)
   ├── original-rule.md (backup)
   └── [template.md no creado - no aplicable]

🗑️  Rule eliminada: .claude/rules/hooks-frontend.md
📝 CLAUDE.md actualizado (1 referencia)

Usa: /hooks-frontend para invocar el skill
```
