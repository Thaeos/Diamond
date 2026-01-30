/**
 * Ethers.js Official Integration
 * 
 * Based on official Ethers.js patterns:
 * - Repository: https://github.com/ethers-io/ethers.js
 * - Documentation: https://docs.ethers.org/
 * - Version: ^6.9.0
 * 
 * Official Ethers.js v6 patterns for:
 * - Providers (JsonRpcProvider, BrowserProvider)
 * - Wallets (Wallet, HDNodeWallet)
 * - Contract interactions
 * - ENS resolution
 * - Multi-chain support
 */

import { ethers } from "ethers";

// Environment variables
const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || "";
const ARBITRUM_RPC_URL = process.env.ARBITRUM_RPC_URL || "";
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || "";
const BASE_RPC_URL = process.env.BASE_RPC_URL || "";

// Tenderly RPC endpoints
const TENDERLY_RPC_HTTP = [
  process.env.TENDERLY_RPC_HTTP_1 || "https://virtual.mainnet.us-east.rpc.tenderly.co/ba0e32f8-b5f3-4ca6-a2cc-3ab4fa250000",
  process.env.TENDERLY_RPC_HTTP_2 || "https://virtual.mainnet.us-east.rpc.tenderly.co/776c4f4c-e39b-4465-b87e-88101f9cabdd"
];

const TENDERLY_RPC_WS = [
  process.env.TENDERLY_RPC_WS_1 || "wss://virtual.mainnet.us-east.rpc.tenderly.co/73a5b144-1e5e-4706-ab25-9b3085afd5f4",
  process.env.TENDERLY_RPC_WS_2 || "wss://virtual.mainnet.us-east.rpc.tenderly.co/cd99bef4-16d5-426e-ad02-c51d14f42885"
];

/**
 * Get provider for a specific chain
 */
export function getProvider(chainId: number): ethers.Provider {
  let rpcUrl = "";
  
  switch (chainId) {
    case 1: // Ethereum Mainnet
      rpcUrl = ETHEREUM_RPC_URL;
      break;
    case 42161: // Arbitrum One
      rpcUrl = ARBITRUM_RPC_URL;
      break;
    case 137: // Polygon
      rpcUrl = POLYGON_RPC_URL;
      break;
    case 8453: // Base
      rpcUrl = BASE_RPC_URL;
      break;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  
  if (!rpcUrl) {
    throw new Error(`RPC URL not configured for chain ${chainId}`);
  }
  
  return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Get Tenderly HTTP provider
 */
export function getTenderlyProvider(index: number = 0): ethers.JsonRpcProvider {
  const rpcUrl = TENDERLY_RPC_HTTP[index] || TENDERLY_RPC_HTTP[0];
  return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Get Tenderly WebSocket provider
 */
export function getTenderlyWebSocketProvider(index: number = 0): ethers.WebSocketProvider {
  const rpcUrl = TENDERLY_RPC_WS[index] || TENDERLY_RPC_WS[0];
  return new ethers.WebSocketProvider(rpcUrl);
}

/**
 * Get browser provider (for MetaMask, WalletConnect, etc.)
 */
export function getBrowserProvider(): ethers.BrowserProvider | null {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
}

/**
 * Create wallet from private key
 */
export function createWallet(privateKey: string, chainId: number = 1): ethers.Wallet {
  const provider = getProvider(chainId);
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Create wallet from mnemonic
 */
export function createWalletFromMnemonic(
  mnemonic: string,
  accountIndex: number = 0,
  chainId: number = 1
): ethers.HDNodeWallet {
  const provider = getProvider(chainId);
  const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
  const wallet = hdNode.deriveChild(accountIndex);
  return wallet.connect(provider);
}

/**
 * Resolve ENS name to address
 */
export async function resolveENS(
  name: string,
  chainId: number = 1
): Promise<string | null> {
  try {
    const provider = getProvider(chainId);
    const address = await provider.resolveName(name);
    return address;
  } catch (error) {
    console.error(`Failed to resolve ENS name ${name}:`, error);
    return null;
  }
}

/**
 * Reverse resolve address to ENS name
 */
export async function lookupAddress(
  address: string,
  chainId: number = 1
): Promise<string | null> {
  try {
    const provider = getProvider(chainId);
    const name = await provider.lookupAddress(address);
    return name;
  } catch (error) {
    console.error(`Failed to lookup address ${address}:`, error);
    return null;
  }
}

/**
 * Get ENS avatar URL
 */
export async function getENSAvatar(
  nameOrAddress: string,
  chainId: number = 1
): Promise<string | null> {
  try {
    const provider = getProvider(chainId);
    const avatar = await provider.getAvatar(nameOrAddress);
    return avatar;
  } catch (error) {
    console.error(`Failed to get ENS avatar for ${nameOrAddress}:`, error);
    return null;
  }
}

/**
 * Get contract instance
 */
export function getContract(
  address: string,
  abi: ethers.InterfaceAbi,
  chainId: number = 1
): ethers.Contract {
  const provider = getProvider(chainId);
  return new ethers.Contract(address, abi, provider);
}

/**
 * Get contract instance with signer
 */
export function getContractWithSigner(
  address: string,
  abi: ethers.InterfaceAbi,
  signer: ethers.Signer
): ethers.Contract {
  return new ethers.Contract(address, abi, signer);
}

/**
 * Format units (wei to ether, etc.)
 */
export function formatUnits(value: bigint, decimals: number = 18): string {
  return ethers.formatUnits(value, decimals);
}

/**
 * Parse units (ether to wei, etc.)
 */
export function parseUnits(value: string, decimals: number = 18): bigint {
  return ethers.parseUnits(value, decimals);
}

/**
 * Format Ether (wei to ether)
 */
export function formatEther(value: bigint): string {
  return ethers.formatEther(value);
}

/**
 * Parse Ether (ether to wei)
 */
export function parseEther(value: string): bigint {
  return ethers.parseEther(value);
}

/**
 * Get balance for address
 */
export async function getBalance(
  address: string,
  chainId: number = 1
): Promise<bigint> {
  const provider = getProvider(chainId);
  return await provider.getBalance(address);
}

/**
 * Send transaction
 */
export async function sendTransaction(
  signer: ethers.Signer,
  to: string,
  value: bigint,
  data?: string
): Promise<ethers.TransactionResponse> {
  const tx = {
    to,
    value,
    data: data || "0x"
  };
  
  return await signer.sendTransaction(tx);
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  txHash: string,
  chainId: number = 1,
  confirmations: number = 1
): Promise<ethers.TransactionReceipt | null> {
  try {
    const provider = getProvider(chainId);
    return await provider.waitForTransaction(txHash, confirmations);
  } catch (error) {
    console.error(`Failed to wait for transaction ${txHash}:`, error);
    return null;
  }
}

/**
 * Sign message
 */
export async function signMessage(
  signer: ethers.Signer,
  message: string
): Promise<string> {
  return await signer.signMessage(message);
}

/**
 * Verify message signature
 */
export function verifyMessage(
  message: string | ethers.Bytes,
  signature: string
): string {
  return ethers.verifyMessage(message, signature);
}

// Export ethers for direct use
export { ethers };

// Default exports
export default {
  getProvider,
  getTenderlyProvider,
  getTenderlyWebSocketProvider,
  getBrowserProvider,
  createWallet,
  createWalletFromMnemonic,
  resolveENS,
  lookupAddress,
  getENSAvatar,
  getContract,
  getContractWithSigner,
  formatUnits,
  parseUnits,
  formatEther,
  parseEther,
  getBalance,
  sendTransaction,
  waitForTransaction,
  signMessage,
  verifyMessage,
  ethers
};
