export function FilterBar({
  categories,
  filterCategory,
  setFilterCategory,
  sortBy,
  setSortBy,
  compareMode,
  toggleCompareMode,
  selectedItemsCount,
  onExport,
  isDark,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Category Filter */}
      {categories.length > 1 && (
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={`rounded-lg border px-3 py-1.5 text-xs outline-none transition ${
            isDark
              ? 'border-slate-700 bg-slate-900 text-slate-200'
              : 'border-slate-300 bg-white text-slate-800'
          }`}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      )}

      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className={`rounded-lg border px-3 py-1.5 text-xs outline-none transition ${
          isDark
            ? 'border-slate-700 bg-slate-900 text-slate-200'
            : 'border-slate-300 bg-white text-slate-800'
        }`}
      >
        <option value="score">Sort by Score</option>
        <option value="name">Sort by Name</option>
      </select>

      {/* Compare Mode Toggle */}
      <button
        type="button"
        onClick={toggleCompareMode}
        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
          compareMode
            ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200'
            : isDark
            ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-indigo-500'
            : 'border-slate-300 bg-white text-slate-800 hover:border-indigo-500'
        }`}
      >
        {compareMode ? `Compare (${selectedItemsCount})` : 'Compare'}
      </button>

      {/* Export Button */}
      <button
        type="button"
        onClick={onExport}
        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
          isDark
            ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-indigo-500'
            : 'border-slate-300 bg-white text-slate-800 hover:border-indigo-500'
        }`}
        title="Export results to JSON"
      >
        📥 Export
      </button>
    </div>
  );
}
