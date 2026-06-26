# SnapURL

SnapURL is a developer-friendly URL shortener SaaS built with **FastAPI**, **PostgreSQL**, **SQLModel**, and **React**.

The goal is simple: let users create short, trackable links like:

```txt
https://snapurl.ink/aB12xY
```

instead of sharing long URLs.

SnapURL currently has a working backend for authentication, URL creation, redirects, click counting, and basic analytics. The frontend is currently a Vite + React + Tailwind starter and still needs the real dashboard UI.

---

## Project Status

### Done

- FastAPI backend project structure
- PostgreSQL async database setup
- SQLModel database models
- User signup and login
- JWT authentication
- Password hashing with bcrypt
- Protected URL endpoints
- Short URL generation
- Public redirect endpoint
- Click counter
- Basic analytics table
- Alembic migration setup
- React + Vite + Tailwind frontend setup

### Not Done Yet

- Real frontend pages
- Dashboard UI
- Pricing/billing integration
- Resend email integration
- Redis caching for very fast redirects
- Rate limiting
- Production deployment
- Proper test suite
- Custom domains

---

## Tech Stack

### Backend

- Python 3.13+
- FastAPI
- SQLModel
- SQLAlchemy Async
- PostgreSQL
- asyncpg
- Alembic
- PyJWT / python-jose
- passlib + bcrypt
- uv package manager

### Frontend

- React
- Vite
- Tailwind CSS
- Oxlint

---

## Project Structure

```txt
snapurl/
├── backend/
│   ├── app/
│   │   ├── api/routes/        # API route files
│   │   ├── core/              # JWT and password helpers
│   │   ├── models/            # SQLModel database models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── services/          # Business logic
│   │   ├── config.py          # Environment settings
│   │   ├── database.py        # Async DB engine/session
│   │   └── dependencies.py    # Dependency injection
│   ├── migrations/            # Alembic migrations
│   ├── main.py                # FastAPI app entry point
│   ├── pyproject.toml         # Backend dependencies
│   └── alembic.ini            # Alembic config
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Backend Setup

### 1. Go to the backend folder

```bash
cd backend
```

### 2. Install dependencies

This project uses `uv`.

```bash
uv sync
```

If you already have the virtual environment created, you can also install packages with:

```bash
uv pip install -r pyproject.toml
```

### 3. Create a `.env` file

Create this file:

```bash
backend/.env
```

Example:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/snapurl
SECRET_KEY=change-this-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
```

### 4. Make sure PostgreSQL is running

You need a database named:

```txt
snapurl
```

Example local PostgreSQL values:

```txt
user: postgres
password: postgres
host: localhost
port: 5432
database: snapurl
```

### 5. Run migrations

```bash
alembic upgrade head
```

> Note: The backend currently also calls `create_all_tables()` during app startup. This is useful for beginner development, but for production Alembic migrations should be the only source of schema changes.

### 6. Start the backend server

```bash
uvicorn main:app --reload
```

The backend runs at:

```txt
http://127.0.0.1:8000
```

API docs are available at:

```txt
http://127.0.0.1:8000/scalar
```

---

## Frontend Setup

### 1. Go to the frontend folder

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the frontend dev server

```bash
npm run dev
```

The frontend usually runs at:

```txt
http://localhost:5173
```

### 4. Build frontend for production

```bash
npm run build
```

---

## API Endpoints

### Health Check

#### `GET /`

Returns a simple healthy response.

```txt
healthy
```

---

## Authentication

### `POST /auth/signup`

Creates a new user.

Request body:

```json
{
  "name": "Suleman",
  "email": "suleman@example.com",
  "password": "strongpassword123"
}
```

Response example:

```json
{
  "id": "user-uuid",
  "name": "Suleman",
  "email": "suleman@example.com"
}
```

---

### `POST /auth/login`

Logs in a user and returns a JWT access token.

This endpoint expects form data, not JSON.

Form fields:

```txt
username=suleman@example.com
password=strongpassword123
```

Response example:

```json
{
  "access_token": "jwt-token-here",
  "token_type": "bearer"
}
```

Use the token in protected endpoints like this:

```txt
Authorization: Bearer jwt-token-here
```

---

## URL Endpoints

All `/api/url/*` endpoints require authentication.

### `POST /api/url/create`

Creates a short URL.

Request body:

```json
{
  "original_url": "https://example.com/my-long-link"
}
```

Response example:

```json
{
  "id": "url-uuid",
  "original_url": "https://example.com/my-long-link",
  "short_code": "aB12xY",
  "clicks": 0,
  "created_at": "2026-06-25T12:00:00"
}
```

---

### `GET /api/url/urls`

Returns all URLs created by the logged-in user.

---

### `GET /api/url/{short_code}`

Returns one URL by short code, but only if it belongs to the logged-in user.

---

### `PUT /api/url/{short_code}`

Updates the original URL for a short link.

Request body:

```json
{
  "original_url": "https://new-example.com"
}
```

---

### `DELETE /api/url/{short_code}`

Deletes a URL owned by the logged-in user.

---

### `GET /api/url/{short_code}/analytics`

Returns analytics records for a short URL.

---

## Public Redirect Endpoint

### `GET /{short_code}`

Redirects visitors to the original URL.

Example:

```txt
http://127.0.0.1:8000/aB12xY
```

This will:

1. Find the URL by `short_code`
2. Increase the click count
3. Save a basic analytics record
4. Redirect to the original URL

---

## Database Models

### User

Stores registered users.

Important fields:

- `id`
- `name`
- `email`
- `hashed_password`
- `created_at`

### URL

Stores shortened links.

Important fields:

- `id`
- `original_url`
- `short_code`
- `clicks`
- `user_id`
- `created_at`
- `updated_at`

### Analytics

Stores click tracking data.

Important fields:

- `id`
- `url_id`
- `user_id`
- `ip_address`
- `user_agent`
- `clicked_at`

---

## Current Backend Audit

I checked the current backend and frontend state.

### Checks Passed

- Backend Python files compile successfully
- Frontend production build works successfully
- Alembic is configured
- App has authentication, URL, redirect, and analytics routes

### Important Beginner Notes

The backend is good for learning and MVP development, but it is **not fully production ready yet**.

Before production, fix these:

1. **Remove `create_all_tables()` from app startup**
   - Use Alembic migrations only.

2. **Add CORS middleware**
   - Needed so the React frontend can safely call the backend.

3. **Add stronger validation**
   - Validate URL format properly.
   - Block dangerous URLs like `javascript:` and internal/private IP URLs.

4. **Improve error handling**
   - Avoid `try/except Exception: raise e` in route files.
   - Let FastAPI handle `HTTPException` naturally.

5. **Add rate limiting**
   - Protect signup, login, and redirect endpoints from abuse.

6. **Add Redis caching**
   - Needed for very fast redirects at scale.

7. **Add production tests**
   - Auth tests
   - URL tests
   - Redirect tests
   - Analytics tests

8. **Do not expose secrets**
   - Keep `.env` out of Git.
   - Use strong production secrets.

---

## Useful Development Commands

### Backend

Run backend:

```bash
cd backend
uvicorn main:app --reload
```

Run migrations:

```bash
cd backend
alembic upgrade head
```

Create a migration:

```bash
cd backend
alembic revision --autogenerate -m "describe change here"
```

Syntax check:

```bash
cd backend
python -m compileall app main.py
```

---

### Frontend

Run frontend:

```bash
cd frontend
npm run dev
```

Build frontend:

```bash
cd frontend
npm run build
```

Lint frontend:

```bash
cd frontend
npm run lint
```

---

## Roadmap

### Phase 1 — Backend MVP

- [x] User signup
- [x] User login
- [x] JWT authentication
- [x] Create short URL
- [x] Redirect short URL
- [x] Basic click analytics
- [ ] Better URL validation
- [ ] Proper integration tests
- [ ] Redis caching

### Phase 2 — Frontend MVP

- [ ] Landing page
- [ ] Signup page
- [ ] Login page
- [ ] Dashboard
- [ ] Create URL form
- [ ] URL list page
- [ ] Analytics page

### Phase 3 — SaaS Features

- [ ] Pricing plans
- [ ] Polar.sh billing
- [ ] Resend transactional emails
- [ ] Free/Pro usage limits
- [ ] API keys
- [ ] Custom aliases
- [ ] Custom domains

### Phase 4 — Production

- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Set production database
- [ ] Add monitoring
- [ ] Add rate limiting
- [ ] Add backups
- [ ] Add security hardening

---

## Product Vision

SnapURL aims to become a simple, fast, and affordable URL shortener for developers, freelancers, and small teams.

Main product goals:

- Fast redirect speed
- Clean developer-friendly dashboard
- Useful analytics without bloated features
- Cheap pricing compared to expensive competitors
- Simple API for developers

---

## Beginner Explanation

Think of SnapURL like a phonebook for links.

When a user creates a short URL:

```txt
https://very-long-url.com/some/path/here
```

SnapURL stores it in the database and gives back:

```txt
snapurl.ink/aB12xY
```

When someone visits `snapurl.ink/aB12xY`, the backend:

1. Looks up `aB12xY` in the database
2. Finds the original long URL
3. Counts the click
4. Saves basic analytics
5. Redirects the visitor

That is the core of the app.

---

## Author

Built by **Suleman Gulzar** as a learning-focused SaaS project.

Goal: learn full-stack development deeply while building a real product.
