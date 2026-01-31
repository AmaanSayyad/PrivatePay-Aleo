# Vercel: Frontend vs Backend

## What runs on Vercel

- **Frontend only** (with your current setup).  
  Vercel builds and serves your **Vite app** (e.g. `npm run build` → `dist`). So the React app, routing, and static assets all run on Vercel. **No long‑running Node server** is started.

- **Backend (Express in `backend/`)**  
  Your `backend/index.js` Express app is **not** deployed as a long‑running process on Vercel. Vercel does not run `node backend/index.js` or keep a server listening on a port. So by default **only the frontend runs** on Vercel.

## Options for the “backend” (e.g. withdraw)

### Option 1: Backend on another host (recommended for a real relayer)

- Deploy the **Express backend** somewhere that runs Node 24/7, e.g.:
  - [Railway](https://railway.app)
  - [Render](https://render.com)
  - [Fly.io](https://fly.io)
  - Any VPS or cloud that runs Node
- In **Vercel** (project → Settings → Environment Variables), set:
  - `VITE_BACKEND_URL` = your backend URL (e.g. `https://your-backend.railway.app`)
- The frontend will call `VITE_BACKEND_URL/withdraw` (and any other backend routes) on that host. So: **frontend on Vercel, backend elsewhere**.

### Option 2: Withdraw as a Vercel Serverless Function (same project)

- You can run the **withdraw** logic on Vercel as a **serverless function** so frontend and withdraw live in one deployment.
- There is an **`api/withdraw.js`** in this repo that Vercel will deploy as **`/api/withdraw`** (no separate backend URL needed).
- The frontend is set up to call:
  - **`/api/withdraw`** when `VITE_BACKEND_URL` is not set (e.g. on Vercel),
  - **`VITE_BACKEND_URL/withdraw`** when set (e.g. local backend on port 3400).
- The serverless function is currently a **stub** (returns 501). To do real withdrawals you must add the relayer logic (balance check, Aleo transfer from treasury using `TREASURY_PRIVATE_KEY` in env) and set **`TREASURY_PRIVATE_KEY`** (and any other secrets) in Vercel → Settings → Environment Variables. **Never commit the treasury private key.**

## Summary

| Where        | What runs |
|-------------|-----------|
| **Vercel**  | Frontend (Vite/React) + optional serverless `/api/withdraw`. |
| **Elsewhere** (Railway, Render, etc.) | Optional: full Express backend (`backend/index.js`) if you prefer to keep all backend logic there and set `VITE_BACKEND_URL` to that URL. |

So: **on Vercel, the frontend always runs; the “backend” either runs as a separate app elsewhere (Option 1) or as the `/api/withdraw` serverless function on Vercel (Option 2).**
