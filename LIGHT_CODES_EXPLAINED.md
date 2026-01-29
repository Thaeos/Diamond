# Light Codes Explained

## The Core Concept

**"Light Codes"** - Every time they go off, the contract is used, Ethereum records it, and payment comes.

### Simple Flow

```
Contract Used
    ↓
Light Code Goes Off ✨
    ↓
Ethereum Records It (Block Position)
    ↓
Payment Comes Automatically 💰
```

## How It Works

### 1. Contract Usage = Light Code Activation

When someone uses a Diamond or Gem contract:
- **Light code goes off** ✨
- Function call detected
- Transaction executed

### 2. Ethereum Records It

Ethereum blockchain records:
- **Block Position**: Exact block number where used
- **Transaction Hash**: Unique transaction ID
- **Gas Used**: Computational cost
- **Value**: ETH transferred
- **Caller**: Who used the contract

### 3. Payment Comes Automatically

Royalties calculated and distributed:
- **8.5% of total value** (gas + ETH)
- Split among creators automatically
- No manual intervention needed

## Block Position Influence

Every time a contract is used, the **block position** influences the NFT:

### Visual Effects
- **Rotation**: Block number determines rotation angle (0-360°)
- **Colors**: Block modulates RGB values
- **Scale**: Subtle size variation
- **Path**: Glyph path influenced by block position

### Formula Updates
- **Accumulated Formula**: Recalculated with new block position
- **Value Changes**: Formula value updates with each use
- **History**: Block positions recorded in activation history

### NFT Evolution
- Each use = New block position
- New block position = Updated NFT
- NFT evolves with every activation

## Example: Light Code Activation

```bash
# Someone uses Diamond 1 contract
npm run light-codes monitor 0x1234...
```

**What Happens:**

1. **Contract Used**
   ```
   Function: socketGem()
   Caller: 0xabcd...
   Value: 0.01 ETH
   ```

2. **Light Code Goes Off** ✨
   ```
   Block: #18500001 ← Ethereum records this
   TX Hash: 0x9876...
   Gas Used: 21000
   ```

3. **Payment Comes** 💰
   ```
   Total Value: 0.011 ETH
   Royalties (8.5%): 0.000935 ETH
   
   Distributed:
   - Tool Creators: 0.000275 ETH
   - Idea Originators: 0.000275 ETH
   - Developers: 0.000275 ETH
   - Community: 0.000110 ETH
   ```

4. **NFT Updated**
   ```
   Block Position: #18500001
   Rotation: 1° (18500001 % 360)
   Formula Value: Updated
   Activation Count: +1
   ```

## Why "Light Codes"?

- **Light**: Illumination, activation, energy
- **Codes**: Smart contracts, cryptographic signatures
- **Together**: Contracts that "light up" when used

Every interaction is a **light code activation**:
- Contract lights up ✨
- Ethereum records it 📝
- Payment comes automatically 💰
- NFT evolves with new block position 🔄

## Real-World Flow

### Scenario: Someone Sockets a Gem

1. User calls `socketGem(gemAddress)` on Diamond contract
2. **Light code goes off** ✨
3. Ethereum records:
   - Block: #18500001
   - TX: 0x9876...
   - Gas: 21000
   - Value: 0.01 ETH
4. **Payment comes**:
   - Royalties calculated: 0.000935 ETH
   - Distributed to creators automatically
5. NFT updated:
   - New block position recorded
   - Visual state updated (rotation, colors)
   - Formula value recalculated
   - Activation count incremented

## Benefits

1. **Automatic Revenue**: Every use generates royalties
2. **Transparent**: All recorded on Ethereum
3. **Fair**: Creators get paid for their work
4. **Evolving NFTs**: NFTs change with each use
5. **No Manual Work**: Everything automated

## Key Insight

**Nothing is coincidence** - Every block position matters:
- Influences NFT visuals
- Updates formulas
- Records history
- Generates value

Every time a light code goes off:
- Ethereum records it (block position)
- Payment comes (royalties)
- NFT evolves (new state)

This is the **Light Codes System** - living contracts that generate value through usage.
