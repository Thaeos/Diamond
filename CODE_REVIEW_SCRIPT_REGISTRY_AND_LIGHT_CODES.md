# Code Review: script_registry_system.ts & light_codes_system.ts

**Scope:** Logic, safety, config usage  
**Date:** 2026-01-29

---

## 1. script_registry_system.ts

### Logic

| Area | Finding | Severity |
|------|---------|----------|
| **Similarity algorithm** | In `detectVerbatimUsage`, the “near-verbatim” path (lines 206–220) uses a character-level metric: for each character in the shorter string, it checks if that character appears anywhere in the longer string and counts matches, then `similarity = (matches / longer.length) * 100`. This is not a meaningful code-similarity measure (e.g. reordering lines or changing identifiers can still yield high scores). Consider Levenshtein, Jaccard on tokens, or a proper AST/diff-based approach for “near-verbatim” detection. | Medium |
| **Verbatim definition** | Exact hash and normalized content hash (100% match) are well-defined. The 95% threshold on the above similarity is arbitrary and can misclassify. | Low |
| **Duplicate registration** | `registerScript` correctly treats same hash or same contentHash as “already registered” and returns existing script. | OK |
| **register-all** | `registerAllScripts` does one read/write per file; could be optimized to load registry once, register all, write once. | Low |

### Safety

| Area | Finding | Severity |
|------|---------|----------|
| **JSON.parse** | All `JSON.parse(fs.readFileSync(...))` calls are unguarded. Corrupted or invalid `registry.json` / `verbatim_detections.json` will throw and crash the process. | Medium |
| **File paths** | `detectVerbatimUsage` reads `registeredScript.filepath` with `fs.readFileSync`. If scripts were registered elsewhere or paths are relative/moved, this can throw “file not found”. | Medium |
| **CLI license** | `license = (args[3] as any) || 'royalty_on_verbatim'` uses `as any`; invalid string becomes runtime license type. | Low |
| **Royalty parse** | `parseFloat(args[4])` can produce NaN; no validation before passing to `registerScript`. | Low |

### Config usage

- Paths: `REGISTRY_DIR`, `REGISTRY_FILE`, `VERBATIM_DETECTION_FILE` are derived from `process.cwd()`. Fine for CLI; ensure cwd is correct when used as a library.
- Defaults: author `'System'`, license `'royalty_on_verbatim'`, royalty `5.0` are clear.

### Recommendations

1. Wrap all registry/detection file reads in try/catch; handle corrupt JSON (e.g. log and return empty/default state).
2. In `detectVerbatimUsage`, guard `fs.readFileSync(registeredScript.filepath)` with try/catch; skip or log when file is missing.
3. Validate CLI license against the union type and validate `parseFloat` result (e.g. `!Number.isNaN(royalty) && royalty >= 0 && royalty <= 100`).
4. Replace or clearly document the character-based similarity metric; consider removing the 95% “verbatim” path until a better metric is in place.

---

## 2. light_codes_system.ts

### Logic

| Area | Finding | Severity |
|------|---------|----------|
| **Cooldown** | Global cooldown is implemented as a single config file; “per-caller” in comments refers to tracking who triggered, but cooldown is global (one `lastProcAttempt` for the whole process). Matches “2.0s global cooldown” design. | OK |
| **Proc rate** | Base rates by rarity + usage/block/formula modifiers, capped at 100%. Logic is consistent. | OK |
| **Royalty** | Royalties computed from gas + value; distribution uses config percentages. Division by `royaltyConfig.totalPercentage` is safe if total > 0 (config has 8.5). | OK |
| **monitorContractUsage** | Return value of `recordLightCodeActivation` can be `null` (when on cooldown). Code does `events.push(event)` unconditionally, so `null` can be pushed into `events`. Type is `LightCodeEvent[]` but array may contain nulls. | **Bug** |

### Safety

| Area | Finding | Severity |
|------|---------|----------|
| **Config load** | `loadGlobalCooldownConfig`, `loadProcRateConfig`, `loadRoyaltyConfig` use unguarded `JSON.parse(fs.readFileSync(...))`. Corrupted config files will throw. | Medium |
| **Config mutation** | `checkGlobalCooldown()` mutates the loaded config object and writes it back. Multiple concurrent callers could race (last write wins). | Low |
| **BigInt** | `gasCost = (BigInt(gasUsed) * BigInt(gasPrice)) / BigInt(10 ** 18)` — in JS, `10 ** 18` is a number; BigInt division truncates. Ensure gas units and wei scaling match your chain. | Low |
| **toBlock** | `monitorContractUsage(..., toBlock: number = 'latest')` types `toBlock` as number but default is string `'latest'`. Passing to `0x${toBlock.toString(16)}` when `toBlock === 'latest'` yields `0xlatest`. | **Bug** |

### Config usage

- **Cooldown:** `GLOBAL_COOLDOWN_SECONDS = 2.0` is hardcoded; config file’s `cooldownSeconds` is overwritten with this value everywhere. Intent is documented.
- **Proc rates / royalties:** Loaded from JSON; defaults written if files missing. Good.
- **Duplicate load:** In the “proc succeeded” block, `loadRoyaltyConfig()` is called twice (lines 456 and 461). Redundant; second call can be removed. | Low |

### Type / structure

| Area | Finding | Severity |
|------|---------|----------|
| **ProcRateConfig** | Defined twice: (1) lines 25–32: `baseRate`, `modifiers` array, `finalRate`; (2) lines 66–73: `baseRates` Record, `modifiers` object. Only the second is used. The first is dead and can cause confusion. | Low |
| **monitorContractUsage** | `toBlock` parameter default `'latest'` is typed as number; should be `number | 'latest'` and handled in RPC params. | Medium |

### Recommendations

1. **Fix null in events:** Only push when `event !== null`: e.g. `const event = recordLightCodeActivation(...); if (event !== null) events.push(event);`
2. **Fix toBlock:** Type as `toBlock?: number | 'latest'` and when building params use `toBlock === 'latest' || toBlock === undefined ? 'latest' : '0x' + toBlock.toString(16)`.
3. Remove duplicate `ProcRateConfig` (the first interface) and the duplicate `loadRoyaltyConfig()` call in the royalty block.
4. Consider try/catch around config file read/parse with fallback to defaults and log warning.
5. Optionally add a short comment that cooldown state is process-local and not safe for concurrent writers.

---

## Summary

| File | Bugs | Medium | Low |
|------|------|--------|-----|
| script_registry_system.ts | 0 | 2 (JSON parse, filepath) | 3 (similarity, CLI, register-all) |
| light_codes_system.ts | 2 (null push, toBlock type) | 1 (JSON parse) | 3 (duplicate config, ProcRateConfig, mutation) |

**Suggested order of work:** Fix the two bugs in light_codes_system.ts (null push and toBlock), then harden JSON/config and path handling in both files, then improve script_registry similarity and CLI validation.
