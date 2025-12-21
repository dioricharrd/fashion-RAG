export function TextSearch({
  textQuery,
  setTextQuery,
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
      <h2 className="text-base font-semibold sm:text-lg">Search by Text</h2>
      <p className={`mb-4 mt-1 text-xs sm:text-sm ${subtleText2}`}>
        Contoh query:{' '}
        <span className="font-medium">"green shirt", "red dress", "blue jeans for men"</span>.
      </p>

      <form onSubmit={onSearch} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium sm:text-sm">Text query</label>
          <input
            type="text"
            placeholder="Tulis deskripsi produk atau gaya yang kamu cari..."
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
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
            Sistem akan mengembalikan {topK} produk paling mirip.
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-500/40 transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Searching...' : 'Search Text'}
        </button>
      </form>
    </section>
  );
}
