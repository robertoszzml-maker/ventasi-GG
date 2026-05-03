---
name: quick-commit
description: Git commit rápido con mensaje semántico automático
license: MIT
---

Automatiza `git add .` y `git commit -m "mensaje" --no-verify` con mensaje semántico generado automáticamente basado en los cambios.

## Input

Ninguno (analiza automáticamente `git diff --cached` o `git diff`)

## Steps

### 1. Analizar Cambios

1. Ejecutar `git status --short` para ver archivos modificados
2. Ejecutar `git diff --stat` para obtener resumen de cambios
3. Si no hay cambios en stage, ejecutar `git add .`
4. Analizar archivos modificados para determinar contexto

### 2. Generar Mensaje

Crear mensaje conciso (máximo 5 palabras) siguiendo convenciones:

**Formato:** `<tipo>: <descripción>`

**Tipos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `refactor`: Refactorización sin cambios funcionales
- `style`: Cambios de formato/estilo
- `docs`: Documentación
- `chore`: Tareas mantenimiento

**Reglas:**
- Máximo 50 caracteres total
- Sin punto final
- Imperativo (agregar, no agrega)
- Alto nivel (no mencionar archivos específicos)

**Ejemplos:**
- `feat: agregar campos equipamiento`
- `fix: corregir colores jornadas`
- `refactor: optimizar selector`
- `chore: actualizar changelog`

### 3. Ejecutar Commit

1. Ejecutar `git add .`
2. Ejecutar `git commit -m "<mensaje>" --no-verify`
3. Mostrar resultado con hash del commit

## Output

```
✅ Commit creado: <hash>

📝 Mensaje: <mensaje>
📊 Archivos: X modified, Y insertions(+), Z deletions(-)
```

## Errores

- Sin cambios → Mensaje: "No hay cambios para commitear"
- Commit falla → Mostrar error de git

## Notes

- Usa `--no-verify` para saltar hooks (pre-commit, etc.)
- Analiza contexto de archivos para categorizar tipo
- Prioriza cambios más significativos para el mensaje
- Frontend/forms → `feat` o `fix`
- Config/constants → `chore`
- SQL → `feat` (nuevas migraciones)
