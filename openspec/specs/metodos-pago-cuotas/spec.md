## ADDED Requirements

### Requirement: ABM de métodos de pago
El sistema SHALL permitir crear, editar y desactivar métodos de pago. Cada método tiene nombre, tipo (`efectivo` | `tarjeta_credito` | `tarjeta_debito` | `transferencia` | `qr` | `otro`) y estado activo.

#### Scenario: Creación exitosa
- **WHEN** el usuario envía nombre y tipo válidos
- **THEN** se crea el método activo con id asignado

#### Scenario: Nombre duplicado
- **WHEN** el usuario envía un nombre ya existente
- **THEN** el sistema retorna error de validación

#### Scenario: Desactivar método
- **WHEN** el usuario desactiva un método de pago
- **THEN** el método no aparece en el selector de la pantalla de venta pero sus registros históricos permanecen

---

### Requirement: Cuotas e intereses por método (producto cartesiano)
El sistema SHALL permitir configurar N cuotas por método de pago, cada una con su tasa de interés. La combinación `(metodo_pago_id, cantidad_cuotas)` es única. La tasa puede ser 0 (sin interés).

#### Scenario: Agregar cuota a método
- **WHEN** el usuario agrega una cantidad de cuotas con tasa de interés a un método existente
- **THEN** se guarda la cuota activa para ese método

#### Scenario: Cuota duplicada
- **WHEN** el usuario intenta agregar una cantidad de cuotas que ya existe para ese método
- **THEN** el sistema retorna error de validación

#### Scenario: Tasa cero permitida
- **WHEN** el usuario configura una cuota con tasa 0%
- **THEN** se guarda correctamente indicando cuotas sin interés

#### Scenario: Desactivar cuota individual
- **WHEN** el usuario desactiva una cuota específica de un método
- **THEN** esa cuota ya no aparece en el selector de la pantalla de venta

---

### Requirement: Selección de método y cuotas en pantalla de venta
El sistema SHALL mostrar, al seleccionar un método de pago en la venta, únicamente las cuotas activas de ese método. Al seleccionar cuotas SHALL calcular y mostrar el monto con interés antes de agregar.

#### Scenario: Cuotas disponibles al seleccionar método
- **WHEN** el operador selecciona un método de pago en la pantalla de venta
- **THEN** el selector de cuotas muestra solo las cuotas activas de ese método con su tasa

#### Scenario: Cálculo de interés al seleccionar cuota
- **WHEN** el operador selecciona cantidad de cuotas y monto base
- **THEN** el sistema calcula `monto_con_interes = monto_base * (1 + tasa/100)` y lo muestra antes de confirmar

#### Scenario: Snapshot de tasa al guardar
- **WHEN** el operador confirma la forma de pago
- **THEN** la tasa de interés vigente se guarda en `venta_forma_pago.tasa_interes` como snapshot inmutable

---

### Requirement: Múltiples formas de pago con saldo restante
El sistema SHALL permitir agregar N formas de pago a una venta. El saldo restante SHALL calcularse como `total_venta - suma(monto_con_interes de pagos agregados)`. No se puede confirmar la venta si el saldo restante es mayor a cero.

#### Scenario: Saldo cubierto
- **WHEN** la suma de formas de pago iguala o supera el total de la venta
- **THEN** el saldo restante muestra $0,00 y el botón de confirmar se habilita

#### Scenario: Saldo pendiente
- **WHEN** la suma de formas de pago es menor al total
- **THEN** el saldo restante muestra el monto pendiente y el botón de confirmar permanece deshabilitado

#### Scenario: Eliminar forma de pago agregada
- **WHEN** el operador elimina una forma de pago ya agregada
- **THEN** el saldo restante se recalcula sumando solo las formas de pago restantes

---

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
