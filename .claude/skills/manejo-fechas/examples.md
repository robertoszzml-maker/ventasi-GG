# Ejemplos de Uso: Manejo de Fechas

## Backend: Inicializar Fechas

### DTO con Validación

```typescript
import { IsString, Matches } from 'class-validator';

export class CreateEventoDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fecha: string;  // ✅ string, no Date

  @IsString()
  descripcion: string;
}
```

### Servicio con Timestamp

```typescript
import { getTodayDateTime } from '@/helpers/date-utils';

@Injectable()
export class EventoService {
  async create(dto: CreateEventoDto) {
    // DateTime actual (zona Argentina)
    const ahora = getTodayDateTime();  // "2025-05-11 14:30:00"

    // Guardar con timestamp
    const registro = await this.eventoRepository.save({
      fecha: dto.fecha,  // String "2025-05-11"
      descripcion: dto.descripcion,
      createdAt: getTodayDateTime(),  // String "2025-05-11 14:30:00"
    });

    return registro;
  }
}
```

**⚠️ NO usar `new Date()`** - Siempre `getTodayDateTime()` para zona horaria Argentina

## Frontend: Inicializar Fechas

### Schema Zod

```typescript
import { z } from 'zod';

const formSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),  // String
  descripcion: z.string().min(1),
});
```

### Formulario con defaultValues

```typescript
import { today } from '@/utils/date';

export default function EventoForm({ data }: { data?: Evento }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fecha: data?.fecha || today(),  // ✅ Usar helper para fecha actual
      descripcion: data?.descripcion || "",
    }
  });

  // ...
}
```

### DatePicker en Formulario

```typescript
import { DatePicker } from '@/components/ui/date-picker';

// Schema para DatePicker
const formSchema = z.object({
  fecha: z.date().optional(),  // ✅ DatePicker usa z.date()
});

// defaultValues
defaultValues: {
  fecha: data?.fecha ? new Date(data.fecha) : undefined,
}

// Render
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
```

## Frontend: Formatear para Display

### Display en Componentes

```typescript
import { formatDate, formatTime, formatDay, getTime } from '@/utils/date';

export default function EventoCard({ evento }: { evento: Evento }) {
  return (
    <div>
      {/* Formatear fecha simple */}
      <span>{formatDate(evento.fecha)}</span>  {/* "11/05/2025" */}

      {/* Formatear datetime completo */}
      <span>{formatTime(evento.createdAt)}</span>  {/* "11/05/2025 • 14:30" */}

      {/* Mostrar día de la semana */}
      <span>{formatDay(evento.fecha)}</span>  {/* "Sábado" */}

      {/* Obtener solo la hora */}
      <span>{getTime(evento.createdAt)}</span>  {/* "14:30" */}
    </div>
  );
}
```

**⚠️ NO mostrar raw strings** - Siempre usar helpers de formato

### Columnas de Tabla

```typescript
import { formatDate, formatTime } from '@/utils/date';

export const columns: ColumnDef<Evento>[] = [
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
];
```

## Ejemplo Completo: Form + Display

### Formulario

```typescript
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { today } from '@/utils/date'

const formSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  titulo: z.string().min(1),
});

export default function EventoForm({ data }: { data?: Evento }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fecha: data?.fecha || today(),  // ✅ Helper
      titulo: data?.titulo || "",
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // values.fecha es string "YYYY-MM-DD"
    await create(values);
  }

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
      {/* Más campos... */}
    </form>
  );
}
```

### Display

```typescript
import { formatDate, formatDay } from '@/utils/date';

export default function EventoDisplay({ evento }: { evento: Evento }) {
  return (
    <div>
      <h2>{evento.titulo}</h2>
      <p>
        {formatDate(evento.fecha)} - {formatDay(evento.fecha)}
      </p>
      {/* "11/05/2025 - Sábado" */}
    </div>
  );
}
```

## Comparación: ❌ Incorrecto vs ✅ Correcto

### Inicialización Backend

```typescript
// ❌ INCORRECTO
const ahora = new Date();  // Zona horaria incorrecta
const fechaActual = new Date().toISOString().split('T')[0];  // Complejo

// ✅ CORRECTO
const ahora = getTodayDateTime();  // "2025-05-11 14:30:00"
```

### Inicialización Frontend

```typescript
// ❌ INCORRECTO
const hoy = "2025-05-11";  // Hardcoded
const hoy = new Date().toISOString().split('T')[0];  // Complejo

// ✅ CORRECTO
const hoy = today();  // "2025-05-11"
```

### Display

```typescript
// ❌ INCORRECTO
<span>{evento.fecha}</span>  // Raw string "2025-05-11"
<span>{evento.createdAt}</span>  // Raw string "2025-05-11 14:30:00"

// ✅ CORRECTO
<span>{formatDate(evento.fecha)}</span>  // "11/05/2025"
<span>{formatTime(evento.createdAt)}</span>  // "11/05/2025 • 14:30"
```

### Tipos

```typescript
// ❌ INCORRECTO
fecha: Date  // Tipo Date
@IsDate()  // Validación incorrecta
z.date()  // Schema incorrecto (excepto DatePicker)

// ✅ CORRECTO
fecha: string  // Tipo string
@IsString()
@Matches(/^\d{4}-\d{2}-\d{2}$/)  // Validación string
z.string().regex(/^\d{4}-\d{2}-\d{2}$/)  // Schema string
```
