## ADDED Requirements

### Requirement: Ver métricas de conversión por período
El sistema SHALL mostrar un dashboard con métricas de tráfico y conversión filtrables por período: hoy (tiempo real), semana actual y mes actual.

Las métricas SHALL incluir:
- Total de entradas (visitas registradas en el período)
- Total de compras (visitas con estado=COMPRA)
- Total de no-compras (visitas con estado=NO_COMPRA)
- Porcentaje de conversión (compras / entradas × 100)
- Total de visitas pendientes (solo para "hoy")

Para "hoy", los datos SHALL reflejarse en tiempo real (polling o invalidación automática cada N segundos).

#### Scenario: Vista de hoy con datos
- **WHEN** el usuario accede al dashboard en el período "Hoy"
- **THEN** se muestran las métricas del día actual actualizadas, incluyendo pendientes

#### Scenario: Cambio de período
- **WHEN** el usuario selecciona "Semana" o "Mes"
- **THEN** las métricas se recalculan para el período seleccionado y los pendientes no se muestran

#### Scenario: Sin datos en el período
- **WHEN** no hay visitas registradas en el período seleccionado
- **THEN** el dashboard muestra las métricas en cero sin error

---

### Requirement: Analizar razones de no compra
El sistema SHALL mostrar un desglose de las razones de no compra para el período seleccionado, con cantidad y porcentaje por razón. Al expandir una razón SHALL mostrar el desglose de sus sub-razones.

#### Scenario: Desglose por razón
- **WHEN** hay no-compras registradas con razones en el período
- **THEN** se listan las razones con cantidad y porcentaje sobre el total de no-compras, ordenadas por frecuencia descendente

#### Scenario: Drill-down a sub-razones
- **WHEN** el usuario expande una razón con sub-razones registradas
- **THEN** se muestran las sub-razones con cantidad y porcentaje sobre el total de esa razón

#### Scenario: Razón sin sub-razón registrada
- **WHEN** hay no-compras con razón pero sin sub-razón
- **THEN** se agrupan bajo "Sin sub-razón especificada" dentro de esa razón

---

### Requirement: Analizar conversión por tipo de visitante
El sistema SHALL mostrar una tabla cruzada con conversión por tipo de visitante para el período seleccionado: tipo, entradas, compras, no-compras, % conversión, razón de no-compra más frecuente.

#### Scenario: Tabla cruzada por tipo
- **WHEN** hay visitas de distintos tipos en el período
- **THEN** se muestra una fila por tipo de visitante con sus métricas de conversión

#### Scenario: Tipo sin visitas en el período
- **WHEN** un tipo de visitante no tiene visitas en el período seleccionado
- **THEN** no aparece en la tabla (no se muestran filas en cero)
