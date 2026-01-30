/**
 * Tenderly Web3 Action - Onboarding Template
 * 
 * Based on Tenderly Web3 Actions examples:
 * https://github.com/Tenderly/tenderly-examples
 * 
 * This action monitors Diamond Contract events and performs automated actions.
 */

import { ActionFn, Context, Event, TransactionEvent } from "@tenderly/actions";
import { ethers } from "ethers";

// Diamond Contract ABI (simplified)
const DIAMOND_ABI = [
  "event DiamondCut(tuple(address,uint8,bytes4[])[],address,bytes)",
  "function diamondCut(tuple(address,uint8,bytes4[])[],address,bytes) external"
];

// Primary wallet address
const PRIMARY_WALLET = "0x67A977eaD94C3b955ECbf27886CE9f62464423B2";

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
        const iface = new ethers.Interface(DIAMOND_ABI);
        const parsed = iface.parseLog(log);
        
        if (parsed && parsed.name === "DiamondCut") {
          console.log("🔷 Diamond Cut detected!");
          await handleDiamondCut(context, event, parsed);
        }
      } catch (e) {
        // Not a Diamond Cut event, continue
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
  console.log("Diamond Cut Event Details:");
  console.log("  Facets:", parsed.args);
  
  // Perform actions on Diamond Cut
  await sendAlert(context, {
    type: "diamond_cut",
    txHash: event.hash,
    facets: parsed.args.toString()
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
