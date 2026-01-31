/**
 * Diamond Cut Checker using Direct RPC (No Wallet Required)
 * Checks EIP-2535 Diamond Standard functionality including:
 * - diamondCut function existence
 * - Facets and their selectors
 * - Diamond Cut events
 * - Diamond Loupe interface
 */

import * as fs from 'fs';
import * as path from 'path';

const CWD = process.cwd();

// Default contract address (can be overridden via command line)
const DEFAULT_DIAMOND_ADDRESS = process.argv[2] || '0xf7993A8df974AD022647E63402d6315137c58ABf';
const CHAIN_ID = 137; // Polygon

// Load RPC endpoints from chainlist
let RPC_ENDPOINTS: string[] = ['https://polygon-rpc.com']; // Fallback

try {
  const chainlistData = JSON.parse(fs.readFileSync(path.join(CWD, 'chainlist_rpcs.json'), 'utf-8'));
  if (chainlistData[CHAIN_ID.toString()]?.rpc) {
    RPC_ENDPOINTS = chainlistData[CHAIN_ID.toString()].rpc;
    console.log(`📡 Loaded ${RPC_ENDPOINTS.length} RPC endpoints from chainlist\n`);
  }
} catch (error) {
  console.log('⚠️  Could not load chainlist RPCs, using default endpoint\n');
}

// EIP-2535 Diamond Standard function selectors (first 4 bytes of keccak256 hash)
const DIAMOND_CUT_SELECTOR = '0x1f931c1c'; // diamondCut(FacetCut[] _diamondCut, address _init, bytes _calldata)
const FACETS_SELECTOR = '0x7a0ed627'; // facets() returns (Facet[] memory facets_)
const FACET_FUNCTION_SELECTORS_SELECTOR = '0xadfca15e'; // facetFunctionSelectors(address _facet) returns (bytes4[] memory facetFunctionSelectors_)
const FACET_ADDRESSES_SELECTOR = '0x52ef6b2c'; // facetAddresses() returns (address[] memory facetAddresses_)
const FACET_ADDRESS_SELECTOR = '0x52ef6b2c'; // facetAddress(bytes4 _functionSelector) returns (address facetAddress_)
const SUPPORTS_INTERFACE_SELECTOR = '0x01ffc9a7'; // supportsInterface(bytes4 interfaceId)

// Diamond Cut Event signature (keccak256("DiamondCut(FacetCut[],address,bytes)"))
const DIAMOND_CUT_EVENT_SIGNATURE = '0x8faa70878671ccd212d20771b795c50af8fd3ff6cf27f4bde57e5d4de0aeb673';

interface FacetCut {
  facetAddress: string;
  action: number; // 0 = Add, 1 = Replace, 2 = Remove
  functionSelectors: string[];
}

interface DiamondCutEvent {
  diamondCut: FacetCut[];
  init: string;
  calldata: string;
}

/**
 * Make RPC call with automatic failover
 */
let currentRpcIndex = 0;
let rpcStats: Map<string, { success: number; failures: number }> = new Map();

async function rpcCall(method: string, params: any[], retryCount: number = 0): Promise<any> {
  const maxRetries = RPC_ENDPOINTS.length;
  
  if (retryCount >= maxRetries) {
    throw new Error(`All RPC endpoints failed after ${maxRetries} attempts`);
  }
  
  const rpcUrl = RPC_ENDPOINTS[currentRpcIndex];
  
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: 1,
      }),
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });
    
    if (!response.ok) {
      // If it's an authentication error, rotate to next RPC
      if (response.status === 401 || response.status === 403) {
        console.log(`  ⚠️  HTTP ${response.status} (authentication required), switching to next RPC...`);
        
        // Track failure
        const stats = rpcStats.get(rpcUrl) || { success: 0, failures: 0 };
        stats.failures++;
        rpcStats.set(rpcUrl, stats);
        
        // Rotate to next RPC
        currentRpcIndex = (currentRpcIndex + 1) % RPC_ENDPOINTS.length;
        
        // Retry with next RPC
        return rpcCall(method, params, retryCount + 1);
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      const errorMsg = data.error.message || 'Unknown RPC error';
      
      // Check if it's a rate limit error
      if (errorMsg.includes('rate limit') || errorMsg.includes('Too many requests')) {
        // Rotate to next RPC
        currentRpcIndex = (currentRpcIndex + 1) % RPC_ENDPOINTS.length;
        console.log(`  ⚠️  Rate limit hit, switching to RPC ${currentRpcIndex + 1}/${RPC_ENDPOINTS.length}`);
        
        // Track failure
        const stats = rpcStats.get(rpcUrl) || { success: 0, failures: 0 };
        stats.failures++;
        rpcStats.set(rpcUrl, stats);
        
        // Retry with next RPC
        return rpcCall(method, params, retryCount + 1);
      }
      
      // Check if it's an authentication/authorization error
      if (errorMsg.includes('Unauthorized') || errorMsg.includes('authenticate') || errorMsg.includes('API key') || 
          errorMsg.includes('authentication') || data.error.code === 401 || data.error.code === 403) {
        // Rotate to next RPC
        currentRpcIndex = (currentRpcIndex + 1) % RPC_ENDPOINTS.length;
        console.log(`  ⚠️  Authentication required, switching to RPC ${currentRpcIndex + 1}/${RPC_ENDPOINTS.length}: ${RPC_ENDPOINTS[currentRpcIndex]}`);
        
        // Track failure
        const stats = rpcStats.get(rpcUrl) || { success: 0, failures: 0 };
        stats.failures++;
        rpcStats.set(rpcUrl, stats);
        
        // Retry with next RPC
        return rpcCall(method, params, retryCount + 1);
      }
      
      throw new Error(`RPC Error: ${errorMsg}`);
    }
    
    // Track success
    const stats = rpcStats.get(rpcUrl) || { success: 0, failures: 0 };
    stats.success++;
    rpcStats.set(rpcUrl, stats);
    
    return data.result;
  } catch (error: any) {
    // Network error or timeout - try next RPC
    if (error.name === 'AbortError' || error.message.includes('fetch')) {
      console.log(`  ⚠️  RPC ${currentRpcIndex + 1} failed (${error.message}), trying next...`);
      
      // Track failure
      const stats = rpcStats.get(rpcUrl) || { success: 0, failures: 0 };
      stats.failures++;
      rpcStats.set(rpcUrl, stats);
      
      // Rotate to next RPC
      currentRpcIndex = (currentRpcIndex + 1) % RPC_ENDPOINTS.length;
      
      // Retry with next RPC
      return rpcCall(method, params, retryCount + 1);
    }
    
    throw error;
  }
}

/**
 * Check if contract has bytecode at address
 */
async function checkContractExists(address: string): Promise<boolean> {
  try {
    const bytecode = await rpcCall('eth_getCode', [address, 'latest']);
    return bytecode && bytecode !== '0x' && bytecode.length > 2;
  } catch (error) {
    console.error('Error checking contract existence:', error);
    return false;
  }
}

/**
 * Check if contract implements diamondCut function by checking bytecode
 */
async function checkDiamondCutFunction(address: string): Promise<boolean> {
  try {
    const bytecode = await rpcCall('eth_getCode', [address, 'latest']);
    
    // Check if bytecode contains diamond cut selector (without 0x prefix)
    const selectorWithoutPrefix = DIAMOND_CUT_SELECTOR.substring(2);
    return bytecode.toLowerCase().includes(selectorWithoutPrefix.toLowerCase());
  } catch (error) {
    console.error('Error checking diamondCut function:', error);
    return false;
  }
}

/**
 * Decode ABI-encoded address array (for facetAddresses())
 */
function decodeAddressArray(data: string): string[] {
  if (!data || data === '0x' || data.length < 66) {
    return [];
  }
  
  try {
    // Remove 0x prefix
    const hex = data.startsWith('0x') ? data.slice(2) : data;
    
    // First 32 bytes (64 hex chars) is the offset to the array data
    const offsetHex = hex.substring(0, 64);
    const offset = parseInt(offsetHex, 16);
    
    // Next 32 bytes is the length of the array
    const lengthHex = hex.substring(offset * 2, offset * 2 + 64);
    const length = parseInt(lengthHex, 16);
    
    const addresses: string[] = [];
    const startPos = offset * 2 + 64;
    
    for (let i = 0; i < length; i++) {
      const addrHex = hex.substring(startPos + i * 64, startPos + i * 64 + 64);
      // Address is in the last 40 chars (20 bytes), pad with 0x
      const address = '0x' + addrHex.slice(24); // Skip padding, take last 40 chars
      addresses.push(address);
    }
    
    return addresses;
  } catch (error) {
    return [];
  }
}

/**
 * Decode DiamondCut event data
 */
function decodeDiamondCutEvent(event: any): any {
  if (!event.data || event.data === '0x') {
    return null;
  }
  
  try {
    // DiamondCut event: DiamondCut(FacetCut[] _diamondCut, address _init, bytes _calldata)
    // This is a simplified decoder - full decoding requires ABI parsing
    const hex = event.data.startsWith('0x') ? event.data.slice(2) : event.data;
    
    // The event data contains the FacetCut array, init address, and calldata
    // For now, we'll extract what we can without full ABI decoding
    return {
      hasData: true,
      dataLength: hex.length / 2,
      rawData: event.data,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get facets using Diamond Loupe interface with proper decoding
 */
async function getFacets(address: string): Promise<string[]> {
  try {
    const result = await rpcCall('eth_call', [{
      to: address,
      data: FACET_ADDRESSES_SELECTOR,
    }, 'latest']);
    
    // Decode the result
    if (result && result !== '0x' && result.length > 2) {
      const addresses = decodeAddressArray(result);
      if (addresses.length > 0) {
        return addresses;
      }
      // If decoding failed but we have data, return indication
      return ['Facets found (decoding may be incomplete)'];
    }
    return [];
  } catch (error: any) {
    // If function doesn't exist, that's okay
    if (error.message?.includes('execution reverted') || error.message?.includes('revert')) {
      return [];
    }
    console.warn('Could not fetch facets:', error.message);
    return [];
  }
}

/**
 * Get function selectors for a facet address
 */
async function getFacetFunctionSelectors(diamondAddress: string, facetAddress: string): Promise<string[]> {
  try {
    // facetFunctionSelectors(address _facet) - selector + padded address
    const data = FACET_FUNCTION_SELECTORS_SELECTOR + facetAddress.slice(2).padStart(64, '0');
    const result = await rpcCall('eth_call', [{
      to: diamondAddress,
      data: data,
    }, 'latest']);
    
    if (result && result !== '0x' && result.length > 2) {
      // Decode bytes4[] array (similar to address array but with 4-byte selectors)
      const hex = result.startsWith('0x') ? result.slice(2) : result;
      const offsetHex = hex.substring(0, 64);
      const offset = parseInt(offsetHex, 16);
      const lengthHex = hex.substring(offset * 2, offset * 2 + 64);
      const length = parseInt(lengthHex, 16);
      
      const selectors: string[] = [];
      const startPos = offset * 2 + 64;
      
      for (let i = 0; i < length; i++) {
        const selectorHex = hex.substring(startPos + i * 64, startPos + i * 64 + 64);
        const selector = '0x' + selectorHex.slice(24, 32); // Last 4 bytes (8 hex chars)
        selectors.push(selector);
      }
      
      return selectors;
    }
    return [];
  } catch (error: any) {
    return [];
  }
}

/**
 * Find contract creation block using binary search
 */
async function findContractCreationBlock(address: string, currentBlock: number): Promise<number> {
  try {
    // Start binary search from a reasonable range
    // For Polygon, contracts are usually not older than a few million blocks
    const maxSearchBlocks = 5000000; // ~2 years of blocks at ~2s per block
    const searchFrom = Math.max(0, currentBlock - maxSearchBlocks);
    
    let low = searchFrom;
    let high = currentBlock;
    let earliestFound = currentBlock;
    
    // Binary search to find when contract first appeared
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      try {
        const bytecode = await rpcCall('eth_getCode', [address, '0x' + mid.toString(16)]);
        
        if (bytecode && bytecode !== '0x' && bytecode.length > 2) {
          // Contract exists at this block - this might be the creation block or earlier
          earliestFound = mid;
          high = mid - 1; // Continue searching earlier
        } else {
          // Contract doesn't exist yet - search later
          low = mid + 1;
        }
      } catch (error) {
        // On error, assume contract exists and search earlier
        high = mid - 1;
      }
    }
    
    // Refine: check a few blocks before earliestFound to find exact creation
    if (earliestFound < currentBlock) {
      for (let i = Math.max(0, earliestFound - 5); i <= earliestFound; i++) {
        try {
          const bytecode = await rpcCall('eth_getCode', [address, '0x' + i.toString(16)]);
          if (!bytecode || bytecode === '0x' || bytecode.length <= 2) {
            // Found the block right before creation
            return i + 1;
          }
        } catch (error) {
          continue;
        }
      }
    }
    
    return earliestFound;
  } catch (error) {
    // Fallback: search last 100k blocks
    console.log(`  ⚠️  Could not determine creation block, searching last 100k blocks`);
    return Math.max(0, currentBlock - 100000);
  }
}

/**
 * Fetch events in chunks to avoid "block range too large" errors
 */
async function fetchEventsInChunks(address: string, fromBlock: number, toBlock: number, chunkSize: number = 2000): Promise<any[]> {
  const allEvents: any[] = [];
  let currentFrom = fromBlock;
  const totalBlocks = toBlock - fromBlock;
  let processedBlocks = 0;
  
  while (currentFrom < toBlock) {
    const currentTo = Math.min(currentFrom + chunkSize - 1, toBlock);
    const fromHex = '0x' + currentFrom.toString(16);
    const toHex = '0x' + currentTo.toString(16);
    
    // Show progress every 10k blocks
    if (processedBlocks % 10000 === 0 && processedBlocks > 0) {
      const progress = ((processedBlocks / totalBlocks) * 100).toFixed(1);
      console.log(`  Progress: ${progress}% (${processedBlocks}/${totalBlocks} blocks, ${allEvents.length} events found)`);
    }
    
    try {
      const logs = await rpcCall('eth_getLogs', [{
        address: address,
        topics: [DIAMOND_CUT_EVENT_SIGNATURE],
        fromBlock: fromHex,
        toBlock: toHex,
      }]);
      
      if (logs && Array.isArray(logs)) {
        allEvents.push(...logs);
        if (logs.length > 0) {
          console.log(`  ✅ Found ${logs.length} event(s) in blocks ${currentFrom}-${currentTo}`);
        }
      }
      
      processedBlocks += (currentTo - currentFrom + 1);
      currentFrom = currentTo + 1;
    } catch (error: any) {
      // If chunk is still too large, try smaller chunks
      if (error.message?.includes('too large') || error.message?.includes('exceeded')) {
        if (chunkSize > 100) {
          // Try with smaller chunk
          const smallerChunkSize = Math.floor(chunkSize / 2);
          const subEvents = await fetchEventsInChunks(address, currentFrom, currentTo, smallerChunkSize);
          allEvents.push(...subEvents);
          processedBlocks += (currentTo - currentFrom + 1);
          currentFrom = currentTo + 1;
        } else {
          // Skip this chunk if even 100 blocks is too large
          console.log(`  ⚠️  Skipping blocks ${currentFrom}-${currentTo} (range too large even with 100 block chunks)`);
          processedBlocks += (currentTo - currentFrom + 1);
          currentFrom = currentTo + 1;
        }
      } else {
        // Other error, skip this chunk
        console.log(`  ⚠️  Error fetching blocks ${currentFrom}-${currentTo}: ${error.message}`);
        processedBlocks += (currentTo - currentFrom + 1);
        currentFrom = currentTo + 1;
      }
    }
  }
  
  return allEvents;
}

/**
 * Get Diamond Cut events from the blockchain with improved fetching
 */
async function getDiamondCutEvents(address: string, fromBlock: string = '0x0'): Promise<any[]> {
  try {
    // Get current block number
    const currentBlock = await rpcCall('eth_blockNumber', []);
    const currentBlockNum = parseInt(currentBlock, 16);
    
    // Try to find contract creation block
    console.log(`  Finding contract creation block...`);
    const creationBlock = await findContractCreationBlock(address, currentBlockNum);
    console.log(`  Contract creation block: ${creationBlock}`);
    
    const fromBlockNum = fromBlock === '0x0' ? creationBlock : parseInt(fromBlock, 16);
    const totalBlocks = currentBlockNum - fromBlockNum;
    
    // Limit search to reasonable range (max 500k blocks ~2 weeks)
    const maxSearchBlocks = 500000;
    const effectiveFromBlock = Math.max(fromBlockNum, currentBlockNum - maxSearchBlocks);
    
    if (effectiveFromBlock > fromBlockNum) {
      console.log(`  ⚠️  Limiting search to last ${maxSearchBlocks} blocks (from block ${effectiveFromBlock})`);
    }
    
    console.log(`  Fetching DiamondCut events from block ${effectiveFromBlock} to ${currentBlockNum} (${currentBlockNum - effectiveFromBlock} blocks)...`);
    
    // Fetch events in chunks (start with 2000, will auto-reduce if needed)
    const events = await fetchEventsInChunks(address, effectiveFromBlock, currentBlockNum, 2000);
    
    // Sort events by block number
    events.sort((a, b) => parseInt(a.blockNumber, 16) - parseInt(b.blockNumber, 16));
    
    return events;
  } catch (error: any) {
    console.warn(`  Could not fetch DiamondCut events: ${error.message}`);
    return [];
  }
}

/**
 * Extract function selectors from bytecode (4-byte patterns)
 */
function extractFunctionSelectors(bytecode: string): string[] {
  const selectors = new Set<string>();
  const hex = bytecode.startsWith('0x') ? bytecode.slice(2).toLowerCase() : bytecode.toLowerCase();
  
  // Look for 4-byte patterns that could be function selectors
  // Function selectors are typically followed by specific bytecode patterns
  for (let i = 0; i < hex.length - 8; i += 2) {
    const potentialSelector = '0x' + hex.substring(i, i + 8);
    // Basic validation: check if it looks like a selector
    // In practice, selectors are often followed by push/push patterns
    selectors.add(potentialSelector);
  }
  
  // Filter to only include known diamond selectors and common patterns
  const knownSelectors = [
    DIAMOND_CUT_SELECTOR,
    FACETS_SELECTOR,
    FACET_ADDRESSES_SELECTOR,
    FACET_FUNCTION_SELECTORS_SELECTOR,
    SUPPORTS_INTERFACE_SELECTOR,
  ];
  
  const foundSelectors: string[] = [];
  for (const selector of knownSelectors) {
    if (selectors.has(selector.toLowerCase())) {
      foundSelectors.push(selector);
    }
  }
  
  return foundSelectors;
}

/**
 * Analyze contract bytecode for diamond patterns
 */
async function analyzeBytecode(address: string): Promise<any> {
  try {
    const bytecode = await rpcCall('eth_getCode', [address, 'latest']);
    
    const selectorWithoutPrefix = (selector: string) => selector.substring(2).toLowerCase();
    
    const analysis = {
      hasBytecode: bytecode && bytecode !== '0x' && bytecode.length > 2,
      bytecodeLength: bytecode ? bytecode.length : 0,
      bytecodeSizeKB: bytecode ? ((bytecode.length - 2) / 2 / 1024).toFixed(2) : 0,
      containsDiamondCutSelector: bytecode.toLowerCase().includes(selectorWithoutPrefix(DIAMOND_CUT_SELECTOR)),
      containsFacetsSelector: bytecode.toLowerCase().includes(selectorWithoutPrefix(FACETS_SELECTOR)),
      containsFacetAddressesSelector: bytecode.toLowerCase().includes(selectorWithoutPrefix(FACET_ADDRESSES_SELECTOR)),
      containsFacetFunctionSelectorsSelector: bytecode.toLowerCase().includes(selectorWithoutPrefix(FACET_FUNCTION_SELECTORS_SELECTOR)),
      containsSupportsInterfaceSelector: bytecode.toLowerCase().includes(selectorWithoutPrefix(SUPPORTS_INTERFACE_SELECTOR)),
      extractedSelectors: extractFunctionSelectors(bytecode),
    };
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing bytecode:', error);
    return null;
  }
}

/**
 * Try to call diamond loupe functions
 */
async function testDiamondLoupe(address: string): Promise<any> {
  const results: any = {
    facets: null,
    facetAddresses: null,
    supportsInterface: null,
  };
  
  // Test facets()
  try {
    const facetsResult = await rpcCall('eth_call', [{
      to: address,
      data: FACETS_SELECTOR,
    }, 'latest']);
    results.facets = facetsResult && facetsResult !== '0x' ? 'Available' : 'Not available';
  } catch (error: any) {
    results.facets = 'Not available';
  }
  
  // Test facetAddresses()
  try {
    const facetAddressesResult = await rpcCall('eth_call', [{
      to: address,
      data: FACET_ADDRESSES_SELECTOR,
    }, 'latest']);
    results.facetAddresses = facetAddressesResult && facetAddressesResult !== '0x' ? 'Available' : 'Not available';
  } catch (error: any) {
    results.facetAddresses = 'Not available';
  }
  
  // Test supportsInterface (EIP-165)
  try {
    // Check for ERC165 interface (0x01ffc9a7)
    const supportsInterfaceResult = await rpcCall('eth_call', [{
      to: address,
      data: SUPPORTS_INTERFACE_SELECTOR + '01ffc9a7'.padStart(64, '0'),
    }, 'latest']);
    results.supportsInterface = supportsInterfaceResult && supportsInterfaceResult !== '0x' ? 'Available' : 'Not available';
  } catch (error: any) {
    results.supportsInterface = 'Not available';
  }
  
  return results;
}

/**
 * Main function to check diamond cut functionality
 */
async function checkDiamondCut() {
  try {
    console.log('🔷 Diamond Cut Checker (RPC Mode - No Wallet Required)');
    console.log('='.repeat(70));
    console.log(`Contract Address: ${DEFAULT_DIAMOND_ADDRESS}`);
    console.log(`Network: Polygon (Chain ID: 137)`);
    console.log(`RPC Endpoints: ${RPC_ENDPOINTS.length} available`);
    console.log(`Current RPC: ${RPC_ENDPOINTS[currentRpcIndex]}`);
    console.log('');
    
    // Get chain ID
    const chainId = await rpcCall('eth_chainId', []);
    console.log(`Chain ID: ${chainId} (${parseInt(chainId, 16)})`);
    
    // Get current block
    const currentBlock = await rpcCall('eth_blockNumber', []);
    console.log(`Current Block: ${currentBlock} (${parseInt(currentBlock, 16)})`);
    console.log('');
    
    // Step 1: Check if contract exists
    console.log('Step 1: Checking if contract exists...');
    const exists = await checkContractExists(DEFAULT_DIAMOND_ADDRESS);
    console.log(exists ? '✅ Contract has bytecode' : '❌ No bytecode found at address');
    console.log('');
    
    if (!exists) {
      console.log('⚠️  Contract does not exist. Cannot proceed with diamond checks.');
      return;
    }
    
    // Step 2: Analyze bytecode
    console.log('Step 2: Analyzing contract bytecode...');
    const bytecodeAnalysis = await analyzeBytecode(DEFAULT_DIAMOND_ADDRESS);
    if (bytecodeAnalysis) {
      console.log(`  Bytecode Length: ${bytecodeAnalysis.bytecodeLength} characters`);
      console.log(`  Bytecode Size: ${bytecodeAnalysis.bytecodeSizeKB} KB`);
      console.log(`  Contains diamondCut selector: ${bytecodeAnalysis.containsDiamondCutSelector ? '✅' : '❌'}`);
      console.log(`  Contains facets selector: ${bytecodeAnalysis.containsFacetsSelector ? '✅' : '❌'}`);
      console.log(`  Contains facetAddresses selector: ${bytecodeAnalysis.containsFacetAddressesSelector ? '✅' : '❌'}`);
      console.log(`  Contains facetFunctionSelectors selector: ${bytecodeAnalysis.containsFacetFunctionSelectorsSelector ? '✅' : '❌'}`);
      console.log(`  Contains supportsInterface selector: ${bytecodeAnalysis.containsSupportsInterfaceSelector ? '✅' : '❌'}`);
    }
    console.log('');
    
    // Step 3: Check diamondCut function
    console.log('Step 3: Checking diamondCut function...');
    const hasDiamondCut = await checkDiamondCutFunction(DEFAULT_DIAMOND_ADDRESS);
    console.log(hasDiamondCut ? '✅ diamondCut function selector found in bytecode' : '❌ diamondCut function selector not found');
    console.log('');
    
    // Step 4: Test Diamond Loupe interface
    console.log('Step 4: Testing Diamond Loupe interface...');
    const loupeResults = await testDiamondLoupe(DEFAULT_DIAMOND_ADDRESS);
    console.log(`  facets(): ${loupeResults.facets}`);
    console.log(`  facetAddresses(): ${loupeResults.facetAddresses}`);
    console.log(`  supportsInterface(): ${loupeResults.supportsInterface}`);
    console.log('');
    
    // Step 5: Try to get facets with validation
    console.log('Step 5: Attempting to get facets...');
    const facets = await getFacets(DEFAULT_DIAMOND_ADDRESS);
    if (facets.length > 0 && !facets[0].includes('decoding')) {
      console.log(`  ✅ Found ${facets.length} facet(s):`);
      for (let i = 0; i < facets.length; i++) {
        const facetAddr = facets[i];
        console.log(`    ${i + 1}. ${facetAddr}`);
        
        // Validate facet is a contract
        try {
          const facetBytecode = await rpcCall('eth_getCode', [facetAddr, 'latest']);
          const isContract = facetBytecode && facetBytecode !== '0x' && facetBytecode.length > 2;
          console.log(`       Contract: ${isContract ? '✅ Yes' : '❌ No'}`);
          
          if (isContract) {
            // Get function selectors for this facet
            const selectors = await getFacetFunctionSelectors(DEFAULT_DIAMOND_ADDRESS, facetAddr);
            if (selectors.length > 0) {
              console.log(`       Function Selectors: ${selectors.length}`);
              selectors.slice(0, 5).forEach((sel, idx) => {
                console.log(`         ${idx + 1}. ${sel}`);
              });
              if (selectors.length > 5) {
                console.log(`         ... and ${selectors.length - 5} more`);
              }
            }
          }
        } catch (error: any) {
          console.log(`       Validation: ⚠️  ${error.message}`);
        }
      }
    } else {
      console.log('  ⚠️  Could not retrieve facets (may require proper ABI decoding or function not implemented)');
    }
    console.log('');
    
    // Step 6: Get Diamond Cut events with decoding
    console.log('Step 6: Fetching DiamondCut events...');
    const events = await getDiamondCutEvents(DEFAULT_DIAMOND_ADDRESS);
    console.log(`  Found ${events.length} DiamondCut event(s)`);
    if (events.length > 0) {
      events.forEach((event, i) => {
        console.log(`    Event ${i + 1}:`);
        console.log(`      Block: ${event.blockNumber} (${parseInt(event.blockNumber, 16)})`);
        console.log(`      Transaction: ${event.transactionHash}`);
        console.log(`      Topics: ${event.topics.length}`);
        if (event.topics.length > 1) {
          console.log(`      First topic (event signature): ${event.topics[0]}`);
        }
        
        // Try to decode event data
        const decoded = decodeDiamondCutEvent(event);
        if (decoded) {
          console.log(`      Event Data: ${decoded.dataLength} bytes`);
        }
      });
    } else {
      console.log('  ℹ️  No DiamondCut events found (contract may not have been upgraded yet)');
    }
    console.log('');
    
    // Summary
    console.log('='.repeat(70));
    console.log('📊 Summary:');
    console.log(`  Contract Address: ${DEFAULT_DIAMOND_ADDRESS}`);
    console.log(`  Contract Exists: ${exists ? '✅' : '❌'}`);
    console.log(`  Diamond Cut Function: ${hasDiamondCut ? '✅' : '❌'}`);
    console.log(`  Diamond Cut Events: ${events.length}`);
    console.log(`  Diamond Loupe Interface: ${loupeResults.facetAddresses === 'Available' ? '✅ Available' : '⚠️  Limited/Not Available'}`);
    console.log(`  Bytecode Analysis: ${bytecodeAnalysis?.containsDiamondCutSelector ? '✅ Diamond patterns found' : '⚠️  Limited diamond patterns'}`);
    console.log('');
    
    // Determine if this is likely a diamond contract
    const isLikelyDiamond = hasDiamondCut && 
                            (bytecodeAnalysis?.containsFacetsSelector || bytecodeAnalysis?.containsFacetAddressesSelector) &&
                            events.length >= 0; // Events are optional
    
    console.log('='.repeat(70));
    if (isLikelyDiamond) {
      console.log('✅ This contract appears to implement the Diamond Standard (EIP-2535)');
    } else if (hasDiamondCut) {
      console.log('⚠️  This contract may implement Diamond Standard but some features are missing');
    } else {
      console.log('❌ This contract does not appear to implement the Diamond Standard');
    }
    console.log('');
    
    // Get detailed facet information
    const facetDetails: any[] = [];
    if (facets.length > 0 && !facets[0].includes('decoding')) {
      for (const facetAddr of facets) {
        try {
          const facetBytecode = await rpcCall('eth_getCode', [facetAddr, 'latest']);
          const isContract = facetBytecode && facetBytecode !== '0x' && facetBytecode.length > 2;
          const selectors = isContract ? await getFacetFunctionSelectors(DEFAULT_DIAMOND_ADDRESS, facetAddr) : [];
          
          facetDetails.push({
            address: facetAddr,
            isContract: isContract,
            functionSelectors: selectors,
            selectorCount: selectors.length,
          });
        } catch (error: any) {
          facetDetails.push({
            address: facetAddr,
            error: error.message,
          });
        }
      }
    }
    
    // Save results to file
    const results = {
      contractAddress: DEFAULT_DIAMOND_ADDRESS,
      chainId: chainId,
      chainIdDecimal: parseInt(chainId, 16),
      currentBlock: currentBlock,
      currentBlockDecimal: parseInt(currentBlock, 16),
      contractExists: exists,
      hasDiamondCutFunction: hasDiamondCut,
      bytecodeAnalysis: bytecodeAnalysis,
      diamondLoupeResults: loupeResults,
      facets: {
        addresses: facets,
        details: facetDetails,
        count: facets.length > 0 && !facets[0].includes('decoding') ? facets.length : 0,
      },
      diamondCutEvents: {
        count: events.length,
        events: events.map(e => {
          const decoded = decodeDiamondCutEvent(e);
          return {
            blockNumber: e.blockNumber,
            blockNumberDecimal: parseInt(e.blockNumber, 16),
            transactionHash: e.transactionHash,
            topics: e.topics,
            decoded: decoded,
          };
        }),
      },
      isLikelyDiamond: isLikelyDiamond,
      timestamp: new Date().toISOString(),
    };
    
    const outputPath = path.join(CWD, 'diamond_cut_check_results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`✅ Results saved to: ${outputPath}`);
    console.log('');
    
    // Print RPC statistics
    if (rpcStats.size > 0) {
      console.log('='.repeat(70));
      console.log('📊 RPC Usage Statistics:');
      for (const [url, stats] of rpcStats.entries()) {
        const shortUrl = url.replace('https://', '').replace('http://', '').substring(0, 40);
        console.log(`  ${shortUrl}:`);
        console.log(`    Success: ${stats.success}, Failures: ${stats.failures}`);
      }
      console.log('');
    }
    
    console.log('✅ Diamond Cut check completed!');
    
  } catch (error: any) {
    console.error('❌ Error:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the check
checkDiamondCut();
