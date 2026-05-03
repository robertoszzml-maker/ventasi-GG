# Ejemplos - Tipos de Datos

Casos de uso reales de la regla fundamental.

## Ejemplo 1: Equipamiento (Completo)

### SQL

```sql
CREATE TABLE IF NOT EXISTS `equipamiento` (
  -- IDs y FKs como INT
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo_id` INT NOT NULL,
  `categoria_id` INT NULL,

  -- Strings
  `nombre` VARCHAR(255) NOT NULL,
  `codigo` VARCHAR(100) NULL,
  `descripcion` TEXT NULL,

  -- Valores numéricos como VARCHAR(100)
  `anio` VARCHAR(100) NULL,
  `kilometraje` VARCHAR(100) NULL,
  `capacidad_kg` VARCHAR(100) NULL,
  `altura_metros` VARCHAR(100) NULL,
  `ancho_metros` VARCHAR(100) NULL,
  `largo_metros` VARCHAR(100) NULL,

  -- Valores monetarios como VARCHAR(20)
  `precio` VARCHAR(20) NULL,
  `precio_costo` VARCHAR(20) NULL,

  -- Auditoría como DATETIME(6)
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),
  CONSTRAINT `FK_equipamiento_tipo` FOREIGN KEY (`tipo_id`) REFERENCES `equipamiento_tipo`(`id`),
  CONSTRAINT `FK_equipamiento_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Backend Entity

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '@/common/base.entity';
import { MoneyColumn } from '@/common/decorators/money-column.decorator';

@Entity({ name: 'equipamiento' })
export class Equipamiento extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;  // INT

  @Column({ type: 'int', name: 'tipo_id', nullable: false })
  tipoId: number;  // FK INT

  @Column({ type: 'int', name: 'categoria_id', nullable: true })
  categoriaId: number;  // FK INT

  @Column({ type: 'varchar', length: 255, nullable: false })
  nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  codigo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  anio: string;  // VARCHAR(100)

  @Column({ type: 'varchar', length: 100, nullable: true })
  kilometraje: string;  // VARCHAR(100)

  @Column({ name: 'capacidad_kg', type: 'varchar', length: 100, nullable: true })
  capacidadKg: string;  // VARCHAR(100)

  @Column({ name: 'altura_metros', type: 'varchar', length: 100, nullable: true })
  alturaMetros: string;  // VARCHAR(100)

  @MoneyColumn()
  precio: number;  // VARCHAR(20) en DB, number en TS

  @MoneyColumn({ nullable: true })
  precioCosto?: number;  // VARCHAR(20) en DB, number en TS
}
```

### Backend DTO

```typescript
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateEquipamientoDto {
  @IsNumber()
  tipoId: number;  // FK

  @IsOptional()
  @IsNumber()
  categoriaId?: number;  // FK

  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsString()
  anio?: string;  // Valor como string

  @IsOptional()
  @IsString()
  kilometraje?: string;  // Valor como string

  @IsOptional()
  @IsString()
  capacidadKg?: string;  // Valor como string

  @IsOptional()
  @IsNumber()
  precio?: number;  // Monetario como number

  @IsOptional()
  @IsNumber()
  precioCosto?: number;  // Monetario como number
}
```

### Frontend Types

```typescript
export type Equipamiento = {
  id?: number;           // INT
  tipoId?: number;       // FK INT
  categoriaId?: number;  // FK INT
  nombre: string;
  codigo?: string;
  descripcion?: string;
  anio?: string;         // VARCHAR
  kilometraje?: string;  // VARCHAR
  capacidadKg?: string;  // VARCHAR
  alturaMetros?: string; // VARCHAR
  precio?: number;       // Monetario
  precioCosto?: number;  // Monetario
}
```

### Frontend Form Schema

```typescript
import { z } from 'zod';

const formSchema = z.object({
  id: z.number().optional(),
  tipoId: z.number().optional(),
  categoriaId: z.number().optional(),
  nombre: z.string().min(1),
  codigo: z.string().optional(),
  anio: z.string().optional(),
  kilometraje: z.string().optional(),
  capacidadKg: z.string().optional(),
  alturaMetros: z.string().optional(),
  precio: z.number().optional(),
  precioCosto: z.number().optional(),
});
```

### Frontend Form

```typescript
<FormField
  control={form.control}
  name="tipoId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Tipo</FormLabel>
      <EquipamientoTipoSelector
        value={field.value}
        onChange={field.onChange}
      />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="anio"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Año</FormLabel>
      <Input placeholder="2024" type="text" {...field} />
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="kilometraje"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Kilometraje</FormLabel>
      <Input placeholder="50000" type="text" {...field} />
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="precio"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Precio</FormLabel>
      <InputMoney
        value={field.value}
        onChange={(value) => field.onChange(value)}
      />
      <FormMessage />
    </FormItem>
  )}
/>
```

## Ejemplo 2: Producto con Mediciones

### SQL

```sql
CREATE TABLE `producto` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `categoria_id` INT NOT NULL,
  `nombre` VARCHAR(255) NOT NULL,
  `peso_kg` VARCHAR(100) NULL,
  `altura_cm` VARCHAR(100) NULL,
  `ancho_cm` VARCHAR(100) NULL,
  `largo_cm` VARCHAR(100) NULL,
  `volumen_m3` VARCHAR(100) NULL,
  `precio_venta` VARCHAR(20) NULL,
  `precio_costo` VARCHAR(20) NULL,
  PRIMARY KEY (`id`)
);
```

### Backend

```typescript
@Entity('producto')
export class Producto extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'categoria_id' })
  categoriaId: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'peso_kg', type: 'varchar', length: 100, nullable: true })
  pesoKg: string;

  @Column({ name: 'altura_cm', type: 'varchar', length: 100, nullable: true })
  alturaCm: string;

  @Column({ name: 'ancho_cm', type: 'varchar', length: 100, nullable: true })
  anchoCm: string;

  @Column({ name: 'volumen_m3', type: 'varchar', length: 100, nullable: true })
  volumenM3: string;

  @MoneyColumn({ name: 'precio_venta' })
  precioVenta: number;

  @MoneyColumn({ name: 'precio_costo' })
  precioCosto: number;
}
```

## Ejemplo 3: Contrato con Fechas y Porcentajes

### SQL

```sql
CREATE TABLE `contrato` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `proveedor_id` INT NOT NULL,
  `numero` VARCHAR(100) NOT NULL,
  `fecha_inicio` VARCHAR(100) NULL,
  `fecha_vencimiento` VARCHAR(100) NULL,
  `monto_total` VARCHAR(20) NULL,
  `descuento_porcentaje` VARCHAR(100) NULL,
  `iva_porcentaje` VARCHAR(100) NULL,
  PRIMARY KEY (`id`)
);
```

### Backend

```typescript
@Entity('contrato')
export class Contrato extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'proveedor_id' })
  proveedorId: number;

  @Column({ type: 'varchar', length: 100 })
  numero: string;

  @Column({ name: 'fecha_inicio', type: 'varchar', length: 100, nullable: true })
  fechaInicio: string;  // YYYY-MM-DD

  @Column({ name: 'fecha_vencimiento', type: 'varchar', length: 100, nullable: true })
  fechaVencimiento: string;  // YYYY-MM-DD

  @MoneyColumn({ name: 'monto_total' })
  montoTotal: number;

  @Column({ name: 'descuento_porcentaje', type: 'varchar', length: 100, nullable: true })
  descuentoPorcentaje: string;

  @Column({ name: 'iva_porcentaje', type: 'varchar', length: 100, nullable: true })
  ivaPorcentaje: string;
}
```

### Frontend

```typescript
const formSchema = z.object({
  id: z.number().optional(),
  proveedorId: z.number().optional(),
  numero: z.string().min(1),
  fechaInicio: z.string().optional(),
  fechaVencimiento: z.string().optional(),
  montoTotal: z.number().optional(),
  descuentoPorcentaje: z.string().optional(),
  ivaPorcentaje: z.string().optional(),
});
```

## Ejemplo 4: Migración de DECIMAL a VARCHAR

### Antes (Incorrecto)

```sql
CREATE TABLE `producto` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `precio` DECIMAL(10, 2) NULL,  -- ❌ DECIMAL
  `peso` FLOAT NULL,              -- ❌ FLOAT
  `cantidad` INT NULL,            -- ❌ INT para cantidad
  PRIMARY KEY (`id`)
);
```

### Migración

```sql
-- Paso 1: Agregar columnas temporales
ALTER TABLE `producto`
ADD COLUMN `precio_temp` VARCHAR(20) NULL AFTER `precio`,
ADD COLUMN `peso_temp` VARCHAR(100) NULL AFTER `peso`,
ADD COLUMN `cantidad_temp` VARCHAR(100) NULL AFTER `cantidad`;

-- Paso 2: Copiar datos
UPDATE `producto`
SET
  `precio_temp` = CAST(`precio` AS CHAR),
  `peso_temp` = CAST(`peso` AS CHAR),
  `cantidad_temp` = CAST(`cantidad` AS CHAR);

-- Paso 3: Eliminar columnas viejas
ALTER TABLE `producto`
DROP COLUMN `precio`,
DROP COLUMN `peso`,
DROP COLUMN `cantidad`;

-- Paso 4: Renombrar columnas temporales
ALTER TABLE `producto`
CHANGE `precio_temp` `precio` VARCHAR(20) NULL,
CHANGE `peso_temp` `peso` VARCHAR(100) NULL,
CHANGE `cantidad_temp` `cantidad` VARCHAR(100) NULL;
```

### Después (Correcto)

```sql
CREATE TABLE `producto` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `precio` VARCHAR(20) NULL,     -- ✅ VARCHAR
  `peso` VARCHAR(100) NULL,      -- ✅ VARCHAR
  `cantidad` VARCHAR(100) NULL,  -- ✅ VARCHAR
  PRIMARY KEY (`id`)
);
```

## Comparación: ❌ Incorrecto vs ✅ Correcto

### SQL

```sql
-- ❌ INCORRECTO
`anio` INT NULL,
`precio` DECIMAL(10, 2) NULL,
`peso` FLOAT NULL,
`fecha_entrega` DATE NULL,

-- ✅ CORRECTO
`anio` VARCHAR(100) NULL,
`precio` VARCHAR(20) NULL,
`peso` VARCHAR(100) NULL,
`fecha_entrega` VARCHAR(100) NULL,
```

### Backend Entity

```typescript
// ❌ INCORRECTO
@Column({ type: 'int' })
anio: number;

@Column({ type: 'decimal', precision: 10, scale: 2 })
precio: number;

// ✅ CORRECTO
@Column({ type: 'varchar', length: 100 })
anio: string;

@MoneyColumn()
precio: number;  // VARCHAR(20) en DB
```

### Backend DTO

```typescript
// ❌ INCORRECTO
@IsNumber()
anio?: number;

// ✅ CORRECTO
@IsString()
anio?: string;
```

### Frontend Types

```typescript
// ❌ INCORRECTO
anio?: number;
peso?: number;

// ✅ CORRECTO
anio?: string;
peso?: string;
```

### Frontend Form

```typescript
// ❌ INCORRECTO
anio: z.number().optional(),

<InputNumber {...field} />

// ✅ CORRECTO
anio: z.string().optional(),

<Input type="text" {...field} />
```

## Resumen de Casos de Uso

| Campo | SQL | Entity TS | DTO | Frontend Type | Zod | Input |
|-------|-----|-----------|-----|---------------|-----|-------|
| ID | `INT` | `number` | `@IsNumber()` | `number` | `z.number()` | - |
| FK | `INT` | `number` | `@IsNumber()` | `number` | `z.number()` | Selector |
| Año | `VARCHAR(100)` | `string` | `@IsString()` | `string` | `z.string()` | `<Input>` |
| Kilometraje | `VARCHAR(100)` | `string` | `@IsString()` | `string` | `z.string()` | `<Input>` |
| Precio | `VARCHAR(20)` | `number` | `@IsNumber()` | `number` | `z.number()` | `<InputMoney>` |
| Fecha | `VARCHAR(100)` | `string` | `@IsString()` | `string` | `z.string()` | `<Input>` |
| created_at | `DATETIME(6)` | automático | - | `string` | - | - |
