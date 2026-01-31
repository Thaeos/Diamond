# WalletConnect Kit → MetaMask SDK → Safe{Wallet} → Diamond Framework

## 🎯 The Complete Architecture

```
┌─────────────────────────────────────────┐
│     WalletConnect Kit (AppKit)          │
│     Main wallet connection system       │
│     - 600+ wallets                      │
│     - Email/social login                │
│     - Multi-chain                       │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│     MetaMask SDK                        │
│     Plugs into WalletConnect             │
│     - No QR codes                       │
│     - Mobile-friendly                   │
│     - Direct connection                 │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│     Safe{Wallet}                        │
│     Injected through MetaMask            │
│     - Multi-signature                   │
│     - DAO treasury                      │
│     - Doesn't work standalone!         │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│     Diamond Contracts Framework         │
│     Injected into Safe{Wallet}          │
│     - All Diamond addresses             │
│     - Facets and gems                   │
│     - Nervous system                    │
│     - From diamond_deployments.json     │
└─────────────────────────────────────────┘
```

---

## 🔑 Why This Architecture?

### Safe{Wallet} Doesn't Work Standalone

**Reason:** Safe{Wallet} needs:
1. **WalletConnect Kit** - To connect wallets
2. **MetaMask SDK** - As the bridge/protocol
3. **Diamond Framework** - To have contracts to manage

**Without this stack:**
- Safe{Wallet} can't connect to wallets
- Safe{Wallet} has no contracts to manage
- Safe{Wallet} can't execute transactions

**With this stack:**
- WalletConnect provides wallet connection
- MetaMask SDK bridges WalletConnect to Safe
- Safe gets injected with Diamond framework
- Complete system operational

---

## 📦 Component Breakdown

### 1. **WalletConnect Kit (AppKit)**

**What it is:**
- Main wallet connection SDK
- Supports 600+ wallets
- Email/social login
- Multi-chain ready

**What it does:**
- Provides wallet connection infrastructure
- Handles wallet discovery (EIP-6963)
- Supports multiple connection methods
- Foundation for all wallet interactions

**Key Features:**
- Framework agnostic (React, Vue, Svelte, etc.)
- Hundreds of wallets
- Email & social login
- Multi-chain support
- Smart accounts support

### 2. **MetaMask SDK** (Plugs into WalletConnect)

**What it is:**
- MetaMask-specific SDK
- Plugs into WalletConnect Kit
- Provides MetaMask connection

**What it does:**
- Connects MetaMask through WalletConnect protocol
- No QR codes required
- Mobile-friendly (works on Fold7)
- Bridges WalletConnect to Safe{Wallet}

**Why it's needed:**
- Safe{Wallet} needs a wallet provider
- MetaMask SDK provides that bridge
- Enables Safe to interact with blockchain

### 3. **Safe{Wallet}** (Injected through MetaMask)

**What it is:**
- Gnosis Safe multi-signature wallet
- Injected through MetaMask SDK
- Doesn't work standalone

**What it does:**
- Provides multi-sig functionality
- Manages DAO treasury
- Coordinates approvals
- Executes when threshold met

**Why it needs injection:**
- Needs wallet connection (via WalletConnect + MetaMask)
- Needs contracts to manage (Diamond framework)
- Needs transaction building (via MetaMask SDK)

### 4. **Diamond Contracts Framework** (Injected into Safe)

**What it is:**
- All Diamond contract addresses
- From `diamond_deployments.json`
- Complete Diamond network

**What it does:**
- Provides contracts for Safe to manage
- Enables Safe to execute DiamondCut operations
- Links Safe to Diamond network
- Coordinates multi-sig Diamond upgrades

**Injection Process:**
1. Load `diamond_deployments.json`
2. Connect WalletConnect → MetaMask → Safe
3. Inject Diamond addresses into Safe
4. Safe can now manage Diamond contracts

---

## 🔄 The Complete Flow

### Initialization Flow

```
1. Initialize WalletConnect Kit
   │
2. MetaMask SDK plugs into WalletConnect
   │
3. Connect MetaMask through WalletConnect
   │
4. Safe{Wallet} gets injected through MetaMask
   │
5. Load diamond_deployments.json
   │
6. Inject Diamond framework into Safe{Wallet}
   │
7. Safe now has access to all Diamond contracts
```

### Transaction Flow

```
1. User wants to execute DiamondCut
   │
2. WalletConnect Kit initiates connection
   │
3. MetaMask SDK handles signing
   │
4. Safe{Wallet} builds multi-sig transaction
   │
5. Diamond framework provides contract addresses
   │
6. Transaction proposed to Safe
   │
7. Other signers approve
   │
8. Execute when threshold met
   │
9. DiamondCut executed on-chain
```

---

## 💻 Implementation

### Setup WalletConnect Kit

```bash
npm install @reown/appkit @reown/appkit-adapter-wagmi
```

### Configuration

```typescript
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum } from 'wagmi/chains'

const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID'

createAppKit({
  adapters: [new WagmiAdapter({ projectId, chains: [mainnet, arbitrum] })],
  projectId,
  chains: [mainnet, arbitrum],
})
```

### Connect Flow

```typescript
// 1. WalletConnect Kit connects
const { open } = useAppKit()

// 2. MetaMask SDK plugs in
const sdk = new MetaMaskSDK({
  // Uses WalletConnect protocol
})

// 3. Safe gets injected
const safe = await Safe.init({
  provider: sdk.getProvider(),
})

// 4. Inject Diamond framework
const diamonds = loadDiamondDeployments()
await injectDiamondsIntoSafe(safe, diamonds)
```

---

## 📋 Usage

### Initialize System

```bash
npm run walletconnect -- init
```

Shows the complete architecture and setup instructions.

### Connect Wallet

```bash
npm run walletconnect -- connect
```

Connects via WalletConnect Kit → MetaMask SDK.

### Inject Diamond Framework

```bash
npm run walletconnect -- inject-diamonds --safe <safeAddress> [--chain <chainId>]
```

Injects all Diamond contracts from `diamond_deployments.json` into Safe{Wallet}.

---

## 🔐 Why Safe{Wallet} Needs This Stack

### Without the Stack:

```
Safe{Wallet} (standalone)
  ❌ No wallet connection
  ❌ No contracts to manage
  ❌ Can't execute transactions
  ❌ No Diamond framework
```

### With the Stack:

```
WalletConnect Kit
  ↓ (provides wallet connection)
MetaMask SDK
  ↓ (bridges to Safe)
Safe{Wallet}
  ↓ (gets Diamond framework)
Diamond Contracts
  ✅ Complete system operational
```

---

## 🎯 Key Points

1. **WalletConnect Kit** is the main entry point
2. **MetaMask SDK** plugs into WalletConnect (not standalone)
3. **Safe{Wallet}** gets injected through MetaMask (doesn't work standalone)
4. **Diamond Framework** gets injected into Safe (from `diamond_deployments.json`)

**The injection chain:**
```
WalletConnect → MetaMask → Safe → Diamonds
```

**Each layer needs the previous one to function.**

---

## 📊 Data Flow

```
diamond_deployments.json (Diamond addresses)
    ↓
WalletConnect Kit (loads and connects)
    ↓
MetaMask SDK (bridges connection)
    ↓
Safe{Wallet} (receives Diamond framework)
    ↓
Diamond Contracts (managed by Safe)
```

---

## 🚀 Complete Integration

**The full stack enables:**
- ✅ Wallet connection via WalletConnect Kit
- ✅ MetaMask integration (no QR codes)
- ✅ Safe{Wallet} multi-sig operations
- ✅ Diamond contract management
- ✅ Multi-sig DiamondCut operations
- ✅ DAO treasury management
- ✅ Complete Diamond network coordination

**This is why Safe{Wallet} doesn't work standalone - it's part of a complete stack that includes WalletConnect Kit, MetaMask SDK, and the Diamond framework.**
