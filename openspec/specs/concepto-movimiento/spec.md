### Requirement: ABM de conceptos de movimiento
El sistema SHALL permitir al administrador crear, editar y desactivar conceptos de movimiento de caja. Cada concepto MUST tener un nombre, un tipo por defecto (INGRESO o EGRESO) y un indicador de activo. El sistema MUST proveer conceptos predeterminados en el seed inicial: Retiro (EGRESO), Caja Chica (EGRESO), Ajuste (INGRESO/EGRESO), Otro (INGRESO/EGRESO).

#### Scenario: Creación de concepto personalizado
- **WHEN** el administrador crea un concepto con nombre 'Pago de servicio' y tipo EGRESO
- **THEN** el concepto queda disponible en el selector de movimientos manuales de caja

#### Scenario: Desactivación de concepto
- **WHEN** el administrador desactiva un concepto existente
- **THEN** el concepto no aparece en el selector de nuevos movimientos pero los movimientos históricos que lo referencian permanecen intactos

#### Scenario: Concepto predeterminado no eliminable
- **WHEN** el administrador intenta eliminar un concepto marcado como predeterminado del sistema
- **THEN** el sistema rechaza la operación indicando que los conceptos del sistema no se pueden eliminar

---

### Requirement: Listado de conceptos activos para movimientos
El sistema SHALL exponer un endpoint que devuelva solo los conceptos activos, ordenados alfabéticamente, para usar en el selector al registrar un movimiento manual.

#### Scenario: Solo conceptos activos en el selector
- **WHEN** el operador abre el formulario de nuevo movimiento manual
- **THEN** el selector muestra únicamente conceptos con `activo = true`
