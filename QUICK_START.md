# Quick Start Guide — Diamond Monitoring System

**Everything together in one run:** `npm run together` — see **TOGETHER.md**.

**Don't have it?** See **GET_IT.md** — use the tools, trial and error; get Tenderly keys; find it in this repo; search docs/web.

## 🚀 Get Started in 3 Steps

### Step 1: Configure Credentials

Edit `env.txt` with your credentials:

```bash
# Required for Tenderly
TENDERLY_ACCESS_KEY=your_key_here
TENDERLY_USERNAME=your_username
TENDERLY_PROJECT=your_project
TENDERLY_NODE_ACCESS_KEY=your_node_key

# Optional
GITHUB_TOKEN=your_github_token
RESERVOIR_API_KEY=your_reservoir_key
```

### Step 2: Add Diamond Addresses

Add your Diamond contract addresses to `diamond_deployments.json`:

```json
{
  "deployments": [
    {
      "repoName": "bridgeworld-docs",
      "repoUrl": "https://github.com/TreasureProject/bridgeworld-docs",
      "diamondAddress": "0xYourDiamondAddress",
      "chainId": 42161,
      "network": "arbitrum"
    }
  ]
}
```

Or update `treasure_repos.json` directly:

```json
{
  "repos": [
    {
      "url": "https://github.com/TreasureProject/bridgeworld-docs",
      "name": "bridgeworld-docs",
      "contractAddress": "0xYourDiamondAddress",
      "hasContracts": true
    }
  ]
}
```

### Step 3: Start Monitoring

```bash
# Run setup first
npm run setup

# Start continuous monitoring
npm run monitor

# Or run individual monitors
npm run blockscout-monitor -- --watch
npm run tenderly-diamond-repos -- --watch
```

---

## 📋 Available Commands

### Monitoring
```bash
npm run monitor              # Start all monitoring (background)
npm run stop-monitor         # Stop all monitoring
npm run blockscout-monitor   # Monitor 65 repos (one-shot)
npm run tenderly-diamond-repos # Monitor Diamond contracts
```

### Verification
```bash
npm run tenderly-diamond verify -- <address> [chainId]
npm run tenderly-diamond check-facets -- <address> [chainId]
npm run check-diamond-rpc <address>  # Check Diamond via RPC
```

### Testing
```bash
npm run test:systems         # Test all systems
npm run test-diamond         # Test Diamond functions
npm run treasure-repos-check # Check 65 repos status
```

### Setup
```bash
npm run setup                # Run setup script
```

---

## 🔍 What Gets Monitored

1. **Blockscout** - On-chain activity across 65 repos
   - Transaction monitoring
   - DiamondCut event detection
   - Large transfers
   - Failed transactions

2. **Tenderly** - Diamond contract verification
   - Contract verification status
   - Facet verification
   - Diamond Standard compliance
   - Function selector tracking

3. **Chainlink** - Automation readiness
   - Upkeep status
   - Floor price monitoring
   - Automated triggers

---

## 📊 Results & Logs

**Results saved to:**
- `blockscout_monitor_results.json` - Latest monitoring results
- `blockscout_monitor_state.json` - State tracking
- `tenderly_diamond_repos_results.json` - Diamond verification results
- `diamond_function_test_results.json` - Function test results

**Logs (when running in background):**
- `logs/blockscout.log`
- `logs/tenderly_diamond.log`
- `logs/treasure_floor.log`

---

## ⚡ Quick Commands

```bash
# Check everything at once
npm run setup

# Monitor one repo specifically
npm run blockscout-monitor -- --repo=bridgeworld-docs

# Check Diamond on specific chain
npm run tenderly-diamond verify -- 0x... 42161

# Continuous monitoring
npm run monitor
```

---

## 🎯 Next Steps

1. ✅ Configure `env.txt` with your credentials
2. ✅ Add Diamond addresses to `diamond_deployments.json`
3. ✅ Run `npm run setup` to verify configuration
4. ✅ Start monitoring with `npm run monitor`

**You're all set!** 🚀
