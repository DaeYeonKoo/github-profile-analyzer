export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="h-[72px] w-[72px] rounded-full bg-slate-800" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-24 rounded bg-slate-800" />
          <div className="h-5 w-40 rounded bg-slate-800" />
          <div className="h-3 w-28 rounded bg-slate-800" />
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <div className="h-3 w-full rounded bg-slate-800" />
        <div className="h-3 w-5/6 rounded bg-slate-800" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-14 rounded-lg bg-slate-800" />
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-2 w-full rounded-full bg-slate-800" />
        ))}
      </div>
    </div>
  );
}
