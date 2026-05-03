# Reglas para Migraciones SQL

## Reglas Críticas

### 1. NO especificar ENGINE, CHARSET ni COLLATE

**Incorrecto:**
```sql
CREATE TABLE `equipamiento` (
  `id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Correcto:**
```sql
CREATE TABLE `equipamiento` (
  `id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
);
```

**Razón:** Usar la configuración por defecto del sistema.

### 2. NO asignar permisos a roles en migraciones

**Incorrecto:**
```sql
-- NO hacer esto
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `permissions` WHERE `codigo` IN ('EQUIPAMIENTO_VER');
```

**Correcto:**
```sql
-- Solo insertar permisos
INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('EQUIPAMIENTO_VER', 'Ver registros de equipamiento', 'equipamiento');
```

**Razón:** La asignación de permisos a roles se hace manualmente desde la interfaz de administración.

### 3. Tipos de datos para fechas

**Incorrecto:**
```sql
CREATE TABLE `jornada` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fecha` DATE NOT NULL,              -- ❌ NO usar DATE
  `fecha_inicio` DATETIME NOT NULL,   -- ❌ NO usar DATETIME
  `timestamp` TIMESTAMP NOT NULL,     -- ❌ NO usar TIMESTAMP
  PRIMARY KEY (`id`)
);
```

**Correcto:**
```sql
CREATE TABLE `jornada` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fecha` VARCHAR(100) NULL,          -- ✅ Usar VARCHAR(100)
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),  -- ✅ EXCEPCIÓN: BaseEntity
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  PRIMARY KEY (`id`)
);
```

**Regla:**
- ✅ **Usar `VARCHAR(100)` para todos los campos de fecha de negocio**
- ❌ **NO usar `DATE`, `DATETIME`, `TIMESTAMP`**
- ✅ **EXCEPCIÓN:** Solo usar `DATETIME(6)` en campos de BaseEntity (`created_at`, `updated_at`, `deleted_at`)

**Razón:** Formato consistente `YYYY-MM-DD` como string permite flexibilidad y compatibilidad.

## Estructura de Migración Correcta

```sql
-- 1. Crear tablas (sin ENGINE/CHARSET/COLLATE)
CREATE TABLE IF NOT EXISTS `jornada` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fecha` VARCHAR(100) NULL,                                                    -- Fecha como VARCHAR
  `detalle` VARCHAR(255) NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),             -- BaseEntity
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,
  PRIMARY KEY (`id`)
);

-- 2. Crear índices si es necesario
CREATE INDEX `IDX_jornada_fecha` ON `jornada`(`fecha`);

-- 3. Insertar permisos (NO asignar a roles)
INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('JORNADA_VER', 'Ver registros de jornada', 'jornada'),
('JORNADA_CREAR', 'Crear registros de jornada', 'jornada');
```

## Ubicación

- **Directorio:** `packages/api/sql/`
- **Nomenclatura:** Archivos numerados secuencialmente (`75.sql`, `76.sql`, etc.)
- **IMPORTANTE:** NUNCA crear archivos SQL fuera de `packages/api/sql/`
