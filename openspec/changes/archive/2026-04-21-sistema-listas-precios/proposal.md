## Why

El sistema actual almacena un único campo `precio` por artículo, lo que no permite manejar distintos precios según canal de venta o segmento de cliente. Además, el costo del artículo es un dato sensible que hoy no existe como campo y no tiene control de acceso.

## What Changes

- **BREAKING** Eliminar columna `articulo.precio` (migrar su valor a la lista "Precio General")
- Agregar columna `articulo.costo` (dato interno, protegido por permisos)
- Crear tabla `lista_precio` con soporte de lista por defecto (`es_default`)
- Crear tabla `articulo_precio` como pivote entre artículo y lista de precios
- Al crear un artículo → se generan automáticamente sus precios en todas las listas activas (precio = 0)
- Al crear una lista → se generan automáticamente los precios de todos los artículos activos con opción de inicialización
- Opciones de inicialización: cero, copiar lista, aplicar porcentaje, calcular desde costo
- Edición masiva de precios dentro de una lista
- Control de acceso RBAC sobre el campo costo (ver y editar separados)
- Backend nunca expone `costo` a usuarios sin el permiso correspondiente

## Capabilities

### New Capabilities

- `gestion-costo-articulo`: Campo costo en artículo con control de acceso por permiso (ver/editar separados)
- `listas-de-precios`: ABM de listas de precios globales con lista por defecto y opciones de inicialización
- `precios-por-lista`: Precio de cada artículo en cada lista, edición individual y masiva
- `migracion-precio-legacy`: Migración del campo `articulo.precio` a la lista "Precio General" y eliminación de la columna

### Modified Capabilities

## Impact

- **Backend**: módulos `articulo`, nuevos módulos `lista-precio` y `articulo-precio`, subscriber TypeORM para auto-generar precios
- **Frontend**: formulario de artículo (costo con permiso), 2 nuevas pantallas (listas de precios + edición de precios por lista)
- **Base de datos**: migración SQL (nueva migración 4.sql)
- **Permisos**: 6 nuevos permisos en tabla `permissions`
- **Breaking**: cualquier código que lea `articulo.precio` debe actualizarse (confirmado: no hay referencias activas en frontend)
