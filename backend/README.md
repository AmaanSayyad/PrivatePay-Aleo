# PrivatePay Backend

Minimal backend for PrivatePay (Aleo). Provides a health check only.

- Frontend auth/user APIs use `VITE_BACKEND_URL` (Squidl API); that is a separate service.

## Setup

```bash
cd backend
npm install
```

## Run

```bash
npm start
# or
npm run dev
```

Server listens on `PORT` (default 3001) and `HOST` (default 0.0.0.0).

## Endpoints

- `GET /health` – Returns `{ status: 'healthy', timestamp }`.

## See Also

- Root `README.md` and `docs/guides/` for app setup and deployment.
- Root README and docs for app setup.
