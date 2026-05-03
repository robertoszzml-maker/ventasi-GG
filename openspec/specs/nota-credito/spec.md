### Requirement: Emisión de nota de crédito
El sistema SHALL permitir crear y emitir una nota de crédito como una operación del tipo 'nota_credito' sobre la entidad `venta`. Una NC MUST tener al menos un ítem en `venta_detalle`, al menos un cobro en `cobro` que represente el medio por el que se devuelve el dinero, y un comprobante asociado. La referencia a la venta original (`venta_origen_id`) SHALL ser opcional.

#### Scenario: Creación de NC con referencia a venta original
- **WHEN** el operador crea una NC referenciando la venta #123
- **THEN** el registro `venta` se crea con `tipo_operacion = 'nota_credito'` y `venta_origen_id = 123`

#### Scenario: Creación de NC sin venta de origen
- **WHEN** el operador crea una NC sin referenciar una venta
- **THEN** el registro `venta` se crea con `tipo_operacion = 'nota_credito'` y `venta_origen_id = null`

#### Scenario: NC emitida genera movimiento EGRESO en caja
- **WHEN** se emite (confirma) una NC con cobro de $500 en efectivo
- **THEN** se genera automáticamente un `movimiento_caja` EGRESO de $500 en la sesión activa

---

### Requirement: Comprobante de NC fiscal y no fiscal
El sistema SHALL generar el comprobante asociado a la NC con el tipo correcto según la condición impositiva del cliente (NC-A, NC-B, NC-C para fiscal; NC-X o similar para no fiscal). El comprobante MUST respetar la numeración correlativa del tipo correspondiente.

#### Scenario: NC para cliente inscripto genera NC-A
- **WHEN** se emite una NC para un cliente con condición IVA Responsable Inscripto
- **THEN** el comprobante se genera como tipo NC-A con el próximo número correlativo

#### Scenario: NC para consumidor final genera NC-B
- **WHEN** se emite una NC para un cliente Consumidor Final
- **THEN** el comprobante se genera como tipo NC-B con el próximo número correlativo

---

### Requirement: Listado de notas de crédito
El sistema SHALL proveer un listado paginado de todas las NC emitidas, filtrable por fecha, cliente y estado.

#### Scenario: Listado paginado de NC
- **WHEN** el operador accede a la sección de notas de crédito
- **THEN** ve un listado paginado de registros con `tipo_operacion = 'nota_credito'` ordenado por fecha descendente
