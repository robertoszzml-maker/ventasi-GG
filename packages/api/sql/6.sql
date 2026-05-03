-- =============================================================================
-- 6.SQL — Sistema de ventas, comprobantes, vendedores y métodos de pago
-- Ejecutar después de 5.sql
-- =============================================================================

-- =============================================================================
-- VENDEDOR
-- Perfil de vendedor independiente del usuario del sistema
-- =============================================================================
CREATE TABLE IF NOT EXISTS `vendedor` (
  `id`       INT          NOT NULL AUTO_INCREMENT,
  `nombre`   VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `dni`      VARCHAR(20)  NULL,
  `codigo`   VARCHAR(30)  NOT NULL,
  `activo`   TINYINT(1)   NOT NULL DEFAULT 1,

  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`)
);

CREATE UNIQUE INDEX `UQ_vendedor_codigo`    ON `vendedor`(`codigo`);
CREATE INDEX        `IDX_vendedor_activo`   ON `vendedor`(`activo`);
CREATE INDEX        `IDX_vendedor_deleted`  ON `vendedor`(`deleted_at`);

-- =============================================================================
-- METODO_PAGO
-- Métodos de pago configurables del sistema
-- =============================================================================
CREATE TABLE IF NOT EXISTS `metodo_pago` (
  `id`     INT          NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `tipo`   VARCHAR(30)  NOT NULL DEFAULT 'otro',
  `activo` TINYINT(1)   NOT NULL DEFAULT 1,

  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`)
);

CREATE UNIQUE INDEX `UQ_metodo_pago_nombre`  ON `metodo_pago`(`nombre`);
CREATE INDEX        `IDX_metodo_pago_activo` ON `metodo_pago`(`activo`);
CREATE INDEX        `IDX_metodo_pago_deleted`ON `metodo_pago`(`deleted_at`);

-- =============================================================================
-- CUOTA_METODO_PAGO
-- Producto cartesiano: método de pago × cuotas → tasa de interés
-- =============================================================================
CREATE TABLE IF NOT EXISTS `cuota_metodo_pago` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `metodo_pago_id`  INT          NOT NULL,
  `cantidad_cuotas` INT          NOT NULL,
  `tasa_interes`    VARCHAR(20)  NOT NULL DEFAULT '0.00',
  `activo`          TINYINT(1)   NOT NULL DEFAULT 1,

  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),

  CONSTRAINT `FK_cuota_metodo_pago_metodo` FOREIGN KEY (`metodo_pago_id`)
    REFERENCES `metodo_pago`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX `UQ_cuota_metodo_pago_metodo_cuotas` ON `cuota_metodo_pago`(`metodo_pago_id`, `cantidad_cuotas`);
CREATE INDEX        `IDX_cuota_metodo_pago_metodo_id`    ON `cuota_metodo_pago`(`metodo_pago_id`);
CREATE INDEX        `IDX_cuota_metodo_pago_activo`       ON `cuota_metodo_pago`(`activo`);
CREATE INDEX        `IDX_cuota_metodo_pago_deleted`      ON `cuota_metodo_pago`(`deleted_at`);

-- =============================================================================
-- VENTA
-- Cabecera de venta, siempre originada en una visita
-- =============================================================================
CREATE TABLE IF NOT EXISTS `venta` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `visita_id`       INT          NOT NULL,
  `cliente_id`      INT          NOT NULL,
  `vendedor_id`     INT          NOT NULL,
  `lista_precio_id` INT          NOT NULL,
  `tipo_comprobante`VARCHAR(10)  NOT NULL,
  `estado`          VARCHAR(20)  NOT NULL DEFAULT 'borrador',
  `fecha`           VARCHAR(100) NOT NULL,

  -- Totalizador (snapshots al momento de confirmar)
  `subtotal`             VARCHAR(20) NOT NULL DEFAULT '0.0000',
  `descuento_porcentaje` VARCHAR(20) NULL,
  `descuento_monto`      VARCHAR(20) NULL,
  `recargo_porcentaje`   VARCHAR(20) NULL,
  `recargo_monto`        VARCHAR(20) NULL,
  `base_imponible`       VARCHAR(20) NOT NULL DEFAULT '0.0000',
  `iva`                  VARCHAR(20) NOT NULL DEFAULT '0.0000',
  `total`                VARCHAR(20) NOT NULL DEFAULT '0.0000',

  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),

  CONSTRAINT `FK_venta_visita`       FOREIGN KEY (`visita_id`)       REFERENCES `visita`       (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_venta_cliente`      FOREIGN KEY (`cliente_id`)      REFERENCES `cliente`      (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_venta_vendedor`     FOREIGN KEY (`vendedor_id`)     REFERENCES `vendedor`     (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_venta_lista_precio` FOREIGN KEY (`lista_precio_id`) REFERENCES `lista_precio` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX `IDX_venta_visita_id`       ON `venta`(`visita_id`);
CREATE INDEX `IDX_venta_cliente_id`      ON `venta`(`cliente_id`);
CREATE INDEX `IDX_venta_vendedor_id`     ON `venta`(`vendedor_id`);
CREATE INDEX `IDX_venta_estado`          ON `venta`(`estado`);
CREATE INDEX `IDX_venta_fecha`           ON `venta`(`fecha`);
CREATE INDEX `IDX_venta_deleted`         ON `venta`(`deleted_at`);

-- =============================================================================
-- VENTA_DETALLE
-- Líneas de artículos de la venta (una por variante)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `venta_detalle` (
  `id`                   INT          NOT NULL AUTO_INCREMENT,
  `venta_id`             INT          NOT NULL,
  `articulo_variante_id` INT          NOT NULL,
  `cantidad`             VARCHAR(20)  NOT NULL DEFAULT '0',
  `precio_unitario`      VARCHAR(20)  NOT NULL DEFAULT '0.0000',
  `descuento_porcentaje` VARCHAR(20)  NULL,
  `descuento_monto`      VARCHAR(20)  NULL,
  `subtotal_linea`       VARCHAR(20)  NOT NULL DEFAULT '0.0000',

  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),

  CONSTRAINT `FK_venta_detalle_venta`    FOREIGN KEY (`venta_id`)             REFERENCES `venta`            (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_venta_detalle_variante` FOREIGN KEY (`articulo_variante_id`) REFERENCES `articulo_variante`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX `IDX_venta_detalle_venta_id`    ON `venta_detalle`(`venta_id`);
CREATE INDEX `IDX_venta_detalle_variante_id` ON `venta_detalle`(`articulo_variante_id`);
CREATE INDEX `IDX_venta_detalle_deleted`     ON `venta_detalle`(`deleted_at`);

-- =============================================================================
-- VENTA_FORMA_PAGO
-- Formas de pago aplicadas a la venta
-- =============================================================================
CREATE TABLE IF NOT EXISTS `venta_forma_pago` (
  `id`                    INT          NOT NULL AUTO_INCREMENT,
  `venta_id`              INT          NOT NULL,
  `metodo_pago_id`        INT          NOT NULL,
  `cuota_metodo_pago_id`  INT          NULL,
  `cantidad_cuotas`       INT          NOT NULL DEFAULT 1,
  `tasa_interes`          VARCHAR(20)  NOT NULL DEFAULT '0.00',
  `monto_base`            VARCHAR(20)  NOT NULL DEFAULT '0.0000',
  `monto_con_interes`     VARCHAR(20)  NOT NULL DEFAULT '0.0000',

  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),

  CONSTRAINT `FK_venta_forma_pago_venta`   FOREIGN KEY (`venta_id`)             REFERENCES `venta`            (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_venta_forma_pago_metodo`  FOREIGN KEY (`metodo_pago_id`)       REFERENCES `metodo_pago`      (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_venta_forma_pago_cuota`   FOREIGN KEY (`cuota_metodo_pago_id`) REFERENCES `cuota_metodo_pago`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX `IDX_venta_forma_pago_venta_id`  ON `venta_forma_pago`(`venta_id`);
CREATE INDEX `IDX_venta_forma_pago_metodo_id` ON `venta_forma_pago`(`metodo_pago_id`);
CREATE INDEX `IDX_venta_forma_pago_deleted`   ON `venta_forma_pago`(`deleted_at`);

-- =============================================================================
-- COMPROBANTE
-- Comprobante fiscal (con CAE) o manual, vinculado a una venta
-- =============================================================================
CREATE TABLE IF NOT EXISTS `comprobante` (
  `id`               INT          NOT NULL AUTO_INCREMENT,
  `venta_id`         INT          NOT NULL,
  `tipo`             VARCHAR(10)  NOT NULL,
  `tipo_comprobante` VARCHAR(10)  NOT NULL,
  `punto_venta`      VARCHAR(10)  NOT NULL DEFAULT '0001',
  `numero`           INT          NULL,
  `fecha_emision`    VARCHAR(100) NULL,
  `cae`              VARCHAR(50)  NULL,
  `cae_vencimiento`  VARCHAR(100) NULL,
  `estado`           VARCHAR(20)  NOT NULL DEFAULT 'pendiente',
  `formato_default`  VARCHAR(10)  NOT NULL DEFAULT 'a4',
  `datos_arca`       TEXT         NULL,

  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),

  CONSTRAINT `FK_comprobante_venta` FOREIGN KEY (`venta_id`) REFERENCES `venta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX `IDX_comprobante_venta_id`  ON `comprobante`(`venta_id`);
CREATE INDEX `IDX_comprobante_estado`    ON `comprobante`(`estado`);
CREATE INDEX `IDX_comprobante_tipo`      ON `comprobante`(`tipo`);
CREATE INDEX `IDX_comprobante_deleted`   ON `comprobante`(`deleted_at`);

-- =============================================================================
-- MODIFICAR cliente — agregar campos fiscales
-- =============================================================================
ALTER TABLE `cliente`
  ADD COLUMN `cuit`          VARCHAR(20)  NULL AFTER `telefono`,
  ADD COLUMN `condicion_iva` VARCHAR(20)  NULL AFTER `cuit`,
  ADD COLUMN `domicilio`     VARCHAR(255) NULL AFTER `condicion_iva`,
  ADD COLUMN `localidad`     VARCHAR(100) NULL AFTER `domicilio`,
  ADD COLUMN `provincia`     VARCHAR(100) NULL AFTER `localidad`,
  ADD COLUMN `codigo_postal` VARCHAR(10)  NULL AFTER `provincia`;

CREATE UNIQUE INDEX `UQ_cliente_cuit` ON `cliente`(`cuit`);

-- =============================================================================
-- MODIFICAR articulo — agregar alicuota_iva
-- =============================================================================
ALTER TABLE `articulo`
  ADD COLUMN `alicuota_iva` VARCHAR(10) NOT NULL DEFAULT '21' AFTER `costo`;

-- =============================================================================
-- MODIFICAR visita — agregar venta_id
-- =============================================================================
ALTER TABLE `visita`
  ADD COLUMN `venta_id` INT NULL AFTER `movimiento_id`;

ALTER TABLE `visita`
  ADD CONSTRAINT `FK_visita_venta` FOREIGN KEY (`venta_id`) REFERENCES `venta`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX `IDX_visita_venta_id` ON `visita`(`venta_id`);

-- =============================================================================
-- SEED — Cliente "Consumidor Final"
-- =============================================================================
INSERT IGNORE INTO `cliente` (`id`, `nombre`, `cuit`, `condicion_iva`) VALUES
(1, 'Consumidor Final', '00000000000', 'CF');

-- =============================================================================
-- SEED — Config claves de ventas/arca
-- =============================================================================
INSERT IGNORE INTO `config` (`clave`, `valor`, `modulo`, `descripcion`) VALUES
('ARCA_PUNTO_VENTA',        '0001',    'ventas', 'Número de punto de venta habilitado en ARCA'),
('ARCA_RAZON_SOCIAL',       '',        'ventas', 'Razón social del emisor para comprobantes'),
('IMPRESION_FORMATO_DEFAULT','a4',     'ventas', 'Formato de impresión por defecto: a4 o termica');

-- =============================================================================
-- PERMISOS — Vendedor
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('VENDEDOR_VER',      'Ver vendedores',           'vendedores'),
('VENDEDOR_CREAR',    'Crear vendedores',          'vendedores'),
('VENDEDOR_EDITAR',   'Editar vendedores',         'vendedores'),
('VENDEDOR_ELIMINAR', 'Eliminar/desactivar vendedores', 'vendedores'),
('RUTA_VENDEDORES',   'Acceso a página de vendedores', 'rutas');

-- =============================================================================
-- PERMISOS — Método de pago
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('METODO_PAGO_VER',      'Ver métodos de pago',              'metodos-pago'),
('METODO_PAGO_CREAR',    'Crear métodos de pago',            'metodos-pago'),
('METODO_PAGO_EDITAR',   'Editar métodos de pago y cuotas',  'metodos-pago'),
('METODO_PAGO_ELIMINAR', 'Eliminar/desactivar métodos de pago', 'metodos-pago'),
('RUTA_METODOS_PAGO',    'Acceso a página de métodos de pago',  'rutas');

-- =============================================================================
-- PERMISOS — Venta
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('VENTA_VER',      'Ver ventas',          'ventas'),
('VENTA_CREAR',    'Crear ventas',        'ventas'),
('VENTA_EDITAR',   'Editar ventas en borrador', 'ventas'),
('VENTA_CONFIRMAR','Confirmar ventas',    'ventas'),
('VENTA_ANULAR',   'Anular ventas',       'ventas'),
('RUTA_VENTAS',    'Acceso a página de ventas', 'rutas');

-- =============================================================================
-- PERMISOS — Comprobante
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('COMPROBANTE_VER',           'Ver comprobantes',                   'comprobantes'),
('COMPROBANTE_EMITIR_FISCAL', 'Emitir comprobante fiscal via ARCA', 'comprobantes'),
('COMPROBANTE_EMITIR_MANUAL', 'Emitir comprobante manual',          'comprobantes'),
('COMPROBANTE_IMPRIMIR',      'Imprimir comprobantes',              'comprobantes'),
('COMPROBANTE_ANULAR',        'Anular comprobantes',                'comprobantes');

-- =============================================================================
-- PERMISOS — Configuración ARCA
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('ARCA_CONFIG_VER',   'Ver configuración de ARCA',    'arca'),
('ARCA_CONFIG_EDITAR','Editar configuración de ARCA', 'arca');

-- =============================================================================
-- 7.SQL — Columnas faltantes del sistema de ventas
-- Ejecutar después de 6.sql
-- =============================================================================

-- visita_id en venta pasa a ser nullable (venta puede existir sin visita)
ALTER TABLE `venta`
  MODIFY COLUMN `visita_id` INT NULL;

-- venta_id faltaba en movimiento_inventario (el servicio lo requiere al confirmar)
ALTER TABLE `movimiento_inventario`
  ADD COLUMN `venta_id` INT NULL AFTER `visita_id`;

ALTER TABLE `movimiento_inventario`
  ADD INDEX `idx_mi_venta_id` (`venta_id`);

ALTER TABLE `movimiento_inventario`
  ADD CONSTRAINT `fk_mi_venta`
    FOREIGN KEY (`venta_id`) REFERENCES `venta` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
