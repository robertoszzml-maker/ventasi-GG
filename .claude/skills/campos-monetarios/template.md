# Template - Campos Monetarios

Plantillas para implementar campos monetarios. Reemplazar placeholders según necesidad.

## Placeholders

- `[Entidad]` → Nombre en PascalCase (ej: `Producto`, `Factura`, `Compra`)
- `[entidad]` → Nombre en kebab-case (ej: `producto`, `factura`, `compra`)
- `[campo]` → Nombre del campo (ej: `precio`, `total`, `descuento`)
- `[campo_bd]` → Nombre en BD snake_case (ej: `precio`, `precio_total`, `descuento_global`)

---

## Template Backend - Entidad

```typescript
// [entidad].entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '@/common/base.entity';
import { MoneyColumn } from '@/common/decorators/money-column.decorator';

@Entity('[entidad]')
export class [Entidad] extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @MoneyColumn()
  [campo]: number;  // ✅ Tipo number en TS, VARCHAR(20) en BD

  @MoneyColumn({ name: '[campo_bd]' })
  [campoOtro]: number;

  @MoneyColumn({ nullable: true })
  [campoOpcional]?: number;
}
```

---

## Template Backend - DTO

```typescript
// create-[entidad].dto.ts
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class Create[Entidad]Dto {
  @IsString()
  nombre: string;

  @IsNumber()  // ✅ number, NO string
  [campo]: number;

  @IsOptional()
  @IsNumber()
  [campoOpcional]?: number;
}
```

---

## Template Backend - Servicio con Cálculos

```typescript
// [entidad].service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { [Entidad] } from './entities/[entidad].entity';
import {
  sumCurrency,
  multiplyCurrency,
  divideCurrency,
  percentageOf,
  formatCurrency,
} from '@/helpers/currency';

@Injectable()
export class [Entidad]Service {
  constructor(
    @InjectRepository([Entidad])
    private repository: Repository<[Entidad]>,
  ) {}

  async crear(dto: Create[Entidad]Dto) {
    // Ejemplo: Calcular subtotal de items
    const subtotal = dto.items.reduce((sum, item) => {
      const itemTotal = multiplyCurrency(item.cantidad, item.precioUnitario);
      return sumCurrency(sum, itemTotal);
    }, 0);

    // Calcular IVA (21%)
    const iva = percentageOf(subtotal, 21);

    // Calcular descuento si existe
    const descuento = dto.descuentoPorcentaje
      ? percentageOf(subtotal, dto.descuentoPorcentaje)
      : 0;

    // Total final
    const total = sumCurrency(subtotal, iva, -descuento);

    return await this.repository.save({
      ...dto,
      subtotal,
      iva,
      descuento,
      total,
    });
  }
}
```

---

## Template Frontend - Schema Zod

```typescript
// [entidad]-form.tsx
import { z } from 'zod';

const formSchema = z.object({
  id: z.number().optional(),
  nombre: z.string().min(1),
  [campo]: z.number().optional(),  // ✅ number
  [campoOpcional]: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;
```

---

## Template Frontend - Form defaultValues

```typescript
const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    id: data?.id,
    nombre: data?.nombre || "",
    [campo]: data?.[campo],              // ✅ number directo
    [campoOpcional]: data?.[campoOpcional],
  },
});
```

---

## Template Frontend - InputMoney

```typescript
import { InputMoney } from "@/components/input-money";

<FormField
  control={form.control}
  name="[campo]"
  render={({ field }) => (
    <FormItem>
      <FormLabel>[Label del Campo]</FormLabel>
      <FormControl>
        <InputMoney
          value={field.value}
          onChange={(value) => field.onChange(value)}
        />
      </FormControl>
      <FormDescription>
        [Descripción opcional]
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## Template SQL - Crear Tabla

```sql
CREATE TABLE `[entidad]` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `[campo_bd]` VARCHAR(20) NOT NULL,      -- ✅ VARCHAR(20)
  `[campo_bd_2]` VARCHAR(20) NOT NULL,
  `[campo_bd_opcional]` VARCHAR(20) NULL,
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

## Template SQL - Agregar Columna

```sql
ALTER TABLE `[entidad]`
ADD COLUMN `[campo_bd]` VARCHAR(20) NULL AFTER `[campo_anterior]`;
```

---

## Template SQL - Migrar de DECIMAL

```sql
-- Paso 1: Agregar columna temporal
ALTER TABLE `[entidad]`
ADD COLUMN `[campo_bd]_temp` VARCHAR(20) NULL AFTER `[campo_bd]`;

-- Paso 2: Copiar datos
UPDATE `[entidad]`
SET `[campo_bd]_temp` = CAST(`[campo_bd]` AS CHAR);

-- Paso 3: Eliminar columna vieja
ALTER TABLE `[entidad]`
DROP COLUMN `[campo_bd]`;

-- Paso 4: Renombrar
ALTER TABLE `[entidad]`
CHANGE `[campo_bd]_temp` `[campo_bd]` VARCHAR(20) NOT NULL;
```

---

## Ejemplo de Reemplazo

### Para Producto con Precio

```typescript
// Reemplazos:
[Entidad] → Producto
[entidad] → producto
[campo] → precio
[campo_bd] → precio

// Resultado Backend:
@Entity('producto')
export class Producto extends BaseEntity {
  @MoneyColumn()
  precio: number;
}

// Resultado Frontend:
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
    </FormItem>
  )}
/>
```

### Para Factura con Total

```typescript
// Reemplazos:
[Entidad] → Factura
[entidad] → factura
[campo] → total
[campo_bd] → total

// Resultado SQL:
CREATE TABLE `factura` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `total` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`)
);
```

---

## Checklist de Reemplazo

- [ ] Reemplazar `[Entidad]` con PascalCase
- [ ] Reemplazar `[entidad]` con kebab-case
- [ ] Reemplazar `[campo]` con nombre en camelCase
- [ ] Reemplazar `[campo_bd]` con nombre en snake_case
- [ ] Verificar imports de `@MoneyColumn`
- [ ] Verificar imports de helpers currency
- [ ] Verificar `@IsNumber()` en DTO
- [ ] Verificar `z.number()` en schema
- [ ] Verificar `<InputMoney>` en formulario
- [ ] Verificar `VARCHAR(20)` en SQL

---

## Template Completo - Producto

### Backend

```typescript
// producto.entity.ts
import { MoneyColumn } from "@/common/decorators/money-column.decorator";

@Entity('producto')
export class Producto extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @MoneyColumn()
  precio: number;

  @MoneyColumn({ name: 'precio_costo' })
  precioCosto: number;

  @MoneyColumn({ nullable: true })
  descuento?: number;
}

// create-producto.dto.ts
export class CreateProductoDto {
  @IsString()
  nombre: string;

  @IsNumber()
  precio: number;

  @IsNumber()
  precioCosto: number;

  @IsOptional()
  @IsNumber()
  descuento?: number;
}
```

### Frontend

```typescript
// producto-form.tsx
const formSchema = z.object({
  nombre: z.string().min(1),
  precio: z.number().optional(),
  precioCosto: z.number().optional(),
  descuento: z.number().optional(),
});

const form = useForm({
  defaultValues: {
    nombre: data?.nombre || "",
    precio: data?.precio,
    precioCosto: data?.precioCosto,
    descuento: data?.descuento,
  },
});

// En el render:
<FormField
  control={form.control}
  name="precio"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Precio de Venta</FormLabel>
      <InputMoney
        value={field.value}
        onChange={(value) => field.onChange(value)}
      />
      <FormMessage />
    </FormItem>
  )}
/>
```

### SQL

```sql
CREATE TABLE `producto` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `precio` VARCHAR(20) NOT NULL,
  `precio_costo` VARCHAR(20) NOT NULL,
  `descuento` VARCHAR(20) NULL,
  PRIMARY KEY (`id`)
);
```

---

## Helpers de Cálculo - Referencia Rápida

```typescript
// Sumar
const total = sumCurrency(valor1, valor2, valor3);

// Multiplicar
const subtotal = multiplyCurrency(cantidad, precio);

// Dividir
const promedio = divideCurrency(total, cantidad);

// Porcentaje
const iva = percentageOf(subtotal, 21);

// Formatear
const formatted = formatCurrency(precio);  // "1234.50"
```
