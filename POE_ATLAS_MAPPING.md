# POE Atlas Mapping → Diamond Framework

You said “exactly.” This is the direct mapping of Path of Exile’s Atlas of Worlds to the Diamond stack.

---

## Core Analogy

- **Atlas** = the whole directory graph (all systems + scripts + data)
- **Maps** = individual runnable scripts / monitors
- **Map Tiers** = chain tiers (mainnet vs L2 vs testnet readiness)
- **Atlas Passives** = configuration choices that bias outcomes
- **Voidstones** = chain-level readiness multipliers (RPCs + monitoring + verification)
- **Favored Maps** = monitors we want to see more often
- **Map Device** = the runner (npm scripts)
- **Scarabs/Fragments** = CLI flags / optional integrations


---

## Mapping Table

| POE Atlas Element | Diamond Framework Equivalent |
|---|---|
| **Atlas Map Nodes** | `blockscout_repo_monitor.ts`, `tenderly_diamond_repos.ts`, `check_diamondcut_rpc.ts`, `chainlink_treasure_floor_monitor.ts`, `test_all_systems.ts` |
| **Map Tiers** | `diamond_deployments.json` chainIds + `deploy_diamond.ts` network config |
| **Atlas Passives** | `env.txt` + config files (`treasure_repos.json`, `chainlist_rpcs.json`) |
| **Voidstones** | Verified RPC pools + Tenderly verification + Safe injection |
| **Favored Maps** | Focused monitors (e.g. `blockscout-monitor -- --repo=<name>`) |
| **Map Device** | `npm run monitor`, `npm run setup`, `npm run check-diamond-rpc` |
| **Scarabs/Fragments** | Extra params / flags (watch mode, specific repo/chainId, tenderly keys) |
| **Maven/Eater/Exarch** | Higher-order watchers: Tenderly + Blockscout + Chainlink combined |
| **Invitations** | Aggregated results (`*_results.json`, summary docs) |

---

## How You “Shape the Atlas”

### 1) Choose Your Passives (Bias)
You decide what the world produces by toggling what runs:

- Add chains in `deploy_diamond.ts` and `wagmi` configs (increases map tier).
- Add repos and addresses in `treasure_repos.json` / `diamond_deployments.json`.
- Pull richer RPC pools with `fetch_chainlist_rpcs.ts`.


### 2) Raise the Tier (Voidstones)
Voidstones are what make the Atlas “higher.” In our stack:

- **RPC failover** (chainlist pools) = survivability
- **Tenderly verification** = proof
- **Blockscout monitoring** = visibility
- **Safe injection** = execution path

When all four are present, a chain is “tiered.”


### 3) Favor the Maps You Want

Use targeted runs:

- `npm run blockscout-monitor -- --repo=<name>`
- `npm run tenderly-diamond verify -- <address> <chainId>`
- `npm run check-diamond-rpc <address>`

That’s the same as favoring a map drop.


---

## The Atlas Meta (Whole-Map View)

In POE, the Atlas is a **living graph** you sculpt.  
Here, the “graph” is **Diamond + Treasure + Monitoring** spread across chains.

The more chains you tier up (Voidstones), the more the system behaves like a fully‑shaped Atlas — predictable outputs, targeted outcomes, and controlled risk.

---

## One‑Line Compression

**POE Atlas:** a graph you shape to bias drops.  
**Diamond Atlas:** a graph you shape to bias signal, proof, and execution.

---

## Optional: Rune-Book Link

For the symbolic layer, see `RUNE_BOOK.md` + `DIAMOND_AXIS_KEY.md`.
