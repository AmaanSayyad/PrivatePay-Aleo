# Feature Comparison: PrivatePay-Aleo vs Private-Pay-Mantle

This document lists **features and capabilities present in Private-Pay-Mantle that are not (yet) in PrivatePay-Aleo**.

---

## 1. **Points & Rewards System**

| Item | Mantle | Aleo |
|------|--------|------|
| **Points page** | `/points` – full page with points history, level, leaderboard | ❌ No route or page |
| **Points store** | `store/points-store.js` (Zustand) – loadPoints, loadPointsHistory, refreshPoints | ❌ No store |
| **Supabase** | `getUserPoints`, `awardPoints`, `getPointsLeaderboard`, `getPointsConfig`, `getPointsHistory` | ❌ None |
| **DB schema** | `user_points`, `point_transactions`, `points_config` + migrations | ❌ No points tables |
| **Navbar** | "Points" tab with Trophy icon | ❌ No Points tab |
| **Awarding** | Points awarded on payment sent/received, first payment, payment link created | ❌ Not implemented |

**Docs in Mantle:** `POINTS_SYSTEM.md`

---

## 2. **PWA (Progressive Web App)**

| Item | Mantle | Aleo |
|------|--------|------|
| **PWA plugin** | `vite-plugin-pwa` in `vite.config.js` | ❌ Not in config |
| **Manifest** | `manifest.json` + link in `index.html` | ❌ No manifest |
| **Service worker** | `pwa-utils.js` – register `/sw.js`, update handling | ❌ No SW registration |
| **Push notifications** | `notifyPaymentReceived`, `requestNotificationPermission` | ❌ None |
| **Dashboard** | Calls PWA utils on balance increase (payment received) | ❌ No payment-received notification |
| **main.jsx** | `initializePWA()` on startup | ❌ No PWA init |

**Docs in Mantle:** `PWA_SETUP.md`

---

## 3. **Payment Analytics**

| Item | Mantle | Aleo |
|------|--------|------|
| **Component** | `PaymentAnalytics.jsx` – BarChart, AreaChart (recharts), daily/weekly/monthly | ❌ No component |
| **Supabase** | `getPaymentAnalytics(walletAddress)` – aggregates by timeframe | ❌ No analytics API |
| **Dashboard** | Can be embedded (component exists; not in current IndexPage) | ❌ N/A |

---

## 4. **Onramp (Buy crypto)**

| Item | Mantle | Aleo |
|------|--------|------|
| **Dialog** | `OnrampDialog.jsx` – Banxa sandbox iframe (USDC, ETH) | ❌ Dialog file exists but not integrated the same way |
| **Usage** | Used for buying crypto into `targetWallet` | Aleo has `OnrampDialog.jsx` but may not be wired to Banxa/onramp flow |

---

## 5. **Username / Profile**

| Item | Mantle | Aleo |
|------|--------|------|
| **updateUsername** | `updateUsername(walletAddress, newUsername)` – checks alias, updates user + payment link, localStorage | ❌ No `updateUsername` in supabase.js |
| **ReceiveCard** | Can call `updateUsername` (Supabase-backed) | Only `localStorage.setItem` for username |
| **Alias check** | `isAliasAvailable(normalizedUsername)` used in updateUsername | ❌ No alias-availability check in supabase |

---

## 6. **Balance & Data Model**

| Item | Mantle | Aleo |
|------|--------|------|
| **getUserBalance** | By **wallet address**; uses `transactions` table (recipient_address, status) | By **username**; uses `balances` table |
| **Register** | `registerUser(walletAddress)` – no username param; default from wallet | `registerUser(walletAddress, username)` |
| **Payment links** | `createPaymentLink` can include `description` | No `description` on payment_links in schema |

---

## 7. **Transfer / Withdraw & Multi-Chain**

| Item | Mantle | Aleo |
|------|--------|------|
| **MantleWithdraw** | Dedicated component – withdraw from treasury to Mantle chain (treasury wallet, ethers) | ❌ No Mantle chain; Aleo has different withdraw flow |
| **cBridge** | `lib/cBridge/` – pool-based transfer, status tracker, getData | ❌ No cBridge (Aleo has `lib/aleo/bridge.js` for different purpose) |
| **ChainSelectionDialog** | Used in Transfer – multi-chain selection | ❌ Not used (Aleo single chain) |
| **TokenSelectionDialog** | Used in Transfer – token selection | ❌ Not used in same way |

---

## 8. **Stealth / Privacy (Mantle-specific)**

| Item | Mantle | Aleo |
|------|--------|------|
| **stealth-crypto.js** | ECDH, stealth addresses, meta addresses (secp256k1, ethers) | ❌ No stealth-crypto (Aleo uses ZK / different privacy) |
| **Docs** | `STEALTH_ADDRESS_ARCHITECTURE.md`, `PRIVACY_ARCHITECTURE.md` | Aleo has its own privacy docs |

---

## 9. **UI / Shared Components**

| Item | Mantle | Aleo |
|------|--------|------|
| **AsciiFlame** | Used in AuthLayout (login/landing) | ❌ No AsciiFlame |
| **EngowlWatermark** | Component exists; commented out in AuthLayout | ❌ No EngowlWatermark |
| **Experimental.jsx** | Standalone “Experimental” section/component | ❌ No Experimental component |

---

## 10. **Router & Routes**

| Route | Mantle | Aleo |
|-------|--------|------|
| `/points` | ✅ PointsPage | ❌ No route |
| `/send` | ✅ SendPage (Mantle send) | ✅ AleoPage (Send) |
| `/main-details`, `/private-details` | ✅ | ✅ |
| Alias detail | `*.squidl.me` in loader | `*.squidl.me` in loader (same) |

---

## 11. **Docs & Config**

| Item | Mantle | Aleo |
|------|--------|------|
| **DEPLOYMENT_CHECKLIST.md** | ✅ | Different (e.g. DEPLOYMENT_STATUS.json) |
| **MIGRATION_STATUS.md** | ✅ | ❌ |
| **QUICK_START.md** | ✅ | ❌ |
| **Supabase migrations** | Numbered migrations in `supabase/migrations/` (incl. points) | Single `docs/supabase/schema.sql` + fix scripts |

---

## 12. **App & Error Handling**

| Item | Mantle | Aleo |
|------|--------|------|
| **App.jsx** | Class `ErrorBoundary` wrapping app | No class ErrorBoundary (Aleo has ErrorBoundary.jsx / AleoErrorBoundary) |
| **main.jsx** | Global unhandledrejection/error handlers, localStorage cleanup, `initializePWA()` | No PWA init; no same global handlers |

---

## Summary: What Aleo Doesn’t Have (vs Mantle)

1. **Points & rewards** – No points page, store, Supabase API, DB tables, or navbar tab.
2. **PWA** – No manifest, service worker, or push notifications (e.g. payment received).
3. **Payment analytics** – No analytics component or `getPaymentAnalytics`-style API.
4. **updateUsername** – No Supabase-backed username update or alias-availability check.
5. **Onramp** – No Banxa (or equivalent) onramp flow wired the same way.
6. **Multi-chain / cBridge** – No cBridge or Chain/Token selection dialogs in transfer.
7. **MantleWithdraw** – No Mantle-specific withdraw component (Aleo has its own flow).
8. **Stealth address layer** – No Mantle-style stealth-crypto (Aleo uses different privacy).
9. **AuthLayout flair** – No AsciiFlame or EngowlWatermark.
10. **Experimental** – No Experimental dashboard component.
11. **Extra docs** – No MIGRATION_STATUS, QUICK_START, or same deployment checklist.
12. **Global init** – No PWA init or same localStorage/error handling in `main.jsx`.

Aleo **does** have: Aleo-specific Send, Dark Pool, AMM, Credit, Lending, Vaults, Treasury, BalanceChart, payment links, transactions, Supabase (users, payments, balances, payment_links), and its own docs (e.g. ALEO_ARCHITECTURE, SUPABASE_SETUP).
