# Referencia Técnica: Idioma y Nomenclatura

## Principio General

Todo en español excepto términos técnicos estándar.

## Tabla de Formatos

| Contexto | Formato | Ejemplo |
|----------|---------|---------|
| Archivos/directorios | kebab-case | `equipamiento-tipo.entity.ts` |
| Columnas BD | snake_case | `proceso_general_id` |
| Variables/Funciones | camelCase | `procesoGeneralId` |
| Clases/Interfaces | PascalCase | `ProcesoGeneral` |
| Constantes | UPPER_SNAKE_CASE | `MAX_LIMIT` |

## Reglas Detalladas

### 1. Código en Español

**✅ Correcto:**
```typescript
@Entity('equipamiento')
export class Equipamiento extends BaseEntity {
  @Column({ name: 'anio_fabricacion' })
  anioFabricacion: string;

  async crearEquipamiento(dto: CrearEquipamientoDto) { }
}
```

**❌ Incorrecto:**
```typescript
@Entity('equipment')
export class Equipment extends BaseEntity {
  @Column({ name: 'year_manufactured' })
  yearManufactured: string;

  async createEquipment(dto: CreateEquipmentDto) { }
}
```

**Excepciones aceptables:**
- Términos técnicos: `controller`, `service`, `repository`, `dto`, `entity`
- Librerías: `useQuery`, `useState`, `useForm`
- HTTP: `GET`, `POST`, `PATCH`, `DELETE`

### 2. Columnas BD en snake_case

**Regla crítica:** Siempre especificar `name` explícitamente en `@Column()`.

**✅ Correcto:**
```typescript
@Column({ name: 'proceso_general_id', type: 'int' })
procesoGeneralId: number;

@Column({ name: 'fecha_inicio', type: 'varchar' })
fechaInicio: string;
```

**❌ Incorrecto:**
```typescript
// Sin especificar name (usaría camelCase en BD)
@Column({ type: 'int' })
procesoGeneralId: number;

// camelCase en name (incorrecto en BD)
@Column({ name: 'procesoGeneralId' })
procesoGeneralId: number;
```

**FKs siempre con sufijo `_id`:**
```typescript
@Column({ name: 'proceso_general_id', type: 'int' })
procesoGeneralId: number;

@Column({ name: 'equipamiento_tipo_id', type: 'int' })
equipamientoTipoId: number;
```

### 3. Archivos en kebab-case

**✅ Correcto:**
```
src/modules/equipamiento/equipamiento.controller.ts
src/components/forms/proveedor-form.tsx
src/services/cuenta-contable.ts
```

**❌ Incorrecto:**
```
Equipamiento.controller.ts  // PascalCase
equipamiento_service.ts     // snake_case
EquipamientoForm.tsx        // PascalCase
```

**Reglas:**
- Directorios: kebab-case español
- Archivos: kebab-case español
- Componentes React: kebab-case (NO PascalCase en archivo)

### 4. Variables/Funciones camelCase

**✅ Correcto:**
```typescript
const equipamientoActivo = true;
const fechaInicio = '2025-05-11';
async function crearEquipamiento() { }
const handleSubmit = () => { };
```

**❌ Incorrecto:**
```typescript
const equipamiento_activo = true;  // snake_case
const FechaInicio = '2025-05-11';  // PascalCase
async function CrearEquipamiento() { }  // PascalCase
```

### 5. Clases/Interfaces PascalCase

**✅ Correcto:**
```typescript
export class Equipamiento { }
export class CrearEquipamientoDto { }
export interface ProcesoGeneral { }
export type CuentaContable = { };
```

**❌ Incorrecto:**
```typescript
export class equipamiento { }  // camelCase
export class crear_equipamiento_dto { }  // snake_case
```

### 6. Constantes UPPER_SNAKE_CASE

**✅ Correcto:**
```typescript
const MAX_LIMIT = 100;
const API_BASE_URL = 'http://localhost:3001';
const PERMISOS = {
  EQUIPAMIENTO_VER: 'EQUIPAMIENTO_VER',
  EQUIPAMIENTO_CREAR: 'EQUIPAMIENTO_CREAR',
};
```

**❌ Incorrecto:**
```typescript
const maxLimit = 100;  // camelCase
const apiBaseUrl = 'http://localhost:3001';  // camelCase
```

## Anti-patrones

```typescript
// ❌ NO
const fecha_inicio = '2025-05-11';  // snake_case en TS
@Column({ name: 'procesoGeneralId' })  // camelCase en BD
async createEquipment() { }  // Inglés en funciones
export class Equipment { }  // Inglés en clases
@Column({ type: 'int' })  // Sin name explícito
procesoGeneralId: number;  // Usaría camelCase en BD

// ✅ SÍ
const fechaInicio = '2025-05-11';  // camelCase en TS
@Column({ name: 'proceso_general_id' })  // snake_case en BD con name
async crearEquipamiento() { }  // Español
export class Equipamiento { }  // Español
```

## Checklist de Implementación

### Backend:
- [ ] Variables/funciones camelCase español
- [ ] Clases PascalCase español
- [ ] Archivos kebab-case español
- [ ] Columnas BD snake_case con `name` explícito
- [ ] Comentarios español
- [ ] Mensajes error/log español
- [ ] FKs con sufijo `_id`
- [ ] Nombres de tablas en snake_case

### Frontend:
- [ ] Variables/funciones camelCase español
- [ ] Componentes PascalCase español (clase, NO archivo)
- [ ] Archivos kebab-case español
- [ ] Props camelCase español
- [ ] Comentarios español
- [ ] Mensajes usuario español
- [ ] Types PascalCase español

### BD:
- [ ] Tablas snake_case
- [ ] Columnas snake_case
- [ ] FKs con sufijo `_id`
- [ ] Nombres descriptivos en español

## Tabla Resumen

| Aspecto | Valor |
|---------|-------|
| Idioma | Español (código, comentarios, docs) |
| Excepciones | Términos técnicos (controller, service) |
| Archivos | kebab-case español |
| Columnas BD | snake_case con `name` explícito |
| Variables | camelCase español |
| Clases | PascalCase español |
| Constantes | UPPER_SNAKE_CASE |
| FKs | sufijo `_id` |

## Mapeo BD ↔ TypeScript

### Entidad

```typescript
@Entity('proceso_general')  // ✅ snake_case en BD
export class ProcesoGeneral extends BaseEntity {  // ✅ PascalCase en TS
  @Column({ name: 'fecha_inicio' })  // ✅ snake_case con name
  fechaInicio: string;  // ✅ camelCase en TS

  @Column({ name: 'equipamiento_tipo_id' })  // ✅ snake_case + _id
  equipamientoTipoId: number;  // ✅ camelCase en TS
}
```

### DTO

```typescript
export class CrearProcesoGeneralDto {  // ✅ PascalCase
  @IsString()
  fechaInicio: string;  // ✅ camelCase

  @IsNumber()
  equipamientoTipoId: number;  // ✅ camelCase
}
```

### Type Frontend

```typescript
export type ProcesoGeneral = {  // ✅ PascalCase
  id?: number;
  fechaInicio: string;  // ✅ camelCase
  equipamientoTipoId?: number;  // ✅ camelCase
}
```

## Excepciones Aceptables

**Términos técnicos en inglés:**
- Archivos: `.controller.ts`, `.service.ts`, `.entity.ts`, `.dto.ts`
- Decoradores: `@Controller()`, `@Injectable()`, `@Entity()`
- Métodos framework: `useQuery()`, `useState()`, `useForm()`
- HTTP: `GET`, `POST`, `PATCH`, `DELETE`

**Todo lo demás en español.**
