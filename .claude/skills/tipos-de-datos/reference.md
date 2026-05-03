# Referencia Técnica - Tipos de Datos

Documentación completa de la regla fundamental de tipos de datos.

## Regla Fundamental

**IMPORTANTE**: Todos los valores de negocio (numéricos, monetarios, mediciones, etc.) se almacenan como `VARCHAR`, **excepto**:
- IDs (siempre `INT` con AUTO_INCREMENT)
- Claves foráneas (siempre `INT`)

## Tipos de Datos Permitidos

### ✅ Usar VARCHAR(100) para:

- **Valores numéricos**: cantidad, peso, altura, ancho, largo
- **Valores monetarios**: precios, costos, subtotales, totales
- **Mediciones**: kilómetros, litros, presión, capacidad
- **Años**: año de fabricación, año de modelo
- **Porcentajes**: descuentos, IVA, comisiones
- **Coordenadas**: latitud, longitud
- **Cantidades decimales**: metros cúbicos, metros cuadrados
- **Fechas de negocio**: fecha entrega, vencimiento (formato YYYY-MM-DD)

### ✅ Usar INT solo para:

- **IDs**: Clave primaria con AUTO_INCREMENT
- **Claves foráneas**: Referencias a otras tablas

### ✅ Usar DATETIME(6) solo para:

- **Campos de auditoría**: `created_at`, `updated_at`, `deleted_at`

## SQL (Migración)

### Template Tabla Completa

```sql
CREATE TABLE IF NOT EXISTS `equipamiento` (
  -- IDs y FKs como INT
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo_id` INT NOT NULL,

  -- Strings
  `nombre` VARCHAR(255) NOT NULL,
  `descripcion` TEXT NULL,

  -- Valores como VARCHAR(100)
  `anio` VARCHAR(100) NULL,
  `kilometraje` VARCHAR(100) NULL,
  `capacidad_kg` VARCHAR(100) NULL,
  `altura_metros` VARCHAR(100) NULL,
  `ancho_metros` VARCHAR(100) NULL,

  -- Valores monetarios como VARCHAR(20)
  `precio` VARCHAR(20) NULL,
  `precio_costo` VARCHAR(20) NULL,

  -- Fechas de negocio como VARCHAR(100)
  `fecha_compra` VARCHAR(100) NULL,
  `fecha_ultimo_mantenimiento` VARCHAR(100) NULL,

  -- Auditoría como DATETIME(6)
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,

  PRIMARY KEY (`id`),
  CONSTRAINT `FK_equipamiento_tipo` FOREIGN KEY (`tipo_id`) REFERENCES `equipamiento_tipo`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Agregar Campo

```sql
-- Valor numérico
ALTER TABLE `equipamiento` ADD COLUMN `peso_kg` VARCHAR(100) NULL AFTER `capacidad_kg`;

-- Valor monetario
ALTER TABLE `producto` ADD COLUMN `precio_venta` VARCHAR(20) NULL AFTER `precio_costo`;

-- Fecha de negocio
ALTER TABLE `contrato` ADD COLUMN `fecha_vencimiento` VARCHAR(100) NULL AFTER `fecha_inicio`;

-- FK
ALTER TABLE `equipamiento` ADD COLUMN `categoria_id` INT NULL AFTER `tipo_id`;
```

## Backend - Entity TypeORM

### Template Completo

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '@/common/base.entity';
import { MoneyColumn } from '@/common/decorators/money-column.decorator';

@Entity({ name: 'equipamiento' })
export class Equipamiento extends BaseEntity {
  // IDs y FKs como number
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'tipo_id', nullable: false })
  tipoId: number;

  // Strings
  @Column({ type: 'varchar', length: 255, nullable: false })
  nombre: string;

  // Valores como string
  @Column({ type: 'varchar', length: 100, nullable: true })
  anio: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  kilometraje: string;

  @Column({ name: 'capacidad_kg', type: 'varchar', length: 100, nullable: true })
  capacidadKg: string;

  @Column({ name: 'altura_metros', type: 'varchar', length: 100, nullable: true })
  alturaMetros: string;

  // Valores monetarios con decorator (sigue siendo string internamente)
  @MoneyColumn()
  precio: number;  // En TS es number, en DB es VARCHAR(20)

  @MoneyColumn({ nullable: true })
  precioCosto?: number;

  // Fechas de negocio como string
  @Column({ name: 'fecha_compra', type: 'varchar', length: 100, nullable: true })
  fechaCompra: string;  // Formato "YYYY-MM-DD"

  // Auditoría ya viene de BaseEntity (DATETIME)
  // created_at, updated_at, deleted_at, created_by, updated_by, deleted_by
}
```

## Backend - DTO

### Template Completo

```typescript
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateEquipamientoDto {
  // FKs como number con @IsNumber()
  @IsNumber()
  tipoId: number;

  // Strings
  @IsString()
  nombre: string;

  // Valores como string con @IsString()
  @IsOptional()
  @IsString()
  anio?: string;

  @IsOptional()
  @IsString()
  kilometraje?: string;

  @IsOptional()
  @IsString()
  capacidadKg?: string;

  @IsOptional()
  @IsString()
  alturaMetros?: string;

  // Valores monetarios como number (si usan @MoneyColumn)
  @IsOptional()
  @IsNumber()
  precio?: number;

  @IsOptional()
  @IsNumber()
  precioCosto?: number;

  // Fechas de negocio como string
  @IsOptional()
  @IsString()
  fechaCompra?: string;  // "YYYY-MM-DD"
}
```

## Frontend - Types

### Template Completo

```typescript
export type Equipamiento = {
  // IDs y FKs como number
  id?: number;
  tipoId?: number;

  // Strings
  nombre: string;
  descripcion?: string;

  // Valores como string
  anio?: string;
  kilometraje?: string;
  capacidadKg?: string;
  alturaMetros?: string;

  // Valores monetarios como number (si usan InputMoney)
  precio?: number;
  precioCosto?: number;

  // Fechas de negocio como string
  fechaCompra?: string;  // "YYYY-MM-DD"

  // Auditoría
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}
```

## Frontend - Form Schema (Zod)

### Template Completo

```typescript
import { z } from 'zod';

const formSchema = z.object({
  // IDs y FKs como number
  id: z.number().optional(),
  tipoId: z.number().optional(),

  // Strings
  nombre: z.string().min(1),
  descripcion: z.string().optional(),

  // Valores como string
  anio: z.string().optional(),
  kilometraje: z.string().optional(),
  capacidadKg: z.string().optional(),
  alturaMetros: z.string().optional(),

  // Valores monetarios como number (si usan InputMoney)
  precio: z.number().optional(),
  precioCosto: z.number().optional(),

  // Fechas de negocio como string
  fechaCompra: z.string().optional(),
});
```

## Frontend - Formulario

### Template Inputs

```typescript
// FK con selector
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

// Valor numérico (string)
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

// Valor monetario (number con InputMoney)
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
    </FormMessage>
    </FormItem>
  )}
/>

// Fecha de negocio (string)
<FormField
  control={form.control}
  name="fechaCompra"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Fecha de Compra</FormLabel>
      <Input placeholder="YYYY-MM-DD" type="text" {...field} />
      <FormMessage />
    </FormItem>
  )}
/>
```

## Ventajas de VARCHAR para Valores

1. **Flexibilidad**: Almacenar "1,234.56", "N/A", "aprox. 100", "pendiente"
2. **Sin pérdida de precisión**: No hay problemas de redondeo de decimales
3. **Compatibilidad**: Fácil de exportar/importar en diferentes formatos
4. **Simplicidad**: No hay conversiones de tipo complejas
5. **Extensibilidad**: Permite agregar unidades ("100 km", "5.5 toneladas")
6. **Validación flexible**: Aceptar rangos ("100-150"), aproximaciones, etc.

## Excepciones

### ❌ NO usar VARCHAR para:

1. **IDs**: Siempre `INT` con AUTO_INCREMENT
2. **Claves foráneas**: Siempre `INT`
3. **Campos de auditoría**: `created_at`, `updated_at`, `deleted_at` usan `DATETIME(6)`
4. **Booleanos de sistema**: Flags técnicos pueden usar `TINYINT` (0/1)

## Anti-patrones

```typescript
// ❌ NO - DECIMAL para valores
@Column({ type: 'decimal', precision: 10, scale: 2 })
precio: number;

// ✅ SÍ - VARCHAR para valores
@Column({ type: 'varchar', length: 100 })
precio: string;

// ❌ NO - INT para año
@Column({ type: 'int' })
anio: number;

// ✅ SÍ - VARCHAR para año
@Column({ type: 'varchar', length: 100 })
anio: string;

// ❌ NO - VARCHAR para ID
@Column({ type: 'varchar', length: 100 })
id: string;

// ✅ SÍ - INT para ID
@PrimaryGeneratedColumn()
id: number;

// ❌ NO - VARCHAR para FK
@Column({ type: 'varchar', length: 100 })
tipoId: string;

// ✅ SÍ - INT para FK
@Column({ type: 'int' })
tipoId: number;

// ❌ NO - InputNumber para valores
<InputNumber {...field} />

// ✅ SÍ - Input text para valores
<Input type="text" {...field} />
```

## Checklist

### Al agregar campo nuevo:
- [ ] ¿Es ID o FK? → `INT`, `number`, `@IsNumber()`, `z.number()`
- [ ] ¿Es created_at/updated_at/deleted_at? → `DATETIME(6)` (viene de BaseEntity)
- [ ] ¿Es cualquier otro valor? → `VARCHAR(100)`, `string`, `@IsString()`, `z.string()`, `<Input type="text">`
- [ ] Verificar tipo en entity TypeORM
- [ ] Verificar validación en DTO
- [ ] Verificar tipo en frontend types
- [ ] Verificar schema Zod
- [ ] Verificar input en formulario

## Resumen

| Aspecto | ID/FK | Valores | Auditoría |
|---------|-------|---------|-----------|
| SQL | `INT` | `VARCHAR(100)` | `DATETIME(6)` |
| Entity TS | `number` | `string` | `Date` (automático) |
| DTO | `@IsNumber()` | `@IsString()` | N/A |
| Frontend Type | `number` | `string` | `string` |
| Zod | `z.number()` | `z.string()` | N/A |
| Input | Selector | `<Input type="text">` | N/A |

**Excepciones:**
- Monetarios: VARCHAR(20) en DB, number en TS (con @MoneyColumn), InputMoney en formulario
- Fechas negocio: VARCHAR(100) formato "YYYY-MM-DD"
