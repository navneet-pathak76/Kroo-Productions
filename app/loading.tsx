export default function Loading() {
  return (
    <main
      aria-label="Loading project"
      aria-busy="true"
      className="min-h-screen bg-[#050505] px-5 pb-24 pt-32 text-white sm:px-8"
    >
      <div className="mx-auto max-w-[1480px] animate-pulse">
        <div className="mb-5 h-3 w-36 rounded bg-primary/50" />
        <div className="h-16 max-w-3xl rounded bg-white/10 sm:h-24" />
        <div className="mt-5 h-4 max-w-xl rounded bg-white/10" />
        <div className="mt-2 h-4 max-w-md rounded bg-white/10" />
        <div className="mt-12 aspect-video w-full rounded-xl border border-white/10 bg-white/[0.03]" />
        <div className="mt-16 h-10 max-w-lg rounded bg-white/10" />
        <div className="mt-5 h-4 max-w-2xl rounded bg-white/[0.06]" />
      </div>
      <span className="sr-only">Loading project content…</span>
    </main>
  );
}
