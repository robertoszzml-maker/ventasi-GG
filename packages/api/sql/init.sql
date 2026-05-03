-- =============================================================================
-- INIT.SQL — Base de datos inicial del template
-- Ejecutar con: mysql -u root -p < init.sql
--
-- Usuario administrador por defecto:
--   Email:    admin@template.local
--   Password: Admin123!
-- =============================================================================

-- =============================================================================
-- ROLES (tabla de perfiles de acceso)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `roles` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `nombre`      VARCHAR(100) NOT NULL,
  `descripcion` VARCHAR(255) NULL,
  `parent_id`   INT          NULL COMMENT 'ID del rol padre (herencia)',
  `nivel`       INT          NULL COMMENT 'Nivel jerárquico',
  `color`       VARCHAR(30)  NULL,
  `icono`       VARCHAR(50)  NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_nivel`     (`nivel`)
);

-- =============================================================================
-- USUARIO
-- =============================================================================
CREATE TABLE IF NOT EXISTS `usuario` (
  `id`            INT        NOT NULL AUTO_INCREMENT,
  `email`         VARCHAR(70) NOT NULL UNIQUE,
  `pwd`           VARCHAR(80) NOT NULL,
  `nombre`        VARCHAR(100) NULL,
  `activo`        INT        NOT NULL DEFAULT 1,
  `tel1`          VARCHAR(20) NULL,
  `tel2`          VARCHAR(20) NULL,
  `refresh_token` LONGTEXT   NULL,
  `attemps`       INT        NOT NULL DEFAULT 0,
  `permisoId`     INT        NULL COMMENT 'FK al rol asignado',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_usuario_role` FOREIGN KEY (`permisoId`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- =============================================================================
-- PERMISSIONS (permisos individuales del sistema RBAC)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `permissions` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `codigo`      VARCHAR(100) NOT NULL UNIQUE COMMENT 'Clave del permiso, ej: USUARIOS_VER',
  `descripcion` VARCHAR(255) NULL,
  `modulo`      VARCHAR(100) NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_codigo` (`codigo`)
);

-- =============================================================================
-- ROLE_PERMISSIONS (N:M roles ↔ permisos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id`            INT NOT NULL AUTO_INCREMENT,
  `role_id`       INT NOT NULL,
  `permission_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_permission` (`role_id`, `permission_id`),
  INDEX `idx_role_id`       (`role_id`),
  INDEX `idx_permission_id` (`permission_id`),
  CONSTRAINT `fk_rp_role`       FOREIGN KEY (`role_id`)       REFERENCES `roles`       (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- PERMISO_PERMISSION (herencia de permisos por rol — tabla puente legacy)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `permiso_permission` (
  `permiso_id`    INT      NOT NULL,
  `permission_id` INT      NOT NULL,
  `allow`         TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`permiso_id`, `permission_id`),
  CONSTRAINT `fk_pp_permiso`     FOREIGN KEY (`permiso_id`)    REFERENCES `roles`       (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pp_permission`  FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- USUARIO_PERMISO (asignación legacy 1:1 usuario→rol)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `usuario_permiso` (
  `usuario_id` INT       NOT NULL,
  `permiso_id` INT       NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`usuario_id`, `permiso_id`),
  KEY `IDX_permiso_id` (`permiso_id`),
  CONSTRAINT `FK_up_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_up_permiso` FOREIGN KEY (`permiso_id`) REFERENCES `roles`   (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- ARCHIVO (almacenamiento polimórfico de archivos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `archivo` (
  `id`                     INT          NOT NULL AUTO_INCREMENT,
  `nombre`                 VARCHAR(255) NULL,
  `nombre_archivo`         VARCHAR(255) NOT NULL,
  `nombre_archivo_original` VARCHAR(255) NOT NULL,
  `url`                    VARCHAR(255) NULL,
  `extension`              VARCHAR(255) NOT NULL,
  `modelo`                 VARCHAR(255) NOT NULL COMMENT 'Nombre de la entidad propietaria',
  `modelo_id`              INT          NOT NULL COMMENT 'ID de la entidad propietaria',
  `tipo`                   VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_modelo` (`modelo`, `modelo_id`)
);

-- =============================================================================
-- AUDITORIA (log de cambios sobre entidades)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `auditoria` (
  `id`             INT          NOT NULL AUTO_INCREMENT,
  `tabla`          VARCHAR(255) NOT NULL,
  `columna`        VARCHAR(255) NOT NULL,
  `valor_anterior` TEXT         NULL,
  `valor_nuevo`    TEXT         NULL,
  `registro_id`    INT          NULL,
  `usuario_id`     INT          NULL,
  `fecha`          TIMESTAMP    NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_auditoria_tabla`    (`tabla`(100)),
  INDEX `idx_auditoria_registro` (`registro_id`),
  INDEX `idx_auditoria_usuario`  (`usuario_id`)
);

-- =============================================================================
-- CONFIG (configuración dinámica de la aplicación)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `config` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `clave`       VARCHAR(100) NOT NULL UNIQUE,
  `valor`       TEXT         NULL,
  `modulo`      VARCHAR(100) NULL,
  `descripcion` VARCHAR(255) NULL,
  `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`  TIMESTAMP    NULL,
  PRIMARY KEY (`id`)
);

-- =============================================================================
-- MENSAJE (chat interno entre usuarios)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `mensaje` (
  `id`                    INT        NOT NULL AUTO_INCREMENT,
  `presupuestoId`         INT        NULL COMMENT 'Referencia polimórfica (tipoId)',
  `tipo`                  VARCHAR(100) NOT NULL DEFAULT 'general',
  `fecha`                 DATETIME   NULL,
  `mensaje`               LONGTEXT   NULL,
  `usuario_origen`        INT        NULL,
  `usuario_origen_nombre` VARCHAR(255) NULL,
  `usuario_destino`       INT        NULL,
  `usuario_destino_nombre` VARCHAR(255) NULL,
  `fecha_visto`           DATETIME   NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_mensaje_origen`  (`usuario_origen`),
  INDEX `idx_mensaje_destino` (`usuario_destino`),
  CONSTRAINT `fk_mensaje_origen`  FOREIGN KEY (`usuario_origen`)  REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_mensaje_destino` FOREIGN KEY (`usuario_destino`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- =============================================================================
-- NOTIFICACION (notificaciones en tiempo real entre usuarios)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `notificacion` (
  `id`               INT          NOT NULL AUTO_INCREMENT,
  `tipoUsuario`      INT          NULL COMMENT 'Rol/tipo del destinatario',
  `tipoNotificacion` VARCHAR(20)  NULL,
  `usuario_origen`   INT          NULL,
  `usuario_destino`  INT          NULL,
  `fecha`            DATETIME     NULL,
  `nota`             VARCHAR(255) NULL,
  `presupuestoId`    INT          NULL COMMENT 'Referencia polimórfica (tipoId)',
  `tipo`             VARCHAR(100) NULL,
  `fecha_visto`      DATETIME     NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_notif_origen`  (`usuario_origen`),
  INDEX `idx_notif_destino` (`usuario_destino`),
  CONSTRAINT `fk_notif_origen`  FOREIGN KEY (`usuario_origen`)  REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_notif_destino` FOREIGN KEY (`usuario_destino`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- =============================================================================
-- PLANTILLA_NOTIFICACION (plantillas de mensajes con variables)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `plantilla_notificacion` (
  `id`          INT           NOT NULL AUTO_INCREMENT,
  `nombre`      VARCHAR(100)  NOT NULL,
  `descripcion` VARCHAR(500)  NULL,
  `asunto`      VARCHAR(255)  NULL,
  `cuerpo`      TEXT          NOT NULL,
  `created_at`  DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`  DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`  DATETIME(6)   NULL,
  `created_by`  INT           NULL,
  `updated_by`  INT           NULL,
  `deleted_by`  INT           NULL,
  PRIMARY KEY (`id`)
);

-- =============================================================================
-- ENVIO_NOTIFICACION (historial de envíos de notificaciones)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `envio_notificacion` (
  `id`                        INT        NOT NULL AUTO_INCREMENT,
  `plantilla_notificacion_id` INT        NULL,
  `modelo`                    VARCHAR(50) NOT NULL,
  `modelo_id`                 INT        NULL,
  `canal`                     ENUM('email','whatsapp') NOT NULL,
  `estado`                    ENUM('pendiente','enviado','error') NOT NULL DEFAULT 'pendiente',
  `asunto_resuelto`           VARCHAR(255) NULL,
  `cuerpo_resuelto`           TEXT       NOT NULL,
  `fecha_envio`               VARCHAR(100) NULL,
  `email_destinatario`        VARCHAR(100) NULL,
  `error`                     TEXT       NULL,
  `created_at`                DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`                DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`                DATETIME(6) NULL,
  `created_by`                INT        NULL,
  `updated_by`                INT        NULL,
  `deleted_by`                INT        NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_envio_modelo`  (`modelo`, `modelo_id`),
  INDEX `idx_envio_estado`  (`estado`),
  INDEX `idx_envio_canal`   (`canal`),
  CONSTRAINT `fk_envio_plantilla` FOREIGN KEY (`plantilla_notificacion_id`) REFERENCES `plantilla_notificacion` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- =============================================================================
-- EJEMPLO_CATEGORIA (entidad de ejemplo — categoría)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `ejemplo_categoria` (
  `id`          INT           NOT NULL AUTO_INCREMENT,
  `nombre`      VARCHAR(255)  NOT NULL,
  `descripcion` VARCHAR(500)  NULL,
  `created_at`  DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`  DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`  DATETIME(6)   NULL,
  `created_by`  INT           NULL,
  `updated_by`  INT           NULL,
  `deleted_by`  INT           NULL,
  PRIMARY KEY (`id`)
);

-- =============================================================================
-- EJEMPLO (entidad de ejemplo — con FK a archivo y ejemplo_categoria)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `ejemplo` (
  `id`                   INT           NOT NULL AUTO_INCREMENT,
  `nombre`               VARCHAR(255)  NOT NULL,
  `descripcion`          VARCHAR(1000) NULL,
  `fecha`                VARCHAR(100)  NULL,
  `estado`               VARCHAR(50)   NOT NULL DEFAULT 'activo',
  `imagen_id`            INT           NULL,
  `ejemplo_categoria_id` INT           NOT NULL,
  `created_at`           DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`           DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`           DATETIME(6)   NULL,
  `created_by`           INT           NULL,
  `updated_by`           INT           NULL,
  `deleted_by`           INT           NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_ejemplo_categoria` (`ejemplo_categoria_id`),
  INDEX `idx_ejemplo_imagen`    (`imagen_id`),
  CONSTRAINT `fk_ejemplo_categoria` FOREIGN KEY (`ejemplo_categoria_id`) REFERENCES `ejemplo_categoria` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ejemplo_imagen`    FOREIGN KEY (`imagen_id`)            REFERENCES `archivo`           (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- =============================================================================
-- ROL ADMINISTRADOR
-- =============================================================================
INSERT IGNORE INTO `roles` (`id`, `nombre`, `descripcion`, `color`, `icono`) VALUES
(1, 'Administrador', 'Acceso total al sistema', '#ef4444', 'Shield');

-- =============================================================================
-- USUARIO ADMINISTRADOR INICIAL
-- Email:    Eridu@ventasi.com
-- Password: Sumeria64800
-- =============================================================================
INSERT IGNORE INTO `usuario` (`email`, `pwd`, `nombre`, `activo`, `permisoId`) VALUES
('Eridu@ventasi.com', '$2b$10$k1L2m3N4o5P6q7r8s9t0U1V2W3X4Y5Z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2', 'Administrador', 1, 1);

-- =============================================================================
-- PERMISOS DEL SISTEMA
-- =============================================================================
INSERT IGNORE INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES

-- Gestión de permisos (RBAC)
('PERMISOS_GESTIONAR', 'Gestionar permisos del sistema', 'auth'),

-- Usuarios
('USUARIOS_VER',      'Ver listado de usuarios',    'usuarios'),
('USUARIOS_CREAR',    'Crear usuarios',              'usuarios'),
('USUARIOS_EDITAR',   'Editar usuarios',             'usuarios'),
('USUARIOS_ELIMINAR', 'Eliminar usuarios',           'usuarios'),

-- Roles
('ROLES_VER',      'Ver listado de roles',  'roles'),
('ROLES_CREAR',    'Crear roles',           'roles'),
('ROLES_EDITAR',   'Editar roles',          'roles'),
('ROLES_ELIMINAR', 'Eliminar roles',        'roles'),

-- Archivos
('ARCHIVOS_VER',      'Ver archivos',      'archivos'),
('ARCHIVOS_CREAR',    'Subir archivos',    'archivos'),
('ARCHIVOS_EDITAR',   'Editar archivos',   'archivos'),
('ARCHIVOS_ELIMINAR', 'Eliminar archivos', 'archivos'),

-- Mensajes
('MENSAJES_VER',      'Ver mensajes',      'mensajes'),
('MENSAJES_CREAR',    'Enviar mensajes',   'mensajes'),
('MENSAJES_EDITAR',   'Editar mensajes',   'mensajes'),
('MENSAJES_ELIMINAR', 'Eliminar mensajes', 'mensajes'),

-- Notificaciones
('NOTIFICACIONES_VER',      'Ver notificaciones',      'notificaciones'),
('NOTIFICACIONES_CREAR',    'Crear notificaciones',    'notificaciones'),
('NOTIFICACIONES_EDITAR',   'Editar notificaciones',   'notificaciones'),
('NOTIFICACIONES_ELIMINAR', 'Eliminar notificaciones', 'notificaciones'),

-- Auditoría
('AUDITORIA_VER',                    'Ver auditoría',                         'auditoria'),
('AUDITORIA_CREAR',                  'Crear registros de auditoría',          'auditoria'),
('AUDITORIA_EDITAR',                 'Editar auditoría',                      'auditoria'),
('AUDITORIA_ELIMINAR',               'Eliminar auditoría',                    'auditoria'),
('AUDITORIA_PRESUPUESTO_HISTORIAL',  'Ver historial de auditoría de entidad', 'auditoria'),

-- SMTP Client
('SMTP_CLIENT_VER',      'Ver configuración SMTP',      'smtp'),
('SMTP_CLIENT_CREAR',    'Crear configuración SMTP',    'smtp'),
('SMTP_CLIENT_EDITAR',   'Editar configuración SMTP',   'smtp'),
('SMTP_CLIENT_ELIMINAR', 'Eliminar configuración SMTP', 'smtp'),

-- Plantillas de notificación
('PLANTILLA_NOTIFICACION_VER',      'Ver plantillas de notificación',      'plantilla_notificacion'),
('PLANTILLA_NOTIFICACION_CREAR',    'Crear plantillas de notificación',    'plantilla_notificacion'),
('PLANTILLA_NOTIFICACION_EDITAR',   'Editar plantillas de notificación',   'plantilla_notificacion'),
('PLANTILLA_NOTIFICACION_ELIMINAR', 'Eliminar plantillas de notificación', 'plantilla_notificacion'),

-- Envíos de notificación
('ENVIO_NOTIFICACION_VER',      'Ver historial de envíos',      'envio_notificacion'),
('ENVIO_NOTIFICACION_CREAR',    'Enviar notificaciones',        'envio_notificacion'),
('ENVIO_NOTIFICACION_EDITAR',   'Editar envíos',                'envio_notificacion'),
('ENVIO_NOTIFICACION_ELIMINAR', 'Eliminar registros de envíos', 'envio_notificacion'),

-- Ejemplo categoría
('EJEMPLO_CATEGORIA_VER',      'Ver categorías de ejemplo',      'ejemplo_categoria'),
('EJEMPLO_CATEGORIA_CREAR',    'Crear categoría de ejemplo',     'ejemplo_categoria'),
('EJEMPLO_CATEGORIA_EDITAR',   'Editar categoría de ejemplo',    'ejemplo_categoria'),
('EJEMPLO_CATEGORIA_ELIMINAR', 'Eliminar categoría de ejemplo',  'ejemplo_categoria'),

-- Ejemplo
('EJEMPLO_VER',      'Ver ejemplos',      'ejemplo'),
('EJEMPLO_CREAR',    'Crear ejemplo',     'ejemplo'),
('EJEMPLO_EDITAR',   'Editar ejemplo',    'ejemplo'),
('EJEMPLO_ELIMINAR', 'Eliminar ejemplo',  'ejemplo'),

-- Config — Ejemplo
('EJEMPLO_CONFIG', 'Configuración del módulo ejemplo', 'configuracion'),

-- Rutas del menú
('RUTA_DASHBOARD',              'Acceso al dashboard',                     'rutas'),
('RUTA_USUARIOS',               'Acceso a gestión de usuarios',            'rutas'),
('RUTA_ROLES',                  'Acceso a gestión de roles',               'rutas'),
('RUTA_ADMINISTRACION',         'Acceso a la sección de administración',   'rutas'),
('RUTA_SMTP_CLIENT',            'Acceso a configuración SMTP',             'rutas'),
('RUTA_PLANTILLA_NOTIFICACION', 'Acceso a plantillas de notificación',     'rutas'),
('RUTA_ENVIO_NOTIFICACION',     'Acceso a historial de envíos',            'rutas'),
('RUTA_EJEMPLOS',               'Acceso a página de ejemplos',             'rutas'),
('RUTA_EJEMPLO_CATEGORIAS',     'Acceso a categorías de ejemplo',          'rutas'),
('RUTA_EJEMPLO_CONFIG',         'Acceso a configuración de ejemplo',       'rutas');

-- =============================================================================
-- ASIGNAR TODOS LOS PERMISOS AL ROL ADMINISTRADOR
-- =============================================================================
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `permissions`;

-- =============================================================================
-- CONFIGURACIONES INICIALES
-- =============================================================================
INSERT IGNORE INTO `config` (`clave`, `valor`, `modulo`, `descripcion`) VALUES
('notificaciones_email_from',    '',       'administracion', 'Dirección de envío (From) para notificaciones por email'),
('notificaciones_email_activo',  '0',      'administracion', 'Activar envío real de emails (1=sí, 0=no)'),
('notificaciones_email_test',    '',       'administracion', 'Email de prueba para notificaciones'),
('EJEMPLO_LIMITE_REGISTROS',     '10',     'ejemplo',        'Cantidad de registros por página por defecto'),
('EJEMPLO_ESTADO_DEFAULT',       'activo', 'ejemplo',        'Estado asignado por defecto al crear un nuevo ejemplo'),
('EJEMPLO_PERMITIR_SIN_IMAGEN',  '1',      'ejemplo',        'Permitir crear ejemplos sin imagen adjunta (1=sí, 0=no)');
