# Idioma y Nomenclatura

Todo en español excepto términos técnicos estándar.

## Formatos

| Contexto | Formato | Ejemplo |
|----------|---------|---------|
| Archivos/directorios | kebab-case | `equipamiento-tipo.entity.ts` |
| Columnas BD | snake_case | `proceso_general_id` |
| Variables/Funciones | camelCase | `procesoGeneralId` |
| Clases/Interfaces | PascalCase | `ProcesoGeneral` |
| Constantes | UPPER_SNAKE_CASE | `MAX_LIMIT` |

## Reglas

### 1. Código en Español

```typescript
// ✅ Correcto
@Entity('equipamiento')
export class Equipamiento extends BaseEntity {
  @Column({ name: 'anio_fabricacion' })
  anioFabricacion: string;

  async crearEquipamiento(dto: CrearEquipamientoDto) { }
}

// ❌ Incorrecto
@Entity('equipment')
export class Equipment extends BaseEntity {
  @Column({ name: 'year_manufactured' })
  yearManufactured: string;

  async createEquipment(dto: CreateEquipmentDto) { }
}
```

### 2. Columnas BD en snake_case

```typescript
// ✅ Correcto
@Column({ name: 'proceso_general_id', type: 'int' })
procesoGeneralId: number;

// ❌ Incorrecto
@Column({ name: 'procesoGeneralId' })  // camelCase en BD
procesoGeneralId: number;

@Column({ type: 'int' })  // Sin especificar name
procesoGeneralId: number;  // Usaría camelCase en BD
```

### 3. Archivos en kebab-case

```
✅ Correcto:
src/modules/equipamiento/equipamiento.controller.ts
src/components/forms/proveedor-form.tsx
src/services/cuenta-contable.ts

❌ Incorrecto:
Equipamiento.controller.ts  // PascalCase
equipamiento_service.ts  // snake_case
EquipamientoForm.tsx  // PascalCase
```

### 4. Variables/Funciones camelCase

```typescript
// ✅ Correcto
const equipamientoActivo = true;
const fechaInicio = '2025-05-11';
async function crearEquipamiento() { }

// ❌ Incorrecto
const equipamiento_activo = true;  // snake_case
const FechaInicio = '2025-05-11';  // PascalCase
async function CrearEquipamiento() { }  // PascalCase
```

## Ejemplos

### Backend

```typescript
// Entidad
@Entity('jornada')
export class Jornada extends BaseEntity {
  @Column({ type: 'varchar', name: 'fecha_inicio' })
  fechaInicio: string;

  @Column({ type: 'int', name: 'proceso_general_id' })
  procesoGeneralId: number;
}

// DTO
export class CrearJornadaDto {
  @IsString()
  fechaInicio: string;

  @IsNumber()
  procesoGeneralId: number;
}

// Servicio
async crearJornada(dto: CrearJornadaDto) {
  return await this.jornadaRepository.save(dto);
}
```

### Frontend

```typescript
// Types
export type Equipamiento = {
  id?: number;
  nombre: string;
  tipoId?: number;
  anio?: string;
}

// Form Schema
const formSchema = z.object({
  nombre: z.string(),
  tipoId: z.number().optional(),
  anio: z.string().optional(),
});

// Component
export default function EquipamientoForm({ datos }: { datos?: Equipamiento }) {
  const formulario = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      nombre: datos?.nombre || "",
      tipoId: datos?.tipoId,
    }
  })
}
```

## Anti-patrones

```typescript
// ❌ NO
const fecha_inicio = '2025-05-11';  // snake_case en TS
@Column({ name: 'procesoGeneralId' })  // camelCase en BD
async createEquipment() { }  // Inglés en funciones
export class Equipment { }  // Inglés en clases

// ✅ SÍ
const fechaInicio = '2025-05-11';  // camelCase en TS
@Column({ name: 'proceso_general_id' })  // snake_case en BD
async crearEquipamiento() { }  // Español
export class Equipamiento { }  // Español
```

## Checklist

### Backend:
- [ ] Variables/funciones camelCase español
- [ ] Clases PascalCase español
- [ ] Archivos kebab-case español
- [ ] Columnas BD snake_case con `name`
- [ ] Comentarios español
- [ ] Mensajes error/log español

### Frontend:
- [ ] Variables/funciones camelCase español
- [ ] Componentes PascalCase español
- [ ] Archivos kebab-case español
- [ ] Props camelCase español
- [ ] Comentarios español
- [ ] Mensajes usuario español

### BD:
- [ ] Tablas snake_case
- [ ] Columnas snake_case
- [ ] FKs con sufijo `_id`

## Resumen

| Aspecto | Valor |
|---------|-------|
| Idioma | Español (código, comentarios, docs) |
| Excepciones | Términos técnicos (controller, service) |
| Archivos | kebab-case español |
| Columnas BD | snake_case con `name` explícito |
| Variables | camelCase español |
| Clases | PascalCase español |
| Constantes | UPPER_SNAKE_CASE |
