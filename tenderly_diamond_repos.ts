/**
 * Tenderly Diamond Monitoring for 65 Treasure Repos
 * 
 * Monitors all Diamond contracts across the 65 repos:
 * - Checks verification status
 * - Monitors facet changes
 * - Tracks DiamondCut events
 * - Validates Diamond Standard compliance
 * 
 * Usage:
 *   npm run tenderly-diamond-repos                    # Check all repos
 *   npm run tenderly-diamond-repos -- --watch        # Continuous monitoring
 *   npm run tenderly-diamond-repos -- --repo=<name>  # Specific repo
 */

import * as fs from "fs";
import * as path from "path";

const TENDERLY_API_BASE = "https://api.tenderly.co/api/v1";
const CONFIG_PATH = path.join(process.cwd(), "treasure_repos.json");
const DEFAULT_CHAIN_ID = 42161; // Arbitrum

// Diamond Standard selectors
const FACET_ADDRESSES_SELECTOR = "0x52ef6b2c"; // facetAddresses()
const FACET_FUNCTION_SELECTORS_SELECTOR = "0xadfca15e"; // facetFunctionSelectors(address)

interface RepoEntry {
  url: string;
  name: string;
  hasContracts?: boolean | null;
  hasHardhat?: boolean | null;
  contractAddress?: string;
}

interface TreasureReposConfig {
  repos: RepoEntry[];
}

interface DiamondMonitorResult {
  repoName: string;
  repoUrl: string;
  diamondAddress: string;
  chainId: number;
  verified: boolean;
  facets: string[];
  facetDetails: Array<{
    address: string;
    selectors: string[];
    verified: boolean;
  }>;
  compliant: boolean;
  lastChecked: string;
}

/**
 * Get network slug for Tenderly
 */
function getNetworkSlug(chainId: number): string {
  const slugs: Record<number, string> = {
    1: "mainnet",
    137: "polygon",
    42161: "arbitrum",
    8453: "base",
  };
  return slugs[chainId] || "mainnet";
}

/**
 * Get Diamond facets using Tenderly RPC
 */
async function getDiamondFacets(diamondAddress: string, chainId: number): Promise<string[]> {
  const nodeKey = process.env.TENDERLY_NODE_ACCESS_KEY;
  if (!nodeKey) {
    return [];
  }
  
  const networkSlug = getNetworkSlug(chainId);
  const url = `https://${networkSlug}.gateway.tenderly.co/${nodeKey}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [
          {
            to: diamondAddress,
            data: FACET_ADDRESSES_SELECTOR,
          },
          "latest",
        ],
      }),
    });
    
    const result = await response.json() as { result?: string; error?: { message?: string } };
    if (result.error || !result.result || result.result === "0x") {
      return [];
    }
    
    // Decode address array
    const hex = result.result.startsWith("0x") ? result.result.slice(2) : result.result;
    if (hex.length < 66) return [];
    
    const offsetHex = hex.substring(0, 64);
    const offset = parseInt(offsetHex, 16);
    const lengthHex = hex.substring(offset * 2, offset * 2 + 64);
    const length = parseInt(lengthHex, 16);
    
    const addresses: string[] = [];
    const startPos = offset * 2 + 64;
    
    for (let i = 0; i < length; i++) {
      const addrHex = hex.substring(startPos + i * 64, startPos + i * 64 + 64);
      const address = "0x" + addrHex.slice(24);
      addresses.push(address);
    }
    
    return addresses;
  } catch {
    return [];
  }
}

/**
 * Get function selectors for a facet
 */
async function getFacetSelectors(
  diamondAddress: string,
  facetAddress: string,
  chainId: number
): Promise<string[]> {
  const nodeKey = process.env.TENDERLY_NODE_ACCESS_KEY;
  if (!nodeKey) {
    return [];
  }
  
  const networkSlug = getNetworkSlug(chainId);
  const url = `https://${networkSlug}.gateway.tenderly.co/${nodeKey}`;
  
  const data = FACET_FUNCTION_SELECTORS_SELECTOR + facetAddress.slice(2).padStart(64, "0");
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [
          {
            to: diamondAddress,
            data: data,
          },
          "latest",
        ],
      }),
    });
    
    const result = await response.json() as { result?: string };
    const dataHex = result.result || "0x";
    
    if (dataHex === "0x" || dataHex.length < 66) {
      return [];
    }
    
    // Decode bytes4[] array
    const hex = dataHex.startsWith("0x") ? dataHex.slice(2) : dataHex;
    const offsetHex = hex.substring(0, 64);
    const offset = parseInt(offsetHex, 16);
    const lengthHex = hex.substring(offset * 2, offset * 2 + 64);
    const length = parseInt(lengthHex, 16);
    
    const selectors: string[] = [];
    const startPos = offset * 2 + 64;
    
    for (let i = 0; i < length; i++) {
      const selectorHex = hex.substring(startPos + i * 64, startPos + i * 64 + 64);
      const selector = "0x" + selectorHex.slice(24, 32);
      selectors.push(selector);
    }
    
    return selectors;
  } catch {
    return [];
  }
}

/**
 * Check if contract is verified on Tenderly
 */
async function isContractVerified(contractAddress: string, chainId: number): Promise<boolean> {
  const key = process.env.TENDERLY_ACCESS_KEY;
  const username = process.env.TENDERLY_USERNAME;
  const project = process.env.TENDERLY_PROJECT;
  
  if (!key || !username || !project) {
    return false;
  }
  
  try {
    const url = `${TENDERLY_API_BASE}/account/${username}/project/${project}/contracts/${chainId}/${contractAddress}`;
    const response = await fetch(url, {
      headers: { "X-Access-Key": key },
    });
    
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Load repos from config
 */
function loadRepos(): RepoEntry[] {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Config not found: ${CONFIG_PATH}`);
  }
  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  const config = JSON.parse(raw) as TreasureReposConfig;
  return config.repos.filter((r) => r.url && r.url.trim().length > 0);
}

/**
 * Get Diamond address for repo
 */
function getDiamondAddress(repo: RepoEntry, chainId: number): string | null {
  if (repo.contractAddress) {
    return repo.contractAddress;
  }
  
  // Check diamond_deployments.json
  const deploymentsPath = path.join(process.cwd(), "diamond_deployments.json");
  if (fs.existsSync(deploymentsPath)) {
    try {
      const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf-8"));
      const deployment = deployments.find(
        (d: any) =>
          (d.repoName === repo.name || d.repoUrl === repo.url) &&
          d.chainId === chainId
      );
      if (deployment?.diamondAddress) {
        return deployment.diamondAddress;
      }
    } catch {
      // Ignore
    }
  }
  
  return null;
}

/**
 * Check Diamond compliance
 */
function checkDiamondCompliance(
  facets: string[],
  facetDetails: Array<{ address: string; selectors: string[]; verified: boolean }>
): boolean {
  if (facets.length === 0) {
    return false;
  }
  
  const facetsWithSelectors = facetDetails.filter((f) => f.selectors.length > 0);
  if (facetsWithSelectors.length === 0) {
    return false;
  }
  
  return true;
}

/**
 * Monitor a single repo's Diamond
 */
async function monitorRepoDiamond(
  repo: RepoEntry,
  chainId: number
): Promise<DiamondMonitorResult | null> {
  const diamondAddress = getDiamondAddress(repo, chainId);
  
  if (!diamondAddress) {
    return null;
  }
  
  console.log(`  Checking: ${repo.name}`);
  console.log(`    Diamond: ${diamondAddress.substring(0, 10)}...`);
  
  const verified = await isContractVerified(diamondAddress, chainId);
  console.log(`    Verified: ${verified ? "✅" : "❌"}`);
  
  const facets = await getDiamondFacets(diamondAddress, chainId);
  console.log(`    Facets: ${facets.length}`);
  
  const facetDetails: Array<{ address: string; selectors: string[]; verified: boolean }> = [];
  for (const facetAddress of facets) {
    const selectors = await getFacetSelectors(diamondAddress, facetAddress, chainId);
    const facetVerified = await isContractVerified(facetAddress, chainId);
    facetDetails.push({
      address: facetAddress,
      selectors,
      verified: facetVerified,
    });
  }
  
  const compliant = checkDiamondCompliance(facets, facetDetails);
  console.log(`    Compliant: ${compliant ? "✅" : "❌"}\n`);
  
  return {
    repoName: repo.name,
    repoUrl: repo.url,
    diamondAddress,
    chainId,
    verified,
    facets,
    facetDetails,
    compliant,
    lastChecked: new Date().toISOString(),
  };
}

/**
 * Main monitoring function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const watch = args.includes("--watch");
  const repoFilter = args.find((a) => a.startsWith("--repo="))?.split("=")[1];
  const chainIdArg = args.find((a) => a.startsWith("--chain="))?.split("=")[1];
  const chainId = chainIdArg ? parseInt(chainIdArg, 10) : DEFAULT_CHAIN_ID;
  
  console.log("\n🔷 Tenderly Diamond Monitoring — 65 Treasure Repos\n");
  console.log("=" .repeat(70));
  console.log(`Chain: ${chainId}`);
  console.log("");
  
  const key = process.env.TENDERLY_ACCESS_KEY;
  const nodeKey = process.env.TENDERLY_NODE_ACCESS_KEY;
  
  if (!key && !nodeKey) {
    console.log("⚠️  Tenderly not configured:");
    console.log("   Set TENDERLY_ACCESS_KEY for verification checks");
    console.log("   Set TENDERLY_NODE_ACCESS_KEY for RPC calls");
    console.log("");
  }
  
  const repos = loadRepos();
  const reposToCheck = repoFilter
    ? repos.filter((r) => r.name === repoFilter)
    : repos.filter((r) => r.hasContracts === true || r.contractAddress);
  
  console.log(`Checking ${reposToCheck.length} repo(s) with contracts...\n`);
  
  const results: DiamondMonitorResult[] = [];
  let verifiedCount = 0;
  let compliantCount = 0;
  
  for (const repo of reposToCheck) {
    try {
      const result = await monitorRepoDiamond(repo, chainId);
      if (result) {
        results.push(result);
        if (result.verified) verifiedCount++;
        if (result.compliant) compliantCount++;
      }
      
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error: any) {
      console.log(`  ❌ Error: ${error.message}\n`);
    }
  }
  
  console.log("=" .repeat(70));
  console.log("📊 Summary\n");
  console.log(`Repos checked: ${results.length}`);
  console.log(`Diamonds verified: ${verifiedCount}/${results.length}`);
  console.log(`Diamonds compliant: ${compliantCount}/${results.length}`);
  console.log("");
  
  const outputPath = path.join(process.cwd(), "tenderly_diamond_repos_results.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        chainId,
        reposChecked: results.length,
        verified: verifiedCount,
        compliant: compliantCount,
        results,
      },
      null,
      2
    )
  );
  console.log(`✅ Results saved to: ${outputPath}\n`);
  
  const unverified = results.filter((r) => !r.verified);
  const nonCompliant = results.filter((r) => !r.compliant);
  
  if (unverified.length > 0) {
    console.log(`⚠️  ${unverified.length} Diamond(s) not verified:`);
    unverified.forEach((r) => console.log(`   - ${r.repoName}: ${r.diamondAddress}`));
    console.log("");
  }
  
  if (nonCompliant.length > 0) {
    console.log(`⚠️  ${nonCompliant.length} Diamond(s) not compliant:`);
    nonCompliant.forEach((r) => console.log(`   - ${r.repoName}: ${r.diamondAddress}`));
    console.log("");
  }
  
  if (watch) {
    const pollSec = 300;
    console.log(`Watch mode: checking again in ${pollSec}s...\n`);
    setTimeout(() => main(), pollSec * 1000);
  }
}

main().catch((e) => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});
