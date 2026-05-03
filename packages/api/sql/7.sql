-- =============================================================================
-- 7.SQL — Impresión de etiquetas por variante de artículo
-- Ejecutar después de 6.sql
-- =============================================================================

ALTER TABLE articulo_variante ADD COLUMN codigo_barras VARCHAR(100) NULL;

-- =============================================================================
-- PERMISOS — Etiquetas
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('ETIQUETAS_IMPRIMIR', 'Imprimir etiquetas por variante', 'etiquetas'),
('RUTA_ETIQUETAS',     'Acceso al módulo de etiquetas',   'rutas');

