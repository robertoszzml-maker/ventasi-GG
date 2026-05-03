# Reglas para Tipos de Datos

## Regla Fundamental: VARCHAR para Valores de Negocio

**IMPORTANTE**: Todos los valores de negocio (numéricos, monetarios, mediciones, etc.) se almacenan como `VARCHAR`, **excepto**:
- IDs (siempre `INT` con AUTO_INCREMENT)
- Claves foráneas (siempre `INT`)

---

## Tipos de Datos Permitidos

### ✅ Usar VARCHAR(100) para:

- **Valores numéricos**: cantidad, peso, altura, ancho, largo
- **Valores monetarios**: precios, costos, subtotales, totales
- **Mediciones**: kilómetros, litros, presión, capacidad
- **Años**: año de fabricación, año de modelo
- **Porcentajes**: descuentos, IVA, comisiones
- **Coordenadas**: latitud, longitud
- **Cantidades decimales**: metros cúbicos, metros cuadrados

### ✅ Usar INT solo para:

- **IDs**: Clave primaria con AUTO_INCREMENT
- **Claves foráneas**: Referencias a otras tablas

### ✅ Usar VARCHAR(100) para fechas de negocio:

- Fechas de entrega, vencimiento, facturación
- **Formato**: `YYYY-MM-DD` como string
- **Excepción**: Campos de auditoría (`created_at`, `updated_at`, `deleted_at`) usan `DATETIME(6)`

---

## Ejemplos de Implementación

### SQL (Migración)

```sql
CREATE TABLE IF NOT EXISTS `equipamiento` (
  `id` INT NOT NULL AUTO_INCREMENT,                    -- ✅ ID como INT
  `tipo_id` INT NOT NULL,                              -- ✅ FK como INT
  `nombre` VARCHAR(255) NOT NULL,
  `anio` VARCHAR(100) NULL,                            -- ✅ Año como VARCHAR
  `kilometraje` VARCHAR(100) NULL,                     -- ✅ Numérico como VARCHAR
  `capacidad_kg` VARCHAR(100) NULL,                    -- ✅ Numérico como VARCHAR
  `precio` VARCHAR(20) NULL,                           -- ✅ Monetario como VARCHAR
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),  -- ✅ Auditoría DATETIME
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_equipamiento_tipo` FOREIGN KEY (`tipo_id`) REFERENCES `equipamiento_tipo`(`id`)
);
```

### Backend - Entidad TypeORM

```typescript
@Entity({ name: 'equipamiento' })
export class Equipamiento extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;  // ✅ ID como number

  @Column({ type: 'int', name: 'tipo_id', nullable: false })
  tipoId: number;  // ✅ FK como number

  @Column({ type: 'varchar', length: 100, nullable: true })
  anio: string;  // ✅ Valor como string

  @Column({ type: 'varchar', length: 100, nullable: true })
  kilometraje: string;  // ✅ Valor como string

  @Column({ name: 'capacidad_kg', type: 'varchar', length: 100, nullable: true })
  capacidadKg: string;  // ✅ Valor como string
}
```

### Backend - DTO

```typescript
export class CreateEquipamientoDto {
  @IsNumber()
  tipoId: number;  // ✅ FK como number

  @IsOptional()
  @IsString()
  anio?: string;  // ✅ Valor como string

  @IsOptional()
  @IsString()
  kilometraje?: string;  // ✅ Valor como string

  @IsOptional()
  @IsString()
  capacidadKg?: string;  // ✅ Valor como string
}
```

### Frontend - Types

```typescript
export type Equipamiento = {
  id?: number;        // ✅ ID como number
  tipoId?: number;    // ✅ FK como number
  anio?: string;      // ✅ Valor como string
  kilometraje?: string;  // ✅ Valor como string
  capacidadKg?: string;  // ✅ Valor como string
}
```

### Frontend - Form Schema (Zod)

```typescript
const formSchema = z.object({
  id: z.number().optional(),          // ✅ ID como number
  tipoId: z.number().optional(),      // ✅ FK como number
  anio: z.string().optional(),        // ✅ Valor como string
  kilometraje: z.string().optional(), // ✅ Valor como string
  capacidadKg: z.string().optional(), // ✅ Valor como string
});
```

### Frontend - Formularios

```typescript
// ✅ Usar Input normal (type="text") para valores
<FormField
  control={form.control}
  name="anio"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Año</FormLabel>
      <FormControl>
        <Input placeholder="" type="text" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

// ❌ NO usar InputNumber
<InputNumber {...field} />  // INCORRECTO
```

---

## Ventajas de Este Enfoque

1. **Flexibilidad**: Permite almacenar valores con formato personalizado (ej: "1,234.56", "N/A", "aprox. 100")
2. **Sin pérdida de precisión**: No hay problemas de redondeo de decimales
3. **Compatibilidad**: Fácil de exportar/importar en diferentes formatos
4. **Simplicidad**: No hay conversiones de tipo complejas
5. **Extensibilidad**: Permite agregar unidades o anotaciones al valor

---

## Excepciones

### ❌ NO usar VARCHAR para:

1. **IDs y claves foráneas**: Siempre `INT`
2. **Campos de auditoría**: `created_at`, `updated_at`, `deleted_at` usan `DATETIME(6)`
3. **Booleanos de sistema**: Flags técnicos pueden usar `TINYINT` (0/1)

---

## Checklist para Nuevos Campos

Al agregar un campo nuevo:

- [ ] ¿Es un ID o clave foránea? → `INT`
- [ ] ¿Es un campo de auditoría (created_at, updated_at)? → `DATETIME(6)`
- [ ] ¿Es cualquier otro valor (numérico, fecha, monetario)? → `VARCHAR(100)`
- [ ] En entidad TypeORM: tipo correcto (`number` para ID/FK, `string` para valores)
- [ ] En DTO: validación correcta (`@IsNumber()` para ID/FK, `@IsString()` para valores)
- [ ] En types frontend: tipo correcto (`number` para ID/FK, `string` para valores)
- [ ] En form schema: `z.number()` para ID/FK, `z.string()` para valores
- [ ] En formulario: `Input type="text"` para valores (NO `InputNumber`)

---

## Migración de Campos Existentes

Si encuentras campos numéricos como `INT`, `DECIMAL`, `FLOAT`:

1. Crear migración SQL:
   ```sql
   ALTER TABLE `tabla` MODIFY `campo` VARCHAR(100) NULL;
   ```

2. Actualizar entidad TypeORM:
   ```typescript
   @Column({ type: 'varchar', length: 100, nullable: true })
   campo: string;  // Cambiar de number a string
   ```

3. Actualizar DTO:
   ```typescript
   @IsString()  // Cambiar de @IsNumber()
   campo?: string;  // Cambiar de number a string
   ```

4. Actualizar types frontend:
   ```typescript
   campo?: string;  // Cambiar de number a string
   ```

5. Actualizar form schema:
   ```typescript
   campo: z.string().optional(),  // Cambiar de z.number()
   ```

6. Actualizar formulario:
   ```typescript
   <Input type="text" {...field} />  // Cambiar de InputNumber
   ```
