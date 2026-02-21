# CMTAT + ICMA | Tokenized Bond Lifecycle Sandbox

> Full client-side bond lifecycle sandbox — deployable as a GitHub Pages SPA, powered by [Tevm](https://tevm.sh) in-memory EVM, the [CMTAT](https://github.com/CMTA/CMTAT) token standard, and [ICMA Bond Data Taxonomy v1.2](https://www.icmagroup.org/market-practice-and-regulatory-policy/secondary-markets/bond-market-transparency/icma-bond-data-taxonomy/).

**🔗 [Live Demo →](https://siva-sub.github.io/cmtat-icma-tokenized-bonds/)**

---

## Overview

This project demonstrates the integration of two industry standards for tokenized fixed-income securities:

| Standard | Role |
|----------|------|
| **CMTAT v3.0** (Swiss Capital Markets & Technology Association) | Modular ERC-20 smart contract framework with compliance modules |
| **ICMA Bond Data Taxonomy v1.2** (International Capital Market Association) | Machine-readable schema of 90+ fields covering the full bond term sheet |

The architecture follows the **MAS Guardian Fixed Income Framework** (Singapore, Nov 2024) — the first industry guide specifically for tokenized debt capital markets.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Browser (GitHub Pages SPA)                                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  React UI    │  │  Tevm        │  │  ethers.js        │  │
│  │  TanStack    │──│  MemoryClient│  │  Contract objects  │  │
│  │  Router      │  │  In-Browser  │  │  ABI-typed calls  │  │
│  │  Mantine v8  │  │  EVM         │  │                   │  │
│  └──────────────┘  └──────────────┘  └───────────────────┘  │
│                           │                                  │
│              ┌────────────┴────────────┐                     │
│              ▼                         ▼                     │
│  ┌──────────────────┐  ┌──────────────────────┐             │
│  │  CMTATBond.sol   │  │  ICMADataEngine.sol   │             │
│  │  (CMTAT Standard │  │  (ICMA BDT structs,   │             │
│  │   + link to      │  │   role-gated setters) │             │
│  │   ICMADataEngine)│  │                       │             │
│  └──────────────────┘  └──────────────────────┘             │
└──────────────────────────────────────────────────────────────┘
```

The **engine pattern** keeps `CMTATBond` under the 24KB EVM contract size limit by storing all ICMA taxonomy data in a separate `ICMADataEngine` contract.

## 7-Step Bond Lifecycle

The sandbox walks through the complete tokenized bond lifecycle:

| Step | Name | Contract Operations |
|------|------|-------------------|
| 1 | **Deploy Contracts** | Deploy `CMTATBond` + `ICMADataEngine` via Tevm |
| 2 | **Bond Data Taxonomy** | Set ICMA BDT static data, terms, and party roles |
| 3 | **Primary Issuance** | `mint()` tokens to investor accounts |
| 4 | **Secondary Trading** | `transfer()` between investor accounts |
| 5 | **Coupon Distribution** | Simulate interest payment to holders |
| 6 | **Compliance Actions** | `pause()`, `freeze()`, snapshot, credit events |
| 7 | **Maturity & Burn** | `burn()` all tokens at redemption |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Build** | Vite 7 |
| **UI** | React 19, Mantine v8 |
| **Routing** | TanStack Router (file-based, type-safe) |
| **Charts** | Recharts |
| **EVM** | Tevm `createMemoryClient` (in-browser, no backend) |
| **Contracts** | ethers.js v6 (ABI-typed) |
| **Solidity** | v0.8.28+, Optimizer 200 runs |
| **CMTAT** | Git submodule → `lib/cmtat/` |
| **State** | Zustand (persisted to localStorage) |
| **Hosting** | GitHub Pages (static SPA) |

## Smart Contracts

```
contracts/
├── deployment/
│   └── CMTATBond.sol          # Inherits CMTATStandalone + links ICMADataEngine
├── engines/
│   └── ICMADataEngine.sol     # ICMA BDT storage: static data, terms, credit events
├── interfaces/
│   └── IICMADataEngine.sol    # Interface for engine pattern
└── libraries/
    └── ICMATypes.sol          # BondStaticData, BondTerms, CreditEvents structs
```

CMTAT is included as a git submodule at `lib/cmtat/` per the [official recommendation](https://github.com/CMTA/CMTAT).

## Local Development

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/siva-sub/cmtat-icma-tokenized-bonds.git
cd cmtat-icma-tokenized-bonds

# Install dependencies
npm install

# Start dev server
npm run dev

# Run Hardhat tests
npm test

# Production build
npm run build
```

### Prerequisites

- Node.js 20+
- npm 10+

## Standards References

- [MAS Project Guardian — Fixed Income Framework](https://www.mas.gov.sg/schemes-and-initiatives/project-guardian) (Nov 2024)
- [ICMA Bond Data Taxonomy v1.2](https://www.icmagroup.org/market-practice-and-regulatory-policy/secondary-markets/bond-market-transparency/icma-bond-data-taxonomy/)
- [CMTAT Standard](https://github.com/CMTA/CMTAT) — Capital Markets and Technology Association (Swiss)
- [GFMA Tokenization Design Principles](https://www.gfma.org/policies-resources/gfma-tokenization-design-principles/)

## License

ISC
