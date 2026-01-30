# ✅ Web3 Actions Deployment Guide

**Date**: January 30, 2026  
**Status**: ✅ Configuration Updated

---

## 🎯 Overview

Tenderly Web3 Actions are configured to monitor:
- ✅ Diamond Contract events (DiamondCut)
- ✅ Safe{Wallet} execution events (ExecutionSuccess/ExecutionFailure)
- ✅ Primary wallet transactions

---

## 📋 Configuration

### Project Details
- **Project Slug**: `Ua_0357/testnet`
- **Project ID**: `9a44e073-c1cc-41bf-8737-c4070d277bf2`
- **Network**: `73571` (Tenderly Virtual TestNet)
- **Sources Directory**: `actions`

### Files
- **`tenderly.yaml`** - Action configuration
- **`actions/onboarding.ts`** - Main action handler
- **`deploy.sh`** - Deployment script

---

## 🚀 Deployment

### Option 1: Use Deployment Script

```bash
cd web3-actions
export TENDERLY_API=LZAQjWhTiJJUskQJQXUzAw2ZE0EJpNni
./deploy.sh
```

### Option 2: Manual Deployment

```bash
cd web3-actions
export PATH="$PATH:/mnt/Vault/Cursor-Agent/bin"
export TENDERLY_API=LZAQjWhTiJJUskQJQXUzAw2ZE0EJpNni

# Login (if needed)
tenderly login --authentication-method access-key --access-key "$TENDERLY_API"

# Deploy
tenderly actions deploy --project Ua_0357/testnet
```

---

## ⚠️ Troubleshooting

### Contract Not Found Error

If you see:
```
Contract 0x... not found in project
```

**Solution**:
1. Deploy your Diamond Contract to Tenderly Virtual TestNet first
2. Add the contract address to your Tenderly project via Dashboard
3. Update `tenderly.yaml` with the specific contract address (optional)

### Project Selection Prompt

If deployment asks for project selection:
1. Select `Ua_0357/testnet` from the list
2. Or use `--project Ua_0357/testnet` flag

### Network Mismatch

Make sure `tenderly.yaml` uses network ID `73571` for Tenderly Virtual TestNet.

---

## 📝 Action Configuration

The action (`diamondContractMonitoring`) monitors:

1. **DiamondCut Events**
   - Triggered when Diamond Contract is upgraded
   - Logs facet changes
   - Sends alerts

2. **Safe{Wallet} Execution Events**
   - `ExecutionSuccess` - Successful Safe transactions
   - `ExecutionFailure` - Failed Safe transactions
   - Tracks all Safe operations

3. **Primary Wallet Transactions**
   - Monitors transactions involving `0x67A977eaD94C3b955ECbf27886CE9f62464423B2`
   - Sends alerts for critical operations

---

## 🔗 Resources

- **Tenderly Dashboard**: https://dashboard.tenderly.co/Ua_0357/project/testnet/9a44e073-c1cc-41bf-8737-c4070d277bf2/rpc-builder
- **Tenderly Docs**: https://docs.tenderly.co/web3-actions
- **Tenderly Examples**: https://github.com/Tenderly/tenderly-examples

---

## ✅ Status

**Web3 Actions Configuration**: ✅ Complete
- Action handler created
- Configuration updated
- Deployment script ready
- Monitoring Diamond Contract and Safe{Wallet}

**Next Steps**:
1. Deploy Diamond Contract to Tenderly Virtual TestNet
2. Deploy Web3 Actions using `./deploy.sh`
3. Monitor events in Tenderly Dashboard

---

**Status**: ✅ **WEB3 ACTIONS READY FOR DEPLOYMENT**
