export function Header({ 
  theme, 
  isDark, 
  onToggleTheme, 
  debugMode, 
  onToggleDebug, 
  subtleText 
}) {
  return (
    <nav className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold shadow-md shadow-indigo-500/40">
          FR
        </div>
        <span className={`text-sm font-medium tracking-tight sm:text-base ${subtleText}`}>
          Fashion RAG Demo
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* About button */}
        <a
          href="/about"
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium shadow-sm transition ${
            isDark
              ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-indigo-400 hover:bg-slate-800'
              : 'border-slate-300 bg-white text-slate-800 hover:border-indigo-400 hover:bg-slate-50'
          }`}
        >
          📘 About
        </a>

        {/* Debug Button */}
        <button
          type="button"
          onClick={onToggleDebug}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium shadow-sm transition ${
            debugMode
              ? 'border-amber-400 bg-amber-500/20 text-amber-100'
              : isDark
              ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-amber-400 hover:bg-slate-800'
              : 'border-slate-300 bg-white text-slate-800 hover:border-amber-400 hover:bg-slate-50'
          }`}
        >
          <span className="text-base">🐞</span>
          <span>{debugMode ? 'Debug ON' : 'Debug'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium shadow-sm transition ${
            isDark
              ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-indigo-400 hover:bg-slate-800'
              : 'border-slate-300 bg-white text-slate-800 hover:border-indigo-400 hover:bg-slate-50'
          }`}
        >
          <span className="text-base">{isDark ? '🌙' : '☀️'}</span>
          <span>{isDark ? 'Dark mode' : 'Light mode'}</span>
        </button>
      </div>
    </nav>
  );
}
