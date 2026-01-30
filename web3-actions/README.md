# Tenderly Web3 Actions - Autonomous Agent Wallet

Tenderly Web3 Actions for monitoring Diamond Contract and Safe{Wallet} operations.

## Project Information

- **Username**: Ua_0357
- **Project**: testnet
- **Project ID**: 9a44e073-c1cc-41bf-8737-c4070d277bf2
- **Dashboard**: https://dashboard.tenderly.co/Ua_0357/project/testnet/9a44e073-c1cc-41bf-8737-c4070d277bf2/rpc-builder

## Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy actions
tenderly actions deploy
```

## Actions

### onboarding.ts (diamondContractMonitoring)
Monitors:
- ✅ Diamond Cut events
- ✅ Safe{Wallet} execution events (success/failure)
- ✅ Primary wallet transactions
- ✅ Automated alerts

## Configuration

Configuration is in `tenderly.yaml`:
- Project slug: `Ua_0357/testnet`
- Sources directory: `actions`
- Network: `73571` (Tenderly Virtual TestNet)

## Troubleshooting

### Contract Not Found Error
If you see "Contract not found in project", make sure:
1. The contract is deployed to Tenderly Virtual TestNet (chain ID 73571)
2. The contract address is added to your Tenderly project
3. The network ID matches in `tenderly.yaml`

### Deployment Issues
```bash
# Check Tenderly login
tenderly whoami

# Verify project configuration
cat tenderly.yaml

# Check actions directory
ls -la actions/
```

## Documentation

- **Tenderly Examples**: https://github.com/Tenderly/tenderly-examples
- **Web3 Actions Docs**: https://docs.tenderly.co/web3-actions
- **Tenderly Dashboard**: https://dashboard.tenderly.co/
