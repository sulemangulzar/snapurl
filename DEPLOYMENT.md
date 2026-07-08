# SnapURL Deployment

## Backend: Render

### Option A: Render Blueprint

1. Push this repo to GitHub.
2. In Render, choose **New → Blueprint**.
3. Select the repo.
4. Render will use `render.yaml` to create:
   - `snapurl-backend` web service
   - `snapurl-db` PostgreSQL database
5. After the backend deploys, open:

```txt
https://snapurl-backend.onrender.com/
```

It should return:

```txt
healthy
```

### Option B: Manual Render Web Service

Use these settings:

```txt
Root Directory: backend
Runtime: Python
Build Command: pip install uv && uv sync --frozen --no-dev && uv run alembic upgrade head
Start Command: uv run uvicorn main:app --host 0.0.0.0 --port $PORT
Health Check Path: /
```

Create a Render PostgreSQL database, then add these environment variables to the backend service:

```env
DATABASE_URL=<Render PostgreSQL Internal/External Database URL>
SECRET_KEY=<generate a long random secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
DEBUG=false
TESTING=false
ALLOWED_ORIGINS=["https://your-vercel-app.vercel.app"]
BASE_URL=https://your-render-backend.onrender.com
```

> The app automatically converts Render `postgres://...` / `postgresql://...` URLs to `postgresql+asyncpg://...`.

---

## Frontend: Vercel

1. In Vercel, import the same GitHub repo.
2. Use these settings:

```txt
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

3. Add these Vercel environment variables:

```env
VITE_API_URL=https://your-render-backend.onrender.com
VITE_BASE_URL=https://your-render-backend.onrender.com
```

4. Deploy.

---

## Important after both deploys

After Vercel gives you the final frontend URL, go back to Render and update:

```env
ALLOWED_ORIGINS=["https://your-vercel-app.vercel.app"]
```

If you also use a custom domain later, include both origins:

```env
ALLOWED_ORIGINS=["https://your-vercel-app.vercel.app","https://yourdomain.com"]
```

Then redeploy the backend.

---

## Quick production checks

Backend:

```txt
https://your-render-backend.onrender.com/
```

Expected response:

```txt
healthy
```

API docs:

```txt
https://your-render-backend.onrender.com/scalar
```

Frontend:

```txt
https://your-vercel-app.vercel.app
```

Test signup/login and short-link creation from the deployed frontend.
