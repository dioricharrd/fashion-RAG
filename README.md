project: "Fashion RAG Search"
description: >
  Sistem pencarian produk fashion berbasis multimodal (teks & gambar) 
  menggunakan CLIP + FAISS + Flan-T5 dengan FastAPI (backend) dan 
  Next.js + Tailwind (frontend).

stack:
  backend:
    language: Python 3.10+
    framework: FastAPI
    models:
      - CLIP (Text + Image Embedding)
      - Flan-T5 (RAG Recommendation Model)
    libraries:
      - uvicorn
      - torch
      - transformers
      - faiss-cpu
      - pillow
      - numpy
      - pandas
      - python-multipart
    infrastructure:
      - FAISS Vector Index
      - Metadata CSV

  frontend:
    language: JavaScript
    framework: Next.js (App Router)
    ui:
      - React
      - Tailwind CSS
    extra_features:
      - Light/Dark Theme Toggle
      - Product Detail Modal
      - Search History (session)
      - Debug Panel
      - CLIP Score Visualization

project_structure:
  backend_folder: "fashion-rag-backend"
  frontend_folder: "fashion-rag-frontend"
  expected_files:
    backend:
      - app.py
      - requirements.txt
      - faiss_index/
    frontend:
      - app/page.js
      - app/about/page.js
      - globals.css

requirements:
  system:
    python: ">= 3.10"
    node: ">= 18"
    ram_min: "8GB+"
    gpu_optional: "CUDA recommended for Flan-T5 fast inference"

installation:
  backend:
    linux_macos:
      - cd fashion-rag-backend
      - python -m venv .venv
      - source .venv/bin/activate
      - pip install --upgrade pip
      - pip install -r requirements.txt
      - python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
    windows:
      - cd fashion-rag-backend
      - python -m venv .venv
      - .venv\Scripts\activate
      - pip install --upgrade pip
      - pip install -r requirements.txt
      - python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
    runs_on: "http://localhost:8000"

  frontend:
    linux_macos_windows:
      - cd fashion-rag-frontend
      - npm install
      - echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local
      - npm run dev
    runs_on: "http://localhost:3000"

configuration:
  backend_env:
    MODEL_NAME_CLIP: "openai/clip-vit-base-patch32"
    MODEL_NAME_RAG: "google/flan-t5-base"
    FAISS_INDEX_PATH: "./faiss_index/index.faiss"
    METADATA_CSV_PATH: "./faiss_index/metadata.csv"
  frontend_env:
    NEXT_PUBLIC_API_BASE_URL: "http://localhost:8000"

running:
  backend: "python -m uvicorn app:app --reload"
  frontend: "npm run dev"
  terminals_required: 2

api_endpoints:
  - path: "/search/text"
    method: POST
    body: { query: "string", top_k: "number" }
    notes: "Search products by text"
  - path: "/search/image"
    method: POST
    body: multipart/form-data (file = image, top_k = number)
    notes: "Search products by uploaded image"
  - path: "/image/{idx}"
    method: GET
    notes: "Retrieve raw product image"
  - docs: "http://localhost:8000/docs"

ui_pages:
  main: "/"
  about: "/about"
  components:
    - ProductGrid
    - ProductModal
    - SearchHistory
    - ThemeToggle
    - DebugPanel

deployment:
  recommended:
    frontend: "Vercel"
    backend: ["Railway", "Render", "Docker", "VPS"]
  notes:
    - "Frontend & backend terpisah untuk fleksibilitas"
    - "CUDA sangat membantu untuk inference Flan-T5 skala besar"

status:
  stable: true

