import { type ReactNode } from "react";
import { cn } from "@/utils/cn";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "primary"
  | "default"
  | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-success-50 text-success-700 ring-1 ring-inset ring-success-100",
  warning: "bg-warning-50 text-warning-700 ring-1 ring-inset ring-warning-100",
  danger: "bg-danger-50 text-danger-600 ring-1 ring-inset ring-danger-100",
  primary: "bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100",
  default: "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200",
  info: "bg-primary-50 text-primary-600 ring-1 ring-inset ring-primary-100",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
