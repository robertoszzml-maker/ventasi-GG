# Template: Implementación de Fechas

Este template muestra cómo implementar fechas correctamente en backend y frontend.

## Backend

### 1. DTO

```typescript
import { IsString, IsOptional, Matches } from 'class-validator';

export class Create[Entidad]Dto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fecha: string;  // ✅ Obligatoria

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaOpcional?: string;  // ✅ Opcional

  // Otros campos...
}
```

### 2. Entidad

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('[nombre_tabla]')
export class [Entidad] extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, name: 'fecha' })
  fecha: string;

  @Column({ type: 'varchar', length: 100, name: 'fecha_opcional', nullable: true })
  fechaOpcional?: string;

  // Otros campos...
}
```

### 3. Servicio (con timestamp)

```typescript
import { getTodayDateTime } from '@/helpers/date-utils';

@Injectable()
export class [Entidad]Service {
  async create(dto: Create[Entidad]Dto) {
    return await this.repository.save({
      ...dto,
      createdAt: getTodayDateTime(),  // ✅ Timestamp en zona Argentina
    });
  }

  async update(id: number, dto: Update[Entidad]Dto) {
    return await this.repository.save({
      id,
      ...dto,
      updatedAt: getTodayDateTime(),  // ✅ Timestamp en zona Argentina
    });
  }
}
```

### 4. Migración SQL

```sql
CREATE TABLE IF NOT EXISTS `[nombre_tabla]` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fecha` VARCHAR(100) NOT NULL,
  `fecha_opcional` VARCHAR(100) NULL,
  -- Campos de BaseEntity (auditoría)
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL,
  PRIMARY KEY (`id`)
);
```

## Frontend

### 1. Type

```typescript
export type [Entidad] = {
  id?: number;
  fecha: string;
  fechaOpcional?: string;
  // Otros campos...
};
```

### 2. Schema Zod (Input simple)

```typescript
import { z } from 'zod';

const formSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),  // ✅ Obligatoria
  fechaOpcional: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),  // ✅ Opcional
  // Otros campos...
});
```

### 3. Schema Zod (DatePicker)

```typescript
import { z } from 'zod';

const formSchema = z.object({
  fecha: z.date(),  // ✅ DatePicker obligatorio
  fechaOpcional: z.date().optional(),  // ✅ DatePicker opcional
  // Otros campos...
});
```

### 4. Formulario (Input simple)

```typescript
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { today } from '@/utils/date'

export default function [Entidad]Form({ data }: { data?: [Entidad] }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fecha: data?.fecha || today(),  // ✅ Helper para fecha actual
      fechaOpcional: data?.fechaOpcional,
      // Otros campos...
    }
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="fecha"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fecha</FormLabel>
            <Input type="text" {...field} />
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Otros campos... */}
    </form>
  );
}
```

### 5. Formulario (DatePicker)

```typescript
"use client"
import { DatePicker } from '@/components/ui/date-picker';

export default function [Entidad]Form({ data }: { data?: [Entidad] }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fecha: data?.fecha ? new Date(data.fecha) : undefined,  // ✅ Convertir a Date
      fechaOpcional: data?.fechaOpcional ? new Date(data.fechaOpcional) : undefined,
      // Otros campos...
    }
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="fecha"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fecha</FormLabel>
            <DatePicker
              label="Fecha"
              form={form}
              name="fecha"
              fromYear={2025}
            />
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Otros campos... */}
    </form>
  );
}
```

### 6. Display

```typescript
import { formatDate, formatTime, formatDay } from '@/utils/date';

export default function [Entidad]Display({ data }: { data: [Entidad] }) {
  return (
    <div>
      {/* Fecha simple */}
      <p>Fecha: {formatDate(data.fecha)}</p>  {/* "11/05/2025" */}

      {/* Fecha con día */}
      <p>
        {formatDate(data.fecha)} - {formatDay(data.fecha)}
      </p>  {/* "11/05/2025 - Sábado" */}

      {/* DateTime completo (si tiene timestamp) */}
      <p>Creado: {formatTime(data.createdAt)}</p>  {/* "11/05/2025 • 14:30" */}
    </div>
  );
}
```

### 7. Columnas de Tabla

```typescript
import { formatDate, formatTime } from '@/utils/date';

export const columns: ColumnDef<[Entidad]>[] = [
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => formatDate(row.getValue("fecha")),
  },
  {
    accessorKey: "createdAt",
    header: "Creado",
    cell: ({ row }) => formatTime(row.getValue("createdAt")),
  },
  // Otras columnas...
];
```

## Checklist de Implementación

### Backend:
- [ ] DTO usa `@IsString()` y `@Matches(/^\d{4}-\d{2}-\d{2}$/)`
- [ ] Entidad usa `type: 'varchar', length: 100`
- [ ] Servicio usa `getTodayDateTime()` para timestamps
- [ ] Migración SQL usa `VARCHAR(100)` para fechas de negocio
- [ ] Migración SQL usa `DATETIME(6)` solo para auditoría

### Frontend:
- [ ] Type define `fecha: string`
- [ ] Schema usa `z.string().regex()` o `z.date()` (DatePicker)
- [ ] defaultValues usa `today()` o `new Date(data.fecha)`
- [ ] Display usa helpers (`formatDate`, `formatTime`, etc.)
- [ ] No hay uso directo de `new Date()`
- [ ] No hay raw strings en UI

## Notas

- ⚠️ **NUNCA** usar `new Date()` para inicializar fechas
- ✅ **SIEMPRE** usar helpers de inicialización (`today()`, `getTodayDateTime()`)
- ✅ **SIEMPRE** usar helpers de formateo para display
- DatePicker es la única excepción que usa `z.date()` internamente
