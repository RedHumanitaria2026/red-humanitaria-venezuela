"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Plus, Phone, MapPin, Calendar, X, Edit2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  obtenerPublicaciones,
  obtenerPublicacionPorAutor,
  crearPublicacion,
  actualizarPublicacion,
  desactivarPublicacion,
} from "@/services/publicaciones";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatearTiempoRelativo } from "@/utils/formatters";
import type { Publicacion, CategoriaPublicacion } from "@/types";

const TELEFONO_REGEX = /^[+\d\s\-().]{7,20}$/;

const publicacionSchema = z.object({
  titulo: z.string().min(5, "El título debe tener al menos 5 caracteres").max(120),
  contenido: z.string().min(10, "El contenido debe tener al menos 10 caracteres").max(1000),
  categoria: z.enum(["alerta", "recurso", "busqueda", "oferta", "informacion", "otro"]),
  ciudad: z.string().max(100).optional(),
  telefono_contacto: z
    .string()
    .regex(TELEFONO_REGEX, "Formato inválido. Ej: +58 412 0000000")
    .optional()
    .or(z.literal("")),
});

type PublicacionFormValues = z.infer<typeof publicacionSchema>;

const opcionesCategoria = [
  { value: "alerta", label: "Alerta" },
  { value: "recurso", label: "Recurso disponible" },
  { value: "busqueda", label: "Búsqueda de persona" },
  { value: "oferta", label: "Ofrezco ayuda" },
  { value: "informacion", label: "Información importante" },
  { value: "otro", label: "Otro" },
];

const colorCategoria: Record<CategoriaPublicacion, "danger" | "warning" | "primary" | "success" | "default"> = {
  alerta: "danger",
  busqueda: "warning",
  recurso: "primary",
  oferta: "success",
  informacion: "default",
  otro: "default",
};

const etiquetaCategoria: Record<CategoriaPublicacion, string> = {
  alerta: "Alerta",
  recurso: "Recurso",
  busqueda: "Búsqueda",
  oferta: "Ofrezco ayuda",
  informacion: "Información",
  otro: "Otro",
};

function limpiarTelefono(tel: string): string {
  return tel.replace(/[\s\-().]/g, "");
}

function telefonoValido(tel: string | null | undefined): boolean {
  if (!tel) return false;
  const limpio = limpiarTelefono(tel);
  return /^\+?\d{7,15}$/.test(limpio);
}

function urlWhatsApp(telefono: string): string {
  const limpio = limpiarTelefono(telefono);
  const numero = limpio.startsWith("+") ? limpio.slice(1) : limpio;
  return `https://wa.me/${numero}`;
}

export default function ComunidadPage() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalForm, setModalForm] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [perfilId, setPerfilId] = useState<string | null>(null);
  const [miPublicacion, setMiPublicacion] = useState<Publicacion | null>(null);
  const [editando, setEditando] = useState(false);

  const form = useForm<PublicacionFormValues>({
    resolver: zodResolver(publicacionSchema),
    defaultValues: {
      categoria: "informacion",
      titulo: "",
      contenido: "",
      ciudad: "",
      telefono_contacto: "",
    },
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("id")
        .eq("usuario_id", user.id)
        .single();
      if (perfil) {
        setPerfilId(perfil.id);
        const mia = await obtenerPublicacionPorAutor(perfil.id);
        setMiPublicacion(mia);
      }
    }
    const data = await obtenerPublicaciones();
    setPublicaciones(data);
    setCargando(false);
  }

  function abrirCrear() {
    setEditando(false);
    form.reset({
      categoria: "informacion",
      titulo: "",
      contenido: "",
      ciudad: "",
      telefono_contacto: "",
    });
    setErrorForm(null);
    setModalForm(true);
  }

  function abrirEditar() {
    if (!miPublicacion) return;
    setEditando(true);
    form.reset({
      titulo: miPublicacion.titulo,
      contenido: miPublicacion.contenido,
      categoria: miPublicacion.categoria,
      ciudad: miPublicacion.ciudad || "",
      telefono_contacto: miPublicacion.telefono_contacto || "",
    });
    setErrorForm(null);
    setModalForm(true);
  }

  async function onSubmit(valores: PublicacionFormValues) {
    if (!perfilId) return;
    setErrorForm(null);

    const payload = {
      titulo: valores.titulo,
      contenido: valores.contenido,
      categoria: valores.categoria,
      ciudad: valores.ciudad || null,
      telefono_contacto: valores.telefono_contacto || null,
    };

    let resultado: { error: string | null };

    if (editando && miPublicacion) {
      resultado = await actualizarPublicacion(miPublicacion.id, payload);
    } else {
      resultado = await crearPublicacion(perfilId, payload);
    }

    if (resultado.error) {
      if (resultado.error.includes("unique") || resultado.error.includes("duplicate")) {
        setErrorForm("Ya tenés una publicación activa. Editá o eliminá la existente antes de crear una nueva.");
      } else {
        setErrorForm("Error al guardar. Intentá de nuevo.");
      }
      return;
    }

    setModalForm(false);
    await cargarDatos();
  }

  async function eliminarMiPublicacion() {
    if (!miPublicacion) return;
    await desactivarPublicacion(miPublicacion.id);
    await cargarDatos();
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comunidad</h1>
          <p className="text-gray-500 mt-0.5">
            Publicaciones importantes de la red — información que no debe perderse
          </p>
        </div>
        {!miPublicacion && (
          <Button size="sm" onClick={abrirCrear}>
            <Plus className="h-4 w-4" />
            Publicar
          </Button>
        )}
      </div>

      {miPublicacion && (
        <div className="rounded-xl border-2 border-primary-200 bg-primary-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={colorCategoria[miPublicacion.categoria]}>
                  {etiquetaCategoria[miPublicacion.categoria]}
                </Badge>
                <span className="text-xs text-primary-600 font-medium">Tu publicación activa</span>
              </div>
              <p className="font-semibold text-gray-900 truncate">{miPublicacion.titulo}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={abrirEditar}
                className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-100 transition-colors"
                title="Editar"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={eliminarMiPublicacion}
                className="p-1.5 rounded-lg text-danger-500 hover:bg-danger-50 transition-colors"
                title="Desactivar publicación"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {cargando ? (
        <PageLoader />
      ) : publicaciones.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Sin publicaciones todavía"
          description="Sé el primero en compartir información importante con la red."
          action={!miPublicacion ? { label: "Publicar", onClick: abrirCrear } : undefined}
        />
      ) : (
        <div className="space-y-4">
          {publicaciones.map((pub) => (
            <div
              key={pub.id}
              className="bg-white rounded-xl border border-gray-200 shadow-card p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Badge variant={colorCategoria[pub.categoria]}>
                      {etiquetaCategoria[pub.categoria]}
                    </Badge>
                    {pub.ciudad && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {pub.ciudad}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-base leading-snug">
                    {pub.titulo}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {pub.contenido}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatearTiempoRelativo(pub.creado_en)}</span>
                </div>

                {pub.autor && (
                  <span className="text-xs text-gray-500">
                    Por {pub.autor.alias || pub.autor.nombre_completo}
                  </span>
                )}

                {telefonoValido(pub.telefono_contacto) && (
                  <a
                    href={urlWhatsApp(pub.telefono_contacto!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-success-600 hover:text-success-700 font-medium"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Contactar por WhatsApp
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalForm}
        onClose={() => setModalForm(false)}
        title={editando ? "Editar publicación" : "Nueva publicación"}
        size="lg"
      >
        {errorForm && (
          <div className="mb-4 rounded-lg bg-danger-50 border border-danger-100 px-3 py-2.5">
            <p className="text-sm text-danger-700">{errorForm}</p>
          </div>
        )}
        <div className="mb-4 rounded-lg bg-primary-50 border border-primary-100 px-3 py-2.5">
          <p className="text-sm text-primary-700">
            Solo podés tener una publicación activa a la vez. Usala para compartir información importante que no deba perderse.
          </p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Categoría"
            options={opcionesCategoria}
            error={form.formState.errors.categoria?.message}
            required
            {...form.register("categoria")}
          />
          <Input
            label="Título"
            placeholder="Ej: Agua potable disponible en Petare"
            error={form.formState.errors.titulo?.message}
            required
            {...form.register("titulo")}
          />
          <Textarea
            label="Contenido"
            placeholder="Describí la información con el mayor detalle posible..."
            error={form.formState.errors.contenido?.message}
            required
            {...form.register("contenido")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ciudad (opcional)"
              placeholder="Caracas"
              leftIcon={<MapPin className="h-4 w-4" />}
              {...form.register("ciudad")}
            />
            <div>
              <Input
                label="Teléfono de contacto (opcional)"
                type="tel"
                placeholder="+58 412 0000000"
                leftIcon={<Phone className="h-4 w-4" />}
                error={form.formState.errors.telefono_contacto?.message}
                {...form.register("telefono_contacto")}
              />
              <p className="mt-1 text-xs text-gray-500">
                Visible para todos si lo agregás.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setModalForm(false)}
              disabled={form.formState.isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" fullWidth loading={form.formState.isSubmitting}>
              {editando ? "Guardar cambios" : "Publicar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
