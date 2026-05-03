## ADDED Requirements

### Requirement: Catálogo de medios de pago con código rápido
El sistema SHALL mantener un catálogo de medios de pago donde cada medio tiene un código único de 2 a 4 caracteres alfanuméricos en mayúsculas. Cada fila del catálogo representa una variante operacional completa (marca + cuotas + procesador), no un método genérico. Los campos `tipo`, `cuotas`, `marca_tarjeta` y `procesador` son fijos para el medio; no se definen por separado en cada cobro.

#### Scenario: Crear medio de pago con código único
- **WHEN** el usuario envía nombre, código, tipo y cuotas válidos
- **THEN** el sistema crea el medio activo con id asignado y lo disponibiliza en el catálogo

#### Scenario: Código duplicado rechazado
- **WHEN** el usuario envía un código que ya existe en el catálogo (activo o inactivo)
- **THEN** el sistema retorna error "Código duplicado" y no crea el medio

#### Scenario: Código reservado tras desactivar
- **WHEN** un medio se desactiva
- **THEN** su código queda reservado en la tabla y no puede asignarse a otro medio distinto

#### Scenario: Código cambia al cambiar procesador
- **WHEN** el mismo medio cambia de procesador a futuro
- **THEN** se crea un nuevo medio con código nuevo; el medio anterior se desactiva; no se edita el código existente

---

### Requirement: Búsqueda de medio por código
El sistema SHALL exponer un endpoint que dado un código retorne el medio de pago activo correspondiente con todos sus campos (tipo, cuotas, marca_tarjeta, procesador).

#### Scenario: Código encontrado
- **WHEN** se consulta un código existente y activo
- **THEN** el sistema retorna el medio con nombre, tipo, cuotas, marca_tarjeta y procesador

#### Scenario: Código no encontrado o inactivo
- **WHEN** se consulta un código inexistente o de un medio desactivado
- **THEN** el sistema retorna error 404

---

### Requirement: Listado de medios activos ordenado para botones rápidos
El sistema SHALL retornar los medios activos ordenados por el campo `orden` para su presentación como grilla de botones en la pantalla de venta.

#### Scenario: Listado ordenado por campo orden
- **WHEN** se solicita el listado de medios activos
- **THEN** el sistema retorna únicamente los medios con `activo = 1`, ordenados ascendentemente por `orden`

#### Scenario: Medio desactivado no aparece en botones
- **WHEN** un medio se desactiva
- **THEN** no aparece en el listado de botones rápidos ni en el selector de cobros

---

### Requirement: Campos futuros para Cobranzas disponibles desde v1
El sistema SHALL crear los campos `arancel` y `plazo_dias` en `medio_pago` desde la primera versión, aunque estén en NULL. Estos campos serán completados cuando se implemente el módulo de Cobranzas.

#### Scenario: Campos futuros en NULL por defecto
- **WHEN** se crea un medio de pago sin enviar arancel ni plazo_dias
- **THEN** ambos campos quedan en NULL sin error

#### Scenario: Campos futuros aceptan valor cuando se envían
- **WHEN** se actualiza un medio enviando arancel y plazo_dias
- **THEN** el sistema los guarda correctamente para su uso futuro en Cobranzas
