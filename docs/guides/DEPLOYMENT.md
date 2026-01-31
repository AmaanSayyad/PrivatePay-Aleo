# Deployment Guide - PrivatePay

**Last Updated**: 2025-01-28

---

## Overview

This guide covers deployment of PrivatePay (Aleo) to production. The app is a Vite-based React frontend with optional backend APIs.

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Environment variables configured (see `ENVIRONMENT_SETUP.md`)
- Leo Wallet (Aleo) for testing

---

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure required variables are set:

**Core**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_ENVIRONMENT` (production or dev)
- `VITE_WEBSITE_HOST`
- `VITE_DYNAMIC_ENV_ID` (auth)

**Aleo**:
- `VITE_ALEO_PRIVATE_KEY` (optional; used for server-side / deploy scripts; keep secret)

See `docs/guides/ENVIRONMENT_SETUP.md` for full list.

### 2. Build Test

```bash
npm install --legacy-peer-deps
npm run build
npm run preview
```

### 3. Lint

```bash
npm run lint
```

---

## Deployment Platforms

### Vercel (Recommended)

`vercel.json` is already configured.

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Environment Variables**: Add all `VITE_*` (and any backend vars) in Vercel → Settings → Environment Variables.

4. **Build**: Build command `npm run build`, output `dist`, install `npm install` (or `npm install --legacy-peer-deps` if needed).

---

### Netlify

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

1. Install: `npm i -g netlify-cli`
2. Deploy: `netlify deploy --prod`
3. Add env vars in Netlify dashboard.

---

### Self-Hosted (Static)

1. **Build**:
   ```bash
   npm run build
   ```

2. **Serve** `dist/` with Nginx, Apache, or any static host. For SPA routing, ensure all routes fallback to `index.html` (e.g. `try_files $uri $uri/ /index.html`).

---

## Backend (Optional)

Backend is optional (health check only). Deploy `backend` if you need it; see `backend/README.md`.

---

## Post-Deployment

1. **Verify**: Homepage loads, Leo Wallet connects, and Aleo transfer works.
2. **Monitor**: Use your platform’s logs and optional error tracking (e.g. Sentry).
3. **HTTPS**: Use HTTPS and redirect HTTP to HTTPS.

---

## Rollback

- **Vercel**: `vercel rollback [deployment-url]` or promote a previous deployment.
- **Netlify**: Deploys → select previous deploy → Publish.
- **Self-hosted**: Redeploy a previous `dist/` build.

---

## See Also

- `docs/guides/ENVIRONMENT_SETUP.md` – Environment variables
- `docs/ALEO_ARCHITECTURE.md` – Aleo integration
- `README.md` – Project overview and getting started
