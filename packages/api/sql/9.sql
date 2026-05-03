-- =============================================================================
-- 9.SQL — Modelo de cobros: reemplaza metodo_pago + venta_forma_pago
-- Ejecutar después de 8.sql
-- =============================================================================

-- =============================================================================
-- DROP tablas del modelo anterior (Opción C — reemplazo limpio)
-- Orden: primero la hoja, luego las raíces
-- =============================================================================
DROP TABLE IF EXISTS `venta_forma_pago`;
DROP TABLE IF EXISTS `cuota_metodo_pago`;
DROP TABLE IF EXISTS `metodo_pago`;

-- =============================================================================
-- MEDIO_PAGO
-- Catálogo de medios con código rápido por variante operacional
-- =============================================================================
CREATE TABLE IF NOT EXISTS `medio_pago` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `codigo`        VARCHAR(4)   NOT NULL,
  `nombre`        VARCHAR(100) NOT NULL,
  `tipo`          VARCHAR(30)  NOT NULL,
  `cuotas`        INT          NOT NULL DEFAULT 1,
  `marca_tarjeta` VARCHAR(20)  NULL,
  `procesador`    VARCHAR(20)  NULL,
  `orden`         INT          NOT NULL DEFAULT 0,
  `activo`        TINYINT(1)   NOT NULL DEFAULT 1,
  `arancel`       VARCHAR(20)  NULL,
  `plazo_dias`    INT          NULL,

  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),
  CONSTRAINT `UQ_medio_pago_codigo` UNIQUE (`codigo`)
);

CREATE INDEX `IDX_medio_pago_activo`  ON `medio_pago`(`activo`);
CREATE INDEX `IDX_medio_pago_deleted` ON `medio_pago`(`deleted_at`);
CREATE INDEX `IDX_medio_pago_orden`   ON `medio_pago`(`orden`);

-- =============================================================================
-- COBRO
-- Registro transaccional de pago. Una venta tiene N cobros.
-- Campos de tipo/marca/cuotas/procesador se copian del medio al registrar.
-- =============================================================================
CREATE TABLE IF NOT EXISTS `cobro` (
  `id`                   INT          NOT NULL AUTO_INCREMENT,
  `venta_id`             INT          NOT NULL,
  `medio_pago_id`        INT          NOT NULL,
  `tipo`                 VARCHAR(30)  NOT NULL,
  `cuotas`               INT          NOT NULL DEFAULT 1,
  `marca_tarjeta`        VARCHAR(20)  NULL,
  `procesador`           VARCHAR(20)  NULL,
  `monto`                VARCHAR(20)  NOT NULL DEFAULT '0.0000',
  `codigo_autorizacion`  VARCHAR(50)  NULL,
  `ultimos_4`            VARCHAR(4)   NULL,
  `timestamp`            VARCHAR(100) NOT NULL,
  `estado`               VARCHAR(30)  NOT NULL DEFAULT 'PENDIENTE',

  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),

  CONSTRAINT `FK_cobro_venta`      FOREIGN KEY (`venta_id`)      REFERENCES `venta`(`id`)      ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_cobro_medio_pago` FOREIGN KEY (`medio_pago_id`) REFERENCES `medio_pago`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX `IDX_cobro_venta_id`  ON `cobro`(`venta_id`);
CREATE INDEX `IDX_cobro_medio`     ON `cobro`(`medio_pago_id`);
CREATE INDEX `IDX_cobro_estado`    ON `cobro`(`estado`);
CREATE INDEX `IDX_cobro_deleted`   ON `cobro`(`deleted_at`);

-- =============================================================================
-- VENTA — Agregar usuario_id y vuelto
-- sesion_caja_id y terminal_id ya existen desde 8.sql
-- =============================================================================
ALTER TABLE `venta`
  ADD COLUMN `usuario_id` INT         NOT NULL DEFAULT 1 AFTER `vendedor_id`,
  ADD COLUMN `vuelto`     VARCHAR(20) NOT NULL DEFAULT '0.0000' AFTER `total`;

ALTER TABLE `venta`
  ADD CONSTRAINT `FK_venta_usuario`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX `IDX_venta_usuario_id` ON `venta`(`usuario_id`);

-- =============================================================================
-- PERMISOS — Medio de pago y Cobro
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('MEDIO_PAGO_VER',      'Ver medios de pago',      'ventas'),
('MEDIO_PAGO_CREAR',    'Crear medios de pago',    'ventas'),
('MEDIO_PAGO_EDITAR',   'Editar medios de pago',   'ventas'),
('MEDIO_PAGO_ELIMINAR', 'Eliminar medios de pago', 'ventas'),
('COBRO_VER',           'Ver cobros de ventas',    'ventas'),
('COBRO_CREAR',         'Registrar cobros',        'ventas');

-- =============================================================================
-- SEED — 15 medios de pago iniciales
-- =============================================================================
INSERT INTO `medio_pago` (`codigo`, `nombre`, `tipo`, `cuotas`, `marca_tarjeta`, `procesador`, `orden`) VALUES
('EF',  'Efectivo',                  'EFECTIVO',      1,  NULL,         NULL,     1),
('V1',  'Visa crédito 1 pago',       'CREDITO',       1,  'VISA',       'CLOVER', 2),
('V3',  'Visa crédito 3 cuotas',     'CREDITO',       3,  'VISA',       'CLOVER', 3),
('V6',  'Visa crédito 6 cuotas',     'CREDITO',       6,  'VISA',       'CLOVER', 4),
('V12', 'Visa Ahora 12',             'CREDITO',       12, 'VISA',       'CLOVER', 5),
('VD',  'Visa débito',               'DEBITO',        1,  'VISA',       'CLOVER', 6),
('M1',  'Mastercard crédito 1 pago', 'CREDITO',       1,  'MASTERCARD', 'CLOVER', 7),
('M3',  'Mastercard crédito 3 cuotas','CREDITO',      3,  'MASTERCARD', 'CLOVER', 8),
('M6',  'Mastercard crédito 6 cuotas','CREDITO',      6,  'MASTERCARD', 'CLOVER', 9),
('MD',  'Mastercard débito',         'DEBITO',        1,  'MASTERCARD', 'CLOVER', 10),
('A1',  'Amex crédito 1 pago',       'CREDITO',       1,  'AMEX',       'CLOVER', 11),
('N3',  'Naranja 3 cuotas',          'CREDITO',       3,  'NARANJA',    'CLOVER', 12),
('MPQ', 'MercadoPago QR',            'QR',            1,  NULL,         'MP',     13),
('MPP', 'MercadoPago Point débito',  'DEBITO',        1,  NULL,         'MP',     14),
('TR',  'Transferencia bancaria',    'TRANSFERENCIA', 1,  NULL,         NULL,     15);
