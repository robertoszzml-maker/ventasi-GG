## Context

El artículo es la entidad central del sistema. Actualmente tiene información de identificación, costos y curvas de talle/color, pero carece de clasificación comercial (continuidad vs. temporada) e indicadores operativos (ancla, umbrales de stock). Las variantes (`articulo_variante`) ya existen y tienen stock calculado desde `stock_por_ubicacion` vía un `VirtualColumn` de suma agregada en la grilla. El dashboard actual está vacío.

## Goals / Non-Goals

**Goals:**
- Agregar `tipo_continuidad` y `es_ancla` a `articulo` sin romper APIs existentes.
- Agregar `stock_minimo`, `stock_seguridad`, `stock_maximo` a `articulo_variante` (nullable).
- Calcular el estado semáforo en runtime en el backend (no persistirlo).
- Exponer dos endpoints de carga masiva de umbrales (atajo A y B).
- Construir el dashboard de anclas con variantes expandibles y semáforo.

**Non-Goals:**
- Historial de cambios en umbrales (auditoría).
- Alertas automáticas o notificaciones por stock bajo.
- Umbrales por ubicación (solo por variante global).
- Cálculo de punto de reorden o sugerencias de compra.

## Decisions

### 1. Umbrales en `articulo_variante`, no en tabla separada
La relación es 1:1 (una variante tiene un solo set de umbrales). Columnas directas evitan un JOIN adicional. Si en el futuro se necesitan umbrales por ubicación, se migra a tabla separada.

**Alternativa descartada**: Tabla `umbral_stock_variante` separada. Agrega complejidad de JOIN sin beneficio actual.

### 2. Estado semáforo calculado en el servicio, no persistido
El estado es derivado puramente del stock actual vs. umbrales. Persistirlo requeriría mantener coherencia en cada movimiento de stock. El cálculo en runtime es O(1) por variante.

```
stockVariante ≤ stock_minimo              → ROJO
stock_minimo < stockVariante ≤ stock_seg  → AMARILLO
stockVariante > stock_seguridad           → VERDE
(stock_minimo IS NULL)                    → SIN_ESTADO
```

### 3. Endpoint dedicado para dashboard de anclas
En lugar de reutilizar el endpoint de listado de artículos con filtros, se crea `GET /articulos/dashboard-anclas` que devuelve la estructura jerárquica (artículo → variantes con stock y estado) en una sola query optimizada. Evita N+1 y permite estructurar la respuesta exactamente como la necesita el dashboard.

### 4. Atajo A y B como endpoints independientes
- **Atajo A** (`POST /articulo-variante/bulk-umbrales`): recibe `articuloId` + umbrales → aplica a todas las variantes activas del artículo. Transacción única.
- **Atajo B** (`POST /articulo-variante/:id/copiar-umbrales`): copia los umbrales de la variante origen a todas las demás variantes del mismo artículo. Transacción única.

**Alternativa descartada**: Un único endpoint genérico de bulk patch. Menos expresivo en la UI y requiere que el frontend construya la lista de IDs.

### 5. Extensión de `getGrilla` con umbrales y estado
El método `getGrilla` de `ArticuloVarianteService` ya devuelve cada celda con `varianteId` y `cantidad`. Se extiende para incluir `stockMinimo`, `stockSeguridad`, `stockMaximo` y `estadoSemaforo` por celda. El query SQL ya hace JOIN con `articulo_variante`; solo se agregan las columnas nuevas al SELECT.

### 6. `tipo_continuidad` como columna VARCHAR (enum de BD)
Siguiendo la regla del proyecto: VARCHAR para valores de negocio. Los valores válidos son `'continuidad'` y `'temporada'`. La validación se hace en el DTO con `@IsIn(['continuidad', 'temporada'])`.

## Risks / Trade-offs

- **Umbrales opcionales (nullable)**: Una variante sin umbrales muestra ⚪ SIN_ESTADO. El dashboard solo muestra filas de artículos ancla — si ninguna variante tiene umbrales definidos, la fila del artículo aparece con estado SIN_ESTADO. Esto es intencional; el usuario define umbrales gradualmente.
- **Grilla extendida**: Agregar columnas de umbrales a `getGrilla` aumenta el payload. Impacto mínimo dado el tamaño típico de variantes por artículo.
- **Dashboard sin paginación inicial**: El dashboard carga todos los artículos ancla. Si hay muchos artículos ancla, puede ser lento. Mitigación: índice en `es_ancla` en la migración.

## Migration Plan

1. Ejecutar migración SQL: ALTER TABLE en `articulo` y `articulo_variante`.
2. Deploy backend: nuevos endpoints disponibles, campos existentes sin cambios (nullable).
3. Deploy frontend: nuevos campos en form y tab inventario visible para usuarios con permiso.
4. No hay rollback complejo — los campos son aditivos y nullable.

## Open Questions

- ¿El dashboard de anclas reemplaza o complementa el dashboard actual (`/dashboard`)? → Asumo que lo reemplaza por ahora (el actual está vacío).
- ¿Se necesita filtrar el dashboard por `tipo_continuidad`? → No incluido en el alcance actual.
