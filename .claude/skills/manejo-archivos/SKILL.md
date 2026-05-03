---
name: manejo-archivos
description: Sistema centralizado de archivos con relaciones polimórficas
license: MIT
---

# Manejo de Archivos

Sistema centralizado para subir/descargar archivos usando relaciones polimórficas.

## Input

- `<entidad>`: Nombre de la entidad (ej: `equipamiento`, `proveedor`)
- `<tipo>`: Tipo de archivo (ej: `foto`, `adjunto`, `contrato`)
- `<multiple>`: Si permite múltiples archivos (default: true)

**Ejemplo:** `/manejo-archivos equipamiento foto multiple`

## Steps

1. **Configurar Backend**
   - Importar `Archivo` en módulo de la entidad
   - Inyectar `archivoRepository` en servicio
   - Cargar archivos en `findOne()` usando relación polimórfica
   - Agregar campo virtual en entidad

2. **Configurar Type Frontend**
   - Agregar campo `adjuntos?: Archivo[]` en type

3. **Agregar Input en Formulario**
   - Usar `ImagenesInput` para fotos múltiples
   - Usar `ArchivosInput` para documentos únicos
   - Estado local para archivos nuevos

4. **Implementar Upload**
   - Usar `handleMultipleFileUpload` para múltiples
   - Usar `handleFileUpload` para único actualizable
   - Llamar después de guardar entidad principal

5. **Configurar Modelo**
   - Usar `modelo` en snake_case
   - Especificar `tipo` según categoría
   - Pasar `modeloId` de la entidad

## Output

**Backend:**
```typescript
// Servicio carga archivos polimórficos
entidad.adjuntos = await archivoRepo.find({
  where: { modelo: 'equipamiento', modeloId: id, tipo: 'foto' }
});
```

**Frontend:**
```typescript
// Upload múltiple
await handleMultipleFileUpload({
  data: dataAnterior,
  fileArray: fotos,
  modelo: 'equipamiento',
  modeloId: response.id,
  tipo: 'foto',
});
```

## Recursos

- [📖 Referencia Técnica](reference.md) - Patrones backend y frontend
- [💡 Ejemplos](examples.md) - Casos de uso reales
- [📋 Template](template.md) - Código base para copiar

## Componentes Disponibles

| Componente | Uso | Tipo |
|------------|-----|------|
| `ImagenesInput` | Fotos múltiples | `.jpg`, `.jpeg`, `.png` |
| `ArchivosInput` | Documentos únicos | Cualquier tipo |
| `ArchivosInput` (compact) | Espacios reducidos | Variante compacta |

## Hooks Disponibles

| Hook | Descripción |
|------|-------------|
| `handleMultipleFileUpload` | Subir múltiples archivos (elimina viejos) |
| `handleFileUpload` | Subir/actualizar archivo único |
| `useDeleteArchivoMutation` | Eliminar archivo por ID |
| `useDownloadArchivoByIdQuery` | Descargar archivo como blob |

## Relación Polimórfica

La tabla `archivo` usa 3 campos para relacionar archivos con cualquier entidad:

```typescript
modelo: 'equipamiento'     // Nombre de la entidad (snake_case)
modeloId: 123             // ID de la entidad
tipo: 'foto'              // Categoría del archivo
```

## Reglas Críticas

✅ **SÍ hacer:**
- Usar `modelo` en snake_case (ej: `'alquiler_mantenimiento'`)
- Importar `Archivo` en `TypeOrmModule.forFeature()`
- Cargar archivos en `findOne()` manualmente
- Pasar `data` anterior para eliminar archivos viejos
- Pasar `fileId` para actualizar archivo existente

❌ **NO hacer:**
- Usar relaciones TypeORM tradicionales (`@OneToMany`)
- Olvidar inyectar `archivoRepository`
- Hardcodear modelo/tipo sin constantes
- Subir antes de crear la entidad principal
- Usar `modelo` en camelCase

## Notes

- Los archivos se almacenan con nombres hexadecimales únicos
- El sistema maneja automáticamente la eliminación de archivos viejos
- Preview de imágenes se genera automáticamente en `ImagenesInput`
- `ArchivosInput` soporta variante `compact` para espacios pequeños
- Los tipos MIME se detectan automáticamente del archivo
