## ADDED Requirements

### Requirement: Registrar entrada al local
El sistema SHALL permitir registrar la entrada de una persona o grupo al local seleccionando obligatoriamente un tipo de visitante (estático) y opcionalmente una o más características físicas (configurables). El registro crea una `visita` con `estado = PENDIENTE`.

Los tipos de visitante SHALL ser un enum fijo: MUJER, HOMBRE, ADULTO_MAYOR, JOVEN, PAREJA, FAMILIA, GRUPO. Cada uno tiene un avatar ilustrativo definido en el sistema.

Una pareja o grupo SHALL registrarse como una sola visita (unidad de compra), no como N visitas individuales.

#### Scenario: Registro de entrada exitoso
- **WHEN** el empleado selecciona un tipo de visitante y presiona "Registrar entrada"
- **THEN** se crea una visita con estado=PENDIENTE, fecha y hora actuales, tipo seleccionado, y características elegidas (si las hay)

#### Scenario: Registro sin tipo de visitante rechazado
- **WHEN** el empleado intenta registrar una entrada sin seleccionar tipo de visitante
- **THEN** el sistema no permite confirmar y muestra indicación de campo requerido

#### Scenario: Registro con características múltiples
- **WHEN** el empleado selecciona tipo HOMBRE y características [ALTO, MUSCULOSO]
- **THEN** la visita se crea con tipo=HOMBRE y dos registros en visita_caracteristica

---

### Requirement: Resolver visita como compra
El sistema SHALL permitir marcar una visita PENDIENTE como COMPRA. Al hacerlo SHALL redirigir al flujo de creación de movimiento de inventario con procedencia=ubicacion y destino=cliente pre-configurados, y vincular el movimiento resultante a la visita mediante `visita_id`.

#### Scenario: Resolución como compra
- **WHEN** el empleado presiona "Compró" en una visita PENDIENTE
- **THEN** la visita pasa a estado=COMPRA y se abre el formulario de nuevo movimiento con campos de procedencia y destino pre-configurados

#### Scenario: Movimiento vinculado a visita
- **WHEN** el empleado completa y confirma el movimiento creado desde el flujo de visita
- **THEN** el movimiento queda con visita_id apuntando a la visita correspondiente

---

### Requirement: Resolver visita como no compra
El sistema SHALL permitir marcar una visita PENDIENTE como NO_COMPRA. SHALL requerir seleccionar una razón activa. La sub-razón, artículo del catálogo y observaciones son opcionales.

#### Scenario: Resolución sin razón rechazada
- **WHEN** el empleado intenta confirmar una no-compra sin seleccionar razón
- **THEN** el sistema no permite confirmar y muestra indicación de campo requerido

#### Scenario: Resolución con razón y sub-razón
- **WHEN** el empleado selecciona razón "Falta de stock" y sub-razón "Sin talle" y confirma
- **THEN** la visita pasa a estado=NO_COMPRA con razon_id y sub_razon_id registrados

#### Scenario: Resolución con artículo del catálogo
- **WHEN** el empleado selecciona un artículo del catálogo en el campo opcional
- **THEN** la visita queda con articulo_id apuntando al artículo seleccionado

#### Scenario: Sub-razones filtradas por razón
- **WHEN** el empleado selecciona una razón
- **THEN** el selector de sub-razón muestra únicamente las sub-razones activas pertenecientes a esa razón

---

### Requirement: Visualizar pendientes y estadísticas del día en tiempo real
La pantalla de registro SHALL mostrar en tiempo real:
- Lista de visitas PENDIENTES del día, ordenadas por hora de entrada (más antigua primero), con tipo de visitante, características y hora
- Contadores del día: total entradas, total compras, total no-compras, porcentaje de conversión
- Los contadores SHALL actualizarse al registrar cada entrada o resolución sin recargar la página

#### Scenario: Lista de pendientes visible
- **WHEN** hay visitas con estado=PENDIENTE del día actual
- **THEN** se muestran en la pantalla con botones [Compró] [No compró] por cada una

#### Scenario: Sin pendientes
- **WHEN** no hay visitas PENDIENTE en el día
- **THEN** la lista muestra un estado vacío indicando que no hay visitas pendientes de resolución

#### Scenario: Contadores actualizados en tiempo real
- **WHEN** se registra una nueva entrada o se resuelve una visita
- **THEN** los contadores del día se actualizan sin recargar la página completa
