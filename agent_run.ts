/**
 * Agent Run — autonomous agent entry point for the framework
 *
 * Executes within the scope of your inquiry: loads manifest + Treasure DAO config,
 * performs on-chain reads (balance, status) or outputs Safe proposal instructions.
 * User approves execution via Safe{Wallet} (MetaMask). See AGENT.md.
 *
 * Usage:
 *   npm run agent -- status
 *   npm run agent -- scope
 *   npm run agent -- balance <address> [chainId]
 *   npm run agent -- propose --safe <address> --to <contract> --data <hex> [--value <wei>]
 *   npm run agent -- <free-form inquiry>
 */

import * as fs from "fs";
import * as path from "path";

const CWD = process.cwd();
const MANIFEST_PATH = path.join(CWD, "manifest", "framework-manifest.json");
const TREASURE_CONTRACTS_PATH = path.join(CWD, "treasure_dao_contracts.json");

const SAFE_API_BASE = "https://safe-transaction-arbitrum.safe.global/api/v1";

interface ManifestChain {
  chainId: number;
  name: string;
  rpcUrls: string[];
  nativeSymbol?: string;
}

interface ManifestDeployment {
  address: string;
  repoName: string;
  chainId: number;
  network: string;
}

interface FrameworkManifest {
  generatedAt?: string;
  chains: ManifestChain[];
  deployments: ManifestDeployment[];
}

interface SafeWallet {
  address: string;
  name: string;
  threshold?: number;
  owners?: string[];
  type?: string;
  description?: string;
}

function loadManifest(): FrameworkManifest | null {
  if (!fs.existsSync(MANIFEST_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8")) as FrameworkManifest;
  } catch {
    return null;
  }
}

function loadTreasureContracts(): { contracts: unknown[]; safeWallets: SafeWallet[] } {
  if (!fs.existsSync(TREASURE_CONTRACTS_PATH))
    return { contracts: [], safeWallets: [] };
  try {
    const data = JSON.parse(fs.readFileSync(TREASURE_CONTRACTS_PATH, "utf-8"));
    return {
      contracts: data.contracts || [],
      safeWallets: data.safeWallets || [],
    };
  } catch {
    return { contracts: [], safeWallets: [] };
  }
}

function getRpcUrl(manifest: FrameworkManifest, chainId: number): string | null {
  const chain = manifest.chains.find((c) => c.chainId === chainId);
  const url = chain?.rpcUrls?.[0];
  return url || null;
}

async function runStatus(manifest: FrameworkManifest | null, treasure: ReturnType<typeof loadTreasureContracts>): Promise<void> {
  console.log("\n🤖 Agent — Status (framework scope)\n");
  if (!manifest) {
    console.log("  No manifest found. Run: npm run generate-manifest (or npm run together)\n");
    return;
  }
  console.log("  Manifest: " + MANIFEST_PATH);
  console.log("  Generated: " + (manifest.generatedAt || "—") + "\n");
  console.log("  Chains: " + manifest.chains.length);
  for (const c of manifest.chains) {
    console.log("    • " + c.chainId + " — " + c.name + " (" + (c.nativeSymbol || "—") + ")");
  }
  console.log("\n  Deployments: " + manifest.deployments.length);
  for (const d of manifest.deployments) {
    console.log("    • " + d.address + " @ " + d.chainId + " (" + d.repoName + ")");
  }
  console.log("\n  Treasure DAO — Safe wallets: " + treasure.safeWallets.length);
  for (const s of treasure.safeWallets) {
    console.log("    • " + s.name + " — " + s.address);
  }
  console.log("");
}

async function runScope(): Promise<void> {
  console.log("\n🤖 Agent — Scope of inquiry\n");
  console.log("  The agent can execute the following within the framework:\n");
  console.log("  • status         — Manifest + chains + deployments + Safe wallets");
  console.log("  • scope           — This list (what the agent can do)");
  console.log("  • balance <addr> [chainId] — On-chain native balance via manifest RPC");
  console.log("  • propose --safe <addr> --to <addr> --data <hex> [--value <wei>]");
  console.log("                    — Propose a Safe transaction (you approve in Safe{Wallet})");
  console.log("");
  console.log("  Free-form inquiry: pass any text; agent will run status and append your");
  console.log("  inquiry as context. For purchases/swaps, use propose after building tx.\n");
  console.log("  Refs: AGENT.md, PRIMARY_ACCOUNT_AND_SAFE.md, THE_MAP.md\n");
}

async function runBalance(address: string, chainIdStr: string | undefined, manifest: FrameworkManifest | null): Promise<void> {
  const chainId = chainIdStr ? parseInt(chainIdStr, 10) : manifest?.chains?.[0]?.chainId ?? 137;
  if (!manifest) {
    console.log("\n  No manifest. Run: npm run generate-manifest\n");
    return;
  }
  const rpc = getRpcUrl(manifest, chainId);
  if (!rpc) {
    console.log("\n  No RPC for chainId " + chainId + "\n");
    return;
  }
  const chain = manifest.chains.find((c) => c.chainId === chainId);
  const symbol = chain?.nativeSymbol ?? "ETH";
  try {
    const { createPublicClient, http } = await import("viem");
    const client = createPublicClient({
      transport: http(rpc),
    });
    const balance = await client.getBalance({ address: address as `0x${string}` });
    const decimals = 18;
    const value = Number(balance) / 10 ** decimals;
    console.log("\n🤖 Agent — Balance\n");
    console.log("  Address: " + address);
    console.log("  Chain:  " + chainId + " — " + (chain?.name ?? "—"));
    console.log("  Balance: " + value.toFixed(6) + " " + symbol + "\n");
  } catch (e: unknown) {
    if (String(e).includes("Cannot find package 'viem'")) {
      console.log("\n  Balance requires viem. Run: npm install\n");
      return;
    }
    console.log("\n  Error reading balance: " + (e instanceof Error ? e.message : String(e)) + "\n");
  }
}

async function runPropose(args: string[]): Promise<void> {
  const safeIdx = args.indexOf("--safe");
  const toIdx = args.indexOf("--to");
  const dataIdx = args.indexOf("--data");
  const valueIdx = args.indexOf("--value");
  if (safeIdx === -1 || !args[safeIdx + 1] || toIdx === -1 || !args[toIdx + 1] || dataIdx === -1 || !args[dataIdx + 1]) {
    console.log("\n  Usage: npm run agent -- propose --safe <address> --to <contract> --data <hex> [--value <wei>]\n");
    return;
  }
  const safeAddress = args[safeIdx + 1];
  const to = args[toIdx + 1];
  const data = args[dataIdx + 1];
  const value = valueIdx !== -1 && args[valueIdx + 1] ? args[valueIdx + 1] : "0";

  try {
    const res = await fetch(SAFE_API_BASE + "/safes/" + safeAddress + "/", { method: "GET" });
    if (!res.ok) {
      console.log("\n  Safe API error: " + res.status + " (is this Safe on Arbitrum?)\n");
      return;
    }
    const info = (await res.json()) as { nonce?: number };
    const nonce = info.nonce ?? 0;

    const body = {
      to,
      value: value.toString(),
      data: data.startsWith("0x") ? data : "0x" + data,
      operation: 0,
      safeTxGas: 0,
      baseGas: 0,
      gasPrice: "0",
      gasToken: "0x0000000000000000000000000000000000000000",
      refundReceiver: "0x0000000000000000000000000000000000000000",
      nonce,
      sender: undefined as string | undefined,
    };

    console.log("\n🤖 Agent — Propose Safe transaction\n");
    console.log("  Safe: " + safeAddress);
    console.log("  To:   " + to);
    console.log("  Data: " + (data.length > 66 ? data.slice(0, 66) + "…" : data));
    console.log("  Value: " + value);
    console.log("\n  To submit, a sender (owner) must POST to Safe API. Run:");
    console.log("  npm run metamask-safe -- propose --safe " + safeAddress + " --to " + to + " --data " + (data.startsWith("0x") ? data : "0x" + data) + (value !== "0" ? " --value " + value : ""));
    console.log("\n  Then approve in Safe{Wallet}: https://app.safe.global\n");
  } catch (e: unknown) {
    console.log("\n  Error: " + (e instanceof Error ? e.message : String(e)) + "\n");
  }
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const manifest = loadManifest();
  const treasure = loadTreasureContracts();

  const inquiry = argv.length > 0 ? argv.join(" ").trim() : "";

  if (!inquiry) {
    await runStatus(manifest, treasure);
    console.log("  Usage: npm run agent -- <inquiry>   e.g. status | scope | balance 0x... | propose --safe ...\n");
    process.exit(0);
    return;
  }

  const lower = inquiry.toLowerCase();

  if (lower === "status") {
    await runStatus(manifest, treasure);
    return;
  }

  if (lower === "scope") {
    await runScope();
    return;
  }

  if (lower.startsWith("balance ")) {
    const rest = inquiry.slice(8).trim().split(/\s+/);
    const address = rest[0];
    const chainIdStr = rest[1];
    if (!address) {
      console.log("\n  Usage: npm run agent -- balance <address> [chainId]\n");
      return;
    }
    await runBalance(address, chainIdStr, manifest);
    return;
  }

  if (lower.startsWith("propose ")) {
    await runPropose(argv.slice(1));
    return;
  }

  // Free-form inquiry: run status and echo inquiry as context
  await runStatus(manifest, treasure);
  console.log("  Inquiry: \"" + inquiry + "\"\n");
  console.log("  Scope: use status | scope | balance <addr> | propose --safe ... (see AGENT.md)");
  console.log("  For purchases/swaps: build tx (to, data, value) then propose; approve in Safe{Wallet}.\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
