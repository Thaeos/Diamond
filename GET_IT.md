# GET IT — Use the Tools, Trial and Error, Find It, Search It

**You have all the tools to test. Use Tenderly, trial and error. If you don't have it, get it. If you don't know what to get, find it. If you can't find it, search it.**

---

## 1) Use the Tools (Test + Tenderly + Trial and Error)

**Bring everything together (one run):**

- `npm run together` — env check → RPCs (if missing) → test:systems → Tenderly status → treasure-repos-check → check-diamond-rpc → summary. See **TOGETHER.md**.

**Run the tests:**

- `npm run test:systems` — typecheck, lint, light-codes, registry, ipfs, compute, treasure-floor, opensea, svg_nft, script_computation. Non-blocking: typecheck/lint can fail; system scripts pass/fail independently.
- `npm run tenderly-treasure status` — shows Tenderly env (ACCESS_KEY, USERNAME, PROJECT, NODE_ACCESS_KEY). If not set, get them (see below).
- `npm run check-diamond-rpc` — Diamond cut check via RPC (no wallet). Uses `chainlist_rpcs.json` in project root; writes `diamond_cut_check_results.json`.
- `npm run tenderly-diamond verify -- <address> [chainId]` — verify Diamond on Tenderly (needs keys).
- `npm run tenderly-diamond-repos` — check Diamond contracts across repos (needs keys).
- `npm run proceed` — preflight: test:systems + treasure-repos-check + tenderly-treasure status.

**Trial and error:** Run commands, read output, fix missing env or paths. Scripts fail gracefully when keys are missing and tell you what to set.

---

## 2) If You Don't Have It — Get It

**Tenderly (verify / simulate / Node RPC):**

1. **Register:** https://dashboard.tenderly.co/register — build for free.
2. **Access Token (API):** Profile photo → **Account Settings** → [**Access Tokens**](https://dashboard.tenderly.co/account/authorization) → **Generate Access Token**. Copy once; use as `TENDERLY_ACCESS_KEY`.
3. **Account/Project:** Create or pick a project. Your **username** (slug) and **project** name go in `TENDERLY_USERNAME` and `TENDERLY_PROJECT`.
4. **Node Access Key (RPC):** From your project, open **Node RPC** or **Simulation** / gateway settings. The gateway URL is `https://<network>.gateway.tenderly.co/<NODE_ACCESS_KEY>`. That key is `TENDERLY_NODE_ACCESS_KEY`.

**Set in env:**

- Copy `env.txt` or export in shell. Uncomment and set:
  - `TENDERLY_ACCESS_KEY=...`
  - `TENDERLY_USERNAME=...`
  - `TENDERLY_PROJECT=...`
  - `TENDERLY_NODE_ACCESS_KEY=...`
- Or `source env.txt` after filling (keep env.txt out of git).

**Other:**

- **GITHUB_TOKEN** — for private Treasure repos: https://github.com/settings/tokens (repo or public_repo scope).
- **chainlist_rpcs.json** — run `npm run fetch-rpcs -- 137 42161` (or your chainIds) to generate in project root.
- **diamond_deployments.json** — add your Diamond addresses; scripts read from here.

---

## 3) If You Don't Know What to Get — Find It

**In this repo:**

- `env.txt` — lists env vars and where to get tokens.
- `QUICK_START.md` — run order, Tenderly keys, npm scripts.
- `TENDERLY_DIAMOND_INTEGRATION.md` — Tenderly + Diamond verify/simulate/monitor.
- `TENDERLY_TREASURE.md` — Tenderly + Treasure (Hardhat, simulate, verify).
- `DIRECTORY_ATLAS.md` — map of the whole dir; what ties it together.
- `package.json` — all `npm run` scripts.

**Find it:** Grep for the env var or script name. Check the script’s top comments for usage and required env.

---

## 4) If You Can't Find It — Search It

**Tenderly:**

- Docs: https://docs.tenderly.co/
- API auth: https://docs.tenderly.co/account/projects/how-to-generate-api-access-token
- Node RPC / gateway: https://docs.tenderly.co/node — search for "node access key" or "gateway".
- Dashboard: https://dashboard.tenderly.co/

**General:**

- Search the repo: `grep -r "TENDERLY" --include="*.ts" --include="*.md" .`
- Search the web: "Tenderly API key", "Tenderly Node RPC key", "Tenderly generate access token".

---

## Summary

| Goal                | Do this                                                                 |
|---------------------|-------------------------------------------------------------------------|
| **Everything together** | `npm run together` — one flow: env → RPCs → test → Tenderly → repos → Diamond RPC → summary (see TOGETHER.md) |
| Test everything     | `npm run test:systems` then `npm run tenderly-treasure status`        |
| Use Tenderly        | Get keys (register → Access Tokens + Node RPC key), set in env         |
| Trial and error     | Run scripts; read errors; fix missing keys/paths; run again            |
| Don't have it       | Get it — register, generate token, copy from dashboard                 |
| Don't know what     | Find it — env.txt, QUICK_START, TENDERLY_*.md, DIRECTORY_ATLAS, TOGETHER.md |
| Can't find it       | Search it — docs.tenderly.co, dashboard, grep, web search              |

*You have all the tools to test. Use Tenderly, trial and error. If you don't have it, get it. If you don't know what to get, find it. If you can't find it, search it.*
