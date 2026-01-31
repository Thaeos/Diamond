# Treasure Foundation: 65 Repos

This repo is the **main foundation** for the [Treasure](https://github.com/treasureproject) ecosystem. The Diamond contract, Light Codes, script registry, and tooling here are intended to be the shared base for **65 repos** (games, marketplaces, and tooling under Treasure / your org).

---

## Role of this repo

| Piece | Purpose |
|-------|--------|
| **Diamond / EIP-2535** | Diamond cut checker (RPC + MetaMask), facet verification, deployment scripts. |
| **Contracts** | `contracts/DiamondTrading.sol`, `nervous_system/`, `diamonds/`, `gems/` — shared patterns and references. |
| **Light Codes** | Usage tracking, proc rates, royalties, cooldown — on-chain behavior for NFTs/games. |
| **Script registry** | Verbatim detection, royalties on code reuse — IP and attribution. |
| **Chains** | Chainlist RPCs, Arbitrum/Polygon/Base, TreasureDAO floor monitor, Blockscout/Chainlink flows. |

Child repos (the 65) can:

- Depend on this repo as a submodule or npm/package reference.
- Reuse the same Diamond addresses, ABIs, and scripts (check-diamond-rpc, deploy-diamond, etc.).
- Use the same Light Codes config (cooldown, proc rates, royalties).
- Verify and simulate contracts via **Tenderly** (see TENDERLY_TREASURE.md).

---

## 65-repo config

- **Config file:** `treasure_repos.json` — list of up to 65 repo URLs (and optional `name`, `hasContracts`, `hasHardhat`).
- **Org reference:** `orgUrl` points to `https://github.com/treasureproject` (or your org); fill `repos[]` from that org’s repo list.
- **Check script:** `npm run treasure-repos-check` — validates config, counts filled slots, optionally checks GitHub API for repo list.

Fill `treasure_repos.json` by:

1. Going to https://github.com/treasureproject (or your org).
2. Listing all repos (e.g. “65 repos”).
3. Pasting repo URLs into `repos[].url` and setting `repos[].name` (e.g. repo or game name).

---

## Checklist: align a repo with this foundation

For each of the 65 repos:

- [ ] Repo uses same chain set (Arbitrum, Polygon, etc.) and RPC source (e.g. chainlist / this repo’s fetch-rpcs).
- [ ] If it has Solidity: compiles cleanly; consider Hardhat + Tenderly verification (see TENDERLY_TREASURE.md).
- [ ] If it calls Diamond/Light Codes: uses same contract addresses and ABIs as this foundation (or env/config).
- [ ] Scripts/tooling (e.g. check-diamond-rpc, treasure-floor) can run from this repo against that repo’s contracts/deploys when addresses are set.

---

## Popular function use and Tenderly

To see **which functions are used most** across deployments and repos:

1. **Tenderly Developer Explorer** — Add contracts by address; inspect transactions and trace calls. Use “Contracts” and “Transaction Listing” to see function usage.
2. **Tenderly Monitoring / Alerts** — Trigger on specific function calls or events to count or react to popular functions.
3. **This repo + 65 repos** — Run `check-diamond-rpc` (and optionally Tenderly verify/simulate) per repo/deploy; aggregate results (e.g. in a dashboard or script) to see which functions are called most.

See **TENDERLY_TREASURE.md** for contract verification, simulation, and function-usage setup.
