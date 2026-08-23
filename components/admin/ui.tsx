export function MetricCard({ label, value, unit }: { label: string; value?: number | string; unit?: string }) {
  return (
    <div className="cinema-panel rounded-xl p-4">
      <p className="text-xs uppercase tracking-wider text-white/45">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums">
        {value !== undefined ? `${value}${unit ?? ""}` : "—"}
      </p>
    </div>
  );
}

export function TextValueCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="cinema-panel rounded-xl p-4">
      <p className="text-xs uppercase tracking-wider text-white/45">{label}</p>
      <p className="mt-2 break-all text-sm font-medium text-white/80">{value}</p>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/55">{title}</h2>
      {children}
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-white/50">
      {message}
    </p>
  );
}
