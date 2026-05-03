# Ejemplos: Idioma y Nomenclatura

## Ejemplo Completo Backend: Jornada

### Entidad

**Ubicación:** `packages/api/src/modules/jornada/entities/jornada.entity.ts`

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('jornada')  // ✅ snake_case en tabla
export class Jornada extends BaseEntity {  // ✅ PascalCase en clase
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'fecha_inicio' })  // ✅ snake_case con name
  fechaInicio: string;  // ✅ camelCase en TS

  @Column({ type: 'varchar', name: 'fecha_fin', nullable: true })
  fechaFin?: string;

  @Column({ type: 'int', name: 'proceso_general_id' })  // ✅ FK con _id
  procesoGeneralId: number;  // ✅ camelCase en TS

  @ManyToOne(() => ProcesoGeneral, (pg) => pg.jornadas)
  @JoinColumn({ name: 'proceso_general_id' })
  procesoGeneral?: ProcesoGeneral;
}
```

### DTO

**Ubicación:** `packages/api/src/modules/jornada/dto/crear-jornada.dto.ts`

```typescript
import { IsString, IsNumber } from 'class-validator';

export class CrearJornadaDto {  // ✅ PascalCase
  @IsString()
  fechaInicio: string;  // ✅ camelCase

  @IsString()
  fechaFin?: string;

  @IsNumber()
  procesoGeneralId: number;  // ✅ camelCase
}
```

### Servicio

**Ubicación:** `packages/api/src/modules/jornada/jornada.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jornada } from './entities/jornada.entity';
import { CrearJornadaDto } from './dto/crear-jornada.dto';

@Injectable()
export class JornadaService {  // ✅ PascalCase
  constructor(
    @InjectRepository(Jornada)
    private jornadaRepository: Repository<Jornada>,  // ✅ camelCase
  ) {}

  async crearJornada(dto: CrearJornadaDto) {  // ✅ camelCase español
    return await this.jornadaRepository.save(dto);
  }

  async obtenerJornadas() {  // ✅ camelCase español
    return await this.jornadaRepository.find();
  }
}
```

### Controlador

**Ubicación:** `packages/api/src/modules/jornada/jornada.controller.ts`

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { JornadaService } from './jornada.service';
import { CrearJornadaDto } from './dto/crear-jornada.dto';

@Controller('jornada')  // ✅ kebab-case en ruta
export class JornadaController {  // ✅ PascalCase
  constructor(private readonly jornadaService: JornadaService) {}  // ✅ camelCase

  @Post()
  crearJornada(@Body() dto: CrearJornadaDto) {  // ✅ camelCase español
    return this.jornadaService.crearJornada(dto);
  }

  @Get()
  obtenerJornadas() {  // ✅ camelCase español
    return this.jornadaService.obtenerJornadas();
  }
}
```

## Ejemplo Completo Frontend: Equipamiento

### Type

**Ubicación:** `packages/front/src/types/index.d.ts`

```typescript
export type Equipamiento = {  // ✅ PascalCase
  id?: number;
  nombre: string;  // ✅ camelCase
  tipoId?: number;  // ✅ camelCase
  anio?: string;
  kilometraje?: string;
}
```

### Form Schema

**Ubicación:** `packages/front/src/components/forms/equipamiento-form.tsx`

```typescript
import { z } from 'zod';

const formSchema = z.object({  // ✅ camelCase
  nombre: z.string(),  // ✅ camelCase
  tipoId: z.number().optional(),
  anio: z.string().optional(),
  kilometraje: z.string().optional(),
});
```

### Component

**Archivo:** `equipamiento-form.tsx` (✅ kebab-case)

```typescript
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

export default function EquipamientoForm({ datos }: { datos?: Equipamiento }) {  // ✅ PascalCase
  const formulario = useForm<z.infer<typeof formSchema>>({  // ✅ camelCase
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: datos?.nombre || "",
      tipoId: datos?.tipoId,
      anio: datos?.anio,
    }
  })

  async function manejarEnvio(valores: z.infer<typeof formSchema>) {  // ✅ camelCase español
    // Lógica de envío
  }

  return (
    <form onSubmit={formulario.handleSubmit(manejarEnvio)}>
      {/* Campos del formulario */}
    </form>
  )
}
```

## Comparación: ❌ Incorrecto vs ✅ Correcto

### Código en Español

```typescript
// ❌ INCORRECTO - Inglés
@Entity('equipment')
export class Equipment extends BaseEntity {
  @Column({ name: 'year_manufactured' })
  yearManufactured: string;

  async createEquipment(dto: CreateEquipmentDto) { }
}

// ✅ CORRECTO - Español
@Entity('equipamiento')
export class Equipamiento extends BaseEntity {
  @Column({ name: 'anio_fabricacion' })
  anioFabricacion: string;

  async crearEquipamiento(dto: CrearEquipamientoDto) { }
}
```

### Columnas BD

```typescript
// ❌ INCORRECTO - Sin name (usa camelCase en BD)
@Column({ type: 'int' })
procesoGeneralId: number;

// ❌ INCORRECTO - camelCase en name
@Column({ name: 'procesoGeneralId' })
procesoGeneralId: number;

// ✅ CORRECTO - snake_case con name explícito
@Column({ name: 'proceso_general_id', type: 'int' })
procesoGeneralId: number;
```

### Archivos

```
❌ INCORRECTO:
Equipamiento.controller.ts  // PascalCase
equipamiento_service.ts     // snake_case
EquipamientoForm.tsx        // PascalCase

✅ CORRECTO:
equipamiento.controller.ts  // kebab-case
equipamiento.service.ts     // kebab-case
equipamiento-form.tsx       // kebab-case
```

### Variables y Funciones

```typescript
// ❌ INCORRECTO - snake_case
const fecha_inicio = '2025-05-11';
const equipamiento_activo = true;
async function crear_equipamiento() { }

// ❌ INCORRECTO - PascalCase
const FechaInicio = '2025-05-11';
const EquipamientoActivo = true;
async function CrearEquipamiento() { }

// ✅ CORRECTO - camelCase
const fechaInicio = '2025-05-11';
const equipamientoActivo = true;
async function crearEquipamiento() { }
```

### Clases

```typescript
// ❌ INCORRECTO - camelCase
export class equipamiento { }

// ❌ INCORRECTO - snake_case
export class equipamiento_tipo { }

// ✅ CORRECTO - PascalCase
export class Equipamiento { }
export class EquipamientoTipo { }
```

### Constantes

```typescript
// ❌ INCORRECTO - camelCase
const maxLimit = 100;
const apiBaseUrl = 'http://localhost:3001';

// ✅ CORRECTO - UPPER_SNAKE_CASE
const MAX_LIMIT = 100;
const API_BASE_URL = 'http://localhost:3001';
```

## Caso Real: Proceso General

### Backend

```typescript
// Entidad
@Entity('proceso_general')  // ✅ snake_case
export class ProcesoGeneral extends BaseEntity {  // ✅ PascalCase
  @Column({ name: 'fecha_inicio', type: 'varchar' })  // ✅ snake_case + name
  fechaInicio: string;  // ✅ camelCase

  @Column({ name: 'estado_actual_id', type: 'int' })  // ✅ FK con _id
  estadoActualId: number;  // ✅ camelCase
}

// DTO
export class CrearProcesoGeneralDto {  // ✅ PascalCase
  @IsString()
  fechaInicio: string;  // ✅ camelCase

  @IsNumber()
  estadoActualId: number;  // ✅ camelCase
}

// Servicio
async crearProcesoGeneral(dto: CrearProcesoGeneralDto) {  // ✅ camelCase
  return await this.procesoGeneralRepository.save(dto);
}
```

### Frontend

```typescript
// Type
export type ProcesoGeneral = {  // ✅ PascalCase
  id?: number;
  fechaInicio: string;  // ✅ camelCase
  estadoActualId?: number;  // ✅ camelCase
}

// Schema
const formSchema = z.object({  // ✅ camelCase
  fechaInicio: z.string(),  // ✅ camelCase
  estadoActualId: z.number().optional(),
});

// Component (archivo: proceso-general-form.tsx)
export default function ProcesoGeneralForm() {  // ✅ PascalCase
  const formulario = useForm();  // ✅ camelCase
  // ...
}
```

## Estructura de Directorios

```
✅ CORRECTO:
packages/
├── api/
│   └── src/
│       └── modules/
│           ├── equipamiento/
│           │   ├── equipamiento.controller.ts
│           │   ├── equipamiento.service.ts
│           │   ├── equipamiento.module.ts
│           │   ├── entities/
│           │   │   └── equipamiento.entity.ts
│           │   └── dto/
│           │       ├── crear-equipamiento.dto.ts
│           │       └── actualizar-equipamiento.dto.ts
│           └── proceso-general/
│               ├── proceso-general.controller.ts
│               └── proceso-general.service.ts
└── front/
    └── src/
        ├── components/
        │   └── forms/
        │       ├── equipamiento-form.tsx
        │       └── proceso-general-form.tsx
        ├── services/
        │   ├── equipamiento.ts
        │   └── proceso-general.ts
        └── types/
            └── index.d.ts

❌ INCORRECTO:
- Equipamiento.controller.ts  (PascalCase)
- equipamiento_service.ts     (snake_case)
- EquipamientoForm.tsx        (PascalCase)
```

## Notas de Implementación

1. **Idioma español** - Todo excepto términos técnicos
2. **name explícito** - Siempre en columnas BD
3. **snake_case BD** - Tablas y columnas
4. **camelCase TS** - Variables y funciones
5. **PascalCase** - Clases, interfaces, types, componentes
6. **kebab-case** - Archivos y directorios
7. **UPPER_SNAKE_CASE** - Constantes
8. **Sufijo _id** - Claves foráneas
