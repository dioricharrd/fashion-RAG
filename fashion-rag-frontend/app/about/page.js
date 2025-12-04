export default function About() {
  return (
    <main className="min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_top,_#1d2535_0,_#020617_55%)] text-slate-50 px-6 py-10">
        <a
  href="/"
  className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium shadow-sm transition
    border-slate-700 bg-slate-900 text-slate-200 hover:border-indigo-400 hover:bg-slate-800 mb-6"
>
  ← Back to Search
</a>

      <div className="mx-auto max-w-4xl space-y-10">
        
        {/* HEADER */}
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">About This Project</h1>
          <p className="text-slate-400">
            Halaman ini menjelaskan arsitektur, pipeline AI, model yang digunakan, dataset,
            dan cara kerja sistem Fashion RAG Search.
          </p>
        </header>

        {/* SECTION: PROJECT OVERVIEW */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-900/70">
          <h2 className="text-xl font-semibold mb-3">🧠 Project Overview</h2>
          <p className="text-slate-300 leading-relaxed">
            Fashion RAG Search adalah sistem pencarian produk fashion berbasis multimodal 
            (teks & gambar) yang menggabungkan tiga komponen utama:
          </p>
          <ul className="mt-3 space-y-2 text-slate-300 list-disc pl-6">
            <li>CLIP untuk menghasilkan embedding visual & teks yang berada pada ruang semantik yang sama.</li>
            <li>FAISS sebagai mesin pencarian vektor untuk menemukan produk paling mirip.</li>
            <li>Flan-T5 sebagai model generatif untuk membangun rekomendasi deskriptif berdasarkan hasil pencarian.</li>
          </ul>
        </section>

        {/* SECTION: PIPELINE */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-900/70">
          <h2 className="text-xl font-semibold mb-3">🔗 AI Pipeline</h2>
          <ol className="space-y-3 text-slate-300">
            <li><strong>Embedding</strong> — Dataset produk diolah menggunakan CLIP untuk mengekstraksi embedding gambar & teks.</li>
            <li><strong>Indexing</strong> — Embedding dimasukkan ke FAISS index untuk mendukung pencarian berbasis kemiripan vektor.</li>
            <li><strong>Retrieval</strong> — Query pengguna (teks atau gambar) dikonversi ke embedding, dicocokkan ke FAISS, lalu diambil top-K paling mirip.</li>
            <li><strong>RAG</strong> — Top-K hasil retrieval dijadikan context dan dikirim ke Flan-T5 untuk menghasilkan deskripsi rekomendasi personal.</li>
          </ol>

          {/* SIMPLE DIAGRAM */}
          <div className="mt-6 text-center">
            <img
              src="https://raw.githubusercontent.com/microsoft/CLIP/main/docs/CLIP.png"
              alt="pipeline"
              className="mx-auto max-h-64 opacity-70"
            />
            <p className="text-xs text-slate-500 mt-1">
              *Gambar ilustrasi pipeline multimodal (placeholder).
            </p>
          </div>
        </section>

        {/* SECTION: DATASET */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-900/70">
          <h2 className="text-xl font-semibold mb-3">🗂 Dataset</h2>
          <ul className="space-y-2 text-slate-300">
            <li>Dataset: <strong>Fashion Product Text Images Dataset (Kaggle)</strong></li>
            <li>Jumlah gambar: ±44.000</li>
            <li>Label: Display name, description, category</li>
            <li>Resolusi gambar rata-rata: 1080 × 1440 px</li>
            <li>Embedding CLIP digunakan untuk gambar dan teks display name / description</li>
          </ul>
        </section>

        {/* SECTION: TECHNOLOGY */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-900/70">
          <h2 className="text-xl font-semibold mb-3">🛠 Tech Stack</h2>
          <ul className="space-y-2 text-slate-300">
            <li><strong>Frontend:</strong> Next.js + Tailwind CSS</li>
            <li><strong>Backend:</strong> FastAPI (Python)</li>
            <li><strong>Vector Search:</strong> FAISS</li>
            <li><strong>Models:</strong> CLIP (ViT-B/32) & Flan-T5-Base</li>
            <li><strong>Deployment (opsional):</strong> Vercel (FE) & Render/Railway/Docker (BE)</li>
          </ul>
        </section>

        {/* SECTION: CONTACT / CREDITS */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-900/70">
          <h2 className="text-xl font-semibold mb-3">👤 Contacts & Credits</h2>
          <p className="text-slate-300">
            Project ini dibuat sebagai implementasi sistem pencarian multimodal berbasis
            Retrieval-Augmented Generation untuk domain fashion. Untuk kolaborasi / pertanyaan:
          </p>

          <ul className="mt-3 text-slate-300 space-y-1">
            <li>📩 Email: <span className="font-semibold">contoh.email@gmail.com</span></li>
            <li>🔗 GitHub: <span className="font-semibold">github.com/username</span></li>
            <li>💼 LinkedIn: <span className="font-semibold">linkedin.com/in/username</span></li>
          </ul>
        </section>
      </div>
    </main>
  );
}
