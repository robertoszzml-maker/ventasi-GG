-- Agregar TODOS los permisos correctos según constants/permisos.ts
-- Al rol Administrador (role_id = 1)

-- Artículos
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('ARTICULO_VER', 'Ver artículos', 'articulos'),
('ARTICULO_CREAR', 'Crear artículos', 'articulos'),
('ARTICULO_EDITAR', 'Editar artículos', 'articulos'),
('ARTICULO_ELIMINAR', 'Eliminar artículos', 'articulos'),
('ARTICULO_VER_COSTO', 'Ver costo de artículos', 'articulos'),
('ARTICULO_EDITAR_COSTO', 'Editar costo de artículos', 'articulos'),
('DASHBOARD_ANCLAS_VER', 'Ver dashboard de anclas', 'articulos'),
('ETIQUETAS_IMPRIMIR', 'Imprimir etiquetas', 'articulos'),
('RUTA_ARTICULOS', 'Acceso a artículos', 'articulos');

-- Clasificación de artículos
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('FAMILIA_VER', 'Ver familias', 'clasificacion'),
('FAMILIA_CREAR', 'Crear familias', 'clasificacion'),
('FAMILIA_EDITAR', 'Editar familias', 'clasificacion'),
('FAMILIA_ELIMINAR', 'Eliminar familias', 'clasificacion'),
('GRUPO_VER', 'Ver grupos', 'clasificacion'),
('GRUPO_CREAR', 'Crear grupos', 'clasificacion'),
('GRUPO_EDITAR', 'Editar grupos', 'clasificacion'),
('GRUPO_ELIMINAR', 'Eliminar grupos', 'clasificacion'),
('SUBGRUPO_VER', 'Ver subgrupos', 'clasificacion'),
('SUBGRUPO_CREAR', 'Crear subgrupos', 'clasificacion'),
('SUBGRUPO_EDITAR', 'Editar subgrupos', 'clasificacion'),
('SUBGRUPO_ELIMINAR', 'Eliminar subgrupos', 'clasificacion'),
('RUTA_FAMILIAS', 'Acceso a familias', 'clasificacion'),
('RUTA_GRUPOS', 'Acceso a grupos', 'clasificacion'),
('RUTA_SUBGRUPOS', 'Acceso a subgrupos', 'clasificacion');

-- Colores y Talles
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('COLOR_VER', 'Ver colores', 'variantes'),
('COLOR_CREAR', 'Crear colores', 'variantes'),
('COLOR_EDITAR', 'Editar colores', 'variantes'),
('COLOR_ELIMINAR', 'Eliminar colores', 'variantes'),
('TALLE_VER', 'Ver talles', 'variantes'),
('TALLE_CREAR', 'Crear talles', 'variantes'),
('TALLE_EDITAR', 'Editar talles', 'variantes'),
('TALLE_ELIMINAR', 'Eliminar talles', 'variantes'),
('CURVA_COLOR_VER', 'Ver curvas de color', 'variantes'),
('CURVA_COLOR_CREAR', 'Crear curvas de color', 'variantes'),
('CURVA_COLOR_EDITAR', 'Editar curvas de color', 'variantes'),
('CURVA_COLOR_ELIMINAR', 'Eliminar curvas de color', 'variantes'),
('CURVA_TALLE_VER', 'Ver curvas de talle', 'variantes'),
('CURVA_TALLE_CREAR', 'Crear curvas de talle', 'variantes'),
('CURVA_TALLE_EDITAR', 'Editar curvas de talle', 'variantes'),
('CURVA_TALLE_ELIMINAR', 'Eliminar curvas de talle', 'variantes'),
('RUTA_COLORES', 'Acceso a colores', 'variantes'),
('RUTA_TALLES', 'Acceso a talles', 'variantes'),
('RUTA_CURVAS_COLOR', 'Acceso a curvas de color', 'variantes'),
('RUTA_CURVAS_TALLE', 'Acceso a curvas de talle', 'variantes');

-- Inventario y Ubicaciones
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('UBICACION_VER', 'Ver ubicaciones', 'inventario'),
('UBICACION_CREAR', 'Crear ubicaciones', 'inventario'),
('UBICACION_EDITAR', 'Editar ubicaciones', 'inventario'),
('UBICACION_ELIMINAR', 'Eliminar ubicaciones', 'inventario'),
('STOCK_UBICACION_VER', 'Ver stock por ubicación', 'inventario'),
('MOVIMIENTO_INVENTARIO_VER', 'Ver movimientos de inventario', 'inventario'),
('MOVIMIENTO_INVENTARIO_CREAR', 'Crear movimientos de inventario', 'inventario'),
('RUTA_STOCK', 'Acceso a stock', 'inventario'),
('RUTA_UBICACIONES', 'Acceso a ubicaciones', 'inventario'),
('RUTA_INVENTARIO', 'Acceso a inventario', 'inventario'),
('RUTA_MOVIMIENTOS', 'Acceso a movimientos', 'inventario');

-- Proveedores
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('PROVEEDOR_VER', 'Ver proveedores', 'proveedores'),
('PROVEEDOR_CREAR', 'Crear proveedores', 'proveedores'),
('PROVEEDOR_EDITAR', 'Editar proveedores', 'proveedores'),
('PROVEEDOR_ELIMINAR', 'Eliminar proveedores', 'proveedores'),
('RUTA_PROVEEDORES', 'Acceso a proveedores', 'proveedores');

-- Clientes
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('CLIENTE_VER', 'Ver clientes', 'clientes'),
('CLIENTE_CREAR', 'Crear clientes', 'clientes'),
('CLIENTE_EDITAR', 'Editar clientes', 'clientes'),
('CLIENTE_ELIMINAR', 'Eliminar clientes', 'clientes'),
('RUTA_CLIENTES', 'Acceso a clientes', 'clientes');

-- Visitas
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('VISITA_VER', 'Ver visitas', 'visitas'),
('VISITA_CREAR', 'Crear visitas', 'visitas'),
('VISITA_EDITAR', 'Editar visitas', 'visitas'),
('CARACTERISTICA_VISITANTE_VER', 'Ver características de visitante', 'visitas'),
('CARACTERISTICA_VISITANTE_CREAR', 'Crear características de visitante', 'visitas'),
('CARACTERISTICA_VISITANTE_EDITAR', 'Editar características de visitante', 'visitas'),
('CARACTERISTICA_VISITANTE_ELIMINAR', 'Eliminar características de visitante', 'visitas'),
('RAZON_NO_COMPRA_VER', 'Ver razones de no compra', 'visitas'),
('RAZON_NO_COMPRA_CREAR', 'Crear razones de no compra', 'visitas'),
('RAZON_NO_COMPRA_EDITAR', 'Editar razones de no compra', 'visitas'),
('RAZON_NO_COMPRA_ELIMINAR', 'Eliminar razones de no compra', 'visitas'),
('DASHBOARD_CONVERSION_VER', 'Ver dashboard de conversión', 'visitas'),
('RUTA_REGISTRO_VISITAS', 'Acceso a registro de visitas', 'visitas'),
('RUTA_DASHBOARD_CONVERSION', 'Acceso a dashboard de conversión', 'visitas'),
('RUTA_CONFIG_CARACTERISTICAS', 'Acceso a configuración de características', 'visitas'),
('RUTA_CONFIG_RAZONES_NO_COMPRA', 'Acceso a configuración de razones', 'visitas');

-- Vendedores
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('VENDEDOR_VER', 'Ver vendedores', 'vendedores'),
('VENDEDOR_CREAR', 'Crear vendedores', 'vendedores'),
('VENDEDOR_EDITAR', 'Editar vendedores', 'vendedores'),
('VENDEDOR_ELIMINAR', 'Eliminar vendedores', 'vendedores'),
('RUTA_VENDEDORES', 'Acceso a vendedores', 'vendedores');

-- Métodos de Pago
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('METODO_PAGO_VER', 'Ver métodos de pago', 'pagos'),
('METODO_PAGO_CREAR', 'Crear métodos de pago', 'pagos'),
('METODO_PAGO_EDITAR', 'Editar métodos de pago', 'pagos'),
('METODO_PAGO_ELIMINAR', 'Eliminar métodos de pago', 'pagos'),
('MEDIO_PAGO_VER', 'Ver medios de pago', 'pagos'),
('MEDIO_PAGO_CREAR', 'Crear medios de pago', 'pagos'),
('MEDIO_PAGO_EDITAR', 'Editar medios de pago', 'pagos'),
('MEDIO_PAGO_ELIMINAR', 'Eliminar medios de pago', 'pagos'),
('COBRO_VER', 'Ver cobros', 'pagos'),
('COBRO_CREAR', 'Crear cobros', 'pagos'),
('RUTA_METODOS_PAGO', 'Acceso a métodos de pago', 'pagos');

-- Listas de Precios
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('LISTA_PRECIO_VER', 'Ver listas de precio', 'precios'),
('LISTA_PRECIO_CREAR', 'Crear listas de precio', 'precios'),
('LISTA_PRECIO_EDITAR', 'Editar listas de precio', 'precios'),
('LISTA_PRECIO_ELIMINAR', 'Eliminar listas de precio', 'precios'),
('RUTA_LISTAS_PRECIOS', 'Acceso a listas de precios', 'precios');

-- Cajas
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('CAJA_VER', 'Ver cajas', 'cajas'),
('CAJA_EDITAR', 'Editar cajas', 'cajas'),
('SESION_CAJA_VER', 'Ver sesiones de caja', 'cajas'),
('SESION_CAJA_ABRIR', 'Abrir sesión de caja', 'cajas'),
('SESION_CAJA_CERRAR', 'Cerrar sesión de caja', 'cajas'),
('MOVIMIENTO_CAJA_VER', 'Ver movimientos de caja', 'cajas'),
('MOVIMIENTO_CAJA_CREAR', 'Crear movimientos de caja', 'cajas'),
('ARQUEO_CAJA_VER', 'Ver arqueos de caja', 'cajas'),
('ARQUEO_CAJA_CREAR', 'Crear arqueos de caja', 'cajas'),
('CONCEPTO_MOVIMIENTO_VER', 'Ver conceptos de movimiento', 'cajas'),
('CONCEPTO_MOVIMIENTO_CREAR', 'Crear conceptos de movimiento', 'cajas'),
('CONCEPTO_MOVIMIENTO_EDITAR', 'Editar conceptos de movimiento', 'cajas'),
('CONCEPTO_MOVIMIENTO_ELIMINAR', 'Eliminar conceptos de movimiento', 'cajas'),
('RUTA_CAJAS', 'Acceso a cajas', 'cajas'),
('RUTA_CONFIG_CONCEPTOS', 'Acceso a configuración de conceptos', 'cajas');

-- Ventas y Presupuestos
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('VENTA_VER', 'Ver ventas', 'ventas'),
('VENTA_CREAR', 'Crear ventas', 'ventas'),
('VENTA_EDITAR', 'Editar ventas', 'ventas'),
('VENTA_CONFIRMAR', 'Confirmar ventas', 'ventas'),
('VENTA_ANULAR', 'Anular ventas', 'ventas'),
('RUTA_VENTAS', 'Acceso a ventas', 'ventas');

-- Comprobantes
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('COMPROBANTE_VER', 'Ver comprobantes', 'comprobantes'),
('COMPROBANTE_EMITIR_FISCAL', 'Emitir comprobantes fiscales', 'comprobantes'),
('COMPROBANTE_EMITIR_MANUAL', 'Emitir comprobantes manuales', 'comprobantes'),
('COMPROBANTE_IMPRIMIR', 'Imprimir comprobantes', 'comprobantes'),
('COMPROBANTE_ANULAR', 'Anular comprobantes', 'comprobantes');

-- Notas de Crédito/Débito
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('NOTA_CREDITO_VER', 'Ver notas de crédito', 'notas'),
('NOTA_CREDITO_CREAR', 'Crear notas de crédito', 'notas'),
('NOTA_CREDITO_CONFIRMAR', 'Confirmar notas de crédito', 'notas'),
('NOTA_CREDITO_ANULAR', 'Anular notas de crédito', 'notas'),
('NOTA_DEBITO_VER', 'Ver notas de débito', 'notas'),
('NOTA_DEBITO_CREAR', 'Crear notas de débito', 'notas'),
('NOTA_DEBITO_CONFIRMAR', 'Confirmar notas de débito', 'notas'),
('NOTA_DEBITO_ANULAR', 'Anular notas de débito', 'notas'),
('RUTA_NOTAS_CREDITO', 'Acceso a notas de crédito', 'notas'),
('RUTA_NOTAS_DEBITO', 'Acceso a notas de débito', 'notas');

-- ARCA Configuración
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('ARCA_CONFIG_VER', 'Ver configuración ARCA', 'arca'),
('ARCA_CONFIG_EDITAR', 'Editar configuración ARCA', 'arca');

-- Auditoría
INSERT IGNORE INTO permissions (codigo, descripcion, modulo) VALUES
('AUDITORIA_VER', 'Ver auditoría', 'auditoria'),
('AUDITORIA_CREAR', 'Crear auditoría', 'auditoria'),
('AUDITORIA_EDITAR', 'Editar auditoría', 'auditoria'),
('AUDITORIA_ELIMINAR', 'Eliminar auditoría', 'auditoria'),
('AUDITORIA_PRESUPUESTO_HISTORIAL', 'Ver historial de presupuestos', 'auditoria');

-- Asignar TODOS los permisos al rol Administrador (role_id = 1)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;
