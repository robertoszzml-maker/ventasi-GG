"use client"

import {
  zodResolver
} from "@hookform/resolvers/zod"
import {
  useForm
} from "react-hook-form"
import * as z from "zod"

import {
  Button
} from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Input,
} from "@/components/ui/input"

import { useToast } from "@/hooks/use-toast"
import { useCreateUsuarioMutation, useEditUsuarioMutation } from '@/hooks/usuario'
import { Usuario } from "@/types"
import { useRouter } from 'next/navigation'; // Usage: App router
import { Checkbox } from "../ui/checkbox"
import { LoadingButton } from "@/components/ui/loading-button"
import { RoleSelector } from "@/components/selectors/role-selector"

const formSchema = z.object({
  id: z.number().optional(),
  nombre: z.string({ message: 'Requerido' }),
  email: z.string({ message: 'Requerido' }),
  roleId: z.number({ required_error: 'Debe seleccionar un rol' }),
  active: z.boolean().default(false).optional(),
  password: z.string().optional(),
  attemps: z.unknown({ message: 'Requerido' }).optional(),
  telefono: z
    .string()
    .regex(/^\+?[0-9\s-]+$/, "El teléfono solo puede contener un '+' al inicio, números, espacios y guiones"),
  telefonoOtro: z
    .string()
    .regex(/^\+?[0-9\s-]+$/, "El teléfono solo puede contener un '+' al inicio, números, espacios y guiones")
    .optional()
    .or(z.literal('')),
});

type MyFormProps = {
  data?: Usuario;
}
export default function MyForm({ data }: MyFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: data?.id || 0,
      nombre: data?.nombre || "",
      password: data?.password || "",
      email: data?.email || "",
      active: data?.active ? true : false,
      telefono: data?.telefono || "",
      telefonoOtro: data?.telefonoOtro || "",
      roleId: data?.roleId || undefined,
      attemps: data?.attemps || 0

    }

  })

  const { mutateAsync: create, isPending: createLoading } = useCreateUsuarioMutation()
  const { mutateAsync: edit, isPending: editLoading } = useEditUsuarioMutation()
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (values.id) {
        await edit({ id: values.id, data: values })
      }
      else {
        await create(values)
      }
      toast({ description: 'Exito al realizar la operación', variant: 'default' })
      router.back()


    } catch (error) {
      console.error("Form submission error", error);
      toast({ description: 'Error al realizar la operación', variant: 'destructive' })
    }
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8  mx-auto py-10">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""

                      type="text"
                      {...field} />
                  </FormControl>
                  <FormDescription>Nombre del usuario</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="correo@example.com"
                      type="email"
                      {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>Telefono</FormLabel>
                  <FormControl className="w-full">
                    <Input
                      placeholder="299-4 444-44"
                      type="telefono"
                      {...field} />
                  </FormControl>
                  <FormDescription>Telefono</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <FormField
              control={form.control}
              name="telefonoOtro"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>Otro telefono</FormLabel>
                  <FormControl className="w-full">
                    <Input
                      placeholder="299-4 444-44"
                      type="telefono"
                      {...field} />
                  </FormControl>
                  <FormDescription>Otro telefono</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl className="w-full">
                    <Input
                      type="text"
                      {...field} />
                  </FormControl>
                  <FormDescription>Ingrese contraseña</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <FormControl>
                    <RoleSelector
                      value={field.value ? String(field.value) : ""}
                      onChange={(value) => field.onChange(parseInt(value))}
                    />
                  </FormControl>
                  <FormDescription>Rol del usuario</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Activo
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <FormField
              control={form.control}
              name="attemps"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>Intentos</FormLabel>
                  <FormControl className="w-full">
                    <Input
                      {...field}
                      onInput={(e) => {
                        const newValue = e.currentTarget.value.replace(/\D/g, "");
                        e.currentTarget.value = newValue;
                      }}
                    />
                  </FormControl>
                  <FormDescription>Si los intentos son mayor a 4 el usuario permanece bloqueado</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <LoadingButton type="submit" loading={createLoading || editLoading}>Guardar</LoadingButton>
          <Button type="button" onClick={() => router.back()} variant={"link"}>Volver</Button>
        </div>
      </form>
    </Form >
  )
}