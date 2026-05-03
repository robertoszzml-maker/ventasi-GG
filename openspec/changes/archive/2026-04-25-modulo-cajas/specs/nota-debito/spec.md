## ADDED Requirements

### Requirement: Emisión de nota de débito
El sistema SHALL permitir crear y emitir una nota de débito como una operación del tipo 'nota_debito' sobre la entidad `venta`. Una ND MUST tener al menos un ítem en `venta_detalle`, al menos un cobro en `cobro` que represente el medio por el que se recibe el pago adicional, y un comprobante asociado. La referencia a la venta original (`venta_origen_id`) SHALL ser opcional.

#### Scenario: Creación de ND con referencia a venta original
- **WHEN** el operador crea una ND referenciando la venta #456
- **THEN** el registro `venta` se crea con `tipo_operacion = 'nota_debito'` y `venta_origen_id = 456`

#### Scenario: ND emitida genera movimiento INGRESO en caja
- **WHEN** se emite (confirma) una ND con cobro de $200 en transferencia
- **THEN** se genera automáticamente un `movimiento_caja` INGRESO de $200 en la sesión activa

---

### Requirement: Comprobante de ND fiscal y no fiscal
El sistema SHALL generar el comprobante asociado a la ND con el tipo correcto según la condición impositiva del cliente (ND-A, ND-B, ND-C para fiscal; ND-X o similar para no fiscal), respetando la numeración correlativa.

#### Scenario: ND para cliente inscripto genera ND-A
- **WHEN** se emite una ND para un cliente con condición IVA Responsable Inscripto
- **THEN** el comprobante se genera como tipo ND-A con el próximo número correlativo

#### Scenario: ND para consumidor final genera ND-B
- **WHEN** se emite una ND para un cliente Consumidor Final
- **THEN** el comprobante se genera como tipo ND-B con el próximo número correlativo

---

### Requirement: Listado de notas de débito
El sistema SHALL proveer un listado paginado de todas las ND emitidas, filtrable por fecha, cliente y estado.

#### Scenario: Listado paginado de ND
- **WHEN** el operador accede a la sección de notas de débito
- **THEN** ve un listado paginado de registros con `tipo_operacion = 'nota_debito'` ordenado por fecha descendente
