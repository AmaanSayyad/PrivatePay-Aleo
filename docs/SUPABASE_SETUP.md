# Supabase Setup for PrivatePay (Aleo)

PrivatePay is **Aleo-only**. Payment links, balances, transaction history, and points use Supabase. Follow these steps to get everything working.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Choose an organization (or create one).
4. Set **Project name** (e.g. `privatepay`), **Database password** (save it somewhere safe), and **Region**.
5. Click **Create new project** and wait until the project is ready.

---

## 2. Get your project URL and anon key

1. In the project dashboard, go to **Project Settings** (gear icon in the sidebar).
2. Open **API** in the left menu.
3. Copy:
   - **Project URL** (e.g. `https://xxxxxxxxxxxx.supabase.co`) — no trailing slash.
   - **anon public** key (under "Project API keys").

**Important:** Use the **anon public** key, not the `service_role` key. The app runs in the browser and must use the anon key.

---

## 3. Create all database tables

1. In the Supabase dashboard, open **SQL Editor**.
2. Click **New query**.
3. Open the schema file in this repo: **`docs/supabase/schema.sql`**.
4. Copy the **entire** contents of `schema.sql` and paste them into the SQL Editor.
5. Click **Run** (or press Cmd/Ctrl + Enter).

You should see “Success. No rows returned.” The script creates:

- **users** – wallet address and username
- **balances** – available balance per user
- **payments** – payment and withdrawal records
- **payment_links** – alias → username/wallet for pay pages

It also enables Row Level Security (RLS) and policies so the app can read/write with the anon key.

**Optional – Points & Rewards:** To enable the Points page and leaderboard, run a second script in the SQL Editor: **`docs/supabase/points-system.sql`**. This creates `user_points`, `point_transactions`, `points_config`, and the `award_points` RPC. If the Points page shows no Leo addresses and no points, you likely haven’t run this script yet — run `points-system.sql` in Supabase SQL Editor.

---

## 4. Configure your app (.env)

In the **root** of the PrivatePay repo, create or edit `.env` and set:

```env
# Supabase (required for payment links, balances, transactions)
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
```

Replace:

- `YOUR_PROJECT_REF` with your actual project reference (from the Project URL).
- `your_anon_public_key_here` with the anon public key you copied.

**Example:**

```env
VITE_SUPABASE_URL=https://dmqbcwxiabnuazsipnwl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Common mistake:** Wrong or typo’d URL (e.g. `dmgbcwxiabnuazsionwl` instead of `dmqbcwxiabnuazsipnwl`). If the URL is wrong, the app will get connection/HTML errors instead of JSON. Double-check the URL in Project Settings → API.

---

## 5. Restart the app

1. Stop the dev server (Ctrl+C).
2. Start it again: `npm run dev`.
3. Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R) so the new env vars are loaded.

---

## 6. Verify

1. **Create a payment link:** Connect Leo Wallet → click **Create Link** → enter an alias (e.g. `mypay`) → create. You should see “Your payment link is ready” and the link (e.g. `mypay.privatepay.me`).
2. **Open the payment page:** In another tab or incognito, go to the payment URL (e.g. `https://localhost:5173/pay/mypay` or your deployed URL with `/pay/mypay`). You should see the pay form, not “Payment link not found”.
3. **Dashboard balance:** After receiving a payment (or if you already had balance), the dashboard should show the balance from Supabase.

If any step fails, check the browser console (F12 → Console) and the Network tab for failed requests to `*.supabase.co`.

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| **“Could not find the 'username' column of 'payment_links'”** (PGRST204 / 400) | Your `payment_links` table was created without the `username` column. Run **`docs/supabase/fix-payment_links-username.sql`** in the SQL Editor. It adds the column and backfills it. Then try Create Link again. |
| **“value too long for type character varying(42)”** (22001 / 400) | A column (often `wallet_address`) is limited to 42 characters; Aleo addresses are ~59 chars. Run **`docs/supabase/fix-varchar-length.sql`** in the SQL Editor to change those columns to `TEXT`. Then try Create Link again. |
| “Payment link not found” when opening a link | Supabase URL and anon key in `.env` are correct; you ran `schema.sql` and the `payment_links` table exists; alias in the URL matches the one you created. |
| “Database is unreachable” / HTML in console | Wrong `VITE_SUPABASE_URL` (typo or wrong project). Fix the URL in `.env`, restart dev server, hard refresh. |
| Create Link fails with other Supabase error | Run **`docs/supabase/schema.sql`** in SQL Editor so `users`, `balances`, `payments`, and `payment_links` (with columns `id`, `wallet_address`, `username`, `alias`, `created_at`) and their RLS policies exist. |
| Balance always 0 | Same as above; also ensure `recordPayment` is called after a successful Aleo transfer (payments and balances tables must exist). |

---

## Schema reference

- **`docs/supabase/schema.sql`** – Single file to run in Supabase SQL Editor. Creates all tables, indexes, RLS, and the `updated_at` trigger for `balances`.

To reset and start over (e.g. for a new environment), you can drop tables in this order and then run `schema.sql` again:

```sql
DROP TABLE IF EXISTS payment_links;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS balances;
DROP TABLE IF EXISTS users;
```

Then run the full `schema.sql` again.
