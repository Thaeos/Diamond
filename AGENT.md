# Agent — autonomous execution within the scope of your inquiry

The **agent** is the single entry point for your autonomous agent to execute framework actions: read manifest, on-chain balance, Safe status, and propose Safe transactions. You (or your automation) approve execution via **Safe{Wallet}** with MetaMask. See **PRIMARY_ACCOUNT_AND_SAFE.md** and **THE_MAP.md**.

---

## One command

```bash
npm run agent -- <inquiry>
```

The agent loads **manifest/framework-manifest.json** (chains, RPCs, deployments) and **treasure_dao_contracts.json** (Safe wallets, contracts). All actions stay within this scope.

---

## In-scope inquiries

| Inquiry | What the agent does |
|--------|----------------------|
| `status` | Prints manifest summary: chains, deployments, Treasure DAO Safe wallets. No external API call unless you add `--safe <address>`. |
| `scope` | Prints this list — what the agent can do — so an external agent/LLM knows the scope. |
| `balance <address> [chainId]` | Reads native balance on-chain via manifest RPC (viem). Default chain = first in manifest or Polygon. |
| `propose --safe <addr> --to <addr> --data <hex> [--value <wei>]` | Builds Safe tx and prints instructions; you submit via `npm run metamask-safe -- propose ...` and approve in Safe{Wallet}. |
| Any other text | Runs `status` and echoes your inquiry as context; suggests using `scope` or `propose` for next step. |

---

## Flow (inquiry → execution)

1. **You (or your autonomous agent)** send an inquiry: e.g. `npm run agent -- balance 0xYourAddress 137`.
2. **Agent** loads manifest + Treasure config, parses intent, runs the action (e.g. viem `getBalance` on first RPC for that chain).
3. **Reads** (status, balance) return immediately.
4. **Writes** (purchases, swaps) go through **Safe**: agent outputs a **proposal** (to, data, value); you run `npm run metamask-safe -- propose ...` with sender = your signer, then **approve in Safe{Wallet}** (app.safe.global) with MetaMask. Execution only after approval.

So: **within the scope of your inquiry** = status, scope, balance, and propose (with human approval). No execution of Safe transactions without your approval.

---

## Example: “Purchase a Treasure DAO fren”

- **Inquiry:** “purchase a Treasure DAO fren” (or “buy a Legion”).
- **Agent** can run `status` to show Safe wallets and contracts, and `scope` to show capabilities.
- **Purchase** = a transaction (to marketplace/contract, data = encoded call, value = ETH if needed). Agent **cannot** sign; it can only **propose**.
- **Flow:** You (or a script) build the tx (to, data, value). Then:
  - `npm run agent -- propose --safe <YourSafe> --to <Marketplace> --data <encodedBuy> [--value <wei>]`
  - Then: `npm run metamask-safe -- propose --safe <YourSafe> --to <Marketplace> --data <encodedBuy> ...`
  - Approve in Safe{Wallet} with MetaMask.

So the agent executes **within scope**: it gives you status, scope, balance, and proposal; you approve and execute.

---

## Example: “Swap MAGIC for SAND”

- **Inquiry:** “swap MAGIC for SAND”.
- **Agent** can show chains/RPCs and scope; it does not hold keys. Swap = call to a DEX (Magicswap, Uniswap, etc.) with encoded swap data.
- **Flow:** Build swap calldata (off-chain or via another tool). Then use **propose** to submit to your Safe; approve in Safe{Wallet}. Agent’s role = propose + context (manifest, balance).

---

## Integration with “together”

After **npm run together** you have a fresh manifest. Then:

- `npm run agent -- status` — confirm chains and deployments.
- `npm run agent -- balance <your-address>` — confirm on-chain balance.
- For any write (buy, swap): build tx → `npm run agent -- propose ...` → `npm run metamask-safe -- propose ...` → approve in Safe.

---

## Extending the agent

- **New intents:** Add parsing in **agent_run.ts** (e.g. `deployments`, `safe-pending`) and call manifest / Safe API / viem as needed.
- **Safe API:** Same as **metamask_safe_integration.ts** — Safe Transaction API (safe.global) for propose and status. For other chains, switch `SAFE_API_BASE` (e.g. Polygon = safe-transaction-polygon.safe.global).
- **LLM / external agent:** Run `npm run agent -- scope` to get the list of actions; then run `status`, `balance`, or `propose` with the right args. Use the manifest and Treasure config as context.

---

## Refs

- **PRIMARY_ACCOUNT_AND_SAFE.md** — Primary account (theosmagic.uni.eth), MetaMask, Safe{Wallet}, agent approval flow.
- **THE_MAP.md** — WalletConnect Kit → MetaMask{Safe} → chains, marketplaces, tokens.
- **DIRECTORY_ATLAS.md** — Where the agent sits in the repo (entry point, scripts).
- **TOGETHER.md** — One run to bring everything together; then use the agent for status/scope/balance/propose.

*So it is: one agent, one scope, one approval layer.*
