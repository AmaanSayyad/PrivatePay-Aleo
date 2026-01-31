# Aleo Integration — Architecture Overview

This document describes how PrivatePay integrates with **Aleo** and its **Leo** programs: layout of programs, frontend ↔ program flow, and network configuration.

---

## 1. High-level layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PrivatePay Web App (React)                        │
├─────────────────────────────────────────────────────────────────────────┤
│  AleoProvider (Leo Wallet, Testnet Beta)                               │
│  Routes: /aleo, /aleo/credit, /aleo/lending, /aleo/darkpool,            │
│          /aleo/amm, /aleo/vaults, /aleo/treasury                        │
├─────────────────────────────────────────────────────────────────────────┤
│  src/lib/aleo/                                                          │
│  ├── sdk.js, constants.js, utils.js                                    │
│  ├── transactionWrapper.js, aleoTransactionHelper.js                    │
│  ├── credit.js, lending.js, darkpool.js, amm.js                         │
│  ├── treasury.js, compliance.js                                        │
│  └── errorHandling.js                                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Leo Wallet / Aleo RPC (Testnet)                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Aleo Network — Leo programs (aleo/programs/)                           │
│  zk_credit.aleo │ private_lending.aleo │ shielded_amm.aleo             │
│  dark_pool.aleo │ cross_chain_vault.aleo │ treasury_management.aleo     │
│  compliance_module.aleo                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Leo programs and UI mapping

| Program | Path | UI page | Main transitions (examples) |
|---------|------|---------|-----------------------------|
| `zk_credit.aleo` | `aleo/programs/zk_credit/` | `/aleo/credit` | `initialize_credit_score`, `verify_creditworthiness`, `issue_loan`, `update_credit_score`, `record_payment` |
| `private_lending.aleo` | `aleo/programs/private_lending/` | `/aleo/lending` | `deposit`, `borrow`, `repay`, collateral and interest logic |
| `shielded_amm.aleo` | `aleo/programs/shielded_amm/` | `/aleo/amm` | `swap`, `add_liquidity`, `remove_liquidity`, `deposit_to_vault`, `compound_yield` |
| `dark_pool.aleo` | `aleo/programs/dark_pool/` | `/aleo/darkpool` | `place_order`, `cancel_order`, `record_match` |
| `cross_chain_vault.aleo` | `aleo/programs/cross_chain_vault/` | `/aleo/vaults` | `deposit_bridged`, `request_withdrawal`, `claim_yield`, reserve proofs |
| `treasury_management.aleo` | `aleo/programs/treasury_management/` | `/aleo/treasury` | Multi-sig, allocations, payroll, DAO treasury |
| `compliance_module.aleo` | `aleo/programs/compliance_module/` | (shared / future) | KYC, jurisdiction, selective disclosure, auditor auth |

Program IDs and endpoints are in `src/lib/aleo/constants.js` (`ALEO_PROGRAMS`, `PROGRAM_IDS`, `ALEO_ENDPOINTS`). After deployment, replace placeholder IDs with deployed program addresses.

---

## 3. Frontend → Leo flow

1. **Wallet:** User connects **Leo Wallet** (Testnet Beta). `AleoProvider` wraps the app; `useWallet()` from `@demox-labs/aleo-wallet-adapter-react` gives `publicKey`, `requestTransaction`, `transactionStatus`.
2. **Operations:** Pages call lib helpers (e.g. `ZKCreditSystem`, `DarkPoolService`) which use `TransactionWrapper` / `aleoTransactionHelper` to build and submit transactions.
3. **Execution:** Transactions are sent via the wallet to the Aleo network; state updates (new/consumed records) are private; only commitments/verification are public.
4. **Explorer:** Links use Provable explorer (e.g. `https://api.explorer.provable.com/v1/testnet`) for transaction and address lookup.

---

## 4. Network configuration

- **Current target:** Aleo **Testnet** (and Testnet Beta for Leo Wallet).
- **Endpoints:** Defined in `src/lib/aleo/constants.js` (`ALEO_ENDPOINTS`, `ALEO_NETWORK_URL`).
- **Faucet:** [https://faucet.aleo.org](https://faucet.aleo.org) for test credits.

For mainnet, add mainnet endpoints in `constants.js` and switch `CURRENT_NETWORK` (and wallet adapter network) when ready.

---

## 5. Build and deploy (developers)

```bash
# From repo root
npm run leo:build   # Build all Leo programs
npm run leo:test   # Run Leo tests

# Deploy (after Leo CLI + faucet)
cd aleo/programs/<program_name> && leo deploy --network testnet
```

Deployed program IDs should be stored in deployment config and, if needed, in `constants.js` so the UI targets the correct programs.

---

## 6. Related docs

- **Privacy model:** [ALEO_PRIVACY_MODEL.md](./ALEO_PRIVACY_MODEL.md)
- **Buildathon alignment:** [ALEO_BUILDATHON_ALIGNMENT.md](../ALEO_BUILDATHON_ALIGNMENT.md)
- **Leo programs overview:** [aleo/README.md](../aleo/README.md)
