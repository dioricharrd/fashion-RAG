export function ImageSearch({
  imageFile,
  imagePreview,
  fileInputRef,
  onImageChange,
  onSearch,
  topK,
  setTopK,
  loading,
  isDark,
  cardClasses,
  cardTone,
  subtleText,
  subtleText2,
}) {
  return (
    <section className={`${cardClasses} ${cardTone}`}>
      <h2 className="text-base font-semibold sm:text-lg">Search by Image</h2>
      <p className={`mb-4 mt-1 text-xs sm:text-sm ${subtleText2}`}>
        Upload foto produk, katalog, atau outfit. CLIP akan mengubahnya menjadi embedding visual
        lalu mencocokkan dengan katalog.
      </p>

      <form onSubmit={onSearch} className="space-y-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="hidden"
        />

        <div className="flex flex-col gap-1 text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`inline-flex w-fit items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition ${
              isDark
                ? 'border-slate-700 bg-slate-900 text-slate-100 hover:border-indigo-400 hover:bg-slate-800'
                : 'border-slate-300 bg-white text-slate-800 hover:border-indigo-400 hover:bg-slate-50'
            }`}
          >
            Pilih Gambar
          </button>
          <span className={`text-[11px] ${subtleText2}`}>
            {imageFile ? `Selected: ${imageFile.name}` : 'Belum ada file yang dipilih.'}
          </span>
        </div>

        {imagePreview && (
          <div>
            <p className={`mb-1 text-[11px] font-medium uppercase tracking-wide ${subtleText2}`}>
              Preview
            </p>
            <div
              className={`inline-block overflow-hidden rounded-xl border ${
                isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-100'
              }`}
            >
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-64 w-auto object-cover"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-500/40 transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Searching...' : 'Search Image'}
        </button>
      </form>
    </section>
  );
}
