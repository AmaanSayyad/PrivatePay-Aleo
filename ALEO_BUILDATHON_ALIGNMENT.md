# Aleo Privacy Buildathon — Project Alignment

**Buildathon:** [Aleo Privacy Buildathon by AKINDO](https://app.akindo.io/wave-hacks/gXdXJvJXxTJKBELvo)  
**Theme:** Build a Privacy-focused Application on Aleo — *Prove everything. Reveal nothing.*

This document maps PrivatePay’s codebase to the buildathon’s **judging criteria** and **submission requirements**, and lists concrete gaps to address before submitting.

---

## 1. Judging Criteria Alignment

| Criterion | Weight | PrivatePay alignment | Evidence |
|-----------|--------|----------------------|----------|
| **Privacy Usage** | 40% | **Strong** — Aleo’s privacy is central: encrypted records, ZK credit, private lending, dark pool, shielded AMM, compliance with selective disclosure. | 7 Leo programs use `record` types (encrypted state), ZK proofs for credit/lending/compliance, view keys for treasury/compliance. |
| **Technical Implementation** | 20% | **Strong** — Leo programs are complete and consistent; frontend uses official Aleo wallet adapter and SDK wrappers. | `aleo/programs/*/main.leo`, `src/lib/aleo/*.js`, `src/providers/AleoProvider.jsx`, `src/hooks/useAleoWallet.js`, `useAleoSync.js`. |
| **User Experience** | 20% | **Good** — Dedicated Aleo hub, wallet connect, and pages for Credit, Lending, Dark Pool, AMM, Vaults, Treasury. | `/aleo` routes, `AleoPage`, `AleoCreditPage`, `AleoLendingPage`, `AleoDarkPoolPage`, `AleoAMMPage`, `AleoVaultsPage`, `AleoTreasuryPage`, Navbar link. |
| **Practicality & Real-World Use** | 10% | **Strong** — Targets private DeFi (credit, lending, dark pools, treasury) and compliance (KYC/AML with selective disclosure). | Buildathon verticals: Private Finance (DeFi), Identity & Credentials; `zk_credit.aleo`, `private_lending.aleo`, `compliance_module.aleo`, `treasury_management.aleo`. |
| **Novelty / Creativity** | 10% | **Good** — Combines ZK credit, undercollateralized lending, dark pool, shielded AMM, cross-chain vault, and compliance in one stack. | 7 programs covering credit, lending, AMM, dark pool, vault, treasury, compliance; integrated in one app. |

---

## 2. Submission Requirements Checklist

### 2.1 Project Overview

| Requirement | Status | Location / Action |
|-------------|--------|-------------------|
| Name, description, problem | ✅ | README.md — PrivatePay, stealth payments, financial privacy. |
| Why privacy matters for this use case | ✅ | README “The Problem” and “The Solution” — traceability, targeted attacks, need for unlinkable payments. |
| PMF and GTM outline | ✅ | README “Market Opportunity”, “Target Users”, “Competitive Landscape”. |
| **Aleo-specific framing** | ⚠️ | **Add** a short “Aleo Buildathon” subsection in README (see recommendations below). |

### 2.2 Working Demo

| Requirement | Status | Notes |
|-------------|--------|--------|
| Deployed on Aleo Testnet or Mainnet | ❌ | Only `testpoolenliven.aleo` was attempted; deployment failed (fee keys). **Action:** Deploy at least one core program (e.g. `zk_credit.aleo` or `dark_pool.aleo`) to testnet using [Aleo Testnet Faucet](https://faucet.aleo.org) and document in README. |
| Functional Leo smart contracts | ✅ | 7 programs: `zk_credit`, `private_lending`, `shielded_amm`, `dark_pool`, `cross_chain_vault`, `treasury_management`, `compliance_module`. All use `record` and transitions; `dark_pool` was fixed from stub to full program. |
| Basic UI demonstrating core features | ✅ | Aleo hub + Credit, Lending, Dark Pool, AMM, Vaults, Treasury pages; Leo Wallet adapter; transfer and program-specific flows. |

### 2.3 Technical Documentation

| Requirement | Status | Location / Action |
|-------------|--------|-------------------|
| GitHub repository with README | ✅ | README.md. |
| Architecture overview | ✅ | `docs/ALEO_ARCHITECTURE.md` — programs, frontend ↔ Leo, network, build/deploy. |
| Privacy model explanation | ✅ | `docs/ALEO_PRIVACY_MODEL.md` — encrypted records, ZK proofs, view keys, no plaintext on-chain. |

### 2.4 Team Information

| Requirement | Status | Action |
|-------------|--------|--------|
| Member names and Discord handles | ✅ | Template in `TEAM.md` — fill in before submitting. |
| Aleo wallet addresses for grant distribution | ✅ | Template in `TEAM.md` — fill in before submitting (do not commit private keys). |

### 2.5 Progress Changelog (Wave 2+)

| Requirement | Status | Action |
|-------------|--------|--------|
| What you built since last submission | ❌ | **Add** `CHANGELOG_ALEO.md` or “Aleo Buildathon” section in README: list of programs, UI pages, and fixes (e.g. dark_pool.aleo). |
| Feedback incorporated | N/A | Fill in when you receive Wave 1 feedback. |
| Next wave goals | ❌ | **Add** in same changelog (e.g. deploy to testnet, add more transitions, improve UX). |

---

## 3. Leo Programs Summary

| Program | File | Purpose | Privacy features |
|---------|------|---------|------------------|
| `zk_credit.aleo` | `aleo/programs/zk_credit/src/main.leo` | ZK credit scoring, undercollateralized loans | Encrypted `CreditScore`, `CreditProof`; verify without revealing score. |
| `private_lending.aleo` | `aleo/programs/private_lending/src/main.leo` | Lending pools, collateral, interest | Encrypted `LendingPosition`, `BorrowPosition`, `Collateral`; credit proof. |
| `shielded_amm.aleo` | `aleo/programs/shielded_amm/src/main.leo` | Private AMM, LP, swaps | Encrypted `LPPosition`, `SwapRecord`, `VaultPosition`; private amounts. |
| `dark_pool.aleo` | `aleo/programs/dark_pool/src/main.leo` | Private order matching | Encrypted `Order`, `Match`; positions/sizes hidden. |
| `cross_chain_vault.aleo` | `aleo/programs/cross_chain_vault/src/main.leo` | Cross-chain yield, bridge proofs | Encrypted `VaultPosition`, `BridgedAsset`, `YieldRecord`. |
| `treasury_management.aleo` | `aleo/programs/treasury_management/src/main.leo` | Multi-sig, allocations, payroll, DAO | Encrypted policies/strategies; view keys for disclosure. |
| `compliance_module.aleo` | `aleo/programs/compliance_module/src/main.leo` | KYC, jurisdiction, auditors, suspicious activity | ZK verification, selective disclosure, encrypted identity/jurisdiction. |

All programs use Aleo’s **record** model (encrypted state) and **transitions** (private execution, public verification).

---

## 4. Frontend Integration

- **Wallet:** `@demox-labs/aleo-wallet-adapter-react`, `@demox-labs/aleo-wallet-adapter-leo`, `AleoProvider.jsx` (Testnet Beta).
- **Routes:** `/aleo`, `/aleo/darkpool`, `/aleo/amm`, `/aleo/credit`, `/aleo/lending`, `/aleo/vaults`, `/aleo/treasury`.
- **Lib:** `src/lib/aleo/` — `sdk.js`, `credit.js`, `lending.js`, `darkpool.js`, `amm.js`, `treasury.js`, `compliance.js`, `constants.js`, `utils.js`, `transactionWrapper.js`, `aleoTransactionHelper.js`.
- **Pages:** `AleoPage`, `AleoCreditPage`, `AleoLendingPage`, `AleoDarkPoolPage`, `AleoAMMPage`, `AleoVaultsPage`, `AleoTreasuryPage`.

---

## 5. Gaps and Recommended Actions

### High priority (for submission)

1. **Deploy at least one program to Aleo Testnet**  
   - Use [Leo CLI](https://developer.aleo.org/leo/installation) and [Testnet Faucet](https://faucet.aleo.org).  
   - Start with `zk_credit.aleo` or `dark_pool.aleo`; fix fee/proving key setup if needed.  
   - Document program ID(s) and network in README and, if applicable, in `aleo/deployment-info.json` / `aleo/README.md`.

2. **Add Aleo to README tagline and one short “Aleo Buildathon” section**  
   - Include Aleo in the first line of README (e.g. “PrivatePay — private payments on **Aleo**”).  
   - Add 2–3 sentences: PrivatePay is submitted to the Aleo Privacy Buildathon; link to buildathon page; one line on what you built on Aleo (Leo programs + UI).

3. **Document team and grant wallet**  
   - Add `TEAM.md` (or README section) with: member names, Discord handles, Aleo wallet address(es) for grants.  
   - Do not commit private keys.

4. **Architecture + privacy model for Aleo**  
   - Done: `docs/ALEO_ARCHITECTURE.md`, `docs/ALEO_PRIVACY_MODEL.md`.

### Medium priority (stronger submission)

5. **Progress changelog for the buildathon**  
   - Done: `CHANGELOG_ALEO.md`. Update each wave with “What we built”, “Feedback incorporated”, “Next wave goals”.

6. **Verify `leo build` and `leo test`**  
   - Run `npm run leo:build` and `npm run leo:test` from repo root; fix any Leo compilation or test failures so judges can build and test.

### Optional

7. **Short video or GIF**  
   - Demo: connect Leo Wallet, open Aleo hub, show one flow (e.g. Credit or Dark Pool) and, if deployed, a transaction on explorer.

8. **Link from README to this file**  
   - In the Aleo Buildathon section: “See [ALEO_BUILDATHON_ALIGNMENT.md](ALEO_BUILDATHON_ALIGNMENT.md) for criteria and checklist.”

---

## 6. Buildathon Verticals Covered

PrivatePay aligns with these buildathon verticals:

- **Private Finance (DeFi)**  
  - Dark pool (`dark_pool.aleo`).  
  - Shielded AMM (`shielded_amm.aleo`).  
  - Private credit & lending (`zk_credit.aleo`, `private_lending.aleo`).  
  - Cross-chain vault (`cross_chain_vault.aleo`).  
  - Treasury (`treasury_management.aleo`).

- **Private Identity & Credentials**  
  - Compliance and selective disclosure (`compliance_module.aleo` — KYC, jurisdiction, auditors).

- **Private, but Compliant**  
  - View keys and selective disclosure in `treasury_management.aleo` and `compliance_module.aleo`.

---

## 7. Quick Reference Links

- [Buildathon page](https://app.akindo.io/wave-hacks/gXdXJvJXxTJKBELvo)  
- [Aleo Developer Docs](https://developer.aleo.org/)  
- [Leo Language Documentation](https://developer.aleo.org/leo/language/)  
- [Leo Playground](https://play.leo.org/)  
- [Aleo Testnet Faucet](https://faucet.aleo.org)

---

*Use this document to confirm alignment with the Aleo Privacy Buildathon and to complete submission requirements before the evaluation phase.*
