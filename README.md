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

---

# 🚀 Instalasi dan Setup

## 🔽 1. Download Proyek

Clone repository dari GitHub:

```bash
git clone https://github.com/dioricharrd/fashion-RAG.git
cd fashion-RAG
```

## 🛠️ 2. Setup Backend

### 2.1 Masuk ke Folder Backend

```bash
cd fashion-rag-backend
```

### 2.2 Buat dan Aktifkan Virtual Environment

**Buat virtual environment:**
```bash
python3.10 -m venv venv
```

**Aktivasi virtual environment:**

- **macOS / Linux:**
  ```bash
  source venv/bin/activate
  ```

- **Windows (Command Prompt):**
  ```cmd
  venv\Scripts\activate
  ```

- **Windows (PowerShell):**
  ```powershell
  venv\Scripts\Activate.ps1
  ```

> **💡 Catatan:** Jika menggunakan PowerShell dan mendapat error "running scripts is disabled", jalankan:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### 2.3 Install Dependencies

```bash
pip install faiss-cpu==1.8.0
pip install -r requirements.txt
```

### 2.4 Build FAISS Index

Jalankan script untuk membangun index FAISS dari dataset:

```bash
python build_index.py
```

> **⏱️ Catatan:** Proses ini memerlukan waktu beberapa menit tergantung ukuran dataset.

### 2.5 Jalankan Backend Server

```bash
uvicorn app:app --reload
```

✅ Backend akan berjalan di: **http://127.0.0.1:8000**

## 🎨 3. Setup Frontend (Next.js)

### 3.1 Masuk ke Folder Frontend

```bash
cd fashion-rag-frontend
```

> **📝 Catatan:** Jika Anda berada di folder backend, kembali ke root terlebih dahulu:
> ```bash
> cd ..
> cd fashion-rag-frontend
> ```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Konfigurasi Environment Variables

Buat file `.env.local` di folder `fashion-rag-frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3.4 Jalankan Development Server

```bash
npm run dev
```

✅ Frontend akan berjalan di: **http://localhost:3000**

---

# 🔀 4. Cara Kerja Sistem (Pipeline Overview)

Pipeline di dalam notebook `fashion_rag_pipeline.ipynb` melakukan langkah-langkah berikut:

1. **Load Dataset** - Memuat dataset produk fashion beserta metadata
2. **Ekstraksi Embedding Gambar** - Menggunakan CLIP untuk mengubah gambar menjadi vektor
3. **Ekstraksi Embedding Teks** - Menggunakan Sentence Transformers untuk encoding deskripsi
4. **Gabungkan Data** - Menggabungkan metadata dengan vector embedding
5. **Build FAISS Index** - Membuat index untuk pencarian cepat
6. **Save Index** - Menyimpan index ke file `.index`
7. **Backend Integration** - Backend memanggil index ini untuk melakukan pencarian

### 📊 Ilustrasi Alur Sistem:

```
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
```

---

# 🚀 5. Cara Menggunakan

## 5.1 Search by Text (Pencarian dengan Deskripsi)

**Cara Penggunaan:**
1. Buka aplikasi di http://localhost:3000
2. Masukkan deskripsi produk yang Anda cari
3. Tekan tombol Search

**Contoh Query:**
```
"a blue denim jeans"
"red summer dress"
"black leather jacket"
```

→ Sistem akan menampilkan produk fashion yang paling relevan dengan deskripsi Anda:

<img width="1342" height="299" alt="image" src="https://github.com/user-attachments/assets/03a0b5be-fb57-4b10-afbf-fee712ad8b1c" />

## 5.2 Search by Image (Pencarian dengan Gambar)

**Cara Penggunaan:**
1. Klik tombol "Upload Image"
2. Pilih gambar produk fashion dari komputer Anda
3. Sistem akan menganalisis gambar dan mencari produk dengan style yang mirip

→ Sistem mengambil embedding dari gambar → mencari gambar dengan kemiripan tertinggi

## 5.3 RAG Mode (Rekomendasi dengan AI)

**Cara Penggunaan:**
1. Upload gambar atau masukkan deskripsi
2. Gunakan fitur chat untuk bertanya kepada AI

**Contoh Pertanyaan:**
```
"Give me outfit suggestions based on this style"
"What accessories would match this dress?"
"Suggest similar items in different colors"
```

→ Model AI akan mengambil konteks dari hasil pencarian dan memberikan rekomendasi yang relevan

---

# 📦 6. Environment Variables

## Frontend Environment Variables

Buat file `.env.local` di folder `fashion-rag-frontend` dengan konfigurasi berikut:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Backend Environment Variables (Opsional)

Jika diperlukan, Anda bisa membuat file `.env` di folder `fashion-rag-backend`:

```env
# Contoh konfigurasi tambahan
MODEL_PATH=./models
INDEX_PATH=./fashion_product.index
```

---

# 🧪 7. Testing API

## Menggunakan Swagger UI

FastAPI menyediakan dokumentasi interaktif untuk testing API:

1. Pastikan backend sudah berjalan
2. Buka browser dan akses:
   ```
   http://localhost:8000/docs
   ```

3. Swagger UI akan muncul dengan daftar endpoint yang tersedia

## Available Endpoints:

| Endpoint | Method | Deskripsi |
|----------|--------|----------|
| `/search_text` | POST | Pencarian produk berdasarkan deskripsi teks |
| `/search_image` | POST | Pencarian produk berdasarkan gambar |
| `/recommend` | POST | Rekomendasi produk berdasarkan preferensi |

## Contoh Request dengan cURL:

**Search by Text:**
```bash
curl -X POST "http://localhost:8000/search_text" \
  -H "Content-Type: application/json" \
  -d '{"query": "blue denim jeans", "top_k": 5}'
```

# 🗂️ 8. Dataset




