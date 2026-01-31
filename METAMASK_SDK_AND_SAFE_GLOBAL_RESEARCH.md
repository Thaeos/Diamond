# MetaMask SDK + Safe{Wallet} global — research from official docs

Researched so the framework aligns with official MetaMask SDK docs and Safe.global (post-Gnosis) including the **programmable bot / AI agent system**.

---

## MetaMask SDK (docs.metamask.io)

- **Connect:** `MMSDK.connect()` — triggers wallet connection; cross-platform (desktop + mobile), deeplinking. Returns accounts.
- **Provider:** `MMSDK.getProvider()` — EIP-1193 provider for RPC. Use `provider.request({ method, params })` for `eth_accounts`, `eth_chainId`, `eth_getBalance`, `personal_sign`, etc.
- **Connect and sign:** `MMSDK.connectAndSign({ msg: "Sign in to the dapp" })` — one-step connect + sign message.
- **Batched RPC:** `provider.request({ method: "metamask_batch", params: [{ method }, { method }] })` — group multiple JSON-RPC calls.
- **Options:** `dappMetadata` (name, url, iconUrl), `infuraAPIKey` (read-only RPC, load-balancing). SDK supports JavaScript, Wagmi, RainbowKit, ConnectKit, React Native, Web3-Onboard.
- **Source:** https://docs.metamask.io/sdk/ — Connect to MetaMask (extension + mobile), all EVM networks; https://docs.metamask.io/sdk/connect/javascript/ for manual setup (install `@metamask/sdk`, init, connect, getProvider).

---

## Safe{Wallet} global (safe.global, docs.safe.global)

**Transition:** Safe is now **Safe.global** (brand and product). Formerly Gnosis Safe; the stack is Safe{Core} (contracts, SDKs, APIs) and Safe{Wallet} (official UI). Docs and app use safe.global and app.safe.global.

**What Safe is:** Smart account infrastructure — modular, programmable, multisig. Not a standalone EOA wallet; it’s a **contract** that holds assets and executes transactions when signers approve. Safe gives MetaMask (and other signers) a shared treasury and policy layer.

**Programmable bot / AI agent system (docs.safe.global):**

- **AI agents powered by Safe Smart Accounts** — docs.safe.global/home/ai-overview, ai-agent-setup, ai-agent-quickstarts.
- **Setups:**
  1. **Basic agent setup** — Safe with AI agent as the only signer (1-of-1). Easiest; less secure.
  2. **Human approval for agent action** — Agent **proposes** transactions; one or more **human signers** approve and execute in Safe{Wallet}. Recommended: 2-of-3, 3-of-5, or 5-of-7; agent is one signer, threshold ≥ 2 so at least one human approval. Transactions go to **Safe Transaction Service** → show in **Safe Wallet UI** (app.safe.global) → humans connect MetaMask and approve/execute.
  3. **Multiple Agent setup** — Several AI agents as signers; they must reach consensus.
  4. **Agent with spending limit** — Agent has a spending cap on treasury/DAO funds; faster execution with bounded risk.
- **Flow (human approval):** Agent uses Safe Protocol Kit + API Kit → creates transaction → gets Safe tx hash → agent signs → **propose to Safe Transaction Service** → transaction appears in Safe{Wallet} → **human signers connect MetaMask** → approve and/or execute.
- **Example actions:** AI agent swaps on CoW Swap, Uniswap (docs.safe.global/home/ai-agent-actions).
- **Tech:** Safe Protocol Kit (`@safe-global/protocol-kit`), Safe API Kit (`@safe-global/api-kit`), Safe Transaction Service (api.safe.global), LangChain/LangGraph for agent logic. Human signers use **MetaMask** (or Safe Mobile) to sign in Safe{Wallet}.

**Relevance for our stack:** Primary account (theosmagic.uni.eth) = sole human signer. Elima agent (or Treasure DAO fren) = programmable agent that proposes purchases/actions relayed from you. Safe{Wallet} = contract layer; you approve in Safe (signing with MetaMask). This matches Safe’s “Human approval for agent action” model: agent proposes → you approve via Safe → execution.

---

## Summary

| Source | Key points |
|--------|------------|
| **MetaMask SDK** | connect(), getProvider(), connectAndSign(), metamask_batch; dappMetadata, infuraAPIKey; cross-platform, all EVM. |
| **Safe global** | Safe.global (post-Gnosis); Safe{Wallet} = UI, Safe{Core} = contracts/SDKs/APIs; not a standalone wallet, contract layer for multisig + programmable agents. |
| **Safe programmable bots** | AI agent setups: basic (agent only signer), **human approval** (agent proposes, humans approve in Safe{Wallet} with MetaMask), multi-agent, agent with spending limit; Safe Transaction Service + Protocol Kit + API Kit; human signers use MetaMask in app.safe.global. |

---

*References: docs.metamask.io/sdk/, docs.metamask.io/sdk/connect/javascript/, safe.global, docs.safe.global/home/what-is-safe, docs.safe.global/home/ai-overview, docs.safe.global/home/ai-agent-quickstarts/human-approval, docs.safe.global/home/ai-agent-setup.*
