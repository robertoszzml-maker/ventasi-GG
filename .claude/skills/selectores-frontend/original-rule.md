# Selectores Frontend (Autocomplete)

Usar `AutocompleteSelector` reutilizable en `components/selectors/[entidad]-selector.tsx`.

## Template

```typescript
"use client";
import * as React from "react";
import type { MiEntidad } from "@/types";
import { useGetMiEntidadesQuery } from "@/hooks/mi-entidad";
import { AutocompleteSelector, AutocompleteSelectorConfig } from "./autocomplete-selector";

const miEntidadConfig: AutocompleteSelectorConfig<MiEntidad> = {
  useQuery: useGetMiEntidadesQuery,
  searchField: "nombre",  // Campo de búsqueda
  getDisplayValue: (item) => {
    if (!item) return "Seleccione entidad";
    return item.campoSecundario
      ? `${item.nombre} (${item.campoSecundario})`
      : item.nombre;
  },
  getItemKey: (item) => item.id!,
  renderItem: (item) => (
    <span>
      {item.nombre}
      {item.campoSecundario && (
        <span className="text-muted-foreground ml-1">({item.campoSecundario})</span>
      )}
    </span>
  ),
  placeholder: "Buscar entidad",
};

interface MiEntidadSelectorProps {
  value?: MiEntidad;  // ✅ Objeto completo
  onChange?: (item: MiEntidad) => void;  // ✅ Recibe objeto completo
  disabled?: boolean;
}

export function MiEntidadSelector({ value, onChange, disabled = false }: MiEntidadSelectorProps) {
  return <AutocompleteSelector value={value} onChange={onChange} disabled={disabled} config={miEntidadConfig} />;
}
```

## Config (AutocompleteSelectorConfig)

| Prop | Requerido | Descripción |
|------|-----------|-------------|
| `useQuery` | ✅ | Hook React Query |
| `searchField` | ✅ | Campo por el que se busca (ej: "nombre", "razonSocial") |
| `getDisplayValue` | ✅ | Texto en el botón selector |
| `getItemKey` | ✅ | ID único → `(item) => item.id!` |
| `renderItem` | ⚪ | Renderizado custom en lista |
| `sortField` | ⚪ | Campo de ordenamiento (default: searchField) |
| `placeholder` | ⚪ | Placeholder del input (default: "Buscar...") |
| `pageSize` | ⚪ | Items por página (default: 20) |
| `debounceMs` | ⚪ | Delay búsqueda (default: 500ms) |

## getDisplayValue

```typescript
getDisplayValue: (item) => {
  if (!item) return "Seleccione proveedor";  // ✅ Siempre manejar caso null

  // Opción 1: Solo campo principal
  return item.nombre;

  // Opción 2: Campo principal + secundario
  return item.nombreFantasia
    ? `${item.razonSocial} (${item.nombreFantasia})`
    : item.razonSocial;
}
```

## renderItem (Opcional)

```typescript
// Sin renderItem → usa getDisplayValue por defecto

// Con campo secundario
renderItem: (item) => (
  <span>
    {item.razonSocial}
    {item.nombreFantasia && (
      <span className="text-muted-foreground ml-1">({item.nombreFantasia})</span>
    )}
  </span>
)

// Renderizado complejo
renderItem: (item) => (
  <div className="flex flex-col">
    <span>{item.nombre}</span>
    {item.codigo && <span className="text-xs text-muted-foreground">Código: {item.codigo}</span>}
  </div>
)
```

## Uso en Formularios

```typescript
<FormField
  control={form.control}
  name="proveedorId"  // ✅ Schema tiene proveedorId: z.number().optional()
  render={({ field }) => (
    <FormItem>
      <FormLabel>Proveedor</FormLabel>
      <ProveedorSelector
        value={data?.proveedor}  // ✅ Objeto completo poblado
        onChange={(proveedor) => {
          field.onChange(proveedor.id);  // ✅ Guardar solo ID
        }}
      />
      <FormMessage />
    </FormItem>
  )}
/>
```

**Flujo:**
1. Schema: `proveedorId: z.number().optional()`
2. defaultValues: `proveedorId: data?.proveedorId`
3. Selector value: `data?.proveedor` (objeto completo)
4. onChange: Extrae `proveedor.id` y guarda en form
5. onSubmit: Envía `proveedorId` (number) al backend

## Anti-patrones

```typescript
// ❌ NO
value={data?.proveedorId}  // Error: espera objeto, no ID
onChange={field.onChange}  // Error: recibe objeto, no ID
onChange={(prov) => field.onChange(prov)}  // Error: schema espera number

// ✅ SÍ
value={data?.proveedor}  // Objeto completo
onChange={(prov) => field.onChange(prov.id)}  // Solo ID
```

## Funcionalidades Incluidas

`AutocompleteSelector` proporciona automáticamente:

- Búsqueda con debounce (500ms)
- Paginación (scroll infinito)
- Carga bajo demanda
- Estados (loading, error, vacío)
- Accesibilidad (aria, role)
- Keyboard navigation

## Resumen

| Aspecto | Valor |
|---------|-------|
| Ubicación | `components/selectors/[entidad]-selector.tsx` |
| Config | `AutocompleteSelectorConfig<T>` |
| Props | `value?: T`, `onChange?: (T) => void` |
| value | Objeto completo (NO ID) |
| onChange | Recibe objeto completo |
| Uso en form | `onChange={(item) => field.onChange(item.id)}` |
| Schema | `[entidad]Id: z.number().optional()` |
