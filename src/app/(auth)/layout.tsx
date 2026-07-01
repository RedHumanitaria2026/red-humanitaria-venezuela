import { Heart, Shield, Users, Package } from "lucide-react";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] bg-primary-600 flex-col justify-between p-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Red Humanitaria</p>
            <p className="text-xs text-white/50">Venezuela</p>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            Coordinando ayuda<br />donde más se necesita
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm">
            Plataforma de gestión humanitaria para centros de ayuda, voluntarios, donantes y familias en situación de vulnerabilidad.
          </p>
          <div className="mt-10 space-y-4">
            {[
              { icon: Shield, label: "Gestión segura de centros y beneficiarios" },
              { icon: Users, label: "Coordinación de voluntarios en tiempo real" },
              { icon: Package, label: "Control de inventario e inventario crítico" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="p-1.5 bg-white/10 rounded-md shrink-0">
                  <Icon className="h-3.5 w-3.5 text-white/70" />
                </div>
                <span className="text-sm text-white/60">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/25">© 2026 Red Humanitaria Venezuela. Todos los derechos reservados.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="p-1.5 bg-primary-600 rounded-lg">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800">Red Humanitaria Venezuela</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
