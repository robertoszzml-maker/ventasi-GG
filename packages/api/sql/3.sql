-- =============================================================================
-- 3.SQL — Sistema de visitas y conversión del local
-- Ejecutar después de 2.sql
-- =============================================================================

-- =============================================================================
-- CARACTERISTICA_VISITANTE
-- Características físicas configurables por el usuario (alto, gordo, morocho, etc.)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `caracteristica_visitante` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `nombre`     VARCHAR(255) NOT NULL,
  `icono`      VARCHAR(100) NOT NULL,
  `orden`      INT          NOT NULL DEFAULT 0,
  `activo`     TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6)  NULL,
  `created_by` INT          NULL,
  `updated_by` INT          NULL,
  `deleted_by` INT          NULL,

  PRIMARY KEY (`id`),
  INDEX `idx_cv_activo`     (`activo`),
  INDEX `idx_cv_deleted_at` (`deleted_at`)
);

-- =============================================================================
-- RAZON_NO_COMPRA
-- Razones principales configurables de por qué no se concretó una venta
-- =============================================================================
CREATE TABLE IF NOT EXISTS `razon_no_compra` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `nombre`     VARCHAR(255) NOT NULL,
  `orden`      INT          NOT NULL DEFAULT 0,
  `activo`     TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6)  NULL,
  `created_by` INT          NULL,
  `updated_by` INT          NULL,
  `deleted_by` INT          NULL,

  PRIMARY KEY (`id`),
  INDEX `idx_rnc_activo`     (`activo`),
  INDEX `idx_rnc_deleted_at` (`deleted_at`)
);

-- =============================================================================
-- SUB_RAZON_NO_COMPRA
-- Sub-categorías de cada razón de no compra
-- =============================================================================
CREATE TABLE IF NOT EXISTS `sub_razon_no_compra` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `razon_id`   INT          NOT NULL,
  `nombre`     VARCHAR(255) NOT NULL,
  `orden`      INT          NOT NULL DEFAULT 0,
  `activo`     TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6)  NULL,
  `created_by` INT          NULL,
  `updated_by` INT          NULL,
  `deleted_by` INT          NULL,

  PRIMARY KEY (`id`),
  INDEX `idx_srnc_razon_id`   (`razon_id`),
  INDEX `idx_srnc_activo`     (`activo`),
  INDEX `idx_srnc_deleted_at` (`deleted_at`),

  CONSTRAINT `fk_srnc_razon` FOREIGN KEY (`razon_id`) REFERENCES `razon_no_compra` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- VISITA
-- Registro de cada persona/grupo que entra al local
-- Estado: PENDIENTE → COMPRA | NO_COMPRA
-- =============================================================================
CREATE TABLE IF NOT EXISTS `visita` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `fecha`           VARCHAR(100) NOT NULL,
  `hora`            VARCHAR(8)   NOT NULL,
  `tipo_visitante`  VARCHAR(20)  NOT NULL COMMENT 'MUJER|HOMBRE|ADULTO_MAYOR|JOVEN|PAREJA|FAMILIA|GRUPO',
  `estado`          VARCHAR(15)  NOT NULL DEFAULT 'PENDIENTE' COMMENT 'PENDIENTE|COMPRA|NO_COMPRA',
  `movimiento_id`   INT          NULL,
  `razon_id`        INT          NULL,
  `sub_razon_id`    INT          NULL,
  `articulo_id`     INT          NULL,
  `cliente_id`      INT          NULL,
  `observaciones`   TEXT         NULL,
  `usuario_id`      INT          NOT NULL,
  `created_at`      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`      DATETIME(6)  NULL,
  `created_by`      INT          NULL,
  `updated_by`      INT          NULL,
  `deleted_by`      INT          NULL,

  PRIMARY KEY (`id`),
  INDEX `idx_visita_fecha`          (`fecha`),
  INDEX `idx_visita_estado`         (`estado`),
  INDEX `idx_visita_tipo_visitante` (`tipo_visitante`),
  INDEX `idx_visita_usuario_id`     (`usuario_id`),
  INDEX `idx_visita_deleted_at`     (`deleted_at`),

  CONSTRAINT `fk_visita_movimiento`  FOREIGN KEY (`movimiento_id`) REFERENCES `movimiento_inventario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_visita_razon`       FOREIGN KEY (`razon_id`)      REFERENCES `razon_no_compra`        (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_visita_sub_razon`   FOREIGN KEY (`sub_razon_id`)  REFERENCES `sub_razon_no_compra`    (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_visita_articulo`    FOREIGN KEY (`articulo_id`)   REFERENCES `articulo`               (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_visita_cliente`     FOREIGN KEY (`cliente_id`)    REFERENCES `cliente`                (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_visita_usuario`     FOREIGN KEY (`usuario_id`)    REFERENCES `usuario`                (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =============================================================================
-- VISITA_CARACTERISTICA
-- Relación M:N entre visita y características del visitante
-- =============================================================================
CREATE TABLE IF NOT EXISTS `visita_caracteristica` (
  `visita_id`          INT NOT NULL,
  `caracteristica_id`  INT NOT NULL,

  PRIMARY KEY (`visita_id`, `caracteristica_id`),
  INDEX `idx_vc_caracteristica_id` (`caracteristica_id`),

  CONSTRAINT `fk_vc_visita`          FOREIGN KEY (`visita_id`)         REFERENCES `visita`                  (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_vc_caracteristica`  FOREIGN KEY (`caracteristica_id`) REFERENCES `caracteristica_visitante` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- MOVIMIENTO_INVENTARIO — agregar visita_id
-- Solo ejecutar si la columna no existe (MySQL no soporta IF NOT EXISTS en ALTER)
-- =============================================================================
ALTER TABLE `movimiento_inventario`
  ADD COLUMN `visita_id` INT NULL AFTER `descripcion`;

ALTER TABLE `movimiento_inventario`
  ADD INDEX `idx_mi_visita_id` (`visita_id`);

ALTER TABLE `movimiento_inventario`
  ADD CONSTRAINT `fk_mi_visita`
    FOREIGN KEY (`visita_id`) REFERENCES `visita` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================================================
-- PERMISOS — Sistema de visitas
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES

-- Visitas (operativa)
('VISITA_VER',    'Ver registro de visitas',   'visitas'),
('VISITA_CREAR',  'Registrar entrada al local', 'visitas'),
('VISITA_EDITAR', 'Resolver resultado de visita', 'visitas'),

-- Dashboard conversión
('DASHBOARD_CONVERSION_VER', 'Ver dashboard de conversión', 'visitas'),

-- Configuración de visitas
('CARACTERISTICA_VISITANTE_VER',      'Ver características de visitante',    'configuracion'),
('CARACTERISTICA_VISITANTE_CREAR',    'Crear característica de visitante',   'configuracion'),
('CARACTERISTICA_VISITANTE_EDITAR',   'Editar característica de visitante',  'configuracion'),
('CARACTERISTICA_VISITANTE_ELIMINAR', 'Eliminar característica de visitante','configuracion'),

('RAZON_NO_COMPRA_VER',      'Ver razones de no compra',    'configuracion'),
('RAZON_NO_COMPRA_CREAR',    'Crear razón de no compra',    'configuracion'),
('RAZON_NO_COMPRA_EDITAR',   'Editar razón de no compra',   'configuracion'),
('RAZON_NO_COMPRA_ELIMINAR', 'Eliminar razón de no compra', 'configuracion'),

-- Rutas del menú
('RUTA_REGISTRO_VISITAS',             'Acceso a registro de visitas',            'rutas'),
('RUTA_DASHBOARD_CONVERSION',         'Acceso a dashboard de conversión',        'rutas'),
('RUTA_CONFIG_CARACTERISTICAS',       'Acceso a config características visitante','rutas'),
('RUTA_CONFIG_RAZONES_NO_COMPRA',     'Acceso a config razones de no compra',    'rutas');

-- =============================================================================
-- SEED — Razones de no compra iniciales
-- =============================================================================
INSERT IGNORE INTO `razon_no_compra` (`id`, `nombre`, `orden`, `activo`) VALUES
(1, 'Falta de stock',    1, 1),
(2, 'Precio',            2, 1),
(3, 'Forma de pago',     3, 1),
(4, 'Solo miró',         4, 1);

INSERT IGNORE INTO `sub_razon_no_compra` (`razon_id`, `nombre`, `orden`, `activo`) VALUES
-- Falta de stock
(1, 'Sin talle',                   1, 1),
(1, 'Sin color',                   2, 1),
(1, 'Artículo no disponible',      3, 1),
-- Precio
(2, 'Precio alto de un artículo',  1, 1),
(2, 'Otro',                        2, 1),
-- Forma de pago
(3, 'Sin cuotas',                  1, 1),
(3, 'Otro',                        2, 1),
-- Solo miró
(4, 'Pasó y salió',                1, 1),
(4, 'Miró sin preguntar',          2, 1);
