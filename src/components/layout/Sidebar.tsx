"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Package,
  Gift,
  Users,
  Home,
  HeartHandshake,
  Bell,
  X,
  Heart,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/utils/cn";
import type { UserRole } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Panel principal",
    icon: LayoutDashboard,
    roles: ["administrador", "responsable_centro", "voluntario", "donante", "anfitriion"],
  },
  {
    href: "/centros",
    label: "Centros",
    icon: Building2,
    roles: ["administrador", "responsable_centro", "voluntario"],
  },
  {
    href: "/inventario",
    label: "Inventario",
    icon: Package,
    roles: ["administrador", "responsable_centro"],
  },
  {
    href: "/donaciones",
    label: "Donaciones",
    icon: Gift,
    roles: ["administrador", "responsable_centro", "donante"],
  },
  {
    href: "/voluntarios",
    label: "Voluntarios",
    icon: Users,
    roles: ["administrador", "responsable_centro", "voluntario"],
  },
  {
    href: "/alojamientos",
    label: "Alojamientos",
    icon: Home,
    roles: ["administrador", "responsable_centro", "voluntario", "anfitriion"],
  },
  {
    href: "/solicitudes",
    label: "Solicitudes",
    icon: HeartHandshake,
    roles: ["administrador", "responsable_centro", "voluntario"],
  },
  {
    href: "/comunidad",
    label: "Comunidad",
    icon: MessageSquare,
    roles: ["administrador", "responsable_centro", "voluntario", "donante", "anfitriion"],
  },
  {
    href: "/alertas",
    label: "Alertas",
    icon: Bell,
    roles: ["administrador", "responsable_centro"],
  },
];

interface SidebarProps {
  rolUsuario: UserRole;
  onClose?: () => void;
  mobile?: boolean;
}

export function Sidebar({ rolUsuario, onClose, mobile }: SidebarProps) {
  const pathname = usePathname();

  const itemsVisibles = navItems.filter((item) =>
    item.roles.includes(rolUsuario)
  );

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-primary-600",
        mobile ? "w-full" : "w-60"
      )}
    >
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white/10 rounded-lg">
            <Heart className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">Red Humanitaria</p>
            <p className="text-xs text-white/50 leading-tight">Venezuela</p>
          </div>
        </div>
        {mobile && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-hide">
        {itemsVisibles.map((item) => {
          const activo =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                activo
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:bg-white/5 hover:text-white/90"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  activo ? "text-white" : "text-white/40"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <p className="text-xs text-white/30 text-center">Red Humanitaria Venezuela</p>
      </div>
    </aside>
  );
}
