# Template - Tipos de Datos

Plantillas para implementar campos con tipos correctos. Reemplazar placeholders según el campo.

## Placeholders

- `[Campo]` → Nombre en PascalCase (ej: `Anio`, `Kilometraje`)
- `[campo]` → Nombre en camelCase (ej: `anio`, `kilometraje`)
- `[campo_db]` → Nombre en snake_case (ej: `anio`, `kilometraje`, `capacidad_kg`)
- `[tipo]` → Tipo SQL (ej: `VARCHAR(100)`, `INT`, `VARCHAR(20)`)

---

## Decidir Tipo

```
¿Es ID o FK?           → INT
¿Es created_at/etc?    → DATETIME(6) (BaseEntity automático)
¿Es valor monetario?   → VARCHAR(20) con @MoneyColumn
¿Es cualquier otro?    → VARCHAR(100)
```

---

## Template SQL - Agregar Campo Valor

```sql
ALTER TABLE `tabla`
ADD COLUMN `[campo_db]` VARCHAR(100) NULL AFTER `campo_anterior`;
```

## Template SQL - Agregar Campo FK

```sql
ALTER TABLE `tabla`
ADD COLUMN `[campo_db]_id` INT NULL AFTER `campo_anterior`,
ADD CONSTRAINT `FK_tabla_[campo_db]` FOREIGN KEY (`[campo_db]_id`) REFERENCES `tabla_relacionada`(`id`);
```

## Template SQL - Agregar Campo Monetario

```sql
ALTER TABLE `tabla`
ADD COLUMN `[campo_db]` VARCHAR(20) NULL AFTER `campo_anterior`;
```

---

## Template Backend - Entity Valor

```typescript
@Column({ name: '[campo_db]', type: 'varchar', length: 100, nullable: true })
[campo]: string;
```

## Template Backend - Entity FK

```typescript
@Column({ type: 'int', name: '[campo_db]_id', nullable: false })
[campo]Id: number;
```

## Template Backend - Entity Monetario

```typescript
import { MoneyColumn } from '@/common/decorators/money-column.decorator';

@MoneyColumn({ name: '[campo_db]' })
[campo]: number;
```

---

## Template Backend - DTO Valor

```typescript
@IsOptional()
@IsString()
[campo]?: string;
```

## Template Backend - DTO FK

```typescript
@IsNumber()
[campo]Id: number;
```

## Template Backend - DTO Monetario

```typescript
@IsOptional()
@IsNumber()
[campo]?: number;
```

---

## Template Frontend - Type Valor

```typescript
export type MiEntidad = {
  id?: number;
  [campo]?: string;  // Valor como string
}
```

## Template Frontend - Type FK

```typescript
export type MiEntidad = {
  id?: number;
  [campo]Id?: number;  // FK como number
}
```

## Template Frontend - Type Monetario

```typescript
export type MiEntidad = {
  id?: number;
  [campo]?: number;  // Monetario como number
}
```

---

## Template Frontend - Schema Valor

```typescript
const formSchema = z.object({
  [campo]: z.string().optional(),
});
```

## Template Frontend - Schema FK

```typescript
const formSchema = z.object({
  [campo]Id: z.number().optional(),
});
```

## Template Frontend - Schema Monetario

```typescript
const formSchema = z.object({
  [campo]: z.number().optional(),
});
```

---

## Template Frontend - Input Valor

```typescript
<FormField
  control={form.control}
  name="[campo]"
  render={({ field }) => (
    <FormItem>
      <FormLabel>[Campo]</FormLabel>
      <FormControl>
        <Input placeholder="" type="text" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Template Frontend - Input FK (Selector)

```typescript
<FormField
  control={form.control}
  name="[campo]Id"
  render={({ field }) => (
    <FormItem>
      <FormLabel>[Campo]</FormLabel>
      <[Campo]Selector
        value={field.value}
        onChange={field.onChange}
      />
      <FormMessage />
    </FormItem>
  )}
/>
```

## Template Frontend - Input Monetario

```typescript
import { InputMoney } from '@/components/input-money';

<FormField
  control={form.control}
  name="[campo]"
  render={({ field }) => (
    <FormItem>
      <FormLabel>[Campo]</FormLabel>
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

---

## Ejemplo Completo: Campo `anio`

### Reemplazos

```
[Campo] → Anio
[campo] → anio
[campo_db] → anio
[tipo] → VARCHAR(100)
```

### SQL

```sql
ALTER TABLE `equipamiento`
ADD COLUMN `anio` VARCHAR(100) NULL AFTER `nombre`;
```

### Backend Entity

```typescript
@Column({ name: 'anio', type: 'varchar', length: 100, nullable: true })
anio: string;
```

### Backend DTO

```typescript
@IsOptional()
@IsString()
anio?: string;
```

### Frontend Type

```typescript
export type Equipamiento = {
  id?: number;
  anio?: string;
}
```

### Frontend Schema

```typescript
const formSchema = z.object({
  anio: z.string().optional(),
});
```

### Frontend Input

```typescript
<FormField
  control={form.control}
  name="anio"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Año</FormLabel>
      <FormControl>
        <Input placeholder="2024" type="text" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## Ejemplo Completo: Campo `tipoId` (FK)

### Reemplazos

```
[Campo] → Tipo
[campo] → tipo
[campo_db] → tipo
```

### SQL

```sql
ALTER TABLE `equipamiento`
ADD COLUMN `tipo_id` INT NOT NULL AFTER `id`,
ADD CONSTRAINT `FK_equipamiento_tipo` FOREIGN KEY (`tipo_id`) REFERENCES `equipamiento_tipo`(`id`);
```

### Backend Entity

```typescript
@Column({ type: 'int', name: 'tipo_id', nullable: false })
tipoId: number;
```

### Backend DTO

```typescript
@IsNumber()
tipoId: number;
```

### Frontend Type

```typescript
export type Equipamiento = {
  id?: number;
  tipoId?: number;
}
```

### Frontend Schema

```typescript
const formSchema = z.object({
  tipoId: z.number().optional(),
});
```

### Frontend Input

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
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## Ejemplo Completo: Campo `precio` (Monetario)

### Reemplazos

```
[Campo] → Precio
[campo] → precio
[campo_db] → precio
```

### SQL

```sql
ALTER TABLE `producto`
ADD COLUMN `precio` VARCHAR(20) NULL AFTER `nombre`;
```

### Backend Entity

```typescript
import { MoneyColumn } from '@/common/decorators/money-column.decorator';

@MoneyColumn({ name: 'precio' })
precio: number;
```

### Backend DTO

```typescript
@IsOptional()
@IsNumber()
precio?: number;
```

### Frontend Type

```typescript
export type Producto = {
  id?: number;
  precio?: number;
}
```

### Frontend Schema

```typescript
const formSchema = z.object({
  precio: z.number().optional(),
});
```

### Frontend Input

```typescript
import { InputMoney } from '@/components/input-money';

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

---

## Checklist de Reemplazo

- [ ] Reemplazar `[Campo]` en PascalCase
- [ ] Reemplazar `[campo]` en camelCase
- [ ] Reemplazar `[campo_db]` en snake_case
- [ ] Decidir tipo correcto (INT, VARCHAR(100), VARCHAR(20))
- [ ] Verificar SQL migration
- [ ] Verificar entity TypeORM
- [ ] Verificar DTO validation
- [ ] Verificar frontend type
- [ ] Verificar Zod schema
- [ ] Verificar input component

---

## Tabla Resumen

| Tipo Campo | SQL | Entity | DTO | Type | Zod | Input |
|------------|-----|--------|-----|------|-----|-------|
| ID | `INT AUTO_INCREMENT` | `number` | - | `number` | `z.number()` | - |
| FK | `INT` | `number` | `@IsNumber()` | `number` | `z.number()` | Selector |
| Valor | `VARCHAR(100)` | `string` | `@IsString()` | `string` | `z.string()` | `<Input>` |
| Monetario | `VARCHAR(20)` | `number` + `@MoneyColumn` | `@IsNumber()` | `number` | `z.number()` | `<InputMoney>` |
| Auditoría | `DATETIME(6)` | BaseEntity | - | `string` | - | - |
