-- =============================================================================
-- 4.SQL — Sistema de listas de precios y costo de artículos
-- Ejecutar después de 3.sql
-- =============================================================================

-- =============================================================================
-- LISTA_PRECIO
-- Listas de precios globales del sistema (Minorista, Mayorista, etc.)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `lista_precio` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `nombre`      VARCHAR(255) NOT NULL,
  `descripcion` TEXT         NULL,
  `es_default`  TINYINT(1)   NOT NULL DEFAULT 0,
  `activo`      TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`  DATETIME(6)  NULL,
  `created_by`  INT          NULL,
  `updated_by`  INT          NULL,
  `deleted_by`  INT          NULL,

  PRIMARY KEY (`id`)
);

CREATE UNIQUE INDEX `UQ_lista_precio_nombre` ON `lista_precio`(`nombre`);
CREATE INDEX `IDX_lista_precio_activo`     ON `lista_precio`(`activo`);
CREATE INDEX `IDX_lista_precio_es_default` ON `lista_precio`(`es_default`);
CREATE INDEX `IDX_lista_precio_deleted_at` ON `lista_precio`(`deleted_at`);

-- =============================================================================
-- ARTICULO_PRECIO
-- Precio de cada artículo en cada lista de precios
-- =============================================================================
CREATE TABLE IF NOT EXISTS `articulo_precio` (
  `id`              INT         NOT NULL AUTO_INCREMENT,
  `articulo_id`     INT         NOT NULL,
  `lista_precio_id` INT         NOT NULL,
  `precio`          VARCHAR(20) NOT NULL DEFAULT '0.0000',
  `created_at`      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`      DATETIME(6) NULL,
  `created_by`      INT         NULL,
  `updated_by`      INT         NULL,
  `deleted_by`      INT         NULL,

  PRIMARY KEY (`id`),

  CONSTRAINT `FK_articulo_precio_articulo`     FOREIGN KEY (`articulo_id`)     REFERENCES `articulo`     (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_articulo_precio_lista_precio` FOREIGN KEY (`lista_precio_id`) REFERENCES `lista_precio` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX `UQ_articulo_precio_art_lista`     ON `articulo_precio`(`articulo_id`, `lista_precio_id`);
CREATE INDEX `IDX_articulo_precio_articulo_id`         ON `articulo_precio`(`articulo_id`);
CREATE INDEX `IDX_articulo_precio_lista_precio_id`     ON `articulo_precio`(`lista_precio_id`);
CREATE INDEX `IDX_articulo_precio_deleted_at`          ON `articulo_precio`(`deleted_at`);

-- =============================================================================
-- SEED — Lista "Precio General" (default del sistema)
-- =============================================================================
INSERT IGNORE INTO `lista_precio` (`id`, `nombre`, `descripcion`, `es_default`, `activo`) VALUES
(1, 'Precio General', 'Lista de precios por defecto del sistema', 1, 1);

-- =============================================================================
-- MIGRAR articulo.precio → articulo_precio (lista "Precio General")
-- =============================================================================
INSERT INTO `articulo_precio` (`articulo_id`, `lista_precio_id`, `precio`)
SELECT `id`, 1, COALESCE(`precio`, '0.0000')
FROM `articulo`
WHERE `deleted_at` IS NULL;

-- =============================================================================
-- MODIFICAR tabla articulo: eliminar precio, agregar costo
-- =============================================================================
ALTER TABLE `articulo` DROP COLUMN `precio`;
ALTER TABLE `articulo` ADD COLUMN `costo` VARCHAR(20) NOT NULL DEFAULT '0.0000' AFTER `sku`;

-- =============================================================================
-- PERMISOS — Costo de artículo
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('ARTICULO_VER_COSTO',    'Ver el costo interno del artículo',    'articulos'),
('ARTICULO_EDITAR_COSTO', 'Modificar el costo interno del artículo', 'articulos');

-- =============================================================================
-- PERMISOS — Listas de precios
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('LISTA_PRECIO_VER',      'Ver listas de precios',              'precios'),
('LISTA_PRECIO_CREAR',    'Crear nuevas listas de precios',     'precios'),
('LISTA_PRECIO_EDITAR',   'Editar precios en una lista',        'precios'),
('LISTA_PRECIO_ELIMINAR', 'Eliminar listas de precios',         'precios'),
('RUTA_LISTAS_PRECIOS',   'Acceso a página de listas de precios', 'rutas');
