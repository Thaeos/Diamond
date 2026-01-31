/**
 * Generate framework manifest — one consumable artifact from the framework.
 *
 * Reads diamond_deployments.json + chainlist_rpcs.json and writes
 * manifest/framework-manifest.json: chains (chainId, name, rpcUrls), deployments (address, repoName, chainId).
 * Any app (bridgeworld, Godot, scripts) can consume this file. This manifests.
 *
 * Usage: npm run generate-manifest
 */

import * as fs from "fs";
import * as path from "path";

const CWD = process.cwd();
const DEPLOYMENTS_PATH = path.join(CWD, "diamond_deployments.json");
const CHAINLIST_PATH = path.join(CWD, "chainlist_rpcs.json");
const MANIFEST_DIR = path.join(CWD, "manifest");
const MANIFEST_PATH = path.join(MANIFEST_DIR, "framework-manifest.json");

const MAX_RPC_PER_CHAIN = 8;

interface Deployment {
  repoName?: string;
  repoUrl?: string;
  diamondAddress?: string;
  address?: string;
  chainId?: number;
  network?: string;
  deployedAt?: string;
  facets?: unknown[];
  verified?: boolean;
}

interface ChainRpc {
  chainId: number;
  name: string;
  chain?: string;
  rpc: string[];
  nativeCurrency?: { name: string; symbol: string; decimals: number };
  explorers?: Array<{ name: string; url: string; standard: string }>;
}

interface FrameworkManifest {
  generatedAt: string;
  chains: Array<{
    chainId: number;
    name: string;
    rpcUrls: string[];
    nativeSymbol?: string;
  }>;
  deployments: Array<{
    address: string;
    repoName: string;
    chainId: number;
    network: string;
  }>;
}

function loadDeployments(): Deployment[] {
  try {
    const raw = fs.readFileSync(DEPLOYMENTS_PATH, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data.deployments) ? data.deployments : [];
  } catch {
    return [];
  }
}

function loadChainlist(): Record<string, ChainRpc> {
  try {
    const raw = fs.readFileSync(CHAINLIST_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function main(): void {
  const deployments = loadDeployments();
  const chainlist = loadChainlist();

  const chainIds = new Set<number>();
  for (const d of deployments) {
    const id = d.chainId ?? (d as unknown as { chainId?: number }).chainId;
    const addr = d.diamondAddress ?? d.address;
    if (id != null && addr) chainIds.add(id);
  }
  if (chainIds.size === 0) chainIds.add(137).add(42161);

  const chains: FrameworkManifest["chains"] = [];
  for (const chainId of chainIds) {
    const key = String(chainId);
    const c = chainlist[key];
    const rpcUrls = c?.rpc?.slice(0, MAX_RPC_PER_CHAIN) ?? [];
    const name = c?.name ?? `Chain ${chainId}`;
    const nativeSymbol = c?.nativeCurrency?.symbol;
    chains.push({ chainId, name, rpcUrls, nativeSymbol });
  }

  const deploymentList: FrameworkManifest["deployments"] = [];
  for (const d of deployments) {
    const address = (d.diamondAddress ?? d.address) as string | undefined;
    const chainId = d.chainId as number | undefined;
    const repoName = (d.repoName ?? "unknown") as string;
    const network = (d.network ?? `chain-${chainId}`) as string;
    if (address && chainId) deploymentList.push({ address, repoName, chainId, network });
  }

  const manifest: FrameworkManifest = {
    generatedAt: new Date().toISOString(),
    chains,
    deployments: deploymentList,
  };

  if (!fs.existsSync(MANIFEST_DIR)) fs.mkdirSync(MANIFEST_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf-8");

  const bridgeworldManifestDir = path.join(CWD, "bridgeworld.lol", "manifest");
  const bridgeworldManifestPath = path.join(bridgeworldManifestDir, "framework-manifest.json");
  if (fs.existsSync(path.join(CWD, "bridgeworld.lol"))) {
    if (!fs.existsSync(bridgeworldManifestDir)) fs.mkdirSync(bridgeworldManifestDir, { recursive: true });
    fs.writeFileSync(bridgeworldManifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    console.log("Manifest copied: " + bridgeworldManifestPath);
  }

  console.log("Manifest generated: " + MANIFEST_PATH);
  console.log("  Chains: " + manifest.chains.length);
  console.log("  Deployments: " + manifest.deployments.length);
}

main();
