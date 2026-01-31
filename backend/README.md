# PrivatePay Backend (Aleo)

Minimal backend for PrivatePay — **Aleo only**. Provides health check and optional **withdraw relayer** for the treasury model.

- **Frontend** uses `VITE_BACKEND_URL` to call this backend (e.g. `http://localhost:3400`).
- **Withdraw:** Implement `POST /withdraw` (see `docs/TREASURY_RELAYER.md`) so users can withdraw their credited balance from the treasury to their Leo wallet.

## Setup

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and set `PORT=3400` (to match frontend `VITE_BACKEND_URL`).

## Run

```bash
npm run dev
# or
npm start
```

Server listens on `PORT` (default **3400**) and `HOST` (default 0.0.0.0).

## Endpoints

- `GET /health` – Returns `{ status: 'healthy', timestamp }`.
- `POST /withdraw` – Stub by default (501). Implement relayer logic (balance check, Aleo transfer from treasury) and set `TREASURY_PRIVATE_KEY` in env. See `docs/TREASURY_RELAYER.md`.

## See Also

- `docs/TREASURY_RELAYER.md` – Withdraw relayer requirements.
- Root `README.md` and `docs/guides/` for app setup and deployment.
