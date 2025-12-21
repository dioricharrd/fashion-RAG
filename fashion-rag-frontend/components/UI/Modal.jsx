import { useEffect } from 'react';
import { getImageUrl } from '@/lib/api';

export function Modal({ item, onClose, isDark, subtleText, subtleText2 }) {
  // Close modal on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 py-6 sm:px-6"
      onClick={onClose}
    >
      <div
        className={`relative max-h-[90vh] w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl ${
          isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-700/60 px-4 py-3 sm:px-5">
          <div>
            <h3 className="text-base font-semibold sm:text-lg">
              {item.display_name || 'Product detail'}
            </h3>
            <p className={`text-xs sm:text-sm ${subtleText2}`}>
              Category: {item.category || '-'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full p-1 text-slate-400 hover:bg-slate-700/40 hover:text-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-4 px-4 py-4 sm:grid-cols-[1.1fr_1.4fr] sm:px-5 sm:py-5">
          <div className="flex items-center justify-center">
            <div
              className={`w-full overflow-hidden rounded-xl border ${
                isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-slate-100'
              }`}
            >
              <img
                src={getImageUrl(item.idx)}
                alt={item.display_name || 'Product image'}
                className="w-full object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Description
              </p>
              <p className={`mt-1 text-sm ${subtleText}`}>
                {item.description || 'Tidak ada deskripsi panjang pada metadata produk ini.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-semibold text-slate-400">Index</p>
                <p className="font-mono text-slate-200">{item.idx}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400">Score</p>
                <p className="font-mono text-slate-200">
                  {item.score != null ? item.score.toFixed(6) : '-'}
                </p>
              </div>
              {item.image_path && (
                <div className="col-span-2">
                  <p className="font-semibold text-slate-400">Image path</p>
                  <p className={`mt-0.5 line-clamp-2 break-all text-[11px] ${subtleText2}`}>
                    {item.image_path}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-auto pt-1 text-[11px] text-slate-500">
              Hint: tekan <span className="font-mono">Esc</span> atau klik area gelap di luar card
              untuk menutup.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
