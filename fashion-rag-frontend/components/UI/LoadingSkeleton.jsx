export function LoadingSkeleton({ isDark, count = 5 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`flex flex-col overflow-hidden rounded-2xl border shadow-md animate-pulse ${
            isDark
              ? 'border-slate-800 bg-slate-900/80 shadow-slate-950/70'
              : 'border-slate-200 bg-white shadow-slate-200/70'
          }`}
        >
          <div
            className={`aspect-[3/4] ${
              isDark ? 'bg-slate-800/80' : 'bg-slate-200/70'
            }`}
          />
          <div className="space-y-2 px-3 py-3">
            <div className="h-3 w-4/5 rounded bg-slate-600/40" />
            <div className="h-3 w-1/2 rounded bg-slate-600/30" />
            <div className="h-3 w-2/3 rounded bg-slate-600/30" />
          </div>
        </div>
      ))}
    </div>
  );
}
