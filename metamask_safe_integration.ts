/**
 * MetaMask + Safe{Wallet} Integration for Treasure DAO
 * 
 * Architecture: WalletConnect Kit → MetaMask SDK → Safe{Wallet} → Diamond Framework
 * 
 * IMPORTANT: Safe{Wallet} doesn't work standalone!
 * - WalletConnect Kit provides wallet connection
 * - MetaMask SDK plugs into WalletConnect
 * - Safe{Wallet} gets injected through MetaMask
 * - Diamond contracts framework gets injected into Safe from diamond_deployments.json
 * 
 * Usage:
 *   npm run metamask-safe -- status --safe <address>
 *   npm run metamask-safe -- monitor
 *   npm run metamask-safe -- propose --safe <address> --to <contract> --data <hex>
 */

import { MetaMaskSDK } from "@metamask/sdk";
import * as fs from "fs";
import * as path from "path";

// WalletConnect Kit integration - MetaMask SDK plugs into WalletConnect
// Safe{Wallet} gets injected through MetaMask
// Diamond framework gets injected into Safe from diamond_deployments.json

const TREASURE_CONTRACTS_PATH = path.join(process.cwd(), "treasure_dao_contracts.json");
const SAFE_API_BASE = "https://safe-transaction-arbitrum.safe.global/api/v1";

interface SafeWallet {
  address: string;
  name: string;
  threshold: number;
  owners: string[];
  type: string;
}

interface TreasureContract {
  name: string;
  address: string;
  type: string;
  category: string;
  description: string;
}

interface SafeTransaction {
  to: string;
  value: string;
  data: string;
  operation: number; // 0 = CALL, 1 = DELEGATECALL
  safeTxGas: number;
  baseGas: number;
  gasPrice: string;
  gasToken: string;
  refundReceiver: string;
  nonce: number;
}

/**
 * Load Treasure DAO contracts
 */
function loadTreasureContracts(): {
  contracts: TreasureContract[];
  safeWallets: SafeWallet[];
} {
  if (!fs.existsSync(TREASURE_CONTRACTS_PATH)) {
    return { contracts: [], safeWallets: [] };
  }
  
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

/**
 * Initialize MetaMask SDK
 */
function initMetaMaskSDK(): MetaMaskSDK {
  const options = {
    shouldShimWeb3: false,
    dappMetadata: {
      name: "Treasure DAO Safe Integration",
      url: "https://treasure.lol",
    },
    checkInstallationImmediately: false,
  };
  
  return new MetaMaskSDK(options);
}

/**
 * Get Safe wallet info
 */
async function getSafeInfo(safeAddress: string): Promise<any> {
  try {
    const response = await fetch(`${SAFE_API_BASE}/safes/${safeAddress}/`);
    if (!response.ok) {
      throw new Error(`Safe API error: ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    throw new Error(`Failed to fetch Safe info: ${error.message}`);
  }
}

/**
 * Get Safe pending transactions
 */
async function getSafePendingTransactions(safeAddress: string): Promise<any[]> {
  try {
    const response = await fetch(`${SAFE_API_BASE}/safes/${safeAddress}/multisig-transactions/?executed=false`);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.results || [];
  } catch {
    return [];
  }
}

/**
 * Build Safe transaction
 */
function buildSafeTransaction(
  to: string,
  value: string,
  data: string,
  operation: number = 0
): SafeTransaction {
  return {
    to,
    value: value || "0",
    data: data || "0x",
    operation,
    safeTxGas: 0,
    baseGas: 0,
    gasPrice: "0",
    gasToken: "0x0000000000000000000000000000000000000000",
    refundReceiver: "0x0000000000000000000000000000000000000000",
    nonce: 0, // Will be set by Safe
  };
}

/**
 * Propose Safe transaction
 */
async function proposeSafeTransaction(
  safeAddress: string,
  transaction: SafeTransaction,
  sender: string
): Promise<string> {
  try {
    const response = await fetch(`${SAFE_API_BASE}/safes/${safeAddress}/multisig-transactions/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...transaction,
        sender,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to propose transaction: ${response.status} - ${error}`);
    }
    
    const result = await response.json();
    return result.safeTxHash || result.txHash || "unknown";
  } catch (error: any) {
    throw new Error(`Failed to propose Safe transaction: ${error.message}`);
  }
}

/**
 * Check Safe status
 */
async function checkSafeStatus(safeAddress: string): Promise<void> {
  console.log(`\n🔐 Safe Wallet Status\n`);
  console.log(`Safe Address: ${safeAddress}\n`);
  
  try {
    const info = await getSafeInfo(safeAddress);
    
    console.log("Safe Info:");
    console.log(`  Nonce: ${info.nonce}`);
    console.log(`  Threshold: ${info.threshold}/${info.owners?.length || 0} owners`);
    console.log(`  Master Copy: ${info.masterCopy}`);
    console.log(`  Version: ${info.version}`);
    console.log(`  Fallback Handler: ${info.fallbackHandler}`);
    console.log("");
    
    if (info.owners && info.owners.length > 0) {
      console.log("Owners:");
      info.owners.forEach((owner: string, i: number) => {
        console.log(`  ${i + 1}. ${owner}`);
      });
      console.log("");
    }
    
    const pending = await getSafePendingTransactions(safeAddress);
    console.log(`Pending Transactions: ${pending.length}`);
    if (pending.length > 0) {
      pending.slice(0, 5).forEach((tx: any, i: number) => {
        console.log(`  ${i + 1}. ${tx.safeTxHash || tx.txHash}`);
        console.log(`     To: ${tx.to}`);
        console.log(`     Value: ${tx.value} wei`);
        console.log(`     Confirmations: ${tx.confirmations?.length || 0}/${info.threshold}`);
      });
    }
    console.log("");
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}\n`);
  }
}

/**
 * Monitor Safe wallets
 */
async function monitorSafes(): Promise<void> {
  console.log("\n🔐 Monitoring Safe Wallets\n");
  console.log("=" .repeat(70));
  
  const { safeWallets, contracts } = loadTreasureContracts();
  
  if (safeWallets.length === 0) {
    console.log("No Safe wallets configured in treasure_dao_contracts.json\n");
    return;
  }
  
  console.log(`Found ${safeWallets.length} Safe wallet(s)\n`);
  
  for (const safe of safeWallets) {
    console.log(`Safe: ${safe.name}`);
    console.log(`  Address: ${safe.address}`);
    await checkSafeStatus(safe.address);
  }
  
  console.log("=" .repeat(70));
  console.log(`📊 Summary: ${safeWallets.length} Safe(s) monitored\n`);
}

/**
 * Propose transaction to Safe
 */
async function proposeTransaction(
  safeAddress: string,
  to: string,
  data: string,
  value: string = "0"
): Promise<void> {
  console.log("\n📝 Proposing Safe Transaction\n");
  console.log(`Safe: ${safeAddress}`);
  console.log(`To: ${to}`);
  console.log(`Data: ${data.substring(0, 20)}...`);
  console.log(`Value: ${value} wei\n`);
  
  // Initialize MetaMask
  const sdk = initMetaMaskSDK();
  await sdk.init();
  
  console.log("Connecting to MetaMask...");
  const accounts = await sdk.connect();
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts connected");
  }
  
  const sender = accounts[0];
  console.log(`Sender: ${sender}\n`);
  
  // Build transaction
  const transaction = buildSafeTransaction(to, value, data);
  
  // Get current nonce from Safe
  const safeInfo = await getSafeInfo(safeAddress);
  transaction.nonce = safeInfo.nonce;
  
  // Propose transaction
  console.log("Proposing transaction to Safe...");
  const txHash = await proposeSafeTransaction(safeAddress, transaction, sender);
  
  console.log(`✅ Transaction proposed!`);
  console.log(`   Safe Tx Hash: ${txHash}`);
  console.log(`   Safe: ${safeAddress}`);
  console.log(`   View on Safe: https://app.safe.global/arb1:${safeAddress}/transactions/${txHash}\n`);
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const cmd = args[0];
  
  if (cmd === "status") {
    const safeAddress = args[1];
    if (!safeAddress) {
      console.log("Usage: npm run metamask-safe -- status --safe <address>");
      process.exit(1);
      return;
    }
    await checkSafeStatus(safeAddress);
    return;
  }
  
  if (cmd === "monitor") {
    await monitorSafes();
    return;
  }
  
  if (cmd === "propose") {
    const safeIdx = args.indexOf("--safe");
    const toIdx = args.indexOf("--to");
    const dataIdx = args.indexOf("--data");
    const valueIdx = args.indexOf("--value");
    
    if (safeIdx === -1 || !args[safeIdx + 1] || toIdx === -1 || !args[toIdx + 1] || dataIdx === -1 || !args[dataIdx + 1]) {
      console.log("Usage: npm run metamask-safe -- propose --safe <address> --to <contract> --data <hex> [--value <wei>]");
      process.exit(1);
      return;
    }
    
    const safeAddress = args[safeIdx + 1];
    const to = args[toIdx + 1];
    const data = args[dataIdx + 1];
    const value = valueIdx >= 0 && args[valueIdx + 1] ? args[valueIdx + 1] : "0";
    
    await proposeTransaction(safeAddress, to, data, value);
    return;
  }
  
  console.log(`
🔐 MetaMask + Safe{Wallet} Integration for Treasure DAO

Usage:
  npm run metamask-safe -- status --safe <address>     # Check Safe status
  npm run metamask-safe -- monitor                     # Monitor all Safe wallets
  npm run metamask-safe -- propose --safe <address> --to <contract> --data <hex> [--value <wei>]

Examples:
  npm run metamask-safe -- status --safe 0x1234...
  npm run metamask-safe -- monitor
  npm run metamask-safe -- propose --safe 0x1234... --to 0x5678... --data 0xabcd...

Configuration:
  Edit treasure_dao_contracts.json to add Safe wallets and Treasure DAO contracts
`);
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
