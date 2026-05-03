## Context

El sistema ya cuenta con `articulo_variante` (combinación talle+color por artículo) con un campo `cantidad` de stock global. No existe trazabilidad de movimientos, ni distinción de stock por ubicación física. Se necesita un sistema de inventario completo que mantenga compatibilidad con lo existente.

Módulos existentes relevantes: `articulo`, `articulo-variante`, `talle`, `color`, `auth/usuario`.

## Goals / Non-Goals

**Goals:**
- Registrar movimientos de inventario inmutables (sin DELETE).
- Conocer el stock de cada variante por ubicación en tiempo real.
- Soportar procedencia y destino de distintos tipos: ubicación, proveedor, cliente.
- Pantalla de carga con N artículos, grilla talle×color por artículo.
- Crear automáticamente nuevas variantes desde el formulario de movimiento.

**Non-Goals:**
- Integración con AFIP o facturación.
- Gestión de precios o costos en movimientos.
- Reportes o analytics avanzados (fuera de scope).
- Migración del campo `articulo_variante.cantidad` (queda como legacy sin eliminar).

## Decisions

### 1. Stock materializado vs calculado on-the-fly

**Decisión**: stock materializado en `stock_por_ubicacion`.

**Alternativa considerada**: calcular el stock sumando todos los movimientos (`SUM(cantidad) WHERE tipo=INGRESO - SUM(cantidad) WHERE tipo=EGRESO`).

**Rationale**: Con muchos movimientos históricos, la query calculada se vuelve lenta. La tabla materializada permite consultas O(1) con índice compuesto `(articulo_variante_id, ubicacion_id)`. Se actualiza dentro de la misma transacción que el movimiento, garantizando consistencia.

---

### 2. Procedencia/Destino: 3 FKs nulleables vs referencia polimórfica

**Decisión**: 6 columnas nullable (3 para procedencia, 3 para destino), una FK real por tipo de entidad.

```
procedencia_ubicacion_id  FK → ubicacion   (nullable)
procedencia_proveedor_id  FK → proveedor   (nullable)
procedencia_cliente_id    FK → cliente     (nullable)

destino_ubicacion_id      FK → ubicacion   (nullable)
destino_proveedor_id      FK → proveedor   (nullable)
destino_cliente_id        FK → cliente     (nullable)
```

**Alternativa considerada**: columnas `procedencia_tipo` (ENUM) + `procedencia_id` (INT sin FK).

**Rationale**: Las FKs reales garantizan integridad referencial en la base de datos. El tipo de movimiento actúa como guía de qué campos se esperan seteados. Regla de negocio: exactamente uno de los 3 campos de procedencia debe estar seteado (excepto ARREGLO), igual para destino.

---

### 3. TRANSFERENCIA como tipo explícito

**Decisión**: agregar `TRANSFERENCIA` como 4° tipo (además de INGRESO, EGRESO, ARREGLO).

**Rationale**: una transferencia entre ubicaciones (depósito → local) tiene semántica propia: afecta dos ubicaciones simultáneamente. Modelarla como INGRESO con procedencia_ubicacion seteada es confuso. Con tipo TRANSFERENCIA el listado es inmediatamente legible y el backend sabe qué hacer (restar de procedencia, sumar a destino).

---

### 4. ARREGLO: cantidad_anterior y cantidad_nueva en el detalle

**Decisión**: los campos `cantidad_anterior` y `cantidad_nueva` viven en `movimiento_inventario_detalle`, no en la cabecera.

**Rationale**: el arreglo puede afectar múltiples variantes de múltiples artículos en una sola operación. Cada línea de detalle registra su propio antes/después. `cantidad` en ese caso representa el delta (`nueva - anterior`).

---

### 5. Creación automática de variante desde el movimiento

**Decisión**: al registrar un movimiento con una combinación talle+color inexistente para un artículo, el backend crea el registro en `articulo_variante` dentro de la misma transacción.

**Rationale**: el frontend ofrece `[+ Nueva combinación]` en la grilla. El usuario no debería tener que navegar a otro módulo para habilitarla. La transaccionalidad garantiza que si el movimiento falla, la variante no queda huérfana.

---

### 6. Cantidad total calculada

**Decisión**: `cantidad_total` en la cabecera se calcula sumando todas las líneas de detalle y se persiste en la base de datos.

**Rationale**: evita recalcular en cada consulta del listado. Se actualiza en el mismo INSERT transaccional.

## Risks / Trade-offs

- **Desincronización de stock_por_ubicacion** → Mitigación: toda escritura de movimiento usa transacción de base de datos; si el UPDATE de stock falla, el movimiento no se persiste.
- **Concurrencia en stock** → Mitigación: usar `UPDATE stock_por_ubicacion SET cantidad = cantidad ± X` (no SELECT + UPDATE) para evitar race conditions.
- **articulo_variante.cantidad queda obsoleta** → Mitigación: no eliminar el campo; documentar que el stock real vive en `stock_por_ubicacion`. Se puede sincronizar en una futura migración.
- **Validación de "exactamente un procedencia/destino seteado"** → Mitigación: validar en el DTO/servicio de NestJS, no solo en BD.

## Migration Plan

1. Ejecutar migración SQL (nueva tabla, sin ALTER en existentes).
2. Insertar permisos RBAC para los nuevos módulos.
3. Deploy backend con los nuevos módulos.
4. Deploy frontend con las nuevas páginas.
5. No hay rollback destructivo: las tablas nuevas se pueden eliminar sin afectar lo existente.
