# CMTAT + ICMA | Tokenized Bond Lifecycle Sandbox

> Full client-side bond lifecycle sandbox — deployable as a GitHub Pages SPA, powered by [Tevm](https://tevm.sh) in-memory EVM, the [CMTAT](https://github.com/CMTA/CMTAT) token standard, and [ICMA Bond Data Taxonomy v1.2](https://www.icmagroup.org/market-practice-and-regulatory-policy/secondary-markets/bond-market-transparency/icma-bond-data-taxonomy/).

**🔗 [Live Demo →](https://siva-sub.github.io/cmtat-icma-tokenized-bonds/)**

---

## Overview

This project demonstrates the integration of two industry standards for tokenized fixed-income securities:

| Standard | Role |
|----------|------|
| **CMTAT** (Swiss Capital Markets & Technology Association) | Modular ERC-20 smart contract framework with compliance modules |
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

## About

This project was developed by **Sivasubramanian Ramanathan**, former Product Owner at the **Bank for International Settlements (BIS)**. Having worked extensively in central banking and financial infrastructure, I became deeply curious about emerging standards in tokenized finance, particularly:

- **ICMA Bond Data Taxonomy (BDT)** — The industry standard for bond data classification
- **CMTAT Framework** — Ethereum-based token standard for compliant securities
- **MAS Project Guardian** — Singapore's DeFi experimentation framework
- **Global Layer 1 Guardian Fixed Income Framework** — Cross-border tokenized securities infrastructure

This platform demonstrates how these standards can work together to create a production-ready tokenized fixed income trading environment.

## Project Vision

Tokenized fixed-income instruments represent a generational shift in capital markets infrastructure. By encoding bond term sheets on-chain using the **ICMA Bond Data Taxonomy** and managing token lifecycle compliance through **CMTAT**, this sandbox proves that traditional debt instruments can be fully represented, issued, traded, and redeemed in a standards-compliant digital environment — entirely client-side, with no backend infrastructure required.

The goal is to bridge the gap between traditional fixed-income workflows and decentralized infrastructure, showing that institutional-grade compliance and regulatory frameworks (KYC/AML, transfer restrictions, enforcement actions) can coexist with the transparency and programmability of public blockchains.

## Standards References

- [MAS Project Guardian — Fixed Income Framework](https://www.mas.gov.sg/schemes-and-initiatives/project-guardian) (Nov 2024)
- [ICMA Bond Data Taxonomy v1.2](https://www.icmagroup.org/market-practice-and-regulatory-policy/secondary-markets/bond-market-transparency/icma-bond-data-taxonomy/)
- [CMTAT Standard](https://github.com/CMTA/CMTAT) — Capital Markets and Technology Association (Swiss)
- [GFMA Tokenization Design Principles](https://www.gfma.org/policies-resources/gfma-tokenization-design-principles/)

## Contact

**Sivasubramanian Ramanathan**
Former Product Owner, Bank for International Settlements (BIS)

Specialized in central banking innovation, financial infrastructure, and emerging tokenization standards. This project represents a deep exploration into how traditional fixed income markets can evolve through standards-based tokenization frameworks like CMTAT and ICMA BDT.

- **Email:** [hello@sivasub.com](mailto:hello@sivasub.com)
- **LinkedIn:** [sivasub987](https://www.linkedin.com/in/sivasub987)

## License

ISC
