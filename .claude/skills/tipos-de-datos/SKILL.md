---
name: tipos-de-datos
description: REGLA FUNDAMENTAL - VARCHAR para valores de negocio, INT solo para IDs/FKs
license: MIT
---

# Tipos de Datos

**REGLA FUNDAMENTAL**: Todos los valores de negocio se almacenan como `VARCHAR`, excepto IDs y claves foráneas que usan `INT`.

## Input

- `<campo>`: Nombre del campo
- `<tipo>`: Tipo de valor (numérico, monetario, fecha, medición)

**Ejemplo:** `/tipos-de-datos kilometraje numérico`

## Regla Fundamental

```
VARCHAR(100)  →  Valores de negocio (números, fechas, mediciones)
INT           →  Solo IDs y claves foráneas
DATETIME(6)   →  Solo campos de auditoría (created_at, updated_at, deleted_at)
```

## Steps

1. **Identificar el Tipo de Campo**
   - ¿Es ID o FK? → `INT`
   - ¿Es created_at/updated_at/deleted_at? → `DATETIME(6)`
   - ¿Es cualquier otro valor? → `VARCHAR(100)`

2. **SQL Migration**
   - IDs: `INT NOT NULL AUTO_INCREMENT`
   - FKs: `INT NOT NULL`
   - Valores: `VARCHAR(100) NULL`
   - Auditoría: `DATETIME(6)`

3. **Backend Entity**
   - IDs/FKs: `number` en TypeScript, `INT` en DB
   - Valores: `string` en TypeScript, `VARCHAR(100)` en DB

4. **Backend DTO**
   - IDs/FKs: `@IsNumber()`
   - Valores: `@IsString()`

5. **Frontend Types**
   - IDs/FKs: `number`
   - Valores: `string`

6. **Frontend Form**
   - IDs/FKs: `z.number()`
   - Valores: `z.string()`, `<Input type="text">`

## Output

**SQL:**
```sql
`id` INT NOT NULL AUTO_INCREMENT,
`tipo_id` INT NOT NULL,           -- FK
`anio` VARCHAR(100) NULL,          -- Valor
`kilometraje` VARCHAR(100) NULL,   -- Valor
```

**Backend:**
```typescript
id: number;        // INT
tipoId: number;    // FK INT
anio: string;      // VARCHAR
kilometraje: string; // VARCHAR
```

**Frontend:**
```typescript
id?: number;
tipoId?: number;
anio?: string;
kilometraje?: string;
```

## Recursos

- [📖 Referencia](reference.md) - Patrones completos y ventajas
- [💡 Ejemplos](examples.md) - Casos de uso reales
- [📋 Template](template.md) - Código base para copiar

## VARCHAR(100) para Valores

| Tipo | Ejemplos | Ventaja |
|------|----------|---------|
| Numéricos | cantidad, peso, altura | Precisión exacta |
| Monetarios | precio, costo, total | Sin redondeo |
| Mediciones | km, litros, presión | Con unidades |
| Años | año fabricación | Formato flexible |
| Porcentajes | descuento, IVA | Con símbolo % |
| Fechas negocio | fecha entrega | Formato YYYY-MM-DD |

## INT solo para

- **IDs**: Clave primaria con AUTO_INCREMENT
- **Claves foráneas**: Referencias a otras tablas

## Reglas Críticas

✅ **SÍ hacer:**
- VARCHAR(100) para todos los valores de negocio
- INT solo para IDs y FKs
- `string` en TypeScript para valores
- `number` en TypeScript para IDs/FKs
- `@IsString()` en DTO para valores
- `@IsNumber()` en DTO para IDs/FKs
- `<Input type="text">` para valores

❌ **NO hacer:**
- DECIMAL, FLOAT, DOUBLE para valores
- INT para años, cantidades, mediciones
- `number` en TypeScript para valores de negocio
- `InputNumber` para campos de valores
- VARCHAR para IDs o FKs

## Ventajas

1. **Flexibilidad**: "1,234.56", "N/A", "aprox. 100"
2. **Sin pérdida de precisión**: No hay redondeo
3. **Compatibilidad**: Fácil exportar/importar
4. **Simplicidad**: Sin conversiones complejas
5. **Extensibilidad**: Agregar unidades o anotaciones

## Notes

- Esta regla es FUNDAMENTAL para todo el proyecto
- Excepciones: IDs (INT), FKs (INT), auditoría (DATETIME(6))
- Campos monetarios usan `@MoneyColumn` decorator pero siguen siendo VARCHAR(20)
- Fechas de negocio son VARCHAR(100) formato "YYYY-MM-DD"
- Campos de auditoría (created_at, updated_at, deleted_at) son DATETIME(6)
