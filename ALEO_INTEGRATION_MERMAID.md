# Aleo Integration — Mermaid Diagrams

PrivatePay’s Aleo integration: component topology, user flows, Leo programs, and privacy model.  
**Resources:** [Aleo Developer Docs](https://developer.aleo.org/) · [Leo Language](https://docs.leo-lang.org/leo) · [Leo Playground](https://play.leo-lang.org/) · [Aleo.org](https://aleo.org/)

---

## 1. Component topology

```mermaid
flowchart LR
  subgraph Browser[User Browser]
    REACT[React App<br/>Vite + Router]
    ALEO_PAGE[AleoPage.jsx<br/>/aleo]
    CREDIT[AleoCreditPage<br/>/aleo/credit]
    LENDING[AleoLendingPage<br/>/aleo/lending]
    DARKPOOL[AleoDarkPoolPage<br/>/aleo/darkpool]
    AMM[AleoAMMPage<br/>/aleo/amm]
    VAULTS[AleoVaultsPage<br/>/aleo/vaults]
    TREASURY[AleoTreasuryPage<br/>/aleo/treasury]
    ALEO_PROVIDER[AleoProvider.jsx<br/>Leo Wallet Adapter]
    LIB[src/lib/aleo/<br/>credit, lending, darkpool, amm,<br/>treasury, compliance, sdk]
  end

  subgraph Wallet[Wallet]
    LEO[Leo Wallet<br/>Testnet Beta]
  end

  subgraph AleoNetwork[Aleo Network]
    RPC[Aleo RPC / Provable API]
    ZK[zk_credit.aleo]
    LEND[private_lending.aleo]
    DP[dark_pool.aleo]
    SAMM[shielded_amm.aleo]
    VAULT[cross_chain_vault.aleo]
    TM[treasury_management.aleo]
    COMP[compliance_module.aleo]
  end

  REACT --> ALEO_PROVIDER
  ALEO_PROVIDER --> ALEO_PAGE
  ALEO_PROVIDER --> CREDIT
  ALEO_PROVIDER --> LENDING
  ALEO_PROVIDER --> DARKPOOL
  ALEO_PROVIDER --> AMM
  ALEO_PROVIDER --> VAULTS
  ALEO_PROVIDER --> TREASURY

  ALEO_PAGE --> LIB
  CREDIT --> LIB
  LENDING --> LIB
  DARKPOOL --> LIB
  AMM --> LIB
  VAULTS --> LIB
  TREASURY --> LIB

  CREDIT -->|requestTransaction| LEO
  LENDING -->|requestTransaction| LEO
  DARKPOOL -->|requestTransaction| LEO
  AMM -->|requestTransaction| LEO
  VAULTS -->|requestTransaction| LEO
  TREASURY -->|requestTransaction| LEO
  ALEO_PAGE -->|requestTransaction| LEO

  LEO -->|sign & submit| RPC
  RPC --> ZK
  RPC --> LEND
  RPC --> DP
  RPC --> SAMM
  RPC --> VAULT
  RPC --> TM
  RPC --> COMP
```

---

## 2. User flow: connect wallet and private transfer

```mermaid
sequenceDiagram
  participant User
  participant UI as AleoPage / Aleo Hub
  participant Ctx as useWallet (Aleo Adapter)
  participant Wallet as Leo Wallet
  participant RPC as Aleo RPC / Provable
  participant Explorer as Aleo Explorer

  User->>UI: Open /aleo
  UI->>Ctx: useWallet()

  User->>UI: Click "Connect Wallet"
  UI->>Ctx: connect()
  Ctx->>Wallet: connect(Testnet Beta)
  Wallet-->>Ctx: publicKey, address
  Ctx-->>UI: connected, publicKey, requestTransaction

  User->>UI: Enter recipient + amount, Submit transfer
  UI->>Ctx: requestTransaction(transfer payload)
  Ctx->>Wallet: sign & submit
  Wallet->>RPC: broadcast transaction
  RPC-->>Wallet: transaction id
  Wallet-->>Ctx: tx id / status
  Ctx-->>UI: result, explorerLink

  UI->>Explorer: User opens "View on Explorer"
  Explorer-->>User: Transaction / address view
```

---

## 3. ZK Credit flow: verify creditworthiness and issue loan

```mermaid
sequenceDiagram
  participant User as Borrower
  participant UI as AleoCreditPage
  participant Credit as ZKCreditSystem (credit.js)
  participant Wrapper as TransactionWrapper
  participant Wallet as Leo Wallet
  participant Leo as zk_credit.aleo

  User->>UI: Initialize credit score (300–850)
  UI->>Credit: initializeCreditScore(score, proof)
  Credit->>Wrapper: executeOperation('credit_initialize', …)
  Wrapper->>Wallet: requestTransaction(zk_credit.aleo, initialize_credit_score, …)
  Wallet->>Leo: transition initialize_credit_score
  Leo-->>Wallet: CreditScore record (encrypted)
  Wallet-->>UI: txHash, explorerLink

  User->>UI: Verify creditworthiness (min score)
  UI->>Credit: verifyCreditworthiness(creditScore, minScore)
  Credit->>Wrapper: executeOperation(…)
  Wrapper->>Wallet: requestTransaction(zk_credit.aleo, verify_creditworthiness, …)
  Wallet->>Leo: transition verify_creditworthiness
  Note over Leo: ZK: prove score ≥ min without revealing score
  Leo-->>Wallet: CreditProof record
  Wallet-->>UI: CreditProof (min_score_met), txHash

  User->>UI: Issue undercollateralized loan
  UI->>Credit: issueLoan(creditProof, principal, rate, term, lender)
  Credit->>Wrapper: executeOperation(…)
  Wrapper->>Wallet: requestTransaction(zk_credit.aleo, issue_loan, …)
  Wallet->>Leo: transition issue_loan
  Leo-->>Wallet: Loan record (encrypted)
  Wallet-->>UI: Loan created, txHash
```

---

## 4. Dark pool flow: place and cancel order

```mermaid
sequenceDiagram
  participant User
  participant UI as AleoDarkPoolPage
  participant DP as DarkPoolService (darkpool.js)
  participant Wrapper as TransactionWrapper
  participant Wallet as Leo Wallet
  participant Leo as dark_pool.aleo

  User->>UI: Place order (tokenIn, tokenOut, amountIn, minAmountOut, expiry, type)
  UI->>DP: placeOrder(…)
  DP->>Wrapper: executeOperation('dark_pool_place_order', …)
  Wrapper->>Wallet: requestTransaction(dark_pool.aleo, place_order, …)
  Wallet->>Leo: transition place_order
  Note over Leo: Order record: encrypted amounts, prices, identity
  Leo-->>Wallet: Order record
  Wallet-->>UI: orderId (txHash), explorerLink

  User->>UI: Cancel order
  UI->>DP: cancelOrder(orderId)
  DP->>Wrapper: executeOperation('dark_pool_cancel_order', …)
  Wrapper->>Wallet: requestTransaction(dark_pool.aleo, cancel_order, order)
  Wallet->>Leo: transition cancel_order(order)
  Leo-->>Wallet: Order (status = cancelled)
  Wallet-->>UI: cancelled, txHash
```

---

## 5. Leo programs and data flow

```mermaid
flowchart TB
  subgraph Frontend[React Frontend]
    PAGES[Credit · Lending · Dark Pool · AMM · Vaults · Treasury]
    LIB[lib/aleo: credit, lending, darkpool, amm, treasury, compliance]
    TX[transactionWrapper · aleoTransactionHelper]
  end

  subgraph WalletLayer[Wallet Layer]
    LEO[Leo Wallet · Testnet Beta]
  end

  subgraph Programs[Leo Programs on Aleo]
    ZK[zk_credit.aleo<br/>CreditScore, Loan, CreditProof]
    LEND[private_lending.aleo<br/>LendingPosition, BorrowPosition]
    DP[dark_pool.aleo<br/>Order, Match]
    SAMM[shielded_amm.aleo<br/>LPPosition, SwapRecord, VaultPosition]
    VAULT[cross_chain_vault.aleo<br/>VaultPosition, BridgedAsset]
    TM[treasury_management.aleo<br/>MultiSigWallet, FundAllocation]
    COMP[compliance_module.aleo<br/>KYCVerification, SelectiveDisclosure]
  end

  PAGES --> LIB
  LIB --> TX
  TX --> LEO
  LEO --> ZK
  LEO --> LEND
  LEO --> DP
  LEO --> SAMM
  LEO --> VAULT
  LEO --> TM
  LEO --> COMP
```

---

## 6. Privacy model: encrypted state and ZK

```mermaid
flowchart LR
  subgraph OnChain[On-chain visibility]
    COMMIT[Commitments / hashes]
    VERIFY[Verification only]
  end

  subgraph Private[Private · encrypted records]
    R1[CreditScore<br/>Loan]
    R2[Order<br/>Match]
    R3[LPPosition<br/>SwapRecord]
    R4[VaultPosition<br/>BridgedAsset]
  end

  subgraph ZKProofs[Zero-knowledge proofs]
    P1[verify_creditworthiness<br/>score ≥ min, no reveal]
    P2[Compliance checks<br/>KYC / jurisdiction]
  end

  subgraph Disclosure[Selective disclosure]
    VK[View keys<br/>treasury / compliance]
    AUDIT[Auditor auth<br/>scoped access]
  end

  R1 --> COMMIT
  R2 --> COMMIT
  R3 --> COMMIT
  R4 --> COMMIT
  P1 --> VERIFY
  P2 --> VERIFY
  R1 -.-> VK
  R4 -.-> VK
  P2 --> AUDIT
```

---

## 7. Build and deploy flow

```mermaid
flowchart LR
  subgraph Dev[Developer]
    LEO_CODE[Leo source<br/>programs/*/src/main.leo]
    LEO_CLI[Leo CLI]
    NPM[npm run leo:build<br/>npm run leo:test]
  end

  subgraph Artifacts[Artifacts]
    BUILD[Build output<br/>.leo/]
    PROVER[Proving keys]
  end

  subgraph Network[Aleo Network]
    FAUCET[Faucet<br/>faucet.aleo.org]
    TESTNET[Aleo Testnet]
    EXPLORER[Explorer / Provable API]
  end

  LEO_CODE --> LEO_CLI
  NPM --> LEO_CLI
  LEO_CLI --> BUILD
  LEO_CLI --> PROVER
  LEO_CLI -->|leo deploy --network testnet| TESTNET
  FAUCET -->|credits| TESTNET
  TESTNET --> EXPLORER
```

---

## 8. Aleo resources (quick links)

| Resource        | URL |
|----------------|-----|
| Aleo Developer Docs | https://developer.aleo.org/ |
| Leo Language   | https://docs.leo-lang.org/leo |
| Leo Playground | https://play.leo-lang.org/ |
| Aleo.org       | https://aleo.org/ |
| Testnet Faucet | https://faucet.aleo.org |

---

*See also: [docs/ALEO_ARCHITECTURE.md](docs/ALEO_ARCHITECTURE.md), [docs/ALEO_PRIVACY_MODEL.md](docs/ALEO_PRIVACY_MODEL.md), [ALEO_BUILDATHON_ALIGNMENT.md](ALEO_BUILDATHON_ALIGNMENT.md).*
