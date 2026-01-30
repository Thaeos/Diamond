/**
 * Deploy Safe{Wallet} with Diamond Contract Integration
 * 
 * Deploys:
 * 1. Safe{Wallet} on all chains
 * 2. SafeDiamondModule
 * 3. SafeDiamondFactory
 * 4. Connects Diamond Contract to Safe{Wallet}
 */

import { ethers } from "ethers";
import Safe, { SafeFactory } from "@safe-global/safe-core-sdk";
import { EthersAdapter } from "@safe-global/safe-ethers-lib";

interface DeployConfig {
  diamondAddress: string;
  owners: string[];
  threshold: number;
  chainId: number;
  rpcUrl: string;
}

async function deploySafeWithDiamond(config: DeployConfig) {
  console.log(`\nDeploying Safe{Wallet} with Diamond on chain ${config.chainId}...`);
  
  // Setup provider
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const signer = await provider.getSigner();
  
  // Initialize Safe SDK
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer
  });
  
  const safeFactory = await SafeFactory.init({ ethAdapter });
  
  // Create Safe
  const safeSdk = await safeFactory.deploySafe({
    safeAccountConfig: {
      owners: config.owners,
      threshold: config.threshold
    }
  });
  
  const safeAddress = await safeSdk.getAddress();
  console.log(`✅ Safe{Wallet} deployed: ${safeAddress}`);
  
  // Deploy Diamond Module
  const SafeDiamondModule = await ethers.getContractFactory("SafeDiamondModule");
  const module = await SafeDiamondModule.deploy(config.diamondAddress);
  await module.waitForDeployment();
  const moduleAddress = await module.getAddress();
  console.log(`✅ Diamond Module deployed: ${moduleAddress}`);
  
  // Enable module on Safe
  const enableModuleTx = await safeSdk.createEnableModuleTx(moduleAddress);
  const txResponse = await safeSdk.executeTransaction(enableModuleTx);
  await txResponse.transactionResponse?.wait();
  console.log(`✅ Module enabled on Safe`);
  
  return {
    safeAddress,
    moduleAddress,
    chainId: config.chainId
  };
}

async function deployAllChains() {
  const configs = [
    {
      diamondAddress: process.env.DIAMOND_ETHEREUM || "",
      owners: [
        process.env.OWNER_1 || "",
        process.env.OWNER_2 || "",
        process.env.OWNER_3 || ""
      ],
      threshold: 2,
      chainId: 1,
      rpcUrl: process.env.ETHEREUM_RPC_URL || ""
    },
    {
      diamondAddress: process.env.DIAMOND_ARBITRUM || "",
      owners: [
        process.env.OWNER_1 || "",
        process.env.OWNER_2 || "",
        process.env.OWNER_3 || ""
      ],
      threshold: 2,
      chainId: 42161,
      rpcUrl: process.env.ARBITRUM_RPC_URL || ""
    },
    {
      diamondAddress: process.env.DIAMOND_POLYGON || "",
      owners: [
        process.env.OWNER_1 || "",
        process.env.OWNER_2 || "",
        process.env.OWNER_3 || ""
      ],
      threshold: 2,
      chainId: 137,
      rpcUrl: process.env.POLYGON_RPC_URL || ""
    },
    {
      diamondAddress: process.env.DIAMOND_BASE || "",
      owners: [
        process.env.OWNER_1 || "",
        process.env.OWNER_2 || "",
        process.env.OWNER_3 || ""
      ],
      threshold: 2,
      chainId: 8453,
      rpcUrl: process.env.BASE_RPC_URL || ""
    }
  ];
  
  const results = [];
  
  for (const config of configs) {
    if (config.diamondAddress && config.rpcUrl) {
      try {
        const result = await deploySafeWithDiamond(config);
        results.push(result);
      } catch (error) {
        console.error(`Error deploying on chain ${config.chainId}:`, error);
      }
    }
  }
  
  return results;
}

if (require.main === module) {
  deployAllChains()
    .then(results => {
      console.log("\n" + "=".repeat(80));
      console.log("DEPLOYMENT COMPLETE");
      console.log("=".repeat(80));
      console.log("\nResults:");
      results.forEach(r => {
        console.log(`  Chain ${r.chainId}:`);
        console.log(`    Safe: ${r.safeAddress}`);
        console.log(`    Module: ${r.moduleAddress}`);
      });
    })
    .catch(console.error);
}

export { deploySafeWithDiamond, deployAllChains };
