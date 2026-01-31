# Diamond Framework — 80% Relevance Crypto Summary

**Scope:** Chains from Chainlist scored ≥80% relevance to the Diamond/EIP-2535 + Treasure-style stack (EVM, L2, RPC reliability, explorers, TVL/ecosystem).  
**Use:** Purpose summary and fit for our project only. **No integration** — these chains are not added to config; this document is reference only.

---

## Framework Context

Our stack is built on:

- **EIP-2535 Diamond Standard** (upgradeable facets, DiamondCut, Loupe)
- **65 Treasure repos** + diamond_deployments, WalletConnect/MetaMask/Safe
- **Multi-chain** deploys, RPC checks, Blockscout/Tenderly/Chainlink

Relevance means: EVM, production-ready RPCs, L2/bridge UX, explorer/verification, and ecosystem size (TVL) where applicable.

---

## 90% Relevance (5 chains)

| Chain | chainId | Purpose | Why good for our project |
|-------|---------|---------|---------------------------|
| **Katana** | 747474 | Ethereum L2; low fees, EIP-4844/7702; bridge from mainnet. | Already integrated. Strong fit: L2 + multiple RPCs + explorer; good for Diamond deploys and cut checks with failover. |
| **Scroll** | 534352 | zkEVM L2; Ethereum equivalence, low cost, strong DeFi/NFT usage. | High TVL, many RPCs; ideal for Diamond deployments and Treasure-style apps; bridge from mainnet. |
| **Linea** | 59144 | zkEVM L2 (ConsenSys); privacy-friendly, EVM-equivalent. | Solid RPC set, bridge, explorer; good for multi-chain Diamond strategy and verification. |
| **BOB** | 60808 | Bitcoin-connected L2; hybrid BTC/ETH ecosystem. | L2 + bridge; useful for cross-ecosystem Diamond use cases and diversification. |
| **Blast** | 81457 | L2 with native yield and Blast Points; DeFi/gaming focus. | High TVL, many RPCs; good for Diamond-based DeFi/gaming and monitoring. |

---

## 85% Relevance (14 chains)

| Chain | chainId | Purpose | Why good for our project |
|-------|---------|---------|---------------------------|
| **Arbitrum One** | 42161 | Dominant L2; low fees, high TVL, strong DeFi/NFT. | Already in Treasure orbit; best for production Diamond deploys, RPC failover, and ecosystem tooling. |
| **Mantle** | 5000 | L2 (BitDAO); low cost, gaming/DeFi. | L2 + bridge + RPCs; fits Diamond gaming/DeFi and multi-chain monitoring. |
| **Hemi** | 43111 | Ethereum L2; scaling and compatibility. | L2 + bridge; another low-cost target for Diamond cuts and testing. |
| **Celo Mainnet** | 42220 | Mobile-first EVM; payments and ReFi. | L2-style bridge, RPCs; good for payment/ReFi facets and mobile Diamond UX. |
| **zkSync Mainnet** | 324 | zkEVM L2; security and scaling. | Mature L2, bridge, RPCs; strong candidate for Diamond deployments and verification. |
| **Abstract** | 2741 | L2; app chains and UX focus. | L2 + bridge; fits modular Diamond patterns and app-chain narratives. |
| **Soneium** | 1868 | Ethereum L2; Superbridge. | L2 + bridge; additional scaling option for Diamond and monitoring. |
| **Metis Andromeda** | 1088 | L2; DACs and DeFi. | L2 + bridge + RPCs; good for DAO/Diamond governance facets. |
| **Gravity Alpha** | 1625 | L2; cross-chain and DeFi. | L2 + bridge; useful for cross-chain Diamond logic and tooling. |
| **Gate Layer** | 10088 | Exchange L2; liquidity and UX. | L2 + CEX liquidity; can support Diamond-based trading/listing flows. |
| **Boba Network** | 288 | L2; hybrid compute and scaling. | L2 + bridge + RPCs; solid for Diamond deploys and hybrid compute facets. |
| **Polygon zkEVM** | 1101 | zkEVM L2; Polygon ecosystem. | Complements Polygon (137); good for Diamond multi-chain and verification. |
| **Form Network** | 478 | L2; OP stack, bridge. | L2 + dual bridge; another cheap deployment target for Diamond. |

---

## 80% Relevance (17 chains)

| Chain | chainId | Purpose | Why good for our project |
|-------|---------|---------|---------------------------|
| **Ink** | 57073 | EVM chain; DeFi/NFT, high TVL. | No L2 parent in data but strong TVL and RPCs; good for Diamond DeFi/NFT facets. |
| **PulseChain** | 369 | EVM fork; community and low fees. | High TVL, multiple RPCs; fits community-focused Diamond deployments. |
| **Sophon** | 50104 | L2; gaming/modular. | L2 + bridge; fits Diamond gaming and modular facet design. |
| **Morph** | 2818 | L2; optimistic rollup. | L2 + bridge; low-cost Diamond deploys and testing. |
| **Fluence** | 9999999 | L2; decentralized compute. | L2; fits Diamond + decentralized compute/oracle use cases. |
| **Arbitrum Nova** | 42170 | L2; gaming/social, lower cost than One. | Same ecosystem as Arbitrum One; good for high-throughput Diamond apps. |
| **Lens** | 232 | L2; social graph and identity. | L2 + bridge; good for identity/social facets in Diamond stack. |
| **Corn** | 21000000 | L2; BTCN ecosystem. | L2; diversification and niche Diamond use cases. |
| **Nahmii 2** | 5551 | L2; scaling and payments. | L2 + bridge; payment-focused Diamond facets. |
| **Doma** | 97477 | L2 (parent Sepolia); testnet-style. | L2; useful for staging Diamond cuts before mainnet. |
| **Silicon zkEVM** | 2355 | zkEVM L2; multi-bridge. | L2 + bridges; another zkEVM option for Diamond. |
| **Glide L2 Protocol XP** | 253 | L2 (child of 251). | Nested L2; specialized Diamond deployments if needed. |
| **XR One** | 273 | L2 (parent Arbitrum); Caldera. | Arbitrum ecosystem; Diamond deploys with Arbitrum liquidity. |
| **Skate Mainnet** | 5050 | L2; Ethereum bridge. | L2 + bridge; additional Diamond deployment target. |
| **Plume Mainnet** | 98866 | L2; RWA/on-chain assets. | L2 + bridge; fits RWA and asset-backed Diamond facets. |
| **Humanity Protocol** | 6985385 | L2 (parent Arbitrum); identity. | Identity-focused L2; Diamond identity/credential facets. |
| **Scroll Sepolia** | 534351 | Scroll testnet. | Staging for Scroll mainnet Diamond deploys and checks. |
| **Linea Sepolia** | 59141 | Linea testnet. | Staging for Linea mainnet Diamond deploys and checks. |

---

## Summary Table (all 36)

| Score | Count | Typical use for our project |
|-------|-------|-----------------------------|
| 90% | 5 | Primary L2 targets: Katana (integrated), Scroll, Linea, BOB, Blast — deployment, RPC checks, bridges. |
| 85% | 14 | Production and diversification: Arbitrum, Mantle, zkSync, Celo, Metis, Polygon zkEVM, Boba, etc. — multi-chain Diamond + monitoring. |
| 80% | 17 | Extended set: PulseChain, Sophon, Morph, Nova, Lens, Plume, Fluence, testnets (Scroll/Linea Sepolia), etc. — staging and niche facets. |

---

## How to use this document

- **No config changes:** None of these chains are added to `deploy_diamond.ts`, wagmi, or RPC config from this scan.
- **Reference only:** Use this list to decide *which* chains to integrate next (e.g. Scroll, Linea, Arbitrum One, zkSync) based on product needs.
- **Re-run scan:** Run `npx tsx diamond_relevance_scan.ts` to refresh findings; results are in `diamond_relevance_findings.json`.

---

## Integrated networks (already in framework)

These four are **already integrated** (deploy_diamond NETWORKS + wagmi):

- **peaq** (3338) — DePIN / machine economy  
- **Fuse Mainnet** (122) — Payments  
- **Katana** (747474) — Ethereum L2  
- **Moonriver** (1285) — Kusama EVM  

All 80%+ relevance findings above are **purpose summaries only** and are **not** part of the current integration.
