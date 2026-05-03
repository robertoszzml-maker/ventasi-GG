## Context

El sistema CRM Pintegralco gestiona artículos con stock, talles y colores. Actualmente `articulo.precio` es un campo único sin control de acceso y sin soporte para múltiples canales de venta. No existe el campo `costo`. El sistema de permisos RBAC ya está implementado y funcionando.

Módulos existentes relevantes: `articulo`, `articulo-variante`, `auth/permissions`, `config`.

## Goals / Non-Goals

**Goals:**
- Modelar listas de precios globales con soporte de lista por defecto
- Relacionar cada artículo con un precio por lista (pivote `articulo_precio`)
- Proteger el campo `costo` mediante permisos granulares (ver / editar separados)
- Auto-generar filas en `articulo_precio` al crear artículo o lista
- Migrar `articulo.precio` a la lista "Precio General" y eliminar la columna
- Edición masiva de precios dentro de una lista

**Non-Goals:**
- Precios por variante (talle/color) — queda fuera del MVP
- Historial de cambios de precio
- Vigencia de precios por fecha (desde/hasta)
- Importar/exportar CSV

## Decisions

### D1: Tabla pivote `articulo_precio` como fuente de verdad de precios

**Decisión:** Todos los precios viven en `articulo_precio(articulo_id, lista_precio_id, precio)` con UNIQUE constraint en el par.

**Alternativa descartada:** Mantener `articulo.precio` como precio por defecto y agregar listas encima. Genera dos fuentes de verdad y deuda técnica inmediata.

**Rationale:** Modelo limpio desde el inicio. La migración se hace en la misma SQL que crea las tablas nuevas.

---

### D2: Lista por defecto con campo `es_default` en `lista_precio`

**Decisión:** `lista_precio.es_default TINYINT(1)`. Solo una lista puede tener `es_default = 1`. El servicio desactiva la anterior al activar una nueva.

**Alternativa descartada:** Guardar `lista_precio_default_id` en tabla `config`. Más pasos para consultar, y mezcla configuración de negocio con referencias entre entidades.

**Rationale:** Más simple de consultar (JOIN directo), más explícito, fácil de validar con constraint.

---

### D3: Auto-generación de `articulo_precio` vía lógica de servicio (no trigger SQL)

**Decisión:** Al crear artículo → el servicio `ArticuloService` llama a `ArticuloPrecioService.inicializarParaArticulo(articuloId)`. Al crear lista → el servicio `ListaPrecioService` llama a `ArticuloPrecioService.inicializarParaLista(listaPrecioId, opcion)`.

**Alternativa descartada:** Subscriber TypeORM en `AfterInsert`. Más difícil de testear, y las opciones de inicialización requieren parámetros externos que un subscriber no maneja bien.

**Rationale:** La lógica queda en el servicio, es explícita, fácil de leer y de extender.

---

### D4: Protección del campo `costo` en el servicio, no en interceptor global

**Decisión:** `ArticuloService` recibe el usuario del request y omite `costo` del DTO de respuesta si no tiene `ARTICULO_VER_COSTO`. No se usa un interceptor genérico.

**Alternativa descartada:** Interceptor global que borre campos sensibles por decorador. Más flexible pero agrega complejidad invisible.

**Rationale:** Explícito, auditable, sin magia. El servicio sabe exactamente qué devuelve según quién pregunta.

---

### D5: Edición masiva con endpoint UPSERT por lote

**Decisión:** `PATCH /articulo-precio/lote` recibe `[{articuloId, listaPrecioId, precio}]` y hace UPSERT en bulk.

**Rationale:** Un solo request, sin N+1. El frontend envía solo los artículos que cambiaron.

---

### D6: Opciones de inicialización al crear lista

Cuatro modos, ejecutados en el backend:

| Modo | Lógica |
|------|--------|
| `CERO` | `precio = 0` para todos los artículos activos |
| `COPIAR` | Copia precios de `lista_precio_id` origen |
| `PORCENTAJE` | `precio = precio_origen * (1 + pct/100)`, redondeado a 4 decimales |
| `DESDE_COSTO` | `precio = articulo.costo * factor` — requiere `ARTICULO_VER_COSTO` |

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|-----------|
| Al crear artículo falla la auto-generación de precios → artículo sin filas en `articulo_precio` | Wrappear en transacción; si falla rollback completo |
| Al crear lista con miles de artículos → insert masivo lento | Usar INSERT en bulk (un query, no N inserts); aceptable para MVP |
| Modo `DESDE_COSTO` expone costo indirectamente si no se valida el permiso | Backend valida permiso antes de ejecutar ese modo; si falla → error 403 |
| Desincronía: artículos activos sin precio en listas nuevas si el proceso falla a mitad | El INSERT bulk es atómico en transacción; no queda estado parcial |

## Migration Plan

1. Ejecutar `4.sql`:
   - Crear `lista_precio` con seed "Precio General" (`es_default = 1`)
   - Crear `articulo_precio`
   - `INSERT INTO articulo_precio SELECT id, 1, precio FROM articulo` (migra valores)
   - `ALTER TABLE articulo DROP COLUMN precio`
   - `ALTER TABLE articulo ADD COLUMN costo DECIMAL(15,4) DEFAULT '0.0000'`
   - Insertar permisos nuevos en `permissions`

2. Deploy backend (nuevo módulo, endpoint protegidos)

3. Deploy frontend (pantallas nuevas, formulario artículo actualizado)

**Rollback:** Restaurar columna `precio` desde backup y revertir deploy. La tabla `articulo_precio` puede coexistir sin romper nada si se restaura `precio`.

## Open Questions

- ¿El precio 0 en una lista se muestra como "Sin precio definido" o como "$0,00" en el frontend? (impacta UX de la tabla de edición)
- ¿Qué roles concretos existen hoy en el sistema? (para asignar permisos en el seed)
