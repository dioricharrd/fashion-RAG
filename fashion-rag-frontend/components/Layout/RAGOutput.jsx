export function RAGOutput({ ragText, loading, isDark, cardClasses, cardTone }) {
  // Loading skeleton
  if (loading && !ragText) {
    return (
      <section className={`${cardClasses} ${cardTone}`}>
        <div className="mb-2 h-4 w-40 animate-pulse rounded bg-slate-600/40" />
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-slate-600/30" />
          <div className="h-3 w-11/12 animate-pulse rounded bg-slate-600/30" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-slate-600/30" />
        </div>
      </section>
    );
  }

  // Actual RAG text
  if (ragText) {
    return (
      <section className={`${cardClasses} ${cardTone}`}>
        <h2 className="mb-2 text-base font-semibold sm:text-lg">Generated Recommendation</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{ragText}</p>
      </section>
    );
  }

  return null;
}
