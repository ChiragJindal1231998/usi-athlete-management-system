import { cn } from "@/lib/utils";

export function Card({ children, className, ...rest }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4", className)}>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ children, className }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
