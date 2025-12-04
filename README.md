project:
  name: "Fashion RAG Search"
  description: "Multimodal fashion product search using text, image, and Retrieval-Augmented Generation (RAG)."
  version: "1.0.0"
  license: "MIT"
  author: "geckomesir"
  repository: "https://github.com/dioricharrd/fashion-RAG"

features:
  - "Search by Text"
  - "Search by Image"
  - "RAG Description Generation (Flan-T5)"
  - "Similarity Score Display"
  - "Loading Skeleton"
  - "Product Detail Modal"
  - "Dark / Light Mode Toggle"
  - "Search History"
  - "Debug Panel"
  - "About Page / Documentation UI"

stack:
  backend:
    language: "Python 3.10+"
    framework: "FastAPI"
    models:
      - "CLIP (Text + Image Embedding)"
      - "Flan-T5 (RAG Recommendation)"
    libraries:
      - "uvicorn"
      - "torch"
      - "transformers"
      - "faiss-cpu"
      - "pillow"
      - "numpy"
      - "pandas"
      - "python-multipart"
    infrastructure:
      index: "FAISS Vector Index + Metadata CSV"
  frontend:
    language: "JavaScript"
    framework: "Next.js"
    ui:
      - "React"
      - "Tailwind CSS"
    extra_features:
      - "Environment-based API URL"
      - "Responsive Layout"
      - "Client-side RAG visualization"

project_structure:
  backend_folder: "fashion-rag-backend"
  frontend_folder: "fashion-rag-frontend"
  expected_files:
    backend:
      - "app.py"
      - "requirements.txt"
      - "faiss_index/"
    frontend:
      - "app/page.js"
      - "app/about/page.js"
      - "globals.css"

requirements:
  system:
    python: ">= 3.10"
    node: ">= 18"
    ram: ">= 8GB"
  recommended:
    python: "3.11"
    ram: "16GB"
    gpu: "CUDA optional for faster inference"

installation:
  backend:
    commands:
      - "cd fashion-rag-backend"
      - "python -m venv .venv"
      - "Windows: .\\.venv\\Scripts\\activate"
      - "macOS: source .venv/bin/activate"
      - "pip install --upgrade pip"
      - "pip install -r requirements.txt"
      - "python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000"
    runs_on: "http://localhost:8000"
  frontend:
    commands:
      - "cd fashion-rag-frontend"
      - "npm install"
      - "echo NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 > .env.local"
      - "npm run dev"
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

api:
  endpoints:
    - path: "/search/text"
      method: "POST"
      body:
        query: "string"
        top_k: "number"
      description: "Search products by text query"
    - path: "/search/image"
      method: "POST (multipart/form-data)"
      body:
        file: "image/*"
        top_k: "number"
      description: "Search products by uploaded image"
    - path: "/image/{idx}"
      method: "GET"
      description: "Retrieve product image"
  docs_url: "http://localhost:8000/docs"

ui:
  pages:
    "/": "Search page (text + image search)"
    "/about": "Documentation + pipeline explanation"
  components:
    - "ProductGrid"
    - "ProductModal"
    - "SearchHistory"
    - "ThemeToggle"
    - "DebugPanel"

deployment:
  suggestions:
    frontend: "Vercel"
    backend: ["Railway", "Render", "Docker", "VPS"]
  notes:
    - "Frontend & backend terpisah untuk fleksibilitas"
    - "Gunakan CUDA jika deployment untuk inference skala besar"

status:
  stable: true

metadata:
  last_updated: "2025-12-04"

