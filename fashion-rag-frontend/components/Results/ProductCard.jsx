import { getImageUrl } from '@/lib/api';

export function ProductCard({ 
  item, 
  onClick, 
  isSelected,
  compareMode,
  isDark,
  subtleText2 
}) {
  return (
    <article
      onClick={() => onClick(item)}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border shadow-md transition hover:-translate-y-1 hover:shadow-xl ${
        compareMode && isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/50'
          : isDark
          ? 'border-slate-800 bg-slate-900/80 shadow-slate-950/70 hover:border-indigo-500/70 hover:shadow-indigo-900/50'
          : 'border-slate-200 bg-white shadow-slate-200/70 hover:border-indigo-500/70 hover:shadow-indigo-200/50'
      }`}
    >
      {compareMode && isSelected && (
        <div className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white shadow-lg">
          ✓
        </div>
      )}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-900">
        <img
          src={getImageUrl(item.idx)}
          alt={item.display_name || 'Product image'}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 px-3 py-3">
        <h3 className="line-clamp-2 text-sm font-semibold">
          {item.display_name || 'Untitled'}
        </h3>
        <p className={`text-xs ${subtleText2}`}>{item.category}</p>
        <p className={`mt-1 text-[11px] ${subtleText2}`}>
          Score: <span className="font-mono">{item.score.toFixed(4)}</span>
        </p>
      </div>
    </article>
  );
}
