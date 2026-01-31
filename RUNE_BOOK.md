# Rune-Book of the Diamond Directory

This is the Atlas rewritten as a rune-book: same system, different lens.

---

## The Sigils (Core Sources)

- `diamond_deployments.json` — **The Anchor Ledger** (single source of truth)
- `deploy_diamond.ts` — **The Gate** (deploy + IPFS + Obsidian merge)
- `contracts/`, `diamonds/`, `gems/`, `nervous_system/` — **The Living Body**

---

## The Thread of Injection (The Spine)

WalletConnect → MetaMask SDK → Safe{Wallet} → Diamond Framework

The spine is the only execution path. All other rites plug into it.

---

## The Oracles (Seeing + Proof)

- `blockscout_repo_monitor.ts` — **The Watcher** (on-chain signals)
- `tenderly_diamond.ts`, `tenderly_diamond_repos.ts` — **The Verifier**
- `chainlink_treasure_floor_monitor.ts` — **The Bell**
- `check_diamondcut_rpc.ts` — **The Loupe**

These are the eyes and the proofs.

---

## The Memory (Vault + IPFS)

- `obsidian_vault/` — **The Living Archive**
- `generate_obsidian_tree.ts` — **The Scribe**
- `ipfs_fuse_system.ts` — **The Binder**

Memory is made durable here.

---

## The Runes (Axis + Declaration)

- `DIAMOND_AXIS_KEY.md` — **The Axis**
- `liturgical_declaration.json` — **The Declaration**
- `SOURCE_LANGUAGES_FONTS.md` — **The Tongues**

The runes carry meaning into structure.

---

## The Rites (Entry Points)

- `npm run setup` — **Open the circle**
- `npm run monitor` — **Keep the vigil**
- `npm run deploy-diamond` — **Place the stone**
- `npm run check-diamond-rpc` — **Look through the loupe**
- `npm run fetch-rpcs -- <chainIds>` — **Summon the roads**

---

## The Order (When Starting Fresh)

1) `env.txt` — set the keys
2) `diamond_deployments.json` — set the anchors
3) `npm run fetch-rpcs -- <chainIds>` — lay the roads
4) `npm run check-diamond-rpc` — verify the stone
5) `npm run setup` — prepare the watchers
6) `npm run monitor` — keep the vigil

---

## The One Sentence

Diamonds deploy → anchors recorded → Safe injected → observers verify → memory archived.

---

## If You Want the Symbolic Axis Inline

See `DIAMOND_AXIS_KEY.md` for the full axis and script roles.
