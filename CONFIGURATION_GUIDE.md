# Configuration Guide

## Overview

All system parameters are **configurable by developers** when the system goes live. Nothing is hardcoded - developers have full control over:

1. **Global Cooldown** - Duration between proc attempts
2. **Proc Rates** - Percentage chances by rarity
3. **Royalty Distribution** - Percentages and recipient addresses

## Configuration Files

All configuration files are located in: `light_codes/config/`

### 1. Global Cooldown (`global_cooldown.json`)

```json
{
  "enabled": true,
  "cooldownSeconds": 2.0,
  "lastProcAttempt": 0,
  "nextProcAvailable": 0
}
```

**Parameters:**
- `enabled`: Enable/disable global cooldown
- `cooldownSeconds`: Duration in seconds (default: 2.0)
- `lastProcAttempt`: Auto-updated timestamp
- `nextProcAvailable`: Auto-updated timestamp

**Note:** Global cooldown applies to entire source code, not per-caller.

### 2. Proc Rates (`proc_rates.json`)

```json
{
  "baseRates": {
    "Common": 5.0,
    "Magic": 10.0,
    "Rare": 15.0,
    "Epic": 25.0,
    "Legendary": 50.0
  },
  "modifiers": {
    "usageBonus": {
      "enabled": true,
      "perActivation": 0.1,
      "max": 10
    },
    "blockBonus": {
      "enabled": true,
      "blockInterval": 1000,
      "bonus": 5
    },
    "formulaBonus": {
      "enabled": true,
      "perValue": 10000,
      "max": 5
    }
  }
}
```

**Parameters:**
- `baseRates`: Proc rate percentages by rarity (to be decided by developers)
- `modifiers.usageBonus`: Bonus per activation (max cap)
- `modifiers.blockBonus`: Bonus on certain block intervals
- `modifiers.formulaBonus`: Bonus based on formula value

**Note:** All percentages are open for developer decision when live.

### 3. Royalties (`royalties.json`)

```json
{
  "enabled": true,
  "totalPercentage": 8.5,
  "distributions": [
    {
      "role": "tool_creator",
      "percentage": 2.5,
      "address": null
    },
    {
      "role": "idea_originator",
      "percentage": 2.5,
      "address": null
    },
    {
      "role": "developer",
      "percentage": 2.5,
      "address": null
    },
    {
      "role": "community_contributor",
      "percentage": 1.0,
      "address": null
    }
  ]
}
```

**Parameters:**
- `enabled`: Enable/disable royalty distribution
- `totalPercentage`: Total royalty percentage (to be decided by developers)
- `distributions`: Array of recipients
  - `role`: Role name
  - `percentage`: Percentage of total (to be decided by developers)
  - `address`: Ethereum address (to be set by developers when live)

**Note:** 
- Percentages are open for developer decision
- Addresses must be set when system goes live
- Cannot make decisions about tool set percentages independently

## Developer Responsibilities

When system goes live, developers should:

1. **Review Default Values**
   - Check all configuration files
   - Understand current defaults

2. **Set Cooldown**
   - Decide appropriate global cooldown duration
   - Consider network conditions and usage patterns

3. **Set Proc Rates**
   - Decide proc rates for each rarity tier
   - Balance fairness vs. excitement
   - Consider economic impact

4. **Set Royalty Distribution**
   - Decide total royalty percentage
   - Allocate percentages to each role
   - Set recipient addresses for each role
   - Ensure addresses are valid Ethereum addresses

5. **Test Configuration**
   - Test with different values
   - Verify cooldown works correctly
   - Verify proc rates are fair
   - Verify royalty distribution

## Why Configurable?

1. **Flexibility**: System can adapt to different needs
2. **Fairness**: Developers decide what's fair
3. **Transparency**: All values visible in config files
4. **No Hardcoding**: Nothing locked in code
5. **Future-Proof**: Can adjust as needed

## Important Notes

- **Global Cooldown**: Applies to entire source code, not per-caller
- **Proc Rates**: Open for developer decision (not hardcoded)
- **Royalties**: Percentages and addresses open for developer decision
- **Tool Set**: Cannot assign percentages to tool creators independently
- **Live Deployment**: All values should be reviewed and set before going live

## Example: Setting Up for Live

```bash
# 1. Review default configs
cat light_codes/config/global_cooldown.json
cat light_codes/config/proc_rates.json
cat light_codes/config/royalties.json

# 2. Edit cooldown (if needed)
# Set to 3.0 seconds for example
# Edit global_cooldown.json

# 3. Edit proc rates (if needed)
# Adjust percentages for each rarity
# Edit proc_rates.json

# 4. Set royalty addresses
# Add Ethereum addresses for each role
# Edit royalties.json

# 5. Test configuration
npm run light-codes monitor 0x1234...
```

## Default Values (For Reference)

- **Cooldown**: 2.0 seconds
- **Proc Rates**: Common 5%, Magic 10%, Rare 15%, Epic 25%, Legendary 50%
- **Royalties**: 8.5% total (2.5% each for tool/idea/dev, 1% community)

**These are starting points - developers decide final values when live.**
