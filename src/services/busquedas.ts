import { createClient } from "@/lib/supabase/client";
import type { Busqueda, FiltrosBusquedas } from "@/types";

export async function obtenerBusquedas(filtros?: FiltrosBusquedas): Promise<Busqueda[]> {
  const supabase = createClient();
  let query = supabase
    .from("busquedas")
    .select("*, creador:perfiles(id, nombre_completo, alias, rol)")
    .eq("activa", true)
    .order("estado", { ascending: true })
    .order("creado_en", { ascending: false });

  if (filtros?.estado) {
    query = query.eq("estado", filtros.estado);
  }
  if (filtros?.ciudad) {
    query = query.ilike("ciudad", `%${filtros.ciudad}%`);
  }
  if (filtros?.nombre) {
    const termino = `%${filtros.nombre}%`;
    query = query.or(`nombre.ilike.${termino},apellido.ilike.${termino}`);
  }

  const { data } = await query;
  return (data as unknown as Busqueda[]) || [];
}

export async function obtenerBusquedaPorId(id: string): Promise<Busqueda | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("busquedas")
    .select("*, creador:perfiles(id, nombre_completo, alias, rol)")
    .eq("id", id)
    .eq("activa", true)
    .single();
  return (data as unknown as Busqueda) || null;
}

export async function crearBusqueda(
  creadorId: string,
  datos: Omit<Busqueda, "id" | "creador_id" | "creado_en" | "actualizado_en" | "activa" | "creador">
): Promise<{ error: string | null; id?: string }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("busquedas")
    .insert({ ...datos, creador_id: creadorId })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { error: null, id: (data as { id: string } | null)?.id };
}

export async function actualizarBusqueda(
  id: string,
  datos: Partial<Omit<Busqueda, "id" | "creador_id" | "creado_en" | "actualizado_en" | "creador">>
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("busquedas")
    .update(datos)
    .eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function marcarEncontrado(id: string): Promise<{ error: string | null }> {
  return actualizarBusqueda(id, { estado: "encontrado" });
}

export async function eliminarBusqueda(id: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("busquedas")
    .update({ activa: false })
    .eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function subirFotoBusqueda(
  archivo: File,
  usuarioId: string
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();
  const ext = archivo.name.split(".").pop()?.toLowerCase();
  const permitidos = ["jpg", "jpeg", "png", "webp"];
  if (!ext || !permitidos.includes(ext)) {
    return { url: null, error: "Solo se permiten imágenes JPG, PNG o WebP." };
  }
  const nombre = `${usuarioId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("fotos-busquedas")
    .upload(nombre, archivo, { upsert: false });
  if (error) return { url: null, error: error.message };
  const { data } = supabase.storage.from("fotos-busquedas").getPublicUrl(nombre);
  return { url: data.publicUrl, error: null };
}
