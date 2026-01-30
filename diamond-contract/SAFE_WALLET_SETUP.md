# Safe{Wallet} Setup Guide
## MetaMask SDK + WalletConnect + Diamond Contract

---

## 🎯 Overview

Integrate Diamond Contract into Safe{Wallet} with:
- **MetaMask SDK**: Browser extension connection
- **WalletConnect Kit**: Mobile/QR wallet connection
- **Safe{Wallet}**: Smart contract wallet with multi-sig
- **Diamond Contract**: Evolving contract hub

---

## 📋 Prerequisites

### 1. Environment Variables

Add to `env.txt`:
```
SAFE_WALLET_ADDRESS=0x...  # Safe{Wallet} address (after deployment)
DIAMOND_ADDRESS=0x...      # Diamond Contract address
WALLETCONNECT_PROJECT_ID=your-project-id
INFURA_API_KEY=your-infura-key
OWNER_1=0x...              # Safe owner 1
OWNER_2=0x...              # Safe owner 2
OWNER_3=0x...              # Safe owner 3
```

### 2. Install Dependencies

```bash
npm install @metamask/sdk @walletconnect/modal @safe-global/safe-core-sdk @safe-global/safe-ethers-lib
```

---

## 🚀 Setup Steps

### Step 1: Generate Configuration

```bash
python3 scripts/setup_safe_wallet.py --diamond 0x... --safe 0x...
```

This generates:
- `config/wallet/safe_wallet_config.json`
- `config/wallet/wallet.config.ts`

### Step 2: Deploy Safe{Wallet} with Diamond Module

```bash
# Deploy on all chains
npx ts-node diamond-contract/scripts/deploy_safe_diamond.ts
```

Or deploy individually:
```bash
# Ethereum
DIAMOND_ADDRESS=0x... npx ts-node deploy_safe_diamond.ts --chain ethereum

# Arbitrum
DIAMOND_ADDRESS=0x... npx ts-node deploy_safe_diamond.ts --chain arbitrum

# Polygon
DIAMOND_ADDRESS=0x... npx ts-node deploy_safe_diamond.ts --chain polygon

# Base
DIAMOND_ADDRESS=0x... npx ts-node deploy_safe_diamond.ts --chain base
```

### Step 3: Configure Multi-Sig

Set threshold (e.g., 2-of-3):
```typescript
const safeSdk = await Safe.init({
  safeAddress: "0x...",
  provider: provider
});

await safeSdk.changeThreshold(2);
```

### Step 4: Enable Diamond Module

```typescript
const moduleAddress = "0x..."; // SafeDiamondModule address
const enableModuleTx = await safeSdk.createEnableModuleTx(moduleAddress);
await safeSdk.executeTransaction(enableModuleTx);
```

---

## 🔧 Integration Code

### MetaMask SDK

```typescript
import { MetaMaskSDK } from '@metamask/sdk';

const sdk = new MetaMaskSDK({
  dappMetadata: {
    name: "Diamond Contract",
    url: "https://theosmagic.uni.eth"
  }
});

const accounts = await sdk.connect();
```

### WalletConnect

```typescript
import { WalletConnectModal } from '@walletconnect/modal';

const walletConnect = new WalletConnectModal({
  projectId: "your-project-id",
  chains: ["eip155:1", "eip155:42161"]
});

await walletConnect.open();
```

### Safe{Wallet}

```typescript
import Safe from '@safe-global/safe-core-sdk';
import { EthersAdapter } from '@safe-global/safe-ethers-lib';

const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer });
const safeSdk = await Safe.init({ ethAdapter, safeAddress });
```

### Diamond Operations via Safe

```typescript
// Execute Diamond Cut via Safe
const diamondCutTx = await safeSdk.createTransaction({
  to: moduleAddress,
  data: module.interface.encodeFunctionData("executeDiamondCut", [
    facetCuts,
    initAddress,
    initData
  ]),
  value: "0"
});

await safeSdk.executeTransaction(diamondCutTx);
```

---

## 🔐 Security Model

### Multi-Sig Thresholds

- **Diamond Upgrades**: 2-of-3 or 3-of-5 (high security)
- **Trading Operations**: 1-of-3 (faster execution)
- **Emergency Operations**: 3-of-5 (maximum security)

### Module Permissions

- **SafeDiamondModule**: Can only execute Diamond operations
- **Owners**: Can approve/reject transactions
- **Threshold**: Required signatures for execution

---

## 📊 Architecture

```
User Wallet (MetaMask/WalletConnect)
    ↓
Safe{Wallet} (Multi-sig)
    ↓
SafeDiamondModule (Module)
    ↓
Diamond Contract (Facets)
    ↓
Execution
```

---

## ✅ Status

**Files Created**:
- ✅ `integrations/safe_wallet.py` - Python integration
- ✅ `scripts/setup_safe_wallet.py` - Setup script
- ✅ `diamond-contract/contracts/safe/SafeDiamondModule.sol` - Module contract
- ✅ `diamond-contract/contracts/safe/SafeDiamondFactory.sol` - Factory contract
- ✅ `diamond-contract/scripts/deploy_safe_diamond.ts` - Deployment script
- ✅ `diamond-contract/SAFE_WALLET_INTEGRATION.md` - Integration plan
- ✅ `diamond-contract/SAFE_WALLET_SETUP.md` - Setup guide

**Next Steps**:
1. Deploy Safe{Wallet} on all chains
2. Deploy Diamond modules
3. Configure multi-sig
4. Test integration
5. Build unified interface

---

**Status**: Setup complete, ready for deployment 🚀
