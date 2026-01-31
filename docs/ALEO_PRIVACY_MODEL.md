# Aleo Privacy Model in PrivatePay

This document summarizes **how privacy is achieved** in PrivatePay’s Aleo integration: encrypted state, zero-knowledge proofs, and selective disclosure. No balances, order sizes, or identity data are revealed on-chain in plaintext.

---

## 1. Encrypted state (records)

All sensitive data lives in **Aleo records**, not in plaintext public state:

- **Records** are encrypted and tied to an owner. Only the owner (or someone with the right view key) can decrypt.
- **Mappings** can store minimal public data (e.g. hashes or commitments) for price discovery or solvency proofs, not raw amounts or identities.

**In our programs:**

- `zk_credit.aleo`: `CreditScore`, `Loan`, `CreditProof`, `PaymentHistory` — scores, loan terms, and payment history are in records.
- `private_lending.aleo`: `LendingPosition`, `BorrowPosition`, `Collateral` — deposits, borrows, and collateral are in records.
- `shielded_amm.aleo`: `LPPosition`, `SwapRecord`, `VaultPosition` — LP shares, swap amounts, and vault balances are in records.
- `dark_pool.aleo`: `Order`, `Match` — order size, price, and match details are in records.
- `cross_chain_vault.aleo`: `VaultPosition`, `BridgedAsset`, `YieldRecord` — vault and bridge state are in records.
- `treasury_management.aleo`: `MultiSigWallet`, `FundAllocation`, `PayrollEntry`, `DAOTreasury` — policies and allocations are in records (with optional view keys).
- `compliance_module.aleo`: `KYCVerification`, `JurisdictionCheck`, `SelectiveDisclosure` — identity and jurisdiction data are hashed or encrypted in records.

So: **compute is private, verification is public.** On-chain, observers see only that a valid transition ran, not the underlying amounts or identities.

---

## 2. Zero-knowledge proofs

ZK is used to **prove properties without revealing data**:

- **Credit:** In `zk_credit.aleo`, `verify_creditworthiness` proves that a score meets a minimum (e.g. ≥ 650) without revealing the actual score. The output is a `CreditProof` (e.g. `min_score_met: bool`) plus a proof hash.
- **Lending:** In `private_lending.aleo`, borrowing can require a `credit_proof` (field) that attests to creditworthiness without exposing the underlying score or history.
- **Compliance:** In `compliance_module.aleo`, KYC and jurisdiction checks use ZK-style verification (e.g. `verification_proof`, `identity_hash`, `jurisdiction_hash`) so that “eligible” or “compliant” can be checked without exposing raw documents or location.

So: **privacy by default**, with **proofs for eligibility and compliance** where needed.

---

## 3. Selective disclosure (view keys)

Where regulation or auditing requires limited visibility:

- **Treasury:** In `treasury_management.aleo`, `FundAllocation` and `DAOTreasury` can carry a `view_key` so that authorized parties (e.g. token holders, auditors) can decrypt only what’s in scope.
- **Compliance:** In `compliance_module.aleo`, `SelectiveDisclosure` and `AuditorAuthorization` define who can see what: auditors get scoped disclosure (e.g. via hashes and encryption keys in the record), not full raw data.

So: **private by default, compliant when required** — “Private, but Compliant” in Aleo’s terms.

---

## 4. What is *not* on-chain in plaintext

- **Balances** — only in encrypted records; no public “address → amount” map.
- **Order sizes and prices** (dark pool) — only in `Order` / `Match` records.
- **Credit scores and payment history** — only in records and in proofs (e.g. “score ≥ X”).
- **Identity and KYC data** — only hashes/commitments and ZK proofs in records; raw documents stay off-chain or in encrypted form.
- **Strategy and allocation details** (treasury) — in records; optional view-key disclosure for auditors.

---

## 5. Summary table

| Aspect | Mechanism | Example in PrivatePay |
|--------|-----------|------------------------|
| Encrypted state | Aleo records | All 7 programs store sensitive data in records only |
| Prove without revealing | ZK proofs / proof hashes | Credit verification, compliance checks |
| Auditors / regulation | View keys, selective disclosure | Treasury view keys, compliance auditor auth |
| No plaintext on-chain | No public mappings of balances/identities | Only commitments/hashes where needed for proofs |

Together, this gives **offchain execution, encrypted state, and private-but-compliant** behavior as required by the Aleo Privacy Buildathon.
