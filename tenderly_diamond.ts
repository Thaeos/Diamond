/**
 * Tenderly Diamond Integration — Verify, Simulate, and Monitor Diamond Contracts
 * 
 * Specifically designed for EIP-2535 Diamond Standard contracts:
 * - Verify Diamond + Facets
 * - Simulate DiamondCut operations
 * - Monitor facet upgrades
 * - Debug Diamond transactions
 * - Track Diamond network across 65 repos
 * 
 * Usage:
 *   npm run tenderly-diamond verify -- <diamondAddress> [chainId]
 *   npm run tenderly-diamond simulate-cut -- <diamondAddress> <facetAddress> <action> [chainId]
 *   npm run tenderly-diamond check-facets -- <diamondAddress> [chainId]
 *   npm run tenderly-diamond monitor -- <diamondAddress> [chainId]
 */

import * as fs from "fs";
import * as path from "path";

const TENDERLY_API_BASE = "https://api.tenderly.co/api/v1";
const DEFAULT_CHAIN_ID = 42161; // Arbitrum

// Diamond Standard function selectors
const DIAMOND_CUT_SELECTOR = "0x1f931c1c"; // diamondCut(FacetCut[] _diamondCut, address _init, bytes _calldata)
const FACETS_SELECTOR = "0x7a0ed627"; // facets()
const FACET_ADDRESSES_SELECTOR = "0x52ef6b2c"; // facetAddresses()
const FACET_FUNCTION_SELECTORS_SELECTOR = "0xadfca15e"; // facetFunctionSelectors(address _facet)

interface FacetCut {
  facetAddress: string;
  action: number; // 0 = Add, 1 = Replace, 2 = Remove
  functionSelectors: string[];
}

interface DiamondInfo {
  address: string;
  chainId: number;
  facets: string[];
  facetDetails: Array<{
    address: string;
    selectors: string[];
    verified: boolean;
  }>;
  verified: boolean;
}

/**
 * Check Tenderly configuration
 */
function checkTenderlyConfig(): { configured: boolean; error?: string } {
  const key = process.env.TENDERLY_ACCESS_KEY;
  const username = process.env.TENDERLY_USERNAME;
  const project = process.env.TENDERLY_PROJECT;
  
  if (!key || !username || !project) {
    return {
      configured: false,
      error: "Set TENDERLY_ACCESS_KEY, TENDERLY_USERNAME, and TENDERLY_PROJECT",
    };
  }
  
  return { configured: true };
}

/**
 * Get Diamond facets using Tenderly RPC
 */
export async function getDiamondFacets(diamondAddress: string, chainId: number): Promise<string[]> {
  const nodeKey = process.env.TENDERLY_NODE_ACCESS_KEY;
  if (!nodeKey) {
    throw new Error("TENDERLY_NODE_ACCESS_KEY required for RPC calls");
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
    if (result.error) {
      throw new Error(result.error.message || "RPC error");
    }
    
    // Decode address array (simplified - full decoding requires ABI parsing)
    const data = result.result || "0x";
    if (data === "0x" || data.length < 66) {
      return [];
    }
    
    // Basic decoding (full implementation would use proper ABI decoder)
    const hex = data.startsWith("0x") ? data.slice(2) : data;
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
  } catch (error: any) {
    console.warn(`  ⚠️  Error fetching facets: ${error.message}`);
    return [];
  }
}

/**
 * Get function selectors for a facet
 */
export async function getFacetSelectors(
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
export async function isContractVerified(
  contractAddress: string,
  chainId: number
): Promise<boolean> {
  const config = checkTenderlyConfig();
  if (!config.configured) {
    return false;
  }
  
  const key = process.env.TENDERLY_ACCESS_KEY!;
  const username = process.env.TENDERLY_USERNAME!;
  const project = process.env.TENDERLY_PROJECT!;
  
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
 * Simulate DiamondCut operation
 */
async function simulateDiamondCut(
  diamondAddress: string,
  facetCuts: FacetCut[],
  initAddress: string,
  initData: string,
  chainId: number,
  from: string
): Promise<{ success: boolean; gasUsed?: string; error?: string; trace?: any }> {
  const nodeKey = process.env.TENDERLY_NODE_ACCESS_KEY;
  const apiKey = process.env.TENDERLY_ACCESS_KEY;
  
  // Encode DiamondCut call (simplified - full encoding requires ABI encoder)
  // For now, we'll use a placeholder - in production, use ethers.js or viem
  const diamondCutData = DIAMOND_CUT_SELECTOR; // + encoded parameters
  
  if (nodeKey) {
    const networkSlug = getNetworkSlug(chainId);
    const url = `https://${networkSlug}.gateway.tenderly.co/${nodeKey}`;
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tenderly_simulateTransaction",
          params: [
            {
              from,
              to: diamondAddress,
              data: diamondCutData,
              value: "0x0",
            },
            "latest",
          ],
        }),
      });
      
      const result = await response.json() as {
        result?: {
          transaction?: { status?: boolean };
          gas_used?: string;
          trace?: any;
        };
        error?: { message?: string };
      };
      
      if (result.error) {
        return { success: false, error: result.error.message || "Simulation failed" };
      }
      
      const tx = result.result?.transaction;
      return {
        success: tx?.status ?? false,
        gasUsed: result.result?.gas_used,
        trace: result.result?.trace,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, error: "TENDERLY_NODE_ACCESS_KEY required" };
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
 * Verify Diamond contract and its facets
 */
async function verifyDiamond(diamondAddress: string, chainId: number): Promise<void> {
  console.log("\n🔷 Tenderly Diamond Verification\n");
  console.log(`Diamond Address: ${diamondAddress}`);
  console.log(`Chain ID: ${chainId}\n`);
  
  const config = checkTenderlyConfig();
  if (!config.configured) {
    console.log(`❌ ${config.error}`);
    console.log("\n💡 Set environment variables:");
    console.log("   export TENDERLY_ACCESS_KEY=your_key");
    console.log("   export TENDERLY_USERNAME=your_username");
    console.log("   export TENDERLY_PROJECT=your_project\n");
    return;
  }
  
  // Check if Diamond is verified
  console.log("Checking Diamond verification status...");
  const diamondVerified = await isContractVerified(diamondAddress, chainId);
  console.log(`  Diamond verified: ${diamondVerified ? "✅ Yes" : "❌ No"}\n`);
  
  // Get facets
  console.log("Fetching facets...");
  const facets = await getDiamondFacets(diamondAddress, chainId);
  console.log(`  Found ${facets.length} facet(s)\n`);
  
  if (facets.length === 0) {
    console.log("⚠️  No facets found. Diamond may not be deployed or Diamond Loupe not implemented.\n");
    return;
  }
  
  // Check each facet
  console.log("Checking facet verification...\n");
  const facetDetails: Array<{ address: string; selectors: string[]; verified: boolean }> = [];
  
  for (const facetAddress of facets) {
    console.log(`  Facet: ${facetAddress}`);
    const verified = await isContractVerified(facetAddress, chainId);
    const selectors = await getFacetSelectors(diamondAddress, facetAddress, chainId);
    
    facetDetails.push({
      address: facetAddress,
      selectors,
      verified,
    });
    
    console.log(`    Verified: ${verified ? "✅ Yes" : "❌ No"}`);
    console.log(`    Selectors: ${selectors.length}`);
    if (selectors.length > 0) {
      console.log(`    Sample: ${selectors.slice(0, 3).join(", ")}${selectors.length > 3 ? "..." : ""}`);
    }
    console.log("");
  }
  
  // Summary
  console.log("=" .repeat(70));
  console.log("📊 Verification Summary\n");
  console.log(`Diamond: ${diamondVerified ? "✅ Verified" : "❌ Not verified"}`);
  console.log(`Facets: ${facetDetails.filter((f) => f.verified).length}/${facetDetails.length} verified\n`);
  
  // Save results
  const results = {
    diamondAddress,
    chainId,
    diamondVerified,
    facets: facetDetails,
    timestamp: new Date().toISOString(),
  };
  
  const outputPath = path.join(process.cwd(), "tenderly_diamond_verification.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`✅ Results saved to: ${outputPath}\n`);
  
  // Instructions
  if (!diamondVerified || facetDetails.some((f) => !f.verified)) {
    console.log("💡 To verify contracts:");
    console.log("   1. Use Hardhat with @tenderly/hardhat-tenderly plugin");
    console.log("   2. Or use Tenderly CLI: tenderly verify <address> --network <network>");
    console.log("   3. Or use Tenderly Dashboard: https://dashboard.tenderly.co/\n");
  }
}

/**
 * Check facets and their status
 */
async function checkFacets(diamondAddress: string, chainId: number): Promise<void> {
  console.log("\n🔷 Diamond Facet Check\n");
  console.log(`Diamond: ${diamondAddress}`);
  console.log(`Chain: ${chainId}\n`);
  
  const facets = await getDiamondFacets(diamondAddress, chainId);
  
  if (facets.length === 0) {
    console.log("❌ No facets found\n");
    return;
  }
  
  console.log(`Found ${facets.length} facet(s):\n`);
  
  for (let i = 0; i < facets.length; i++) {
    const facetAddress = facets[i];
    console.log(`${i + 1}. ${facetAddress}`);
    
    const selectors = await getFacetSelectors(diamondAddress, facetAddress, chainId);
    console.log(`   Selectors: ${selectors.length}`);
    
    if (selectors.length > 0) {
      console.log(`   Functions:`);
      selectors.slice(0, 5).forEach((sel, idx) => {
        console.log(`     ${idx + 1}. ${sel}`);
      });
      if (selectors.length > 5) {
        console.log(`     ... and ${selectors.length - 5} more`);
      }
    }
    console.log("");
  }
}

/**
 * Monitor Diamond for changes
 */
async function monitorDiamond(diamondAddress: string, chainId: number): Promise<void> {
  console.log("\n🔷 Diamond Monitor\n");
  console.log(`Diamond: ${diamondAddress}`);
  console.log(`Chain: ${chainId}\n`);
  
  const statePath = path.join(process.cwd(), "tenderly_diamond_state.json");
  let previousState: { facets: string[]; timestamp: string } | null = null;
  
  if (fs.existsSync(statePath)) {
    try {
      previousState = JSON.parse(fs.readFileSync(statePath, "utf-8"));
    } catch {
      // Ignore
    }
  }
  
  const currentFacets = await getDiamondFacets(diamondAddress, chainId);
  const currentState = {
    facets: currentFacets,
    timestamp: new Date().toISOString(),
  };
  
  if (previousState) {
    const previousFacets = new Set(previousState.facets);
    const currentFacetsSet = new Set(currentFacets);
    
    const added = currentFacets.filter((f) => !previousFacets.has(f));
    const removed = previousState.facets.filter((f) => !currentFacetsSet.has(f));
    
    if (added.length > 0 || removed.length > 0) {
      console.log("🚨 DIAMOND CHANGES DETECTED!\n");
      if (added.length > 0) {
        console.log(`  ✅ Facets added: ${added.length}`);
        added.forEach((f) => console.log(`     ${f}`));
      }
      if (removed.length > 0) {
        console.log(`  ❌ Facets removed: ${removed.length}`);
        removed.forEach((f) => console.log(`     ${f}`));
      }
      console.log("");
    } else {
      console.log("✅ No changes detected\n");
    }
  } else {
    console.log(`📊 Current state: ${currentFacets.length} facet(s)\n`);
  }
  
  // Save state
  fs.writeFileSync(statePath, JSON.stringify(currentState, null, 2));
  console.log(`State saved to: ${statePath}\n`);
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const cmd = args[0];
  
  if (cmd === "verify") {
    const address = args[1];
    const chainId = args[2] ? parseInt(args[2], 10) : DEFAULT_CHAIN_ID;
    
    if (!address) {
      console.log("Usage: npm run tenderly-diamond verify -- <diamondAddress> [chainId]");
      process.exit(1);
      return;
    }
    
    await verifyDiamond(address, chainId);
    return;
  }
  
  if (cmd === "check-facets") {
    const address = args[1];
    const chainId = args[2] ? parseInt(args[2], 10) : DEFAULT_CHAIN_ID;
    
    if (!address) {
      console.log("Usage: npm run tenderly-diamond check-facets -- <diamondAddress> [chainId]");
      process.exit(1);
      return;
    }
    
    await checkFacets(address, chainId);
    return;
  }
  
  if (cmd === "monitor") {
    const address = args[1];
    const chainId = args[2] ? parseInt(args[2], 10) : DEFAULT_CHAIN_ID;
    
    if (!address) {
      console.log("Usage: npm run tenderly-diamond monitor -- <diamondAddress> [chainId]");
      process.exit(1);
      return;
    }
    
    await monitorDiamond(address, chainId);
    return;
  }
  
  console.log(`
🔷 Tenderly Diamond Integration

Usage:
  npm run tenderly-diamond verify -- <diamondAddress> [chainId]
  npm run tenderly-diamond check-facets -- <diamondAddress> [chainId]
  npm run tenderly-diamond monitor -- <diamondAddress> [chainId]

Environment:
  TENDERLY_ACCESS_KEY - API key for verification
  TENDERLY_USERNAME - Your Tenderly username
  TENDERLY_PROJECT - Your Tenderly project name
  TENDERLY_NODE_ACCESS_KEY - Node RPC key for simulation

Examples:
  npm run tenderly-diamond verify -- 0xf7993A8df974AD022647E63402d6315137c58ABf 42161
  npm run tenderly-diamond check-facets -- 0xf7993A8df974AD022647E63402d6315137c58ABf
  npm run tenderly-diamond monitor -- 0xf7993A8df974AD022647E63402d6315137c58ABf 42161
`);
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
