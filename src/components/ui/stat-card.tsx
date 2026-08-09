import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  trend,
  className,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; positive?: boolean };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3",
        className
      )}
    >
      {icon && (
        <div className="h-11 w-11 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide truncate">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-lg font-bold text-slate-800 truncate">{value}</p>
          {trend && (
            <span
              className={cn(
                "text-[11px] font-semibold",
                trend.positive === false ? "text-red-500" : "text-emerald-600"
              )}
            >
              {trend.positive === false ? "▼" : "▲"} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
