export function SearchModeTabs({ searchMode, setSearchMode, isDark, cardClasses, cardTone }) {
  const modes = [
    { id: 'text', icon: '📝', label: 'Text', description: 'Search with keywords' },
    { id: 'image', icon: '🖼️', label: 'Image', description: 'Upload a photo' },
    { id: 'ai', icon: '🤖', label: 'AI', description: 'Smart AI search' }
  ];

  return (
    <section className={`${cardClasses} ${cardTone}`}>
      <h2 className="mb-4 text-base font-semibold sm:text-lg">Search Method</h2>
      
      {/* Tab Buttons */}
      <div className={`flex gap-2 p-1 rounded-xl ${
        isDark ? 'bg-slate-800/50' : 'bg-slate-200/50'
      } backdrop-blur-sm`}>
        {modes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setSearchMode(mode.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              searchMode === mode.id
                ? isDark
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/50"
                  : "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                : isDark
                ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title={mode.description}
          >
            <span className="text-xl">{mode.icon}</span>
            <span className="text-xs sm:text-sm">{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Active mode indicator */}
      <p className={`mt-3 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        {modes.find(m => m.id === searchMode)?.description}
      </p>
    </section>
  );
}
