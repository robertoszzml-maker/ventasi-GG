## ADDED Requirements

### Requirement: Impresión de comprobante en formato A4
El sistema SHALL proveer una plantilla de impresión A4 para comprobantes fiscales y manuales, activada via `window.print()`. La plantilla SHALL incluir: datos del emisor (razón social, CUIT, condición IVA, punto de venta, domicilio), datos del receptor (nombre, CUIT, condición IVA), detalle de artículos, totalizador (subtotal, descuento, recargo, IVA, total), formas de pago, número de comprobante, fecha, y CAE + vencimiento CAE (solo fiscal).

#### Scenario: Impresión A4 de factura fiscal
- **WHEN** el operador presiona "Imprimir" en un comprobante fiscal emitido con formato A4
- **THEN** el browser abre el diálogo de impresión con el layout A4 correcto, incluyendo CAE y vencimiento

#### Scenario: Impresión A4 de comprobante manual
- **WHEN** el operador presiona "Imprimir" en un comprobante manual con formato A4
- **THEN** el browser abre el diálogo de impresión con el layout A4, sin sección de CAE

---

### Requirement: Impresión de comprobante en formato térmico (80mm)
El sistema SHALL proveer una plantilla de impresión térmica (80mm) para comprobantes, activada via `window.print()`. El layout SHALL adaptarse a 80mm de ancho con tipografía monoespaciada y sin elementos gráficos complejos.

#### Scenario: Impresión térmica de comprobante
- **WHEN** el operador presiona "Imprimir" con formato térmico seleccionado
- **THEN** el browser abre el diálogo de impresión con el layout 80mm, optimizado para impresora térmica

---

### Requirement: Formato de impresión por defecto configurable
El sistema SHALL leer la clave `IMPRESION_FORMATO_DEFAULT` de la tabla `config` para determinar el formato por defecto (`termica` | `a4`). El operador puede cambiar el formato por venta sin modificar la configuración global.

#### Scenario: Formato por defecto aplicado
- **WHEN** el operador abre la vista de impresión de un comprobante
- **THEN** el selector de formato muestra el valor configurado en `IMPRESION_FORMATO_DEFAULT`

#### Scenario: Cambio de formato por venta
- **WHEN** el operador selecciona un formato diferente al default antes de imprimir
- **THEN** se usa el formato seleccionado para esa impresión sin persistir el cambio globalmente
