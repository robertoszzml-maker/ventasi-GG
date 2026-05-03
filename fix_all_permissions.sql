-- Agregar TODOS los permisos faltantes para el Administrador
-- Rol ID = 1 (Administrador)

-- Permisos de Artículos e Inventario completo
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('ARTICULOS_VER', 'Ver artículos', 'articulos'),
('ARTICULOS_CREAR', 'Crear artículos', 'articulos'),
('ARTICULOS_EDITAR', 'Editar artículos', 'articulos'),
('ARTICULOS_ELIMINAR', 'Eliminar artículos', 'articulos'),
('RUTA_ARTICULOS', 'Acceso a gestión de artículos', 'articulos'),
('RUTA_ARTICULOS_CREAR', 'Acceso a crear artículos', 'articulos'),
('RUTA_ARTICULOS_EDITAR', 'Acceso a editar artículos', 'articulos'),
('RUTA_DASHBOARD_INVENTARIO', 'Acceso al dashboard de inventario', 'articulos'),
('INVENTARIO_VER', 'Ver inventario', 'inventario'),
('INVENTARIO_ADMIN', 'Administrar inventario', 'inventario');

-- Permisos de Clientes completo
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('CLIENTES_VER', 'Ver clientes', 'clientes'),
('CLIENTES_CREAR', 'Crear clientes', 'clientes'),
('CLIENTES_EDITAR', 'Editar clientes', 'clientes'),
('CLIENTES_ELIMINAR', 'Eliminar clientes', 'clientes'),
('RUTA_CLIENTES', 'Acceso a gestión de clientes', 'clientes'),
('RUTA_CLIENTES_CREAR', 'Acceso a crear clientes', 'clientes'),
('RUTA_CLIENTES_EDITAR', 'Acceso a editar clientes', 'clientes');

-- Permisos de Cajas completo
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('CAJAS_VER', 'Ver cajas', 'cajas'),
('CAJAS_CREAR', 'Crear cajas', 'cajas'),
('CAJAS_EDITAR', 'Editar cajas', 'cajas'),
('CAJAS_ELIMINAR', 'Eliminar cajas', 'cajas'),
('RUTA_CAJAS', 'Acceso a gestión de cajas', 'cajas'),
('RUTA_CAJAS_APERTURA', 'Acceso a apertura de caja', 'cajas'),
('RUTA_CAJAS_CIERRE', 'Acceso a cierre de caja', 'cajas'),
('RUTA_CAJAS_ARQUEO', 'Acceso a arqueo de caja', 'cajas'),
('RUTA_CAJAS_HISTORIAL', 'Acceso a historial de caja', 'cajas'),
('RUTA_CAJAS_SESION', 'Acceso a sesión de caja', 'cajas'),
('CAJA_SESION_VER', 'Ver sesiones de caja', 'cajas'),
('CAJA_MOVIMIENTO_VER', 'Ver movimientos de caja', 'cajas'),
('CAJA_ARQUEO_VER', 'Ver arqueos de caja', 'cajas');

-- Permisos de Configuración
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('CONFIG_VER', 'Ver configuración', 'config'),
('CONFIG_EDITAR', 'Editar configuración', 'config'),
('RUTA_CONFIG', 'Acceso a configuración', 'config'),
('RUTA_CONFIG_CAJAS', 'Acceso a configuración de cajas', 'config'),
('RUTA_CONFIG_METODOS_PAGO', 'Acceso a métodos de pago', 'config'),
('RUTA_CONFIG_VENDEDORES', 'Acceso a vendedores', 'config');

-- Permisos de Colores, Talles, Curvas
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('RUTA_COLORES', 'Acceso a colores', 'articulos'),
('RUTA_TALLES', 'Acceso a talles', 'articulos'),
('RUTA_CURVAS_COLOR', 'Acceso a curvas de color', 'articulos'),
('RUTA_CURVAS_TALLE', 'Acceso a curvas de talle', 'articulos');

-- Permisos de Ubicaciones y Stock
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('RUTA_UBICACIONES', 'Acceso a ubicaciones', 'inventario'),
('STOCK_VER', 'Ver stock', 'inventario'),
('STOCK_MOVIMIENTOS_VER', 'Ver movimientos de stock', 'inventario');

-- Permisos de Ventas y Presupuestos
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('PRESUPUESTOS_VER', 'Ver presupuestos', 'ventas'),
('PRESUPUESTOS_CREAR', 'Crear presupuestos', 'ventas'),
('PRESUPUESTOS_EDITAR', 'Editar presupuestos', 'ventas'),
('PRESUPUESTOS_ELIMINAR', 'Eliminar presupuestos', 'ventas'),
('RUTA_PRESUPUESTOS', 'Acceso a presupuestos', 'ventas'),
('RUTA_PRESUPUESTOS_CREAR', 'Acceso a crear presupuestos', 'ventas');

-- Asignar TODOS los permisos existentes al rol Administrador (role_id = 1)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;
