"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Search, Plus, Phone, MapPin, Calendar, X, Edit2,
  CheckCircle, User, MessageCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  obtenerBusquedas,
  crearBusqueda,
  actualizarBusqueda,
  marcarEncontrado,
  eliminarBusqueda,
  subirFotoBusqueda,
} from "@/services/busquedas";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatearFecha } from "@/utils/formatters";
import type { Busqueda, EstadoBusqueda } from "@/types";

const TELEFONO_REGEX = /^[+\d\s\-().]{7,20}$/;

const busquedaSchema = z.object({
  nombre: z.string().min(1, "Requerido").max(100),
  apellido: z.string().min(1, "Requerido").max(100),
  edad: z.coerce.number().int().min(0).max(120).optional().or(z.literal("")),
  altura_cm: z.coerce.number().int().min(50).max(250).optional().or(z.literal("")),
  sexo: z.enum(["masculino", "femenino", "otro"]).optional().or(z.literal("")),
  ciudad: z.string().max(100).optional().or(z.literal("")),
  ultima_ubicacion: z.string().max(200).optional().or(z.literal("")),
  telefono_contacto: z
    .string()
    .regex(TELEFONO_REGEX, "Formato inválido. Ej: +58 412 0000000")
    .optional()
    .or(z.literal("")),
  informacion_adicional: z.string().max(1000).optional().or(z.literal("")),
});

type BusquedaFormValues = z.infer<typeof busquedaSchema>;

const opcionesSexo = [
  { value: "", label: "No especificar" },
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
  { value: "otro", label: "Otro" },
];

const opcionesEstadoFiltro = [
  { value: "", label: "Todos los estados" },
  { value: "en_busqueda", label: "En búsqueda" },
  { value: "encontrado", label: "Encontrado" },
];

function limpiarTelefono(tel: string): string {
  return tel.replace(/[\s\-().]/g, "");
}

function telefonoValido(tel: string | null | undefined): boolean {
  if (!tel) return false;
  const limpio = limpiarTelefono(tel);
  return /^\+?\d{7,15}$/.test(limpio);
}

function urlWhatsAppInfo(telefono: string, nombre: string, apellido: string, nota: string): string {
  const limpio = limpiarTelefono(telefono);
  const numero = limpio.startsWith("+") ? limpio.slice(1) : limpio;
  const mensaje = encodeURIComponent(
    `Hola, vi la publicación de búsqueda de ${nombre} ${apellido} en Red Humanitaria.${nota ? ` Tengo esta información: ${nota}` : ""}`
  );
  return `https://wa.me/${numero}?text=${mensaje}`;
}

interface ModalInfoProps {
  busqueda: Busqueda;
  onClose: () => void;
}

function ModalTengoInformacion({ busqueda, onClose }: ModalInfoProps) {
  const [nota, setNota] = useState("");
  const nombreCompleto = `${busqueda.nombre} ${busqueda.apellido}`;

  return (
    <Modal open onClose={onClose} title="Tengo información" size="md">
      <div className="space-y-4">
        <div className="rounded-xl bg-warning-50 border border-warning-200 p-4">
          <p className="font-semibold text-gray-900 text-base mb-1">{nombreCompleto}</p>
          {busqueda.ciudad && (
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {busqueda.ciudad}
            </p>
          )}
          {busqueda.telefono_contacto && (
            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
              <Phone className="h-3.5 w-3.5" />
              {busqueda.telefono_contacto}
            </p>
          )}
        </div>

        <p className="text-sm text-gray-700">
          Si viste a esta persona o tenés información, contactá al responsable de la publicación.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tu nota (opcional)
          </label>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder={"La vi en…\nTengo información sobre…"}
            rows={3}
            maxLength={300}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{nota.length}/300</p>
        </div>

        {telefonoValido(busqueda.telefono_contacto) ? (
          <a
            href={urlWhatsAppInfo(busqueda.telefono_contacto!, busqueda.nombre, busqueda.apellido, nota)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-success-600 hover:bg-success-700 text-white font-medium py-2.5 text-sm transition-colors"
          >
            <Phone className="h-4 w-4" />
            Contactar por WhatsApp
          </a>
        ) : (
          <p className="text-sm text-gray-500 text-center">
            Esta publicación no tiene teléfono de contacto registrado.
          </p>
        )}

        <Button variant="secondary" fullWidth onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </Modal>
  );
}

interface TarjetaBusquedaProps {
  busqueda: Busqueda;
  perfilId: string | null;
  onEditar: (b: Busqueda) => void;
  onMarcarEncontrado: (id: string) => void;
  onEliminar: (id: string) => void;
  onTengoInfo: (b: Busqueda) => void;
}

function TarjetaBusqueda({
  busqueda, perfilId, onEditar, onMarcarEncontrado, onEliminar, onTengoInfo,
}: TarjetaBusquedaProps) {
  const esMia = busqueda.creador_id === perfilId;
  const encontrado = busqueda.estado === "encontrado";

  return (
    <div className={`bg-white rounded-xl border shadow-card p-4 space-y-3 ${encontrado ? "border-success-200 opacity-75" : "border-gray-200"}`}>
      <div className="flex gap-3">
        {busqueda.foto_url ? (
          <Image
            src={busqueda.foto_url}
            alt={`${busqueda.nombre} ${busqueda.apellido}`}
            width={64}
            height={64}
            className="w-16 h-16 rounded-lg object-cover shrink-0 border border-gray-200"
            unoptimized
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <User className="h-7 w-7 text-gray-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-base leading-tight">
                {busqueda.nombre} {busqueda.apellido}
              </h3>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                {busqueda.edad !== null && (
                  <span className="text-xs text-gray-500">{busqueda.edad} años</span>
                )}
                {busqueda.sexo && (
                  <span className="text-xs text-gray-500 capitalize">{busqueda.sexo}</span>
                )}
                {busqueda.altura_cm && (
                  <span className="text-xs text-gray-500">{busqueda.altura_cm} cm</span>
                )}
              </div>
            </div>
            <Badge variant={encontrado ? "success" : "warning"}>
              {encontrado ? "Encontrado" : "En búsqueda"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {busqueda.ciudad && (
          <p className="text-sm text-gray-600 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            {busqueda.ciudad}
          </p>
        )}
        {busqueda.ultima_ubicacion && (
          <p className="text-sm text-gray-600 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-warning-500 shrink-0" />
            Última ubicación: {busqueda.ultima_ubicacion}
          </p>
        )}
        {busqueda.informacion_adicional && (
          <p className="text-sm text-gray-600 leading-relaxed mt-1 line-clamp-2">
            {busqueda.informacion_adicional}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-50 gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Calendar className="h-3.5 w-3.5" />
          {formatearFecha(busqueda.creado_en)}
        </div>

        <div className="flex gap-2 flex-wrap">
          {!encontrado && (
            <Button size="sm" variant="secondary" onClick={() => onTengoInfo(busqueda)}>
              <MessageCircle className="h-3.5 w-3.5" />
              Tengo información
            </Button>
          )}
          {esMia && !encontrado && (
            <>
              <button
                onClick={() => onMarcarEncontrado(busqueda.id)}
                className="p-1.5 rounded-lg text-success-600 hover:bg-success-50 transition-colors"
                title="Marcar como encontrado"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEditar(busqueda)}
                className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                title="Editar"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </>
          )}
          {esMia && (
            <button
              onClick={() => onEliminar(busqueda.id)}
              className="p-1.5 rounded-lg text-danger-500 hover:bg-danger-50 transition-colors"
              title="Eliminar publicación"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BusquedasPage() {
  const [busquedas, setBusquedas] = useState<Busqueda[]>([]);
  const [cargando, setCargando] = useState(true);
  const [perfilId, setPerfilId] = useState<string | null>(null);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [modalForm, setModalForm] = useState(false);
  const [editando, setEditando] = useState<Busqueda | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [busquedaInfo, setBusquedaInfo] = useState<Busqueda | null>(null);
  const [filtroCiudad, setFiltroCiudad] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoBusqueda | "">("");
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoArchivo, setFotoArchivo] = useState<File | null>(null);
  const fotoRef = useRef<HTMLInputElement>(null);

  const form = useForm<BusquedaFormValues>({
    resolver: zodResolver(busquedaSchema),
    defaultValues: {
      nombre: "", apellido: "", ciudad: "", ultima_ubicacion: "",
      telefono_contacto: "", informacion_adicional: "", sexo: "",
    },
  });

  useEffect(() => {
    inicializar();
  }, []);

  async function inicializar() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUsuarioId(user.id);
      const { data: perfil } = await supabase
        .from("perfiles").select("id").eq("usuario_id", user.id).single();
      if (perfil) setPerfilId(perfil.id);
    }
    await cargarBusquedas();
  }

  async function cargarBusquedas() {
    setCargando(true);
    const data = await obtenerBusquedas({
      nombre: filtroNombre || undefined,
      ciudad: filtroCiudad || undefined,
      estado: (filtroEstado as EstadoBusqueda) || undefined,
    });
    setBusquedas(data);
    setCargando(false);
  }

  async function aplicarFiltros() {
    await cargarBusquedas();
  }

  function abrirCrear() {
    setEditando(null);
    setFotoPreview(null);
    setFotoArchivo(null);
    setErrorForm(null);
    form.reset({
      nombre: "", apellido: "", ciudad: "", ultima_ubicacion: "",
      telefono_contacto: "", informacion_adicional: "", sexo: "",
    });
    setModalForm(true);
  }

  function abrirEditar(b: Busqueda) {
    setEditando(b);
    setFotoPreview(b.foto_url || null);
    setFotoArchivo(null);
    setErrorForm(null);
    form.reset({
      nombre: b.nombre,
      apellido: b.apellido,
      edad: b.edad ?? "",
      altura_cm: b.altura_cm ?? "",
      sexo: b.sexo ?? "",
      ciudad: b.ciudad ?? "",
      ultima_ubicacion: b.ultima_ubicacion ?? "",
      telefono_contacto: b.telefono_contacto ?? "",
      informacion_adicional: b.informacion_adicional ?? "",
    });
    setModalForm(true);
  }

  function seleccionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    if (archivo.size > 5 * 1024 * 1024) {
      setErrorForm("La foto no puede superar 5 MB.");
      return;
    }
    setFotoArchivo(archivo);
    setFotoPreview(URL.createObjectURL(archivo));
  }

  async function onSubmit(valores: BusquedaFormValues) {
    if (!perfilId || !usuarioId) return;
    setErrorForm(null);

    let fotoUrl: string | null = editando?.foto_url || null;

    if (fotoArchivo) {
      setSubiendoFoto(true);
      const { url, error: errFoto } = await subirFotoBusqueda(fotoArchivo, usuarioId);
      setSubiendoFoto(false);
      if (errFoto) { setErrorForm(errFoto); return; }
      fotoUrl = url;
    }

    const payload = {
      nombre: valores.nombre,
      apellido: valores.apellido,
      edad: valores.edad !== "" && valores.edad !== undefined ? Number(valores.edad) : null,
      altura_cm: valores.altura_cm !== "" && valores.altura_cm !== undefined ? Number(valores.altura_cm) : null,
      sexo: (valores.sexo || null) as "masculino" | "femenino" | "otro" | null,
      ciudad: valores.ciudad || null,
      ultima_ubicacion: valores.ultima_ubicacion || null,
      telefono_contacto: valores.telefono_contacto || null,
      informacion_adicional: valores.informacion_adicional || null,
      foto_url: fotoUrl,
      estado: "en_busqueda" as const,
    };

    let resultado: { error: string | null };
    if (editando) {
      resultado = await actualizarBusqueda(editando.id, payload);
    } else {
      resultado = await crearBusqueda(perfilId, payload);
    }

    if (resultado.error) {
      setErrorForm("Error al guardar. Intentá de nuevo.");
      return;
    }

    setModalForm(false);
    await cargarBusquedas();
  }

  async function handleMarcarEncontrado(id: string) {
    await marcarEncontrado(id);
    await cargarBusquedas();
  }

  async function handleEliminar(id: string) {
    await eliminarBusqueda(id);
    await cargarBusquedas();
  }

  const enBusqueda = busquedas.filter((b) => b.estado === "en_busqueda");
  const encontrados = busquedas.filter((b) => b.estado === "encontrado");

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">En búsqueda</h1>
          <p className="text-gray-500 mt-0.5">
            Personas reportadas como desaparecidas o en paradero desconocido
          </p>
        </div>
        <Button size="sm" onClick={abrirCrear}>
          <Plus className="h-4 w-4" />
          Publicar búsqueda
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && aplicarFiltros()}
              placeholder="Buscar por nombre..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={filtroCiudad}
              onChange={(e) => setFiltroCiudad(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && aplicarFiltros()}
              placeholder="Filtrar por ciudad..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as EstadoBusqueda | "")}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {opcionesEstadoFiltro.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <Button size="sm" variant="secondary" onClick={aplicarFiltros}>
          <Search className="h-3.5 w-3.5" />
          Buscar
        </Button>
      </div>

      {cargando ? (
        <PageLoader />
      ) : busquedas.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Sin publicaciones de búsqueda"
          description="Podés publicar aquí si estás buscando a alguien."
          action={{ label: "Publicar búsqueda", onClick: abrirCrear }}
        />
      ) : (
        <div className="space-y-6">
          {enBusqueda.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-warning-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Search className="h-4 w-4" />
                En búsqueda ({enBusqueda.length})
              </h2>
              <div className="space-y-3">
                {enBusqueda.map((b) => (
                  <TarjetaBusqueda
                    key={b.id}
                    busqueda={b}
                    perfilId={perfilId}
                    onEditar={abrirEditar}
                    onMarcarEncontrado={handleMarcarEncontrado}
                    onEliminar={handleEliminar}
                    onTengoInfo={setBusquedaInfo}
                  />
                ))}
              </div>
            </section>
          )}

          {encontrados.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-success-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Encontrados ({encontrados.length})
              </h2>
              <div className="space-y-3">
                {encontrados.map((b) => (
                  <TarjetaBusqueda
                    key={b.id}
                    busqueda={b}
                    perfilId={perfilId}
                    onEditar={abrirEditar}
                    onMarcarEncontrado={handleMarcarEncontrado}
                    onEliminar={handleEliminar}
                    onTengoInfo={setBusquedaInfo}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {busquedaInfo && (
        <ModalTengoInformacion
          busqueda={busquedaInfo}
          onClose={() => setBusquedaInfo(null)}
        />
      )}

      <Modal
        open={modalForm}
        onClose={() => setModalForm(false)}
        title={editando ? "Editar búsqueda" : "Publicar búsqueda"}
        size="lg"
      >
        {errorForm && (
          <div className="mb-4 rounded-lg bg-danger-50 border border-danger-100 px-3 py-2.5">
            <p className="text-sm text-danger-700">{errorForm}</p>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Foto (opcional)
            </label>
            <div className="flex items-center gap-4">
              {fotoPreview ? (
                <Image
                  src={fotoPreview}
                  alt="Vista previa"
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                  unoptimized
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                  <User className="h-7 w-7 text-gray-400" />
                </div>
              )}
              <div>
                <input
                  ref={fotoRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={seleccionarFoto}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fotoRef.current?.click()}
                >
                  {fotoPreview ? "Cambiar foto" : "Subir foto"}
                </Button>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG o WebP. Máx 5 MB.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              placeholder="María"
              error={form.formState.errors.nombre?.message}
              required
              {...form.register("nombre")}
            />
            <Input
              label="Apellido"
              placeholder="García"
              error={form.formState.errors.apellido?.message}
              required
              {...form.register("apellido")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Edad"
              type="number"
              placeholder="32"
              error={form.formState.errors.edad?.message}
              {...form.register("edad")}
            />
            <Input
              label="Altura (cm)"
              type="number"
              placeholder="165"
              error={form.formState.errors.altura_cm?.message}
              {...form.register("altura_cm")}
            />
            <Select
              label="Sexo"
              options={opcionesSexo}
              {...form.register("sexo")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ciudad"
              placeholder="Caracas"
              leftIcon={<MapPin className="h-4 w-4" />}
              {...form.register("ciudad")}
            />
            <Input
              label="Última ubicación conocida"
              placeholder="Petare, Caracas"
              leftIcon={<MapPin className="h-4 w-4" />}
              {...form.register("ultima_ubicacion")}
            />
          </div>

          <Input
            label="Teléfono de contacto"
            type="tel"
            placeholder="+58 412 0000000"
            leftIcon={<Phone className="h-4 w-4" />}
            error={form.formState.errors.telefono_contacto?.message}
            {...form.register("telefono_contacto")}
          />

          <Textarea
            label="Información adicional (opcional)"
            placeholder="Describí características físicas, contexto de la desaparición u otra información relevante..."
            rows={3}
            error={form.formState.errors.informacion_adicional?.message}
            {...form.register("informacion_adicional")}
          />

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setModalForm(false)}
              disabled={form.formState.isSubmitting || subiendoFoto}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              fullWidth
              loading={form.formState.isSubmitting || subiendoFoto}
            >
              {editando ? "Guardar cambios" : "Publicar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
