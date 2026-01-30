# Tenderly Web3 Actions

Tenderly Web3 Actions for Diamond Contract monitoring and automation.

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
npm run deploy
# or
tenderly actions deploy
```

## Actions

### onboarding.ts
Monitors Diamond Contract events and performs automated actions:
- Diamond Cut event monitoring
- Primary wallet transaction tracking
- Automated alerts

## Configuration

Configuration is in `.tenderly/config.yaml`:
- Project slug: `Ua_0357/testnet`
- Access key: Configured via environment variable

## Documentation

- **Tenderly Examples**: https://github.com/Tenderly/tenderly-examples
- **Web3 Actions Docs**: https://docs.tenderly.co/web3-actions
- **Tenderly Dashboard**: https://dashboard.tenderly.co/
