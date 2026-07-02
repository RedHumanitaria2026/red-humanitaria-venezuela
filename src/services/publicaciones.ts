import { createClient } from "@/lib/supabase/client";
import type { Publicacion } from "@/types";

export async function obtenerPublicaciones(): Promise<Publicacion[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("publicaciones")
    .select("*, autor:perfiles(id, nombre_completo, alias, telefono, telefono_visible, ciudad)")
    .eq("activa", true)
    .order("creado_en", { ascending: false });
  return (data as Publicacion[]) || [];
}

export async function obtenerPublicacionPorAutor(
  autorId: string
): Promise<Publicacion | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("publicaciones")
    .select("*")
    .eq("autor_id", autorId)
    .eq("activa", true)
    .maybeSingle();
  return (data as Publicacion) || null;
}

export async function crearPublicacion(
  autorId: string,
  valores: Pick<Publicacion, "titulo" | "contenido" | "categoria" | "ciudad" | "telefono_contacto">
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("publicaciones").insert({
    autor_id: autorId,
    titulo: valores.titulo,
    contenido: valores.contenido,
    categoria: valores.categoria,
    ciudad: valores.ciudad || null,
    telefono_contacto: valores.telefono_contacto || null,
    activa: true,
  });
  if (error) return { error: error.message };
  return { error: null };
}

export async function desactivarPublicacion(
  id: string
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("publicaciones")
    .update({ activa: false })
    .eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function actualizarPublicacion(
  id: string,
  valores: Pick<Publicacion, "titulo" | "contenido" | "categoria" | "ciudad" | "telefono_contacto">
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("publicaciones")
    .update({
      titulo: valores.titulo,
      contenido: valores.contenido,
      categoria: valores.categoria,
      ciudad: valores.ciudad || null,
      telefono_contacto: valores.telefono_contacto || null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}
