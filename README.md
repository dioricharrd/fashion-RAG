cd fashion-rag-backend
python -m venv .venv
source .venv/bin/activate        # MacOS/Linux
# .venv\Scripts\activate         # Windows

pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000


cd fashion-rag-frontend
npm install
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local
npm run dev
