---
name: add-changelog
description: Agregar entrada al changelog con cambios no integrados
license: MIT
---

Agrega registro al changelog basándose en cambios no integrados al branch.

## Input

Ninguno (analiza automáticamente `git diff`)

## Steps

### 1. Obtener Cambios

1. Ejecutar `git diff --stat` para ver archivos modificados
2. Ejecutar `git diff` para analizar cambios en detalle
3. Identificar cambios de lógica de negocio (ignorar refactors internos)

### 2. Analizar y Categorizar

Clasificar cambios por tipo:
- `new`: Funcionalidad nueva
- `improved`: Mejora de funcionalidad existente
- `fixed`: Corrección de error

Enfocar en:
- Módulos/features visibles al usuario
- Cambios en reglas de negocio
- Nuevas rutas/secciones del menú
- Formularios/tablas nuevos o modificados
- **Ignorar**: Refactors internos, cambios de imports, optimizaciones de código

### 3. Generar Entrada

1. Obtener fecha actual en formato: `"DD de mes, YYYY"` (español)
2. Crear objeto con estructura:
   ```typescript
   {
       date: "8 de febrero, 2026",
       changes: [
           { type: "new|improved|fixed", text: "Descripción concisa" }
       ]
   }
   ```
3. Agregar al inicio del array en `packages/front/src/constants/changelog.ts`

### 4. Editar Archivo

1. Leer `packages/front/src/constants/changelog.ts`
2. Insertar nueva entrada al inicio del array `CHANGELOG_DATA`
3. Guardar cambios

### 5. Confirmar

Mostrar resumen de cambios agregados.

## Output

```
✅ Changelog actualizado: DD de mes, YYYY

📝 Cambios registrados:
- [new] Descripción 1
- [improved] Descripción 2
- [fixed] Descripción 3

📄 packages/front/src/constants/changelog.ts
```

## Reglas

### Formato de Fecha
- Español: "8 de febrero, 2026"
- Mes lowercase (febrero, no Febrero)
- Con comas

### Textos de Cambios
- **Concisos**: Máximo 100 caracteres
- **Enfoque usuario**: "Se agrega X", "Se mejora Y", "Se corrige Z"
- **Nivel negocio**: NO mencionar componentes técnicos internos
- **Ejemplos buenos**:
  - "Se agrega sección Flota en el menú"
  - "Se mejora selector de iconos dinámico"
  - "Se corrige error al cargar equipamiento"
- **Ejemplos malos**:
  - "Se refactoriza DynamicIcon para usar imports dinámicos" (muy técnico)
  - "Se eliminan 94 líneas de código en nav-main.tsx" (implementación)
  - "Se modifica EditEquipamientoDto" (no visible al usuario)

### Tipos de Cambios
- `new`: Funcionalidad completamente nueva
- `improved`: Mejora/extensión de algo existente
- `fixed`: Corrección de bug

## Notes

- Skill se basa SOLO en `git diff` (cambios no committeados)
- Priorizar cambios visibles al usuario final
- Omitir refactors que no afecten funcionalidad
- Fecha siempre la actual (del día que se ejecuta)
