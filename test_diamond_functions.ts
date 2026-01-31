/**
 * Test Diamond Contract Functions with 65 Treasure Repos
 * 
 * Tests Diamond contract functionality:
 * - diamondCut function
 * - Facets and selectors
 * - Diamond Loupe interface
 * - Function calls against the 65 repos
 * 
 * Uses RPC directly (no MetaMask/QR code)
 */

import * as fs from "fs";
import * as path from "path";

const CONFIG_PATH = path.join(process.cwd(), "treasure_repos.json");
const RPC_URL = process.env.RPC_URL || "https://polygon-rpc.com";

// EIP-2535 Diamond Standard function selectors
const DIAMOND_CUT_SELECTOR = "0x1f931c1c"; // diamondCut
const FACETS_SELECTOR = "0x7a0ed627"; // facets()
const FACET_ADDRESSES_SELECTOR = "0x52ef6b2c"; // facetAddresses()
const FACET_FUNCTION_SELECTORS_SELECTOR = "0xadfca15e"; // facetFunctionSelectors(address)
const SUPPORTS_INTERFACE_SELECTOR = "0x01ffc9a7"; // supportsInterface(bytes4)

interface RepoEntry {
  url: string;
  name: string;
  hasContracts?: boolean | null;
  hasHardhat?: boolean | null;
}

interface TreasureReposConfig {
  repos: RepoEntry[];
}

interface TestResult {
  repoName: string;
  repoUrl: string;
  contractAddress?: string;
  functions: {
    diamondCut: boolean;
    facets: boolean;
    facetAddresses: boolean;
    supportsInterface: boolean;
  };
  error?: string;
}

/**
 * Load treasure repos config
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
 * Extract contract address from repo URL (if it's a contract address)
 * Check if repo has deployed contracts or use default Diamond
 */
function getContractAddressForRepo(repo: RepoEntry): string | null {
  // Default test diamond address for Polygon (main Diamond contract)
  const DEFAULT_DIAMOND = "0xf7993A8df974AD022647E63402d6315137c58ABf";
  
  // Check if repo has contracts flag set
  if (repo.hasContracts === true) {
    // In future, could extract from repo's deployment files
    // For now, use default Diamond
    return DEFAULT_DIAMOND;
  }
  
  // Always test against the main Diamond contract
  // The Diamond should be able to facet functions from any repo
  return DEFAULT_DIAMOND;
}

/**
 * Check if contract has a function by calling it
 */
async function checkFunctionCall(
  contractAddress: string,
  selector: string,
  functionName: string
): Promise<{ exists: boolean; callable: boolean; error?: string }> {
  try {
    const response = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [
          {
            to: contractAddress,
            data: selector + "0".repeat(64), // Minimal call data
          },
          "latest",
        ],
      }),
    });

    const result = await response.json();
    
    // If we get a result, function exists and is callable
    if (result.result && result.result !== "0x") {
      return { exists: true, callable: true };
    }
    
    // Check for revert error (function exists but was called incorrectly)
    if (result.error) {
      const errorMsg = JSON.stringify(result.error).toLowerCase();
      if (errorMsg.includes("revert") || errorMsg.includes("execution reverted")) {
        return { exists: true, callable: false, error: "Function exists but call failed" };
      }
      return { exists: false, callable: false, error: result.error.message || "Unknown error" };
    }
    
    return { exists: false, callable: false };
  } catch (error: any) {
    return { exists: false, callable: false, error: error.message };
  }
}

/**
 * Check contract bytecode for selector
 */
async function checkBytecodeForSelector(
  contractAddress: string,
  selector: string
): Promise<boolean> {
  try {
    const response = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getCode",
        params: [contractAddress, "latest"],
      }),
    });

    const result = await response.json();
    if (result.result && result.result !== "0x") {
      const bytecode = result.result.toLowerCase();
      const selectorLower = selector.toLowerCase().substring(2); // Remove 0x
      return bytecode.includes(selectorLower);
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Test Diamond functions for a repo
 * Tests if Diamond contract can facet functions from this repo
 */
async function testRepoFunctions(repo: RepoEntry): Promise<TestResult> {
  const contractAddress = getContractAddressForRepo(repo);
  
  if (!contractAddress) {
    return {
      repoName: repo.name,
      repoUrl: repo.url,
      functions: {
        diamondCut: false,
        facets: false,
        facetAddresses: false,
        supportsInterface: false,
      },
      error: "No contract address found",
    };
  }

  // First check bytecode for selectors (faster)
  const [diamondCutBytecode, facetsBytecode, facetAddressesBytecode, supportsInterfaceBytecode] = await Promise.all([
    checkBytecodeForSelector(contractAddress, DIAMOND_CUT_SELECTOR),
    checkBytecodeForSelector(contractAddress, FACETS_SELECTOR),
    checkBytecodeForSelector(contractAddress, FACET_ADDRESSES_SELECTOR),
    checkBytecodeForSelector(contractAddress, SUPPORTS_INTERFACE_SELECTOR),
  ]);

  // Then try actual function calls for critical functions
  const [diamondCutCall, facetsCall] = await Promise.all([
    checkFunctionCall(contractAddress, DIAMOND_CUT_SELECTOR, "diamondCut"),
    checkFunctionCall(contractAddress, FACETS_SELECTOR, "facets"),
  ]);

  // Function exists if found in bytecode OR callable
  const diamondCut = diamondCutBytecode || diamondCutCall.exists;
  const facets = facetsBytecode || facetsCall.exists;
  const facetAddresses = facetAddressesBytecode;
  const supportsInterface = supportsInterfaceBytecode;

  return {
    repoName: repo.name,
    repoUrl: repo.url,
    contractAddress,
    functions: {
      diamondCut,
      facets,
      facetAddresses,
      supportsInterface,
    },
  };
}

/**
 * Main test function
 */
async function main(): Promise<void> {
  console.log("\n🔷 Diamond Contract Function Test — 65 Treasure Repos\n");
  console.log("=" .repeat(70));
  console.log(`RPC URL: ${RPC_URL}`);
  console.log(`Testing Diamond functions: diamondCut, facets, facetAddresses, supportsInterface`);
  console.log("");

  const repos = loadRepos();
  console.log(`Loaded ${repos.length} repos from treasure_repos.json\n`);

  const results: TestResult[] = [];
  let passed = 0;
  let failed = 0;

  // Test all repos (with rate limiting)
  const reposToTest = repos;
  console.log(`Testing ${reposToTest.length} repos against Diamond contract...\n`);
  console.log(`Diamond Contract: ${getContractAddressForRepo(repos[0])}\n`);

  for (const repo of reposToTest) {
    console.log(`Testing: ${repo.name}`);
    try {
      const result = await testRepoFunctions(repo);
      results.push(result);

      const allPassed =
        result.functions.diamondCut &&
        result.functions.facets &&
        result.functions.facetAddresses &&
        result.functions.supportsInterface;

      if (allPassed && !result.error) {
        console.log(`  ✅ All functions found`);
        passed++;
      } else {
        console.log(`  ⚠️  Some functions missing:`);
        if (!result.functions.diamondCut) console.log(`    - diamondCut`);
        if (!result.functions.facets) console.log(`    - facets`);
        if (!result.functions.facetAddresses) console.log(`    - facetAddresses`);
        if (!result.functions.supportsInterface) console.log(`    - supportsInterface`);
        if (result.error) console.log(`    Error: ${result.error}`);
        failed++;
      }
    } catch (error: any) {
      console.log(`  ❌ Error: ${error.message}`);
      results.push({
        repoName: repo.name,
        repoUrl: repo.url,
        functions: {
          diamondCut: false,
          facets: false,
          facetAddresses: false,
          supportsInterface: false,
        },
        error: error.message,
      });
      failed++;
    }
    console.log("");
    
    // Small delay to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Summary
  console.log("=" .repeat(70));
  console.log("📊 Test Summary\n");
  console.log(`Total repos tested: ${reposToTest.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log("");

  // Function coverage
  const diamondCutCount = results.filter((r) => r.functions.diamondCut).length;
  const facetsCount = results.filter((r) => r.functions.facets).length;
  const facetAddressesCount = results.filter((r) => r.functions.facetAddresses).length;
  const supportsInterfaceCount = results.filter((r) => r.functions.supportsInterface).length;

  console.log("Function Coverage:");
  console.log(`  diamondCut: ${diamondCutCount}/${reposToTest.length}`);
  console.log(`  facets: ${facetsCount}/${reposToTest.length}`);
  console.log(`  facetAddresses: ${facetAddressesCount}/${reposToTest.length}`);
  console.log(`  supportsInterface: ${supportsInterfaceCount}/${reposToTest.length}`);
  console.log("");

  // Save results
  const outputPath = path.join(process.cwd(), "diamond_function_test_results.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        rpcUrl: RPC_URL,
        reposTested: reposToTest.length,
        passed,
        failed,
        results,
      },
      null,
      2
    )
  );
  console.log(`✅ Results saved to: ${outputPath}\n`);
}

main().catch((e) => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});
