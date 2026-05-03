# Referencia Técnica - Manejo de Archivos

Documentación completa del sistema de archivos polimórficos.

## Tabla archivo

### Estructura SQL

```sql
CREATE TABLE `archivo` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(255),                    -- Nombre descriptivo (opcional)
  `nombre_archivo` VARCHAR(255) NOT NULL,   -- Nombre hexadecimal único
  `nombre_archivo_original` VARCHAR(255) NOT NULL,  -- Nombre original del archivo
  `url` VARCHAR(500),                       -- Path relativo al archivo
  `extension` VARCHAR(100) NOT NULL,        -- MIME type (ej: 'image/jpeg')
  `modelo` VARCHAR(100) NOT NULL,           -- Entidad (ej: 'equipamiento')
  `modelo_id` INT NOT NULL,                 -- ID de la entidad
  `tipo` VARCHAR(100) NOT NULL,             -- Categoría (ej: 'foto', 'adjunto')
  INDEX `idx_archivo_modelo` (`modelo`, `modelo_id`)
);
```

### Relación Polimórfica

Los archivos se relacionan con cualquier entidad usando 3 campos:

```typescript
modelo: string      // Nombre de la entidad en snake_case
modeloId: number    // ID de la entidad
tipo: string        // Categoría del archivo
```

**Ejemplo:**
```typescript
{
  modelo: 'equipamiento',
  modeloId: 42,
  tipo: 'foto'
}
```

## Backend

### 1. Módulo

Importar `Archivo` en el módulo de la entidad:

```typescript
import { Archivo } from '@/modules/archivo/entities/archivo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MiEntidad,
      Archivo,  // ✅ Importar para usar en servicio
    ]),
  ],
  controllers: [MiEntidadController],
  providers: [MiEntidadService],
})
export class MiEntidadModule {}
```

### 2. Servicio - Inyectar Repository

```typescript
import { Archivo } from '@/modules/archivo/entities/archivo.entity';

@Injectable()
export class MiEntidadService {
  constructor(
    @InjectRepository(MiEntidad)
    private repository: Repository<MiEntidad>,
    @InjectRepository(Archivo)
    private archivoRepository: Repository<Archivo>,  // ✅ Inyectar
  ) {}
}
```

### 3. Servicio - Cargar Archivos Múltiples

```typescript
async findOne(id: number) {
  const entidad = await this.repository.findOne({ where: { id } });

  if (entidad) {
    // Cargar todos los archivos de un tipo
    entidad.adjuntos = await this.archivoRepository.find({
      where: {
        modelo: 'mi_entidad',      // snake_case
        modeloId: id,
        tipo: 'adjunto',           // o 'foto', 'documento', etc.
      },
    });
  }

  return entidad;
}
```

### 4. Servicio - Cargar Archivos Específicos (1 por tipo)

```typescript
async findOne(id: number) {
  const entidad = await this.repository.findOne({ where: { id } });

  if (!entidad) throw new NotFoundException();

  // Cargar diferentes tipos de archivos
  entidad['contratoArchivo'] = await this.archivoRepository.findOne({
    where: { modelo: 'mi_entidad', modeloId: id, tipo: 'contrato' },
    order: { id: 'DESC' }  // Obtener el más reciente
  });

  entidad['fichaTecnicaArchivo'] = await this.archivoRepository.findOne({
    where: { modelo: 'mi_entidad', modeloId: id, tipo: 'ficha_tecnica' },
    order: { id: 'DESC' }
  });

  entidad['logoArchivo'] = await this.archivoRepository.findOne({
    where: { modelo: 'mi_entidad', modeloId: id, tipo: 'logo' },
    order: { id: 'DESC' }
  });

  return entidad;
}
```

### 5. Entidad - Campo Virtual

```typescript
@Entity('mi_entidad')
export class MiEntidad extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  // Campo virtual para archivos (NO mapear a columna)
  adjuntos?: Archivo[];

  // O campos específicos por tipo
  contratoArchivo?: Archivo;
  fichaTecnicaArchivo?: Archivo;
  logoArchivo?: Archivo;
}
```

**Importante:** No usar decorador `@Column` ni `@OneToMany` para campos de archivos.

## Frontend

### Types

```typescript
export type MiEntidad = {
  id?: number;
  nombre: string;
  adjuntos?: Archivo[];  // ✅ Campo virtual para archivos múltiples

  // O campos específicos
  contratoArchivo?: Archivo;
  fichaTecnicaArchivo?: Archivo;
  logoArchivo?: Archivo;
};

export type Archivo = {
  id?: number;
  nombre?: string;
  nombreArchivo: string;
  nombreArchivoOriginal: string;
  url?: string;
  extension: string;
  modelo: string;
  modeloId: number;
  tipo: string;
};
```

### Componentes de Input

#### ImagenesInput (Múltiples imágenes)

```typescript
import ImagenesInput from '@/components/form-helpers/imagenes-input';

// En el componente
const [fotos, setFotos] = useState<File[]>([]);

<ImagenesInput
  label="Fotos del Equipamiento"
  value={fotos}
  setValue={setFotos}
  defaultValue={data?.adjuntos}  // Array de Archivo[]
/>
```

**Características:**
- Preview con miniaturas
- Solo acepta `.jpg`, `.jpeg`, `.png`
- Click en miniatura abre en nueva pestaña
- Drag & drop soportado

#### ArchivosInput (Documentos)

```typescript
import { ArchivosInput } from '@/components/form-helpers/archivos-input';

// En el componente
const [documento, setDocumento] = useState<File[]>([]);

<ArchivosInput
  label="Contrato"
  value={documento}
  setValue={setDocumento}
  defaultValue={data?.contratoArchivo}  // Archivo único
  variant="default"  // o "compact"
/>
```

**Variantes:**
- `default` - Tamaño completo con preview
- `compact` - Versión reducida para espacios pequeños

### Hooks de Upload

#### handleMultipleFileUpload (Múltiples archivos)

```typescript
import { useFileUploadHandler } from '@/hooks/file-upload';

const { handleMultipleFileUpload } = useFileUploadHandler();
const [fotos, setFotos] = useState<File[]>([]);

async function onSubmit(values) {
  // 1. Guardar entidad principal
  const response = await (values.id ? edit(values) : create(values));

  // 2. Subir archivos
  await handleMultipleFileUpload({
    data: data,           // ✅ Datos anteriores (para eliminar viejos)
    fileArray: fotos,     // Archivos nuevos
    modelo: 'equipamiento',  // snake_case
    modeloId: response.id,
    tipo: 'foto',
  });

  toast({ description: 'Guardado' });
}
```

**Parámetros:**
- `data`: Datos anteriores de la entidad (opcional, para eliminar archivos viejos)
- `fileArray`: Array de archivos nuevos a subir
- `modelo`: Nombre de la entidad en snake_case
- `modeloId`: ID de la entidad
- `tipo`: Categoría del archivo

#### handleFileUpload (Archivo único actualizable)

```typescript
import { useFileUploadHandler } from '@/hooks/file-upload';

const { handleFileUpload } = useFileUploadHandler();
const [documento, setDocumento] = useState<File[]>([]);

async function onSubmit(values) {
  // 1. Actualizar entidad principal
  const response = await edit(values);

  // 2. Actualizar archivo
  await handleFileUpload({
    fileId: data?.contratoArchivo?.id,  // ✅ ID para actualizar existente
    fileArray: documento,
    modelo: 'proveedor',
    modeloId: response.id,
    tipo: 'contrato',
  });

  toast({ description: 'Actualizado' });
}
```

**Parámetros:**
- `fileId`: ID del archivo existente (opcional, para actualizar)
- `fileArray`: Array con el nuevo archivo
- `modelo`: Nombre de la entidad en snake_case
- `modeloId`: ID de la entidad
- `tipo`: Categoría del archivo

### Ejemplo Completo de Formulario

#### Múltiples Fotos

```typescript
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useFileUploadHandler } from "@/hooks/file-upload";
import ImagenesInput from "@/components/form-helpers/imagenes-input";

export default function EquipamientoForm({ data }) {
  const { handleMultipleFileUpload } = useFileUploadHandler();
  const [fotos, setFotos] = useState<File[]>([]);

  const form = useForm({
    defaultValues: {
      nombre: data?.nombre || "",
    },
  });

  async function onSubmit(values) {
    // 1. Guardar entidad
    const response = await (data?.id
      ? editEquipamiento(data.id, values)
      : createEquipamiento(values)
    );

    // 2. Subir fotos
    await handleMultipleFileUpload({
      data: data,
      fileArray: fotos,
      modelo: 'equipamiento',
      modeloId: response.id,
      tipo: 'foto',
    });

    router.back();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Campos del formulario */}

      <ImagenesInput
        label="Fotos"
        value={fotos}
        setValue={setFotos}
        defaultValue={data?.adjuntos}
      />

      <button type="submit">Guardar</button>
    </form>
  );
}
```

#### Documento Único Actualizable

```typescript
"use client";
import { useState } from "react";
import { useFileUploadHandler } from "@/hooks/file-upload";
import { ArchivosInput } from "@/components/form-helpers/archivos-input";

export default function ProveedorForm({ data }) {
  const { handleFileUpload } = useFileUploadHandler();
  const [contrato, setContrato] = useState<File[]>([]);

  async function onSubmit(values) {
    // 1. Actualizar proveedor
    const response = await editProveedor(data.id, values);

    // 2. Actualizar contrato
    await handleFileUpload({
      fileId: data?.contratoArchivo?.id,  // Actualiza si existe
      fileArray: contrato,
      modelo: 'proveedor',
      modeloId: response.id,
      tipo: 'contrato',
    });

    router.back();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <ArchivosInput
        label="Contrato"
        value={contrato}
        setValue={setContrato}
        defaultValue={data?.contratoArchivo}
        variant="compact"
      />

      <button type="submit">Guardar</button>
    </form>
  );
}
```

## Tipos de Archivo Comunes

| Tipo | Uso | Componente |
|------|-----|------------|
| `foto` | Imágenes del equipamiento | `ImagenesInput` |
| `adjunto` | Documentos generales | `ArchivosInput` |
| `contrato` | Contratos específicos | `ArchivosInput` |
| `ficha_tecnica` | Fichas técnicas | `ArchivosInput` |
| `logo` | Logos de empresas | `ArchivosInput` |
| `documento` | Documentos varios | `ArchivosInput` |

## Modelos Comunes

| Entidad | Modelo | Ejemplo Tipo |
|---------|--------|--------------|
| Equipamiento | `equipamiento` | `foto`, `adjunto` |
| Proveedor | `proveedor` | `contrato`, `logo` |
| Banco | `banco` | `logo` |
| Alquiler Mantenimiento | `alquiler_mantenimiento` | `adjunto` |
| Proceso General | `proceso_general` | `documento` |

## Anti-patrones

### ❌ Usar Relaciones TypeORM

```typescript
// INCORRECTO - No usar relaciones ORM
@Entity('equipamiento')
export class Equipamiento {
  @OneToMany(() => Archivo, archivo => archivo.equipamiento)
  archivos: Archivo[];  // ❌ NO
}
```

### ❌ Olvidar Importar Archivo

```typescript
// INCORRECTO
@Module({
  imports: [
    TypeOrmModule.forFeature([MiEntidad]),  // ❌ Falta Archivo
  ],
})
```

### ❌ Modelo en camelCase

```typescript
// INCORRECTO
await handleMultipleFileUpload({
  modelo: 'alquilerMantenimiento',  // ❌ camelCase
  modeloId: id,
  tipo: 'foto',
});

// CORRECTO
await handleMultipleFileUpload({
  modelo: 'alquiler_mantenimiento',  // ✅ snake_case
  modeloId: id,
  tipo: 'foto',
});
```

### ❌ No Pasar data en Múltiples

```typescript
// INCORRECTO - No elimina archivos viejos
await handleMultipleFileUpload({
  // data: data,  // ❌ Falta
  fileArray: fotos,
  modelo: 'equipamiento',
  modeloId: id,
  tipo: 'foto',
});

// CORRECTO
await handleMultipleFileUpload({
  data: data,  // ✅ Para eliminar viejos
  fileArray: fotos,
  modelo: 'equipamiento',
  modeloId: id,
  tipo: 'foto',
});
```

### ❌ No Pasar fileId en Actualización

```typescript
// INCORRECTO - Crea archivo nuevo en vez de actualizar
await handleFileUpload({
  // fileId: data?.archivo?.id,  // ❌ Falta
  fileArray: archivos,
  modelo: 'proveedor',
  modeloId: id,
  tipo: 'contrato',
});

// CORRECTO
await handleFileUpload({
  fileId: data?.archivo?.id,  // ✅ Actualiza existente
  fileArray: archivos,
  modelo: 'proveedor',
  modeloId: id,
  tipo: 'contrato',
});
```

## Checklist de Implementación

### Backend
- [ ] Importar `Archivo` en `TypeOrmModule.forFeature()`
- [ ] Inyectar `archivoRepository` en constructor del servicio
- [ ] Cargar archivos en `findOne()` con `where` polimórfico
- [ ] Agregar campo virtual en entidad (NO `@Column`)
- [ ] Usar `modelo` en snake_case
- [ ] Usar `order: { id: 'DESC' }` para archivo más reciente

### Frontend Types
- [ ] Agregar campo virtual en type
- [ ] Tipo correcto (`Archivo[]` o `Archivo`)

### Frontend Formulario
- [ ] Import de hook `useFileUploadHandler`
- [ ] Estado local para archivos (`useState<File[]>`)
- [ ] Componente de input correcto (`ImagenesInput` o `ArchivosInput`)
- [ ] `defaultValue` con datos existentes
- [ ] Upload DESPUÉS de guardar entidad principal
- [ ] Pasar `data` en múltiples o `fileId` en único

## Resumen

| Aspecto | Valor |
|---------|-------|
| Tabla | `archivo` (relación polimórfica) |
| Backend - Import | `TypeOrmModule.forFeature([Archivo])` |
| Backend - Inject | `@InjectRepository(Archivo)` |
| Backend - Cargar | `archivoRepo.find({ modelo, modeloId, tipo })` |
| Frontend - Múltiple | `ImagenesInput` + `handleMultipleFileUpload` |
| Frontend - Único | `ArchivosInput` + `handleFileUpload` |
| Modelo | snake_case (ej: `'alquiler_mantenimiento'`) |
| Tipo | Categoría libre (ej: `'foto'`, `'contrato'`) |
