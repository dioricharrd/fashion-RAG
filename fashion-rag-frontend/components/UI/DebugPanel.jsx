export function DebugPanel({ 
  results, 
  lastSearch, 
  ragText, 
  isDark, 
  subtleText, 
  subtleText2,
  cardClasses,
  cardTone 
}) {
  // Calculate score statistics
  let scoreStats = null;
  if (results && results.length > 0) {
    const scores = results
      .map((r) => r.score)
      .filter((s) => typeof s === 'number' && !Number.isNaN(s));

    if (scores.length > 0) {
      const min = Math.min(...scores);
      const max = Math.max(...scores);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      scoreStats = { min, max, avg, count: scores.length };
    }
  }

  if (!results.length && !lastSearch && !ragText) {
    return null;
  }

  return (
    <section className={`mt-8 ${cardClasses} ${cardTone}`}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold sm:text-base">
          Debug Panel (Client-side View)
        </h2>
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-200">
          Read-only · for analysis
        </span>
      </div>

      {/* Last search info */}
      {lastSearch && (
        <div className="mb-3 text-xs sm:text-sm">
          <p className={`mb-1 font-semibold ${subtleText}`}>Last search:</p>
          <p className={subtleText2}>
            Type: <span className="font-mono">{lastSearch.type}</span> · Label:{' '}
            <span className="font-mono">{lastSearch.label}</span> · Top K:{' '}
            <span className="font-mono">{lastSearch.topK}</span>
          </p>
        </div>
      )}

      {/* Score statistics */}
      {scoreStats && (
        <div className="mb-3 text-xs sm:text-sm">
          <p className={`mb-1 font-semibold ${subtleText}`}>Score statistics (from retrieval):</p>
          <p className={subtleText2}>
            Count: <span className="font-mono">{scoreStats.count}</span> · Min:{' '}
            <span className="font-mono">{scoreStats.min.toFixed(6)}</span> · Max:{' '}
            <span className="font-mono">{scoreStats.max.toFixed(6)}</span> · Avg:{' '}
            <span className="font-mono">{scoreStats.avg.toFixed(6)}</span>
          </p>
        </div>
      )}

      {/* RAG text length */}
      {ragText && (
        <div className="mb-3 text-xs sm:text-sm">
          <p className={`mb-1 font-semibold ${subtleText}`}>RAG output length:</p>
          <p className={subtleText2}>
            Characters: <span className="font-mono">{ragText.length}</span>
          </p>
        </div>
      )}

      {/* Results table */}
      {results.length > 0 && (
        <div className="mb-3">
          <p className={`mb-1 text-xs font-semibold ${subtleText}`}>
            Top results (idx · score · title):
          </p>
          <div className="max-h-40 overflow-auto rounded-lg border border-slate-700/60 text-xs">
            <table className="min-w-full border-separate border-spacing-y-0.25">
              <thead className={isDark ? 'bg-slate-900/80' : 'bg-slate-100'}>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="px-2 py-1 font-medium">Idx</th>
                  <th className="px-2 py-1 font-medium">Score</th>
                  <th className="px-2 py-1 font-medium">Title</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.idx} className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                    <td className="px-2 py-1 font-mono text-[11px] align-top">{r.idx}</td>
                    <td className="px-2 py-1 font-mono text-[11px] align-top">
                      {typeof r.score === 'number' ? r.score.toFixed(6) : '-'}
                    </td>
                    <td className="px-2 py-1 text-[11px] align-top">
                      {r.display_name || '(no title)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JSON snippet */}
      {results.length > 0 && (
        <div className="text-xs">
          <p className={`mb-1 font-semibold ${subtleText}`}>Raw first item (JSON snippet):</p>
          <pre
            className={`max-h-52 overflow-auto rounded-lg border px-3 py-2 text-[10px] leading-snug ${
              isDark
                ? 'border-slate-700 bg-slate-950 text-slate-200'
                : 'border-slate-300 bg-slate-100 text-slate-800'
            }`}
          >
            {JSON.stringify(results[0], null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}
