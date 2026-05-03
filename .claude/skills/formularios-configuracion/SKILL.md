---
name: formularios-configuracion
description: Crear formularios de configuración con permisos y constantes
license: MIT
---

# Formularios de Configuración

Patrón para formularios de configuración con permisos, constantes y persistencia en BD.

## Input

- Nombre del módulo (ej: `presupuesto`, `jornada`, `banco`)

**Ejemplo:** `/formularios-configuracion banco`

## Steps

Al crear un formulario de configuración:

1. **Permisos** - Agregar en backend + frontend (idénticos)
2. **Constantes** - Agregar en backend + frontend (idénticos)
3. **Formulario** - Crear en `components/forms/config/[modulo]-form.tsx`
4. **Página** - Crear en `app/(admin)/config/[modulo]/page.tsx`
5. **Ruta en menú** - Agregar en `routes.ts` del backend
6. **Migración SQL** - Insertar configs y permisos (sin roles)

## Output

- Formulario funcional en `/config/[modulo]`
- Permisos sincronizados backend/frontend
- Constantes sincronizadas backend/frontend
- Valores persistidos en tabla `config`

## Referencias

- Ver [reference.md](reference.md) para patrones técnicos detallados
- Ver [examples.md](examples.md) para ejemplos completos
- Ver [template.md](template.md) para template base

## Reglas Críticas

⚠️ **Clave === Nombre constante** (para mantener sincronización)
⚠️ **Permisos idénticos** backend y frontend
⚠️ **Constantes idénticas** backend y frontend
⚠️ **NO asignar roles** en migración SQL
