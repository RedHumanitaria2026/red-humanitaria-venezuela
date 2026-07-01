import { cn } from "@/utils/cn";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
}: ProgressBarProps) {
  const porcentaje = Math.min(Math.round((value / max) * 100), 100);

  const colorClase =
    porcentaje <= 20
      ? "bg-danger-500"
      : porcentaje <= 60
      ? "bg-warning-500"
      : "bg-success-500";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", colorClase)}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-500 w-8 text-right tabular-nums">
          {porcentaje}%
        </span>
            )}
    </div>
  );
}
