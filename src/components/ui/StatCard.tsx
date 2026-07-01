import { type LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

type StatCardColor = "blue" | "green" | "orange" | "red" | "purple" | "teal";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: StatCardColor;
  className?: string;
}

const iconColorClasses: Record<StatCardColor, string> = {
  blue: "text-primary-600 bg-primary-50",
  green: "text-success-600 bg-success-50",
  orange: "text-warning-500 bg-warning-50",
  red: "text-danger-500 bg-danger-50",
  purple: "text-purple-600 bg-purple-50",
  teal: "text-teal-600 bg-teal-50",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 shadow-card p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1.5 tabular-nums">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-gray-400 mt-1">{trend}</p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg shrink-0", iconColorClasses[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
