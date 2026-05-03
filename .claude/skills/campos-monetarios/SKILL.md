---
name: campos-monetarios
description: Gestión de campos monetarios con @MoneyColumn y helpers de precisión
license: MIT
---

# Campos Monetarios

Sistema para manejar campos monetarios con precisión decimal usando `@MoneyColumn()` y helpers especializados.

## Input

- `<entidad>`: Nombre de la entidad (ej: `producto`, `compra`, `factura`)
- `<campo>`: Nombre del campo monetario (ej: `precio`, `total`, `descuento`)

**Ejemplo:** `/campos-monetarios producto precio`

## Steps

1. **Backend - Entidad**
   - Usar decorator `@MoneyColumn()` en lugar de `@Column`
   - Tipo TypeScript: `number`
   - Base de datos: `VARCHAR(20)`
   - Precision: 2 decimales fijos

2. **Backend - DTO**
   - Validar con `@IsNumber()` (NO `@IsString()`)
   - Tipo: `number`

3. **Backend - Cálculos**
   - Usar helpers de `@/helpers/currency`
   - NO usar operadores directos (`+`, `-`, `*`, `/`)

4. **Frontend - Schema**
   - Zod: `z.number().optional()`
   - defaultValues: número directo

5. **Frontend - Input**
   - Usar componente `<InputMoney>`
   - Formato visual: `$1.234,56`
   - Formato backend: `1234.56`

## Output

**Backend:**
```typescript
@MoneyColumn()
precio: number;  // TS: number, BD: VARCHAR(20) "1234.50"
```

**Frontend:**
```typescript
<InputMoney
  value={field.value}
  onChange={(value) => field.onChange(value)}
/>
```

## Recursos

- [📖 Referencia Técnica](reference.md) - Decorators, helpers y validación
- [💡 Ejemplos](examples.md) - Casos de uso completos
- [📋 Template](template.md) - Código listo para copiar

## Características del Sistema

| Aspecto | Valor |
|---------|-------|
| Decorator | `@MoneyColumn()` |
| Tipo BD | `VARCHAR(20)` |
| Tipo TS | `number` |
| Almacenado | `"1234.50"` (string en BD) |
| En código | `1234.50` (number en TS) |
| Precisión | 2 decimales fijos |
| Transformer | Bidireccional automático |

## Helpers Disponibles

| Helper | Uso |
|--------|-----|
| `formatCurrency(n)` | Formatear para display |
| `sumCurrency(...n)` | Sumar múltiples valores |
| `multiplyCurrency(a, b)` | Multiplicar con precisión |
| `divideCurrency(a, b)` | Dividir con precisión |
| `percentageOf(value, %)` | Calcular porcentaje |
| `isValidCurrency(n)` | Validar formato |

## Reglas Críticas

✅ **SÍ hacer:**
- Usar `@MoneyColumn()` para todos los campos monetarios
- Tipo `number` en TypeScript
- Helpers de `@/helpers/currency` para cálculos
- `<InputMoney>` en formularios frontend
- `@IsNumber()` en DTOs

❌ **NO hacer:**
- Usar `@Column({ type: 'decimal' })`
- Operadores directos (`+`, `-`, `*`, `/`)
- `.toFixed()` para formatear
- `@IsString()` en validación
- Tipo `string` en TypeScript

## Transformer Automático

El decorator `@MoneyColumn()` incluye un transformer que:
- **Al guardar:** Convierte `number` → `string` con 2 decimales
- **Al leer:** Convierte `string` → `number`
- **Precisión:** Garantiza 2 decimales siempre

## InputMoney Features

- Prefijo `$` automático
- Separador de miles (punto)
- Separador decimal (coma)
- Acepta valores negativos
- Conversión automática a formato backend

**Visual:** `$1.234,56`
**Backend:** `1234.56`

## Notes

- El transformer es bidireccional y automático
- VARCHAR evita problemas de precisión de DECIMAL/FLOAT
- Los helpers usan `Number.EPSILON` para cálculos precisos
- InputMoney maneja automáticamente la conversión de formato
- Todos los cálculos mantienen exactamente 2 decimales
