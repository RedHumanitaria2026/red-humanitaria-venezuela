import { z } from "zod";

export const inventarioSchema = z.object({
  centro_id: z.string().uuid("Seleccioná un centro válido"),
  categoria: z.enum([
    "agua", "alimentos", "medicamentos", "insumos_medicos", "ropa", "calzado",
    "higiene", "panales", "colchones", "frazadas", "carpas", "linternas",
    "baterias", "gas", "combustible", "herramientas", "otros",
  ]),
  nombre_item: z.string().min(2, "El nombre del item es requerido").max(150),
  cantidad_disponible: z
    .number({ invalid_type_error: "Ingresá un número válido" })
    .min(0, "Debe ser mayor o igual a 0")
    .max(1000000),
  cantidad_necesaria: z
    .number({ invalid_type_error: "Ingresá un número válido" })
    .min(0, "Debe ser mayor o igual a 0")
    .max(1000000),
  unidad: z.string().min(1, "La unidad es requerida").max(30),
  prioridad: z.enum(["critica", "alta", "media", "baja"]).default("media"),
  observaciones: z.string().max(1000).optional(),
});

export type InventarioFormValues = z.infer<typeof inventarioSchema>;
