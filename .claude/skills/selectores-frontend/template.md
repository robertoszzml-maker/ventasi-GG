# Template: Selector Frontend

Template base para crear un selector autocomplete reutilizable.

## Archivo Selector

```typescript
// packages/front/src/components/selectors/<entidad>-selector.tsx
"use client";
import * as React from "react";
import type { <Entidad> } from "@/types";
import { useGet<Entidades>Query } from "@/hooks/<entidad>";
import { AutocompleteSelector, AutocompleteSelectorConfig } from "./autocomplete-selector";

const <entidad>Config: AutocompleteSelectorConfig<<Entidad>> = {
  useQuery: useGet<Entidades>Query,
  searchField: "<campo_busqueda>",  // Ej: "nombre", "razonSocial"
  getDisplayValue: (item) => {
    if (!item) return "Seleccione <entidad>";
    return item.<campo>;
  },
  getItemKey: (item) => item.id!,
  placeholder: "Buscar <entidad>",
};

interface <Entidad>SelectorProps {
  value?: <Entidad>;
  onChange?: (item: <Entidad>) => void;
  disabled?: boolean;
}

export function <Entidad>Selector({ value, onChange, disabled = false }: <Entidad>SelectorProps) {
  return <AutocompleteSelector value={value} onChange={onChange} disabled={disabled} config={<entidad>Config} />;
}
```

---

## Con Campo Secundario

```typescript
const <entidad>Config: AutocompleteSelectorConfig<<Entidad>> = {
  useQuery: useGet<Entidades>Query,
  searchField: "<campo_principal>",
  getDisplayValue: (item) => {
    if (!item) return "Seleccione <entidad>";
    return item.<campo_secundario>
      ? `${item.<campo_principal>} (${item.<campo_secundario>})`
      : item.<campo_principal>;
  },
  getItemKey: (item) => item.id!,
  renderItem: (item) => (
    <span>
      {item.<campo_principal>}
      {item.<campo_secundario> && (
        <span className="text-muted-foreground ml-1">({item.<campo_secundario>})</span>
      )}
    </span>
  ),
  placeholder: "Buscar <entidad>",
};
```

---

## Con Renderizado Multi-línea

```typescript
const <entidad>Config: AutocompleteSelectorConfig<<Entidad>> = {
  useQuery: useGet<Entidades>Query,
  searchField: "nombre",
  getDisplayValue: (item) => {
    if (!item) return "Seleccione <entidad>";
    return item.nombre;
  },
  getItemKey: (item) => item.id!,
  renderItem: (item) => (
    <div className="flex flex-col py-1">
      <span className="font-medium">{item.nombre}</span>
      <div className="flex gap-2 text-xs text-muted-foreground">
        {item.<campo1> && <span><Campo1>: {item.<campo1>}</span>}
        {item.<campo2> && <span>• {item.<campo2>}</span>}
      </div>
    </div>
  ),
  placeholder: "Buscar <entidad>",
};
```

---

## Uso en Formulario

```typescript
// packages/front/src/components/forms/<formulario>-form.tsx
import { <Entidad>Selector } from "@/components/selectors/<entidad>-selector";

// Schema
const formSchema = z.object({
  <entidad>Id: z.number().optional(),  // ✅ Solo ID
  // ... otros campos
});

// defaultValues
const form = useForm({
  defaultValues: {
    <entidad>Id: data?.<entidad>Id,  // ✅ Solo ID
  }
});

// FormField
<FormField
  control={form.control}
  name="<entidad>Id"
  render={({ field }) => (
    <FormItem>
      <FormLabel><Entidad></FormLabel>
      <<Entidad>Selector
        value={data?.<entidad>}              // ✅ Objeto completo
        onChange={(<entidad>) => field.onChange(<entidad>.id)}  // ✅ Extraer ID
      />
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## Backend (Poplar Relación)

```typescript
// packages/api/src/modules/<modulo>/<modulo>.service.ts
async findOne(id: number) {
  return await this.repository.findOne({
    where: { id },
    relations: ['<entidad>'],  // ✅ Popula relación
  });
}
```

---

## Type (Si no existe)

```typescript
// packages/front/src/types/index.d.ts
export type <Entidad> = {
  id?: number;
  <campo_principal>: string;
  <campo_secundario>?: string;
  // ... otros campos
}
```

---

## Hook (Si no existe)

```typescript
// packages/front/src/hooks/<entidad>.tsx
import { useQuery } from '@tanstack/react-query';
import { <Entidad>, Query } from '@/types';
import { fetch } from '@/services/<entidad>';

export const useGet<Entidades>Query = (query: Query) => {
  return useQuery({
    queryKey: ['<entidades>', query],
    queryFn: () => fetch(query),
  });
};
```

---

## Service (Si no existe)

```typescript
// packages/front/src/services/<entidad>.ts
import { <Entidad>, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper';

const basePath = '<entidad>';

export const fetch = async (query: Query): Promise<<Entidad>[]> => {
  return fetchClient<<Entidad>[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};
```

---

## Placeholders

Reemplazar en template:

- `<entidad>`: nombre en singular minúscula → `proveedor`
- `<Entidad>`: nombre clase PascalCase → `Proveedor`
- `<entidades>`: nombre plural minúscula → `proveedores`
- `<Entidades>`: nombre plural PascalCase → `Proveedores`
- `<campo_busqueda>`: campo para búsqueda → `"razonSocial"`
- `<campo_principal>`: campo principal → `"nombre"`
- `<campo_secundario>`: campo opcional → `"nombreFantasia"`
- `<modulo>`: nombre del módulo backend → `oferta`
