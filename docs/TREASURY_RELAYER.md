# Treasury Relayer: Withdrawal from Treasury (Aleo)

With the treasury model, all payments go on-chain to a single **Aleo** treasury address. Receivers see a **credited balance** in the app and can **withdraw** that amount from the treasury to their Leo wallet. The relayer (backend) performs the on-chain transfer from the treasury to the user.

## What the relayer must do

1. **Hold the treasury private key**  
   The relayer must control the address defined as `TREASURY_ADDRESS` in the app (see `src/lib/aleo/aleoTransactionHelper.js`). Only this key can send ALEO out of the treasury.

2. **Expose POST /withdraw**  
   The frontend calls:
   ```http
   POST /withdraw
   Content-Type: application/json

   {
     "username": "recipient_username",
     "amount": 0.1,
     "destinationAddress": "aleo1..."
   }
   ```
   - **username**: Recipient’s username in Supabase (used to look up and deduct their balance).
   - **amount**: ALEO to send from treasury to the user.
   - **destinationAddress**: User’s Leo wallet address (where to send the ALEO).

3. **Validate balance**  
   Before sending, the relayer must check (e.g. via Supabase) that the user’s `available_balance` for that `username` is at least `amount`. If not, return an error (e.g. 400 "Insufficient balance").

4. **Execute the transfer**  
   Using the Aleo SDK (or equivalent) and the treasury private key:
   - Build a **transfer_public** (or equivalent) from the treasury address to `destinationAddress` for the given `amount`.
   - Broadcast the transaction and wait for confirmation (or at least a transaction id).

5. **Return the transaction id**  
   On success, respond with:
   ```json
   { "txHash": "at1..." }
   ```
   The frontend will then call `withdrawFunds(username, amount, destinationAddress, txHash)` to update Supabase (deduct balance, record withdrawal).  
   On failure, return an appropriate HTTP status and body (e.g. 400/500 and `{ "error": "...", "message": "..." }`).

## Frontend behavior

- **Send & Withdraw** page: **Withdraw** tab shows the user’s credited balance, amount, and destination (default: their connected Leo wallet). On submit, the frontend calls **POST /withdraw** with `username`, `amount`, `destinationAddress`.
- If the response contains **txHash**, the frontend calls `withdrawFunds(username, amount, destinationAddress, txHash)` (Supabase: deduct balance, insert withdrawal record), then refreshes balance and history.
- If the relayer is not configured or returns 501, the frontend shows a message that the relayer must be set up (see `docs/TREASURY_RELAYER.md`).

## Backend stub in this repo

The `backend` folder has a minimal **POST /withdraw** that always returns **501** with a “relayer not configured” message. Replace or extend this with your relayer logic (balance check, Aleo transfer from treasury, return txHash). Configure the frontend with `VITE_BACKEND_URL` (e.g. `http://localhost:3400`) so it points to your relayer.

## Security notes

- The treasury private key must be kept secret and used only on the server (relayer/backend).
- Validate `username` and balance server-side; do not trust the client for balance checks.
- Optionally rate-limit or cap withdrawals per user to reduce abuse risk.
