-- =============================================================================
-- 1.SQL — Sistema de stock: clasificación, colores, talles, artículos
-- Ejecutar después de init.sql
-- =============================================================================

-- =============================================================================
-- FAMILIA
-- =============================================================================
CREATE TABLE IF NOT EXISTS `familia` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `nombre`     VARCHAR(255) NOT NULL,
  `silueta`    VARCHAR(50)  NULL COMMENT 'Tipo de silueta SVG para visualización de colores',
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6)  NULL,
  `created_by` INT          NULL,
  `updated_by` INT          NULL,
  `deleted_by` INT          NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_familia_deleted_at` (`deleted_at`)
);

-- =============================================================================
-- GRUPO
-- =============================================================================
CREATE TABLE IF NOT EXISTS `grupo` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `familia_id` INT          NOT NULL,
  `nombre`     VARCHAR(255) NOT NULL,
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6)  NULL,
  `created_by` INT          NULL,
  `updated_by` INT          NULL,
  `deleted_by` INT          NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_grupo_familia_id` (`familia_id`),
  INDEX `idx_grupo_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_grupo_familia` FOREIGN KEY (`familia_id`) REFERENCES `familia` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- SUBGRUPO
-- =============================================================================
CREATE TABLE IF NOT EXISTS `subgrupo` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `grupo_id`   INT          NOT NULL,
  `nombre`     VARCHAR(255) NOT NULL,
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6)  NULL,
  `created_by` INT          NULL,
  `updated_by` INT          NULL,
  `deleted_by` INT          NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_subgrupo_grupo_id`   (`grupo_id`),
  INDEX `idx_subgrupo_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_subgrupo_grupo` FOREIGN KEY (`grupo_id`) REFERENCES `grupo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- COLOR
-- Concepto de color (puede ser sólido o trama/estampado).
-- =============================================================================
CREATE TABLE IF NOT EXISTS `color` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `codigo`      VARCHAR(50)  NOT NULL UNIQUE,
  `nombre`      VARCHAR(255) NOT NULL,
  `descripcion` TEXT         NULL,
  `created_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`  DATETIME(6)  NULL,
  `created_by`  INT          NULL,
  `updated_by`  INT          NULL,
  `deleted_by`  INT          NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_color_deleted_at` (`deleted_at`)
);

-- =============================================================================
-- COLOR_CODIGO
-- Uno o más códigos hexadecimales que componen un color.
-- Color sólido: 1 registro con su hex.
-- Trama: N registros, uno por cada color que la integra.
-- =============================================================================
CREATE TABLE IF NOT EXISTS `color_codigo` (
  `id`         INT         NOT NULL AUTO_INCREMENT,
  `color_id`   INT         NOT NULL,
  `hex`        VARCHAR(7)  NOT NULL COMMENT 'Código hexadecimal del componente',
  `orden`      INT         NOT NULL DEFAULT 0,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT         NULL,
  `updated_by` INT         NULL,
  `deleted_by` INT         NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_color_codigo_color_id`   (`color_id`),
  INDEX `idx_color_codigo_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_color_codigo_color` FOREIGN KEY (`color_id`) REFERENCES `color` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- CURVA_COLOR
-- Set reutilizable de colores para un modelo (análogo a curva_talle)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `curva_color` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `nombre`      VARCHAR(255) NOT NULL,
  `descripcion` TEXT         NULL,
  `created_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`  DATETIME(6)  NULL,
  `created_by`  INT          NULL,
  `updated_by`  INT          NULL,
  `deleted_by`  INT          NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_curva_color_deleted_at` (`deleted_at`)
);

-- =============================================================================
-- CURVA_COLOR_DETALLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS `curva_color_detalle` (
  `id`         INT         NOT NULL AUTO_INCREMENT,
  `curva_id`   INT         NOT NULL,
  `color_id`   INT         NOT NULL,
  `orden`      INT         NOT NULL DEFAULT 0,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT         NULL,
  `updated_by` INT         NULL,
  `deleted_by` INT         NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ccd_curva_color` (`curva_id`, `color_id`),
  INDEX `idx_ccd_curva_id`   (`curva_id`),
  INDEX `idx_ccd_color_id`   (`color_id`),
  INDEX `idx_ccd_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_ccd_curva`  FOREIGN KEY (`curva_id`) REFERENCES `curva_color`  (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ccd_color`  FOREIGN KEY (`color_id`) REFERENCES `color` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- TALLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS `talle` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `codigo`     VARCHAR(50)  NOT NULL UNIQUE,
  `nombre`     VARCHAR(100) NOT NULL,
  `orden`      INT          NOT NULL DEFAULT 0,
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6)  NULL,
  `created_by` INT          NULL,
  `updated_by` INT          NULL,
  `deleted_by` INT          NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_talle_deleted_at` (`deleted_at`)
);

-- =============================================================================
-- CURVA_TALLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS `curva_talle` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `nombre`      VARCHAR(255) NOT NULL,
  `descripcion` TEXT         NULL,
  `created_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`  DATETIME(6)  NULL,
  `created_by`  INT          NULL,
  `updated_by`  INT          NULL,
  `deleted_by`  INT          NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_curva_talle_deleted_at` (`deleted_at`)
);

-- =============================================================================
-- CURVA_TALLE_DETALLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS `curva_talle_detalle` (
  `id`         INT         NOT NULL AUTO_INCREMENT,
  `curva_id`   INT         NOT NULL,
  `talle_id`   INT         NOT NULL,
  `orden`      INT         NOT NULL DEFAULT 0,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT         NULL,
  `updated_by` INT         NULL,
  `deleted_by` INT         NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ctd_curva_talle` (`curva_id`, `talle_id`),
  INDEX `idx_ctd_curva_id`   (`curva_id`),
  INDEX `idx_ctd_talle_id`   (`talle_id`),
  INDEX `idx_ctd_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_ctd_curva` FOREIGN KEY (`curva_id`) REFERENCES `curva_talle` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctd_talle` FOREIGN KEY (`talle_id`) REFERENCES `talle`       (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- ARTICULO
-- =============================================================================
CREATE TABLE IF NOT EXISTS `articulo` (
  `id`             INT           NOT NULL AUTO_INCREMENT,
  `subgrupo_id`    INT           NOT NULL,
  `nombre`         VARCHAR(255)  NOT NULL,
  `descripcion`    TEXT          NULL,
  `codigo`         VARCHAR(50)   NOT NULL UNIQUE,
  `sku`            VARCHAR(80)   NOT NULL UNIQUE,
  `codigo_barras`  VARCHAR(100)  NULL,
  `codigo_qr`      VARCHAR(500)  NULL,
  `precio`         DECIMAL(15,2) NULL,
  `curva_id`       INT           NULL,
  `curva_color_id` INT           NULL,
  `created_at`     DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`     DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`     DATETIME(6)   NULL,
  `created_by`     INT           NULL,
  `updated_by`     INT           NULL,
  `deleted_by`     INT           NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_articulo_subgrupo_id`    (`subgrupo_id`),
  INDEX `idx_articulo_curva_id`       (`curva_id`),
  INDEX `idx_articulo_curva_color_id` (`curva_color_id`),
  INDEX `idx_articulo_deleted_at`     (`deleted_at`),
  CONSTRAINT `fk_articulo_subgrupo`    FOREIGN KEY (`subgrupo_id`)    REFERENCES `subgrupo`    (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_articulo_curva`       FOREIGN KEY (`curva_id`)       REFERENCES `curva_talle` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_articulo_curva_color` FOREIGN KEY (`curva_color_id`) REFERENCES `curva_color` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- =============================================================================
-- ARTICULO_TALLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS `articulo_talle` (
  `id`          INT         NOT NULL AUTO_INCREMENT,
  `articulo_id` INT         NOT NULL,
  `talle_id`    INT         NOT NULL,
  `orden`       INT         NOT NULL DEFAULT 0,
  `created_at`  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`  DATETIME(6) NULL,
  `created_by`  INT         NULL,
  `updated_by`  INT         NULL,
  `deleted_by`  INT         NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_at_articulo_talle` (`articulo_id`, `talle_id`),
  INDEX `idx_at_articulo_id` (`articulo_id`),
  INDEX `idx_at_talle_id`    (`talle_id`),
  INDEX `idx_at_deleted_at`  (`deleted_at`),
  CONSTRAINT `fk_at_articulo` FOREIGN KEY (`articulo_id`) REFERENCES `articulo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_at_talle`    FOREIGN KEY (`talle_id`)    REFERENCES `talle`    (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- ARTICULO_COLOR
-- Copia de los colores de curva_color al crear el artículo
-- =============================================================================
CREATE TABLE IF NOT EXISTS `articulo_color` (
  `id`          INT         NOT NULL AUTO_INCREMENT,
  `articulo_id` INT         NOT NULL,
  `color_id`    INT         NOT NULL,
  `orden`       INT         NOT NULL DEFAULT 0,
  `created_at`  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`  DATETIME(6) NULL,
  `created_by`  INT         NULL,
  `updated_by`  INT         NULL,
  `deleted_by`  INT         NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ac_articulo_color` (`articulo_id`, `color_id`),
  INDEX `idx_ac_articulo_id` (`articulo_id`),
  INDEX `idx_ac_color_id`    (`color_id`),
  INDEX `idx_ac_deleted_at`  (`deleted_at`),
  CONSTRAINT `fk_ac_articulo` FOREIGN KEY (`articulo_id`) REFERENCES `articulo`     (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ac_color`    FOREIGN KEY (`color_id`)    REFERENCES `color` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- ARTICULO_VARIANTE
-- Lazy: se crea en el primer ingreso de stock para talle × color
-- =============================================================================
CREATE TABLE IF NOT EXISTS `articulo_variante` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `articulo_id` INT          NOT NULL,
  `talle_id`    INT          NOT NULL,
  `color_id`    INT          NOT NULL,
  `cantidad`    VARCHAR(100) NOT NULL DEFAULT '0',
  `created_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`  DATETIME(6)  NULL,
  `created_by`  INT          NULL,
  `updated_by`  INT          NULL,
  `deleted_by`  INT          NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_av_articulo_talle_color` (`articulo_id`, `talle_id`, `color_id`),
  INDEX `idx_av_articulo_id` (`articulo_id`),
  INDEX `idx_av_talle_id`    (`talle_id`),
  INDEX `idx_av_color_id`    (`color_id`),
  INDEX `idx_av_deleted_at`  (`deleted_at`),
  CONSTRAINT `fk_av_articulo` FOREIGN KEY (`articulo_id`) REFERENCES `articulo`     (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_av_talle`    FOREIGN KEY (`talle_id`)    REFERENCES `talle`        (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_av_color`    FOREIGN KEY (`color_id`)    REFERENCES `color` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- PERMISOS DEL MÓDULO STOCK
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES

('FAMILIA_VER',      'Ver familias',    'stock'),
('FAMILIA_CREAR',    'Crear familia',   'stock'),
('FAMILIA_EDITAR',   'Editar familia',  'stock'),
('FAMILIA_ELIMINAR', 'Eliminar familia','stock'),

('GRUPO_VER',      'Ver grupos',    'stock'),
('GRUPO_CREAR',    'Crear grupo',   'stock'),
('GRUPO_EDITAR',   'Editar grupo',  'stock'),
('GRUPO_ELIMINAR', 'Eliminar grupo','stock'),

('SUBGRUPO_VER',      'Ver subgrupos',    'stock'),
('SUBGRUPO_CREAR',    'Crear subgrupo',   'stock'),
('SUBGRUPO_EDITAR',   'Editar subgrupo',  'stock'),
('SUBGRUPO_ELIMINAR', 'Eliminar subgrupo','stock'),

('COLOR_VER',      'Ver colores',    'stock'),
('COLOR_CREAR',    'Crear color',    'stock'),
('COLOR_EDITAR',   'Editar color',   'stock'),
('COLOR_ELIMINAR', 'Eliminar color', 'stock'),

('CURVA_COLOR_VER',      'Ver curvas de color',    'stock'),
('CURVA_COLOR_CREAR',    'Crear curva de color',   'stock'),
('CURVA_COLOR_EDITAR',   'Editar curva de color',  'stock'),
('CURVA_COLOR_ELIMINAR', 'Eliminar curva de color','stock'),

('TALLE_VER',      'Ver talles',    'stock'),
('TALLE_CREAR',    'Crear talle',   'stock'),
('TALLE_EDITAR',   'Editar talle',  'stock'),
('TALLE_ELIMINAR', 'Eliminar talle','stock'),

('CURVA_TALLE_VER',      'Ver curvas de talle',    'stock'),
('CURVA_TALLE_CREAR',    'Crear curva de talle',   'stock'),
('CURVA_TALLE_EDITAR',   'Editar curva de talle',  'stock'),
('CURVA_TALLE_ELIMINAR', 'Eliminar curva de talle','stock'),

('ARTICULO_VER',      'Ver artículos',    'stock'),
('ARTICULO_CREAR',    'Crear artículo',   'stock'),
('ARTICULO_EDITAR',   'Editar artículo',  'stock'),
('ARTICULO_ELIMINAR', 'Eliminar artículo','stock'),

('RUTA_STOCK',        'Acceso al módulo de stock',          'rutas'),
('RUTA_FAMILIAS',     'Acceso a página de familias',        'rutas'),
('RUTA_GRUPOS',       'Acceso a página de grupos',          'rutas'),
('RUTA_SUBGRUPOS',    'Acceso a página de subgrupos',       'rutas'),
('RUTA_COLORES',      'Acceso a página de colores',         'rutas'),
('RUTA_CURVAS_COLOR', 'Acceso a página de curvas de color', 'rutas'),
('RUTA_TALLES',       'Acceso a página de talles',          'rutas'),
('RUTA_CURVAS_TALLE', 'Acceso a página de curvas de talle', 'rutas'),
('RUTA_ARTICULOS',    'Acceso a página de artículos',       'rutas');

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `permissions`;
