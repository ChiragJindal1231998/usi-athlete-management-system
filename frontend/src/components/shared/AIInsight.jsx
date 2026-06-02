import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIInsight({
  title = "AI insight",
  children,
  action,
  className,
  confidence,
  testId,
}) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "relative overflow-hidden rounded-xl border border-[#1E40AF]/15 bg-[#EFF6FF] p-5",
        className
      )}
    >
      <div className="absolute left-0 top-0 h-full w-1 bg-[#1E40AF]" />
      <div className="flex items-start gap-3 pl-2">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-[#1E40AF]/20">
          <Sparkles className="h-3.5 w-3.5 text-[#1E40AF]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1E40AF]">
              {title}
            </p>
            {confidence !== undefined && (
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-[#1E40AF] ring-1 ring-[#1E40AF]/20">
                {confidence}% confidence
              </span>
            )}
          </div>
          <div className="mt-1.5 text-sm leading-relaxed text-slate-700">
            {children}
          </div>
          {action && <div className="mt-3 flex gap-2">{action}</div>}
        </div>
      </div>
    </div>
  );
}
