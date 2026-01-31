# Together — Everything Comes Together

**One run. One flow. One map.**

Using the logic we have: use the tools, trial and error; get it / find it / search it; we are the ones listing; the framework grows and the docs grow with it. Everything comes together in a single orchestrated flow.

---

## One Command

```bash
npm run together
```

This runs, in order:

1. **Env** — Checks `env.txt` exists (optional; create from GET_IT.md).
2. **RPCs** — If `chainlist_rpcs.json` is missing, runs `npm run fetch-rpcs` for chain IDs from `diamond_deployments.json` (or default: 137, 42161, 122, 1285, 3338, 747474).
3. **test:systems** — Typecheck, lint, light-codes, registry, ipfs, compute, treasure-floor, opensea, svg_nft, script_computation.
4. **Tenderly status** — Shows whether Tenderly keys are set (optional for verify/simulate).
5. **treasure-repos-check** — Repo health / filled count (optional; needs GITHUB_TOKEN for --fetch-org).
6. **check-diamond-rpc** — Diamond cut check via RPC (bytecode + diamondCut; event scan may be partial if timeout). Optional; uses first deployment or default address.

At the end you get a **summary** (required vs optional) and **next steps**: proceed, monitor, deploy, GET_IT, atlas.

---

## How It Fits

- **Central anchor:** `diamond_deployments.json` — deployments and chain IDs drive fetch-rpcs and check targets.
- **Execution path:** Wallet injection (Safe, MetaMask, WalletConnect) — see DIRECTORY_ATLAS §2.
- **Observability:** After together, run `npm run setup` then `npm run monitor` (Blockscout, Tenderly, Chainlink).
- **Memory / meaning:** Obsidian, IPFS, Axis + Declaration — see DIRECTORY_ATLAS §6–7, §13.

**Framework stance:** We are the ones listing. Our chains, our integration surface. As the framework grows, the together flow and this doc evolve with it.

---

## If Something Fails

- **Don't have it?** → **GET_IT.md** — get Tenderly keys, GitHub token, chainlist; find it in repo; search docs/web.
- **Don't know what to run?** → **DIRECTORY_ATLAS.md** — map of the whole dir; suggested run order; what ties it all together.
- **Quick preflight only?** → `npm run proceed` — test:systems + treasure-repos-check + tenderly status, no fetch-rpcs or check-diamond-rpc.

---

## Summary

| Goal              | Command / Doc        |
|-------------------|----------------------|
| Everything together | `npm run together` |
| Agent (inquiry)     | `npm run agent -- status \| scope \| balance 0x... \| propose ...` — **AGENT.md** |
| Get keys / find it  | GET_IT.md          |
| Map of the project  | DIRECTORY_ATLAS.md |
| Quick preflight     | `npm run proceed`  |

After **together**, run `npm run agent -- status` to confirm manifest and chains; use `npm run agent -- scope` to see what the agent can do. For purchases/swaps: build tx → propose → approve in Safe{Wallet}.

*One run. One flow. One map. Everything comes together.*
