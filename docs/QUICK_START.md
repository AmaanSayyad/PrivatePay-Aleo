# PrivatePay (Aleo) – Quick Start

## 1. Install and run

```bash
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## 2. Connect Leo Wallet

- Install [Leo Wallet](https://leo.app/) (Aleo).
- In the app, connect your Leo Wallet and approve the connection.

## 3. Supabase (optional but recommended)

- Create a project at [supabase.com](https://supabase.com).
- In **SQL Editor**, run:
  - `docs/supabase/schema.sql`
  - `docs/supabase/points-system.sql` (for Points & Rewards)
- In **Settings → API**: copy Project URL and anon key.
- Create `.env` in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

- Restart the dev server.

See [docs/SUPABASE_SETUP.md](SUPABASE_SETUP.md) for details.

## 4. What you can do

- **Dashboard**: View balance, QR, payment links, Send & Withdraw.
- **Send**: Send ALEO via Leo Wallet (payment flow to treasury or any Aleo address).
- **Payment Links**: Create links like `you.privatepay.me`; share or open as `https://your-domain/payment/you`.
- **Transactions**: History of sent/received payments (from Supabase).
- **Points**: Earn points for payments and links; view leaderboard (requires points schema).
- **Aleo hub** (`/aleo`): Private transfer, network status, and links to DeFi (Credit, Lending, Dark Pool, AMM, Vaults, Treasury).
- **PWA**: Add to home screen; optional push notifications for payments received.

## 5. Getting ALEO

- Use an exchange that supports Aleo, or the [Aleo Testnet Faucet](https://faucet.aleo.org) for test credits.
- Connect Leo Wallet and use the app for payments and DeFi on Aleo Testnet.
