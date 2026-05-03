## MODIFIED Requirements

### Requirement: Registrar movimiento de inventario
El sistema SHALL permitir registrar un movimiento de inventario con cabecera y N líneas de detalle (una por variante de artículo). El movimiento NO puede eliminarse ni modificarse tras su registro.

Los tipos de movimiento SHALL ser:
- **INGRESO**: entra stock a una ubicación (desde proveedor, cliente o ubicación).
- **EGRESO**: sale stock de una ubicación (hacia cliente, proveedor u otra ubicación).
- **ARREGLO**: ajuste de stock en una ubicación; guarda cantidad_anterior y cantidad_nueva por variante.
- **TRANSFERENCIA**: mueve stock de una ubicación a otra; resta en procedencia y suma en destino.
- **VENTA**: egreso de stock generado automáticamente al confirmar una venta. No se puede crear manualmente.

La cabecera SHALL contener:
- `tipo`: INGRESO | EGRESO | ARREGLO | TRANSFERENCIA | VENTA
- `fecha`: fecha del movimiento
- `responsable_id`: usuario responsable
- `descripcion`: opcional, texto libre
- `cantidad_total`: calculado automáticamente como suma de las cantidades de los detalles
- `venta_id`: referencia a la venta (solo para tipo VENTA, opcional en los demás)
- Procedencia (exactamente uno de): `procedencia_ubicacion_id`, `procedencia_proveedor_id`, `procedencia_cliente_id`
- Destino (exactamente uno de): `destino_ubicacion_id`, `destino_proveedor_id`, `destino_cliente_id`

#### Scenario: Ingreso desde proveedor exitoso
- **WHEN** el usuario registra un movimiento tipo INGRESO con procedencia_proveedor, destino_ubicacion y al menos un detalle con cantidad > 0
- **THEN** se persiste el movimiento, se persisten los detalles, se incrementa stock_por_ubicacion para cada variante en el destino, y se calcula cantidad_total

#### Scenario: Egreso hacia cliente exitoso
- **WHEN** el usuario registra un movimiento tipo EGRESO con procedencia_ubicacion, destino_cliente y detalles con cantidades válidas
- **THEN** se persiste el movimiento, se decrementan los stocks de las variantes en la ubicación origen

#### Scenario: Egreso con stock insuficiente
- **WHEN** la cantidad solicitada en una variante supera el stock disponible en la ubicación origen
- **THEN** el sistema retorna error de validación indicando stock insuficiente para esa variante

#### Scenario: Transferencia entre ubicaciones
- **WHEN** el usuario registra un movimiento tipo TRANSFERENCIA con procedencia_ubicacion y destino_ubicacion distintos
- **THEN** se resta el stock en la ubicación origen y se suma en la ubicación destino, en una sola transacción

#### Scenario: Arreglo de stock
- **WHEN** el usuario registra un movimiento tipo ARREGLO con una ubicación y detalles que incluyen cantidad_nueva por variante
- **THEN** el sistema guarda cantidad_anterior (stock previo), cantidad_nueva y actualiza stock_por_ubicacion al nuevo valor

#### Scenario: Movimiento tipo VENTA generado automáticamente
- **WHEN** se confirma una venta con artículos cargados
- **THEN** el sistema genera automáticamente un movimiento tipo VENTA con los detalles de la venta, vinculado a `venta_id`, con procedencia = ubicación principal del local y destino = cliente de la venta

#### Scenario: Movimiento tipo VENTA no creable manualmente
- **WHEN** el usuario intenta crear un movimiento con tipo VENTA via la API manual
- **THEN** el sistema retorna error de validación indicando que este tipo solo se genera automáticamente

#### Scenario: Movimiento sin detalles rechazado
- **WHEN** el usuario intenta registrar un movimiento sin líneas de detalle
- **THEN** el sistema retorna error de validación

#### Scenario: Procedencia y destino ambos ausentes
- **WHEN** el usuario envía un movimiento sin ningún campo de procedencia o destino seteado (excepto ARREGLO)
- **THEN** el sistema retorna error de validación

---

### Requirement: Crear variante desde movimiento
El sistema SHALL crear automáticamente una nueva `articulo_variante` cuando se registra un detalle de movimiento con una combinación talle+color inexistente para el artículo.

#### Scenario: Nueva combinación en ingreso
- **WHEN** el usuario ingresa cantidad para una combinación talle+color que no existe en articulo_variante
- **THEN** se crea la variante en la misma transacción del movimiento y se usa su id en el detalle

#### Scenario: Combinación ya existente
- **WHEN** la combinación talle+color ya existe en articulo_variante
- **THEN** se reutiliza la variante existente sin crear duplicados
