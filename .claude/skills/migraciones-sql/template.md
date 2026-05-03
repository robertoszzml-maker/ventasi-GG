# Template: Migración SQL

Template base para crear nuevas migraciones SQL.

## Placeholders

- `<TABLA>`: Nombre de la tabla en snake_case (ej: `equipamiento_tipo`, `jornada`)
- `<CAMPO_N>`: Nombre del campo en snake_case (ej: `nombre`, `fecha_entrega`)
- `<TIPO_N>`: Tipo SQL del campo (ej: `VARCHAR(255)`, `VARCHAR(100)`, `INT`)
- `<FK_TABLA>`: Nombre de tabla referenciada en FK (ej: `categoria`, `proveedor`)
- `<MODULO>`: Nombre del módulo en snake_case (ej: `equipamiento`, `compra`)
- `<MODULO_UPPER>`: Nombre del módulo en UPPER_SNAKE_CASE (ej: `EQUIPAMIENTO`, `COMPRA`)

---

## Template Completo: Tabla con CRUD

```sql
-- Migración: <NUMERO>.sql
-- Crear tabla <TABLA>

CREATE TABLE IF NOT EXISTS `<TABLA>` (
  `id` INT NOT NULL AUTO_INCREMENT,

  -- Campos de negocio
  `<CAMPO_1>` <TIPO_1> NULL,
  `<CAMPO_2>` <TIPO_2> NULL,
  `<CAMPO_3>` <TIPO_3> NULL,

  -- Foreign Keys (si aplica)
  `<FK_TABLA>_id` INT NULL,

  -- BaseEntity (auditoría)
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),

  -- Constraints de Foreign Keys
  CONSTRAINT `FK_<TABLA>_<FK_TABLA>` FOREIGN KEY (`<FK_TABLA>_id`)
    REFERENCES `<FK_TABLA>`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índices
CREATE INDEX `IDX_<TABLA>_<CAMPO_FRECUENTE>` ON `<TABLA>`(`<CAMPO_FRECUENTE>`);
CREATE INDEX `IDX_<TABLA>_<FK_TABLA>` ON `<TABLA>`(`<FK_TABLA>_id`);

-- Permisos CRUD
INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('<MODULO_UPPER>_VER', 'Ver registros de <modulo>', '<MODULO>'),
('<MODULO_UPPER>_CREAR', 'Crear registros de <modulo>', '<MODULO>'),
('<MODULO_UPPER>_EDITAR', 'Editar registros de <modulo>', '<MODULO>'),
('<MODULO_UPPER>_ELIMINAR', 'Eliminar registros de <modulo>', '<MODULO>');

-- Permiso de ruta (si aplica)
INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('RUTA_<MODULO_UPPER>', 'Acceso a página <modulo>', 'rutas');
```

---

## Template: Tabla Simple (Sin FKs)

```sql
CREATE TABLE IF NOT EXISTS `<TABLA>` (
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

CREATE INDEX `IDX_<TABLA>_nombre` ON `<TABLA>`(`nombre`);

INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('<MODULO_UPPER>_VER', 'Ver registros de <modulo>', '<MODULO>'),
('<MODULO_UPPER>_CREAR', 'Crear registros de <modulo>', '<MODULO>'),
('<MODULO_UPPER>_EDITAR', 'Editar registros de <modulo>', '<MODULO>'),
('<MODULO_UPPER>_ELIMINAR', 'Eliminar registros de <modulo>', '<MODULO>'),
('RUTA_<MODULO_UPPER>', 'Acceso a página <modulo>', 'rutas');
```

---

## Template: Tabla Intermedia (M:N)

```sql
CREATE TABLE IF NOT EXISTS `<TABLA_A>_<TABLA_B>` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `<TABLA_A>_id` INT NOT NULL,
  `<TABLA_B>_id` INT NOT NULL,

  -- BaseEntity
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),

  CONSTRAINT `FK_<TABLA_A>_<TABLA_B>_<TABLA_A>` FOREIGN KEY (`<TABLA_A>_id`)
    REFERENCES `<TABLA_A>`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT `FK_<TABLA_A>_<TABLA_B>_<TABLA_B>` FOREIGN KEY (`<TABLA_B>_id`)
    REFERENCES `<TABLA_B>`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX `IDX_<TABLA_A>_<TABLA_B>_<TABLA_A>` ON `<TABLA_A>_<TABLA_B>`(`<TABLA_A>_id`);
CREATE INDEX `IDX_<TABLA_A>_<TABLA_B>_<TABLA_B>` ON `<TABLA_A>_<TABLA_B>`(`<TABLA_B>_id`);

-- Índice único compuesto para evitar duplicados
CREATE UNIQUE INDEX `UQ_<TABLA_A>_<TABLA_B>` ON `<TABLA_A>_<TABLA_B>`(`<TABLA_A>_id`, `<TABLA_B>_id`);
```

---

## Template: Tabla con Campos Monetarios

```sql
CREATE TABLE IF NOT EXISTS `<TABLA>` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `numero` VARCHAR(100) NULL,
  `fecha` VARCHAR(100) NULL,                    -- Fecha como VARCHAR

  -- Campos monetarios (VARCHAR según tipos-de-datos)
  `subtotal` VARCHAR(20) NULL,
  `iva` VARCHAR(20) NULL,
  `total` VARCHAR(20) NULL,
  `descuento` VARCHAR(20) NULL,

  `<FK_TABLA>_id` INT NULL,

  -- BaseEntity
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),

  CONSTRAINT `FK_<TABLA>_<FK_TABLA>` FOREIGN KEY (`<FK_TABLA>_id`)
    REFERENCES `<FK_TABLA>`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX `IDX_<TABLA>_<FK_TABLA>` ON `<TABLA>`(`<FK_TABLA>_id`);
CREATE INDEX `IDX_<TABLA>_fecha` ON `<TABLA>`(`fecha`);
CREATE INDEX `IDX_<TABLA>_numero` ON `<TABLA>`(`numero`);

INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('<MODULO_UPPER>_VER', 'Ver registros de <modulo>', '<MODULO>'),
('<MODULO_UPPER>_CREAR', 'Crear registros de <modulo>', '<MODULO>'),
('<MODULO_UPPER>_EDITAR', 'Editar registros de <modulo>', '<MODULO>'),
('<MODULO_UPPER>_ELIMINAR', 'Eliminar registros de <modulo>', '<MODULO>'),
('RUTA_<MODULO_UPPER>', 'Acceso a página <modulo>', 'rutas');
```

---

## Template: Solo Permisos (Sin Tabla)

```sql
-- Agregar permisos para módulo <MODULO>

INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('<MODULO_UPPER>_<ACCION_1>', 'Descripción acción 1', '<MODULO>'),
('<MODULO_UPPER>_<ACCION_2>', 'Descripción acción 2', '<MODULO>'),
('RUTA_<MODULO_UPPER>', 'Acceso a página <modulo>', 'rutas');
```

---

## Template: Solo Configuración (Sin Tabla)

```sql
-- Configuraciones del módulo <MODULO>

INSERT INTO `config` (`clave`, `valor`, `modulo`, `descripcion`) VALUES
('<CONFIG_1>', '<VALOR_DEFAULT>', '<MODULO>', 'Descripción de la configuración'),
('<CONFIG_2>', '<VALOR_DEFAULT>', '<MODULO>', 'Descripción de la configuración');

-- Permisos de configuración
INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('<MODULO_UPPER>_CONFIG', 'Configuración de <modulo>', 'configuracion'),
('RUTA_<MODULO_UPPER>_CONFIG', 'Acceso a configuración <modulo>', 'rutas');
```

---

## Mapeo de Tipos de Datos

### Según Tipo de Campo

| Tipo de Dato | SQL Type | Nullable | Ejemplo |
|--------------|----------|----------|---------|
| ID / PK | `INT NOT NULL AUTO_INCREMENT` | No | `id` |
| FK | `INT NULL` | Sí | `categoria_id` |
| String corto | `VARCHAR(255) NULL` | Sí | `nombre`, `titulo` |
| String medio | `VARCHAR(500) NULL` | Sí | `descripcion_corta` |
| String largo | `TEXT NULL` | Sí | `descripcion`, `observaciones` |
| **Fecha negocio** | `VARCHAR(100) NULL` | Sí | `fecha_entrega`, `fecha_vencimiento` |
| **Número** | `VARCHAR(100) NULL` | Sí | `cantidad`, `kilometraje` |
| **Dinero** | `VARCHAR(20) NULL` | Sí | `precio`, `total`, `subtotal` |
| Boolean | `TINYINT NULL` | Sí | `activo` (0/1) |
| Email | `VARCHAR(255) NULL` | Sí | `email` |
| URL | `VARCHAR(500) NULL` | Sí | `url`, `sitio_web` |
| Teléfono | `VARCHAR(50) NULL` | Sí | `telefono`, `celular` |
| CUIT/DNI | `VARCHAR(50) NULL` | Sí | `cuit`, `dni` |

### Campos de BaseEntity (Copiar siempre igual)

```sql
`created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
`updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
`deleted_at` DATETIME(6) NULL,
`created_by` INT NULL,
`updated_by` INT NULL,
`deleted_by` INT NULL,
```

---

## Ejemplo Completado: Proveedor

### Input
```
Tabla: proveedor
Campos:
- razon_social (string requerido)
- nombre_fantasia (string opcional)
- cuit (string)
- telefono (string)
- email (string)
```

### Template Aplicado

```sql
-- Migración: 82.sql
-- Crear tabla proveedor

CREATE TABLE IF NOT EXISTS `proveedor` (
  `id` INT NOT NULL AUTO_INCREMENT,

  -- Campos de negocio
  `razon_social` VARCHAR(255) NOT NULL,
  `nombre_fantasia` VARCHAR(255) NULL,
  `cuit` VARCHAR(50) NULL,
  `telefono` VARCHAR(50) NULL,
  `email` VARCHAR(255) NULL,
  `direccion` TEXT NULL,

  -- BaseEntity
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`)
);

-- Índices
CREATE INDEX `IDX_proveedor_razon_social` ON `proveedor`(`razon_social`);
CREATE INDEX `IDX_proveedor_cuit` ON `proveedor`(`cuit`);

-- Permisos CRUD
INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('PROVEEDOR_VER', 'Ver registros de proveedor', 'proveedor'),
('PROVEEDOR_CREAR', 'Crear registros de proveedor', 'proveedor'),
('PROVEEDOR_EDITAR', 'Editar registros de proveedor', 'proveedor'),
('PROVEEDOR_ELIMINAR', 'Eliminar registros de proveedor', 'proveedor');

-- Permiso de ruta
INSERT INTO `permissions` (`codigo`, `descripcion`, `modulo`) VALUES
('RUTA_PROVEEDOR', 'Acceso a página proveedor', 'rutas');
```

---

## Decisiones de Implementación

### ¿Cuándo usar CASCADE vs SET NULL?

| Scenario | ON DELETE |
|----------|-----------|
| Relación fuerte (jornada → proceso_general) | `CASCADE` |
| Relación opcional (compra → proveedor) | `SET NULL` |
| Tabla intermedia M:N | `CASCADE` |
| Referencia a catálogo (producto → categoría) | `SET NULL` o `RESTRICT` |

### ¿Cuándo crear índices?

**SÍ crear índice:**
- Foreign keys (SIEMPRE)
- Campos en WHERE frecuentes
- Campos en JOIN
- Campos en ORDER BY

**NO crear índice:**
- Tablas pequeñas (< 100 registros)
- Campos raramente consultados
- Campos con baja cardinalidad

### ¿NOT NULL o NULL?

| Campo | Nullable |
|-------|----------|
| PK | NOT NULL |
| FK | NULL (generalmente) |
| Strings | NULL (usar "" en app) |
| Fechas | NULL |
| Números | NULL |
| BaseEntity timestamps | created_at/updated_at NOT NULL, deleted_at NULL |

---

## Checklist Template

Antes de crear la migración, verificar:

- [ ] Número secuencial correcto
- [ ] `CREATE TABLE IF NOT EXISTS`
- [ ] Sin ENGINE/CHARSET/COLLATE
- [ ] Campos BaseEntity completos
- [ ] Fechas como VARCHAR(100)
- [ ] Dinero como VARCHAR(20)
- [ ] FKs con ON DELETE/UPDATE
- [ ] Índices en FKs
- [ ] Permisos sin asignar a roles
- [ ] Ubicación: packages/api/sql/
- [ ] Backticks en todos los identificadores
