-- =============================================================================
-- 8.SQL — Módulo de Cajas: sesiones, movimientos, arqueos, NC/ND
-- Ejecutar después de 7.sql
-- =============================================================================

-- =============================================================================
-- CAJA
-- Punto de cobro del local (singleton por instalación)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `caja` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `nombre`      VARCHAR(100) NOT NULL,
  `descripcion` VARCHAR(255) NULL,
  `activo`      TINYINT(1)   NOT NULL DEFAULT 1,

  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`)
);

CREATE INDEX `IDX_caja_activo`  ON `caja`(`activo`);
CREATE INDEX `IDX_caja_deleted` ON `caja`(`deleted_at`);

INSERT INTO `caja` (`nombre`) VALUES ('Caja Principal');

-- =============================================================================
-- CONCEPTO_MOVIMIENTO
-- Catálogo configurable de conceptos para movimientos manuales
-- =============================================================================
CREATE TABLE IF NOT EXISTS `concepto_movimiento` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `nombre`     VARCHAR(100) NOT NULL,
  `tipo`       VARCHAR(10)  NOT NULL DEFAULT 'egreso',
  `es_sistema` TINYINT(1)   NOT NULL DEFAULT 0,
  `activo`     TINYINT(1)   NOT NULL DEFAULT 1,

  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`)
);

CREATE UNIQUE INDEX `UQ_concepto_movimiento_nombre` ON `concepto_movimiento`(`nombre`);
CREATE INDEX `IDX_concepto_movimiento_activo`  ON `concepto_movimiento`(`activo`);
CREATE INDEX `IDX_concepto_movimiento_deleted` ON `concepto_movimiento`(`deleted_at`);

INSERT INTO `concepto_movimiento` (`nombre`, `tipo`, `es_sistema`) VALUES
('Retiro',     'egreso',  1),
('Caja Chica', 'egreso',  1),
('Depósito',   'ingreso', 1),
('Ajuste',     'egreso',  1),
('Otro',       'egreso',  1);

-- =============================================================================
-- SESION_CAJA
-- Turno de caja: desde la apertura hasta el cierre
-- =============================================================================
CREATE TABLE IF NOT EXISTS `sesion_caja` (
  `id`                       INT          NOT NULL AUTO_INCREMENT,
  `caja_id`                  INT          NOT NULL,
  `usuario_id`               INT          NOT NULL,
  `estado`                   VARCHAR(20)  NOT NULL DEFAULT 'abierta',
  `fecha_apertura`           VARCHAR(100) NOT NULL,
  `fecha_cierre`             VARCHAR(100) NULL,
  `saldo_inicial_sugerido`   VARCHAR(20)  NOT NULL DEFAULT '0.0000',
  `saldo_inicial_confirmado` VARCHAR(20)  NOT NULL DEFAULT '0.0000',
  `sesion_anterior_id`       INT          NULL,
  `observaciones`            VARCHAR(500) NULL,

  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),

  CONSTRAINT `FK_sesion_caja_caja`     FOREIGN KEY (`caja_id`)    REFERENCES `caja`(`id`)  ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_sesion_caja_usuario`  FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_sesion_caja_anterior` FOREIGN KEY (`sesion_anterior_id`) REFERENCES `sesion_caja`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX `IDX_sesion_caja_caja`    ON `sesion_caja`(`caja_id`);
CREATE INDEX `IDX_sesion_caja_usuario` ON `sesion_caja`(`usuario_id`);
CREATE INDEX `IDX_sesion_caja_estado`  ON `sesion_caja`(`estado`);
CREATE INDEX `IDX_sesion_caja_deleted` ON `sesion_caja`(`deleted_at`);

-- =============================================================================
-- MOVIMIENTO_CAJA
-- Cada ingreso o egreso de una sesión (automático o manual)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `movimiento_caja` (
  `id`                     INT          NOT NULL AUTO_INCREMENT,
  `sesion_caja_id`         INT          NOT NULL,
  `tipo`                   VARCHAR(10)  NOT NULL,
  `concepto_movimiento_id` INT          NULL,
  `medio_pago_id`          INT          NULL,
  `monto`                  VARCHAR(20)  NOT NULL DEFAULT '0.0000',
  `descripcion`            VARCHAR(500) NULL,
  `referencia_tipo`        VARCHAR(50)  NULL,
  `referencia_id`          INT          NULL,

  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),

  CONSTRAINT `FK_movimiento_caja_sesion`   FOREIGN KEY (`sesion_caja_id`) REFERENCES `sesion_caja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_movimiento_caja_concepto` FOREIGN KEY (`concepto_movimiento_id`) REFERENCES `concepto_movimiento`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX `IDX_movimiento_caja_sesion`  ON `movimiento_caja`(`sesion_caja_id`);
CREATE INDEX `IDX_movimiento_caja_tipo`    ON `movimiento_caja`(`tipo`);
CREATE INDEX `IDX_movimiento_caja_medio`   ON `movimiento_caja`(`medio_pago_id`);
CREATE INDEX `IDX_movimiento_caja_ref`     ON `movimiento_caja`(`referencia_tipo`, `referencia_id`);
CREATE INDEX `IDX_movimiento_caja_deleted` ON `movimiento_caja`(`deleted_at`);

-- =============================================================================
-- ARQUEO_CAJA
-- Reconciliación de una sesión por medio de pago
-- =============================================================================
CREATE TABLE IF NOT EXISTS `arqueo_caja` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `sesion_caja_id`  INT          NOT NULL,
  `usuario_id`      INT          NOT NULL,
  `tipo`            VARCHAR(20)  NOT NULL DEFAULT 'parcial',
  `fecha`           VARCHAR(100) NOT NULL,
  `diferencia_total` VARCHAR(20) NOT NULL DEFAULT '0.0000',
  `observaciones`   VARCHAR(500) NULL,

  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),

  CONSTRAINT `FK_arqueo_caja_sesion`  FOREIGN KEY (`sesion_caja_id`) REFERENCES `sesion_caja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_arqueo_caja_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX `IDX_arqueo_caja_sesion`  ON `arqueo_caja`(`sesion_caja_id`);
CREATE INDEX `IDX_arqueo_caja_tipo`    ON `arqueo_caja`(`tipo`);
CREATE INDEX `IDX_arqueo_caja_deleted` ON `arqueo_caja`(`deleted_at`);

-- =============================================================================
-- ARQUEO_CAJA_DETALLE
-- Detalle por medio de pago de un arqueo
-- =============================================================================
CREATE TABLE IF NOT EXISTS `arqueo_caja_detalle` (
  `id`              INT         NOT NULL AUTO_INCREMENT,
  `arqueo_caja_id`  INT         NOT NULL,
  `medio_pago_id`   INT         NOT NULL,
  `monto_sistema`   VARCHAR(20) NOT NULL DEFAULT '0.0000',
  `monto_declarado` VARCHAR(20) NOT NULL DEFAULT '0.0000',
  `diferencia`      VARCHAR(20) NOT NULL DEFAULT '0.0000',

  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),

  CONSTRAINT `FK_arqueo_caja_detalle_arqueo` FOREIGN KEY (`arqueo_caja_id`) REFERENCES `arqueo_caja`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX `IDX_arqueo_caja_detalle_arqueo` ON `arqueo_caja_detalle`(`arqueo_caja_id`);
CREATE INDEX `IDX_arqueo_caja_detalle_medio`  ON `arqueo_caja_detalle`(`medio_pago_id`);

-- =============================================================================
-- VENTA — Columnas para módulo de cajas y NC/ND
-- =============================================================================
ALTER TABLE `venta`
  ADD COLUMN `tipo_operacion`  VARCHAR(20) NOT NULL DEFAULT 'venta' AFTER `estado`,
  ADD COLUMN `venta_origen_id` INT         NULL     AFTER `tipo_operacion`,
  ADD COLUMN `sesion_caja_id`  INT         NULL     AFTER `venta_origen_id`,
  ADD COLUMN `terminal_id`     INT         NULL     AFTER `sesion_caja_id`;

CREATE INDEX `IDX_venta_tipo_operacion` ON `venta`(`tipo_operacion`);
CREATE INDEX `IDX_venta_sesion_caja`    ON `venta`(`sesion_caja_id`);

ALTER TABLE `venta`
  ADD CONSTRAINT `FK_venta_sesion_caja`
    FOREIGN KEY (`sesion_caja_id`) REFERENCES `sesion_caja`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================================================
-- PERMISOS — Caja
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('CAJA_VER',    'Ver configuración de caja',    'cajas'),
('CAJA_EDITAR', 'Editar configuración de caja', 'cajas'),
('RUTA_CAJAS',  'Acceso a módulo de cajas',     'rutas');

-- =============================================================================
-- PERMISOS — Sesión de Caja
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('SESION_CAJA_VER',    'Ver sesiones de caja',  'cajas'),
('SESION_CAJA_ABRIR',  'Abrir sesión de caja',  'cajas'),
('SESION_CAJA_CERRAR', 'Cerrar sesión de caja', 'cajas');

-- =============================================================================
-- PERMISOS — Movimiento de Caja
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('MOVIMIENTO_CAJA_VER',   'Ver movimientos de caja',   'cajas'),
('MOVIMIENTO_CAJA_CREAR', 'Crear movimientos de caja', 'cajas');

-- =============================================================================
-- PERMISOS — Arqueo de Caja
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('ARQUEO_CAJA_VER',   'Ver arqueos de caja',  'cajas'),
('ARQUEO_CAJA_CREAR', 'Crear arqueo de caja', 'cajas');

-- =============================================================================
-- PERMISOS — Concepto de Movimiento
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('CONCEPTO_MOVIMIENTO_VER',      'Ver conceptos de movimiento',      'cajas'),
('CONCEPTO_MOVIMIENTO_CREAR',    'Crear conceptos de movimiento',    'cajas'),
('CONCEPTO_MOVIMIENTO_EDITAR',   'Editar conceptos de movimiento',   'cajas'),
('CONCEPTO_MOVIMIENTO_ELIMINAR', 'Eliminar conceptos de movimiento', 'cajas'),
('RUTA_CONFIG_CONCEPTOS',        'Acceso a configuración de conceptos', 'rutas');

-- =============================================================================
-- PERMISOS — Notas de Crédito y Débito
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('NOTA_CREDITO_VER',       'Ver notas de crédito',       'ventas'),
('NOTA_CREDITO_CREAR',     'Crear notas de crédito',     'ventas'),
('NOTA_CREDITO_CONFIRMAR', 'Confirmar notas de crédito', 'ventas'),
('NOTA_CREDITO_ANULAR',    'Anular notas de crédito',    'ventas'),
('RUTA_NOTAS_CREDITO',     'Acceso a notas de crédito',  'rutas'),
('NOTA_DEBITO_VER',        'Ver notas de débito',        'ventas'),
('NOTA_DEBITO_CREAR',      'Crear notas de débito',      'ventas'),
('NOTA_DEBITO_CONFIRMAR',  'Confirmar notas de débito',  'ventas'),
('NOTA_DEBITO_ANULAR',     'Anular notas de débito',     'ventas'),
('RUTA_NOTAS_DEBITO',      'Acceso a notas de débito',   'rutas');
