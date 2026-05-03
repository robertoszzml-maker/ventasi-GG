## Why

El sistema carece de trazabilidad de inventario: no es posible registrar movimientos de stock, conocer dónde están físicamente los artículos ni auditar entradas y salidas. Se necesita un módulo de inventario que permita registrar ingresos, egresos, arreglos y transferencias por ubicación, con trazabilidad completa y sin posibilidad de eliminar registros.

## What Changes

- **Nueva entidad `ubicacion`**: locales físicos, depósitos y cualquier punto de almacenamiento gestionable.
- **Nueva entidad `proveedor`**: origen externo de ingresos y destino de devoluciones.
- **Nueva entidad `cliente`**: destino externo de egresos (ventas, regalos, etc.).
- **Nueva tabla `movimiento_inventario`**: cabecera del movimiento con tipo (INGRESO, EGRESO, ARREGLO, TRANSFERENCIA), procedencia, destino, fecha, responsable y descripción opcional.
- **Nueva tabla `movimiento_inventario_detalle`**: líneas del movimiento, una por combinación artículo-variante (talle+color), con cantidad. Para ARREGLO guarda cantidad_anterior y cantidad_nueva.
- **Nueva tabla `stock_por_ubicacion`**: stock materializado por combinación `articulo_variante + ubicacion`, actualizado atómicamente con cada movimiento.
- **Extensión de `articulo_variante`**: al registrar un movimiento con una combinación nueva, se crea automáticamente la variante en el artículo.
- **Pantalla de movimiento**: formulario con N artículos expandibles, cada uno mostrando una grilla talle×color para ingresar cantidades. Una única procedencia y destino aplica a todos los artículos del movimiento.
- Los movimientos **no pueden eliminarse** (solo lectura tras registrar).

## Capabilities

### New Capabilities

- `gestion-ubicaciones`: ABM de ubicaciones físicas (locales, depósitos, etc.).
- `gestion-proveedores`: ABM de proveedores externos.
- `gestion-clientes`: ABM de clientes.
- `movimientos-inventario`: registro de movimientos de stock (ingreso, egreso, arreglo, transferencia) con detalles por variante y actualización de stock por ubicación.
- `stock-por-ubicacion`: consulta del stock actual por artículo-variante y ubicación, derivado de los movimientos registrados.

### Modified Capabilities

## Impact

- **Backend**: 6 nuevos módulos NestJS (`ubicacion`, `proveedor`, `cliente`, `movimiento-inventario`, `movimiento-inventario-detalle`, `stock-por-ubicacion`). Extensión de `articulo-variante` para creación automática desde movimientos.
- **Base de datos**: migración SQL con tablas `ubicacion`, `proveedor`, `cliente`, `movimiento_inventario`, `movimiento_inventario_detalle`, `stock_por_ubicacion`. Permisos RBAC para cada módulo.
- **Frontend**: páginas de ABM para ubicaciones, proveedores y clientes. Página de listado de movimientos. Formulario de movimiento con grilla talle×color expandible por artículo.
- **Sin breaking changes** en módulos existentes.
