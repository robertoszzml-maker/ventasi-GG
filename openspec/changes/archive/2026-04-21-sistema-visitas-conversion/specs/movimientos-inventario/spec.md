## ADDED Requirements

### Requirement: Vincular movimiento a visita
El sistema SHALL soportar un campo opcional `visita_id` en `movimiento_inventario` que referencia la visita que originó la venta. Este campo SHALL popularse automáticamente cuando el movimiento se crea desde el flujo de registro de visitas. Los movimientos creados fuera de ese flujo tendrán `visita_id = null`.

#### Scenario: Movimiento creado desde flujo de visita
- **WHEN** el empleado resuelve una visita como COMPRA y completa el movimiento
- **THEN** el movimiento queda con visita_id apuntando a la visita correspondiente

#### Scenario: Movimiento creado fuera del flujo de visita
- **WHEN** el empleado crea un movimiento desde la pantalla de movimientos directamente
- **THEN** el movimiento se crea con visita_id = null, sin afectar ningún comportamiento existente
