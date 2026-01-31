# Environment Setup Guide

**Last Updated**: 2025-01-28

---

## Overview

Environment variables for PrivatePay (Aleo). Use a root `.env` file (never commit it).

---

## Quick Start

1. Create `.env` in the project root (see `.gitignore`; copy from the list below if needed).
2. Fill in required variables.
3. Run `npm install --legacy-peer-deps` and `npm run dev` to verify.

---

## Required Variables

### Core Application

```bash
VITE_APP_ENVIRONMENT=dev          # or 'production'
VITE_WEBSITE_HOST=https://your-domain.com
VITE_BACKEND_URL=http://localhost:3400   # or your API URL

# Supabase (required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Dynamic.xyz (auth)
VITE_DYNAMIC_ENV_ID=your_dynamic_environment_id
```

### Aleo

```bash
# Frontend / build (optional; for server-side or deploy scripts)
VITE_ALEO_PRIVATE_KEY=APrivateKey1zkp...

# Aleo CLI / deploy scripts (optional)
NETWORK=testnet
PRIVATE_KEY=APrivateKey1zkp...
ENDPOINT=https://api.explorer.provable.com/v1
```

### Optional

```bash
VITE_PAYMASTER_PK=0x...   # If using paymaster (GetStartedDialog)
VITE_ENABLE_LOCAL_DNS=false
VITE_ENABLE_BACKEND_LOGGING=false
```

---

## How to Obtain Values

### Supabase

1. Create a project at https://supabase.com
2. Settings → API → copy **Project URL** → `VITE_SUPABASE_URL`
3. Copy **anon public** key → `VITE_SUPABASE_ANON_KEY`

See `docs/SUPABASE_SETUP.md` for more detail.

### Dynamic.xyz

1. Sign up at https://dynamic.xyz
2. Create an app and copy the environment ID → `VITE_DYNAMIC_ENV_ID`

### Aleo

- Use Aleo CLI or Leo Wallet for keys; testnet RPC: `https://api.explorer.provable.com/v1`.

---

## Verification

1. Start dev server: `npm run dev`
2. Open app; check browser console for errors
3. Test Leo Wallet (Aleo) connection and flows

---

## Production (Vercel / Netlify)

1. Add all required `VITE_*` (and any backend) variables in the platform dashboard.
2. Set `VITE_APP_ENVIRONMENT=production` and `VITE_WEBSITE_HOST` to your production URL.
3. Redeploy after changing variables.

---

## Security

- **Never commit `.env`** (it is in `.gitignore`).
- Do not put private keys in frontend-only env if they are not needed at build time; use backend/env for signing.
- Use platform secrets for production (Vercel/Netlify environment variables).

---

## See Also

- `docs/guides/DEPLOYMENT.md` – Deployment steps
- `docs/SUPABASE_SETUP.md` – Supabase setup
- Root `.env` – In-repo reference (do not commit real secrets)
