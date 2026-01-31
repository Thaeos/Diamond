# Tenderly for Treasure Foundation & 65 Repos

Use **Tenderly** for contract verification, compilation checks, simulation, and popular function usage across this foundation repo and the 65 Treasure repos.

---

## What Tenderly gives you

| Feature | Use |
|--------|-----|
| **Contract verification** | Verify Solidity on Tenderly (Hardhat/Foundry). Source visible in Developer Explorer. |
| **Compiles** | Verification requires compilable source; Tenderly uses your compiler settings. |
| **Simulation API** | Simulate tx before sending (e.g. from signature.js / agent). |
| **Developer Explorer** | Add contracts, inspect transactions, see which functions are called. |
| **Popular function use** | Use transaction listing + contract view to see hot functions; or Alerts on specific selectors. |
| **Debugger / Gas** | Trace reverts and gas per call. |
| **Node RPC** | Use Tenderly as RPC (including Arbitrum, Polygon, Base). |

---

## 1. Contract verification (Hardhat)

In any repo that uses **Hardhat** (this foundation or one of the 65):

1. Install:
   ```bash
   npm install -D @tenderly/hardhat-tenderly
   ```
2. In `hardhat.config.ts` (or `.js`):
   ```ts
   import * as tdly from "@tenderly/hardhat-tenderly";
   tdly.setup({ automaticVerifications: process.env.TENDERLY_AUTOMATIC_VERIFICATION === "true" });
   // ...
   tenderly: {
     username: process.env.TENDERLY_USERNAME ?? "your-slug",
     project: process.env.TENDERLY_PROJECT ?? "your-project",
     privateVerification: process.env.TENDERLY_PUBLIC_VERIFICATION !== "true",
   },
   ```
3. Log in:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/Tenderly/tenderly-cli/master/scripts/install-macos.sh | sudo sh
   tenderly login
   ```
4. Deploy + verify:
   ```bash
   TENDERLY_AUTOMATIC_VERIFICATION=true npx hardhat run scripts/deploy.ts --network arbitrum
   ```
   Or manual verify after deploy:
   ```ts
   import { tenderly } from "hardhat";
   await tenderly.verify({ name: "DiamondTrading", address: deployedAddress });
   ```

Verification makes source available in Tenderly so you get debugging, simulation, and transaction inspection.

---

## 2. Contract verification (Foundry)

In repos using **Foundry**:

- See [Tenderly Foundry verification](https://docs.tenderly.co/contract-verification/foundry).
- Use Tenderly CLI or REST API to push source and compiler config for verification.

---

## 3. Simulation (pre-flight and agent)

- **Simulation API:** [Single Simulations](https://docs.tenderly.co/simulations/single-simulations) — POST tx payload, get result and gas.
- **RPC:** `tenderly_simulateTransaction` on Tenderly Node — same from any RPC client.
- Use from **signature.js** or Cursor agent to simulate before sending (e.g. TreasureDAO / Diamond calls).

Example (conceptual):

```bash
# Tenderly Node RPC
curl -X POST "https://arbitrum.gateway.tenderly.co/$TENDERLY_NODE_ACCESS_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tenderly_simulateTransaction","params":[{ "from": "...", "to": "0x...", "data": "0x...", "value": "0x0" }, "latest"]}'
```

Use `tenderly_treasure.ts simulate` (or equivalent) with `TENDERLY_ACCESS_KEY` / node key to simulate from this repo.

---

## 4. Popular function use

- **Developer Explorer → Contracts:** Add your Diamond (and other) contract addresses. Open contract → see transactions and decoded calls.
- **Transaction listing:** Filter by contract; aggregate which function selectors appear most = “popular functions.”
- **Alerts:** Create alerts on “Contract method called” for specific selectors; send to Slack/Telegram/webhook for counts or monitoring.
- **This repo:** Run `check-diamond-rpc` to get facets and selectors; cross-reference with Tenderly transaction listing to see which are used most in production.

No extra Tenderly API is required for “popular function use” — it’s visibility in the UI plus optional Alerts.

---

## 5. This repo: `tenderly_treasure.ts`

Script in this foundation repo:

- **status** — Checks `TENDERLY_ACCESS_KEY` / config; prints Tenderly project/slug if set.
- **verify** — Calls Tenderly REST API to verify a contract (address + source + compiler). Requires key and (for full automation) Hardhat/Foundry artifact or source paste.
- **simulate** — Simulates one transaction via Tenderly API or Node RPC (from, to, data, value, chain).

Env vars (optional):

- `TENDERLY_ACCESS_KEY` — REST API / dashboard.
- `TENDERLY_USERNAME` — Account/org slug.
- `TENDERLY_PROJECT` — Project slug.
- `TENDERLY_NODE_ACCESS_KEY` — For RPC simulation.

Run:

```bash
npm run tenderly-treasure status
npm run tenderly-treasure simulate -- <from> <to> <data_hex> [chain_id]
```

Verification from this repo is best done in a repo that already has Hardhat + @tenderly/hardhat-tenderly; `tenderly_treasure.ts verify` can still call the API if you pass source/compiler config (e.g. for a single contract like `DiamondTrading.sol`).

---

## 6. CI and 65 repos

- In each of the 65 repos that have contracts:
  - Add Hardhat (or Foundry) + Tenderly plugin.
  - On deploy (or on main branch), run verify (e.g. `TENDERLY_AUTOMATIC_VERIFICATION=true npx hardhat run scripts/deploy.ts`).
- Optionally in CI: run simulation against a known Diamond address and a test tx to ensure the foundation contract is still behaving as expected.

---

## Summary

| Goal | Where |
|------|--------|
| Verify contracts | Hardhat/Foundry in each repo + Tenderly plugin; or `tenderly_treasure.ts verify` from this repo. |
| Compiles | Enforced by verification (source must compile with given settings). |
| Simulate txs | Simulation API or Node RPC; `tenderly_treasure.ts simulate`. |
| Popular function use | Developer Explorer + Transaction listing + optional Alerts. |

This foundation + Tenderly gives the 65 repos a single place for verification, simulation, and function-usage visibility across Treasure.
