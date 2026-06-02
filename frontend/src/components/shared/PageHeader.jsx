export function PageHeader({ title, subtitle, action, testId }) {
  return (
    <div className="flex items-start justify-between gap-6 pb-6" data-testid={testId}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
