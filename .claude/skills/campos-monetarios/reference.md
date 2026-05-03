# Referencia Técnica - Campos Monetarios

Documentación completa del sistema de campos monetarios con `@MoneyColumn()`.

## Decorator @MoneyColumn

### Uso Básico

```typescript
import { MoneyColumn } from "@/common/decorators/money-column.decorator";

@Entity("producto")
export class Producto extends BaseEntity {
  @MoneyColumn()
  precio: number;  // ✅ Tipo number en TS, VARCHAR(20) en BD

  @MoneyColumn({ name: "precio_total" })
  precioTotal: number;

  @MoneyColumn({ nullable: true })
  descuento?: number;
}
```

### Opciones Disponibles

```typescript
@MoneyColumn({
  name: "campo_bd",      // Nombre en base de datos (snake_case)
  nullable: true,        // Permite NULL
  default: 0,            // Valor por defecto
})
```

### Características

- **Base de datos:** `VARCHAR(20)` almacena `"1234.50"`
- **TypeScript:** `number` usa `1234.50`
- **Transformer:** Bidireccional automático
- **Precisión:** Exactamente 2 decimales
- **Formato BD:** Siempre punto decimal

## Transformer Interno

El decorator incluye un transformer que:

```typescript
{
  // Al guardar en BD
  to: (value: number) => {
    if (value == null) return null;
    return value.toFixed(2);  // "1234.50"
  },

  // Al leer de BD
  from: (value: string) => {
    if (value == null) return null;
    return parseFloat(value);  // 1234.50
  }
}
```

## Backend - Validación DTO

### DTO Básico

```typescript
import { IsNumber, IsOptional } from 'class-validator';

export class CreateProductoDto {
  @IsNumber()  // ✅ number, NO string
  precio: number;

  @IsOptional()
  @IsNumber()
  descuento?: number;

  @IsOptional()
  @IsNumber()
  precioTotal?: number;
}
```

### DTO con Validación de Rango

```typescript
import { IsNumber, Min, Max } from 'class-validator';

export class CreateProductoDto {
  @IsNumber()
  @Min(0)  // No negativo
  precio: number;

  @IsNumber()
  @Min(0)
  @Max(100)  // Descuento entre 0 y 100%
  descuentoPorcentaje?: number;
}
```

## Helpers de Cálculo

Ubicación: `packages/api/src/helpers/currency.ts`

### formatCurrency

Convierte number a string con 2 decimales:

```typescript
import { formatCurrency } from '@/helpers/currency';

formatCurrency(1234.5);      // "1234.50"
formatCurrency(1234.567);    // "1234.57" (redondea)
formatCurrency(0);           // "0.00"
formatCurrency(null);        // "0.00"
```

### sumCurrency

Suma múltiples valores con precisión:

```typescript
import { sumCurrency } from '@/helpers/currency';

sumCurrency(10.1, 20.2, 30.3);  // 60.60
sumCurrency(0.1, 0.2);           // 0.30 (no 0.30000000000000004)
sumCurrency(100, 200, 300);      // 600.00
```

### multiplyCurrency

Multiplica con precisión:

```typescript
import { multiplyCurrency } from '@/helpers/currency';

multiplyCurrency(10.5, 3);      // 31.50
multiplyCurrency(0.1, 0.2);     // 0.02
multiplyCurrency(100, 1.5);     // 150.00
```

### divideCurrency

Divide con precisión:

```typescript
import { divideCurrency } from '@/helpers/currency';

divideCurrency(100, 3);         // 33.33
divideCurrency(10, 4);          // 2.50
divideCurrency(0, 5);           // 0.00
```

### percentageOf

Calcula porcentaje de un valor:

```typescript
import { percentageOf } from '@/helpers/currency';

percentageOf(100, 21);          // 21.00 (IVA 21%)
percentageOf(1000, 10);         // 100.00 (10% de 1000)
percentageOf(50, 15.5);         // 7.75
```

### isValidCurrency

Valida que tenga máximo 2 decimales:

```typescript
import { isValidCurrency } from '@/helpers/currency';

isValidCurrency(1234.50);       // true
isValidCurrency(1234.5);        // true
isValidCurrency(1234.567);      // false (más de 2 decimales)
isValidCurrency(1234);          // true
```

## Ejemplo Completo - Servicio

```typescript
import {
  sumCurrency,
  multiplyCurrency,
  percentageOf,
} from '@/helpers/currency';

@Injectable()
export class CompraService {
  async crear(dto: CrearCompraDto) {
    // Calcular subtotal por items
    const subtotal = dto.items.reduce((sum, item) => {
      // Precio × Cantidad
      const itemTotal = multiplyCurrency(item.cantidad, item.precioUnitario);

      // Descuento si existe
      const itemDescuento = item.descuento
        ? percentageOf(itemTotal, item.descuento)
        : 0;

      // Sumar al total
      return sumCurrency(sum, itemTotal - itemDescuento);
    }, 0);

    // Calcular IVA (21%)
    const iva = percentageOf(subtotal, 21);

    // Calcular descuento global
    const descuentoGlobal = dto.descuentoPorcentaje
      ? percentageOf(subtotal, dto.descuentoPorcentaje)
      : 0;

    // Total final
    const total = sumCurrency(
      subtotal,
      iva,
      -descuentoGlobal  // Restar descuento
    );

    return await this.compraRepository.save({
      ...dto,
      subtotal,
      iva,
      descuentoGlobal,
      total,
    });
  }
}
```

## Frontend - Schema Zod

```typescript
import { z } from 'zod';

const formSchema = z.object({
  id: z.number().optional(),
  precio: z.number().optional(),  // ✅ number
  descuento: z.number().optional(),
  precioTotal: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;
```

## Frontend - defaultValues

```typescript
const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    id: data?.id,
    precio: data?.precio,        // ✅ number directo
    descuento: data?.descuento,
    precioTotal: data?.precioTotal,
  },
});
```

## Frontend - InputMoney Component

### Uso Básico

```typescript
import { InputMoney } from "@/components/input-money";

<FormField
  control={form.control}
  name="precio"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Precio</FormLabel>
      <FormControl>
        <InputMoney
          value={field.value}
          onChange={(value) => field.onChange(value)}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Características InputMoney

- **Prefijo:** `$` automático
- **Visual:** `1.234,56` (punto miles, coma decimales)
- **Envía:** `1234.56` (punto decimal para backend)
- **Negativos:** Acepta signo `-` al inicio
- **Validación:** Solo números, punto y coma
- **Precisión:** Máximo 2 decimales

### Props InputMoney

```typescript
interface InputMoneyProps {
  value?: number;                    // Valor actual
  onChange: (value: number) => void; // Callback al cambiar
  placeholder?: string;              // Placeholder (default: "0.00")
  disabled?: boolean;                // Deshabilitar input
  className?: string;                // Clases adicionales
}
```

## Migración SQL

### Crear Tabla

```sql
CREATE TABLE `producto` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `precio` VARCHAR(20) NOT NULL,      -- ✅ VARCHAR(20)
  `precio_costo` VARCHAR(20) NOT NULL,
  `descuento` VARCHAR(20) NULL,
  `precio_total` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`)
);
```

### Migrar de DECIMAL a VARCHAR

```sql
-- Paso 1: Agregar columna temporal
ALTER TABLE `producto`
ADD COLUMN `precio_temp` VARCHAR(20) NULL AFTER `precio`;

-- Paso 2: Copiar datos convertidos
UPDATE `producto`
SET `precio_temp` = CAST(`precio` AS CHAR);

-- Paso 3: Eliminar columna vieja
ALTER TABLE `producto`
DROP COLUMN `precio`;

-- Paso 4: Renombrar columna nueva
ALTER TABLE `producto`
CHANGE `precio_temp` `precio` VARCHAR(20) NOT NULL;
```

## Anti-patrones

### ❌ Usar DECIMAL

```typescript
// INCORRECTO
@Column({ type: 'decimal', precision: 10, scale: 2 })
precio: number;

// CORRECTO
@MoneyColumn()
precio: number;
```

### ❌ Operadores Directos

```typescript
// INCORRECTO - Problemas de precisión
const total = precio1 + precio2 + precio3;
const subtotal = cantidad * precioUnitario;
const iva = subtotal * 0.21;

// CORRECTO
const total = sumCurrency(precio1, precio2, precio3);
const subtotal = multiplyCurrency(cantidad, precioUnitario);
const iva = percentageOf(subtotal, 21);
```

### ❌ toFixed() para Formatear

```typescript
// INCORRECTO
const formatted = precio.toFixed(2);  // Inconsistente

// CORRECTO
const formatted = formatCurrency(precio);
```

### ❌ Validación String

```typescript
// INCORRECTO
export class CreateProductoDto {
  @IsString()  // ❌
  precio: string;
}

// CORRECTO
export class CreateProductoDto {
  @IsNumber()  // ✅
  precio: number;
}
```

### ❌ Schema String

```typescript
// INCORRECTO
const formSchema = z.object({
  precio: z.string().optional(),  // ❌
});

// CORRECTO
const formSchema = z.object({
  precio: z.number().optional(),  // ✅
});
```

## Checklist de Implementación

### Backend - Entidad
- [ ] Import `@MoneyColumn` desde `@/common/decorators/money-column.decorator`
- [ ] Usar `@MoneyColumn()` en campo monetario
- [ ] Tipo TypeScript: `number`
- [ ] Opcional: `nullable: true` si permite NULL

### Backend - DTO
- [ ] Import `@IsNumber` de `class-validator`
- [ ] Usar `@IsNumber()` (NO `@IsString()`)
- [ ] Tipo: `number`

### Backend - Servicio
- [ ] Import helpers desde `@/helpers/currency`
- [ ] Usar `sumCurrency` para sumar
- [ ] Usar `multiplyCurrency` para multiplicar
- [ ] Usar `percentageOf` para porcentajes
- [ ] NO usar operadores directos

### Frontend - Schema
- [ ] Zod: `z.number().optional()`
- [ ] defaultValues: número directo (NO string)

### Frontend - Formulario
- [ ] Import `<InputMoney>` desde `@/components/input-money`
- [ ] Usar en FormField con `field.value` y `field.onChange`
- [ ] NO usar `<Input type="number">`

### Migración SQL
- [ ] Columnas tipo `VARCHAR(20)`
- [ ] NO usar `DECIMAL`, `FLOAT`, `DOUBLE`

## Tabla Resumen

| Aspecto | Backend | Frontend |
|---------|---------|----------|
| Decorator | `@MoneyColumn()` | - |
| Tipo TS | `number` | `number` |
| Tipo BD | `VARCHAR(20)` | - |
| Validación | `@IsNumber()` | `z.number()` |
| Input | - | `<InputMoney>` |
| Cálculos | Helpers `currency` | - |
| Formato BD | `"1234.50"` | - |
| Formato Visual | - | `$1.234,56` |
| Precisión | 2 decimales | 2 decimales |

## Helpers Disponibles (Resumen)

| Helper | Params | Return | Ejemplo |
|--------|--------|--------|---------|
| `formatCurrency(n)` | `number` | `string` | `"1234.50"` |
| `sumCurrency(...n)` | `...number[]` | `number` | `60.60` |
| `multiplyCurrency(a, b)` | `number, number` | `number` | `31.50` |
| `divideCurrency(a, b)` | `number, number` | `number` | `33.33` |
| `percentageOf(val, %)` | `number, number` | `number` | `21.00` |
| `isValidCurrency(n)` | `number` | `boolean` | `true` |
