# Fashion RAG Search

Sistem pencarian produk fashion berbasis **multimodal** (teks & gambar) yang menggabungkan:

- **CLIP** untuk embedding teks & gambar,
- **FAISS** sebagai vector search,
- **Flan-T5** sebagai model generatif untuk rekomendasi deskriptif,
- **FastAPI** untuk backend,
- **Next.js + Tailwind CSS** untuk frontend.

> 🔍 Cari produk dengan query seperti **"green shirt"** atau upload gambar, lalu sistem akan menampilkan produk paling mirip sekaligus deskripsi rekomendasi yang dihasilkan model RAG.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Installation](#installation)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup (FastAPI)](#2-backend-setup-fastapi)
  - [3. Frontend Setup (Nextjs)](#3-frontend-setup-nextjs)
- [Configuration](#configuration)
  - [Backend Environment](#backend-environment)
  - [Frontend Environment](#frontend-environment)
- [Running the Project](#running-the-project)
- [Backend API Overview](#backend-api-overview)
- [Frontend Overview](#frontend-overview)
- [Development Notes](#development-notes)
- [License](#license)

---

## Features

- 🔎 **Search by Text**  
  Masukkan deskripsi produk (misal: `red dress`, `black cap`, `blue jeans for men`).

- 🖼️ **Search by Image**  
  Upload gambar produk / outfit untuk mencari produk yang paling mirip secara visual.

- 🧠 **RAG Recommendation**  
  Top-*K* hasil retrieval digunakan sebagai context ke model generatif (Flan-T5) untuk membuat rekomendasi deskriptif.

- 🧩 **Modern UI**  
  Frontend menggunakan Next.js + Tailwind dengan:
  - Light / Dark mode toggle,
  - Modal detail produk,
  - Loading skeleton,
  - History pencarian (session only),
  - Debug panel (score, statistik retrieval, JSON item, dll).

- 📚 **Documentation Page**  
  Halaman `/about` yang menjelaskan pipeline & arsitektur sistem.

---

## Tech Stack

**Backend**

- Python (3.10+ disarankan)
- FastAPI
- Uvicorn
- FAISS
- Transformers (CLIP, Flan-T5)
- PyTorch
- Pillow, NumPy, Pandas, dll.

**Frontend**

- Node.js (18+ disarankan)
- Next.js (App Router)
- React
- Tailwind CSS

---

## Project Structure

```text
fashion-rag-search/
├─ fashion-rag-backend/       # Backend (FastAPI)
│  ├─ app.py                  # FastAPI entrypoint (uvicorn app:app)
│  ├─ models/                 # Model & embedding loader (CLIP, Flan-T5, dsb.)
│  ├─ faiss_index/            # Index FAISS & metadata
│  ├─ requirements.txt        # Python dependencies
│  └─ ...                     # util, config, dll.
│
├─ fashion-rag-frontend/      # Frontend (Next.js)
│  ├─ app/
│  │  ├─ page.js              # Halaman utama (search)
│  │  ├─ about/
│  │  │  └─ page.js           # Halaman /about
│  │  └─ globals.css          # Tailwind + global styles
│  ├─ package.json
│  └─ ...                     # config Next/Tailwind
│
└─ README.md                  # Dokumentasi ini

