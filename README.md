# 🧵 **Fashion-RAG**
### Retrieval-Augmented Generation for Fashion Recommendation

Proyek ini mengimplementasikan sistem RAG (Retrieval-Augmented Generation) yang mampu melakukan pencarian gambar fashion, pencarian kemiripan gaya, hingga rekomendasi fashion berbasis deskripsi maupun gambar. Sistem ini memanfaatkan kombinasi pemrosesan visual + teks menggunakan model deep learning, serta database vektor untuk pencarian cepat dan akurat.

# 📌 Ringkasan Fitur
1. 🔍 Text → Image Search (ketik deskripsi, dapat produk relevan)
2. 🖼️ Image → Image Search (upload gambar → temukan gambar mirip)
3. 🎯 Similarity / Recommendation (top-K nearest neighbors via FAISS)
4. 🧠 RAG Answering (ambil konteks dari retrieval → berikan jawaban generatif)
5. 🖥️ Streamlit / Next.js demo UI untuk testing & integrasi

# 🧩 Teknologi Utama (Pipeline)

| Komponen                       | Fungsi                           |
| ------------------------------ | -------------------------------- |
| **PyTorch**                    | Menjalankan model deep learning  |
| **Transformers (HuggingFace)** | LLM & text encoder               |
| **CLIP / Vision Encoder**      | Ekstraksi fitur gambar           |
| **Sentence Transformers**      | Encoding teks / query            |
| **FAISS**                      | Vector index + similarity search |
| **FastAPI**                    | Backend API                      |
| **Next.js / Streamlit**        | Frontend untuk demo              |


# 📁 Struktur Project

<details>
<summary><strong>📁 Struktur Project</strong></summary>

```
fashion-RAG/
├── fashion-rag-backend/
│   ├── app.py
│   ├── build_index.py
│   ├── fashion_metadata.pkl
│   ├── fashion_product.index
│   └── requirements.txt
│
├── fashion-rag-frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── fashion_rag_pipeline.ipynb
├── README.md
└── venv/
```

</details>


# ✅ Prasyarat (Prerequisites)
## Backend
1. Python 3.10.x (sangat direkomendasikan; faiss lebih stabil di 3.10)
2. pip / virtualenv

## Frontend
1. Node.js (v16/18 direkomendasikan)
2. npm / pnpm / yarn

## Opsional
1. CUDA (untuk percepatan model)
2. Homebrew untuk instalasi python@3.10 keatas (Khusus pengguna masOS)

---------------------------------------------------------------------------------------

# 🔽 1. Download Proyek
## Clone repository:

git clone https://github.com/dioricharrd/fashion-RAG.git
cd fashion-RAG

# 🛠️ 2. Setup Backend

## Masuk ke folder backend:
cd fashion-rag-backend

## 2.1 Buat Virtual Environment:

python3.10 -m venv venv
source venv/bin/activate  # macOS / Linux

## 2.2 Install Dependencies
pip install faiss-cpu==1.8.0
pip install -r requirements.txt

## 2.3 Build FAISS Index

python build_index.py

## 2.4 Jalankan Backend (FastAPI)
uvicorn app:app --reload
## 2.5 Backend akan running di:
http://127.0.0.1:8000 (localhost)

# 🎨 3. Setup Frontend (Next.js)
## Masuk ke folder:

cd fashion-rag-frontend

## 3.1 Install Dependency:
npm install

## 3.2 Jalankan Frontend:
npm run dev

## 3.3 Next.js akan berjalan di:
http://localhost:3000

# 🔀 4. Cara Kerja Sistem (Pipeline Overview)

Pipeline di dalam notebook fashion_rag_pipeline.ipynb melakukan hal berikut:

1. Load dataset + metadata produk
2. Ekstraksi embedding gambar dengan CLIP
3. Ekstraksi embedding teks dengan Sentence Transformers
4. Gabungkan metadata + vector embedding
5. Bangun FAISS index
6. Save index ke file .index
7. Backend memanggil index ini untuk search

### Ilustrasi sederhana:
Query (text/image)
      ↓
Encoder (CLIP / SBERT)
      ↓
Vectorized Query
      ↓
FAISS Search
      ↓
Top-K Results
      ↓
LLM (opsional RAG)
      ↓
UI Output

# 🚀 5. Cara Menggunakan
## 5.1 Search by Text
### Masukkan deskripsi seperti:
"a blue denim jeans"

→ Sistem menampilkan produk fashion paling relevan:
<img width="1342" height="299" alt="image" src="https://github.com/user-attachments/assets/03a0b5be-fb57-4b10-afbf-fee712ad8b1c" />

## 5.2 Search by Text
### upload gambar:
→ Sistem mengambil embedding → mencari gambar paling mirip.

## 5.3 RAG Mode:
Model mengambil konteks fashion dan menjawab:
"give me outfit suggestion based on this style"

# 📦 6. Environment Variables
## Pada frontend:

NEXT_PUBLIC_API_URL=http://localhost:8000
Simpan sebagai .env.local.

# 7. Testing API (Opsional)
## Coba endpoint:

http://localhost:8000/docs

## Swagger UI akan muncul dan kamu bisa test semua endpoint seperti:

/search_text
/search_image
/recommend

# 🗂️ 8. Dataset




