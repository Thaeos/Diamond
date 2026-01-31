# Diamond Repo Study (theosmagic/Diamond)

This is a focused study of the **Diamond foundation** repository and how it functions as the root of the ecosystem.

---

## 1) What It Is

- **EIP‑2535 Diamond Standard** implementation
- **401 Diamonds** + **400+ Gems (facets)**
- **Nervous System Architecture**: Diamonds = neurons, Gems = synapses

This repo is the **foundation layer**. Everything else plugs into it.

---

## 2) Core Data Anchors

- `diamond_deployments.json`
  - Single source of truth for deployed Diamond addresses
  - Links repos to chainId/network
- `treasure_repos.json`
  - 65 Treasure repos that depend on the Diamond foundation

---

## 3) Key Systems (by file)

**Deployment & Memory**
- `deploy_diamond.ts` — deploy record + Obsidian fork + IPFS publish + merge back
- `obsidian_vault/` — graph memory of diamonds
- `generate_obsidian_tree.ts` — rebuilds the visual graph
- `ipfs_fuse_system.ts` — IPFS + FUSE mount for durable memory

**Verification & Monitoring**
- `check_diamondcut_rpc.ts` — direct RPC checks with failover
- `fetch_chainlist_rpcs.ts` — RPC pools per chain
- `blockscout_repo_monitor.ts` — on‑chain monitoring across repos
- `tenderly_diamond.ts` / `tenderly_diamond_repos.ts` — verification & facets
- `chainlink_treasure_floor_monitor.ts` — automation signals

**Wallet / Execution Spine**
- `walletconnect_kit_integration.ts`
- `metamask_safe_integration.ts`
- `wagmi-treasure-bridgeworld-config.ts`
- Architecture: WalletConnect → MetaMask SDK → Safe{Wallet} → Diamond framework

---

## 4) How It Works (One Sentence)

Diamonds deploy → anchors recorded → Safe injected → observers verify → memory archived.

---

## 5) Entry Points (Practical)

- `npm run deploy-diamond`
- `npm run fetch-rpcs`
- `npm run check-diamond-rpc`
- `npm run blockscout-monitor`
- `npm run tenderly-diamond-repos`
- `npm run monitor`

---

## 6) Why It Matters

This repo is **the common standard** that makes the rest of the ecosystem coherent:

- One upgradeable contract pattern across chains
- One monitoring and verification toolchain
- One memory/graph system (Obsidian + IPFS)

