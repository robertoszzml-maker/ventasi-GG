# Campos Monetarios

Usar `@MoneyColumn()` para todos los campos monetarios.

## Patrón

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

**Características:**
- BD: `VARCHAR(20)` almacena `"1234.50"`
- TS: `number` usa `1234.50`
- Transformer automático bidireccional
- Precisión: 2 decimales fijos

## Validación DTO

```typescript
export class CreateProductoDto {
  @IsNumber()  // ✅ number, no string
  precio: number;

  @IsOptional()
  @IsNumber()
  descuento?: number;
}
```

## Helpers de Cálculo

```typescript
import { sumCurrency, multiplyCurrency, divideCurrency, percentageOf } from '@/helpers/currency';

// Sumar
const total = sumCurrency(precio1, precio2, precio3);

// Multiplicar (cantidad × precio)
const subtotal = multiplyCurrency(cantidad, precioUnitario);

// Calcular IVA (21%)
const iva = percentageOf(subtotal, 21);

// Dividir
const promedio = divideCurrency(total, cantidad);

// Formatear para display
const formatted = formatCurrency(precio);  // "1234.50"
```

**⚠️ NO usar operadores directos** (`+`, `-`, `*`, `/`, `.toFixed()`)

## Frontend

### InputMoney Component

```typescript
import { InputMoney } from "@/components/input-money"

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

**Schema:** `precio: z.number().optional()`
**defaultValues:** `precio: data?.precio` (number directo)

### Características InputMoney

- Prefijo `$` automático
- Visual: `1.234,56` (punto miles, coma decimales)
- Envía: `1234.56` (punto decimal para backend)
- Acepta negativos (signo `-` al inicio)

## Ejemplo Servicio

```typescript
async crear(dto: CrearCompraDto) {
  // Calcular subtotal
  const subtotal = dto.items.reduce((sum, item) => {
    const itemTotal = multiplyCurrency(item.cantidad, item.precioUnitario);
    const itemDescuento = item.descuento
      ? percentageOf(itemTotal, item.descuento)
      : 0;
    return sumCurrency(sum, itemTotal - itemDescuento);
  }, 0);

  // Calcular IVA
  const iva = percentageOf(subtotal, 21);

  // Total
  const total = sumCurrency(subtotal, iva);

  return await this.compraRepository.save({
    ...dto,
    subtotal,
    iva,
    total,
  });
}
```

## Migración SQL

```sql
CREATE TABLE `producto` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `precio` VARCHAR(20) NOT NULL,  -- ✅ VARCHAR(20)
  `precio_costo` VARCHAR(20) NOT NULL,
  `descuento` VARCHAR(20) NULL,
  PRIMARY KEY (`id`)
);
```

**❌ NO usar:** `DECIMAL`, `FLOAT`, `DOUBLE`

## Anti-patrones

```typescript
// ❌ NO
@Column({ type: 'decimal', precision: 10, scale: 2 })
precio: number;

const total = precio1 + precio2;  // Problemas precisión
const formatted = precio.toFixed(2);  // Inconsistente

@IsString()  // Tipo incorrecto
precio: string;

// ✅ SÍ
@MoneyColumn()
precio: number;

const total = sumCurrency(precio1, precio2);
const formatted = formatCurrency(precio);

@IsNumber()
precio: number;
```

## Helpers Disponibles

| Helper | Uso |
|--------|-----|
| `formatCurrency(n)` | number → string "1234.50" |
| `sumCurrency(...n)` | Sumar con precisión |
| `multiplyCurrency(a, b)` | Multiplicar |
| `divideCurrency(a, b)` | Dividir |
| `percentageOf(value, %)` | Calcular porcentaje |
| `isValidCurrency(n)` | Validar máx 2 decimales |

## Resumen

| Aspecto | Valor |
|---------|-------|
| Decorator | `@MoneyColumn()` |
| Tipo BD | `VARCHAR(20)` |
| Tipo TS | `number` |
| Almacenado | `"1234.50"` (string) |
| En código | `1234.50` (number) |
| Precisión | 2 decimales |
| Operaciones | Usar helpers `@/helpers/currency` |
| Input | `<InputMoney>` |
| Validación | `@IsNumber()` |
