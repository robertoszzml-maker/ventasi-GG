-- Agregar permisos de rutas del menú que faltan
-- Estos permisos son necesarios para que el menú lateral se muestre

-- Insertar permisos de rutas del menú
INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('RUTA_LISTAS_PRECIOS', 'Acceso a listas de precios', 'Precios'),
('RUTA_DASHBOARD', 'Acceso al dashboard', 'Dashboard'),
('RUTA_USUARIOS', 'Acceso a usuarios', 'Administración'),
('RUTA_ROLES', 'Acceso a roles', 'Administración'),
('RUTA_ADMINISTRACION', 'Acceso a administración', 'Administración'),
('RUTA_SMTP_CLIENT', 'Acceso a SMTP', 'Administración'),
('RUTA_PLANTILLA_NOTIFICACION', 'Acceso a plantillas de notificación', 'Administración'),
('RUTA_ENVIO_NOTIFICACION', 'Acceso a envío de notificaciones', 'Administración'),
('RUTA_EJEMPLOS', 'Acceso a ejemplos', 'Ejemplos'),
('RUTA_EJEMPLO_CATEGORIAS', 'Acceso a categorías de ejemplos', 'Ejemplos'),
('RUTA_EJEMPLO_CONFIG', 'Acceso a configuración de ejemplos', 'Ejemplos'),
('RUTA_STOCK', 'Acceso a stock', 'Stock'),
('RUTA_FAMILIAS', 'Acceso a familias', 'Catálogo'),
('RUTA_GRUPOS', 'Acceso a grupos', 'Catálogo'),
('RUTA_SUBGRUPOS', 'Acceso a subgrupos', 'Catálogo'),
('RUTA_COLORES', 'Acceso a colores', 'Catálogo'),
('RUTA_CURVAS_COLOR', 'Acceso a curvas de color', 'Catálogo'),
('RUTA_TALLES', 'Acceso a talles', 'Catálogo'),
('RUTA_CURVAS_TALLE', 'Acceso a curvas de talle', 'Catálogo'),
('RUTA_ARTICULOS', 'Acceso a artículos', 'Catálogo'),
('RUTA_INVENTARIO', 'Acceso a inventario', 'Inventario'),
('RUTA_UBICACIONES', 'Acceso a ubicaciones', 'Inventario'),
('RUTA_PROVEEDORES', 'Acceso a proveedores', 'Inventario'),
('RUTA_CLIENTES', 'Acceso a clientes', 'Clientes'),
('RUTA_MOVIMIENTOS', 'Acceso a movimientos', 'Inventario'),
('RUTA_REGISTRO_VISITAS', 'Acceso a registro de visitas', 'Visitas'),
('RUTA_DASHBOARD_CONVERSION', 'Acceso a dashboard de conversión', 'Visitas'),
('RUTA_CONFIG_CARACTERISTICAS', 'Acceso a características de visitantes', 'Visitas'),
('RUTA_CONFIG_RAZONES_NO_COMPRA', 'Acceso a razones de no compra', 'Visitas'),
('RUTA_VENDEDORES', 'Acceso a vendedores', 'Vendedores'),
('RUTA_METODOS_PAGO', 'Acceso a métodos de pago', 'Ventas'),
('RUTA_MEDIOS_PAGO', 'Acceso a medios de pago', 'Ventas'),
('RUTA_VENTAS', 'Acceso a ventas', 'Ventas'),
('RUTA_ETIQUETAS', 'Acceso a etiquetas', 'Inventario'),
('RUTA_CAJAS', 'Acceso a cajas', 'Cajas'),
('RUTA_SESION_CAJA', 'Acceso a sesión de caja', 'Cajas'),
('RUTA_ARQUEOS', 'Acceso a arqueos', 'Cajas'),
('RUTA_COBROS', 'Acceso a cobros', 'Cajas'),
('RUTA_CONFIG_CONCEPTOS', 'Acceso a configuración de conceptos', 'Cajas'),
('RUTA_NOTAS_CREDITO', 'Acceso a notas de crédito', 'Ventas'),
('RUTA_NOTAS_DEBITO', 'Acceso a notas de débito', 'Ventas')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion), modulo = VALUES(modulo);

-- Asignar todos los permisos al rol Administrador (role_id = 1)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions 
WHERE codigo LIKE 'RUTA_%'
ON DUPLICATE KEY UPDATE role_id = role_id;
