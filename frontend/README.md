# UnBind AI — Legal Contract Analyzer

A full-stack AI-powered legal contract analysis platform. Upload a contract (PDF or text), and the AI breaks it down clause-by-clause with risk ratings, negotiation suggestions, key terms glossary, important dates, and an impact simulator.

## Architecture

```
UnbindAI/
├── backend/          # FastAPI (Python) backend
│   ├── app/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── auth_routes.py
│   │   │   └── analysis_routes.py
│   │   └── services/
│   │       ├── groq_service.py
│   │       ├── pdf_processing.py
│   │       └── analysis_service.py
│   ├── requirements.txt
│   └── .env
│
└── frontend/         # Next.js 15 (React 19) frontend
    ├── src/
    │   ├── app/          # App Router pages
    │   ├── components/   # React components
    │   ├── context/      # Auth context
    │   ├── services/     # API client
    │   ├── types.ts
    │   └── constants.ts
    ├── package.json
    └── next.config.mjs
```

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **MongoDB** (Atlas or local)
- **Groq API Key** — get one at [console.groq.com](https://console.groq.com)

---

## Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Configure Environment

Edit `backend/.env`:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
JWT_SECRET=your_jwt_secret_here
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_URL=http://localhost:3000
```

### Run Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Health check: `GET /api/health`

---

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### Run Frontend

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

> The frontend proxies `/api/*` requests to the backend at `http://localhost:8000` via Next.js rewrites configured in `next.config.mjs`.

---

## API Endpoints

### Auth

| Method | Endpoint           | Description                  |
| ------ | ------------------ | ---------------------------- |
| POST   | `/api/auth/signup` | Register a new user          |
| POST   | `/api/auth/login`  | Login and receive JWT cookie |
| POST   | `/api/auth/logout` | Clear auth cookie            |
| GET    | `/api/auth/me`     | Get current user info        |

### Analysis

| Method | Endpoint                     | Description                       |
| ------ | ---------------------------- | --------------------------------- |
| POST   | `/api/analysis/upload`       | Upload PDF/text file for analysis |
| POST   | `/api/analysis/analyze`      | Analyze raw text                  |
| GET    | `/api/analysis/history`      | Get user's analysis history       |
| GET    | `/api/analysis/history/{id}` | Get specific analysis             |
| POST   | `/api/analysis/simulate`     | Run impact simulation             |

---

## Tech Stack

### Backend

- **FastAPI** — async Python web framework
- **Motor** — async MongoDB driver
- **Groq API** (llama-3.3-70b-versatile) — AI analysis
- **pdfplumber / PyPDF2** — server-side PDF text extraction
- **python-jose** — JWT authentication
- **passlib + bcrypt** — password hashing

### Frontend

- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **jsPDF** — PDF report export
- **pdf-lib** — PDF overlay generation
- **pdfjs-dist** — client-side PDF rendering

---

## Features

- 🔍 **Risk Analysis** — clause-by-clause risk rating with visual risk meter
- 🤝 **Negotiation Helper** — AI-generated suggestions with keep/use-AI/custom options
- 📖 **Key Terms Glossary** — plain-English definitions of legal terms
- 📅 **Key Dates** — deadline extraction with ICS calendar export
- 🎯 **Impact Simulator** — what-if scenario analysis against your contract
- 📄 **Document View** — side-by-side document with clause highlighting
- 📥 **PDF Export** — downloadable analysis reports and modified contracts
- 🔐 **Authentication** — secure JWT-based user accounts
- 💾 **History** — saved analyses accessible from dashboard
