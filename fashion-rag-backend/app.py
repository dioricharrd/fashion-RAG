# app.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import router as api_router

app = FastAPI(
    title="Fashion RAG Backend",
    description="API untuk text/image search + RAG pada dataset fashion",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: production sebaiknya dibatasi ke domain FE
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan semua routes dari routes.py
app.include_router(api_router)


# Optional: biar bisa dijalankan langsung `python app.py`
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
