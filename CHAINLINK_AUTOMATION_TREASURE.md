# Chainlink Automation Upkeep for TreasureDAO Floor Prices

This doc describes how to use **Blockscout** as the data feed and **Chainlink Automation** (Upkeep) to react to TreasureDAO floor price conditions—closing the loop with Cursor, signature.js, and MetaMask SDK.

---

## 1. Architecture

| Component | Role |
|-----------|------|
| **Blockscout** | On-chain truth: logs, balances, internal traces. Use REST/RPC for contract state and events. |
| **Reservoir / custom API** | NFT floor price (Reservoir supports Arbitrum; or your own indexer). |
| **chainlink_treasure_floor_monitor.ts** | Cursor script: fetches floor, compares to thresholds, exits with code or writes state for downstream (e.g. signature.js). |
| **Chainlink Automation** | Upkeep that runs on a schedule or condition; can call your contract when “perform” is needed. |
| **Your Upkeep contract** | Implements `checkUpkeep` / `performUpkeep`; can read a stored floor (e.g. updated by Chainlink Functions) and trigger logic (e.g. emit event, call trading contract). |

---

## 2. Run the Floor Monitor (Cursor / terminal)

One-shot:

```bash
npm run treasure-floor
```

Watch mode (poll every 60s, alert when threshold crossed):

```bash
npm run treasure-floor -- --watch --alert-below 0.5 --alert-above 2.0
```

Custom collection and poll interval:

```bash
npm run treasure-floor -- --watch --alert-below 0.3 0xYourCollectionAddress --poll 120
```

Environment:

- `TREASURE_COLLECTION` – default collection contract (Arbitrum).
- `RESERVOIR_API_KEY` – optional; improves Reservoir rate limits.
- `BLOCKSCOUT_API` – optional; custom Blockscout base URL (e.g. `https://arbitrum.blockscout.com/api`).

When `--alert-below` or `--alert-above` is hit, the script exits with code 1 so a cron or wrapper can trigger the next step (e.g. run signature.js, or write a flag file for Chainlink Functions / your relayer).

---

## 3. Chainlink Automation Upkeep (on-chain)

Chainlink Automation calls your contract:

1. **checkUpkeep(bytes calldata)** → returns `(bool upkeepNeeded, bytes performData)`.
2. **performUpkeep(bytes calldata)** → executes when `upkeepNeeded` was true.

To drive this from “TreasureDAO floor price” you need the floor **on-chain** in some form.

### Option A: Stored floor updated by Chainlink Functions

1. **Contract stores “last floor”** (e.g. updated by a Chainlink Functions job that calls Reservoir/Blockscout and writes the value).
2. **Upkeep contract** implements Automation’s interface and in `checkUpkeep`:
   - Reads the stored floor from that contract.
   - Compares to your thresholds (e.g. below 0.5 ETH or above 2.0 ETH).
   - Returns `(true, abi.encode(thresholdType, collection))` when condition is met.
3. **performUpkeep** decodes `performData` and runs your logic (e.g. emit event, call your trading contract).

### Option B: Off-chain monitor + relayer

1. **chainlink_treasure_floor_monitor.ts** runs on a schedule (cron) with `--alert-below` / `--alert-above`.
2. When it exits with code 1, a relayer (or Chainlink Functions) submits a transaction that:
   - Calls your “trigger” contract to perform the desired action, or
   - Updates a stored floor value that a separate Upkeep contract then checks.

### Option C: Log trigger Upkeep

If you have a contract that **emits an event** when floor crosses a threshold (e.g. updated by your backend or Functions), you can register a **Log trigger** Upkeep that runs when that event is emitted. Then `performUpkeep` only needs to execute the follow-up logic.

---

## 4. Register an Upkeep (Chainlink Automation)

1. Go to [Chainlink Automation (Automation App)](https://automation.chain.link/) and select **Arbitrum** (or your chain).
2. **Create Upkeep**:
   - **Log trigger**: attach to contract + event that indicates “floor threshold crossed.”
   - **Conditional**: attach to your contract that implements `checkUpkeep` / `performUpkeep` (and optionally stores floor or reads from an oracle).
3. Fund the Upkeep with LINK so the registry can pay for `performUpkeep` execution.
4. Your contract must implement:

```solidity
interface AutomationCompatibleInterface {
  function checkUpkeep(bytes calldata data) external returns (bool upkeepNeeded, bytes memory performData);
  function performUpkeep(bytes calldata performData) external;
}
```

---

## 5. Minimal Upkeep contract (conditional, threshold check)

Example skeleton: upkeep is “needed” when a **stored floor** (set by your Functions job or relayer) is below or above thresholds.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IFloorOracle {
  function getFloorWei(address collection) external view returns (uint256);
}

contract TreasureFloorUpkeep is AutomationCompatibleInterface {
  IFloorOracle public oracle;
  address public collection;
  uint256 public alertBelowWei;  // e.g. 0.5 ether
  uint256 public alertAboveWei;   // e.g. 2 ether

  constructor(address _oracle, address _collection, uint256 _alertBelowWei, uint256 _alertAboveWei) {
    oracle = IFloorOracle(_oracle);
    collection = _collection;
    alertBelowWei = _alertBelowWei;
    alertAboveWei = _alertAboveWei;
  }

  function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
    uint256 floor = oracle.getFloorWei(collection);
    if (floor > 0 && floor < alertBelowWei) {
      return (true, abi.encode("below", floor));
    }
    if (alertAboveWei > 0 && floor > alertAboveWei) {
      return (true, abi.encode("above", floor));
    }
    return (false, "");
  }

  function performUpkeep(bytes calldata performData) external override {
    (string memory kind, uint256 floor) = abi.decode(performData, (string, uint256));
    // Your logic: emit event, call trading contract, etc.
    emit FloorThresholdCrossed(collection, kind, floor);
  }

  event FloorThresholdCrossed(address indexed collection, string kind, uint256 floor);
}
```

You still need an **oracle** that implements `getFloorWei(collection)`. Options:

- A contract updated by **Chainlink Functions** (periodic job that calls Reservoir/your API and sets the floor).
- A contract updated by your **relayer** when `chainlink_treasure_floor_monitor.ts` alerts.

---

## 6. Wiring it together

1. **Data**: Run `npm run treasure-floor` (or `--watch`) so Cursor/terminal has a live view; use Reservoir + Blockscout as needed.
2. **Thresholds**: Use `--alert-below` / `--alert-above` so the script exits with code 1 when you want to act.
3. **Cursor / agent**: Have the agent run the script or read its output; on alert, trigger signature.js or your next step.
4. **On-chain Upkeep**: Deploy an Automation-compatible contract (e.g. `TreasureFloorUpkeep`) that reads floor from an oracle; register it in the Chainlink Automation app and fund it with LINK.
5. **Oracle for floor**: Implement the oracle (Functions job or relayer that updates a `getFloorWei` contract) so your Upkeep has on-chain “truth” for floor price.

Once the oracle and Upkeep are deployed and registered, Chainlink Automation will call `performUpkeep` when your conditions are met—giving you a **closed-loop, trust-minimized** trigger for TreasureDAO floor moves.
