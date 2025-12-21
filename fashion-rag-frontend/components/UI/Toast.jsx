export function Toast({ toast, onClose, isDark }) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm ${
          toast.type === 'success'
            ? isDark
              ? 'border-emerald-500/50 bg-emerald-900/90 text-emerald-50'
              : 'border-emerald-500 bg-emerald-50 text-emerald-900'
            : toast.type === 'error'
            ? isDark
              ? 'border-red-500/50 bg-red-900/90 text-red-50'
              : 'border-red-500 bg-red-50 text-red-900'
            : isDark
            ? 'border-slate-700 bg-slate-900/90 text-slate-50'
            : 'border-slate-300 bg-white text-slate-900'
        }`}
      >
        <span className="text-lg">
          {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
        </span>
        <p className="text-sm font-medium">{toast.message}</p>
        <button
          onClick={onClose}
          className="ml-2 text-xs opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
