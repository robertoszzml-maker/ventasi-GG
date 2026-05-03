# INSTRUCCIONES: CRUD COMPLETO

**Estas son instrucciones obligatorias para Claude Code. Cuando veas la palabra clave `CRUD_COMPLETO <tabla>`, debes seguir TODOS los pasos automáticamente.**

---

## ACTIVACIÓN

Palabra clave: **`CRUD_COMPLETO <nombre_tabla_sql>`**

Ejemplos:
- `CRUD_COMPLETO estado_compras`
- `CRUD_COMPLETO plazo_pago`

---

## ANTES DE EMPEZAR - VERIFICACIONES CRÍTICAS

1. **LEE primero la estructura SQL** de la tabla para conocer campos exactos
2. **VERIFICA nombres de campos** (puede ser `nombre`, `descripcion`, `codigo`, etc.)
3. **IDENTIFICA tipos de datos** (varchar, enum, int, date, etc.)
4. **NO ASUMAS nada** - siempre verifica en SQL o en código existente
5. **USA TodoWrite** con los 12 pasos para trackear progreso
6. **MARCA cada paso como completado** inmediatamente después de finalizarlo

---

## 12 PASOS OBLIGATORIOS

### PASO 1: Crear Entity de Backend

**Archivo**: `packages/api/src/modules/<nombre>/entities/<nombre>.entity.ts`

**QUÉ HACER**:
- Crear carpeta `packages/api/src/modules/<nombre>/`
- Crear entity que extienda de `BaseEntity`
- Mapear TODOS los campos de la tabla SQL
- Usar `@Column({ name: '<campo_sql>' })` para mapear snake_case a camelCase
- Para ENUM: `type: 'enum', enum: ['VALOR1', 'VALOR2']`

**Template**:
```typescript
import { BaseEntity } from '@/common/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: '<nombre_tabla_sql>' })
export class <NombreClase> extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: '<campo_sql>',
        type: '<tipo>',
        length: <longitud>,
        nullable: <true|false>,
        unique: <true|false>,
    })
    <nombreCampo>: <tipo>;
}
```

---

### PASO 2: Crear DTOs de Backend

**Archivos**:
- `packages/api/src/modules/<nombre>/dto/create-<nombre>.dto.ts`
- `packages/api/src/modules/<nombre>/dto/update-<nombre>.dto.ts`

**QUÉ HACER**:
- Crear carpeta `dto/`
- Create DTO: clase vacía
- Update DTO: extender PartialType del Create DTO

**Templates**:

`create-<nombre>.dto.ts`:
```typescript
export class Create<Nombre>Dto {}
```

`update-<nombre>.dto.ts`:
```typescript
import { PartialType } from '@nestjs/swagger';
import { Create<Nombre>Dto } from './create-<nombre>.dto';

export class Update<Nombre>Dto extends PartialType(Create<Nombre>Dto) {}
```

---

### PASO 3: Crear Controller de Backend

**Archivo**: `packages/api/src/modules/<nombre>/<nombre>.controller.ts`

**QUÉ HACER**:
- Implementar 5 endpoints: create, findAll, findOne, update, remove
- Usar guards: JwtAuthGuard, ApiKeyGuard, AuthorizationGuard
- Usar decorador @RequirePermissions con PERMISOS.<NOMBRE>_*
- Implementar filtros y paginación en findAll

**Template**:
```typescript
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../auth/guards/api-key/api-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { <Nombre>Service } from './<nombre>.service';
import { Create<Nombre>Dto } from './dto/create-<nombre>.dto';
import { Update<Nombre>Dto } from './dto/update-<nombre>.dto';
import { PERMISOS } from '@/constants/permisos';
import { AuthorizationGuard } from '../auth/guards/authorization/authorization.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions/require-permissions.decorator';

@Controller('<nombre-ruta>')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class <Nombre>Controller {
  constructor(private readonly <nombre>Service: <Nombre>Service) { }

  @RequirePermissions(PERMISOS.<NOMBRE>_CREAR)
  @Post()
  create(@Body() create<Nombre>Dto: Create<Nombre>Dto) {
    return this.<nombre>Service.create(create<Nombre>Dto);
  }

  @RequirePermissions(PERMISOS.<NOMBRE>_VER)
  @Get()
  findAll(
    @Query('limit') take: number,
    @Query('skip') skip: number,
    @Query('filter') filter: string,
    @Query('order') order: string,
  ) {
    const where = filter ? JSON.parse(filter) : [];
    const orderBy = order ? JSON.parse(order) : {};

    const options = {
      where,
      order: orderBy,
      take,
      skip,
    };

    return this.<nombre>Service.findAll(options);
  }

  @RequirePermissions(PERMISOS.<NOMBRE>_VER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.<nombre>Service.findOne(id);
  }

  @RequirePermissions(PERMISOS.<NOMBRE>_EDITAR)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() update<Nombre>Dto: Update<Nombre>Dto) {
    return this.<nombre>Service.update(id, update<Nombre>Dto);
  }

  @RequirePermissions(PERMISOS.<NOMBRE>_ELIMINAR)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.<nombre>Service.remove(id);
  }
}
```

---

### PASO 4: Crear Service de Backend

**Archivo**: `packages/api/src/modules/<nombre>/<nombre>.service.ts`

**QUÉ HACER**:
- Inyectar Repository con @InjectRepository
- Implementar métodos CRUD
- Usar transformToGenericFilters en findAll

**Template**:
```typescript
import { Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { Create<Nombre>Dto } from './dto/create-<nombre>.dto';
import { Update<Nombre>Dto } from './dto/update-<nombre>.dto';
import { <Nombre> } from './entities/<nombre>.entity';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class <Nombre>Service {
  constructor(
    @InjectRepository(<Nombre>)
    private <nombre>Repository: Repository<<Nombre>>,
  ) { }

  async create(create<Nombre>Dto: Create<Nombre>Dto) {
    return await this.<nombre>Repository.save(create<Nombre>Dto);
  }

  async findAll(conditions: FindManyOptions<<Nombre>>): Promise<<Nombre>[]> {
    return await this.<nombre>Repository.find({ ...conditions, where: transformToGenericFilters(conditions.where) })
  }

  async findOne(id: number) {
    return await this.<nombre>Repository.findOneBy({ id });
  }

  async update(id: number, update<Nombre>Dto: Update<Nombre>Dto) {
    await this.<nombre>Repository.update({ id }, update<Nombre>Dto);
    return await this.<nombre>Repository.findOneBy({ id });
  }

  async remove(id: number) {
    const <nombre> = await this.findOne(id);
    await this.<nombre>Repository.delete({ id });
    return <nombre>;
  }
}
```

---

### PASO 5: Crear Module de Backend

**Archivo**: `packages/api/src/modules/<nombre>/<nombre>.module.ts`

**QUÉ HACER**:
- Importar TypeOrmModule.forFeature con la Entity
- Registrar Controller y Service
- Exportar Service

**Template**:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { <Nombre>Controller } from './<nombre>.controller';
import { <Nombre>Service } from './<nombre>.service';
import { <Nombre> } from './entities/<nombre>.entity';

@Module({
  imports: [TypeOrmModule.forFeature([<Nombre>])],
  controllers: [<Nombre>Controller],
  providers: [<Nombre>Service],
  exports: [<Nombre>Service],
})
export class <Nombre>Module {}
```

---

### PASO 6: Registrar Module en AppModule

**Archivo**: `packages/api/src/app.module.ts`

**QUÉ HACER**:
- Agregar import del nuevo módulo
- Agregarlo al array `imports`

**Ejemplo**:
```typescript
import { <Nombre>Module } from './modules/<nombre>/<nombre>.module';

@Module({
  imports: [
    // ... otros módulos
    <Nombre>Module,
  ],
})
```

---

### PASO 7: Crear Permisos en Constants

**Archivos**:
- `packages/api/src/constants/permisos.ts`
- `packages/front/src/constants/permisos.ts`

**QUÉ HACER**:
- Agregar 4 permisos CRUD ANTES de la sección de rutas
- Agregar 1 permiso RUTA en la sección de rutas
- **IMPORTANTE**: Hacerlo en AMBOS archivos (backend y frontend) de forma IDÉNTICA

**Template**:
```typescript
// Permisos CRUD (agregar antes de rutas)
<NOMBRE>_CREAR: '<NOMBRE>_CREAR',
<NOMBRE>_VER: '<NOMBRE>_VER',
<NOMBRE>_EDITAR: '<NOMBRE>_EDITAR',
<NOMBRE>_ELIMINAR: '<NOMBRE>_ELIMINAR',

// Permiso de ruta (agregar en sección RUTAS)
RUTA_<NOMBRE>: 'RUTA_<NOMBRE>',
```

---

### PASO 8: Agregar Ruta al Menú

**Archivo**: `packages/api/src/constants/routes.ts`

**QUÉ HACER**:
- Agregar entrada en el array de rutas
- **USAR permiso RUTA_<NOMBRE>** (NO usar <NOMBRE>_VER)
- Elegir un icono de Lucide

**Template**:
```typescript
{
    id: PERMISOS.RUTA_<NOMBRE>,
    title: '<Título del Menú>',
    url: '/<nombre-ruta>',
    icon: '<IconoLucide>',
},
```

---

### PASO 9: Crear SQL de Permisos

**Archivo**: `packages/api/sql/<numero>.sql` (usar el último número o crear nuevo)

**QUÉ HACER**:
- Crear INSERT para 4 permisos CRUD con módulo = nombre_tabla
- Crear INSERT para 1 permiso RUTA con módulo = 'rutas'
- **IMPORTANTE**: Cada tabla tiene su propio módulo en permisos CRUD

**Template**:
```sql
-- ============================================
-- TABLA: <nombre_tabla> (<Descripción>)
-- ============================================

INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('<NOMBRE>_VER', 'Permite visualizar <descripción>', '<nombre_tabla>'),
('<NOMBRE>_CREAR', 'Permite crear <descripción>', '<nombre_tabla>'),
('<NOMBRE>_EDITAR', 'Permite modificar <descripción>', '<nombre_tabla>'),
('<NOMBRE>_ELIMINAR', 'Permite eliminar <descripción>', '<nombre_tabla>');

-- ============================================
-- PERMISOS DE NAVEGACIÓN (RUTAS)
-- ============================================

INSERT INTO permissions (codigo, descripcion, modulo) VALUES
('RUTA_<NOMBRE>', '<Título del Menú>', 'rutas');
```

---

### PASO 10: Crear Types, Service y Hooks de Frontend

**Archivo Types**: `packages/front/src/types/index.d.ts`

**QUÉ HACER**:
- Agregar type con TODOS los campos de la entity
- Mapear tipos SQL a TypeScript correctamente

**Template**:
```typescript
export type <Nombre> = {
    id: number;
    <campo>: <tipo>;
    // ... todos los campos
}
```

---

**Archivo Service**: `packages/front/src/services/<nombre>.ts`

**QUÉ HACER**:
- Crear 5 funciones: fetch, fetchById, create, edit, remove
- Usar fetchClient y generateQueryParams

**Template**:
```typescript
import { <Nombre>, Query } from '@/types';
import fetchClient from '@/lib/api-client';
import { generateQueryParams } from '@/utils/query-helper'

const basePath = '<nombre-ruta>'

const fetch = async (query: Query): Promise<<Nombre>[]> => {
    return fetchClient<<Nombre>[]>(`${basePath}?${generateQueryParams(query)}`, 'GET');
};

const fetchById = async (id: number): Promise<<Nombre>> => {
    return fetchClient<<Nombre>>(`${basePath}/${id}`, 'GET');
};

const create = async (body: <Nombre>): Promise<<Nombre>> => {
    return fetchClient<<Nombre>>(basePath, 'POST', body);
};

const edit = async (id: number, body: <Nombre>): Promise<<Nombre>> => {
    return fetchClient<<Nombre>>(`${basePath}/${id}`, 'PATCH', body);
};

const remove = async (id: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${id}`, 'DELETE');
};

export {
    fetch,
    fetchById,
    create,
    edit,
    remove
};
```

---

**Archivo Hooks**: `packages/front/src/hooks/<nombre>.tsx`

**QUÉ HACER**:
- Crear 5 hooks usando React Query
- Invalidar queries en mutaciones

**Template**:
```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { <Nombre>, Query } from "@/types";
import { fetch, fetchById, create, edit, remove } from "@/services/<nombre>";

export const useGet<Nombre>sQuery = (query: Query) => {
  return useQuery({
    queryKey: ["<nombre>", query],
    queryFn: () => fetch(query),
  });
};

export const useGet<Nombre>ByIdQuery = (id: number) => {
  return useQuery({
    queryKey: ["<nombre>", id],
    queryFn: () => fetchById(id),
  });
};

export const useCreate<Nombre>Mutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-<nombre>"],
    mutationFn: create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["<nombre>"] });
    },
  });
};

export const useEdit<Nombre>Mutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["edit-<nombre>"],
    mutationFn: ({ id, data }: { id: number; data: <Nombre> }) =>
      edit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["<nombre>"] });
    },
  });
};

export const useDelete<Nombre>Mutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-<nombre>"],
    mutationFn: remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["<nombre>"] });
    },
    onError: (error) => {
      console.error("Error en eliminación:", error);
    },
  });
};
```

---

### PASO 11: Crear Formulario y Tabla de Frontend

**Archivo Formulario**: `packages/front/src/components/forms/<nombre>-form.tsx`

**QUÉ HACER**:
- Usar react-hook-form con Zod
- Crear FormField para CADA campo de la entidad
- Usar Select para campos enum
- Implementar create/edit con los hooks

**Template**:
```typescript
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { <Nombre> } from "@/types";

const formSchema = z.object({
  id: z.number().optional(),
  <campo>: z.string({ message: "Requerido" }).min(2),
  // Para enum: z.enum(['VALOR1', 'VALOR2'], { message: "Requerido" }),
});

import {
  useCreate<Nombre>Mutation,
  useEdit<Nombre>Mutation,
} from "@/hooks/<nombre>";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";

type <Nombre>FormProps = {
  data?: <Nombre>;
};

export default function <Nombre>Form({ data }: <Nombre>FormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: data?.id,
      <campo>: data?.<campo> || "",
    },
  });

  const { mutateAsync: create, isPending: isPendingCreate } =
    useCreate<Nombre>Mutation();
  const { mutateAsync: edit, isPending: isPendingEdit } =
    useEdit<Nombre>Mutation();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (values.id) {
        await edit({ id: values.id, data: values });
      } else {
        await create(values);
      }
      toast({
        description: "Exito al realizar la operación",
        variant: "default",
      });
      router.back();
    } catch (error) {
      console.error("Form submission error", error);
      toast({
        description: "Error al realizar la operación",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8  mx-auto py-10"
      >
        <FormField
          control={form.control}
          name="<campo>"
          render={({ field }) => (
            <FormItem>
              <FormLabel><Label></FormLabel>
              <FormControl>
                <Input placeholder="Ej: texto" type="text" {...field} />
              </FormControl>
              <FormDescription>
                Descripción del campo
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <LoadingButton
            loading={isPendingCreate || isPendingEdit}
            type="submit"
          >
            Guardar
          </LoadingButton>
          <Button type="button" onClick={() => router.back()} variant={"link"}>
            Volver
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

---

**Archivos Tabla**:
- `packages/front/src/components/tables/<nombre>-table/columns.tsx`
- `packages/front/src/components/tables/<nombre>-table/index.tsx`

**QUÉ HACER en columns.tsx**:
- Crear DataTableRowActions con acciones Ver, Editar, Eliminar
- Crear columnas para CADA campo que quieras mostrar en la tabla
- Usar accessorKey correcto según los campos de la entity

**Template columns.tsx**:
```typescript
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDelete<Nombre>Mutation } from "@/hooks/<nombre>";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import React from "react";
import { <Nombre> } from "@/types";
import Link from "next/link";
import { DeleteDialog } from "@/components/ui/delete-dialog";

const baseUrl = "<nombre-ruta>";

const DataTableRowActions = ({ data }: { data: <Nombre> }) => {
  const [openDelete, setOpenDelete] = React.useState(false);
  const { mutate } = useDelete<Nombre>Mutation();
  return (
    <>
      <DeleteDialog
        onDelete={() => {
          mutate(data.id);
          setOpenDelete(false);
        }}
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
        }}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only"> Abrir menú </span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones </DropdownMenuLabel>
          <Link className="" href={`${baseUrl}/${data.id}`}>
            <DropdownMenuItem onClick={() => console.log("Ver", data)}>
              Ver
            </DropdownMenuItem>
          </Link>
          <Link className="" href={`${baseUrl}/${data.id}`}>
            <DropdownMenuItem onClick={() => console.log("Editar", data)}>
              Editar
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const columns: ColumnDef<<Nombre>>[] = [
  {
    accessorKey: "id",
    header: "ID",
    enableGrouping: true,
    cell: ({ row }) => (
      <Link className="pl-4" href={`${baseUrl}/${row.getValue("id")}`}>
        {" "}
        {row.getValue("id")}{" "}
      </Link>
    ),
  },
  {
    accessorKey: "<campo>",
    header: "<Header>",
    cell: ({ row }) => (
      <Link className="pl-4" href={`${baseUrl}/${row.getValue("id")}`}>
        {" "}
        {row.getValue("<campo>")}{" "}
      </Link>
    ),
  },
  {
    id: "acciones",
    cell: ({ row }) => {
      return <DataTableRowActions data={row.original} />;
    },
  },
];
```

**Template index.tsx**:
```typescript
"use client";
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { useGet<Nombre>sQuery } from "@/hooks/<nombre>";
import { columns } from "./columns";
import { SkeletonTable } from "@/components/skeletons/skeleton-table";

export function <Nombre>Table() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data = [], isLoading } = useGet<Nombre>sQuery({
    pagination,
    columnFilters,
    sorting,
    globalFilter,
  });
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
    },
  });

  if (isLoading) return <SkeletonTable />;

  return (
    <>
      <DataTable table={table} columns={columns} />
    </>
  );
}
```

---

### PASO 12: Crear Páginas de Next.js

**Estructura**:
```
packages/front/src/app/(admin)/<nombre-ruta>/
├── page.tsx          (listado)
├── crear/
│   └── page.tsx
└── [id]/
    └── page.tsx
```

**QUÉ HACER**:
- Crear las 3 páginas: listado, crear, editar
- Usar PageTitle apropiado en cada una
- En editar: usar React.use(params) para Next.js 15

---

**Template page.tsx (listado)**:
```typescript
import { <Nombre>Table } from "@/components/tables/<nombre>-table";
import { PageTitle } from "@/components/ui/page-title";

export default function <Nombre>() {
  return (
    <>
      <PageTitle title="<Título Plural>" />
      <<Nombre>Table />
    </>
  );
}
```

---

**Template crear/page.tsx**:
```typescript
import Form from "@/components/forms/<nombre>-form";
import { PageTitle } from "@/components/ui/page-title";

export default function Create<Nombre>() {
  return (
    <>
      <PageTitle title="Crear <Título>" />
      <Form />
    </>
  );
}
```

---

**Template [id]/page.tsx**:
```typescript
"use client";

import Form from "@/components/forms/<nombre>-form";
import { PageTitle } from "@/components/ui/page-title";
import { useGet<Nombre>ByIdQuery } from "@/hooks/<nombre>";
import React from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading, isFetching } = useGet<Nombre>ByIdQuery(Number(id));
  if (isLoading || isFetching) return <>Cargando...</>;
  return (
    <>
      <PageTitle title="Editar <Título>" />
      <Form data={data} />
    </>
  );
}
```

---

## REGLAS CRÍTICAS - NO VIOLAR

1. ✅ **SIEMPRE** revisar la estructura SQL de la tabla primero
2. ✅ **NUNCA** asumir nombres de campos (`nombre` vs `descripcion`)
3. ✅ **SIEMPRE** extender entities de `BaseEntity`
4. ✅ **SIEMPRE** crear módulos separados en SQL permisos (NO agrupar todo)
5. ✅ **SIEMPRE** agregar permiso RUTA además de CRUD
6. ✅ **SIEMPRE** usar mismo nombre de campo en: Entity, Type, Columns, Form
7. ✅ **SIEMPRE** crear las 3 páginas: listado, crear, editar
8. ✅ **SIEMPRE** registrar módulo en app.module.ts
9. ✅ **SIEMPRE** actualizar permisos en backend Y frontend
10. ✅ **SIEMPRE** usar `RUTA_*` en routes.ts, NO usar `*_VER`
11. ✅ **SIEMPRE** usar TodoWrite y marcar cada paso como completado
12. ✅ **SIEMPRE** verificar que las columnas de la tabla coincidan con los campos de la entity

---

## ORDEN DE EJECUCIÓN

1. ✅ Backend Entity
2. ✅ Backend DTOs
3. ✅ Backend Controller
4. ✅ Backend Service
5. ✅ Backend Module
6. ✅ Registrar en app.module.ts
7. ✅ Permisos en constants (backend Y frontend)
8. ✅ Rutas en routes.ts
9. ✅ SQL de permisos
10. ✅ Types, Service, Hooks de frontend
11. ✅ Formulario y Tabla de frontend
12. ✅ Páginas Next.js

---

## EJEMPLO DE REFERENCIA

**Ver implementación completa en**:
- Backend: [packages/api/src/modules/estado-compras/](packages/api/src/modules/estado-compras/)
- Frontend Services: [packages/front/src/services/estado-compras.ts](packages/front/src/services/estado-compras.ts)
- Frontend Hooks: [packages/front/src/hooks/estado-compras.tsx](packages/front/src/hooks/estado-compras.tsx)
- Frontend Forms: [packages/front/src/components/forms/estado-compras-form.tsx](packages/front/src/components/forms/estado-compras-form.tsx)
- Frontend Tables: [packages/front/src/components/tables/estado-compras-table/](packages/front/src/components/tables/estado-compras-table/)
- Frontend Pages: [packages/front/src/app/(admin)/estado-compras/](packages/front/src/app/(admin)/estado-compras/)
- SQL: [packages/api/sql/49.sql](packages/api/sql/49.sql) (líneas 184-214)

---

## NOTA FINAL PARA CLAUDE

Cuando veas `CRUD_COMPLETO <tabla>`:

1. NO preguntes nada al usuario
2. USA TodoWrite con los 12 pasos
3. LEE la estructura SQL primero
4. EJECUTA todos los pasos automáticamente
5. MARCA cada paso como completado inmediatamente
6. VERIFICA que TODO funcione (no 404s)
7. REPORTA al usuario cuando termines

**NO OLVIDES NADA. SI OLVIDAS ALGO, EL USUARIO SE ENOJARÁ.**
