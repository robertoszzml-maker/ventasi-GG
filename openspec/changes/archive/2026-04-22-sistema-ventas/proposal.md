## Why

El sistema no tiene módulo de ventas: no existe forma de registrar una transacción comercial, emitir comprobantes fiscales (ARCA/wsfe) ni manuales, ni cobrar con múltiples formas de pago. Las ventas están conectadas al flujo de visitas ya existente (el local mide conversión), por lo que cada "Venta Sí" hoy queda sin datos financieros ni fiscales asociados.

## What Changes

- Nuevo módulo `vendedor` con ABM y selección por venta (sesión compartida entre vendedores)
- Nuevo módulo `metodo-pago` con cuotas e intereses configurables (producto cartesiano método × cuotas → tasa)
- Nuevo módulo `venta` con cabecera (cliente, vendedor, lista de precio, tipo de comprobante), detalle de artículos (variante talle×color, cantidad, precio, descuento por línea) y formas de pago aplicadas
- Cálculo de subtotal, descuento general (% y monto), recargo general (% y monto), IVA 21% y total
- Nuevo módulo `comprobante` con dos tipos: fiscal (integrado con ARCA wsfe — CAE) y manual (numeración interna correlativa)
- Impresión via `window.print()` con plantillas HTML para formato A4 y térmico 80mm, formato default configurable
- Nuevo módulo `wsfe` en `afip-api` para `FECAESolicitar` y `FECompUltimoAutorizado`
- Punto de venta ARCA configurable por local (tabla `config`)
- **BREAKING** Entidad `visita` gana campo `venta_id` (nullable); el campo `movimiento_id` queda obsoleto en el flujo de venta (el movimiento de stock lo genera la venta al confirmarse)
- Entidad `cliente` se extiende con datos fiscales: CUIT, condición IVA, domicilio, localidad, provincia, código postal
- Entidad `articulo` gana campo `alicuota_iva` (default `'21'`)
- Cliente genérico "Consumidor Final" como fallback para ventas a clientes sin CUIT (factura B)

## Capabilities

### New Capabilities

- `gestion-vendedores`: ABM de perfiles vendedor, independiente del usuario del sistema. La misma sesión puede ser usada por distintos vendedores seleccionándose al registrar cada venta.
- `metodos-pago-cuotas`: Configuración de métodos de pago con tabla de cuotas e intereses (producto cartesiano). Pantalla de administración separada.
- `pantalla-venta`: Pantalla principal de venta: selección de cliente/vendedor/lista/comprobante, carga de artículos por variante, descuentos/recargos, IVA, formas de pago múltiples con saldo restante.
- `comprobantes`: Generación de comprobantes fiscales (ARCA wsfe con CAE) y manuales (numeración interna). Ambos imprimibles. Tipos válidos para RI: A, B, E.
- `impresion-comprobantes`: Plantillas de impresión HTML para térmica (80mm) y A4. Selección de formato por defecto en config.
- `integracion-wsfe`: Módulo wsfe en afip-api para comunicación con el webservice de facturación electrónica de ARCA (FECAESolicitar, FECompUltimoAutorizado, FEParamGetTiposCbte).

### Modified Capabilities

- `gestion-clientes`: La entidad cliente se extiende con campos fiscales (CUIT, condición IVA, domicilio, localidad, provincia, código postal) necesarios para la emisión de comprobantes ARCA.
- `movimientos-inventario`: Al confirmar una venta, se genera automáticamente un movimiento de inventario de salida (ubicación → cliente). La visita referencia la venta en lugar del movimiento directamente.

## Impact

- **Backend api**: nuevos módulos `vendedor`, `metodo-pago`, `venta`, `comprobante`; extensión de `cliente`, `articulo`, `visita`
- **Backend afip-api**: nuevo módulo `wsfe`
- **Frontend**: 4 nuevas secciones (`/config/vendedores`, `/config/metodos-pago`, `/ventas`, `/ventas/[id]`); formulario de cliente extendido
- **Base de datos**: nueva migración SQL (5.sql)
- **Permisos**: ~15 nuevos permisos (vendedor, metodo-pago, venta, comprobante, arca-config)
- **Config**: claves nuevas `ARCA_PUNTO_VENTA`, `ARCA_RAZON_SOCIAL`, `IMPRESION_FORMATO_DEFAULT`
