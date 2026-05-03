# Ejemplos - Campos Monetarios

Casos de uso reales del sistema de campos monetarios.

## Ejemplo 1: Producto con Precio y Descuento

### Backend - Entidad

```typescript
// producto.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '@/common/base.entity';
import { MoneyColumn } from '@/common/decorators/money-column.decorator';

@Entity('producto')
export class Producto extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @MoneyColumn()
  precio: number;  // Precio de venta

  @MoneyColumn({ name: 'precio_costo' })
  precioCosto: number;  // Precio de costo

  @MoneyColumn({ nullable: true })
  descuento?: number;  // Descuento en monto fijo
}
```

### Backend - DTO

```typescript
// create-producto.dto.ts
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  nombre: string;

  @IsNumber()
  precio: number;  // ✅ number, NO string

  @IsNumber()
  precioCosto: number;

  @IsOptional()
  @IsNumber()
  descuento?: number;
}
```

### Frontend - Form

```typescript
// producto-form.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InputMoney } from "@/components/input-money";

const formSchema = z.object({
  nombre: z.string().min(1),
  precio: z.number().optional(),         // ✅ number
  precioCosto: z.number().optional(),
  descuento: z.number().optional(),
});

export default function ProductoForm({ data }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: data?.nombre || "",
      precio: data?.precio,              // ✅ number directo
      precioCosto: data?.precioCosto,
      descuento: data?.descuento,
    },
  });

  return (
    <form>
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

      <FormField
        control={form.control}
        name="precioCosto"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Precio de Costo</FormLabel>
            <InputMoney
              value={field.value}
              onChange={(value) => field.onChange(value)}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="descuento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descuento</FormLabel>
            <InputMoney
              value={field.value}
              onChange={(value) => field.onChange(value)}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </form>
  );
}
```

## Ejemplo 2: Factura con Cálculos Complejos

### Backend - Entidad

```typescript
// factura.entity.ts
@Entity('factura')
export class Factura extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @MoneyColumn()
  subtotal: number;

  @MoneyColumn({ name: 'descuento_global' })
  descuentoGlobal: number;

  @MoneyColumn()
  iva: number;

  @MoneyColumn()
  total: number;
}
```

### Backend - Servicio con Cálculos

```typescript
// factura.service.ts
import {
  sumCurrency,
  multiplyCurrency,
  percentageOf,
} from '@/helpers/currency';

@Injectable()
export class FacturaService {
  async crear(dto: CrearFacturaDto) {
    // Calcular subtotal de todos los items
    const subtotal = dto.items.reduce((sum, item) => {
      // Precio unitario × Cantidad
      const itemTotal = multiplyCurrency(item.precioUnitario, item.cantidad);

      // Aplicar descuento del item si existe
      const itemDescuento = item.descuentoPorcentaje
        ? percentageOf(itemTotal, item.descuentoPorcentaje)
        : 0;

      // Acumular al subtotal
      return sumCurrency(sum, itemTotal - itemDescuento);
    }, 0);

    // Aplicar descuento global
    const descuentoGlobal = dto.descuentoGlobalPorcentaje
      ? percentageOf(subtotal, dto.descuentoGlobalPorcentaje)
      : 0;

    // Calcular base imponible
    const baseImponible = subtotal - descuentoGlobal;

    // Calcular IVA (21%)
    const iva = percentageOf(baseImponible, 21);

    // Total final
    const total = sumCurrency(baseImponible, iva);

    return await this.facturaRepository.save({
      ...dto,
      subtotal,
      descuentoGlobal,
      iva,
      total,
    });
  }

  async calcularMargenBeneficio(facturaId: number) {
    const factura = await this.findOne(facturaId);

    // Obtener costo total de los items
    const costoTotal = factura.items.reduce((sum, item) => {
      const itemCosto = multiplyCurrency(item.precioCosto, item.cantidad);
      return sumCurrency(sum, itemCosto);
    }, 0);

    // Calcular margen
    const margen = factura.total - costoTotal;

    // Calcular porcentaje de margen
    const porcentajeMargen = (margen / factura.total) * 100;

    return {
      costoTotal,
      margen,
      porcentajeMargen: porcentajeMargen.toFixed(2),
    };
  }
}
```

## Ejemplo 3: Presupuesto con Items

### Backend - Entidad Item

```typescript
// presupuesto-item.entity.ts
@Entity('presupuesto_item')
export class PresupuestoItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'presupuesto_id' })
  presupuestoId: number;

  @Column({ type: 'varchar', length: 255 })
  descripcion: string;

  @Column({ type: 'varchar', length: 100 })
  cantidad: string;  // VARCHAR según convención

  @MoneyColumn({ name: 'precio_unitario' })
  precioUnitario: number;

  @MoneyColumn()
  subtotal: number;

  @MoneyColumn({ nullable: true })
  descuento?: number;

  @MoneyColumn()
  total: number;
}
```

### Backend - Cálculo de Items

```typescript
// presupuesto.service.ts
import { multiplyCurrency, sumCurrency } from '@/helpers/currency';

async crearConItems(dto: CrearPresupuestoDto) {
  // Crear presupuesto
  const presupuesto = await this.presupuestoRepository.save({
    clienteId: dto.clienteId,
    fecha: dto.fecha,
  });

  // Crear items con cálculos
  const items = dto.items.map((item) => {
    const cantidad = parseFloat(item.cantidad);

    // Subtotal = Cantidad × Precio Unitario
    const subtotal = multiplyCurrency(cantidad, item.precioUnitario);

    // Total = Subtotal - Descuento
    const total = subtotal - (item.descuento || 0);

    return {
      presupuestoId: presupuesto.id,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal,
      descuento: item.descuento,
      total,
    };
  });

  await this.itemRepository.save(items);

  // Calcular totales del presupuesto
  const totalPresupuesto = items.reduce((sum, item) => {
    return sumCurrency(sum, item.total);
  }, 0);

  // Actualizar presupuesto con total
  await this.presupuestoRepository.update(presupuesto.id, {
    total: totalPresupuesto,
  });

  return this.findOne(presupuesto.id);
}
```

## Ejemplo 4: Migración SQL

### Crear Tabla desde Cero

```sql
-- Crear tabla con campos monetarios
CREATE TABLE `factura` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cliente_id` INT NOT NULL,
  `fecha` VARCHAR(100) NOT NULL,
  `subtotal` VARCHAR(20) NOT NULL,         -- ✅ VARCHAR(20)
  `descuento_global` VARCHAR(20) NOT NULL,
  `iva` VARCHAR(20) NOT NULL,
  `total` VARCHAR(20) NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_factura_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`)
);
```

### Migrar Columna Existente

```sql
-- Si ya existe como DECIMAL, migrar a VARCHAR
ALTER TABLE `producto`
ADD COLUMN `precio_new` VARCHAR(20) NULL AFTER `precio`;

UPDATE `producto`
SET `precio_new` = CAST(`precio` AS CHAR);

ALTER TABLE `producto`
DROP COLUMN `precio`;

ALTER TABLE `producto`
CHANGE `precio_new` `precio` VARCHAR(20) NOT NULL;
```

## Comparación: ❌ Incorrecto vs ✅ Correcto

### Entidad

```typescript
// ❌ INCORRECTO
@Column({ type: 'decimal', precision: 10, scale: 2 })
precio: number;

@Column({ type: 'float' })
total: number;

// ✅ CORRECTO
@MoneyColumn()
precio: number;

@MoneyColumn()
total: number;
```

### DTO

```typescript
// ❌ INCORRECTO
@IsString()
precio: string;

// ✅ CORRECTO
@IsNumber()
precio: number;
```

### Cálculos

```typescript
// ❌ INCORRECTO - Problemas de precisión
const total = precio1 + precio2;
const subtotal = cantidad * precioUnitario;
const iva = subtotal * 0.21;
const formatted = precio.toFixed(2);

// ✅ CORRECTO
const total = sumCurrency(precio1, precio2);
const subtotal = multiplyCurrency(cantidad, precioUnitario);
const iva = percentageOf(subtotal, 21);
const formatted = formatCurrency(precio);
```

### Frontend Schema

```typescript
// ❌ INCORRECTO
const formSchema = z.object({
  precio: z.string().optional(),
});

// ✅ CORRECTO
const formSchema = z.object({
  precio: z.number().optional(),
});
```

### Frontend defaultValues

```typescript
// ❌ INCORRECTO
defaultValues: {
  precio: data?.precio?.toString() || "0",  // String
}

// ✅ CORRECTO
defaultValues: {
  precio: data?.precio,  // Number directo
}
```

### Frontend Input

```typescript
// ❌ INCORRECTO
<Input
  type="number"
  step="0.01"
  {...field}
/>

// ✅ CORRECTO
<InputMoney
  value={field.value}
  onChange={(value) => field.onChange(value)}
/>
```

## Caso de Uso Completo: Compra con Items

### Backend

```typescript
// compra.service.ts
import {
  sumCurrency,
  multiplyCurrency,
  percentageOf,
} from '@/helpers/currency';

@Injectable()
export class CompraService {
  async crear(dto: CrearCompraDto) {
    // 1. Calcular subtotal de items
    const subtotalItems = dto.items.reduce((sum, item) => {
      const cantidad = parseFloat(item.cantidad);
      const itemSubtotal = multiplyCurrency(cantidad, item.precioUnitario);
      return sumCurrency(sum, itemSubtotal);
    }, 0);

    // 2. Aplicar descuento si existe
    const descuento = dto.descuentoPorcentaje
      ? percentageOf(subtotalItems, dto.descuentoPorcentaje)
      : 0;

    const subtotal = subtotalItems - descuento;

    // 3. Calcular IVA
    const iva = percentageOf(subtotal, 21);

    // 4. Total
    const total = sumCurrency(subtotal, iva);

    // 5. Guardar
    const compra = await this.compraRepository.save({
      proveedorId: dto.proveedorId,
      fecha: dto.fecha,
      subtotal,
      descuento,
      iva,
      total,
    });

    // 6. Guardar items
    const items = dto.items.map((item) => ({
      compraId: compra.id,
      productoId: item.productoId,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: multiplyCurrency(
        parseFloat(item.cantidad),
        item.precioUnitario
      ),
    }));

    await this.itemRepository.save(items);

    return this.findOne(compra.id);
  }
}
```

### Frontend

```typescript
// compra-form.tsx
const formSchema = z.object({
  proveedorId: z.number(),
  descuentoPorcentaje: z.number().optional(),
  items: z.array(z.object({
    productoId: z.number(),
    cantidad: z.string(),
    precioUnitario: z.number(),  // ✅ number
  })),
});

export default function CompraForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proveedorId: undefined,
      descuentoPorcentaje: 0,
      items: [],
    },
  });

  return (
    <form>
      {/* ... otros campos ... */}

      {fields.map((field, index) => (
        <div key={field.id}>
          <FormField
            control={form.control}
            name={`items.${index}.precioUnitario`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio Unitario</FormLabel>
                <InputMoney
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </form>
  );
}
```

## Checklist por Ejemplo

### Backend - Entidad
- [ ] Import `@MoneyColumn` desde decorator
- [ ] Usar `@MoneyColumn()` (no `@Column`)
- [ ] Tipo: `number`
- [ ] Opcional: `nullable: true`

### Backend - DTO
- [ ] Import `@IsNumber`
- [ ] Usar `@IsNumber()` (no `@IsString()`)
- [ ] Tipo: `number`

### Backend - Servicio
- [ ] Import helpers de currency
- [ ] Usar `sumCurrency` para sumas
- [ ] Usar `multiplyCurrency` para multiplicaciones
- [ ] Usar `percentageOf` para porcentajes
- [ ] NO usar operadores (`+`, `-`, `*`, `/`)

### Frontend - Schema
- [ ] `z.number().optional()`
- [ ] NO `z.string()`

### Frontend - Form
- [ ] defaultValues: número directo
- [ ] Usar `<InputMoney>`
- [ ] NO `<Input type="number">`

### SQL
- [ ] Columnas: `VARCHAR(20)`
- [ ] NO `DECIMAL`, `FLOAT`, `DOUBLE`
