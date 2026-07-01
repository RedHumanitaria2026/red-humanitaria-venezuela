"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { etiquetaRol } from "@/utils/formatters";
import type { PerfilUsuario } from "@/types";

interface TopbarProps {
  perfil: PerfilUsuario;
  onMenuToggle: () => void;
}

export function Topbar({ perfil, onMenuToggle }: TopbarProps) {
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);

  async function cerrarSesion() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const nombreMostrado = perfil.alias || perfil.nombre_completo;
  const iniciales = nombreMostrado
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="relative">
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="h-7 w-7 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-white">{iniciales}</span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-800 leading-tight">
              {nombreMostrado}
            </p>
            <p className="text-xs text-gray-400">{etiquetaRol(perfil.rol)}</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
        </button>

        {menuAbierto && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuAbierto(false)}
            />
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-lg border border-gray-200 shadow-dropdown z-20 overflow-hidden">
              <button
                onClick={cerrarSesion}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
