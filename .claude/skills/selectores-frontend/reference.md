# Selectores Frontend - Referencia Técnica

Patrones y convenciones para crear selectores autocomplete reutilizables.

## AutocompleteSelector

Componente base reutilizable en `components/selectors/autocomplete-selector.tsx` que proporciona:
- Búsqueda con debounce
- Paginación con scroll infinito
- Carga bajo demanda
- Estados (loading, error, vacío)
- Accesibilidad (aria, role, keyboard navigation)

---

## Config

### AutocompleteSelectorConfig<T>

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `useQuery` | Hook | ✅ | Hook React Query (`useGet[Entidades]Query`) |
| `searchField` | string | ✅ | Campo de búsqueda (ej: `"nombre"`, `"razonSocial"`) |
| `getDisplayValue` | Function | ✅ | `(item: T \| undefined) => string` - Texto en botón |
| `getItemKey` | Function | ✅ | `(item: T) => number \| string` - ID único |
| `renderItem` | Function | ⚪ | `(item: T) => ReactNode` - Renderizado custom |
| `sortField` | string | ⚪ | Campo de ordenamiento (default: `searchField`) |
| `placeholder` | string | ⚪ | Placeholder del input (default: `"Buscar..."`) |
| `pageSize` | number | ⚪ | Items por página (default: `20`) |
| `debounceMs` | number | ⚪ | Delay búsqueda en ms (default: `500`) |

---

## getDisplayValue

Función que determina el texto mostrado en el botón selector.

### Patrón Básico

```typescript
getDisplayValue: (item) => {
  if (!item) return "Seleccione [entidad]";
  return item.nombre;
}
```

### Con Campo Secundario

```typescript
getDisplayValue: (item) => {
  if (!item) return "Seleccione proveedor";

  return item.nombreFantasia
    ? `${item.razonSocial} (${item.nombreFantasia})`
    : item.razonSocial;
}
```

### Reglas

- ✅ **Siempre** manejar caso `!item` (retornar placeholder)
- ✅ Retornar string conciso (evitar textos muy largos)
- ✅ Campo secundario entre paréntesis si existe
- ❌ NO retornar `undefined` o `null`

---

## getItemKey

Función que extrae el identificador único de cada item.

```typescript
// ✅ Correcto
getItemKey: (item) => item.id!

// ❌ Incorrecto
getItemKey: (item) => item.id || 0  // NO usar fallback
```

**Nota:** El `!` asegura que TypeScript trate `id` como no-nullable.

---

## renderItem (Opcional)

Función para customizar el renderizado de cada item en la lista desplegable.

### Sin renderItem

Si no se proporciona, usa `getDisplayValue` por defecto:

```typescript
// NO necesita renderItem
const config = {
  useQuery: useGetProveedoresQuery,
  searchField: "razonSocial",
  getDisplayValue: (item) => item?.razonSocial || "Seleccione proveedor",
  getItemKey: (item) => item.id!,
};
```

### Con Campo Secundario

```typescript
renderItem: (item) => (
  <span>
    {item.razonSocial}
    {item.nombreFantasia && (
      <span className="text-muted-foreground ml-1">
        ({item.nombreFantasia})
      </span>
    )}
  </span>
)
```

### Renderizado Multi-línea

```typescript
renderItem: (item) => (
  <div className="flex flex-col">
    <span className="font-medium">{item.nombre}</span>
    {item.codigo && (
      <span className="text-xs text-muted-foreground">
        Código: {item.codigo}
      </span>
    )}
  </div>
)
```

### Con Badges o Iconos

```typescript
renderItem: (item) => (
  <div className="flex items-center justify-between w-full">
    <span>{item.nombre}</span>
    {item.activo && (
      <Badge variant="success" size="sm">Activo</Badge>
    )}
  </div>
)
```

---

## Props del Selector

```typescript
interface [Entidad]SelectorProps {
  value?: [Entidad];                     // Objeto completo (NO ID)
  onChange?: (item: [Entidad]) => void;  // Recibe objeto completo
  disabled?: boolean;                    // Opcional
}
```

### Reglas Críticas

| Aspecto | ✅ Correcto | ❌ Incorrecto |
|---------|------------|--------------|
| value type | `[Entidad] \| undefined` | `number` (ID) |
| onChange param | `(item: [Entidad])` | `(id: number)` |
| disabled | `boolean \| undefined` | Sin prop |

---

## Uso en Formularios

### Schema Zod

```typescript
const formSchema = z.object({
  proveedorId: z.number().optional(),  // ✅ ID como number
  // NO: proveedor: z.object(...)
});
```

### defaultValues

```typescript
const form = useForm({
  defaultValues: {
    proveedorId: data?.proveedorId,  // ✅ Solo ID
  }
});
```

### FormField

```typescript
<FormField
  control={form.control}
  name="proveedorId"                    // ✅ Campo ID
  render={({ field }) => (
    <FormItem>
      <FormLabel>Proveedor</FormLabel>
      <ProveedorSelector
        value={data?.proveedor}         // ✅ Objeto completo poblado
        onChange={(proveedor) => {
          field.onChange(proveedor.id); // ✅ Extraer ID
        }}
      />
      <FormMessage />
    </FormItem>
  )}
/>
```

### Flujo Completo

1. **Schema**: Define `proveedorId: z.number().optional()`
2. **defaultValues**: Inicializa con `proveedorId: data?.proveedorId` (number)
3. **Backend debe poblar**: `data?.proveedor` (objeto completo) en findOne
4. **Selector recibe**: `value={data?.proveedor}` (objeto)
5. **onChange extrae**: `proveedor.id` y actualiza form
6. **onSubmit envía**: `{ proveedorId: 123 }` al backend

---

## Funcionalidades Automáticas

`AutocompleteSelector` incluye:

### Búsqueda
- Debounce de 500ms (configurable)
- Búsqueda por `searchField` especificado
- Reinicia paginación en cada búsqueda

### Paginación
- Scroll infinito automático
- Carga bajo demanda (20 items por defecto)
- Indicador de carga al hacer scroll

### Estados
- **Loading**: Spinner inicial
- **Empty**: Mensaje "No se encontraron resultados"
- **Error**: Manejado automáticamente
- **Disabled**: Deshabilitado visual y funcionalmente

### Accesibilidad
- ARIA labels y roles
- Keyboard navigation (Enter, Escape, Arrow keys)
- Focus management

---

## Anti-patrones

### Value Incorrecto

```typescript
// ❌ Pasar ID en lugar de objeto
<ProveedorSelector
  value={data?.proveedorId}  // number
  onChange={(prov) => field.onChange(prov.id)}
/>

// ✅ Pasar objeto completo
<ProveedorSelector
  value={data?.proveedor}    // Proveedor object
  onChange={(prov) => field.onChange(prov.id)}
/>
```

### onChange Incorrecto

```typescript
// ❌ Pasar objeto completo al form
<ProveedorSelector
  value={data?.proveedor}
  onChange={field.onChange}  // Espera number, recibe object
/>

// ❌ Pasar objeto modificado
<ProveedorSelector
  value={data?.proveedor}
  onChange={(prov) => field.onChange(prov)}  // Schema espera number
/>

// ✅ Extraer ID
<ProveedorSelector
  value={data?.proveedor}
  onChange={(prov) => field.onChange(prov.id)}  // ✅
/>
```

### Schema Incorrecto

```typescript
// ❌ Objeto en schema
const formSchema = z.object({
  proveedor: z.object({
    id: z.number(),
    nombre: z.string(),
  }).optional(),
});

// ✅ Solo ID en schema
const formSchema = z.object({
  proveedorId: z.number().optional(),
});
```

### Backend Sin Poblar

```typescript
// ❌ Backend solo retorna ID
async findOne(id: number) {
  return await this.repository.findOne({ where: { id } });
  // { id: 1, proveedorId: 5 } ← Falta objeto proveedor
}

// ✅ Backend popula relación
async findOne(id: number) {
  return await this.repository.findOne({
    where: { id },
    relations: ['proveedor'],  // ✅ Popula objeto completo
  });
  // { id: 1, proveedorId: 5, proveedor: { id: 5, nombre: "..." } }
}
```

---

## Checklist

### Selector
- [ ] Archivo en `components/selectors/[entidad]-selector.tsx`
- [ ] `useQuery` correcto
- [ ] `searchField` definido
- [ ] `getDisplayValue` maneja `!item`
- [ ] `getItemKey` extrae `id!`
- [ ] Props: `value?: T`, `onChange?: (T) => void`, `disabled?: boolean`

### Config Opcional
- [ ] `renderItem` si se necesita customización
- [ ] `sortField` si difiere de `searchField`
- [ ] `placeholder` personalizado
- [ ] `pageSize` si difiere de 20
- [ ] `debounceMs` si difiere de 500

### Uso en Forms
- [ ] Schema: `[entidad]Id: z.number().optional()`
- [ ] defaultValues: Solo ID
- [ ] value: Objeto completo poblado
- [ ] onChange: Extrae `.id`
- [ ] Backend popula relación

### Backend
- [ ] findOne incluye `relations: ['[entidad]']`
- [ ] Retorna objeto completo en campo virtual
