# The map — where this is going

**WalletConnect Kit** = our **global chain network connector** for both **user and agent**. Single plug-and-play. It connects everything above into one surface: **MetaMask{Safe}** — yes, we made that up; so it is.

---

## MetaMask{Safe}

**MetaMask{Safe}** = MetaMask + Safe{Wallet} + agent, as a single plug-and-play surface.

- **WalletConnect Kit** plugs in once → connects **user** (you, theosmagic.uni.eth) and **agent** (Elima, Treasure DAO fren) to the same chain network.
- **MetaMask** = all-in-one signer (primary account, sole human signer).
- **Safe{Wallet}** = contract layer for agent/fren wallets; you approve; agent proposes; execution only after your approval.
- **Agent** = programmable bot (Safe’s human-approval flow): proposes purchases/actions relayed from you; you approve in Safe with MetaMask.

So: one connector (WalletConnect Kit) → one surface (MetaMask{Safe}) → user + agent on the same map.

---

## What connects into MetaMask{Safe}

Once WalletConnect Kit is the global connector and MetaMask{Safe} is the surface, we connect:

| Layer | What |
|-------|------|
| **Explorers / data** | **Blockscout** — on-chain truth, monitoring, 65 repos. **OpenSea** — NFT marketplace, Diamond/Gem listings. **Magic Eden** — NFT/gaming marketplace. |
| **Tokens / ecosystems** | **MAGIC** (Treasure, Bridgeworld). **SAND** (The Sandbox). **MANA** (Decentraland). **ILLUVIUM** (gaming). **Ready Player Me** (avatar/identity across games and metaverse). |
| **Chains / RPC / oracle** | **Chainlist** — chain list and RPC endpoints. **Chainlink** — oracle and automation. **ENS** — name resolution (e.g. theosmagic.uni.eth). **Ethers.js** — library for providers, signers, contracts. |
| **Swap / bridge** | **Magicswap** — Treasure DEX, MAGIC and tokens. **Uniswap** — DEX, liquidity, swaps. **Allbridge** — cross-chain bridge. |
| **Portfolio / activity** | **Zapper** — bundle multiple wallets, Apps/DeFi, NFTs, Activity (filter by protocol/chain); hidden tokens in settings or bottom of list. **DeBank** — cross-reference for obscure tokens and dust Zapper might miss. See **ZAPPER_DEBANK_ROUNDUP.md**. |

So we have:

- **One connector:** WalletConnect Kit (user + agent).
- **One surface:** MetaMask{Safe} (MetaMask + Safe + agent, plug-and-play).
- **Connected into it:** Blockscout, OpenSea, Magic Eden + MAGIC, SAND, MANA, ILLUVIUM, Ready Player Me + Chainlist, Chainlink, Magicswap, Uniswap, ENS, Ethers.js, Allbridge + **Zapper, DeBank** (round up chaos: bundle, ghost assets, hidden, cross-ref; see ZAPPER_DEBANK_ROUNDUP.md).

That’s the map: global connector → MetaMask{Safe} → chains (Chainlist), oracle (Chainlink), swap (Magicswap, Uniswap), bridge (Allbridge), identity (ENS, Ready Player Me), library (Ethers.js), explorers and marketplaces (Blockscout, OpenSea, Magic Eden), tokens (MAGIC, SAND, MANA, ILLUVIUM) in one view.

---

## Flow in one sentence

WalletConnect Kit connects user and agent to the chain network; MetaMask{Safe} is the single surface (MetaMask + Safe + agent); Chainlist, Chainlink, Magicswap, Uniswap, ENS, Ethers.js, Allbridge, Zapper, DeBank, Blockscout, OpenSea, Magic Eden, MAGIC, SAND, MANA, ILLUVIUM, and Ready Player Me connect into that map. Use Zapper + DeBank to round up the chaos (bundle, ghost assets, hidden, breadcrumbs); see ZAPPER_DEBANK_ROUNDUP.md.

---

*So it is. Now we’re starting to actually see the map.*
