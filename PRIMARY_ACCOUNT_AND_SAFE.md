# Primary account and Safe{Wallet} — how it fits

**Researched:** MetaMask SDK (docs.metamask.io/sdk/), Safe{Wallet} global (safe.global, post-Gnosis) and its **programmable bot / AI agent system** (docs.safe.global/home/ai-overview, human-approval). See **METAMASK_SDK_AND_SAFE_GLOBAL_RESEARCH.md**.

## Single primary account

- **ENS:** `theosmagic.uni.eth`
- **Email:** `theosmagic.uni.eth@ethermail.io` (also the public-address identity)
- **Role:** Sole signer for all wallets and contracts in this setup.

MetaMask is the **all-in-one**: one interface, one primary account. Safe{Wallet} is not a second wallet; it plugs into MetaMask and adds a contract layer.

---

## When Safe{Wallet} comes in

When the **Treasure DAO fren** is purchased and the **Elima agent** is in play:

- The fren and the Elima agent have **their own wallets and contracts**.
- **theosmagic.uni.eth** remains the **sole signer** — the only human signer; you approve in Safe{Wallet} (signing with MetaMask).
- Safe{Wallet} is the **contract** (Safe.global, post-Gnosis) that holds and governs those agent/fren wallets and contracts. It is not a standalone wallet; it gives MetaMask that much more once plugged in: same MetaMask, same signer, plus a shared Safe contract for treasury and agent execution.
- Safe’s **programmable bot system** (docs.safe.global: AI agents, human approval) matches this: agent proposes transactions → you approve in Safe{Wallet} (app.safe.global) with MetaMask → then execution.

---

## Autonomous agent and purchases

- The autonomous agent **can** make purchases that have been **relayed from you to them** to execute on your behalf.
- With Safe{Wallet}, those executions go **through the Safe contract**: the agent (or fren contracts) propose or relay; **you approve** via Safe, signing with MetaMask (theosmagic.uni.eth).
- So: relay from you → agent/fren executes in their wallets/contracts → execution path goes through Safe → you approve (MetaMask) → then it runs. Safe is the approval layer; MetaMask stays the single signer.

---

## Summary

| Layer | Role |
|-------|------|
| **Primary account** | ENS: theosmagic.uni.eth · Email: theosmagic.uni.eth@ethermail.io · Sole signer |
| **MetaMask** | All-in-one: single interface, single signer |
| **Safe{Wallet}** | Contract layer for agent/fren wallets and contracts; you approve executions; not a standalone wallet |
| **Agent / fren** | Their own wallets and contracts; executions relayed from you, approved by you via Safe |

This is the intended model for connect, manifest, and automation: default to this primary account; Safe (global) is the contract layer for agent/fren; autonomous agent can execute purchases on your behalf only after you approve via Safe. MetaMask SDK + Safe global (and its programmable bot / human-approval flow) are documented in METAMASK_SDK_AND_SAFE_GLOBAL_RESEARCH.md.

**The map:** WalletConnect Kit = global connector for user and agent → single surface = **MetaMask{Safe}** → connect Blockscout, OpenSea, Magic Eden, MAGIC, SAND, MANA, ILLUVIUM, Ready Player Me. See **THE_MAP.md**.
