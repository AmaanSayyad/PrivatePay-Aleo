# Payment & Treasury Model

## How it works

- **All funds go to a single treasury.** When anyone sends via a payment link (or sends to the treasury address), the ALEO goes on-chain to one fixed **treasury address** (`TREASURY_ADDRESS` in `aleoTransactionHelper.js`).
- **Recipients are credited in-app.** For each payment, the app records in Supabase:
  - Who sent, who received (username), amount, tx hash.
  - The recipient’s **credited balance** (in `balances` table) is increased by that amount.
- **Receivers withdraw their share.** Each recipient sees their credited balance in the app (dashboard “Available balance”, or on the Withdraw tab). They can **withdraw** that amount from the treasury to their own Leo wallet. The relayer (backend) holds the treasury private key and, when a user requests a withdrawal, sends ALEO from the treasury to the user’s wallet and returns the tx hash. The frontend then calls `withdrawFunds()` so the balance and history are updated.

So: **n senders → 1 treasury; n receivers each withdraw their credited amount from the treasury.**

## Flow summary

| Step | Who | What |
|------|-----|------|
| 1 | Sender | Pays via payment link → on-chain transfer goes to **treasury**; recipient’s balance is credited in Supabase. |
| 2 | Receiver | Sees “Available balance” (credited amount) in the app. |
| 3 | Receiver | Clicks **Withdraw** → enters amount and destination (their Leo wallet) → relayer sends ALEO from treasury to that wallet → frontend calls `withdrawFunds()` → balance and history updated. |

## Relayer / backend

Withdrawals require a **relayer** (or backend) that:

1. Holds the **treasury private key** (the key for `TREASURY_ADDRESS`).
2. Exposes **POST /withdraw** with body: `{ username, amount, destinationAddress }`.
3. Verifies the user has at least that `amount` in the DB (e.g. via Supabase or an internal check).
4. Builds and broadcasts an Aleo **transfer_public** from the treasury to `destinationAddress` for `amount`.
5. Returns **{ txHash }** on success so the frontend can call `withdrawFunds(username, amount, destinationAddress, txHash)`.

See **TREASURY_RELAYER.md** for implementation details and backend requirements.
