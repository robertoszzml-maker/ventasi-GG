# Referencia Técnica: Manejo de Fechas

## Regla Principal

- **Almacenamiento**: Todo son strings `"YYYY-MM-DD"` o `"YYYY-MM-DD HH:mm:ss"`
- **Inicializar**: Usar helpers `today()` o `getTodayDateTime()`
- **Formatear display**: Usar `formatDate()`, `formatTime()`, `formatDay()`

## Helpers Disponibles

### Backend (`@/helpers/date-utils`)

```typescript
getTodayDateTime(): string  // "2025-05-11 14:30:00" (Argentina)
```

**Uso:**
```typescript
import { getTodayDateTime } from '@/helpers/date-utils';

// Guardar con timestamp
const registro = await this.repo.save({
  fecha: dto.fecha,  // String "2025-05-11"
  createdAt: getTodayDateTime(),  // String "2025-05-11 14:30:00"
});
```

**⚠️ NO usar `new Date()`** - Siempre `getTodayDateTime()` para zona horaria Argentina

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

**Uso en schemas:**
```typescript
// Schema Zod
const formSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),  // String
});

// defaultValues
defaultValues: {
  fecha: data?.fecha || today(),  // ✅ Usar helper para fecha actual
}
```

**⚠️ NO mostrar raw strings** - Siempre usar helpers de formato

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

**Configuración:**
- **Schema:** `fecha: z.date().optional()`
- **defaultValues:** `fecha: data?.fecha ? new Date(data.fecha) : undefined`

**Nota:** DatePicker es excepción - maneja Date internamente pero guarda como string

## Validación Backend (DTO)

```typescript
export class CreateEventoDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fecha: string;  // ✅ string, no Date
}
```

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

## Resumen de Helpers

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

## Tipos de Datos en BD

| Campo | Tipo |
|-------|------|
| Fechas de negocio | `VARCHAR(100)` |
| Timestamps de auditoría | `DATETIME(6)` solo para `created_at`, `updated_at`, `deleted_at` |
| Formato almacenado | `"YYYY-MM-DD"` o `"YYYY-MM-DD HH:mm:ss"` |

## Checklist de Implementación

- [ ] Fechas almacenadas como `string` en TypeScript
- [ ] Fechas en BD como `VARCHAR(100)` (excepto auditoría)
- [ ] Backend usa `getTodayDateTime()` para timestamps
- [ ] Frontend usa `today()` para defaultValues
- [ ] Display usa helpers de formato (`formatDate`, `formatTime`, etc.)
- [ ] DTOs usan `@IsString()` y `@Matches()` para fechas
- [ ] Schemas Zod usan `z.string().regex()` para fechas
- [ ] DatePicker usa `z.date()` y convierte a string
- [ ] No hay uso de `new Date()` directo
- [ ] No hay tipos `Date` en DTOs/schemas
- [ ] No hay raw strings mostrados en UI
