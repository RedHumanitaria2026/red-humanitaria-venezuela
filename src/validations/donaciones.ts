import { z } from "zod";

export const donacionSchema = z.object({
  nombre_donante: z.string().min(2, "El nombre es requerido").max(100),
  categoria: z.enum([
    "agua", "alimentos", "medicamentos", "insumos_medicos", "ropa", "calzado",
    "higiene", "panales", "colchones", "frazadas", "carpas", "linternas",
    "baterias", "gas", "combustible", "herramientas", "otros",
  ]),
  descripcion: z.string().min(5, "La descripción es requerida").max(500),
  cantidad: z
    .number({ invalid_type_error: "Ingresá un número válido" })
    .min(0.01, "La cantidad debe ser mayor a 0")
    .max(1000000),
  unidad: z.string().min(1, "La unidad es requerida").max(30),
  centro_destino_id: z.string().uuid().optional().nullable(),
  estado: z.enum(["pendiente", "en_camino", "entregado", "recibido"]).default("pendiente"),
  observaciones: z.string().max(1000).optional(),
  latitud: z.number().min(-90).max(90).optional().nullable(),
  longitud: z.number().min(-180).max(180).optional().nullable(),
  ubicacion_url: z.string().url("URL inválida").max(500).optional().nullable(),
});

export type DonacionFormValues = z.infer<typeof donacionSchema>;
