## REMOVED Requirements

### Requirement: ABM de métodos de pago
**Reason**: Reemplazado por la capacidad `medios-de-pago`. El modelo `metodo_pago + cuota_metodo_pago` se elimina y es sustituido por `medio_pago` con código rápido por variante operacional.
**Migration**: Usar el módulo `medio-pago` con el endpoint de ABM correspondiente.

### Requirement: Cuotas e intereses por método (producto cartesiano)
**Reason**: Reemplazado por el modelo plano de `medio_pago` donde cada variante (V1, V3, V6) es una fila independiente con cuotas fijas. La tasa de interés es gestionada por el módulo de Cobranzas vía `arancel` y `plazo_dias`.
**Migration**: Cada combinación método+cuotas existente se convierte en una fila de `medio_pago` con su código único.

### Requirement: Selección de método y cuotas en pantalla de venta
**Reason**: Reemplazado por los flujos de selección de medio por código rápido y botones rápidos, documentados en `pos-venta-agil` y `cobros`.
**Migration**: Ver requirements actualizados en `pos-venta-agil`.
