# Ejemplos: Migraciones SQL

## Ejemplo 1: Tabla Simple con CRUD

### Migración: 77.sql

```sql
-- Crear tabla equipamiento_tipo
CREATE TABLE IF NOT EXISTS `equipamiento_tipo` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `descripcion` TEXT NULL,

  -- BaseEntity
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`)
);

-- Índice en nombre para búsquedas
CREATE INDEX `IDX_equipamiento_tipo_nombre` ON `equipamiento_tipo`(`nombre`);

-- Permisos CRUD
INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('EQUIPAMIENTO_TIPO_VER', 'Ver tipos de equipamiento', 'equipamiento'),
('EQUIPAMIENTO_TIPO_CREAR', 'Crear tipos de equipamiento', 'equipamiento'),
('EQUIPAMIENTO_TIPO_EDITAR', 'Editar tipos de equipamiento', 'equipamiento'),
('EQUIPAMIENTO_TIPO_ELIMINAR', 'Eliminar tipos de equipamiento', 'equipamiento');

-- Permiso de ruta
INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('RUTA_EQUIPAMIENTO_TIPO', 'Acceso a página tipos de equipamiento', 'rutas');
```

---

## Ejemplo 2: Tabla con Foreign Keys

### Migración: 78.sql

```sql
-- Crear tabla jornada
CREATE TABLE IF NOT EXISTS `jornada` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fecha` VARCHAR(100) NULL,                  -- ✅ Fecha como VARCHAR
  `hora_inicio` VARCHAR(100) NULL,
  `hora_fin` VARCHAR(100) NULL,
  `detalle` TEXT NULL,
  `proceso_general_id` INT NULL,             -- FK
  `obra_id` INT NULL,                        -- FK

  -- BaseEntity
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),

  -- Foreign Keys
  CONSTRAINT `FK_jornada_proceso_general` FOREIGN KEY (`proceso_general_id`)
    REFERENCES `proceso_general`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT `FK_jornada_obra` FOREIGN KEY (`obra_id`)
    REFERENCES `obra`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Índices en FKs
CREATE INDEX `IDX_jornada_proceso_general` ON `jornada`(`proceso_general_id`);
CREATE INDEX `IDX_jornada_obra` ON `jornada`(`obra_id`);
CREATE INDEX `IDX_jornada_fecha` ON `jornada`(`fecha`);

-- Permisos
INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('JORNADA_VER', 'Ver registros de jornada', 'jornada'),
('JORNADA_CREAR', 'Crear registros de jornada', 'jornada'),
('JORNADA_EDITAR', 'Editar registros de jornada', 'jornada'),
('JORNADA_ELIMINAR', 'Eliminar registros de jornada', 'jornada'),
('RUTA_JORNADA', 'Acceso a página jornada', 'rutas');
```

**Notas:**
- `fecha`, `hora_inicio`, `hora_fin` son VARCHAR (no DATE/TIME)
- `proceso_general_id` con CASCADE (eliminar jornadas huérfanas)
- `obra_id` con SET NULL (mantener jornadas si se elimina obra)

---

## Ejemplo 3: Tabla Intermedia (Many-to-Many)

### Migración: 79.sql

```sql
-- Tabla intermedia jornada_equipamiento
CREATE TABLE IF NOT EXISTS `jornada_equipamiento` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `jornada_id` INT NOT NULL,
  `equipamiento_id` INT NOT NULL,

  -- BaseEntity
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),

  -- Foreign Keys con CASCADE (eliminar relación si se elimina alguna entidad)
  CONSTRAINT `FK_jornada_equipamiento_jornada` FOREIGN KEY (`jornada_id`)
    REFERENCES `jornada`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT `FK_jornada_equipamiento_equip` FOREIGN KEY (`equipamiento_id`)
    REFERENCES `equipamiento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índices en ambas FKs
CREATE INDEX `IDX_jornada_equipamiento_jornada` ON `jornada_equipamiento`(`jornada_id`);
CREATE INDEX `IDX_jornada_equipamiento_equip` ON `jornada_equipamiento`(`equipamiento_id`);

-- Índice compuesto para evitar duplicados (opcional)
CREATE UNIQUE INDEX `UQ_jornada_equip` ON `jornada_equipamiento`(`jornada_id`, `equipamiento_id`);
```

**Notas:**
- Tabla intermedia con ID propio (no clave compuesta)
- Ambas FKs con CASCADE
- Índice único compuesto previene duplicados

---

## Ejemplo 4: Tabla con Campos Monetarios

### Migración: 80.sql

```sql
-- Tabla compra
CREATE TABLE IF NOT EXISTS `compra` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `numero` VARCHAR(100) NULL,
  `fecha` VARCHAR(100) NULL,                    -- ✅ VARCHAR
  `proveedor_id` INT NULL,

  -- Campos monetarios (VARCHAR según regla tipos-de-datos)
  `subtotal` VARCHAR(20) NULL,                  -- ✅ VARCHAR(20)
  `iva` VARCHAR(20) NULL,
  `total` VARCHAR(20) NULL,
  `descuento` VARCHAR(20) NULL,

  `observaciones` TEXT NULL,

  -- BaseEntity
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),

  CONSTRAINT `FK_compra_proveedor` FOREIGN KEY (`proveedor_id`)
    REFERENCES `proveedor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Índices
CREATE INDEX `IDX_compra_proveedor` ON `compra`(`proveedor_id`);
CREATE INDEX `IDX_compra_fecha` ON `compra`(`fecha`);
CREATE INDEX `IDX_compra_numero` ON `compra`(`numero`);

-- Permisos
INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('COMPRA_VER', 'Ver registros de compra', 'compra'),
('COMPRA_CREAR', 'Crear registros de compra', 'compra'),
('COMPRA_EDITAR', 'Editar registros de compra', 'compra'),
('COMPRA_ELIMINAR', 'Eliminar registros de compra', 'compra'),
('RUTA_COMPRA', 'Acceso a página compra', 'rutas');
```

**Notas:**
- Campos monetarios: `VARCHAR(20)` (no DECIMAL)
- `numero` como VARCHAR (puede tener formato alfanumérico)
- `proveedor_id` con SET NULL (mantener compra si se elimina proveedor)

---

## Ejemplo 5: Migración de Configuración

### Migración: 81.sql

```sql
-- Insertar configuraciones del módulo alquiler
INSERT INTO `config` (`clave`, `valor`, `modulo`, `descripcion`) VALUES
('ALQUILER_DIAS_AVISO_VENCIMIENTO', '7', 'alquiler', 'Días de anticipación para avisar vencimiento'),
('ALQUILER_PERMITIR_EDITAR_FINALIZADOS', '0', 'alquiler', 'Permitir editar alquileres finalizados (0=No, 1=Sí)'),
('ALQUILER_CALCULAR_IVA_AUTO', '1', 'alquiler', 'Calcular IVA automáticamente (0=No, 1=Sí)');

-- Permisos de configuración
INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('ALQUILER_CONFIG', 'Configuración de alquileres', 'configuracion'),
('RUTA_ALQUILER_CONFIG', 'Acceso a configuración alquileres', 'rutas');
```

**Notas:**
- No crea tabla (solo datos)
- Valores como string ('0', '1', '7')
- Incluye descripción para cada config

---

## Comparaciones: Correcto vs Incorrecto

### ❌ Migración Incorrecta

```sql
-- MÚLTIPLES ERRORES AQUÍ
CREATE TABLE equipamiento (                    -- ❌ Sin backticks
  id INT NOT NULL AUTO_INCREMENT,              -- ❌ Sin backticks
  nombre VARCHAR(255) NOT NULL,
  anio INT,                                    -- ❌ Año como INT (debe ser VARCHAR)
  fecha_compra DATE,                           -- ❌ Fecha como DATE (debe ser VARCHAR)
  precio DECIMAL(10,2),                        -- ❌ Precio como DECIMAL (debe ser VARCHAR)
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;       -- ❌ ENGINE/CHARSET

CREATE INDEX idx_equipamiento_nombre           -- ❌ Sin backticks
  ON equipamiento(nombre);

INSERT INTO permissions (codigo, descripcion, modulo) VALUES  -- ❌ Sin backticks
('EQUIPAMIENTO_VER', 'Ver equipamiento', 'equipamiento');

-- ❌ Asignar a roles (NO HACER)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions WHERE codigo = 'EQUIPAMIENTO_VER';
```

### ✅ Migración Correcta

```sql
-- CORRECTO
CREATE TABLE IF NOT EXISTS `equipamiento` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `anio` VARCHAR(100) NULL,                    -- ✅ VARCHAR
  `fecha_compra` VARCHAR(100) NULL,            -- ✅ VARCHAR
  `precio` VARCHAR(20) NULL,                   -- ✅ VARCHAR

  -- BaseEntity
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`)
);                                             -- ✅ Sin ENGINE/CHARSET

CREATE INDEX `IDX_equipamiento_nombre` ON `equipamiento`(`nombre`);

INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('EQUIPAMIENTO_VER', 'Ver equipamiento', 'equipamiento');

-- ✅ NO asignar a roles
```

---

## Errores Comunes y Soluciones

### Error 1: Fecha como DATE

**❌ Incorrecto:**
```sql
`fecha_entrega` DATE NOT NULL
```

**✅ Correcto:**
```sql
`fecha_entrega` VARCHAR(100) NULL
```

---

### Error 2: Sin IF NOT EXISTS

**❌ Incorrecto:**
```sql
CREATE TABLE `users` (...)
```

**✅ Correcto:**
```sql
CREATE TABLE IF NOT EXISTS `users` (...)
```

---

### Error 3: Falta BaseEntity

**❌ Incorrecto:**
```sql
CREATE TABLE IF NOT EXISTS `producto` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255),
  PRIMARY KEY (`id`)
);  -- Falta BaseEntity
```

**✅ Correcto:**
```sql
CREATE TABLE IF NOT EXISTS `producto` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255),

  -- BaseEntity (SIEMPRE incluir)
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`)
);
```

---

### Error 4: FK sin Índice

**❌ Incorrecto:**
```sql
CONSTRAINT `FK_jornada_obra` FOREIGN KEY (`obra_id`)
  REFERENCES `obra`(`id`);
-- Falta índice
```

**✅ Correcto:**
```sql
CONSTRAINT `FK_jornada_obra` FOREIGN KEY (`obra_id`)
  REFERENCES `obra`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX `IDX_jornada_obra` ON `jornada`(`obra_id`);
```

---

### Error 5: Asignar Permisos a Roles

**❌ Incorrecto:**
```sql
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `permissions` WHERE `codigo` = 'EQUIPAMIENTO_VER';
```

**✅ Correcto:**
```sql
-- Solo insertar permisos, asignar roles manualmente desde interfaz
INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('EQUIPAMIENTO_VER', 'Ver equipamiento', 'equipamiento');
```

---

## Casos Especiales

### Tabla sin Soft Delete

Si realmente no necesitas soft delete (muy raro):

```sql
CREATE TABLE IF NOT EXISTS `log_sistema` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `mensaje` TEXT,
  `nivel` VARCHAR(50),

  -- Solo timestamps, sin soft delete
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

  PRIMARY KEY (`id`)
);
```

**Nota:** Esto es excepcional. Por defecto SIEMPRE incluir BaseEntity completo.

---

### Tabla de Solo Lectura (Catálogo)

```sql
-- Tabla de provincias (catálogo estático)
CREATE TABLE IF NOT EXISTS `provincia` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `codigo` VARCHAR(10) NOT NULL,

  PRIMARY KEY (`id`)
);

-- Datos iniciales
INSERT INTO `provincia` (`nombre`, `codigo`) VALUES
('Buenos Aires', 'BA'),
('Córdoba', 'CB'),
('Santa Fe', 'SF');

CREATE UNIQUE INDEX `UQ_provincia_codigo` ON `provincia`(`codigo`);
```

**Nota:** Catálogos estáticos pueden omitir BaseEntity si no se modifican.
