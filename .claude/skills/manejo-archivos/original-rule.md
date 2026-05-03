# Manejo de Archivos

Sistema centralizado de archivos con relaciones polimórficas.

## Tabla archivo

```sql
CREATE TABLE `archivo` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(255),
  `nombre_archivo` VARCHAR(255) NOT NULL,  -- Hex único
  `nombre_archivo_original` VARCHAR(255) NOT NULL,
  `url` VARCHAR(500),  -- Path relativo
  `extension` VARCHAR(100) NOT NULL,  -- MIME type
  `modelo` VARCHAR(100) NOT NULL,  -- Entidad (ej: 'equipamiento')
  `modelo_id` INT NOT NULL,  -- ID de entidad
  `tipo` VARCHAR(100) NOT NULL,  -- Categoría (ej: 'adjunto', 'foto')
  INDEX `idx_archivo_modelo` (`modelo`, `modelo_id`)
);
```

**Relación polimórfica**: `modelo` + `modelo_id` + `tipo`

## Componentes Frontend

### ImagenesInput (Múltiples imágenes)

```typescript
import ImagenesInput from '@/components/form-helpers/imagenes-input';

<ImagenesInput
  label="Fotos"
  value={imagenes}
  setValue={setImagenes}
  defaultValue={data?.adjuntos}  // Array de Archivo[]
/>
```

- Preview con miniaturas
- Solo `.jpg`, `.jpeg`, `.png`
- Click abre en nueva pestaña

### ArchivosInput (Documentos generales)

```typescript
import { ArchivosInput } from '@/components/form-helpers/archivos-input';

<ArchivosInput
  label="Documentos"
  value={archivos}
  setValue={setArchivos}
  defaultValue={data?.archivo}  // Archivo único
  variant="default"  // o "compact"
/>
```

- Variante `compact` para espacios reducidos
- Para 1 solo archivo

## Uso en Formularios

### Upload Múltiple

```typescript
"use client"
import { useFileUploadHandler } from '@/hooks/file-upload'

export default function MyForm({ data }: { data?: MiEntidad }) {
  const { handleMultipleFileUpload } = useFileUploadHandler();
  const [fotos, setFotos] = useState<File[]>([]);

  async function onSubmit(values) {
    const response = await (values.id ? edit(values) : create(values));

    // Subir múltiples fotos
    await handleMultipleFileUpload({
      data: data,  // Para eliminar fotos viejas
      fileArray: fotos,
      modelo: 'mi_entidad',
      modeloId: response.id,
      tipo: 'foto',
    });

    toast({ description: 'Guardado' });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <ImagenesInput label="Fotos" value={fotos} setValue={setFotos} />
      <LoadingButton type="submit">Guardar</LoadingButton>
    </form>
  );
}
```

### Upload Único (actualizable)

```typescript
export default function MyForm({ data }: { data?: MiEntidad }) {
  const { handleFileUpload } = useFileUploadHandler();
  const [archivos, setArchivos] = useState<File[]>([]);

  async function onSubmit(values) {
    const response = await edit(values);

    // Actualizar archivo existente
    await handleFileUpload({
      fileId: data?.archivo?.id,  // ✅ ID para actualizar
      fileArray: archivos,
      modelo: 'mi_entidad',
      modeloId: response.id,
      tipo: 'adjunto',
    });

    toast({ description: 'Actualizado' });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <ArchivosInput
        label="Documento"
        value={archivos}
        setValue={setArchivos}
        defaultValue={data?.archivo}
      />
      <LoadingButton type="submit">Guardar</LoadingButton>
    </form>
  );
}
```

## Backend

### Entidad

```typescript
@Entity("equipamiento")
export class Equipamiento extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  nombre: string;

  // Campo virtual para archivos
  adjuntos?: Archivo[];
}
```

### Servicio (Múltiples archivos)

```typescript
@Injectable()
export class MiService {
  constructor(
    @InjectRepository(MiEntidad)
    private repo: Repository<MiEntidad>,
    @InjectRepository(Archivo)
    private archivoRepo: Repository<Archivo>
  ) {}

  async findOne(id: number) {
    const entidad = await this.repo.findOne({ where: { id } });

    if (entidad) {
      entidad.adjuntos = await this.archivoRepo.find({
        where: {
          modelo: "mi_entidad",
          modeloId: id,
          tipo: "adjunto",
        },
      });
    }

    return entidad;
  }
}
```

### Servicio (1 archivo por tipo)

```typescript
async findOne(id: number) {
  const entidad = await this.repo.findOne({ where: { id } });

  if (!entidad) throw new NotFoundException();

  // Cargar archivos específicos
  entidad['contratoArchivo'] = await this.archivoRepo.findOne({
    where: { modelo: 'mi_entidad', modeloId: id, tipo: 'contrato' },
    order: { id: 'DESC' }
  });

  entidad['fichaTecnicaArchivo'] = await this.archivoRepo.findOne({
    where: { modelo: 'mi_entidad', modeloId: id, tipo: 'ficha_tecnica' },
    order: { id: 'DESC' }
  });

  return entidad;
}
```

### Módulo

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([
      MiEntidad,
      Archivo,  // ✅ Importar para usarlo en servicio
    ]),
  ],
  // ...
})
```

### Types Frontend

```typescript
export type MiEntidad = {
  id?: number;
  nombre: string;
  adjuntos?: Archivo[];  // ✅ Campo virtual para archivos
};
```

## Hooks Disponibles

```typescript
// Múltiples archivos
const { handleMultipleFileUpload } = useFileUploadHandler();
await handleMultipleFileUpload({
  data: dataAnterior,  // Para eliminar viejos
  fileArray: archivos,
  modelo: 'entidad_nombre',
  modeloId: id,
  tipo: 'foto',
});

// Archivo único (actualizable)
const { handleFileUpload } = useFileUploadHandler();
await handleFileUpload({
  fileId: archivoAnterior?.id,  // ID para actualizar
  fileArray: archivos,
  modelo: 'entidad_nombre',
  modeloId: id,
  tipo: 'adjunto',
});
```

## Checklist

- [ ] Importar `Archivo` en módulo backend
- [ ] Inyectar `archivoRepository` en servicio
- [ ] Cargar archivos en `findOne()` con where polimórfico
- [ ] Campo virtual `adjuntos?: Archivo[]` en entidad
- [ ] Usar `ImagenesInput` para imágenes múltiples
- [ ] Usar `ArchivosInput` para documentos
- [ ] `handleMultipleFileUpload` con `data` para eliminar viejos
- [ ] `handleFileUpload` con `fileId` para actualizar
- [ ] `modelo` en snake_case (ej: `'alquiler_mantenimiento'`)

## Resumen

| Aspecto | Valor |
|---------|-------|
| Tabla | `archivo` (relación polimórfica) |
| Frontend múltiple | `ImagenesInput` + `handleMultipleFileUpload` |
| Frontend único | `ArchivosInput` + `handleFileUpload` |
| Backend cargar | `archivoRepo.find({ modelo, modeloId, tipo })` |
| Actualizar | Pasar `fileId` del archivo anterior |
| Módulo | Importar `TypeOrmModule.forFeature([Archivo])` |
