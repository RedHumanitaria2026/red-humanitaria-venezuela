import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Ingresá un email válido")
    .max(254),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(128),
});

export const registroSchema = z
  .object({
    nombre_completo: z
      .string()
      .min(2, "Ingresá tu nombre completo")
      .max(100, "El nombre es demasiado largo"),
    email: z
      .string()
      .min(1, "El email es requerido")
      .email("Ingresá un email válido")
      .max(254),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(128),
    confirmar_password: z.string().max(128),
    rol: z.enum(
      ["administrador", "responsable_centro", "voluntario", "donante", "anfitriion"],
      { required_error: "Seleccioná un rol" }
    ),
    ciudad: z.string().max(100).optional(),
    telefono: z.string().max(20).optional(),
    alias: z.string().max(50).optional(),
    clave_admin: z.string().max(100).optional(),
  })
  .refine((data) => data.password === data.confirmar_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar_password"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegistroFormValues = z.infer<typeof registroSchema>;
