# Referencia Técnica: Migraciones SQL

## Reglas Críticas

### 1. NO especificar ENGINE, CHARSET ni COLLATE

**❌ Incorrecto:**
```sql
CREATE TABLE `equipamiento` (
  `id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**✅ Correcto:**
```sql
CREATE TABLE `equipamiento` (
  `id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
);
```

**Razón:** Usar la configuración por defecto del sistema. Esto evita inconsistencias y permite que el sistema gestione automáticamente estos parámetros.

---

### 2. NO asignar permisos a roles en migraciones

**❌ Incorrecto:**
```sql
-- NO hacer esto
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `permissions` WHERE `codigo` IN ('EQUIPAMIENTO_VER');
```

**✅ Correcto:**
```sql
-- Solo insertar permisos
INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('EQUIPAMIENTO_VER', 'Ver registros de equipamiento', 'equipamiento');
```

**Razón:** La asignación de permisos a roles se hace manualmente desde la interfaz de administración. Esto permite flexibilidad y evita conflictos con roles personalizados.

---

### 3. Tipos de datos para fechas

**❌ Incorrecto:**
```sql
CREATE TABLE `jornada` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fecha` DATE NOT NULL,              -- ❌ NO usar DATE
  `fecha_inicio` DATETIME NOT NULL,   -- ❌ NO usar DATETIME
  `timestamp` TIMESTAMP NOT NULL,     -- ❌ NO usar TIMESTAMP
  PRIMARY KEY (`id`)
);
```

**✅ Correcto:**
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

**Razón:** Formato consistente `YYYY-MM-DD` como string permite flexibilidad y compatibilidad. Evita problemas de zona horaria y permite almacenar valores personalizados.

---

## Estructura de Migración Completa

### Template Base

```sql
-- 1. Crear tablas (sin ENGINE/CHARSET/COLLATE)
CREATE TABLE IF NOT EXISTS `nombre_tabla` (
  `id` INT NOT NULL AUTO_INCREMENT,

  -- Campos de negocio
  `nombre_campo` VARCHAR(255) NULL,
  `otra_columna` VARCHAR(100) NULL,
  `fecha_negocio` VARCHAR(100) NULL,                    -- Fechas como VARCHAR
  `fk_otra_tabla_id` INT NULL,

  -- Campos de BaseEntity (auditoría)
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),

  -- Foreign Keys
  CONSTRAINT `FK_nombre_tabla_otra` FOREIGN KEY (`fk_otra_tabla_id`)
    REFERENCES `otra_tabla`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 2. Crear índices si es necesario
CREATE INDEX `IDX_nombre_tabla_campo` ON `nombre_tabla`(`nombre_campo`);
CREATE INDEX `IDX_nombre_tabla_fk` ON `nombre_tabla`(`fk_otra_tabla_id`);

-- 3. Insertar permisos (NO asignar a roles)
INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('TABLA_VER', 'Ver registros de tabla', 'modulo'),
('TABLA_CREAR', 'Crear registros de tabla', 'modulo'),
('TABLA_EDITAR', 'Editar registros de tabla', 'modulo'),
('TABLA_ELIMINAR', 'Eliminar registros de tabla', 'modulo');
```

---

## Campos de BaseEntity

**SIEMPRE incluir estos campos:**

```sql
`created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
`updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
`deleted_at` DATETIME(6) NULL,
`created_by` INT NULL,
`updated_by` INT NULL,
`deleted_by` INT NULL,
```

**Características:**
- `DATETIME(6)`: Incluye microsegundos
- `DEFAULT CURRENT_TIMESTAMP(6)`: Auto-inicializa
- `ON UPDATE CURRENT_TIMESTAMP(6)`: Auto-actualiza
- `deleted_at NULL`: Para soft delete
- `*_by` campos: FKs a tabla users

---

## Foreign Keys

### Sintaxis Correcta

```sql
CONSTRAINT `FK_tabla_referencia` FOREIGN KEY (`columna_fk_id`)
  REFERENCES `tabla_referencia`(`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE
```

### Naming Convention

- Nombre: `FK_<tabla_actual>_<tabla_referencia>`
- Columna: `<nombre>_id` (snake_case con sufijo `_id`)
- Índice automático: `IDX_<tabla>_<columna>`

### ON DELETE Strategies

| Strategy | Uso |
|----------|-----|
| `CASCADE` | Eliminar registros dependientes (común) |
| `SET NULL` | Setear NULL al eliminar padre (raro) |
| `RESTRICT` | Prevenir eliminación si hay dependientes (usar con cuidado) |

---

## Índices

### Cuándo crear índices

**SÍ crear índice si:**
- Columna usada frecuentemente en WHERE
- Columna usada en JOIN
- Foreign key
- Columna usada en ORDER BY

**NO crear índice si:**
- Tabla muy pequeña (< 100 registros)
- Columna raramente consultada
- Columna con muy baja cardinalidad (pocos valores únicos)

### Sintaxis

```sql
-- Índice simple
CREATE INDEX `IDX_tabla_columna` ON `tabla`(`columna`);

-- Índice compuesto
CREATE INDEX `IDX_tabla_col1_col2` ON `tabla`(`columna1`, `columna2`);

-- Índice único
CREATE UNIQUE INDEX `UQ_tabla_columna` ON `tabla`(`columna`);
```

---

## Permisos

### Template Permisos CRUD

```sql
INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('<MODULO>_VER', 'Ver registros de <módulo>', '<modulo>'),
('<MODULO>_CREAR', 'Crear registros de <módulo>', '<modulo>'),
('<MODULO>_EDITAR', 'Editar registros de <módulo>', '<modulo>'),
('<MODULO>_ELIMINAR', 'Eliminar registros de <módulo>', '<modulo>');
```

### Permisos de Ruta

```sql
INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('RUTA_<MODULO>', 'Acceso a página <módulo>', 'rutas');
```

### Naming Convention

- CRUD: `<MODULO>_<ACCION>` (ej: `EQUIPAMIENTO_VER`)
- Rutas: `RUTA_<NOMBRE>` (ej: `RUTA_EQUIPAMIENTO`)
- Módulo: lowercase, singular (ej: `equipamiento`)

---

## Tipos de Datos

### Reglas por Tipo

| Tipo de Dato | SQL Type | Ejemplo |
|--------------|----------|---------|
| ID / PK | `INT NOT NULL AUTO_INCREMENT` | `id` |
| FK | `INT NULL` | `categoria_id` |
| String corto | `VARCHAR(255) NULL` | `nombre` |
| String largo | `TEXT NULL` | `descripcion` |
| **Fecha negocio** | `VARCHAR(100) NULL` | `fecha_entrega` |
| **Fecha auditoría** | `DATETIME(6) NOT NULL` | `created_at` |
| Número | `VARCHAR(100) NULL` | `cantidad`, `precio` |
| Boolean | `TINYINT NULL` | `activo` (0/1) |

**IMPORTANTE:**
- ✅ Fechas de negocio: `VARCHAR(100)`
- ✅ Valores numéricos: `VARCHAR(100)` (según regla tipos-de-datos)
- ✅ Solo BaseEntity usa `DATETIME(6)`

---

## Ubicación y Nomenclatura

### Directorio

```
packages/api/sql/
```

**NUNCA crear archivos SQL fuera de este directorio.**

### Nomenclatura

**Archivos numerados secuencialmente:**
- `75.sql`
- `76.sql`
- `77.sql`

**NO usar:**
- ❌ `migration_create_users.sql`
- ❌ `2024-01-15-create-users.sql`
- ❌ Timestamps o descripciones en nombre

### Obtener Próximo Número

```bash
ls packages/api/sql/ | grep -E '^[0-9]+\.sql$' | sed 's/\.sql$//' | sort -n | tail -1
```

O usar el helper script:
```bash
./.claude/skills/migraciones-sql/scripts/helper.sh
```

---

## Checklist Completo

### Pre-creación
- [ ] Verificar próximo número disponible
- [ ] Confirmar que tabla no existe
- [ ] Revisar modelo de datos

### Estructura
- [ ] `CREATE TABLE IF NOT EXISTS`
- [ ] Sin ENGINE/CHARSET/COLLATE
- [ ] PK con AUTO_INCREMENT
- [ ] Campos de BaseEntity completos

### Campos
- [ ] Fechas de negocio como VARCHAR(100)
- [ ] FKs con sufijo `_id`
- [ ] Tipos correctos según regla tipos-de-datos
- [ ] NULL/NOT NULL apropiado

### Constraints
- [ ] Foreign keys con ON DELETE/UPDATE
- [ ] Naming convention FK_tabla_referencia
- [ ] Índices en FKs

### Índices
- [ ] Índices en columnas frecuentes
- [ ] Naming convention IDX_tabla_columna
- [ ] Sin índices innecesarios

### Permisos
- [ ] INSERT INTO permissions
- [ ] NO INSERT INTO role_permissions
- [ ] CRUD completo si aplica
- [ ] Permiso de ruta si aplica

### Final
- [ ] Ubicación: packages/api/sql/
- [ ] Nombre: número secuencial
- [ ] Sin errores de sintaxis
- [ ] Comentarios claros

---

## Anti-patrones

```sql
-- ❌ NO
CREATE TABLE users (...) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO role_permissions ...;
`fecha` DATE NOT NULL
`precio` DECIMAL(10,2)
CREATE TABLE users (...)  -- Sin IF NOT EXISTS

-- ✅ SÍ
CREATE TABLE IF NOT EXISTS `users` (...);  -- Sin ENGINE
INSERT INTO permissions (...);  -- Sin roles
`fecha` VARCHAR(100) NULL
`precio` VARCHAR(20) NULL
```

---

## Resumen

| Aspecto | Valor |
|---------|-------|
| Ubicación | `packages/api/sql/` |
| Nomenclatura | Números secuenciales (`77.sql`) |
| ENGINE/CHARSET | ❌ NO especificar |
| Fechas negocio | `VARCHAR(100)` |
| Fechas BaseEntity | `DATETIME(6)` |
| Permisos | Solo INSERT permissions |
| IF NOT EXISTS | ✅ Siempre usar |
| BaseEntity | ✅ Siempre incluir 6 campos |
| Foreign Keys | ON DELETE CASCADE |
| Índices | En FKs y columnas frecuentes |
