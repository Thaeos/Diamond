# Framework manifest

**Generated artifact.** Not documentation — a file that other code consumes.

- **`framework-manifest.json`** — Produced by `npm run generate-manifest` (or `npm run together`).
- **Contents:** `chains` (chainId, name, rpcUrls, nativeSymbol), `deployments` (address, repoName, chainId, network).
- **Source:** `diamond_deployments.json` + `chainlist_rpcs.json` in project root.

Use this file in bridgeworld.lol, Godot, or any script that needs chains + RPCs + deployment addresses in one place. This is what manifests from the framework.
