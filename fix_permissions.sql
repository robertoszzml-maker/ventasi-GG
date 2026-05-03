-- Agregar permisos faltantes para Inventario/Artículos
-- y asignarlos al rol Administrador (role_id = 1)

-- Insertar permisos de Artículos si no existen
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('ARTICULOS_VER', 'Ver artículos', 'articulos'),
('ARTICULOS_CREAR', 'Crear artículos', 'articulos'),
('ARTICULOS_EDITAR', 'Editar artículos', 'articulos'),
('ARTICULOS_ELIMINAR', 'Eliminar artículos', 'articulos'),
('RUTA_ARTICULOS', 'Acceso a gestión de artículos', 'articulos'),
('RUTA_DASHBOARD_INVENTARIO', 'Acceso al dashboard de inventario', 'articulos');

-- Insertar permisos de Clientes si no existen
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('CLIENTES_VER', 'Ver clientes', 'clientes'),
('CLIENTES_CREAR', 'Crear clientes', 'clientes'),
('CLIENTES_EDITAR', 'Editar clientes', 'clientes'),
('CLIENTES_ELIMINAR', 'Eliminar clientes', 'clientes'),
('RUTA_CLIENTES', 'Acceso a gestión de clientes', 'clientes');

-- Insertar permisos de Cajas si no existen
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('CAJAS_VER', 'Ver cajas', 'cajas'),
('CAJAS_CREAR', 'Crear cajas', 'cajas'),
('CAJAS_EDITAR', 'Editar cajas', 'cajas'),
('CAJAS_ELIMINAR', 'Eliminar cajas', 'cajas'),
('RUTA_CAJAS', 'Acceso a gestión de cajas', 'cajas');

-- Asignar todos los permisos nuevos al rol Administrador (role_id = 1)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions WHERE codigo LIKE 'ARTICULOS_%' OR codigo LIKE 'RUTA_ARTICULOS%' OR codigo = 'RUTA_DASHBOARD_INVENTARIO';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions WHERE codigo LIKE 'CLIENTES_%' OR codigo LIKE 'RUTA_CLIENTES%';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions WHERE codigo LIKE 'CAJAS_%' OR codigo LIKE 'RUTA_CAJAS%';
