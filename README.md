# Draftly

A lightweight, full-stack collaborative document editor built for the Ajaia AI-Native Full Stack Developer assessment.

## Features

- Create, rename, edit, and save documents
- Rich-text formatting using TipTap
- Share documents between demo users
- Access control for owned and shared documents
- Import UTF-8 `.txt` and `.md` files
- Persistent PostgreSQL storage in production
- Responsive React interface

## Technology Stack

**Frontend:** React, Vite, TipTap, Lucide React, CSS

**Backend:** Python, FastAPI, SQLAlchemy

**Database:** PostgreSQL (production), SQLite (local default)

**Deployment:** Render

## Live Application

- Frontend: [Add deployed frontend URL]
- Backend: https://draftly-api-cde9.onrender.com
- API health check: https://draftly-api-cde9.onrender.com/health
- Source code: https://github.com/yooryr/draftly

## Running Locally

### Backend

From the repository root:

```bash
cd backend
python -m venv .venv
```

Activate the environment on Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies and start the API:

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend runs at `http://127.0.0.1:8000`.

### Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

Optionally, set `VITE_API_URL` to override the backend address.

## Demo Accounts

Draftly includes two seeded demonstration users:

- Alice (ID 1)
- Bob (ID 2)

Switch users using the dropdown in the interface.

**Authentication note:** Demo identity is simulated through the `X-User-ID` request header. This is not production-grade authentication.

## Running Tests

From the `backend` directory:

```bash
python -m pytest -q
```

The automated test checks document creation, access restrictions, and sharing.

## Limitations and Future Improvements

- No real authentication or session management
- No simultaneous real-time collaborative editing
- Saving is manual rather than automatic
- Imported Markdown is treated as text rather than rendered Markdown
- Production HTML sanitization and additional security hardening are needed
- Future improvements include version history, comments, autosave, and WebSocket-based collaboration

## Deployment Notes

The frontend is hosted as a Render Static Site, the API as a Render Web Service, and the database as Render PostgreSQL.

The free PostgreSQL instance has a limited lifetime, so the hosted demo may require database renewal or migration.

## License

Created as a technical assessment demonstration.