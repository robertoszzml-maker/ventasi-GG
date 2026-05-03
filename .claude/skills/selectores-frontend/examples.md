# Selectores Frontend - Ejemplos

Ejemplos completos de selectores autocomplete del proyecto.

## Ejemplo 1: ProveedorSelector (Campo Secundario)

### Selector

```typescript
// packages/front/src/components/selectors/proveedor-selector.tsx
"use client";
import * as React from "react";
import type { Proveedor } from "@/types";
import { useGetProveedoresQuery } from "@/hooks/proveedor";
import { AutocompleteSelector, AutocompleteSelectorConfig } from "./autocomplete-selector";

const proveedorConfig: AutocompleteSelectorConfig<Proveedor> = {
  useQuery: useGetProveedoresQuery,
  searchField: "razonSocial",
  getDisplayValue: (item) => {
    if (!item) return "Seleccione proveedor";
    return item.nombreFantasia
      ? `${item.razonSocial} (${item.nombreFantasia})`
      : item.razonSocial;
  },
  getItemKey: (item) => item.id!,
  renderItem: (item) => (
    <span>
      {item.razonSocial}
      {item.nombreFantasia && (
        <span className="text-muted-foreground ml-1">({item.nombreFantasia})</span>
      )}
    </span>
  ),
  placeholder: "Buscar proveedor",
};

interface ProveedorSelectorProps {
  value?: Proveedor;
  onChange?: (item: Proveedor) => void;
  disabled?: boolean;
}

export function ProveedorSelector({ value, onChange, disabled = false }: ProveedorSelectorProps) {
  return <AutocompleteSelector value={value} onChange={onChange} disabled={disabled} config={proveedorConfig} />;
}
```

### Uso en Formulario

```typescript
// packages/front/src/components/forms/oferta-form.tsx
import { ProveedorSelector } from "@/components/selectors/proveedor-selector";

const formSchema = z.object({
  proveedorId: z.number().optional(),
  // ... otros campos
});

export default function OfertaForm({ data }: { data?: Oferta }) {
  const form = useForm({
    defaultValues: {
      proveedorId: data?.proveedorId,
    }
  });

  return (
    <FormField
      control={form.control}
      name="proveedorId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Proveedor</FormLabel>
          <ProveedorSelector
            value={data?.proveedor}
            onChange={(proveedor) => field.onChange(proveedor.id)}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

### Backend (Poplar Relación)

```typescript
// packages/api/src/modules/oferta/oferta.service.ts
async findOne(id: number) {
  return await this.ofertaRepository.findOne({
    where: { id },
    relations: ['proveedor'],  // ✅ Popula objeto completo
  });
}
```

---

## Ejemplo 2: ClienteSelector (Simple)

### Selector

```typescript
// packages/front/src/components/selectors/cliente-selector.tsx
"use client";
import * as React from "react";
import type { Cliente } from "@/types";
import { useGetClientesQuery } from "@/hooks/cliente";
import { AutocompleteSelector, AutocompleteSelectorConfig } from "./autocomplete-selector";

const clienteConfig: AutocompleteSelectorConfig<Cliente> = {
  useQuery: useGetClientesQuery,
  searchField: "nombre",
  getDisplayValue: (item) => {
    if (!item) return "Seleccione cliente";
    return item.nombre || item.razonSocial;
  },
  getItemKey: (item) => item.id!,
  placeholder: "Buscar cliente",
};

interface ClienteSelectorProps {
  value?: Cliente;
  onChange?: (item: Cliente) => void;
  disabled?: boolean;
}

export function ClienteSelector({ value, onChange, disabled = false }: ClienteSelectorProps) {
  return <AutocompleteSelector value={value} onChange={onChange} disabled={disabled} config={clienteConfig} />;
}
```

**Nota:** Sin `renderItem` usa `getDisplayValue` automáticamente.

---

## Ejemplo 3: InventarioSelector (Multi-línea)

### Selector con Renderizado Complejo

```typescript
// packages/front/src/components/selectors/inventario-selector.tsx
"use client";
import * as React from "react";
import type { Inventario } from "@/types";
import { useGetInventariosQuery } from "@/hooks/inventario";
import { AutocompleteSelector, AutocompleteSelectorConfig } from "./autocomplete-selector";

const inventarioConfig: AutocompleteSelectorConfig<Inventario> = {
  useQuery: useGetInventariosQuery,
  searchField: "nombre",
  getDisplayValue: (item) => {
    if (!item) return "Seleccione producto";
    return item.sku ? `${item.nombre} (${item.sku})` : item.nombre;
  },
  getItemKey: (item) => item.id!,
  renderItem: (item) => (
    <div className="flex flex-col py-1">
      <span className="font-medium">{item.nombre}</span>
      <div className="flex gap-2 text-xs text-muted-foreground">
        {item.sku && <span>SKU: {item.sku}</span>}
        {item.unidadMedida && <span>• {item.unidadMedida}</span>}
        {item.stock !== undefined && <span>• Stock: {item.stock}</span>}
      </div>
    </div>
  ),
  placeholder: "Buscar producto",
  pageSize: 30,  // Más items por página
};

interface InventarioSelectorProps {
  value?: Inventario;
  onChange?: (item: Inventario) => void;
  disabled?: boolean;
}

export function InventarioSelector({ value, onChange, disabled = false }: InventarioSelectorProps) {
  return <AutocompleteSelector value={value} onChange={onChange} disabled={disabled} config={inventarioConfig} />;
}
```

---

## Ejemplo 4: ProduccionTrabajoSelector (Con Badge)

### Selector con Badge de Estado

```typescript
// packages/front/src/components/selectors/produccion-trabajo-selector.tsx
"use client";
import * as React from "react";
import type { ProduccionTrabajo } from "@/types";
import { useGetProduccionTrabajosQuery } from "@/hooks/produccion-trabajo";
import { AutocompleteSelector, AutocompleteSelectorConfig } from "./autocomplete-selector";
import { Badge } from "@/components/ui/badge";

const produccionTrabajoConfig: AutocompleteSelectorConfig<ProduccionTrabajo> = {
  useQuery: useGetProduccionTrabajosQuery,
  searchField: "nombre",
  getDisplayValue: (item) => {
    if (!item) return "Seleccione trabajo";
    return item.nombre;
  },
  getItemKey: (item) => item.id!,
  renderItem: (item) => (
    <div className="flex items-center justify-between w-full">
      <span>{item.nombre}</span>
      {item.tipo && (
        <Badge
          variant={item.tipo === 'producto' ? 'default' : 'secondary'}
          className="ml-2"
        >
          {item.tipo}
        </Badge>
      )}
    </div>
  ),
  placeholder: "Buscar trabajo",
};

interface ProduccionTrabajoSelectorProps {
  value?: ProduccionTrabajo;
  onChange?: (item: ProduccionTrabajo) => void;
  disabled?: boolean;
  tipo?: 'producto' | 'servicio';  // Filtro adicional
}

export function ProduccionTrabajoSelector({
  value,
  onChange,
  disabled = false,
  tipo
}: ProduccionTrabajoSelectorProps) {
  return (
    <AutocompleteSelector
      value={value}
      onChange={onChange}
      disabled={disabled}
      config={produccionTrabajoConfig}
    />
  );
}
```

---

## Comparación ❌/✅

### Selector Props

```typescript
// ❌ Incorrecto
interface ProveedorSelectorProps {
  value?: number;                 // ID en lugar de objeto
  onChange?: (id: number) => void;  // Recibe ID
}

// ✅ Correcto
interface ProveedorSelectorProps {
  value?: Proveedor;              // Objeto completo
  onChange?: (item: Proveedor) => void;  // Recibe objeto
  disabled?: boolean;
}
```

### getDisplayValue

```typescript
// ❌ Incorrecto
getDisplayValue: (item) => {
  return item.razonSocial;  // No maneja caso null
}

// ❌ Incorrecto
getDisplayValue: (item) => {
  if (!item) return null;   // Retorna null en lugar de string
  return item.razonSocial;
}

// ✅ Correcto
getDisplayValue: (item) => {
  if (!item) return "Seleccione proveedor";
  return item.nombreFantasia
    ? `${item.razonSocial} (${item.nombreFantasia})`
    : item.razonSocial;
}
```

### Uso en Formulario

```typescript
// ❌ Incorrecto - value con ID
<FormField
  control={form.control}
  name="proveedorId"
  render={({ field }) => (
    <ProveedorSelector
      value={data?.proveedorId}  // number
      onChange={(prov) => field.onChange(prov.id)}
    />
  )}
/>

// ❌ Incorrecto - onChange sin extraer ID
<FormField
  control={form.control}
  name="proveedorId"
  render={({ field }) => (
    <ProveedorSelector
      value={data?.proveedor}
      onChange={field.onChange}  // Pasa objeto, schema espera number
    />
  )}
/>

// ✅ Correcto
<FormField
  control={form.control}
  name="proveedorId"
  render={({ field }) => (
    <ProveedorSelector
      value={data?.proveedor}              // Objeto completo
      onChange={(prov) => field.onChange(prov.id)}  // Extrae ID
    />
  )}
/>
```

### Schema y defaultValues

```typescript
// ❌ Incorrecto - Objeto en schema
const formSchema = z.object({
  proveedor: z.object({
    id: z.number(),
    razonSocial: z.string(),
  }).optional(),
});

const form = useForm({
  defaultValues: {
    proveedor: data?.proveedor,
  }
});

// ✅ Correcto - Solo ID en schema
const formSchema = z.object({
  proveedorId: z.number().optional(),
});

const form = useForm({
  defaultValues: {
    proveedorId: data?.proveedorId,
  }
});
```

### Backend

```typescript
// ❌ Incorrecto - Sin poplar relación
async findOne(id: number) {
  return await this.repository.findOne({ where: { id } });
  // Retorna: { id: 1, proveedorId: 5 } ← Falta objeto proveedor
}

// ✅ Correcto - Con relación poblada
async findOne(id: number) {
  return await this.repository.findOne({
    where: { id },
    relations: ['proveedor'],
  });
  // Retorna: { id: 1, proveedorId: 5, proveedor: { id: 5, razonSocial: "..." } }
}
```

---

## Casos de Uso Especiales

### Selector con Filtro Adicional

```typescript
// Selector que filtra por tipo
export function ProduccionTrabajoSelector({
  value,
  onChange,
  disabled = false,
  tipo  // 'producto' | 'servicio'
}: ProduccionTrabajoSelectorProps) {
  // Modificar config para incluir filtro
  const configWithFilter = React.useMemo(() => ({
    ...produccionTrabajoConfig,
    useQuery: (query: Query) => useGetProduccionTrabajosQuery({
      ...query,
      columnFilters: tipo
        ? [{ id: 'tipo', value: tipo }]
        : query.columnFilters
    }),
  }), [tipo]);

  return <AutocompleteSelector config={configWithFilter} />;
}
```

### Selector con Debounce Customizado

```typescript
const inventarioConfig: AutocompleteSelectorConfig<Inventario> = {
  useQuery: useGetInventariosQuery,
  searchField: "nombre",
  getDisplayValue: (item) => item?.nombre || "Seleccione producto",
  getItemKey: (item) => item.id!,
  debounceMs: 300,  // Más rápido para mejor UX
};
```

### Selector con Más Items por Página

```typescript
const clienteConfig: AutocompleteSelectorConfig<Cliente> = {
  useQuery: useGetClientesQuery,
  searchField: "nombre",
  getDisplayValue: (item) => item?.nombre || "Seleccione cliente",
  getItemKey: (item) => item.id!,
  pageSize: 50,  // 50 items en lugar de 20
};
```
