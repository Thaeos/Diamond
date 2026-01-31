/**
 * Treasure DAO Contracts Monitor
 * 
 * Monitors all 22+ Treasure DAO contracts:
 * - Bridgeworld Legions
 * - MAGIC Token
 * - Marketplace
 * - DAO Treasury (Safe)
 * - Game contracts (Crafting, Quests, Summoning)
 * - DeFi contracts (Staking, Rewards)
 * - Governance contracts
 * 
 * Usage:
 *   npm run treasure-dao-monitor                    # Check all contracts
 *   npm run treasure-dao-monitor -- --watch          # Continuous monitoring
 *   npm run treasure-dao-monitor -- --contract <name> # Specific contract
 */

import * as fs from "fs";
import * as path from "path";

const TREASURE_CONTRACTS_PATH = path.join(process.cwd(), "treasure_dao_contracts.json");
const DEFAULT_CHAIN_ID = 42161; // Arbitrum

interface TreasureContract {
  name: string;
  address: string;
  type: string;
  category: string;
  description: string;
}

interface ContractMonitorResult {
  name: string;
  address: string;
  type: string;
  category: string;
  exists: boolean;
  balance?: string;
  lastActivity?: string;
  alert: boolean;
  alertReason?: string;
}

/**
 * Load Treasure DAO contracts
 */
function loadContracts(): TreasureContract[] {
  if (!fs.existsSync(TREASURE_CONTRACTS_PATH)) {
    return [];
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(TREASURE_CONTRACTS_PATH, "utf-8"));
    return data.contracts || [];
  } catch {
    return [];
  }
}

/**
 * Check if contract exists on-chain
 */
async function checkContractExists(address: string, chainId: number): Promise<boolean> {
  const rpcUrl = getRpcUrl(chainId);
  
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getCode",
        params: [address, "latest"],
      }),
    });
    
    const result = await response.json() as { result?: string };
    const code = result.result || "0x";
    return code !== "0x" && code.length > 2;
  } catch {
    return false;
  }
}

/**
 * Get contract balance (for ETH/native token)
 */
async function getContractBalance(address: string, chainId: number): Promise<string> {
  const rpcUrl = getRpcUrl(chainId);
  
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [address, "latest"],
      }),
    });
    
    const result = await response.json() as { result?: string };
    return result.result || "0";
  } catch {
    return "0";
  }
}

/**
 * Get RPC URL for chain
 */
function getRpcUrl(chainId: number): string {
  const rpcs: Record<number, string> = {
    1: "https://eth.llamarpc.com",
    137: "https://polygon-rpc.com",
    42161: "https://arb1.arbitrum.io/rpc",
    8453: "https://mainnet.base.org",
  };
  return rpcs[chainId] || "https://arb1.arbitrum.io/rpc";
}

/**
 * Monitor a single contract
 */
async function monitorContract(
  contract: TreasureContract,
  chainId: number
): Promise<ContractMonitorResult> {
  console.log(`  Checking: ${contract.name}`);
  console.log(`    Address: ${contract.address.substring(0, 10)}...`);
  
  const exists = await checkContractExists(contract.address, chainId);
  console.log(`    Exists: ${exists ? "✅" : "❌"}`);
  
  let balance: string | undefined;
  if (exists) {
    balance = await getContractBalance(contract.address, chainId);
    const balanceEth = BigInt(balance || "0");
    if (balanceEth > 0n) {
      console.log(`    Balance: ${(Number(balanceEth) / 1e18).toFixed(6)} ETH`);
    }
  }
  
  console.log("");
  
  return {
    name: contract.name,
    address: contract.address,
    type: contract.type,
    category: contract.category,
    exists,
    balance,
    alert: !exists,
    alertReason: !exists ? "Contract not found at address" : undefined,
  };
}

/**
 * Main monitoring function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const watch = args.includes("--watch");
  const contractFilter = args.find((a) => a.startsWith("--contract="))?.split("=")[1];
  const chainIdArg = args.find((a) => a.startsWith("--chain="))?.split("=")[1];
  const chainId = chainIdArg ? parseInt(chainIdArg, 10) : DEFAULT_CHAIN_ID;
  
  console.log("\n💰 Treasure DAO Contracts Monitor\n");
  console.log("=" .repeat(70));
  console.log(`Chain: ${chainId} (Arbitrum)`);
  console.log("");
  
  const contracts = loadContracts();
  const contractsToMonitor = contractFilter
    ? contracts.filter((c) => c.name.toLowerCase().includes(contractFilter.toLowerCase()))
    : contracts;
  
  if (contractsToMonitor.length === 0) {
    console.log("No contracts found in treasure_dao_contracts.json");
    console.log("Add contracts to treasure_dao_contracts.json\n");
    return;
  }
  
  console.log(`Monitoring ${contractsToMonitor.length} contract(s)...\n`);
  
  const results: ContractMonitorResult[] = [];
  let existsCount = 0;
  let alertCount = 0;
  
  for (const contract of contractsToMonitor) {
    try {
      const result = await monitorContract(contract, chainId);
      results.push(result);
      if (result.exists) existsCount++;
      if (result.alert) alertCount++;
      
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error: any) {
      console.log(`  ❌ Error: ${error.message}\n`);
    }
  }
  
  console.log("=" .repeat(70));
  console.log("📊 Summary\n");
  console.log(`Contracts checked: ${results.length}`);
  console.log(`Contracts exist: ${existsCount}/${results.length}`);
  console.log(`Alerts: ${alertCount}\n`);
  
  // Group by category
  const byCategory: Record<string, ContractMonitorResult[]> = {};
  results.forEach((r) => {
    if (!byCategory[r.category]) {
      byCategory[r.category] = [];
    }
    byCategory[r.category].push(r);
  });
  
  console.log("By Category:");
  Object.entries(byCategory).forEach(([category, contracts]) => {
    const existing = contracts.filter((c) => c.exists).length;
    console.log(`  ${category}: ${existing}/${contracts.length}`);
  });
  console.log("");
  
  // Save results
  const outputPath = path.join(process.cwd(), "treasure_dao_monitor_results.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        chainId,
        contractsChecked: results.length,
        exists: existsCount,
        alerts: alertCount,
        results,
      },
      null,
      2
    )
  );
  console.log(`✅ Results saved to: ${outputPath}\n`);
  
  if (alertCount > 0) {
    console.log(`⚠️  ${alertCount} contract(s) not found:\n`);
    results.filter((r) => r.alert).forEach((r) => {
      console.log(`  - ${r.name}: ${r.address}`);
    });
    console.log("");
  }
  
  if (watch) {
    const pollSec = 300; // 5 minutes
    console.log(`Watch mode: checking again in ${pollSec}s...\n`);
    setTimeout(() => main(), pollSec * 1000);
  }
}

main().catch((e) => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});
