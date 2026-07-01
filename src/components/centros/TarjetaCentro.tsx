"use client";

import { MapPin, Phone, Users, Edit, Trash2, ExternalLink, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  etiquetaEstadoCentro,
  formatearNumero,
  calcularPorcentajeInventario,
} from "@/utils/formatters";
import type { Centro } from "@/types";

const colorEstado = {
  activo: "success",
  saturado: "danger",
  necesita_apoyo: "warning",
  cerrado_temporalmente: "default",
} as const;

interface TarjetaCentroProps {
  centro: Centro;
  onEditar?: (centro: Centro) => void;
  onEliminar?: (centro: Centro) => void;
  puedeEditar?: boolean;
}

function generarMensajeWhatsApp(centro: Centro): string {
  const porcentaje = calcularPorcentajeInventario(centro.personas_atendidas, centro.capacidad_maxima);
  const lineas = [
    `🏥 *Centro de ayuda: ${centro.nombre}*`,
    ``,
    `📍 *Ubicación:* ${centro.ciudad}, ${centro.estado_region}`,
    `📊 *Estado:* ${etiquetaEstadoCentro(centro.estado)}`,
    `👥 *Ocupación:* ${centro.personas_atendidas}/${centro.capacidad_maxima} personas (${porcentaje}%)`,
  ];
  if (centro.contacto_nombre) lineas.push(`📞 *Contacto:* ${centro.contacto_nombre}`);
  if (centro.ubicacion_url) lineas.push(`🗺️ *Cómo llegar:* ${centro.ubicacion_url}`);
  lineas.push(``, `Compartido desde Red Humanitaria`);
  return encodeURIComponent(lineas.join("\n"));
}

export function TarjetaCentro({
  centro,
  onEditar,
  onEliminar,
  puedeEditar = false,
}: TarjetaCentroProps) {
  const porcentajeOcupacion = calcularPorcentajeInventario(
    centro.personas_atendidas,
    centro.capacidad_maxima
  );

  const borderColor =
    centro.estado === "saturado"
      ? "border-danger-200"
      : centro.estado === "necesita_apoyo"
      ? "border-warning-200"
      : "border-gray-200";

  return (
    <div className={`bg-white rounded-lg border shadow-card flex flex-col overflow-hidden ${borderColor}`}>
      {centro.estado === "saturado" && (
        <div className="px-4 py-1.5 bg-danger-500 text-white text-xs font-semibold">
          ⚠️ Centro saturado — capacidad máxima alcanzada
        </div>
      )}
      {centro.estado === "necesita_apoyo" && (
        <div className="px-4 py-1.5 bg-warning-500 text-white text-xs font-semibold">
          ⚡ Necesita apoyo
        </div>
      )}

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-sm">{centro.nombre}</h3>
            <div className="flex items-center gap-1 mt-0.5 text-gray-500">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="text-xs truncate">{centro.ciudad}, {centro.estado_region}</span>
            </div>
          </div>
          <Badge variant={colorEstado[centro.estado]} className="shrink-0">
            {etiquetaEstadoCentro(centro.estado)}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-gray-500">
              <Users className="h-3 w-3" />
              <span>Ocupación</span>
            </div>
            <span className="font-medium text-gray-700 tabular-nums">
              {formatearNumero(centro.personas_atendidas)} / {formatearNumero(centro.capacidad_maxima)}
            </span>
          </div>
          <ProgressBar value={porcentajeOcupacion} max={100} showLabel />
        </div>

        {centro.contacto_telefono && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Phone className="h-3 w-3 shrink-0" />
            <span className="truncate">{centro.contacto_nombre} — {centro.contacto_telefono}</span>
          </div>
        )}

        {centro.observaciones && (
          <p className="text-xs text-gray-500 line-clamp-2">{centro.observaciones}</p>
        )}

        <div className="flex flex-wrap gap-3 mt-auto pt-1">
          {centro.ubicacion_url && (
            <a
              href={centro.ubicacion_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              Cómo llegar
            </a>
          )}
          <a
            href={`https://wa.me/?text=${generarMensajeWhatsApp(centro)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-success-600 hover:text-success-700 font-medium"
          >
            <Share2 className="h-3 w-3 shrink-0" />
            Compartir
          </a>
        </div>
      </div>

      {puedeEditar && (
        <div className="flex gap-1.5 px-4 py-3 border-t border-gray-100 bg-gray-50">
          <Button variant="ghost" size="sm" onClick={() => onEditar?.(centro)} className="flex-1">
            <Edit className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEliminar?.(centro)}
            className="text-danger-500 hover:text-danger-600 hover:bg-danger-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
           </div>
      )}
    </div>
  );
}
