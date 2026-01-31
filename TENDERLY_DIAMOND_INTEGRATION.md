# Tenderly + Diamond Integration — Complete Guide

## Overview

This integration provides **complete Diamond contract management** using Tenderly for verification, simulation, debugging, and monitoring across your 65 Treasure repos.

---

## What You Get

### 1. **Diamond Verification**
- Verify Diamond contracts and all facets
- Check verification status across 65 repos
- Identify unverified contracts

### 2. **Diamond Simulation**
- Simulate DiamondCut operations before execution
- Test facet upgrades safely
- Estimate gas costs

### 3. **Diamond Monitoring**
- Monitor facet changes across all repos
- Detect DiamondCut events
- Track Diamond Standard compliance

### 4. **Transaction Debugging**
- Debug failed DiamondCut operations
- Trace internal calls through facets
- Analyze gas usage

---

## Setup

### 1. Get Tenderly Credentials

**Full "get it / find it / search it" flow:** see **GET_IT.md**.

1. Go to [Tenderly Dashboard](https://dashboard.tenderly.co/) (register: https://dashboard.tenderly.co/register)
2. Create/select a project
3. Get your **Access Key**: Profile → Account Settings → [Access Tokens](https://dashboard.tenderly.co/account/authorization) → Generate
4. Get your **Node Access Key** from project Node RPC / gateway URL (see GET_IT.md or docs.tenderly.co/node)

### 2. Set Environment Variables

Add to `env.txt`:

```bash
TENDERLY_ACCESS_KEY=your_access_key_here
TENDERLY_USERNAME=your_username
TENDERLY_PROJECT=your_project_name
TENDERLY_NODE_ACCESS_KEY=your_node_key_here
```

---

## Usage

### Verify a Single Diamond

```bash
npm run tenderly-diamond verify -- 0xf7993A8df974AD022647E63402d6315137c58ABf 42161
```

**Output:**
- Diamond verification status
- All facet addresses
- Facet verification status
- Function selectors per facet

### Check Facets

```bash
npm run tenderly-diamond check-facets -- 0xf7993A8df974AD022647E63402d6315137c58ABf 42161
```

**Output:**
- List of all facets
- Function selectors for each facet
- Facet contract addresses

### Monitor Diamond Changes

```bash
npm run tenderly-diamond monitor -- 0xf7993A8df974AD022647E63402d6315137c58ABf 42161
```

**Output:**
- Current facet state
- Changes since last check
- Alerts on facet additions/removals

### Monitor All 65 Repos

```bash
npm run tenderly-diamond-repos
```

**Output:**
- Verification status for all Diamonds
- Compliance check for each Diamond
- Summary of verified vs unverified
- Results saved to `tenderly_diamond_repos_results.json`

### Continuous Monitoring

```bash
npm run tenderly-diamond-repos -- --watch
```

Monitors all repos every 5 minutes and alerts on changes.

---

## Integration with Your Diamond Foundation

### Your Architecture

```
Diamond Foundation (theosmagic/Diamond)
    │
    ├─→ 65 Treasure Repos (deploy Diamonds)
    │
    ├─→ Tenderly (verifies & monitors)
    │
    ├─→ Blockscout (on-chain monitoring)
    │
    └─→ Chainlink (automation)
```

### Diamond Contract Structure

- **Diamond**: Main upgradeable contract (EIP-2535)
- **Facets**: Modular contract pieces (like gems)
- **DiamondCut**: Function to add/replace/remove facets
- **Diamond Loupe**: Interface to query facets

### What Tenderly Provides

1. **Verification**: Source code visible in Tenderly Explorer
2. **Simulation**: Test DiamondCut before executing
3. **Debugging**: Trace failed transactions
4. **Monitoring**: Track facet changes
5. **Gas Analysis**: Optimize DiamondCut operations

---

## Workflow Examples

### Example 1: Verify New Diamond Deployment

```bash
# 1. Deploy Diamond from your repo
npx hardhat run scripts/deploy.ts --network arbitrum

# 2. Verify on Tenderly
npm run tenderly-diamond verify -- <diamondAddress> 42161

# 3. Check facets
npm run tenderly-diamond check-facets -- <diamondAddress> 42161
```

### Example 2: Simulate Facet Upgrade

```bash
# Before executing DiamondCut, simulate it:
npm run tenderly-diamond simulate-cut -- \
  <diamondAddress> \
  <newFacetAddress> \
  0 \
  42161

# If simulation succeeds, execute the real DiamondCut
```

### Example 3: Monitor All Repos

```bash
# Check all 65 repos for Diamond status
npm run tenderly-diamond-repos

# Review results
cat tenderly_diamond_repos_results.json

# Set up continuous monitoring
npm run tenderly-diamond-repos -- --watch
```

---

## Files Created

- `tenderly_diamond.ts` - Core Diamond verification/simulation
- `tenderly_diamond_repos.ts` - 65 repos monitoring
- `tenderly_diamond_verification.json` - Single Diamond results
- `tenderly_diamond_repos_results.json` - All repos results
- `tenderly_diamond_state.json` - Monitoring state

---

## Integration with Other Tools

### Blockscout Integration

Tenderly complements Blockscout:
- **Blockscout**: On-chain data, transaction history
- **Tenderly**: Source code, simulation, debugging

```bash
# Monitor on-chain activity
npm run blockscout-monitor -- --watch

# Verify contracts on Tenderly
npm run tenderly-diamond-repos
```

### Chainlink Integration

Use Chainlink Automation with Tenderly:
- **Tenderly**: Verify Diamond health
- **Chainlink**: Automate DiamondCut when conditions met

```bash
# Check Diamond status
npm run tenderly-diamond verify -- <address> 42161

# Set up Chainlink Upkeep for automated DiamondCut
npm run chainlink-upkeep -- --register
```

---

## Best Practices

### 1. Always Verify After Deployment

```bash
# Deploy → Verify → Monitor
npm run deploy-diamond
npm run tenderly-diamond verify -- <address> 42161
npm run tenderly-diamond monitor -- <address> 42161
```

### 2. Simulate Before DiamondCut

```bash
# Test facet upgrade before executing
npm run tenderly-diamond simulate-cut -- <diamond> <facet> 0 42161
```

### 3. Monitor Regularly

```bash
# Set up watch mode for continuous monitoring
npm run tenderly-diamond-repos -- --watch
```

### 4. Track Changes

```bash
# Check for facet changes
npm run tenderly-diamond monitor -- <address> 42161

# Review state file
cat tenderly_diamond_state.json
```

---

## Troubleshooting

### Tenderly Not Configured

```bash
# Check status
npm run tenderly-treasure status

# Set credentials in env.txt
echo "TENDERLY_ACCESS_KEY=your_key" >> env.txt
```

### No Facets Found

- Diamond may not be deployed
- Diamond Loupe interface not implemented
- Wrong chain ID

### Verification Fails

- Contract source not uploaded
- Compiler version mismatch
- Missing dependencies

---

## Next Steps

1. **Add Diamond addresses** to `treasure_repos.json` or `diamond_deployments.json`
2. **Verify all Diamonds** across 65 repos
3. **Set up monitoring** for continuous tracking
4. **Integrate with CI/CD** for automatic verification
5. **Use simulation** before every DiamondCut

---

## The Complete Picture

```
Your Diamond Foundation
    │
    ├─→ 65 Repos deploy Diamonds
    │
    ├─→ Tenderly verifies & monitors
    │
    ├─→ Blockscout tracks on-chain
    │
    ├─→ Chainlink automates operations
    │
    └─→ Your Agent orchestrates everything
```

**You now have complete visibility and control over your Diamond network across 65 repos!**
