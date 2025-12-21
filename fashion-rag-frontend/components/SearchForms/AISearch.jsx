export function AISearch({
  aiPrompt,
  setAiPrompt,
  topK,
  setTopK,
  onSearch,
  loading,
  isDark,
  cardClasses,
  cardTone,
  subtleText,
  subtleText2,
}) {
  return (
    <section className={`${cardClasses} ${cardTone}`}>
      <h2 className="text-base font-semibold sm:text-lg">Search by AI</h2>
      <p className={`mb-4 mt-1 text-xs sm:text-sm ${subtleText2}`}>
        Tulis prompt kreatif atau deskripsi detail tentang produk yang ingin dicari. AI akan
        menginterpretasi dan menemukan produk yang paling relevan.
      </p>

      <form onSubmit={onSearch} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium sm:text-sm">AI Prompt</label>
          <textarea
            placeholder="Contoh: 'Cari pakaian untuk musim panas yang nyaman dan stylish dengan warna cerah'..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={3}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ring-0 transition sm:text-base ${
              isDark
                ? 'border-slate-800 bg-slate-950/80 text-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40'
                : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40'
            }`}
            required
          />
        </div>

        <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
          <label className={subtleText}>
            Top K
            <input
              type="number"
              min={1}
              max={20}
              value={topK}
              onChange={(e) => setTopK(e.target.value)}
              className={`ml-2 w-20 rounded-md border px-2 py-1 text-right text-xs outline-none ${
                isDark
                  ? 'border-slate-800 bg-slate-950 text-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40'
                  : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40'
              }`}
            />
          </label>
          <span className={`text-[11px] ${subtleText2}`}>
            Sistem akan mengembalikan {topK} produk paling relevan.
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-500/40 transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Searching...' : 'Search AI'}
        </button>
      </form>
    </section>
  );
}
