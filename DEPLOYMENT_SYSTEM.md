# Diamond Deployment System

## Overview

When a Diamond contract is complete (deployed to a blockchain network), the deployment system:

1. **Detects Completion**: Checks if the Diamond is deployed at the specified address
2. **Network Selection**: Supports multiple networks (Ethereum, Polygon, Arbitrum, Optimism, Base, Sepolia)
3. **Fork Obsidian**: Creates a fork of the Obsidian vault with completion markers
4. **Publish to IPFS**: Publishes the Obsidian fork to IPFS for decentralized storage
5. **Merge Back**: Merges the completion markers back into the main vault

## Usage

```bash
npm run deploy-diamond <diamond-id> <address> <network>
```

### Example

```bash
npm run deploy-diamond 1 0x1234567890123456789012345678901234567890 ethereum
```

## Available Networks

- `ethereum` - Ethereum Mainnet (Chain ID: 1)
- `sepolia` - Sepolia Testnet (Chain ID: 11155111)
- `polygon` - Polygon (Chain ID: 137)
- `arbitrum` - Arbitrum One (Chain ID: 42161)
- `optimism` - Optimism (Chain ID: 10)
- `base` - Base (Chain ID: 8453)

## Process Flow

### 1. Detection
The script checks if the Diamond contract exists at the specified address using `eth_getCode`.

### 2. Fork Obsidian
- Creates a copy of the Obsidian vault
- Marks the Diamond node as complete
- Adds completion highlighting CSS class
- Updates Index.md with completion badge

### 3. IPFS Publishing
- Uses IPFS CLI if available (`ipfs add -r`)
- Falls back to HTTP API (Pinata, Web3.Storage, etc.)
- Returns IPFS hash (CID)

### 4. Merge Back
- Copies updated Diamond node to main vault
- Updates Index.md
- Cleans up fork directory

## Deployment Record

Deployments are stored in `diamond_deployments.json`:

```json
{
  "diamondId": "1",
  "address": "0x...",
  "network": "ethereum",
  "chainId": 1,
  "txHash": "...",
  "blockNumber": 12345678,
  "deployedAt": "2025-01-28T...",
  "ipfsHash": "Qm...",
  "obsidianForkUrl": "ipfs://Qm..."
}
```

## Obsidian Highlighting

Completed Diamonds are highlighted in Obsidian with:

- **CSS Class**: `.diamond-complete`
- **Visual**: Green border, glow effect, checkmark prefix
- **Graph Nodes**: Green fill with white border

## IPFS Setup

### Option 1: IPFS CLI (Recommended)

```bash
# Install IPFS
# macOS: brew install ipfs
# Linux: https://docs.ipfs.io/install/command-line/

# Initialize IPFS node
ipfs init

# Start IPFS daemon
ipfs daemon
```

### Option 2: IPFS Service

Update `deploy_diamond.ts` to use:
- **Pinata**: https://www.pinata.cloud/
- **Web3.Storage**: https://web3.storage/
- **NFT.Storage**: https://nft.storage/

## Integration with Obsidian

The deployment system automatically:

1. Adds `status: complete` to Diamond frontmatter
2. Adds completion badge to Diamond title
3. Updates Index.md with completion indicator
4. Adds IPFS hash to Diamond metadata

## Network Configuration

Networks are configured in `deploy_diamond.ts`:

```typescript
const NETWORKS: Record<string, NetworkConfig> = {
  ethereum: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    ipfsGateway: 'https://ipfs.io/ipfs/'
  },
  // ... more networks
};
```

## Future Enhancements

- [ ] Automatic transaction hash detection from explorer API
- [ ] Multi-network deployment in single command
- [ ] Deployment verification and testing
- [ ] Integration with Hardhat/Truffle deployment scripts
- [ ] Automatic Obsidian graph visualization updates
- [ ] IPFS pinning service integration
- [ ] Deployment notifications (Discord, Telegram, etc.)

## Troubleshooting

### "Diamond is not deployed"
- Verify the address is correct
- Check that the contract is actually deployed
- Ensure RPC endpoint is accessible

### "IPFS CLI not found"
- Install IPFS CLI or configure HTTP API fallback
- The script will generate a simulated hash for testing

### "Fork directory already exists"
- The script automatically cleans up, but you can manually delete `obsidian_vault_fork/`

## Security Notes

- Always verify contract addresses before deployment
- Use testnets for testing
- Keep deployment records secure (they contain transaction hashes)
- IPFS hashes are permanent - ensure vault content is correct before publishing
