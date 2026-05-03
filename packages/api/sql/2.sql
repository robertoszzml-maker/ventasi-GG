-- =============================================================================
-- 2.SQL — Sistema de inventario: ubicaciones, proveedores, clientes,
--         movimientos de inventario y stock por ubicación
-- Ejecutar después de 1.sql
-- =============================================================================

-- =============================================================================
-- UBICACION
-- Lugares físicos donde se almacena mercadería (local, depósito, etc.)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `ubicacion` (
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
  INDEX `idx_ubicacion_deleted_at` (`deleted_at`)
);

-- =============================================================================
-- PROVEEDOR
-- Origen externo de ingresos de mercadería
-- =============================================================================
CREATE TABLE IF NOT EXISTS `proveedor` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `nombre`      VARCHAR(255) NOT NULL,
  `cuit`        VARCHAR(50)  NULL,
  `telefono`    VARCHAR(50)  NULL,
  `email`       VARCHAR(255) NULL,
  `created_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`  DATETIME(6)  NULL,
  `created_by`  INT          NULL,
  `updated_by`  INT          NULL,
  `deleted_by`  INT          NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_proveedor_deleted_at` (`deleted_at`)
);

-- =============================================================================
-- CLIENTE
-- Destino externo de egresos de mercadería (ventas, regalos, etc.)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `cliente` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `nombre`      VARCHAR(255) NOT NULL,
  `email`       VARCHAR(255) NULL,
  `telefono`    VARCHAR(50)  NULL,
  `created_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`  DATETIME(6)  NULL,
  `created_by`  INT          NULL,
  `updated_by`  INT          NULL,
  `deleted_by`  INT          NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_cliente_deleted_at` (`deleted_at`)
);

-- =============================================================================
-- MOVIMIENTO_INVENTARIO
-- Cabecera de cada movimiento de stock (sin DELETE)
-- Tipos: MOVIMIENTO, ARREGLO
-- Procedencia y destino: exactamente 1 de los 3 FKs seteado (excepto ARREGLO)
-- Stock: si procedenciaUbicacion → resta; si destinoUbicacion → suma
-- =============================================================================
CREATE TABLE IF NOT EXISTS `movimiento_inventario` (
  `id`                       INT          NOT NULL AUTO_INCREMENT,
  `tipo`                     VARCHAR(20)  NOT NULL COMMENT 'MOVIMIENTO | ARREGLO',
  `fecha`                    VARCHAR(100) NOT NULL,
  `descripcion`              TEXT         NULL,
  `cantidad_total`           VARCHAR(100) NOT NULL DEFAULT '0',
  `responsable_id`           INT          NULL,

  -- Procedencia (máximo 1 seteado)
  `procedencia_ubicacion_id` INT          NULL,
  `procedencia_proveedor_id` INT          NULL,
  `procedencia_cliente_id`   INT          NULL,

  -- Destino (máximo 1 seteado)
  `destino_ubicacion_id`     INT          NULL,
  `destino_proveedor_id`     INT          NULL,
  `destino_cliente_id`       INT          NULL,

  `created_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`  DATETIME(6)  NULL,
  `created_by`  INT          NULL,
  `updated_by`  INT          NULL,
  `deleted_by`  INT          NULL,

  PRIMARY KEY (`id`),
  INDEX `idx_mi_tipo`                       (`tipo`),
  INDEX `idx_mi_fecha`                      (`fecha`),
  INDEX `idx_mi_responsable_id`             (`responsable_id`),
  INDEX `idx_mi_procedencia_ubicacion_id`   (`procedencia_ubicacion_id`),
  INDEX `idx_mi_procedencia_proveedor_id`   (`procedencia_proveedor_id`),
  INDEX `idx_mi_procedencia_cliente_id`     (`procedencia_cliente_id`),
  INDEX `idx_mi_destino_ubicacion_id`       (`destino_ubicacion_id`),
  INDEX `idx_mi_destino_proveedor_id`       (`destino_proveedor_id`),
  INDEX `idx_mi_destino_cliente_id`         (`destino_cliente_id`),
  INDEX `idx_mi_deleted_at`                 (`deleted_at`),

  CONSTRAINT `fk_mi_responsable`           FOREIGN KEY (`responsable_id`)           REFERENCES `usuario`   (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_mi_proc_ubicacion`        FOREIGN KEY (`procedencia_ubicacion_id`) REFERENCES `ubicacion` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_mi_proc_proveedor`        FOREIGN KEY (`procedencia_proveedor_id`) REFERENCES `proveedor` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_mi_proc_cliente`          FOREIGN KEY (`procedencia_cliente_id`)   REFERENCES `cliente`   (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_mi_dest_ubicacion`        FOREIGN KEY (`destino_ubicacion_id`)     REFERENCES `ubicacion` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_mi_dest_proveedor`        FOREIGN KEY (`destino_proveedor_id`)     REFERENCES `proveedor` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_mi_dest_cliente`          FOREIGN KEY (`destino_cliente_id`)       REFERENCES `cliente`   (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- =============================================================================
-- MOVIMIENTO_INVENTARIO_DETALLE
-- Líneas del movimiento: una por combinación artículo-variante (talle+color)
-- Para ARREGLO: cantidad_anterior y cantidad_nueva registran el cambio de stock
-- =============================================================================
CREATE TABLE IF NOT EXISTS `movimiento_inventario_detalle` (
  `id`                   INT          NOT NULL AUTO_INCREMENT,
  `movimiento_id`        INT          NOT NULL,
  `articulo_variante_id` INT          NOT NULL,
  `cantidad`             VARCHAR(100) NOT NULL DEFAULT '0',
  `cantidad_anterior`    VARCHAR(100) NULL COMMENT 'Solo para tipo ARREGLO: stock previo',
  `cantidad_nueva`       VARCHAR(100) NULL COMMENT 'Solo para tipo ARREGLO: stock nuevo',
  `created_at`           DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`           DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`           DATETIME(6)  NULL,
  `created_by`           INT          NULL,
  `updated_by`           INT          NULL,
  `deleted_by`           INT          NULL,

  PRIMARY KEY (`id`),
  INDEX `idx_mid_movimiento_id`        (`movimiento_id`),
  INDEX `idx_mid_articulo_variante_id` (`articulo_variante_id`),
  INDEX `idx_mid_deleted_at`           (`deleted_at`),

  CONSTRAINT `fk_mid_movimiento`        FOREIGN KEY (`movimiento_id`)        REFERENCES `movimiento_inventario` (`id`) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `fk_mid_articulo_variante` FOREIGN KEY (`articulo_variante_id`) REFERENCES `articulo_variante`    (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =============================================================================
-- STOCK_POR_UBICACION
-- Stock materializado por variante (talle+color) y ubicación física
-- Se actualiza atómicamente en cada movimiento (misma transacción)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `stock_por_ubicacion` (
  `id`                   INT          NOT NULL AUTO_INCREMENT,
  `articulo_variante_id` INT          NOT NULL,
  `ubicacion_id`         INT          NOT NULL,
  `cantidad`             VARCHAR(100) NOT NULL DEFAULT '0',
  `created_at`           DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`           DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`           DATETIME(6)  NULL,
  `created_by`           INT          NULL,
  `updated_by`           INT          NULL,
  `deleted_by`           INT          NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_spu_variante_ubicacion` (`articulo_variante_id`, `ubicacion_id`),
  INDEX `idx_spu_articulo_variante_id` (`articulo_variante_id`),
  INDEX `idx_spu_ubicacion_id`         (`ubicacion_id`),
  INDEX `idx_spu_deleted_at`           (`deleted_at`),

  CONSTRAINT `fk_spu_articulo_variante` FOREIGN KEY (`articulo_variante_id`) REFERENCES `articulo_variante` (`id`) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `fk_spu_ubicacion`         FOREIGN KEY (`ubicacion_id`)         REFERENCES `ubicacion`         (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =============================================================================
-- PERMISOS
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES

-- Ubicaciones
('UBICACION_VER',      'Ver ubicaciones',    'inventario'),
('UBICACION_CREAR',    'Crear ubicación',    'inventario'),
('UBICACION_EDITAR',   'Editar ubicación',   'inventario'),
('UBICACION_ELIMINAR', 'Eliminar ubicación', 'inventario'),

-- Proveedores
('PROVEEDOR_VER',      'Ver proveedores',    'proveedores'),
('PROVEEDOR_CREAR',    'Crear proveedor',    'proveedores'),
('PROVEEDOR_EDITAR',   'Editar proveedor',   'proveedores'),
('PROVEEDOR_ELIMINAR', 'Eliminar proveedor', 'proveedores'),

-- Clientes
('CLIENTE_VER',      'Ver clientes',    'clientes'),
('CLIENTE_CREAR',    'Crear cliente',   'clientes'),
('CLIENTE_EDITAR',   'Editar cliente',  'clientes'),
('CLIENTE_ELIMINAR', 'Eliminar cliente','clientes'),

-- Movimientos de inventario
('MOVIMIENTO_INVENTARIO_VER',    'Ver movimientos de inventario',    'inventario'),
('MOVIMIENTO_INVENTARIO_CREAR',  'Registrar movimiento de inventario','inventario'),

-- Stock por ubicación
('STOCK_UBICACION_VER', 'Ver stock por ubicación', 'inventario'),

-- Rutas del menú
('RUTA_INVENTARIO',   'Acceso a módulo inventario', 'rutas'),
('RUTA_UBICACIONES',  'Acceso a ubicaciones',        'rutas'),
('RUTA_PROVEEDORES',  'Acceso a proveedores',        'rutas'),
('RUTA_CLIENTES',     'Acceso a clientes',           'rutas'),
('RUTA_MOVIMIENTOS',  'Acceso a movimientos',        'rutas');
