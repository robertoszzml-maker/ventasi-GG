-- =============================================================================
-- 5.SQL — Información adicional de artículos: clasificación, ancla y umbrales
-- Ejecutar después de 4.sql
-- =============================================================================

-- =============================================================================
-- ARTICULO — campos de clasificación comercial y control
-- =============================================================================
ALTER TABLE `articulo`
  ADD COLUMN `tipo_continuidad` VARCHAR(20) NULL AFTER `costo`,
  ADD COLUMN `es_ancla`         TINYINT(1) NOT NULL DEFAULT 0 AFTER `tipo_continuidad`;

CREATE INDEX `IDX_articulo_es_ancla`         ON `articulo`(`es_ancla`);
CREATE INDEX `IDX_articulo_tipo_continuidad` ON `articulo`(`tipo_continuidad`);

-- =============================================================================
-- ARTICULO_VARIANTE — umbrales de stock por variante (semáforo)
-- =============================================================================
ALTER TABLE `articulo_variante`
  ADD COLUMN `stock_minimo`    INT NULL AFTER `cantidad`,
  ADD COLUMN `stock_seguridad` INT NULL AFTER `stock_minimo`,
  ADD COLUMN `stock_maximo`    INT NULL AFTER `stock_seguridad`;

-- =============================================================================
-- PERMISOS — Dashboard de artículos ancla
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('DASHBOARD_ANCLAS_VER', 'Ver dashboard de artículos ancla con estado de stock', 'dashboard'),
('RUTA_DASHBOARD',       'Acceso a la página de dashboard principal',             'rutas');
