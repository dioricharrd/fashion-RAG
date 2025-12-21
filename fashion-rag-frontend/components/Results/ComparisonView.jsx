import { getImageUrl } from '@/lib/api';

export function ComparisonView({ selectedItems, onClear, isDark, subtleText2 }) {
  if (selectedItems.length < 2) return null;

  return (
    <div
      className={`mt-6 rounded-2xl border p-5 shadow-lg backdrop-blur-sm transition-colors ${
        isDark
          ? 'border-slate-800/80 bg-slate-900/70 shadow-slate-950/70'
          : 'border-slate-200 bg-white shadow-slate-200/70'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">Comparison</h3>
        <button onClick={onClear} className="text-xs underline-offset-2 hover:underline">
          Clear selection
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {selectedItems.map((item) => (
          <div key={item.idx} className="space-y-2">
            <div
              className={`overflow-hidden rounded-lg border ${
                isDark ? 'border-slate-700' : 'border-slate-300'
              }`}
            >
              <img
                src={getImageUrl(item.idx)}
                alt={item.display_name}
                className="w-full object-cover aspect-[3/4]"
              />
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{item.display_name}</p>
              <p className={`text-xs ${subtleText2}`}>Category: {item.category}</p>
              <p className={`text-xs ${subtleText2}`}>
                Score: <span className="font-mono">{item.score.toFixed(4)}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
