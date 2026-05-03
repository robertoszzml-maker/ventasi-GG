---
name: selectores-frontend
description: Crear selectores autocomplete con búsqueda y paginación
license: MIT
---

Genera selectores autocomplete reutilizables usando `AutocompleteSelector` con búsqueda, paginación y scroll infinito.

## Input

- `<entidad>`: Nombre de la entidad en singular (ej: `proveedor`, `cliente`)

**Ejemplo:** `/selectores-frontend proveedor`

## Steps

### 1. Validar Entidad

- Verificar que existe el hook `useGet[Entidades]Query` en `hooks/[entidad].tsx`
- Verificar que existe el tipo en `types/index.d.ts`

### 2. Crear Archivo Selector

Ubicación: `components/selectors/[entidad]-selector.tsx`

Ver [template.md](template.md) para estructura completa.

### 3. Configurar AutocompleteSelectorConfig

Ver [reference.md](reference.md#config) para:
- `useQuery`: Hook React Query
- `searchField`: Campo de búsqueda
- `getDisplayValue`: Texto en botón
- `getItemKey`: ID único
- `renderItem`: (Opcional) Renderizado custom

### 4. Definir Props del Selector

```typescript
interface [Entidad]SelectorProps {
  value?: [Entidad];           // Objeto completo
  onChange?: (item: [Entidad]) => void;  // Recibe objeto
  disabled?: boolean;
}
```

### 5. Implementar en Formularios

Ver [reference.md](reference.md#uso-en-formularios) para:
- Schema: `[entidad]Id: z.number().optional()`
- value: `data?.[entidad]` (objeto completo)
- onChange: `(item) => field.onChange(item.id)`

## Output

```
✅ Selector creado: [Entidad]Selector

📄 components/selectors/[entidad]-selector.tsx

🔧 Funcionalidades automáticas:
   - Búsqueda con debounce (500ms)
   - Paginación (scroll infinito)
   - Estados (loading, error, vacío)
   - Accesibilidad completa

📋 Uso en formularios:
   <[Entidad]Selector
     value={data?.[entidad]}
     onChange={(item) => field.onChange(item.id)}
   />
```

## Errores

- Hook no existe → Crear con `/hooks-frontend [entidad]`
- Tipo no existe → Agregar en `types/index.d.ts`

## Notes

- Ver [examples.md](examples.md) para casos completos
- `AutocompleteSelector` maneja búsqueda, paginación y estados
- Siempre pasar objeto completo, NO solo ID
- En formularios, extraer `.id` en onChange
