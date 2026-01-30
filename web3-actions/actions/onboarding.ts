/**
 * Tenderly Web3 Action - Autonomous Agent Wallet Monitoring
 * 
 * Based on Tenderly Web3 Actions examples:
 * https://github.com/Tenderly/tenderly-examples
 * 
 * This action monitors:
 * - Diamond Contract events (DiamondCut, etc.)
 * - Safe{Wallet} transactions
 * - Primary wallet operations
 * - MetaMask SDK / WalletConnect interactions
 * 
 * Integrated with Autonomous Agent Wallet system.
 */

import { ActionFn, Context, Event, TransactionEvent } from "@tenderly/actions";
import { ethers } from "ethers";

// Diamond Contract ABI (simplified)
const DIAMOND_ABI = [
  "event DiamondCut(tuple(address,uint8,bytes4[])[],address,bytes)",
  "function diamondCut(tuple(address,uint8,bytes4[])[],address,bytes) external"
];

// Safe{Wallet} ABI (simplified)
const SAFE_ABI = [
  "event ExecutionSuccess(bytes32 txHash, uint256 payment)",
  "event ExecutionFailure(bytes32 txHash, uint256 payment)",
  "function execTransaction(address to, uint256 value, bytes data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, bytes signatures) external payable returns (bool success)"
];

// Primary wallet address
const PRIMARY_WALLET = "0x67A977eaD94C3b955ECbf27886CE9f62464423B2";
const PRIMARY_WALLET_MESSAGE = "There is nothing new under the sun. That which was will be, and that which will be already was when the end finds its beginning.";

/**
 * Onboarding action handler
 * 
 * This action is triggered by on-chain events and can:
 * - Monitor Diamond Contract upgrades
 * - Track Safe{Wallet} transactions
 * - Alert on critical operations
 * - Perform automated responses
 */
export const onboarding: ActionFn = async (context: Context, event: Event) => {
  console.log("Tenderly Web3 Action triggered");
  console.log("Event:", JSON.stringify(event, null, 2));
  
  // Handle transaction events
  if (event instanceof TransactionEvent) {
    await handleTransactionEvent(context, event);
  }
  
  // Handle other event types
  // Add custom logic here
};

/**
 * Handle transaction events
 */
async function handleTransactionEvent(context: Context, event: TransactionEvent) {
  console.log(`Transaction: ${event.hash}`);
  console.log(`From: ${event.from}`);
  console.log(`To: ${event.to}`);
  console.log(`Value: ${event.value}`);
  
  // Check if transaction involves primary wallet
  if (event.from.toLowerCase() === PRIMARY_WALLET.toLowerCase() || 
      event.to?.toLowerCase() === PRIMARY_WALLET.toLowerCase()) {
    console.log("⚠️  Transaction involves primary wallet");
    
    // Send alert or perform action
    await sendAlert(context, {
      type: "primary_wallet_transaction",
      txHash: event.hash,
      from: event.from,
      to: event.to,
      value: event.value.toString()
    });
  }
  
  // Check for Diamond Cut events
  if (event.logs) {
    for (const log of event.logs) {
      try {
        // Try Diamond Contract ABI
        const diamondIface = new ethers.Interface(DIAMOND_ABI);
        const diamondParsed = diamondIface.parseLog(log);
        
        if (diamondParsed && diamondParsed.name === "DiamondCut") {
          console.log("🔷 Diamond Cut detected!");
          await handleDiamondCut(context, event, diamondParsed);
          continue;
        }
        
        // Try Safe{Wallet} ABI
        const safeIface = new ethers.Interface(SAFE_ABI);
        const safeParsed = safeIface.parseLog(log);
        
        if (safeParsed && (safeParsed.name === "ExecutionSuccess" || safeParsed.name === "ExecutionFailure")) {
          console.log("🛡️  Safe{Wallet} execution detected!");
          await handleSafeExecution(context, event, safeParsed);
          continue;
        }
      } catch (e) {
        // Not a recognized event, continue
      }
    }
  }
}

/**
 * Handle Diamond Cut events
 */
async function handleDiamondCut(
  context: Context, 
  event: TransactionEvent,
  parsed: ethers.LogDescription
) {
  console.log("🔷 Diamond Cut Event Detected!");
  console.log("Diamond Cut Event Details:");
  console.log("  Facets:", parsed.args);
  console.log("  Transaction:", event.hash);
  console.log("  From:", event.from);
  console.log("  To:", event.to);
  
  // Perform actions on Diamond Cut
  await sendAlert(context, {
    type: "diamond_cut",
    txHash: event.hash,
    facets: parsed.args.toString(),
    from: event.from,
    to: event.to,
    blockNumber: event.blockNumber,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle Safe{Wallet} execution events
 */
async function handleSafeExecution(
  context: Context,
  event: TransactionEvent,
  parsed: ethers.LogDescription
) {
  console.log("🛡️  Safe{Wallet} Execution Detected!");
  console.log("  Success:", parsed.name === "ExecutionSuccess");
  console.log("  Transaction Hash:", parsed.args[0]);
  
  await sendAlert(context, {
    type: "safe_execution",
    txHash: event.hash,
    safeTxHash: parsed.args[0],
    success: parsed.name === "ExecutionSuccess",
    from: event.from,
    to: event.to
  });
}

/**
 * Send alert/notification
 */
async function sendAlert(context: Context, data: any) {
  console.log("Alert:", JSON.stringify(data, null, 2));
  
  // Add custom alerting logic here
  // - Send to webhook
  // - Send email
  // - Update database
  // - Trigger other actions
}
