# OpenSea Marketplace Integration

## Purpose

**Honor those who code the tools and the users' ideas.**

This system creates NFT artifacts that can be:
- **Deployed to OpenSea gallery**
- **Sold as entire Diamond stack** (all Diamonds together)
- **Sold as individual gems** (with royalties)
- **Attributed to creators** (tool creators, idea originators, developers, contributors)

## System Overview

### NFT Types

1. **Diamond NFTs**
   - Individual Diamond contracts
   - Rich data package (CID + Glyph + Block + Greek + Math + Gematria)
   - Can be sold individually

2. **Gem NFTs**
   - Individual gems from the gem system
   - School, rarity, prefixes, suffixes, modifiers
   - Can be sold with royalties
   - Can be socketed into Diamonds

3. **Stack NFTs**
   - Complete Diamond stack (all Diamonds + Gems)
   - Sold as single artifact
   - Highest value

## Attribution System

### Creators Honored

1. **Tool Creators** (2.5% royalty)
   - EIP-2535 Diamond Standard
   - IPFS
   - FUSE
   - rsync
   - OpenSea

2. **Idea Originators** (2.5% royalty)
   - Cosmic Diamond concept
   - Gematria encoding
   - Aramaic glyphs
   - Script computation

3. **Developers** (2.5% royalty)
   - System implementation
   - Smart contracts
   - NFT generation

4. **Community Contributors** (1.0% royalty)
   - Testing
   - Feedback
   - Improvements

**Total Royalty: 8.5%** (850 basis points)

## Usage

### Generate Diamond NFT Metadata

```bash
npm run opensea generate-diamond <diamond-id>
```

Example:
```bash
npm run opensea generate-diamond 1
```

Creates OpenSea-compatible metadata with:
- Full attribution
- Royalty configuration
- All attributes
- External URL

### Generate Stack NFT Metadata

```bash
npm run opensea generate-stack [stack-id] [diamonds] [gems]
```

Example:
```bash
npm run opensea generate-stack stack1 "1,2,3,4,5" "gem1,gem2,gem3"
```

Creates metadata for complete stack containing:
- All Diamonds
- All Gems
- Total value
- Rarity

### Generate Royalty Configuration

```bash
npm run opensea royalty-config [fee-recipient-address]
```

Example:
```bash
npm run opensea royalty-config 0x1234567890123456789012345678901234567890
```

Output:
```
💰 Royalty Configuration:

   Seller Fee: 850 basis points (8.5%)
   Fee Recipient: 0x1234...

   Creators:

   1. Tool Creators (tool_creator)
      Contribution: EIP-2535 Diamond Standard, IPFS, FUSE, rsync, OpenSea
      Royalty: 2.5%

   2. Idea Originators (idea_originator)
      Contribution: Cosmic Diamond concept, Gematria encoding, Aramaic glyphs, Script computation
      Royalty: 2.5%

   3. Developers (developer)
      Contribution: System implementation, Smart contracts, NFT generation
      Royalty: 2.5%

   4. Community Contributors (contributor)
      Contribution: Testing, feedback, improvements
      Royalty: 1.0%
```

## OpenSea Metadata Format

### Diamond NFT Metadata

```json
{
  "name": "Diamond 1 - 𐡀",
  "description": "A unique Diamond NFT honoring tool creators and idea originators...",
  "image": "ipfs://Qm1234...",
  "external_url": "https://opensea.io/assets/ethereum/0x.../1",
  "attributes": [
    { "trait_type": "Diamond ID", "value": "1" },
    { "trait_type": "Glyph", "value": "𐡀" },
    { "trait_type": "Gematria", "value": 9, "display_type": "number" },
    { "trait_type": "Block Number", "value": 18500000, "display_type": "number" },
    { "trait_type": "Accumulated Formula Value", "value": 50643, "display_type": "number" }
  ],
  "properties": {
    "creators": [...],
    "royalties": {
      "sellerFeeBasisPoints": 850,
      "feeRecipient": "0x...",
      "creators": [...]
    },
    "collection": {
      "name": "Diamond Nervous System",
      "family": "Cosmic Diamonds"
    }
  }
}
```

### Gem NFT Metadata

```json
{
  "name": "Fire Gem 1 - Fire Magic",
  "description": "A Magic Fire Gem NFT from the Diamond Nervous System...",
  "image": "ipfs://Qm5678...",
  "attributes": [
    { "trait_type": "School", "value": "Fire" },
    { "trait_type": "Rarity", "value": "Magic" },
    { "trait_type": "Prefixes", "value": "Burning, Flaming" },
    { "trait_type": "Suffixes", "value": "of Fire, of Flames" }
  ],
  "properties": {
    "royalties": {
      "sellerFeeBasisPoints": 850,
      "feeRecipient": "0x...",
      "creators": [...]
    }
  }
}
```

### Stack NFT Metadata

```json
{
  "name": "Complete Diamond Stack - Complete Stack 1",
  "description": "A complete Diamond Nervous System stack...",
  "image": "ipfs://Qm9abc...",
  "attributes": [
    { "trait_type": "Diamonds Count", "value": 5, "display_type": "number" },
    { "trait_type": "Gems Count", "value": 20, "display_type": "number" },
    { "trait_type": "Total Value", "value": 7000, "display_type": "number" },
    { "trait_type": "Rarity", "value": "Legendary" }
  ]
}
```

## Selling Options

### Option 1: Sell Entire Stack

Sell all Diamonds + Gems as single NFT:
- Highest value
- Complete system artifact
- One transaction
- Full attribution

### Option 2: Sell Individual Gems

Sell gems separately:
- Each gem has royalties
- Can be socketed into Diamonds
- Individual pricing
- Creator attribution per gem

### Option 3: Sell Individual Diamonds

Sell Diamonds separately:
- Each Diamond is unique
- Rich data package
- Can include socketed gems
- Full attribution

## Royalty Distribution

When an NFT is sold:

1. **Primary Sale**: Full price to seller
2. **Secondary Sale**: 8.5% royalty distributed:
   - 2.5% → Tool Creators
   - 2.5% → Idea Originators
   - 2.5% → Developers
   - 1.0% → Community Contributors

## OpenSea Gallery Setup

### Steps

1. **Generate NFTs**
   ```bash
   npm run nft generate-all
   ```

2. **Generate OpenSea Metadata**
   ```bash
   npm run opensea generate-diamond 1
   npm run opensea generate-diamond 2
   # ... for all Diamonds
   ```

3. **Upload to IPFS**
   - Upload SVG files
   - Upload metadata JSON files
   - Get IPFS hashes

4. **Deploy to OpenSea**
   - Create collection
   - Upload metadata
   - Set royalty recipients
   - List for sale

## File Structure

```
opensea_metadata/
  ├── diamond_1_opensea.json
  ├── diamond_2_opensea.json
  ├── gem_1_opensea.json
  ├── gem_2_opensea.json
  ├── stack_complete_stack_1_opensea.json
  └── ...

royalty_config.json
```

## Benefits

1. **Honors Creators**: Tool creators and idea originators get attribution and royalties
2. **Flexible Selling**: Sell entire stack or individual pieces
3. **Royalty System**: Ongoing revenue for creators
4. **Complete Attribution**: Every NFT credits all contributors
5. **OpenSea Compatible**: Standard format for easy listing

## Future Enhancements

- [ ] Automatic IPFS upload
- [ ] OpenSea API integration
- [ ] Batch listing tool
- [ ] Royalty distribution smart contract
- [ ] Multi-signature creator wallet
- [ ] Analytics dashboard
- [ ] Collection management UI
