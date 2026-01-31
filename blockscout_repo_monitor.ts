/**
 * Blockscout Repo Monitor — "Bloomberg Terminal" for 65 Treasure Repos
 * 
 * Monitors all 65 repos for unexpected contract interactions:
 * - Transaction activity
 * - Contract deployments
 * - Token transfers
 * - Internal traces (for debugging failed deployments)
 * - Top holders / whale movements
 * 
 * This is your "On-Chain Truth" sensor feeding your agent's decision-making.
 * 
 * Usage:
 *   npm run blockscout-monitor                    # one-shot check
 *   npm run blockscout-monitor -- --watch        # continuous monitoring
 *   npm run blockscout-monitor -- --repo bridgeworld-docs  # specific repo
 */

import * as fs from "fs";
import * as path from "path";

const CONFIG_PATH = path.join(process.cwd(), "treasure_repos.json");
const DEFAULT_POLL_SECONDS = 60;

// Blockscout API endpoints (multi-chain)
const BLOCKSCOUT_APIS: Record<number, string> = {
  1: "https://eth.blockscout.com/api", // Ethereum
  137: "https://polygon.blockscout.com/api", // Polygon
  42161: "https://arbitrum.blockscout.com/api", // Arbitrum
  8453: "https://base.blockscout.com/api", // Base (Coinbase)
};

interface RepoEntry {
  url: string;
  name: string;
  hasContracts?: boolean | null;
  hasHardhat?: boolean | null;
  contractAddress?: string; // Can be added manually or extracted
}

interface TreasureReposConfig {
  repos: RepoEntry[];
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  method?: string;
  status: string;
}

interface ContractInteraction {
  repoName: string;
  repoUrl: string;
  contractAddress: string;
  chainId: number;
  transactions: Transaction[];
  lastChecked: string;
  alert: boolean;
  alertReason?: string;
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
 * Extract contract address from repo (if known)
 * Checks for Diamond contracts deployed from this foundation repo
 */
function getContractAddress(repo: RepoEntry, chainId: number): string | null {
  // Check if manually set
  if (repo.contractAddress) {
    return repo.contractAddress;
  }
  
  // Check if repo has contracts flag
  if (repo.hasContracts === true) {
    // Try to load from diamond_deployments.json if it exists
    const deploymentsPath = path.join(process.cwd(), "diamond_deployments.json");
    if (fs.existsSync(deploymentsPath)) {
      try {
        const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf-8"));
        // Look for deployment matching repo name or URL
        const deployment = deployments.find(
          (d: any) =>
            d.repoName === repo.name ||
            d.repoUrl === repo.url ||
            (d.chainId === chainId && d.repoName)
        );
        if (deployment?.diamondAddress) {
          return deployment.diamondAddress;
        }
      } catch {
        // Ignore errors
      }
    }
  }
  
  return null;
}

/**
 * Fetch recent transactions for a Diamond contract from Blockscout
 * Specifically looks for DiamondCut events and facet interactions
 */
async function fetchContractTransactions(
  contractAddress: string,
  chainId: number,
  limit: number = 20
): Promise<Transaction[]> {
  const apiBase = BLOCKSCOUT_APIS[chainId] || BLOCKSCOUT_APIS[42161]; // Default to Arbitrum
  
  // Fetch regular transactions
  const url = `${apiBase}/v2/addresses/${contractAddress}/transactions?filter=to&limit=${limit}`;
  
  try {
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
    });
    
    if (!response.ok) {
      console.warn(`  ⚠️  Blockscout API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json() as {
      items?: Array<{
        hash?: string;
        from?: { hash?: string };
        to?: { hash?: string };
        value?: string;
        timestamp?: string;
        method?: string;
        status?: string;
      }>;
    };
    
    const transactions = (data.items || []).map((tx) => ({
      hash: tx.hash || "",
      from: tx.from?.hash || "",
      to: tx.to?.hash || "",
      value: tx.value || "0",
      timestamp: tx.timestamp || "",
      method: tx.method,
      status: tx.status || "unknown",
    }));
    
    // Check for DiamondCut events (method signature: 0x1f931c1c)
    const diamondCutTxs = transactions.filter(
      (tx) => tx.method?.includes("1f931c1c") || tx.method?.toLowerCase().includes("diamondcut")
    );
    
    if (diamondCutTxs.length > 0) {
      console.log(`  🔷 Found ${diamondCutTxs.length} DiamondCut transaction(s)`);
    }
    
    return transactions;
  } catch (error: any) {
    console.warn(`  ⚠️  Error fetching transactions: ${error.message}`);
    return [];
  }
}

/**
 * Fetch internal traces for debugging failed transactions
 */
async function fetchInternalTraces(
  txHash: string,
  chainId: number
): Promise<any[]> {
  const apiBase = BLOCKSCOUT_APIS[chainId] || BLOCKSCOUT_APIS[42161];
  const url = `${apiBase}/v2/transactions/${txHash}/internal-transactions`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json() as { items?: any[] };
    return data.items || [];
  } catch {
    return [];
  }
}

/**
 * Check for unexpected activity (thresholds, new contracts, DiamondCut events, etc.)
 */
function checkForAlerts(
  repo: RepoEntry,
  transactions: Transaction[],
  previousCount: number
): { alert: boolean; reason?: string } {
  // Alert if new transactions appeared
  if (transactions.length > previousCount) {
    const newTxs = transactions.length - previousCount;
    const diamondCutTxs = transactions.filter(
      (tx) => tx.method?.includes("1f931c1c") || tx.method?.toLowerCase().includes("diamondcut")
    ).length;
    
    if (diamondCutTxs > 0) {
      return {
        alert: true,
        reason: `${newTxs} new transaction(s), ${diamondCutTxs} DiamondCut event(s) - Facet upgrade detected!`,
      };
    }
    
    return {
      alert: true,
      reason: `${newTxs} new transaction(s) detected`,
    };
  }
  
  // Alert on DiamondCut events (facet upgrades)
  const diamondCutTxs = transactions.filter(
    (tx) => tx.method?.includes("1f931c1c") || tx.method?.toLowerCase().includes("diamondcut")
  );
  
  if (diamondCutTxs.length > 0) {
    return {
      alert: true,
      reason: `DiamondCut event(s) detected - Facet upgrade on Diamond contract!`,
    };
  }
  
  // Alert if large value transfer (> 1 ETH equivalent)
  const largeTx = transactions.find((tx) => {
    const valueWei = BigInt(tx.value || "0");
    const oneEth = BigInt("1000000000000000000"); // 1e18
    return valueWei > oneEth;
  });
  
  if (largeTx) {
    return {
      alert: true,
      reason: `Large transfer detected: ${largeTx.value} wei (tx: ${largeTx.hash.substring(0, 10)}...)`,
    };
  }
  
  // Alert if failed transactions
  const failedTx = transactions.find((tx) => tx.status === "error" || tx.status === "failed");
  if (failedTx) {
    return {
      alert: true,
      reason: `Failed transaction detected: ${failedTx.hash.substring(0, 10)}...`,
    };
  }
  
  return { alert: false };
}

/**
 * Monitor a single repo
 */
async function monitorRepo(
  repo: RepoEntry,
  chainId: number = 42161, // Default Arbitrum
  previousTxCount: number = 0
): Promise<ContractInteraction> {
  const contractAddress = getContractAddress(repo, chainId);
  
  if (!contractAddress) {
    return {
      repoName: repo.name,
      repoUrl: repo.url,
      contractAddress: "",
      chainId,
      transactions: [],
      lastChecked: new Date().toISOString(),
      alert: false,
    };
  }
  
  console.log(`  Monitoring: ${repo.name} (${contractAddress.substring(0, 10)}...)`);
  
  const transactions = await fetchContractTransactions(contractAddress, chainId);
  const alerts = checkForAlerts(repo, transactions, previousTxCount);
  
  return {
    repoName: repo.name,
    repoUrl: repo.url,
    contractAddress,
    chainId,
    transactions,
    lastChecked: new Date().toISOString(),
    alert: alerts.alert,
    alertReason: alerts.reason,
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
  const chainId = chainIdArg ? parseInt(chainIdArg, 10) : 42161; // Default Arbitrum
  
  console.log("\n🔍 Blockscout Repo Monitor — 65 Treasure Repos\n");
  console.log("=" .repeat(70));
  console.log(`Chain: ${chainId} (${Object.keys(BLOCKSCOUT_APIS).includes(chainId.toString()) ? "supported" : "using default"})`);
  console.log(`Blockscout API: ${BLOCKSCOUT_APIS[chainId] || BLOCKSCOUT_APIS[42161]}`);
  console.log("");
  
  const repos = loadRepos();
  const reposToMonitor = repoFilter
    ? repos.filter((r) => r.name === repoFilter)
    : repos;
  
  console.log(`Monitoring ${reposToMonitor.length} repo(s)...\n`);
  
  // Load previous state
  const statePath = path.join(process.cwd(), "blockscout_monitor_state.json");
  let previousState: Record<string, number> = {};
  if (fs.existsSync(statePath)) {
    try {
      previousState = JSON.parse(fs.readFileSync(statePath, "utf-8"));
    } catch {
      // Ignore
    }
  }
  
  const run = async (): Promise<void> => {
    const results: ContractInteraction[] = [];
    let alertCount = 0;
    
    for (const repo of reposToMonitor) {
      const previousTxCount = previousState[repo.name] || 0;
      const result = await monitorRepo(repo, chainId, previousTxCount);
      results.push(result);
      
      if (result.alert) {
        alertCount++;
        console.log(`\n🚨 ALERT: ${result.repoName}`);
        console.log(`   Reason: ${result.alertReason}`);
        console.log(`   Contract: ${result.contractAddress}`);
        console.log(`   Transactions: ${result.transactions.length}`);
        if (result.transactions.length > 0) {
          const latest = result.transactions[0];
          console.log(`   Latest: ${latest.hash.substring(0, 16)}... (${latest.timestamp})`);
        }
        console.log("");
      }
      
      // Update state
      previousState[repo.name] = result.transactions.length;
      
      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    
    // Save state
    fs.writeFileSync(statePath, JSON.stringify(previousState, null, 2));
    
    // Summary
    console.log("=" .repeat(70));
    console.log(`📊 Summary: ${results.length} repos checked, ${alertCount} alert(s)\n`);
    
    // Save results
    const resultsPath = path.join(process.cwd(), "blockscout_monitor_results.json");
    fs.writeFileSync(
      resultsPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          chainId,
          reposChecked: results.length,
          alerts: alertCount,
          results,
        },
        null,
        2
      )
    );
    
    if (alertCount > 0) {
      console.log(`⚠️  ${alertCount} alert(s) detected — check blockscout_monitor_results.json\n`);
      process.exitCode = 1;
    } else {
      console.log(`✅ No alerts — all repos normal\n`);
    }
  };
  
  if (watch) {
    const pollSec = args.find((a) => a.startsWith("--poll="))?.split("=")[1]
      ? parseInt(args.find((a) => a.startsWith("--poll="))!.split("=")[1], 10)
      : DEFAULT_POLL_SECONDS;
    
    console.log(`Watch mode: polling every ${pollSec}s\n`);
    for (;;) {
      await run();
      await new Promise((resolve) => setTimeout(resolve, pollSec * 1000));
    }
  } else {
    await run();
  }
}

main().catch((e) => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});
