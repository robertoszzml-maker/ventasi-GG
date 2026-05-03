---
name: agregar-seccion-menu
description: Agregar secciones y rutas al menú lateral del sistema
license: MIT
---

# Agregar Sección al Menú

Agrega nuevas secciones y rutas al menú lateral del sistema editando únicamente el backend.

## Input

- `<titulo>`: Título de la sección o ruta
- `<icono>`: Nombre del icono Lucide (ej: `Truck`, `Users`, `Settings`)
- `<tiene-subrutas>`: Si la sección tiene subrutas o es una ruta simple

**Ejemplo:** `/agregar-seccion-menu "Flota" Truck --subrutas`

## Steps

### 1. Verificar Permisos

- Verificar que existen los permisos `RUTA_*` en `packages/api/src/constants/permisos.ts`
- Si no existen, crearlos en backend **y** frontend (idénticos)
- Formato: `RUTA_[MODULO]: 'RUTA_[MODULO]'`

### 2. Editar routes.ts

Abrir `packages/api/src/constants/routes.ts` y agregar al array `MENU`:

**Con subrutas:**
```typescript
{
    title: 'Título Sección',
    icon: 'IconoLucide',
    items: [
        {
            id: PERMISOS.RUTA_MODULO,
            title: 'Nombre Ruta',
            url: '/ruta',
            icon: 'IconoLucide',
        },
    ]
},
```

**Sin subrutas (ruta simple):**
```typescript
{
    id: PERMISOS.RUTA_MODULO,
    title: 'Nombre Ruta',
    url: '/ruta',
    icon: 'IconoLucide',
},
```

### 3. Validar Iconos

- Verificar que el icono existe en Lucide React
- Usar PascalCase: `Truck`, `Users`, `Settings`
- Consultar: [lucide.dev/icons](https://lucide.dev/icons)

### 4. Crear Migración SQL (Si Hay Permisos Nuevos)

Si creaste permisos `RUTA_*` nuevos:

```sql
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('RUTA_MI_MODULO', 'Acceso a página Mi Módulo', 'rutas');
```

**NO asignar a roles en la migración.**

### 5. Validar

- [ ] Permisos existen en backend y frontend (idénticos)
- [ ] Icono en PascalCase
- [ ] URLs con `/` inicial
- [ ] `id` usa constantes `PERMISOS.`
- [ ] Frontend NO modificado (se actualiza automáticamente)

## Output

```
✅ Sección agregada al menú: [titulo]

📝 Ubicación: packages/api/src/constants/routes.ts
🎨 Icono: [icono] (Lucide React)
🔐 Permisos: RUTA_[MODULO]

📋 Próximos pasos:
   - Crear migración SQL si hay permisos nuevos
   - El frontend se actualiza automáticamente
```

## Documentación

- [reference.md](reference.md) - Templates y estructura JSON
- [examples.md](examples.md) - Ejemplos completos
- [template.md](template.md) - Templates para copiar

## Notes

- Solo editar backend (`routes.ts`)
- Frontend se actualiza automáticamente
- Iconos en PascalCase (Lucide React)
- Permisos deben existir en backend **y** frontend
- NO importar iconos manualmente en frontend
