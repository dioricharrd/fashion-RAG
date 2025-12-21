export function InfoSidebar({ isDark, subtleText, cardClasses, cardTone }) {
  return (
    <aside className="hidden flex-col gap-4 lg:flex">
      <section className={`${cardClasses} ${cardTone}`}>
        <h2 className="mb-2 text-base font-semibold sm:text-lg">How this demo works</h2>
        <ol className={`space-y-2 text-sm ${subtleText}`}>
          <li>
            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-semibold text-white">
              1
            </span>
            Dataset produk fashion di-embed dengan{' '}
            <span className="font-semibold text-indigo-300">CLIP</span> dan di-index dengan{' '}
            <span className="font-semibold text-indigo-300">FAISS</span>.
          </li>
          <li>
            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-semibold text-white">
              2
            </span>
            Query teks atau gambar dari user diubah menjadi embedding lalu dicocokkan dengan index.
          </li>
          <li>
            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-semibold text-white">
              3
            </span>
            Beberapa produk terdekat dijadikan context dan dikirim ke model{' '}
            <span className="font-semibold text-indigo-300">Flan-T5</span> untuk menghasilkan
            deskripsi rekomendasi.
          </li>
        </ol>
      </section>

      <section className={`${cardClasses} ${cardTone} text-sm`}>
        <h3 className="mb-2 text-sm font-semibold">Tips pencarian yang bagus</h3>
        <ul className={`space-y-1 list-disc pl-5 text-slate-400`}>
          <li>Gunakan warna + tipe pakaian, misalnya "black cap", "green t-shirt".</li>
          <li>Untuk gambar, usahakan produk jelas dan tidak terlalu banyak objek lain.</li>
          <li>Top-K kecil (&lt; 10) untuk rekomendasi fokus, lebih besar untuk eksplorasi.</li>
        </ul>
      </section>
    </aside>
  );
}
