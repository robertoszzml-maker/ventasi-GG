# Template - Manejo de Archivos

Plantillas para implementar archivos polimórficos. Reemplazar placeholders según la entidad.

## Placeholders

- `[MiEntidad]` → Nombre en PascalCase (ej: `Equipamiento`, `Proveedor`)
- `[mi-entidad]` → Nombre en kebab-case (ej: `equipamiento`, `proveedor`)
- `[mi_entidad]` → Nombre en snake_case (ej: `equipamiento`, `alquiler_mantenimiento`)
- `[tipo]` → Tipo de archivo (ej: `foto`, `adjunto`, `contrato`)

---

## Template Backend - Módulo

```typescript
// [mi-entidad].module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { [MiEntidad] } from './entities/[mi-entidad].entity';
import { Archivo } from '@/modules/archivo/entities/archivo.entity';
import { [MiEntidad]Controller } from './[mi-entidad].controller';
import { [MiEntidad]Service } from './[mi-entidad].service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      [MiEntidad],
      Archivo,  // ✅ Importar Archivo
    ]),
  ],
  controllers: [[MiEntidad]Controller],
  providers: [[MiEntidad]Service],
})
export class [MiEntidad]Module {}
```

---

## Template Backend - Servicio (Múltiples Archivos)

```typescript
// [mi-entidad].service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { [MiEntidad] } from './entities/[mi-entidad].entity';
import { Archivo } from '@/modules/archivo/entities/archivo.entity';

@Injectable()
export class [MiEntidad]Service {
  constructor(
    @InjectRepository([MiEntidad])
    private repository: Repository<[MiEntidad]>,
    @InjectRepository(Archivo)
    private archivoRepository: Repository<Archivo>,  // ✅ Inyectar
  ) {}

  async findOne(id: number) {
    const entidad = await this.repository.findOne({ where: { id } });

    if (entidad) {
      // Cargar archivos múltiples
      entidad.adjuntos = await this.archivoRepository.find({
        where: {
          modelo: '[mi_entidad]',  // ✅ snake_case
          modeloId: id,
          tipo: '[tipo]',  // ej: 'foto', 'adjunto'
        },
      });
    }

    return entidad;
  }
}
```

---

## Template Backend - Servicio (Archivos Únicos por Tipo)

```typescript
// [mi-entidad].service.ts
async findOne(id: number) {
  const entidad = await this.repository.findOne({ where: { id } });

  if (!entidad) throw new NotFoundException();

  // Cargar diferentes tipos de archivos (uno por tipo)
  entidad['contratoArchivo'] = await this.archivoRepository.findOne({
    where: { modelo: '[mi_entidad]', modeloId: id, tipo: 'contrato' },
    order: { id: 'DESC' },  // Más reciente
  });

  entidad['fichaTecnicaArchivo'] = await this.archivoRepository.findOne({
    where: { modelo: '[mi_entidad]', modeloId: id, tipo: 'ficha_tecnica' },
    order: { id: 'DESC' },
  });

  entidad['logoArchivo'] = await this.archivoRepository.findOne({
    where: { modelo: '[mi_entidad]', modeloId: id, tipo: 'logo' },
    order: { id: 'DESC' },
  });

  return entidad;
}
```

---

## Template Backend - Entidad

```typescript
// [mi-entidad].entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '@/common/base.entity';
import { Archivo } from '@/modules/archivo/entities/archivo.entity';

@Entity('[mi-entidad]')
export class [MiEntidad] extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  // Campos virtuales para archivos (NO usar @Column)
  adjuntos?: Archivo[];  // Para múltiples archivos

  // O campos específicos por tipo
  contratoArchivo?: Archivo;
  fichaTecnicaArchivo?: Archivo;
  logoArchivo?: Archivo;
}
```

---

## Template Frontend - Types

```typescript
// types/index.d.ts
export type [MiEntidad] = {
  id?: number;
  nombre: string;

  // Campos virtuales para archivos
  adjuntos?: Archivo[];  // Para múltiples

  // O campos específicos
  contratoArchivo?: Archivo;
  fichaTecnicaArchivo?: Archivo;
  logoArchivo?: Archivo;
};
```

---

## Template Frontend - Formulario (Múltiples Fotos)

```typescript
// [mi-entidad]-form.tsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useFileUploadHandler } from "@/hooks/file-upload";
import ImagenesInput from "@/components/form-helpers/imagenes-input";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  useCreate[MiEntidad]Mutation,
  useEdit[MiEntidad]Mutation,
} from "@/hooks/[mi-entidad]";

export default function [MiEntidad]Form({ data }) {
  const { toast } = useToast();
  const router = useRouter();
  const { handleMultipleFileUpload } = useFileUploadHandler();
  const [fotos, setFotos] = useState<File[]>([]);

  const form = useForm({
    defaultValues: {
      id: data?.id,
      nombre: data?.nombre || "",
    },
  });

  const { mutateAsync: create, isPending: isPendingCreate } =
    useCreate[MiEntidad]Mutation();
  const { mutateAsync: edit, isPending: isPendingEdit } =
    useEdit[MiEntidad]Mutation();

  async function onSubmit(values) {
    try {
      let response;
      if (values.id) {
        response = await edit({ id: values.id, data: values });
      } else {
        response = await create(values);
      }

      // Subir fotos múltiples
      await handleMultipleFileUpload({
        data: data,  // Para eliminar fotos viejas
        fileArray: fotos,
        modelo: '[mi_entidad]',  // snake_case
        modeloId: response.id!,
        tipo: '[tipo]',  // ej: 'foto', 'adjunto'
      });

      toast({ description: 'Guardado correctamente' });
      router.back();
    } catch (error) {
      toast({
        description: 'Error al guardar',
        variant: 'destructive',
      });
    }
  }

  const isPending = isPendingCreate || isPendingEdit;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Campos del formulario */}

      <ImagenesInput
        label="Fotos"
        value={fotos}
        setValue={setFotos}
        defaultValue={data?.adjuntos}
      />

      <LoadingButton loading={isPending} type="submit">
        Guardar
      </LoadingButton>
    </form>
  );
}
```

---

## Template Frontend - Formulario (Documento Único)

```typescript
// [mi-entidad]-form.tsx
"use client";
import { useState } from "react";
import { useFileUploadHandler } from "@/hooks/file-upload";
import { ArchivosInput } from "@/components/form-helpers/archivos-input";

export default function [MiEntidad]Form({ data }) {
  const { handleFileUpload } = useFileUploadHandler();
  const [documento, setDocumento] = useState<File[]>([]);

  async function onSubmit(values) {
    try {
      // Guardar entidad
      const response = await edit({ id: data.id, data: values });

      // Actualizar documento
      await handleFileUpload({
        fileId: data?.contratoArchivo?.id,  // ✅ ID para actualizar
        fileArray: documento,
        modelo: '[mi_entidad]',  // snake_case
        modeloId: response.id,
        tipo: 'contrato',
      });

      toast({ description: 'Actualizado correctamente' });
      router.back();
    } catch (error) {
      toast({ description: 'Error', variant: 'destructive' });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <ArchivosInput
        label="Contrato"
        value={documento}
        setValue={setDocumento}
        defaultValue={data?.contratoArchivo}
        variant="default"  // o "compact"
      />

      <button type="submit">Guardar</button>
    </form>
  );
}
```

---

## Template Frontend - Múltiples Tipos de Archivos

```typescript
// [mi-entidad]-form.tsx
"use client";
import { useState } from "react";
import { useFileUploadHandler } from "@/hooks/file-upload";
import { ArchivosInput } from "@/components/form-helpers/archivos-input";
import ImagenesInput from "@/components/form-helpers/imagenes-input";

export default function [MiEntidad]Form({ data }) {
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
      modelo: '[mi_entidad]',
      modeloId: response.id,
      tipo: 'contrato',
    });

    // Subir ficha técnica
    await handleFileUpload({
      fileId: data?.fichaTecnicaArchivo?.id,
      fileArray: fichaTecnica,
      modelo: '[mi_entidad]',
      modeloId: response.id,
      tipo: 'ficha_tecnica',
    });

    // Subir fotos múltiples
    await handleMultipleFileUpload({
      data: data,
      fileArray: fotos,
      modelo: '[mi_entidad]',
      modeloId: response.id,
      tipo: 'foto',
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
        label="Fotos"
        value={fotos}
        setValue={setFotos}
        defaultValue={data?.fotos}
      />

      <button type="submit">Guardar</button>
    </form>
  );
}
```

---

## Checklist de Reemplazo

- [ ] Reemplazar `[MiEntidad]` con PascalCase
- [ ] Reemplazar `[mi-entidad]` con kebab-case
- [ ] Reemplazar `[mi_entidad]` con snake_case
- [ ] Reemplazar `[tipo]` con tipo específico
- [ ] Verificar imports de `Archivo`
- [ ] Verificar inyección de `archivoRepository`
- [ ] Verificar campos virtuales en entidad
- [ ] Verificar hooks de upload

## Ejemplo de Reemplazo

Para `Equipamiento` con fotos:

```typescript
// Reemplazos:
[MiEntidad] → Equipamiento
[mi-entidad] → equipamiento
[mi_entidad] → equipamiento
[tipo] → foto

// Resultado:
modelo: 'equipamiento',
tipo: 'foto',
```

Para `AlquilerMantenimiento` con contrato:

```typescript
// Reemplazos:
[MiEntidad] → AlquilerMantenimiento
[mi-entidad] → alquiler-mantenimiento
[mi_entidad] → alquiler_mantenimiento
[tipo] → contrato

// Resultado:
modelo: 'alquiler_mantenimiento',  // ✅ snake_case
tipo: 'contrato',
```
