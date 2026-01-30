# ✅ Tenderly RPC Endpoints Configured

**Date**: January 29, 2026  
**Status**: ✅ Tenderly Virtual RPC Endpoints Configured

---

## ✅ RPC Endpoints Configuration

### HTTP Endpoints
1. `https://virtual.mainnet.us-east.rpc.tenderly.co/ba0e32f8-b5f3-4ca6-a2cc-3ab4fa250000`
2. `https://virtual.mainnet.us-east.rpc.tenderly.co/776c4f4c-e39b-4465-b87e-88101f9cabdd`

### WebSocket Endpoints
1. `wss://virtual.mainnet.us-east.rpc.tenderly.co/73a5b144-1e5e-4706-ab25-9b3085afd5f4`
2. `wss://virtual.mainnet.us-east.rpc.tenderly.co/cd99bef4-16d5-426e-ad02-c51d14f42885`

---

## 📋 Integration Points

### 1. **Configuration Files**

#### `config/defaults.json`
- Added `rpc_endpoints` to `tenderly_api` configuration
- Stores HTTP and WebSocket endpoints

#### `integrations/config.py`
- Updated to include RPC endpoints in defaults
- Environment variable support for custom endpoints

### 2. **Python Integration**

#### `integrations/tenderly_rpc.py` (New)
- `TenderlyRPC` class for RPC endpoint management
- `get_http_endpoint()` - Get HTTP endpoint
- `get_websocket_endpoint()` - Get WebSocket endpoint
- `get_web3_provider()` - Get Web3.py provider
- Multi-endpoint support

### 3. **TypeScript Integration**

#### `diamond-contract/scripts/ethers_integration.ts` (Updated)
- `getTenderlyProvider()` - Get Tenderly HTTP provider
- `getTenderlyWebSocketProvider()` - Get Tenderly WebSocket provider
- Multi-endpoint support

---

## 🚀 Usage Examples

### Python - Get RPC Endpoints
```python
from integrations.tenderly_rpc import get_tenderly_rpc, get_tenderly_http_endpoint

rpc = get_tenderly_rpc()
endpoints = rpc.get_all_endpoints()

# Get specific endpoint
http_endpoint = get_tenderly_http_endpoint(0)
ws_endpoint = rpc.get_websocket_endpoint(0)
```

### Python - Use with Web3.py
```python
from integrations.tenderly_rpc import get_tenderly_rpc

rpc = get_tenderly_rpc()
provider = rpc.get_web3_provider(endpoint_index=0, use_websocket=False)

# Use provider for transactions
w3 = provider
# ... use w3 for transactions
```

### TypeScript - Use with Ethers.js
```typescript
import { getTenderlyProvider, getTenderlyWebSocketProvider } from './ethers_integration';

// Get HTTP provider
const httpProvider = getTenderlyProvider(0);

// Get WebSocket provider
const wsProvider = getTenderlyWebSocketProvider(0);

// Use providers for transactions
const balance = await httpProvider.getBalance("0x67A977eaD94C3b955ECbf27886CE9f62464423B2");
```

---

## 🔧 Environment Variables

### Custom Endpoints
```bash
export TENDERLY_RPC_HTTP_1=https://virtual.mainnet.us-east.rpc.tenderly.co/ba0e32f8-b5f3-4ca6-a2cc-3ab4fa250000
export TENDERLY_RPC_HTTP_2=https://virtual.mainnet.us-east.rpc.tenderly.co/776c4f4c-e39b-4465-b87e-88101f9cabdd
export TENDERLY_RPC_WS_1=wss://virtual.mainnet.us-east.rpc.tenderly.co/73a5b144-1e5e-4706-ab25-9b3085afd5f4
export TENDERLY_RPC_WS_2=wss://virtual.mainnet.us-east.rpc.tenderly.co/cd99bef4-16d5-426e-ad02-c51d14f42885
```

---

## ✅ Features

### Tenderly Virtual RPC
- ✅ Enhanced transaction debugging
- ✅ State inspection
- ✅ Fork simulation
- ✅ Multi-endpoint support
- ✅ HTTP and WebSocket support

### Integration
- ✅ Python integration (tenderly_rpc.py)
- ✅ TypeScript integration (ethers_integration.ts)
- ✅ Configuration management
- ✅ Environment variable support

---

## 🔗 Resources

### Tenderly RPC
- **Documentation**: https://docs.tenderly.co/web3-actions/rpc
- **Virtual Networks**: https://docs.tenderly.co/web3-actions/virtual-networks
- **Dashboard**: https://dashboard.tenderly.co/

---

## ✅ Verification

**Configuration**: ✅ Complete
- RPC endpoints added to `config/defaults.json`
- Python integration created (`tenderly_rpc.py`)
- TypeScript integration updated (`ethers_integration.ts`)
- Multi-endpoint support implemented

**Integration**: ✅ Complete
- HTTP endpoints accessible
- WebSocket endpoints accessible
- Web3.py provider support
- Ethers.js provider support

---

**Status**: ✅ **TENDERLY RPC ENDPOINTS CONFIGURED**

**Tenderly Virtual RPC endpoints are now configured and ready for enhanced debugging and simulation.** 🚀
