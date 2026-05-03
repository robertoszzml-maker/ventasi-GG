# Manejo de Fechas

Fechas como string `YYYY-MM-DD`. Usar helpers propios para inicializar y formatear.

## Regla Principal

- **Almacenamiento**: Todo son strings `"YYYY-MM-DD"` o `"YYYY-MM-DD HH:mm:ss"`
- **Inicializar**: Usar helpers `today()` o `getTodayDateTime()`
- **Formatear display**: Usar `formatDate()`, `formatTime()`, `formatDay()`

## Backend: Inicializar Fechas

```typescript
import { getTodayDateTime } from '@/helpers/date-utils';

// DateTime actual (zona Argentina)
const ahora = getTodayDateTime();  // "2025-05-11 14:30:00"

// Guardar con timestamp
const registro = await this.repo.save({
  fecha: dto.fecha,  // String "2025-05-11"
  createdAt: getTodayDateTime(),  // String "2025-05-11 14:30:00"
});

// DTO
export class CreateEventoDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fecha: string;  // ✅ string, no Date
}
```

**⚠️ NO usar `new Date()`** - Siempre `getTodayDateTime()` para zona horaria Argentina

## Frontend: Inicializar Fechas

```typescript
import { today, getTodayDateTime } from '@/utils/date';

// Fecha actual (YYYY-MM-DD)
const fechaHoy = today();  // "2025-05-11"

// DateTime actual (zona Argentina)
const ahora = getTodayDateTime();  // "2025-05-11 14:30:00"

// Schema Zod
const formSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),  // String
});

// defaultValues
defaultValues: {
  fecha: data?.fecha || today(),  // ✅ Usar helper para fecha actual
}
```

## Frontend: Formatear para Display

```typescript
import { formatDate, formatTime, formatDay, getTime } from '@/utils/date';

// Formatear fecha simple
<span>{formatDate(evento.fecha)}</span>  // "11/05/2025"

// Formatear datetime completo
<span>{formatTime(registro.createdAt)}</span>  // "11/05/2025 • 14:30"

// Mostrar día de la semana
<span>{formatDay(evento.fecha)}</span>  // "Sábado"

// Obtener solo la hora
<span>{getTime(registro.createdAt)}</span>  // "14:30"
```

**⚠️ NO mostrar raw strings** - Siempre usar helpers de formato

## Helpers Disponibles

### Backend (`@/helpers/date-utils`)

```typescript
getTodayDateTime(): string  // "2025-05-11 14:30:00" (Argentina)
```

### Frontend (`@/utils/date`)

**Inicializar:**
```typescript
today(): string              // "2025-05-11"
getTodayDateTime(): string   // "2025-05-11 14:30:00" (Argentina)
```

**Formatear:**
```typescript
formatDate(date): string     // "11/05/2025"
formatTime(date): string     // "11/05/2025 • 14:30"
formatDay(date): string      // "Sábado"
getTime(date): string        // "14:30"
```

## DatePicker Component

```typescript
import { DatePicker } from '@/components/ui/date-picker';

<DatePicker
  label="Fecha"
  form={form}
  name="fecha"
  fromYear={2025}
/>
```

**Schema:** `fecha: z.date().optional()`
**defaultValues:** `fecha: data?.fecha ? new Date(data.fecha) : undefined`

**Nota:** DatePicker es excepción - maneja Date internamente pero guarda como string

## Anti-patrones

```typescript
// ❌ NO
fecha: Date                              // ✅ fecha: string
fecha: "11/05/2025"                      // ✅ "2025-05-11"
const ahora = new Date()                 // ✅ getTodayDateTime()
const hoy = "2025-05-11"                 // ✅ today()
<span>{registro.createdAt}</span>        // ✅ formatTime()
<span>{evento.fecha}</span>              // ✅ formatDate()

// ✅ SÍ
fecha: string ("YYYY-MM-DD")
today() → "2025-05-11"
getTodayDateTime() → "2025-05-11 14:30:00"
formatDate(date) → "11/05/2025"
formatTime(datetime) → "11/05/2025 • 14:30"
formatDay(date) → "Sábado"
```

## Resumen

| Aspecto | Helper | Retorna |
|---------|--------|---------|
| **Backend inicializar** | `getTodayDateTime()` | `"YYYY-MM-DD HH:mm:ss"` |
| **Frontend inicializar fecha** | `today()` | `"YYYY-MM-DD"` |
| **Frontend inicializar datetime** | `getTodayDateTime()` | `"YYYY-MM-DD HH:mm:ss"` |
| **Frontend mostrar fecha** | `formatDate()` | `"11/05/2025"` |
| **Frontend mostrar datetime** | `formatTime()` | `"11/05/2025 • 14:30"` |
| **Frontend mostrar día** | `formatDay()` | `"Sábado"` |
| **Frontend extraer hora** | `getTime()` | `"14:30"` |
| Tipo almacenado | - | `string` (no `Date`) |
| Validación DTO | `@Matches(/^\d{4}-\d{2}-\d{2}$/)` | - |
