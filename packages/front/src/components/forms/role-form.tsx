"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React, { useEffect, useState } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import { Role } from "@/types/permission";
import { useCreateRoleMutation, useUpdateRoleMutation } from "@/hooks/role";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";
import { useGetPermissionsQuery } from "@/hooks/permission";
import {
  useGetRolePermissionsByRoleQuery,
  useSetRolePermissionsMutation,
} from "@/hooks/role-permission";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const formSchema = z.object({
  id: z.number().optional(),
  nombre: z
    .string({ message: "Nombre requerido" })
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(100, { message: "El nombre no puede tener más de 100 caracteres" }),
  descripcion: z
    .string()
    .max(255, {
      message: "La descripción no puede tener más de 255 caracteres",
    })
    .optional(),
  color: z.string().optional(),
  icono: z.string().optional(),
  permissionIds: z.array(z.number()).default([]),
});

type RoleFormProps = {
  data?: Role;
  onSuccess?: () => void;
};

export default function RoleForm({ data, onSuccess }: RoleFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [colorPreview, setColorPreview] = useState(data?.color || "#2563eb");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: data?.id,
      nombre: data?.nombre || "",
      descripcion: data?.descripcion || "",
      color: data?.color || "#2563eb",
      icono: data?.icono || "",
      permissionIds: [],
    },
  });

  const selectedPermissions = form.watch("permissionIds");
  const selectedColor = form.watch("color");

  const { mutateAsync: create, isPending: isPendingCreate } =
    useCreateRoleMutation();
  const { mutateAsync: update, isPending: isPendingUpdate } =
    useUpdateRoleMutation();

  const { data: permissions = [], isLoading: permissionsLoading } =
    useGetPermissionsQuery();
  const { data: rolePermissions, isLoading: rolePermissionsLoading } =
    useGetRolePermissionsByRoleQuery(data?.id || null, { enabled: !!data?.id });
  const { mutateAsync: setPermissions, isPending: isSavingPermissions } =
    useSetRolePermissionsMutation();

  useEffect(() => {
    if (rolePermissions && rolePermissions.length > 0) {
      form.setValue(
        "permissionIds",
        rolePermissions.map((rp) => rp.permissionId)
      );
    } else if (data?.id) {
      form.setValue("permissionIds", []);
    }
  }, [rolePermissions, data?.id]);

  const handlePermissionToggle = (permissionId: number) => {
    const current = form.getValues("permissionIds") || [];
    const updated = current.includes(permissionId)
      ? current.filter((id) => id !== permissionId)
      : [...current, permissionId];
    form.setValue("permissionIds", updated, { shouldDirty: true });
  };

  const handleModuleToggle = (
    modulePermissions: number[],
    isChecked: boolean
  ) => {
    const current = form.getValues("permissionIds") || [];
    let updated: number[];

    if (isChecked) {
      // Agregar todos los permisos del módulo
      updated = Array.from(new Set([...current, ...modulePermissions]));
    } else {
      // Quitar todos los permisos del módulo
      updated = current.filter((id) => !modulePermissions.includes(id));
    }

    form.setValue("permissionIds", updated, { shouldDirty: true });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      let roleId = data?.id;
      const { permissionIds, ...roleData } = values;

      if (data?.id) {
        await update({ id: data.id, data: roleData });
        toast({
          title: "Rol actualizado",
          description: "El rol se ha actualizado correctamente.",
        });
      } else {
        const newRole = await create(roleData);
        roleId = newRole.id;
        toast({
          title: "Rol creado",
          description: "El rol se ha creado correctamente.",
        });
      }

      if (roleId && data?.id) {
        await setPermissions({
          roleId: roleId,
          permissionIds: permissionIds || [],
        });
      }

      if (onSuccess) onSuccess();
      // else router.back();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Ha ocurrido un error inesperado.",
        variant: "destructive",
      });
    }
  }

  const isPending = isPendingCreate || isPendingUpdate || isSavingPermissions;

  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      const module = permission.modulo || "SIN_CATEGORÍA";
      if (!acc[module]) acc[module] = [];
      acc[module].push(permission);
      return acc;
    },
    {} as Record<string, typeof permissions>
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 mx-auto py-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Rol</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese el nombre del rol" {...field} />
                </FormControl>
                <FormDescription>Nombre identificador del rol</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="icono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícono</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Shield, User, Lock..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Nombre del ícono (usa los de lucide-react)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 rounded-full border"
                              style={{ backgroundColor: selectedColor }}
                            />
                            {selectedColor}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48">
                        <input
                          type="color"
                          value={selectedColor}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setColorPreview(e.target.value);
                          }}
                          className="w-full h-10 cursor-pointer rounded"
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormDescription>
                    Seleccione un color representativo del rol
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ingrese la descripción del rol"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {data?.id && (
          <>
            {permissionsLoading || rolePermissionsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Permisos del Rol</CardTitle>
                  <CardDescription>
                    Seleccione los permisos para este rol.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(groupedPermissions).map(
                      ([module, perms]) => {
                        const moduleIds = perms.map((p) => p.id);
                        const allSelected = moduleIds.every((id) =>
                          selectedPermissions.includes(id)
                        );
                        const partiallySelected =
                          !allSelected &&
                          moduleIds.some((id) =>
                            selectedPermissions.includes(id)
                          );

                        return (
                          <Card key={module}>
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                              <CardTitle className="text-sm font-medium capitalize">
                                {module.toLowerCase().replace(/_/g, " ")}
                              </CardTitle>
                              <Checkbox
                                checked={
                                  allSelected
                                    ? true
                                    : partiallySelected
                                      ? "indeterminate"
                                      : false
                                }
                                onCheckedChange={(checked) =>
                                  handleModuleToggle(moduleIds, !!checked)
                                }
                              />
                            </CardHeader>
                            <CardContent className="space-y-2">
                              {perms.map((permission) => (
                                <div
                                  key={permission.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`permission-${permission.id}`}
                                    checked={selectedPermissions.includes(
                                      permission.id
                                    )}
                                    onCheckedChange={() =>
                                      handlePermissionToggle(permission.id)
                                    }
                                  />
                                  <Label
                                    htmlFor={`permission-${permission.id}`}
                                    className="text-sm font-normal cursor-pointer flex-1"
                                  >
                                    {permission.descripcion ||
                                      permission.codigo}
                                  </Label>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <div className="flex gap-2">
          <LoadingButton loading={isPending} type="submit">
            Guardar
          </LoadingButton>
          <Button
            type="button"
            // onClick={() => router.back()}
            variant="link"
          >
            Volver
          </Button>
        </div>
      </form>
    </Form>
  );
}
