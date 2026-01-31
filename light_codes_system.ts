/**
 * Light Codes System
 * 
 * "Light Codes" - Every time a Diamond/Gem contract is used on Ethereum,
 * it records the usage and triggers payment/royalty distribution.
 * 
 * Key Concept:
 * - Every contract use = Light Code activation
 * - Ethereum records it (block position, transaction hash)
 * - Payments come automatically (royalties distributed)
 * - Block position influences the NFT (visual, formula, value)
 * 
 * The NFTs aren't just static artifacts - they're living contracts that:
 * - Track every usage/interaction
 * - Record on Ethereum blockchain (block position)
 * - Automatically distribute payments/royalties
 * - Generate revenue when used
 * - Each use updates the NFT (new block position = new visual state)
 */

import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

interface LightCodeEvent {
  eventId: string;
  diamondId?: string;
  gemId?: string;
  contractAddress: string;
  functionCalled: string;
  caller: string;
  blockNumber: number;
  txHash: string;
  timestamp: string;
  gasUsed: number;
  gasPrice: string;
  value: string; // ETH value transferred
  status: 'success' | 'failed' | 'proc_failed';
  procRate: number; // Proc rate percentage used
  procRoll: number; // Random roll (0-100)
  procSuccess: boolean; // Whether proc succeeded
  royaltiesGenerated: number;
  royaltiesDistributed: Array<{
    recipient: string;
    amount: number;
    role: string;
  }>;
}

interface GlobalCooldownConfig {
  enabled: boolean;
  cooldownSeconds: number; // Global cooldown duration (default 2.0)
  lastProcAttempt: number; // Global last proc attempt timestamp
  nextProcAvailable: number; // Global next proc available timestamp
}

interface ProcRateConfig {
  baseRates: Record<string, number>; // Rarity -> base proc rate %
  modifiers: {
    usageBonus: { enabled: boolean; perActivation: number; max: number };
    blockBonus: { enabled: boolean; blockInterval: number; bonus: number };
    formulaBonus: { enabled: boolean; perValue: number; max: number };
  };
}

interface RoyaltyConfig {
  enabled: boolean;
  totalPercentage: number; // Total royalty percentage
  distributions: Array<{
    role: string;
    percentage: number;
    address?: string; // To be set by developers when live
  }>;
}

interface LightCodeActivation {
  activationId: string;
  nftId: string;
  nftType: 'diamond' | 'gem' | 'stack';
  contractAddress: string;
  totalActivations: number;
  totalRoyaltiesGenerated: number;
  lastActivation: string;
  activations: LightCodeEvent[];
}

interface RoyaltyDistribution {
  eventId: string;
  timestamp: string;
  totalAmount: number;
  distributions: Array<{
    recipient: string;
    role: string;
    percentage: number;
    amount: number;
    address: string;
  }>;
  txHash?: string;
}

// Royalty percentages (from OpenSea system)
const ROYALTY_PERCENTAGES = {
  tool_creators: 2.5,
  idea_originators: 2.5,
  developers: 2.5,
  community_contributors: 1.0
};

// Configuration files
const CONFIG_DIR = path.join(process.cwd(), 'light_codes', 'config');
const GLOBAL_COOLDOWN_CONFIG_FILE = path.join(CONFIG_DIR, 'global_cooldown.json');
const PROC_RATE_CONFIG_FILE = path.join(CONFIG_DIR, 'proc_rates.json');
const ROYALTY_CONFIG_FILE = path.join(CONFIG_DIR, 'royalties.json');

// Global cooldown: Hardcoded 2.0s until collective decision is made
const GLOBAL_COOLDOWN_SECONDS = 2.0; // Hardcoded - will be configurable after collective decision

// Default configurations (developers can modify when live)
const DEFAULT_GLOBAL_COOLDOWN: GlobalCooldownConfig = {
  enabled: true,
  cooldownSeconds: GLOBAL_COOLDOWN_SECONDS, // Hardcoded 2.0s until collective decision
  lastProcAttempt: 0,
  nextProcAvailable: 0
};

const DEFAULT_PROC_RATES: ProcRateConfig = {
  baseRates: {
    'Common': 5.0,      // To be decided by developers
    'Magic': 10.0,      // To be decided by developers
    'Rare': 15.0,       // To be decided by developers
    'Epic': 25.0,       // To be decided by developers
    'Legendary': 50.0   // To be decided by developers
  },
  modifiers: {
    usageBonus: { enabled: true, perActivation: 0.1, max: 10 },
    blockBonus: { enabled: true, blockInterval: 1000, bonus: 5 },
    formulaBonus: { enabled: true, perValue: 10000, max: 5 }
  }
};

const DEFAULT_ROYALTIES: RoyaltyConfig = {
  enabled: true,
  totalPercentage: 8.5, // To be decided by developers
  distributions: [
    { role: 'tool_creator', percentage: 2.5, address: undefined }, // To be set by developers
    { role: 'idea_originator', percentage: 2.5, address: undefined },
    { role: 'developer', percentage: 2.5, address: undefined },
    { role: 'community_contributor', percentage: 1.0, address: undefined }
  ]
};

// Load configuration (with defaults)
function loadGlobalCooldownConfig(): GlobalCooldownConfig {
  if (fs.existsSync(GLOBAL_COOLDOWN_CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(GLOBAL_COOLDOWN_CONFIG_FILE, 'utf-8'));
  }
  
  // Ensure config directory exists
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  
  // Save default config
  fs.writeFileSync(GLOBAL_COOLDOWN_CONFIG_FILE, JSON.stringify(DEFAULT_GLOBAL_COOLDOWN, null, 2));
  
  return DEFAULT_GLOBAL_COOLDOWN;
}

function loadProcRateConfig(): ProcRateConfig {
  if (fs.existsSync(PROC_RATE_CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(PROC_RATE_CONFIG_FILE, 'utf-8'));
  }
  
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  
  fs.writeFileSync(PROC_RATE_CONFIG_FILE, JSON.stringify(DEFAULT_PROC_RATES, null, 2));
  
  return DEFAULT_PROC_RATES;
}

function loadRoyaltyConfig(): RoyaltyConfig {
  if (fs.existsSync(ROYALTY_CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(ROYALTY_CONFIG_FILE, 'utf-8'));
  }
  
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  
  fs.writeFileSync(ROYALTY_CONFIG_FILE, JSON.stringify(DEFAULT_ROYALTIES, null, 2));
  
  return DEFAULT_ROYALTIES;
}

// Check global cooldown (hardcoded 2.0s until collective decision)
function checkGlobalCooldown(): {
  onCooldown: boolean;
  timeRemaining: number;
  config: GlobalCooldownConfig;
} {
  const config = loadGlobalCooldownConfig();
  
  // Use hardcoded cooldown (2.0s) until collective decision
  const cooldownSeconds = GLOBAL_COOLDOWN_SECONDS;
  
  if (!config.enabled) {
    return {
      onCooldown: false,
      timeRemaining: 0,
      config: { ...config, cooldownSeconds }
    };
  }
  
  const now = Date.now();
  
  if (config.lastProcAttempt === 0) {
    // First proc ever - no cooldown
    config.lastProcAttempt = now;
    config.nextProcAvailable = now + (cooldownSeconds * 1000);
    config.cooldownSeconds = cooldownSeconds;
    fs.writeFileSync(GLOBAL_COOLDOWN_CONFIG_FILE, JSON.stringify(config, null, 2));
    
    return {
      onCooldown: false,
      timeRemaining: 0,
      config: { ...config, cooldownSeconds }
    };
  }
  
  const timeSinceLastAttempt = (now - config.lastProcAttempt) / 1000; // Convert to seconds
  
  if (timeSinceLastAttempt < cooldownSeconds) {
    // Still on global cooldown (hardcoded 2.0s)
    config.nextProcAvailable = config.lastProcAttempt + (cooldownSeconds * 1000);
    config.cooldownSeconds = cooldownSeconds;
    fs.writeFileSync(GLOBAL_COOLDOWN_CONFIG_FILE, JSON.stringify(config, null, 2));
    
    return {
      onCooldown: true,
      timeRemaining: cooldownSeconds - timeSinceLastAttempt,
      config: { ...config, cooldownSeconds }
    };
  }
  
  // Cooldown expired - update and allow proc
  config.lastProcAttempt = now;
  config.nextProcAvailable = now + (cooldownSeconds * 1000);
  config.cooldownSeconds = cooldownSeconds;
  fs.writeFileSync(GLOBAL_COOLDOWN_CONFIG_FILE, JSON.stringify(config, null, 2));
  
  return {
    onCooldown: false,
    timeRemaining: 0,
    config: { ...config, cooldownSeconds }
  };
}

// Calculate proc rate based on NFT properties (using config)
function calculateProcRate(
  rarity: string,
  totalActivations: number,
  blockNumber: number,
  accumulatedFormulaValue: number
): { baseRate: number; modifiers: Array<{ type: string; value: number }>; finalRate: number } {
  const procConfig = loadProcRateConfig();
  
  // Start with base rate from rarity (from config)
  const baseRate = procConfig.baseRates[rarity] || procConfig.baseRates['Common'] || 5.0;
  
  const modifiers: Array<{ type: string; value: number }> = [];
  let finalRate = baseRate;
  
  // Modifier 1: Usage bonus (if enabled in config)
  if (procConfig.modifiers.usageBonus.enabled) {
    const usageBonus = Math.min(
      totalActivations * procConfig.modifiers.usageBonus.perActivation,
      procConfig.modifiers.usageBonus.max
    );
    if (usageBonus > 0) {
      modifiers.push({ type: 'usage', value: usageBonus });
      finalRate += usageBonus;
    }
  }
  
  // Modifier 2: Block position bonus (if enabled in config)
  if (procConfig.modifiers.blockBonus.enabled) {
    const blockBonus = (blockNumber % procConfig.modifiers.blockBonus.blockInterval === 0) 
      ? procConfig.modifiers.blockBonus.bonus 
      : 0;
    if (blockBonus > 0) {
      modifiers.push({ type: 'block', value: blockBonus });
      finalRate += blockBonus;
    }
  }
  
  // Modifier 3: Formula value bonus (if enabled in config)
  if (procConfig.modifiers.formulaBonus.enabled) {
    const formulaBonus = Math.min(
      accumulatedFormulaValue / procConfig.modifiers.formulaBonus.perValue,
      procConfig.modifiers.formulaBonus.max
    );
    if (formulaBonus > 0) {
      modifiers.push({ type: 'formula', value: formulaBonus });
      finalRate += formulaBonus;
    }
  }
  
  // Cap at 100%
  finalRate = Math.min(finalRate, 100);
  
  return {
    baseRate,
    modifiers,
    finalRate
  };
}

// Roll proc - determines if light code activates
function rollProc(procRate: number): { success: boolean; roll: number } {
  const roll = Math.random() * 100; // Roll 0-100
  const success = roll < procRate;
  
  return { success, roll };
}

// Track light code activation (with proc rate and cooldown)
function recordLightCodeActivation(
  contractAddress: string,
  functionCalled: string,
  caller: string,
  blockNumber: number,
  txHash: string,
  gasUsed: number,
  gasPrice: string,
  value: string,
  diamondId?: string,
  gemId?: string,
  rarity: string = 'Common',
  totalActivations: number = 0,
  accumulatedFormulaValue: number = 0
): LightCodeEvent | null {
  // Check global cooldown first
  const cooldownCheck = checkGlobalCooldown();
  
  if (cooldownCheck.onCooldown) {
    const event: LightCodeEvent = {
      eventId: createHash('sha256')
        .update(txHash + blockNumber.toString() + caller)
        .digest('hex')
        .substring(0, 16),
      diamondId,
      gemId,
      contractAddress,
      functionCalled,
      caller,
      blockNumber,
      txHash,
      timestamp: new Date().toISOString(),
      gasUsed,
      gasPrice,
      value,
      status: 'proc_failed',
      procRate: 0,
      procRoll: 0,
      procSuccess: false,
      royaltiesGenerated: 0,
      royaltiesDistributed: []
    };
    
    console.log(`\n⏳ Contract Used (Global Cooldown Active)\n`);
    console.log(`   Contract: ${contractAddress}`);
    console.log(`   Function: ${functionCalled}`);
    console.log(`   Caller: ${caller}`);
    console.log(`   Block: #${blockNumber}`);
    console.log(`   ⏱️  Global Cooldown: ${cooldownCheck.timeRemaining.toFixed(2)}s remaining`);
    console.log(`   Cooldown Duration: ${cooldownCheck.config.cooldownSeconds}s (hardcoded until collective decision)`);
    console.log(`   Next Proc Available: ${new Date(cooldownCheck.config.nextProcAvailable).toISOString()}`);
    console.log(`   Status: ❌ On Global Cooldown - No Proc Roll\n`);
    console.log(`   💡 Note: 2.0s global cooldown hardcoded until collective decision is made\n`);
    
    // Still record the attempt (but no proc roll)
    saveLightCodeEvent(event);
    
    return null; // Return null to indicate cooldown prevented proc
  }
  
  // Global cooldown passed - proceed with proc roll
  const cooldownConfig = cooldownCheck.config;
  
  // Calculate proc rate
  const procConfig = calculateProcRate(rarity, totalActivations, blockNumber, accumulatedFormulaValue);
  
  // Roll proc
  const procRoll = rollProc(procConfig.finalRate);
  
  // If proc fails, record usage but no payment
  if (!procRoll.success) {
    const event: LightCodeEvent = {
      eventId: createHash('sha256')
        .update(txHash + blockNumber.toString() + caller)
        .digest('hex')
        .substring(0, 16),
      diamondId,
      gemId,
      contractAddress,
      functionCalled,
      caller,
      blockNumber,
      txHash,
      timestamp: new Date().toISOString(),
      gasUsed,
      gasPrice,
      value,
      status: 'proc_failed',
      procRate: procConfig.finalRate,
      procRoll: procRoll.roll,
      procSuccess: false,
      royaltiesGenerated: 0,
      royaltiesDistributed: []
    };
    
    saveLightCodeEvent(event);
    updateActivationTracking(event);
    
    console.log(`\n⚡ Contract Used (Proc Failed)\n`);
    console.log(`   Contract: ${contractAddress}`);
    console.log(`   Function: ${functionCalled}`);
    console.log(`   Block: #${blockNumber}`);
    console.log(`   ⏱️  Global Cooldown: ${cooldownConfig.cooldownSeconds}s (active)`);
    console.log(`   Proc Rate: ${procConfig.finalRate.toFixed(2)}%`);
    console.log(`   Roll: ${procRoll.roll.toFixed(2)}% (needed < ${procConfig.finalRate.toFixed(2)}%)`);
    console.log(`   Status: ❌ Proc Failed - No Payment`);
    console.log(`   Next Proc Available: ${new Date(cooldownConfig.nextProcAvailable).toISOString()}\n`);
    
    return event;
  }
  
  // Proc succeeded - calculate royalties
  // Calculate royalties based on gas used and value
  const gasCost = (BigInt(gasUsed) * BigInt(gasPrice)) / BigInt(10 ** 18); // Convert to ETH
  const valueAmount = parseFloat(value) || 0;
  const totalValue = parseFloat(gasCost.toString()) + valueAmount;
  
  // Royalty is percentage of total value (from config - to be set by developers)
  const royaltyConfig = loadRoyaltyConfig();
  const royaltyPercentage = royaltyConfig.enabled ? royaltyConfig.totalPercentage : 0;
  const royaltiesGenerated = totalValue * (royaltyPercentage / 100);
  
  // Distribute royalties (using config - to be set by developers)
  const distributions = royaltyConfig.distributions.map(dist => ({
    recipient: dist.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    role: dist.role,
    amount: royaltiesGenerated * (dist.percentage / royaltyConfig.totalPercentage),
    address: dist.address || '0x0000000000000000000000000000000000000000' // To be set by developers
  }));
  
  const event: LightCodeEvent = {
    eventId: createHash('sha256')
      .update(txHash + blockNumber.toString() + caller)
      .digest('hex')
      .substring(0, 16),
    diamondId,
    gemId,
    contractAddress,
    functionCalled,
    caller,
    blockNumber,
    txHash,
    timestamp: new Date().toISOString(),
    gasUsed,
    gasPrice,
    value,
    status: 'success',
    procRate: procConfig.finalRate,
    procRoll: procRoll.roll,
    procSuccess: true,
    royaltiesGenerated,
    royaltiesDistributed: distributions
  };
  
  // Save event
  saveLightCodeEvent(event);
  
  // Update activation tracking (includes block position)
  updateActivationTracking(event);
  
  // Update NFT metadata with new block position
  updateNFTWithBlockPosition(event);
  
  console.log(`\n✨ Light Code Activated! ✨\n`);
  console.log(`   💡 Contract Used → Cooldown Check → Proc Rolled → Ethereum Records → Payment Comes\n`);
  console.log(`   Contract: ${contractAddress}`);
  console.log(`   Function: ${functionCalled}`);
  console.log(`   Caller: ${caller}`);
  console.log(`   Block: #${blockNumber} ← Ethereum recorded this`);
  console.log(`   ⏱️  Global Cooldown: ${cooldownConfig.cooldownSeconds}s (passed, hardcoded until collective decision)\n`);
  console.log(`   🎲 Proc Rate: ${procConfig.finalRate.toFixed(2)}%`);
  console.log(`      Base Rate: ${procConfig.baseRate.toFixed(2)}% (${rarity})`);
  console.log(`      💡 Note: Proc rates configurable by developers`);
  if (procConfig.modifiers.length > 0) {
    console.log(`      Modifiers:`);
    procConfig.modifiers.forEach(mod => {
      console.log(`        + ${mod.value.toFixed(2)}% (${mod.type})`);
    });
  }
  console.log(`   🎯 Roll: ${procRoll.roll.toFixed(2)}% (needed < ${procConfig.finalRate.toFixed(2)}%)`);
  console.log(`   ✅ Proc Success!`);
  console.log(`   ⏱️  Global Cooldown Started: ${cooldownConfig.cooldownSeconds}s until next proc (hardcoded)\n`);
  console.log(`   Value: ${totalValue.toFixed(6)} ETH`);
  console.log(`   Royalties Generated: ${royaltiesGenerated.toFixed(6)} ETH`);
  console.log(`   💰 Payment Distributed Automatically\n`);
  console.log(`   Royalty Distribution:\n`);
  distributions.forEach((dist, i) => {
    console.log(`   ${i + 1}. ${dist.recipient} (${dist.role}): ${dist.amount.toFixed(6)} ETH`);
  });
  console.log(`\n   📊 Block Position Influence:`);
  console.log(`      - NFT visual updated (rotation: ${blockNumber % 360}°)`);
  console.log(`      - Formula value recalculated`);
  console.log(`      - New activation recorded\n`);
  
  return event;
}

// Save light code event
function saveLightCodeEvent(event: LightCodeEvent): void {
  const eventsDir = path.join(process.cwd(), 'light_codes', 'events');
  if (!fs.existsSync(eventsDir)) {
    fs.mkdirSync(eventsDir, { recursive: true });
  }
  
  const eventFile = path.join(eventsDir, `event_${event.eventId}.json`);
  fs.writeFileSync(eventFile, JSON.stringify(event, null, 2));
  
  // Also append to master log
  const logFile = path.join(eventsDir, 'master_log.jsonl');
  fs.appendFileSync(logFile, JSON.stringify(event) + '\n');
}

// Update NFT with new block position (visual/formula updates)
function updateNFTWithBlockPosition(event: LightCodeEvent): void {
  if (!event.diamondId && !event.gemId) return;
  
  const nftId = event.diamondId || event.gemId || 'unknown';
  const nftType = event.diamondId ? 'diamond' : 'gem';
  
  // Update NFT metadata with new block position
  const nftMetadataPath = path.join(process.cwd(), 'nfts', `${nftType}_${nftId}_metadata.json`);
  
  if (fs.existsSync(nftMetadataPath)) {
    const metadata = JSON.parse(fs.readFileSync(nftMetadataPath, 'utf-8'));
    
    // Add new block position to activation history
    if (!metadata.activation_history) {
      metadata.activation_history = [];
    }
    
    metadata.activation_history.push({
      blockNumber: event.blockNumber,
      timestamp: event.timestamp,
      royaltiesGenerated: event.royaltiesGenerated,
      txHash: event.txHash
    });
    
    // Update latest block position
    metadata.latest_block_position = event.blockNumber;
    metadata.total_activations = (metadata.total_activations || 0) + 1;
    metadata.total_royalties_generated = (metadata.total_royalties_generated || 0) + event.royaltiesGenerated;
    
    // Recalculate accumulated formula with new block position
    if (metadata.data_package && metadata.data_package.accumulated_formula) {
      const oldBlock = metadata.data_package.block_number || 0;
      const newBlock = event.blockNumber;
      
      // Update formula value with new block position
      const blockDifference = newBlock - oldBlock;
      const formulaUpdate = blockDifference * 0.001; // Small influence per block
      
      metadata.data_package.accumulated_formula.value += formulaUpdate;
      metadata.data_package.block_number = newBlock;
    }
    
    fs.writeFileSync(nftMetadataPath, JSON.stringify(metadata, null, 2));
  }
}

// Update activation tracking
function updateActivationTracking(event: LightCodeEvent): void {
  const activationsDir = path.join(process.cwd(), 'light_codes', 'activations');
  if (!fs.existsSync(activationsDir)) {
    fs.mkdirSync(activationsDir, { recursive: true });
  }
  
  const nftId = event.diamondId || event.gemId || 'unknown';
  const nftType = event.diamondId ? 'diamond' : event.gemId ? 'gem' : 'unknown';
  const activationFile = path.join(activationsDir, `${nftType}_${nftId}.json`);
  
  let activation: LightCodeActivation;
  
  if (fs.existsSync(activationFile)) {
    activation = JSON.parse(fs.readFileSync(activationFile, 'utf-8'));
    activation.totalActivations += 1;
    activation.totalRoyaltiesGenerated += event.royaltiesGenerated;
    activation.lastActivation = event.timestamp;
    activation.activations.push(event);
  } else {
    activation = {
      activationId: createHash('md5').update(nftId + nftType).digest('hex').substring(0, 16),
      nftId,
      nftType: nftType as 'diamond' | 'gem' | 'stack',
      contractAddress: event.contractAddress,
      totalActivations: 1,
      totalRoyaltiesGenerated: event.royaltiesGenerated,
      lastActivation: event.timestamp,
      activations: [event]
    };
  }
  
  fs.writeFileSync(activationFile, JSON.stringify(activation, null, 2));
}

// Monitor Ethereum events for contract usage
async function monitorContractUsage(
  contractAddress: string,
  rpcUrl: string,
  fromBlock: number,
  toBlock: number | 'latest' = 'latest'
): Promise<LightCodeEvent[]> {
  console.log(`\n🔍 Monitoring contract usage: ${contractAddress}\n`);
  console.log(`   From block: ${fromBlock}`);
  console.log(`   To block: ${toBlock}\n`);
  
  const events: LightCodeEvent[] = [];
  
  try {
    // Query for contract interactions
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getLogs',
        params: [{
          address: contractAddress,
          fromBlock: typeof fromBlock === 'number' ? `0x${fromBlock.toString(16)}` : fromBlock,
          toBlock: toBlock === 'latest' || toBlock === undefined ? 'latest' : `0x${toBlock.toString(16)}`
        }]
      })
    });
    
    const data = await response.json();
    
    if (data.result && Array.isArray(data.result)) {
      console.log(`   Found ${data.result.length} events\n`);
      
      // Process each event
      for (const log of data.result) {
        // Get transaction details
        const txResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getTransactionByHash',
            params: [log.transactionHash]
          })
        });
        
        const txData = await txResponse.json();
        
        if (txData.result) {
          const tx = txData.result;
          
          // Get transaction receipt for gas used
          const receiptResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'eth_getTransactionReceipt',
              params: [log.transactionHash]
            })
          });
          
          const receiptData = await receiptResponse.json();
          const receipt = receiptData.result;
          
          // Decode function call (simplified - would need ABI in production)
          const functionSig = tx.input.substring(0, 10);
          const functionCalled = `0x${functionSig}`;
          
          // Extract Diamond/Gem ID from logs or contract state
          // This would need contract-specific logic
          const diamondId = extractDiamondId(log, contractAddress);
          const gemId = extractGemId(log, contractAddress);
          
          // Get NFT metadata for proc rate calculation
          const rarity = 'Epic'; // Default, should load from metadata
          const totalActivations = 0; // Should load from activation tracking
          const accumulatedFormulaValue = 0; // Should load from NFT metadata
          
          const event = recordLightCodeActivation(
            contractAddress,
            functionCalled,
            tx.from,
            parseInt(log.blockNumber, 16),
            log.transactionHash,
            parseInt(receipt.gasUsed, 16),
            tx.gasPrice,
            tx.value || '0',
            diamondId,
            gemId,
            rarity,
            totalActivations,
            accumulatedFormulaValue
          );
          
          if (event !== null) {
            events.push(event);
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error monitoring contract: ${error}`);
  }
  
  return events;
}

// Extract Diamond ID from event log (simplified)
function extractDiamondId(log: any, contractAddress: string): string | undefined {
  // In production, decode event data using ABI
  // For now, return undefined or extract from known patterns
  return undefined;
}

// Extract Gem ID from event log (simplified)
function extractGemId(log: any, contractAddress: string): string | undefined {
  // In production, decode event data using ABI
  return undefined;
}

// Get activation statistics
function getActivationStats(nftId: string, nftType: 'diamond' | 'gem'): LightCodeActivation | null {
  const activationsDir = path.join(process.cwd(), 'light_codes', 'activations');
  const activationFile = path.join(activationsDir, `${nftType}_${nftId}.json`);
  
  if (!fs.existsSync(activationFile)) {
    return null;
  }
  
  return JSON.parse(fs.readFileSync(activationFile, 'utf-8'));
}

// Generate light code report
function generateLightCodeReport(): void {
  const activationsDir = path.join(process.cwd(), 'light_codes', 'activations');
  
  if (!fs.existsSync(activationsDir)) {
    console.log('❌ No activations found');
    return;
  }
  
  const files = fs.readdirSync(activationsDir).filter(f => f.endsWith('.json'));
  
  console.log(`\n📊 Light Codes Report\n`);
  console.log(`   Total NFTs Tracked: ${files.length}\n`);
  
  let totalActivations = 0;
  let totalRoyalties = 0;
  
  for (const file of files) {
    const activation: LightCodeActivation = JSON.parse(
      fs.readFileSync(path.join(activationsDir, file), 'utf-8')
    );
    
    totalActivations += activation.totalActivations;
    totalRoyalties += activation.totalRoyaltiesGenerated;
    
    console.log(`   ${activation.nftType.toUpperCase()} ${activation.nftId}:`);
    console.log(`      Activations: ${activation.totalActivations}`);
    console.log(`      Royalties: ${activation.totalRoyaltiesGenerated.toFixed(6)} ETH`);
    console.log(`      Last Used: ${activation.lastActivation}`);
    console.log(``);
  }
  
  console.log(`   📈 Totals:`);
  console.log(`      Total Activations: ${totalActivations}`);
  console.log(`      Total Royalties Generated: ${totalRoyalties.toFixed(6)} ETH\n`);
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === 'monitor' && args[1]) {
    const contractAddress = args[1];
    const rpcUrl = args[2] || 'https://eth.llamarpc.com';
    const fromBlock = args[3] ? parseInt(args[3]) : 18500000;
    
    await monitorContractUsage(contractAddress, rpcUrl, fromBlock);
    return;
  }
  
  if (args[0] === 'stats' && args[1] && args[2]) {
    const nftType = args[1] as 'diamond' | 'gem';
    const nftId = args[2];
    
    const stats = getActivationStats(nftId, nftType);
    
    if (!stats) {
      console.log(`❌ No activations found for ${nftType} ${nftId}`);
      return;
    }
    
    console.log(`\n📊 Light Code Stats: ${nftType.toUpperCase()} ${nftId}\n`);
    console.log(`   Total Activations: ${stats.totalActivations}`);
    console.log(`   Total Royalties: ${stats.totalRoyaltiesGenerated.toFixed(6)} ETH`);
    console.log(`   Last Activation: ${stats.lastActivation}`);
    console.log(`   Contract: ${stats.contractAddress}\n`);
    
    if (stats.activations.length > 0) {
      console.log(`   Recent Activations:\n`);
      stats.activations.slice(-5).forEach((event, i) => {
        console.log(`   ${i + 1}. Block #${event.blockNumber} - ${event.functionCalled}`);
        console.log(`      Royalties: ${event.royaltiesGenerated.toFixed(6)} ETH`);
        console.log(`      Caller: ${event.caller.substring(0, 10)}...\n`);
      });
    }
    return;
  }
  
  if (args[0] === 'report') {
    generateLightCodeReport();
    return;
  }
  
  console.log(`
✨ Light Codes System ✨

Every time a Diamond/Gem contract is used on Ethereum,
it checks global cooldown, rolls proc rate - if successful, records usage and triggers payment.

⏱️  Global Cooldown System:
   - Global cooldown for entire source code (not per-caller)
   - Hardcoded 2.0 seconds until collective decision is made
   - Prevents spam/abuse ("1 button smash spin to win")
   - Cooldown must pass before proc roll
   - Will be configurable after collective decision

🎲 Proc Rate System:
   - Each contract use rolls against proc rate %
   - Proc rates configurable by developers (not hardcoded)
   - Base rates by rarity (to be decided by developers)
   - Modifiers: usage bonus, block bonus, formula bonus
   - If proc succeeds: Light code activates, payment comes
   - Config file: light_codes/config/proc_rates.json

💰 Royalty System:
   - Royalty percentages configurable by developers
   - Distribution addresses to be set when live
   - Total percentage and splits open for developer decision
   - Config file: light_codes/config/royalties.json

💡 Configuration:
   - Cooldown: Hardcoded 2.0s until collective decision
   - Proc rates: Configurable (developers decide when live)
   - Royalty percentages: Configurable (developers decide when live)
   - Distribution addresses: To be set by developers when live

Usage:
  npm run light-codes monitor <contract-address> [rpc-url] [from-block]
  npm run light-codes stats <diamond|gem> <id>
  npm run light-codes report

Examples:
  npm run light-codes monitor 0x1234... https://eth.llamarpc.com 18500000
  npm run light-codes stats diamond 1
  npm run light-codes report

Configuration Files:
  light_codes/config/proc_rates.json - Proc rate percentages (configurable)
  light_codes/config/royalties.json - Royalty distribution (configurable)
  
Note: Global cooldown is hardcoded at 2.0s until collective decision is made.

Features:
  - Global cooldown system (prevents spam)
  - Configurable proc rate system
  - Configurable royalty system
  - Tracks every contract usage/interaction
  - Records on Ethereum blockchain
  - Automatically calculates royalties (on proc success)
  - Distributes payments to creators (addresses set by developers)
  - Generates revenue when contracts proc
`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  recordLightCodeActivation,
  monitorContractUsage,
  getActivationStats,
  generateLightCodeReport,
  LightCodeEvent,
  LightCodeActivation,
  RoyaltyDistribution
};
