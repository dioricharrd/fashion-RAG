export function SearchHistory({ 
  history, 
  onApplyItem, 
  onClear, 
  isDark, 
  subtleText2,
  cardClasses,
  cardTone 
}) {
  if (history.length === 0) return null;

  return (
    <section className={`${cardClasses} ${cardTone}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold sm:text-base">Recent Searches</h2>
        <button
          type="button"
          onClick={onClear}
          className={`text-[11px] underline-offset-2 hover:underline ${subtleText2}`}
        >
          Clear
        </button>
      </div>
      <p className={`mb-2 text-[11px] ${subtleText2}`}>
        Klik item untuk mengisi ulang form, lalu tekan tombol Search untuk menjalankan kembali.
      </p>
      <ul className="space-y-2 text-sm">
        {history.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onApplyItem(item)}
              className="flex flex-1 items-center gap-2 overflow-hidden text-left hover:opacity-90"
            >
              <span
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  item.type === 'text'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : item.type === 'image'
                    ? 'bg-sky-500/20 text-sky-300'
                    : 'bg-violet-500/20 text-violet-300'
                }`}
              >
                {item.type === 'text' ? 'T' : item.type === 'image' ? 'I' : 'A'}
              </span>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-xs font-medium sm:text-sm">{item.label}</p>
                <p className={`truncate text-[11px] ${subtleText2}`}>
                  {item.type === 'text'
                    ? 'Text query'
                    : item.type === 'image'
                    ? 'Image search'
                    : 'AI prompt'}{' '}
                  · Top K {item.topK}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
