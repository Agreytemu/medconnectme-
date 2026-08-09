import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  subtitle,
  icon,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-10 px-4 text-center",
        className
      )}
    >
      {icon && (
        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {subtitle && (
        <p className="text-xs text-slate-400 mt-1 max-w-xs">{subtitle}</p>
      )}
    </div>
  );
}
