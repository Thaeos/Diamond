/**
 * Autonomous Agent Wallet
 * ========================
 * 
 * Unified wallet interface integrating:
 * - MetaMask SDK (browser extension)
 * - Safe{Wallet} with Diamond Contract (smart contract wallet)
 * - WalletConnect AppKit (mobile/QR code)
 * - Tenderly API (monitoring, debugging, simulation)
 * 
 * This creates a single, autonomous agent wallet that can:
 * - Connect via multiple wallet providers
 * - Execute transactions through Safe{Wallet}
 * - Interact with Diamond Contract
 * - Monitor operations via Tenderly
 * - Use Tenderly Virtual TestNet as playground
 */

import { MetaMaskSDK } from '@metamask/sdk'
import { createAppKit } from '@reown/appkit/react'
import { EthereumProvider } from '@reown/appkit-ethereum'
import Safe, { SafeFactory, SafeAccountConfig } from '@safe-global/safe-core-sdk'
import { EthersAdapter } from '@safe-global/safe-ethers-lib'
import { ethers } from 'ethers'
import { getSafeContract, getProxyFactoryContract } from '@safe-global/safe-deployments'

// Configuration
const PRIMARY_WALLET_ADDRESS = "0x67A977eaD94C3b955ECbf27886CE9f62464423B2"
const PRIMARY_WALLET_MESSAGE = "There is nothing new under the sun. That which was will be, and that which will be already was when the end finds its beginning."
const PRIMARY_WALLET_SIGNATURE = "0x7dbf6d9162ae032dac18162b2d40e7f030fe9bf7a0422364ca9343d3defb45f21288d5a5b17d800dafa77793e6173642a3eedce296fdccbfbef2c48019acc46b1c"

// Tenderly Configuration
const TENDERLY_API_KEY = process.env.TENDERLY_API || "LZAQjWhTiJJUskQJQXUzAw2ZE0EJpNni"
const TENDERLY_PROJECT_SLUG = "Ua_0357/testnet"
const TENDERLY_RPC_HTTP = process.env.TENDERLY_RPC_HTTP || "https://virtual.mainnet.us-east.rpc.tenderly.co/ba0e32f8-b5f3-4ca6-a2cc-3ab4fa250000"
const TENDERLY_RPC_WS = process.env.TENDERLY_RPC_WS || "wss://virtual.mainnet.us-east.rpc.tenderly.co/73a5b144-1e5e-4706-ab25-9b3085afd5f4"

// Network configurations
const NETWORKS = {
  ethereum: { chainId: 1, name: "Ethereum Mainnet" },
  arbitrum: { chainId: 42161, name: "Arbitrum One" },
  polygon: { chainId: 137, name: "Polygon" },
  base: { chainId: 8453, name: "Base" },
  tenderly: { chainId: 73571, name: "Tenderly Virtual TestNet", rpc: TENDERLY_RPC_HTTP }
}

/**
 * Wallet Provider Type
 */
export type WalletProvider = 'metamask' | 'walletconnect' | 'safe' | 'tenderly'

/**
 * Autonomous Agent Wallet
 * 
 * Unified interface for all wallet operations
 */
export class AutonomousAgentWallet {
  private metamaskSDK: MetaMaskSDK | null = null
  private walletConnectAppKit: any = null
  private safeSDK: Safe | null = null
  private provider: ethers.Provider | null = null
  private signer: ethers.Signer | null = null
  private currentProvider: WalletProvider | null = null
  private diamondAddress: string | null = null
  private safeAddress: string | null = null
  
  /**
   * Initialize MetaMask SDK
   */
  async initMetaMask(): Promise<void> {
    if (this.metamaskSDK) return
    
    this.metamaskSDK = new MetaMaskSDK({
      dappMetadata: {
        name: 'Autonomous Agent Wallet',
        url: 'https://theosmagic.uni.eth'
      },
      infuraAPIKey: process.env.INFURA_API_KEY || '',
      useDeeplink: true,
      checkInstallationImmediately: true
    })
    
    await this.metamaskSDK.init()
    const provider = this.metamaskSDK.getProvider()
    if (provider) {
      this.provider = new ethers.BrowserProvider(provider as any)
      this.currentProvider = 'metamask'
    }
  }
  
  /**
   * Initialize WalletConnect AppKit
   */
  async initWalletConnect(): Promise<void> {
    if (this.walletConnectAppKit) return
    
    const projectId = process.env.WALLETCONNECT_PROJECT_ID || ''
    
    this.walletConnectAppKit = createAppKit({
      projectId,
      metadata: {
        name: 'Autonomous Agent Wallet',
        description: 'Unified wallet with Diamond Contract',
        url: 'https://theosmagic.uni.eth',
        icons: ['https://theosmagic.uni.eth/icon.png']
      },
      chains: Object.values(NETWORKS).filter(n => n.chainId !== 73571).map(n => ({
        id: n.chainId,
        name: n.name
      })),
      features: {
        analytics: true,
        email: false,
        socials: false,
        swaps: false,
        onramp: false
      }
    })
    
    const provider = this.walletConnectAppKit.getEthereumProvider()
    if (provider) {
      this.provider = new ethers.BrowserProvider(provider as any)
      this.currentProvider = 'walletconnect'
    }
  }
  
  /**
   * Initialize Tenderly Provider
   */
  async initTenderly(): Promise<void> {
    if (this.provider && this.currentProvider === 'tenderly') return
    
    this.provider = new ethers.JsonRpcProvider(TENDERLY_RPC_HTTP)
    this.currentProvider = 'tenderly'
  }
  
  /**
   * Initialize Safe{Wallet} SDK
   */
  async initSafe(owners: string[] = [PRIMARY_WALLET_ADDRESS], threshold: number = 1): Promise<void> {
    if (!this.provider) {
      throw new Error('Provider must be initialized first')
    }
    
    if (!this.signer) {
      // For Safe, we need a signer from the connected wallet
      if (this.currentProvider === 'metamask' || this.currentProvider === 'walletconnect') {
        this.signer = await this.provider.getSigner()
      } else {
        throw new Error('Safe requires a connected wallet provider')
      }
    }
    
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: this.signer
    })
    
    // Get Safe contracts
    const chainId = Number(await this.provider.getNetwork().then(n => n.chainId))
    const safeContract = getSafeContract({
      version: "1.5.0",
      network: chainId.toString()
    })
    
    const proxyFactoryContract = getProxyFactoryContract({
      version: "1.5.0",
      network: chainId.toString()
    })
    
    // Initialize Safe Factory
    const safeFactory = await SafeFactory.init({
      ethAdapter,
      safeContract: safeContract as any,
      proxyFactoryContract: proxyFactoryContract as any
    })
    
    // Deploy or get existing Safe
    // For now, we'll assume Safe is already deployed
    // In production, check if Safe exists for these owners
    const safeAccountConfig: SafeAccountConfig = {
      owners,
      threshold,
      to: ethers.ZeroAddress,
      data: "0x",
      fallbackHandler: ethers.ZeroAddress,
      paymentToken: ethers.ZeroAddress,
      payment: 0,
      paymentReceiver: ethers.ZeroAddress
    }
    
    // Note: In production, check if Safe already exists before deploying
    // this.safeSDK = await safeFactory.deploySafe({ safeAccountConfig })
    // this.safeAddress = await this.safeSDK.getAddress()
  }
  
  /**
   * Connect wallet
   */
  async connect(provider: WalletProvider = 'metamask'): Promise<string[]> {
    switch (provider) {
      case 'metamask':
        await this.initMetaMask()
        break
      case 'walletconnect':
        await this.initWalletConnect()
        break
      case 'tenderly':
        await this.initTenderly()
        break
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }
    
    if (!this.provider) {
      throw new Error('Failed to initialize provider')
    }
    
    // Get accounts
    if (provider === 'metamask' || provider === 'walletconnect') {
      const accounts = await this.provider.send('eth_requestAccounts', [])
      this.signer = await this.provider.getSigner()
      return accounts
    }
    
    return []
  }
  
  /**
   * Sign message
   */
  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected')
    }
    
    return await this.signer.signMessage(message)
  }
  
  /**
   * Verify signature
   */
  async verifySignature(message: string, signature: string, expectedAddress: string): Promise<boolean> {
    const recoveredAddress = ethers.verifyMessage(message, signature)
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()
  }
  
  /**
   * Send transaction via Safe{Wallet}
   */
  async sendTransactionViaSafe(to: string, value: string, data: string): Promise<string> {
    if (!this.safeSDK) {
      throw new Error('Safe{Wallet} not initialized')
    }
    
    const safeTransaction = await this.safeSDK.createTransaction({
      to,
      value,
      data
    })
    
    const txResponse = await this.safeSDK.executeTransaction(safeTransaction)
    await txResponse.transactionResponse?.wait()
    
    return txResponse.transactionResponse?.hash || ''
  }
  
  /**
   * Execute Diamond Cut via Safe{Wallet}
   */
  async executeDiamondCut(
    diamondCut: any[],
    initAddress: string,
    initData: string
  ): Promise<string> {
    if (!this.safeSDK || !this.diamondAddress) {
      throw new Error('Safe{Wallet} and Diamond Contract must be initialized')
    }
    
    // Encode Diamond Cut
    const diamondInterface = new ethers.Interface([
      "function diamondCut((address,uint8,bytes4[])[],address,bytes)"
    ])
    
    const diamondCutData = diamondInterface.encodeFunctionData("diamondCut", [
      diamondCut,
      initAddress,
      initData
    ])
    
    // Execute via Safe
    return await this.sendTransactionViaSafe(
      this.diamondAddress,
      "0",
      diamondCutData
    )
  }
  
  /**
   * Monitor transaction via Tenderly
   */
  async monitorTransaction(txHash: string): Promise<any> {
    const response = await fetch(
      `https://api.tenderly.co/api/v1/account/${TENDERLY_PROJECT_SLUG.split('/')[0]}/project/${TENDERLY_PROJECT_SLUG.split('/')[1]}/transaction/${txHash}`,
      {
        headers: {
          'X-Access-Key': TENDERLY_API_KEY
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`Tenderly API error: ${response.statusText}`)
    }
    
    return await response.json()
  }
  
  /**
   * Simulate transaction via Tenderly
   */
  async simulateTransaction(tx: {
    from: string
    to: string
    value: string
    data: string
  }): Promise<any> {
    const response = await fetch(
      `https://api.tenderly.co/api/v1/account/${TENDERLY_PROJECT_SLUG.split('/')[0]}/project/${TENDERLY_PROJECT_SLUG.split('/')[1]}/simulate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': TENDERLY_API_KEY
        },
        body: JSON.stringify({
          network_id: NETWORKS.tenderly.chainId,
          from: tx.from,
          to: tx.to,
          input: tx.data,
          value: tx.value,
          gas: 8000000,
          gas_price: "0"
        })
      }
    )
    
    if (!response.ok) {
      throw new Error(`Tenderly simulation error: ${response.statusText}`)
    }
    
    return await response.json()
  }
  
  /**
   * Get configuration
   */
  getConfig() {
    return {
      primaryWallet: PRIMARY_WALLET_ADDRESS,
      currentProvider: this.currentProvider,
      diamondAddress: this.diamondAddress,
      safeAddress: this.safeAddress,
      tenderly: {
        projectSlug: TENDERLY_PROJECT_SLUG,
        rpcHttp: TENDERLY_RPC_HTTP,
        rpcWs: TENDERLY_RPC_WS
      },
      networks: NETWORKS
    }
  }
  
  /**
   * Set Diamond Contract address
   */
  setDiamondAddress(address: string): void {
    this.diamondAddress = address
  }
  
  /**
   * Set Safe{Wallet} address
   */
  setSafeAddress(address: string): void {
    this.safeAddress = address
  }
}

// Export singleton instance
let walletInstance: AutonomousAgentWallet | null = null

export function getAutonomousAgentWallet(): AutonomousAgentWallet {
  if (!walletInstance) {
    walletInstance = new AutonomousAgentWallet()
  }
  return walletInstance
}

export default AutonomousAgentWallet
