import { z } from "zod";

export const formSchema = z.object({
  email: z.string().email({ message: 'Direccion de correo invalida' }),
  password: z
    .string()
    .min(1, { message: 'Contraseña es requerido' })
    .regex(/[a-zA-Z0-9]/, { message: 'Contraseña tiene que tener nùmeros o letras' }),
})
