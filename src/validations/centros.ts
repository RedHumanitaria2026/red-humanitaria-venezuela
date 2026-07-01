import { z } from "zod";

export const centroSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido").max(150),
  direccion: z.string().min(5, "La dirección es requerida").max(300),
  ciudad: z.string().min(2, "La ciudad es requerida").max(100),
  estado_region: z.string().min(2, "El estado/región es requerido").max(100),
  contacto_nombre: z.string().min(2, "El nombre de contacto es requerido").max(100),
  contacto_telefono: z.string().min(7, "El teléfono de contacto es requerido").max(20),
  capacidad_maxima: z
    .number({ invalid_type_error: "Ingresá un número válido" })
    .int()
    .min(0, "Debe ser mayor o igual a 0")
    .max(100000),
  personas_atendidas: z
    .number({ invalid_type_error: "Ingresá un número válido" })
    .int()
    .min(0)
    .max(100000)
    .default(0),
  estado: z
    .enum(["activo", "saturado", "necesita_apoyo", "cerrado_temporalmente"])
    .default("activo"),
  observaciones: z.string().max(1000).optional(),
  latitud: z.number().min(-90).max(90).optional().nullable(),
  longitud: z.number().min(-180).max(180).optional().nullable(),
  ubicacion_url: z.string().url().optional(),
});

export type CentroFormValues = z.infer<typeof centroSchema>;
