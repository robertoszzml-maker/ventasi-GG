# Ejemplos - Manejo de Archivos

Casos de uso reales del sistema de archivos polimórficos.

## Ejemplo 1: Fotos de Equipamiento (Múltiples)

### Backend

```typescript
// equipamiento.module.ts
import { Archivo } from '@/modules/archivo/entities/archivo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Equipamiento,
      Archivo,  // ✅ Importar
    ]),
  ],
  // ...
})
export class EquipamientoModule {}
```

```typescript
// equipamiento.service.ts
@Injectable()
export class EquipamientoService {
  constructor(
    @InjectRepository(Equipamiento)
    private repository: Repository<Equipamiento>,
    @InjectRepository(Archivo)
    private archivoRepository: Repository<Archivo>,
  ) {}

  async findOne(id: number) {
    const equipamiento = await this.repository.findOne({ where: { id } });

    if (equipamiento) {
      // Cargar todas las fotos
      equipamiento.adjuntos = await this.archivoRepository.find({
        where: {
          modelo: 'equipamiento',
          modeloId: id,
          tipo: 'adjunto',
        },
      });
    }

    return equipamiento;
  }
}
```

```typescript
// equipamiento.entity.ts
@Entity('equipamiento')
export class Equipamiento extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  // Campo virtual (NO @Column)
  adjuntos?: Archivo[];
}
```

### Frontend

```typescript
// equipamiento-form.tsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useFileUploadHandler } from "@/hooks/file-upload";
import ImagenesInput from "@/components/form-helpers/imagenes-input";
import {
  useCreateEquipamientoMutation,
  useEditEquipamientoMutation,
} from "@/hooks/equipamiento";

export default function EquipamientoForm({ data }) {
  const { handleMultipleFileUpload } = useFileUploadHandler();
  const [fotos, setFotos] = useState<File[]>([]);

  const form = useForm({
    defaultValues: {
      nombre: data?.nombre || "",
      tipoId: data?.tipoId,
    },
  });

  const { mutateAsync: create } = useCreateEquipamientoMutation();
  const { mutateAsync: edit } = useEditEquipamientoMutation();

  async function onSubmit(values) {
    try {
      let response;
      if (values.id) {
        response = await edit({ id: values.id, data: values });
      } else {
        response = await create(values);
      }

      // Subir fotos después de guardar
      await handleMultipleFileUpload({
        data: data,  // Para eliminar fotos viejas
        fileArray: fotos,
        modelo: 'equipamiento',
        modeloId: response.id!,
        tipo: 'adjunto',
      });

      toast({ description: 'Equipamiento guardado' });
      router.back();
    } catch (error) {
      toast({ description: 'Error al guardar', variant: 'destructive' });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Campos del formulario */}

      <ImagenesInput
        label="Fotos del Equipamiento"
        value={fotos}
        setValue={setFotos}
        defaultValue={data?.adjuntos}
      />

      <button type="submit">Guardar</button>
    </form>
  );
}
```

```typescript
// types/index.d.ts
export type Equipamiento = {
  id?: number;
  nombre: string;
  tipoId?: number;
  adjuntos?: Archivo[];  // ✅ Campo virtual
};
```

## Ejemplo 2: Contrato de Proveedor (Único Actualizable)

### Backend

```typescript
// proveedor.service.ts
async findOne(id: number) {
  const proveedor = await this.repository.findOne({ where: { id } });

  if (!proveedor) throw new NotFoundException();

  // Cargar último contrato
  proveedor['contratoArchivo'] = await this.archivoRepository.findOne({
    where: {
      modelo: 'proveedor',
      modeloId: id,
      tipo: 'contrato',
    },
    order: { id: 'DESC' },  // Más reciente
  });

  return proveedor;
}
```

### Frontend

```typescript
// proveedor-form.tsx
"use client";
import { useState } from "react";
import { useFileUploadHandler } from "@/hooks/file-upload";
import { ArchivosInput } from "@/components/form-helpers/archivos-input";

export default function ProveedorForm({ data }) {
  const { handleFileUpload } = useFileUploadHandler();
  const [contrato, setContrato] = useState<File[]>([]);

  async function onSubmit(values) {
    // 1. Actualizar proveedor
    const response = await edit({ id: data.id, data: values });

    // 2. Actualizar contrato (reemplaza el anterior)
    await handleFileUpload({
      fileId: data?.contratoArchivo?.id,  // ✅ ID para actualizar
      fileArray: contrato,
      modelo: 'proveedor',
      modeloId: response.id,
      tipo: 'contrato',
    });

    toast({ description: 'Proveedor actualizado' });
    router.back();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <ArchivosInput
        label="Contrato del Proveedor"
        value={contrato}
        setValue={setContrato}
        defaultValue={data?.contratoArchivo}
      />

      <button type="submit">Guardar</button>
    </form>
  );
}
```

## Ejemplo 3: Logo de Banco (Único)

### Backend

```typescript
// banco.service.ts
async findOne(id: number) {
  const banco = await this.repository.findOne({ where: { id } });

  if (!banco) throw new NotFoundException();

  // Cargar logo
  banco['logo'] = await this.archivoRepository.findOne({
    where: {
      modelo: 'banco',
      modeloId: id,
      tipo: 'logo',
    },
    order: { id: 'DESC' },
  });

  return banco;
}
```

### Frontend

```typescript
// banco-form.tsx
"use client";
import { useState } from "react";
import { useFileUploadHandler } from "@/hooks/file-upload";
import { ArchivosInput } from "@/components/form-helpers/archivos-input";

export default function BancoForm({ data }) {
  const { handleFileUpload } = useFileUploadHandler();
  const [logo, setLogo] = useState<File[]>([]);

  async function onSubmit(values) {
    let id;
    if (data?.id) {
      await edit({ id: data.id, data: values });
      id = data.id;
    } else {
      const response = await create(values);
      id = response.id;
    }

    // Subir logo
    if (id) {
      await handleFileUpload({
        fileId: data?.logo?.id,
        fileArray: logo,
        modelo: 'banco',
        modeloId: id,
        tipo: 'logo',
      });
    }

    toast({ description: 'Banco guardado' });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <ArchivosInput
        label="Logo del Banco"
        value={logo}
        setValue={(files) => setLogo(files || [])}
        defaultValue={data?.logo}
      />

      <button type="submit">Guardar</button>
    </form>
  );
}
```

## Ejemplo 4: Múltiples Tipos de Archivos

### Backend

```typescript
// alquiler-mantenimiento.service.ts
async findOne(id: number) {
  const alquiler = await this.repository.findOne({ where: { id } });

  if (!alquiler) throw new NotFoundException();

  // Cargar diferentes tipos
  alquiler['contratoArchivo'] = await this.archivoRepository.findOne({
    where: { modelo: 'alquiler_mantenimiento', modeloId: id, tipo: 'contrato' },
    order: { id: 'DESC' },
  });

  alquiler['fichaTecnicaArchivo'] = await this.archivoRepository.findOne({
    where: { modelo: 'alquiler_mantenimiento', modeloId: id, tipo: 'ficha_tecnica' },
    order: { id: 'DESC' },
  });

  alquiler['fotosEquipamiento'] = await this.archivoRepository.find({
    where: { modelo: 'alquiler_mantenimiento', modeloId: id, tipo: 'foto_equipamiento' },
  });

  return alquiler;
}
```

### Frontend

```typescript
// alquiler-mantenimiento-form.tsx
"use client";
import { useState } from "react";
import { useFileUploadHandler } from "@/hooks/file-upload";
import { ArchivosInput } from "@/components/form-helpers/archivos-input";
import ImagenesInput from "@/components/form-helpers/imagenes-input";

export default function AlquilerMantenimientoForm({ data }) {
  const { handleFileUpload, handleMultipleFileUpload } = useFileUploadHandler();

  const [contrato, setContrato] = useState<File[]>([]);
  const [fichaTecnica, setFichaTecnica] = useState<File[]>([]);
  const [fotos, setFotos] = useState<File[]>([]);

  async function onSubmit(values) {
    const response = await (data?.id
      ? edit({ id: data.id, data: values })
      : create(values)
    );

    // Subir contrato
    await handleFileUpload({
      fileId: data?.contratoArchivo?.id,
      fileArray: contrato,
      modelo: 'alquiler_mantenimiento',
      modeloId: response.id,
      tipo: 'contrato',
    });

    // Subir ficha técnica
    await handleFileUpload({
      fileId: data?.fichaTecnicaArchivo?.id,
      fileArray: fichaTecnica,
      modelo: 'alquiler_mantenimiento',
      modeloId: response.id,
      tipo: 'ficha_tecnica',
    });

    // Subir fotos múltiples
    await handleMultipleFileUpload({
      data: data,
      fileArray: fotos,
      modelo: 'alquiler_mantenimiento',
      modeloId: response.id,
      tipo: 'foto_equipamiento',
    });

    toast({ description: 'Guardado correctamente' });
    router.back();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <ArchivosInput
        label="Contrato"
        value={contrato}
        setValue={setContrato}
        defaultValue={data?.contratoArchivo}
      />

      <ArchivosInput
        label="Ficha Técnica"
        value={fichaTecnica}
        setValue={setFichaTecnica}
        defaultValue={data?.fichaTecnicaArchivo}
        variant="compact"
      />

      <ImagenesInput
        label="Fotos del Equipamiento"
        value={fotos}
        setValue={setFotos}
        defaultValue={data?.fotosEquipamiento}
      />

      <button type="submit">Guardar</button>
    </form>
  );
}
```

## Ejemplo 5: Descargar Archivo

```typescript
import { useDownloadArchivoByIdQuery } from "@/hooks/archivo";
import { useEffect, useState } from "react";

function BancoLogo({ logo }: { logo?: Archivo }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { data: blob } = useDownloadArchivoByIdQuery(logo?.id, {
    enabled: !!logo?.id,
  });

  useEffect(() => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [blob]);

  if (imageUrl) {
    return <img src={imageUrl} alt="Logo" />;
  }

  return <div>Sin logo</div>;
}
```

## Comparación: ❌ Incorrecto vs ✅ Correcto

### Módulo

```typescript
// ❌ INCORRECTO - Falta importar Archivo
@Module({
  imports: [
    TypeOrmModule.forFeature([Equipamiento]),
  ],
})

// ✅ CORRECTO
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Equipamiento,
      Archivo,  // ✅ Importar
    ]),
  ],
})
```

### Servicio - Inyección

```typescript
// ❌ INCORRECTO - Falta inyectar archivoRepository
constructor(
  @InjectRepository(Equipamiento)
  private repository: Repository<Equipamiento>,
) {}

// ✅ CORRECTO
constructor(
  @InjectRepository(Equipamiento)
  private repository: Repository<Equipamiento>,
  @InjectRepository(Archivo)
  private archivoRepository: Repository<Archivo>,
) {}
```

### Modelo en camelCase vs snake_case

```typescript
// ❌ INCORRECTO - camelCase
await handleMultipleFileUpload({
  modelo: 'alquilerMantenimiento',
  modeloId: id,
  tipo: 'foto',
});

// ✅ CORRECTO - snake_case
await handleMultipleFileUpload({
  modelo: 'alquiler_mantenimiento',
  modeloId: id,
  tipo: 'foto',
});
```

### Olvidar data en Múltiples

```typescript
// ❌ INCORRECTO - No elimina archivos viejos
await handleMultipleFileUpload({
  fileArray: fotos,
  modelo: 'equipamiento',
  modeloId: id,
  tipo: 'foto',
});

// ✅ CORRECTO - Pasa data para eliminar viejos
await handleMultipleFileUpload({
  data: data,  // ✅
  fileArray: fotos,
  modelo: 'equipamiento',
  modeloId: id,
  tipo: 'foto',
});
```

### Olvidar fileId en Actualización

```typescript
// ❌ INCORRECTO - Crea nuevo en vez de actualizar
await handleFileUpload({
  fileArray: contrato,
  modelo: 'proveedor',
  modeloId: id,
  tipo: 'contrato',
});

// ✅ CORRECTO - Actualiza existente
await handleFileUpload({
  fileId: data?.contratoArchivo?.id,  // ✅
  fileArray: contrato,
  modelo: 'proveedor',
  modeloId: id,
  tipo: 'contrato',
});
```

### Usar Relaciones ORM

```typescript
// ❌ INCORRECTO - No usar relaciones ORM
@Entity('equipamiento')
export class Equipamiento {
  @OneToMany(() => Archivo, archivo => archivo.equipamiento)
  archivos: Archivo[];  // ❌
}

// ✅ CORRECTO - Campo virtual sin decorador
@Entity('equipamiento')
export class Equipamiento {
  adjuntos?: Archivo[];  // ✅ Sin @Column ni @OneToMany
}
```

## Checklist por Ejemplo

### Backend
- [ ] `Archivo` en `TypeOrmModule.forFeature()`
- [ ] `archivoRepository` inyectado
- [ ] Archivos cargados en `findOne()`
- [ ] `where` con modelo + modeloId + tipo
- [ ] modelo en snake_case
- [ ] `order: { id: 'DESC' }` para más reciente (único)
- [ ] Campo virtual sin decorador en entidad

### Frontend
- [ ] Import `useFileUploadHandler`
- [ ] Estado local `useState<File[]>()`
- [ ] Componente correcto (`ImagenesInput` o `ArchivosInput`)
- [ ] `defaultValue` con datos existentes
- [ ] Upload DESPUÉS de guardar entidad
- [ ] `data` en múltiples o `fileId` en único
- [ ] modelo en snake_case
- [ ] Campo virtual en type

## Resumen de Patrones

| Caso de Uso | Hook | Componente | Params Clave |
|-------------|------|------------|--------------|
| Fotos múltiples | `handleMultipleFileUpload` | `ImagenesInput` | `data` |
| Documento único | `handleFileUpload` | `ArchivosInput` | `fileId` |
| Logo | `handleFileUpload` | `ArchivosInput` | `fileId` |
| Múltiples tipos | Ambos | Ambos | Según tipo |
| Descarga | `useDownloadArchivoByIdQuery` | - | `archivo.id` |
