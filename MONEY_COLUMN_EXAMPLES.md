# Guía de Implementación: @MoneyColumn()

Este documento contiene ejemplos y guía completa para migrar campos monetarios al nuevo sistema con `@MoneyColumn()`.

## 📋 Índice

1. [¿Qué es @MoneyColumn()?](#qué-es-moneycolumn)
2. [Ejemplo Completo: Entidad Cobro](#ejemplo-completo-entidad-cobro)
3. [Cómo Migrar Otras Entidades](#cómo-migrar-otras-entidades)
4. [Lista de Campos a Migrar](#lista-de-campos-a-migrar)
5. [Migración SQL](#migración-sql)
6. [Helpers Disponibles](#helpers-disponibles)
7. [Testing](#testing)

---

## ¿Qué es @MoneyColumn()?

`@MoneyColumn()` es un decorator personalizado que automáticamente configura una columna de base de datos para almacenar valores monetarios con precisión de 2 decimales.

### Características

- **Base de datos**: Almacena como `VARCHAR(20)` con valor `"1234.50"`
- **TypeScript**: Trabaja como `number` con valor `1234.50`
- **Transformer automático**: Convierte entre string ↔ number transparentemente
- **Precisión**: Siempre 2 decimales fijos
- **Default**: `"0.00"`

### Ventajas

✅ **Precisión exacta** - No hay problemas de redondeo de punto flotante
✅ **Sintaxis simple** - `@MoneyColumn()` en lugar de múltiples opciones
✅ **Type-safe** - TypeScript sabe que es `number`
✅ **Consistente** - Todos los campos money usan la misma configuración
✅ **Transparente** - El código sigue trabajando con números normales

---

## Ejemplo Completo: Entidad Cobro

### ANTES (cobro.entity.ts)

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/base.entity';
import { Factura } from '@/modules/factura/entities/factura.entity';
import { MetodoPago } from '@/modules/metodo-pago/entities/metodo-pago.entity';

@Entity('cobro')
export class Cobro extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50, name: 'modelo' })
    modelo: string;

    @Column({ type: 'int', name: 'modelo_id' })
    modeloId: number;

    // ❌ ANTES: VARCHAR(255) trabajando como string
    @Column({ type: 'varchar', length: 255, name: 'monto' })
    monto: string;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'fecha' })
    fecha: string;

    // ... resto de campos
}
```

### DESPUÉS (cobro.entity.ts)

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/base.entity';
import { Factura } from '@/modules/factura/entities/factura.entity';
import { MetodoPago } from '@/modules/metodo-pago/entities/metodo-pago.entity';
import { MoneyColumn } from '@/common/decorators/money-column.decorator'; // ← NUEVO IMPORT

@Entity('cobro')
export class Cobro extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50, name: 'modelo' })
    modelo: string;

    @Column({ type: 'int', name: 'modelo_id' })
    modeloId: number;

    // ✅ DESPUÉS: @MoneyColumn() - VARCHAR(20) en DB, number en TypeScript
    @MoneyColumn({ name: 'monto' })
    monto: number;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'fecha' })
    fecha: string;

    // ... resto de campos
}
```

### Migración SQL (70.sql)

```sql
-- Convertir cobro.monto a VARCHAR(20)
ALTER TABLE cobro
  MODIFY COLUMN monto VARCHAR(20) NOT NULL DEFAULT '0.00';
```

### Uso en Servicios

```typescript
// El código sigue igual - trabaja con numbers
async create(createCobroDto: CreateCobroDto) {
  const cobro = new Cobro();
  cobro.monto = 1234.50; // ✅ Asignar como number
  await this.cobroRepository.save(cobro); // Se guarda como "1234.50" en DB
}

async findOne(id: number) {
  const cobro = await this.cobroRepository.findOne({ where: { id } });
  console.log(typeof cobro.monto); // "number"
  console.log(cobro.monto); // 1234.50

  // Operaciones matemáticas funcionan normalmente
  const total = cobro.monto * 2; // 2469.00
}
```

---

## Cómo Migrar Otras Entidades

### Pasos para migrar cualquier campo money

#### 1. Importar el decorator

```typescript
import { MoneyColumn } from '@/common/decorators/money-column.decorator';
```

#### 2. Reemplazar @Column por @MoneyColumn

**Ejemplos de migración:**

```typescript
// EJEMPLO 1: Campo básico
// ANTES
@Column({ type: 'decimal', precision: 18, scale: 2 })
total: number;

// DESPUÉS
@MoneyColumn()
total: number;

// ============================================

// EJEMPLO 2: Con nombre de columna custom
// ANTES
@Column({ type: 'decimal', precision: 20, scale: 2, name: 'venta_total' })
ventaTotal: number;

// DESPUÉS
@MoneyColumn({ name: 'venta_total' })
ventaTotal: number;

// ============================================

// EJEMPLO 3: Nullable
// ANTES
@Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
descuento?: number;

// DESPUÉS
@MoneyColumn({ nullable: true })
descuento?: number;

// ============================================

// EJEMPLO 4: Campo tipo INT (incorrecto)
// ANTES
@Column({ type: 'int', name: 'precio' })
precio: number;

// DESPUÉS
@MoneyColumn({ name: 'precio' })
precio: number;

// ============================================

// EJEMPLO 5: Con nombre custom + nullable
// ANTES
@Column({ type: 'decimal', precision: 18, scale: 2, name: 'precio_unitario', nullable: true })
precioUnitario?: number;

// DESPUÉS
@MoneyColumn({ name: 'precio_unitario', nullable: true })
precioUnitario?: number;
```

#### 3. Cambiar tipo de string a number (si aplica)

```typescript
// ANTES
@Column({ type: 'varchar', name: 'monto' })
monto: string; // ❌

// DESPUÉS
@MoneyColumn({ name: 'monto' })
monto: number; // ✅
```

#### 4. Crear migración SQL

```sql
-- Plantilla
ALTER TABLE <nombre_tabla>
  MODIFY COLUMN <nombre_columna> VARCHAR(20) NOT NULL DEFAULT '0.00';

-- Si es nullable
ALTER TABLE <nombre_tabla>
  MODIFY COLUMN <nombre_columna> VARCHAR(20) NULL DEFAULT '0.00';
```

---

## Lista de Campos a Migrar

### Entidades con campos monetarios detectados

A continuación, una lista de entidades que tienen campos de tipo money/currency que deben migrarse:

#### ✅ Ya migrado
- [x] `cobro.monto` - Migrado en 70.sql

#### ⬜ Pendientes de migrar

**Presupuesto:**
- [ ] `presupuesto.total` (DECIMAL 20,2)
- [ ] `presupuesto.venta_total` (DECIMAL 20,2)

**Cashflow:**
- [ ] `cashflow_transaccion.monto` (DECIMAL 18,2)

**Alquiler:**
- [ ] `alquiler.precio` (INT - ❌ incorrecto)
- [ ] `alquiler_precio.precio` (INT - ❌ incorrecto)
- [ ] `alquiler_recurso.[campo_precio]` (verificar)

**Oferta:**
- [ ] `oferta.total` (DECIMAL)
- [ ] `oferta_item.precio_unitario` (DECIMAL)
- [ ] `oferta_item.subtotal` (DECIMAL)

**Orden de Compra:**
- [ ] `orden_compra.total` (DECIMAL)
- [ ] `orden_compra_item.precio_unitario` (DECIMAL)
- [ ] `orden_compra_item.subtotal` (DECIMAL)

**Factura:**
- [ ] `factura.total` (DECIMAL)
- [ ] `factura.subtotal` (DECIMAL)
- [ ] `factura.impuestos` (DECIMAL)

**Presupuesto Items:**
- [ ] `presupuesto_item.precio_unitario` (DECIMAL)
- [ ] `presupuesto_item.total` (DECIMAL)
- [ ] `presupuesto_materiales.precio_unitario` (DECIMAL)
- [ ] `presupuesto_mano_de_obra.precio_unitario` (DECIMAL)
- [ ] `presupuesto_suministros.precio_unitario` (DECIMAL)

**Contrato Marco:**
- [ ] `contrato_marco.monto_total` (DECIMAL)
- [ ] `contrato_marco_talonario_item.precio` (DECIMAL)

**Banco:**
- [ ] `banco_saldo.saldo` (DECIMAL)

**Inventario/Reservas:**
- [ ] `movimiento_inventario.cantidad` (DECIMAL - verificar si debe ser money)
- [ ] `inventario_reserva.cantidad` (DECIMAL - verificar si debe ser money)
- [ ] `reserva_item.cantidad` (DECIMAL - verificar si debe ser money)

**Otros:**
- [ ] `indice.valor` (DECIMAL - verificar)

### Cómo usar esta lista

1. Elegir una entidad de la lista
2. Abrir el archivo `.entity.ts`
3. Seguir los pasos de migración
4. Marcar como [x] cuando esté completo

---

## Migración SQL

### Plantilla de migración

Crear archivo `packages/api/sql/[siguiente-numero].sql`:

```sql
-- Migración: Convertir campos money a VARCHAR(20)
-- Fecha: YYYY-MM-DD
-- Entidades: [listar entidades modificadas]

-- Entidad: Presupuesto
ALTER TABLE presupuesto
  MODIFY COLUMN total VARCHAR(20) NOT NULL DEFAULT '0.00',
  MODIFY COLUMN venta_total VARCHAR(20) NOT NULL DEFAULT '0.00';

-- Entidad: CashflowTransaccion
ALTER TABLE cashflow_transaccion
  MODIFY COLUMN monto VARCHAR(20) NOT NULL DEFAULT '0.00';

-- Entidad: Alquiler
ALTER TABLE alquiler
  MODIFY COLUMN precio VARCHAR(20) NULL DEFAULT '0.00';

-- Entidad: AlquilerPrecio
ALTER TABLE alquiler_precio
  MODIFY COLUMN precio VARCHAR(20) NOT NULL DEFAULT '0.00';

-- [Continuar con otras tablas...]
```

### Consideraciones

- **NOT NULL vs NULL**: Usar `NULL` solo si el campo originalmente era nullable
- **DEFAULT**: Siempre poner `DEFAULT '0.00'`
- **LENGTH**: Siempre usar `VARCHAR(20)` (suficiente para 99,999,999,999,999.99)
- **Backup**: Hacer backup de la DB antes de ejecutar migraciones grandes

---

## Helpers Disponibles

Ubicados en `packages/api/src/helpers/currency.ts`:

### formatCurrency(value)

Formatea un número a string con 2 decimales.

```typescript
import { formatCurrency } from '@/helpers/currency';

formatCurrency(1234.5)    // "1234.50"
formatCurrency(1234.567)  // "1234.57"
formatCurrency(0)         // "0.00"
```

### parseCurrency(value)

Parsea string o number a number con 2 decimales.

```typescript
import { parseCurrency } from '@/helpers/currency';

parseCurrency("1234.50")     // 1234.50
parseCurrency("1.234,50")    // 1234.50 (formato argentino)
parseCurrency(1234.567)      // 1234.57 (redondeado)
parseCurrency("invalid")     // 0.00
```

### sumCurrency(...values)

Suma valores con precisión de 2 decimales.

```typescript
import { sumCurrency } from '@/helpers/currency';

sumCurrency(10.50, 20.30, 5.20)  // 36.00
sumCurrency(0.1, 0.2)            // 0.30 (no 0.30000000000000004)
```

### multiplyCurrency(a, b)

Multiplica con precisión de 2 decimales.

```typescript
import { multiplyCurrency } from '@/helpers/currency';

multiplyCurrency(10.50, 2)       // 21.00
multiplyCurrency(10.99, 1.5)     // 16.49
```

### divideCurrency(a, b)

Divide con precisión de 2 decimales.

```typescript
import { divideCurrency } from '@/helpers/currency';

divideCurrency(100, 3)   // 33.33
divideCurrency(10, 0)    // 0.00 (protección contra división por cero)
```

### percentageOf(value, percentage)

Calcula porcentaje con precisión.

```typescript
import { percentageOf } from '@/helpers/currency';

percentageOf(100, 21)    // 21.00 (IVA 21%)
percentageOf(50.50, 10)  // 5.05
```

### isValidCurrency(value)

Valida que tenga máximo 2 decimales.

```typescript
import { isValidCurrency } from '@/helpers/currency';

isValidCurrency(10.50)       // true
isValidCurrency(10.5)        // true
isValidCurrency(10.567)      // false
isValidCurrency("10.50")     // true
```

---

## Testing

### Test de la entidad

```typescript
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cobro } from './entities/cobro.entity';
import { CobroService } from './cobro.service';

describe('Cobro Money Column', () => {
  let service: CobroService;
  let repository: Repository<Cobro>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CobroService,
        {
          provide: getRepositoryToken(Cobro),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CobroService>(CobroService);
    repository = module.get<Repository<Cobro>>(getRepositoryToken(Cobro));
  });

  it('debe guardar monto como number y recuperarlo como number', async () => {
    const cobro = new Cobro();
    cobro.monto = 1234.50;

    jest.spyOn(repository, 'save').mockResolvedValue(cobro);
    const saved = await repository.save(cobro);

    expect(typeof saved.monto).toBe('number');
    expect(saved.monto).toBe(1234.50);
  });

  it('debe mantener 2 decimales exactos', async () => {
    const cobro = new Cobro();
    cobro.monto = 10.5; // Un solo decimal

    jest.spyOn(repository, 'save').mockResolvedValue(cobro);
    const saved = await repository.save(cobro);

    // El transformer garantiza 2 decimales
    expect(saved.monto).toBe(10.50);
  });
});
```

### Test manual

```typescript
// En un servicio o controlador
async testMoneyColumn() {
  // Crear cobro
  const cobro = new Cobro();
  cobro.monto = 1234.50;
  await this.cobroRepository.save(cobro);

  // Leer cobro
  const found = await this.cobroRepository.findOne({ where: { id: cobro.id } });

  console.log('Tipo:', typeof found.monto);        // "number"
  console.log('Valor:', found.monto);              // 1234.50
  console.log('Suma:', found.monto + 100);         // 1334.50
  console.log('Multiplicación:', found.monto * 2); // 2469.00
}
```

### Verificar en base de datos

```sql
-- Ver el valor almacenado en la DB
SELECT id, monto FROM cobro WHERE id = 1;
-- Resultado: monto = "1234.50" (VARCHAR)

-- Verificar tipo de columna
DESCRIBE cobro;
-- Campo: monto | Tipo: varchar(20) | Default: 0.00
```

---

## FAQ

### ¿Por qué VARCHAR en lugar de DECIMAL?

- **Precisión exacta**: No hay redondeo de punto flotante
- **Consistencia**: Mismo comportamiento en todas las bases de datos
- **Portabilidad**: Funciona igual en MySQL, PostgreSQL, SQLite
- **Mantenibilidad**: Un solo transformer controla todo

### ¿Puedo hacer operaciones matemáticas normales?

Sí, TypeScript ve el campo como `number`:

```typescript
const total = cobro.monto * cantidad;
const conIva = cobro.monto * 1.21;
const suma = cobro1.monto + cobro2.monto;
```

Para máxima precisión, usa los helpers:

```typescript
import { multiplyCurrency, sumCurrency } from '@/helpers/currency';

const total = multiplyCurrency(cobro.monto, cantidad);
const suma = sumCurrency(cobro1.monto, cobro2.monto);
```

### ¿Qué pasa con datos existentes?

La migración SQL convierte automáticamente:
- `DECIMAL(18,2)` → `VARCHAR(20)`: MySQL convierte "1234.50" → "1234.50"
- `INT` → `VARCHAR(20)`: MySQL convierte `1234` → "1234.00"

**Importante**: Para campos INT que representan centavos (ej: 123450 = $1234.50), deberás hacer una migración de datos custom.

### ¿Puedo usar @MoneyColumn con otras opciones?

Sí, acepta todas las opciones de `ColumnOptions`:

```typescript
@MoneyColumn({
  nullable: true,
  comment: 'Precio de venta',
  unique: true,
})
precio?: number;
```

### ¿Debo actualizar los DTOs?

No necesariamente, pero es recomendado agregar validación:

```typescript
import { IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { parseCurrency } from '@/helpers/currency';

export class CreateCobroDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseCurrency(value))
  monto: number;
}
```

---

## Resumen

### Para migrar un campo money:

1. ✅ Importar `MoneyColumn`
2. ✅ Cambiar `@Column(...)` por `@MoneyColumn(...)`
3. ✅ Cambiar tipo TypeScript de `string` a `number` (si aplica)
4. ✅ Crear migración SQL: `ALTER TABLE ... MODIFY COLUMN ... VARCHAR(20)`
5. ✅ Probar que funcione

### Archivos importantes:

- `packages/api/src/common/decorators/money-column.decorator.ts` - Decorator
- `packages/api/src/common/transformers/currency.transformer.ts` - Transformer
- `packages/api/src/helpers/currency.ts` - Helpers
- Este archivo (`MONEY_COLUMN_EXAMPLES.md`) - Guía y ejemplos

---

**¡Listo para empezar a migrar! 🚀**
