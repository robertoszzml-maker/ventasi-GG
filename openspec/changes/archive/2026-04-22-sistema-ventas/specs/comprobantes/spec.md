## ADDED Requirements

### Requirement: Emitir comprobante fiscal (ARCA wsfe)
El sistema SHALL permitir emitir un comprobante fiscal para una venta confirmada, comunicándose con ARCA wsfe para obtener CAE. El tipo de comprobante SHALL ser A (código ARCA 1) para clientes RI, B (código ARCA 6) para CF/Monotributista/Exento. El número de comprobante SHALL obtenerse consultando `FECompUltimoAutorizado` y sumando 1, dentro de la misma transacción.

#### Scenario: Emisión exitosa con CAE
- **WHEN** el operador presiona "Emitir Fiscal ARCA" en una venta confirmada
- **THEN** el sistema llama a ARCA wsfe, obtiene CAE y fecha de vencimiento, persiste el comprobante con estado `emitido` y muestra los datos del CAE al operador

#### Scenario: Error de comunicación con ARCA
- **WHEN** ARCA retorna error o timeout
- **THEN** el comprobante queda en estado `pendiente_cae`, la venta permanece confirmada, y el operador puede reintentar la emisión

#### Scenario: Tipo A requiere CUIT válido
- **WHEN** el operador intenta emitir factura A y el cliente no tiene CUIT cargado
- **THEN** el sistema bloquea la emisión y solicita completar el CUIT del cliente antes de continuar

#### Scenario: No se puede re-emitir comprobante ya emitido
- **WHEN** la venta ya tiene un comprobante en estado `emitido`
- **THEN** el botón de emisión fiscal está deshabilitado y se muestra el CAE ya obtenido

---

### Requirement: Emitir comprobante manual
El sistema SHALL permitir emitir un comprobante manual (sin ARCA) para una venta confirmada. El número SHALL ser correlativo por tipo de comprobante y punto de venta, obtenido con bloqueo de concurrencia. El comprobante manual tiene tipo `manual` y no tiene CAE.

#### Scenario: Emisión manual exitosa
- **WHEN** el operador presiona "Emitir Manual" en una venta confirmada
- **THEN** el sistema asigna el siguiente número correlativo, persiste el comprobante con estado `emitido` (sin CAE) y lo muestra listo para imprimir

#### Scenario: Numeración correlativa sin saltos
- **WHEN** se emiten dos comprobantes manuales de forma concurrente
- **THEN** el sistema asigna números consecutivos sin repetir (usando bloqueo de base de datos)

---

### Requirement: Reintento de emisión fiscal pendiente
El sistema SHALL permitir reintentar la emisión fiscal de un comprobante en estado `pendiente_cae` sin volver a cargar la venta. El reintento usa los mismos datos de la venta original.

#### Scenario: Reintento exitoso
- **WHEN** el operador presiona "Reintentar" en un comprobante pendiente
- **THEN** el sistema vuelve a llamar a ARCA wsfe y, si tiene éxito, actualiza el comprobante a estado `emitido` con el CAE obtenido

#### Scenario: Reintento fallido nuevamente
- **WHEN** ARCA vuelve a fallar en el reintento
- **THEN** el comprobante permanece en `pendiente_cae` y se muestra el error de ARCA

---

### Requirement: Anular comprobante
El sistema SHALL permitir anular un comprobante emitido. La anulación de un comprobante fiscal requiere llamar a ARCA. La anulación de un comprobante manual es solo un cambio de estado. La venta asociada queda en estado `anulada`.

#### Scenario: Anulación de comprobante manual
- **WHEN** el operador anula un comprobante manual
- **THEN** el comprobante queda en estado `anulado`, la venta en estado `anulada`, y el número no se reutiliza

#### Scenario: Anulación de comprobante fiscal
- **WHEN** el operador anula un comprobante fiscal
- **THEN** el sistema informa que la anulación fiscal debe tramitarse directamente en ARCA y marca el comprobante como `anulado` localmente
