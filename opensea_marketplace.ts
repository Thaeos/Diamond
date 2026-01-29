/**
 * OpenSea Marketplace Integration
 * 
 * Purpose: Honor those who code the tools and the users' ideas
 * 
 * Features:
 * - NFT artifacts deployed to OpenSea gallery
 * - Sell entire Diamond stack (all Diamonds together)
 * - Sell individual gems with royalties
 * - Attribution/credits for tool creators and idea originators
 * - Royalty configuration for creators
 */

import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

interface Creator {
  name: string;
  role: 'tool_creator' | 'idea_originator' | 'developer' | 'contributor';
  address?: string;
  contribution: string;
  royaltyPercentage?: number;
}

interface RoyaltyConfig {
  sellerFeeBasisPoints: number; // OpenSea uses basis points (100 = 1%)
  feeRecipient: string; // Address to receive royalties
  creators: Creator[];
}

interface OpenSeaMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  animation_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
  properties?: {
    creators?: Creator[];
    royalties?: RoyaltyConfig;
    collection?: {
      name: string;
      family: string;
    };
  };
}

interface GemNFT {
  gemId: string;
  name: string;
  school: string;
  rarity: string;
  prefixes: string[];
  suffixes: string[];
  modifiers: Array<{
    type: 'additive' | 'multiplicative';
    value: number;
  }>;
  diamondId?: string; // Which Diamond it's socketed in
  cid?: string;
  blockNumber?: number;
}

interface StackNFT {
  stackId: string;
  name: string;
  diamonds: string[]; // Diamond IDs in this stack
  gems: string[]; // Gem IDs in this stack
  totalValue: number;
  rarity: string;
  cid?: string;
  blockNumber?: number;
}

// Default creators/attributions
const SYSTEM_CREATORS: Creator[] = [
  {
    name: 'Tool Creators',
    role: 'tool_creator',
    contribution: 'EIP-2535 Diamond Standard, IPFS, FUSE, rsync, OpenSea',
    royaltyPercentage: 2.5
  },
  {
    name: 'Idea Originators',
    role: 'idea_originator',
    contribution: 'Cosmic Diamond concept, Gematria encoding, Aramaic glyphs, Script computation',
    royaltyPercentage: 2.5
  },
  {
    name: 'Developers',
    role: 'developer',
    contribution: 'System implementation, Smart contracts, NFT generation',
    royaltyPercentage: 2.5
  },
  {
    name: 'Community Contributors',
    role: 'contributor',
    contribution: 'Testing, feedback, improvements',
    royaltyPercentage: 1.0
  }
];

// Generate OpenSea-compatible metadata for Diamond NFT
function generateOpenSeaMetadata(
  diamondId: string,
  nftData: any,
  accumulatedFormula: any,
  creators: Creator[] = SYSTEM_CREATORS,
  royaltyConfig?: RoyaltyConfig
): OpenSeaMetadata {
  const totalRoyalty = creators.reduce((sum, c) => sum + (c.royaltyPercentage || 0), 0);
  const sellerFeeBasisPoints = Math.floor(totalRoyalty * 100); // Convert to basis points
  
  return {
    name: `Diamond ${diamondId} - ${nftData.glyph}`,
    description: `A unique Diamond NFT honoring tool creators and idea originators.\n\n` +
      `This Diamond represents the accumulated data formula combining:\n` +
      `- CID: ${nftData.cid.substring(0, 16)}...\n` +
      `- Glyph: ${nftData.glyph} (Gematria: ${nftData.gematria})\n` +
      `- Block Position: #${nftData.blockNumber}\n` +
      `- Greek Letters: ${nftData.greekLetters.join(', ')}\n` +
      `- Math Symbols: ${nftData.mathSymbols.join(', ')}\n` +
      `- Accumulated Formula Value: ${accumulatedFormula.numericValue.toLocaleString()}\n\n` +
      `**Attribution:**\n` +
      creators.map(c => `- ${c.name} (${c.role}): ${c.contribution}`).join('\n') +
      `\n\nThis NFT can be sold individually or as part of a complete Diamond stack.`,
    image: `ipfs://${nftData.cid}`,
    external_url: `https://opensea.io/assets/${nftData.network}/${nftData.address}/${diamondId}`,
    animation_url: `ipfs://${nftData.cid}/animation.svg`, // Optional animated version
    attributes: [
      { trait_type: 'Diamond ID', value: diamondId },
      { trait_type: 'Glyph', value: nftData.glyph },
      { trait_type: 'Gematria', value: nftData.gematria, display_type: 'number' },
      { trait_type: 'Block Number', value: nftData.blockNumber, display_type: 'number' },
      { trait_type: 'Network', value: nftData.network },
      { trait_type: 'Rarity', value: nftData.rarity },
      { trait_type: 'Accumulated Formula Value', value: accumulatedFormula.numericValue, display_type: 'number' },
      { trait_type: 'Greek Letters', value: nftData.greekLetters.join(', ') },
      { trait_type: 'Math Symbols', value: nftData.mathSymbols.join(', ') },
      { trait_type: 'Formulas Count', value: nftData.formulas.length, display_type: 'number' },
      { trait_type: 'CID Hash', value: nftData.cid.substring(0, 16) + '...' },
      { trait_type: 'Transaction Hash', value: nftData.txHash.substring(0, 16) + '...' }
    ],
    properties: {
      creators: creators,
      royalties: royaltyConfig || {
        sellerFeeBasisPoints,
        feeRecipient: creators[0]?.address || '0x0000000000000000000000000000000000000000',
        creators
      },
      collection: {
        name: 'Diamond Nervous System',
        family: 'Cosmic Diamonds'
      }
    }
  };
}

// Generate OpenSea metadata for Gem NFT
function generateGemOpenSeaMetadata(
  gem: GemNFT,
  creators: Creator[] = SYSTEM_CREATORS,
  royaltyConfig?: RoyaltyConfig
): OpenSeaMetadata {
  const totalRoyalty = creators.reduce((sum, c) => sum + (c.royaltyPercentage || 0), 0);
  const sellerFeeBasisPoints = Math.floor(totalRoyalty * 100);
  
  return {
    name: `${gem.name} - ${gem.school} ${gem.rarity}`,
    description: `A ${gem.rarity} ${gem.school} Gem NFT from the Diamond Nervous System.\n\n` +
      `**Properties:**\n` +
      `- School: ${gem.school}\n` +
      `- Rarity: ${gem.rarity}\n` +
      `- Prefixes: ${gem.prefixes.join(', ')}\n` +
      `- Suffixes: ${gem.suffixes.join(', ')}\n` +
      `- Modifiers: ${gem.modifiers.length} (${gem.modifiers.filter(m => m.type === 'additive').length} additive, ${gem.modifiers.filter(m => m.type === 'multiplicative').length} multiplicative)\n` +
      (gem.diamondId ? `- Socketed in: Diamond ${gem.diamondId}\n` : '- Not socketed\n') +
      `\n**Attribution:**\n` +
      creators.map(c => `- ${c.name} (${c.role}): ${c.contribution}`).join('\n') +
      `\n\nThis Gem can be sold individually with royalties, or socketed into a Diamond.`,
    image: gem.cid ? `ipfs://${gem.cid}` : `ipfs://placeholder`,
    external_url: `https://opensea.io/assets/${gem.school}/${gem.gemId}`,
    attributes: [
      { trait_type: 'Gem ID', value: gem.gemId },
      { trait_type: 'School', value: gem.school },
      { trait_type: 'Rarity', value: gem.rarity },
      { trait_type: 'Prefixes', value: gem.prefixes.join(', ') },
      { trait_type: 'Suffixes', value: gem.suffixes.join(', ') },
      { trait_type: 'Additive Modifiers', value: gem.modifiers.filter(m => m.type === 'additive').length, display_type: 'number' },
      { trait_type: 'Multiplicative Modifiers', value: gem.modifiers.filter(m => m.type === 'multiplicative').length, display_type: 'number' },
      { trait_type: 'Socketed', value: gem.diamondId ? `Diamond ${gem.diamondId}` : 'No', display_type: 'string' },
      ...(gem.blockNumber ? [{ trait_type: 'Block Number', value: gem.blockNumber, display_type: 'number' }] : [])
    ],
    properties: {
      creators: creators,
      royalties: royaltyConfig || {
        sellerFeeBasisPoints,
        feeRecipient: creators[0]?.address || '0x0000000000000000000000000000000000000000',
        creators
      },
      collection: {
        name: 'Diamond Gems',
        family: 'Diamond Nervous System'
      }
    }
  };
}

// Generate OpenSea metadata for Stack NFT (entire stack)
function generateStackOpenSeaMetadata(
  stack: StackNFT,
  creators: Creator[] = SYSTEM_CREATORS,
  royaltyConfig?: RoyaltyConfig
): OpenSeaMetadata {
  const totalRoyalty = creators.reduce((sum, c) => sum + (c.royaltyPercentage || 0), 0);
  const sellerFeeBasisPoints = Math.floor(totalRoyalty * 100);
  
  return {
    name: `${stack.name} - Complete Diamond Stack`,
    description: `A complete Diamond Nervous System stack containing:\n\n` +
      `**Diamonds:** ${stack.diamonds.length}\n` +
      stack.diamonds.map((id, i) => `  ${i + 1}. Diamond ${id}`).join('\n') +
      `\n\n**Gems:** ${stack.gems.length}\n` +
      stack.gems.map((id, i) => `  ${i + 1}. Gem ${id}`).join('\n') +
      `\n\n**Total Value:** ${stack.totalValue.toLocaleString()}\n` +
      `**Rarity:** ${stack.rarity}\n\n` +
      `**Attribution:**\n` +
      creators.map(c => `- ${c.name} (${c.role}): ${c.contribution}`).join('\n') +
      `\n\nThis complete stack can be sold as a single NFT artifact.`,
    image: stack.cid ? `ipfs://${stack.cid}` : `ipfs://placeholder`,
    external_url: `https://opensea.io/assets/stack/${stack.stackId}`,
    attributes: [
      { trait_type: 'Stack ID', value: stack.stackId },
      { trait_type: 'Diamonds Count', value: stack.diamonds.length, display_type: 'number' },
      { trait_type: 'Gems Count', value: stack.gems.length, display_type: 'number' },
      { trait_type: 'Total Value', value: stack.totalValue, display_type: 'number' },
      { trait_type: 'Rarity', value: stack.rarity },
      { trait_type: 'Diamonds', value: stack.diamonds.join(', ') },
      { trait_type: 'Gems', value: stack.gems.join(', ') },
      ...(stack.blockNumber ? [{ trait_type: 'Block Number', value: stack.blockNumber, display_type: 'number' }] : [])
    ],
    properties: {
      creators: creators,
      royalties: royaltyConfig || {
        sellerFeeBasisPoints,
        feeRecipient: creators[0]?.address || '0x0000000000000000000000000000000000000000',
        creators
      },
      collection: {
        name: 'Complete Diamond Stacks',
        family: 'Diamond Nervous System'
      }
    }
  };
}

// Generate OpenSea metadata file
function generateOpenSeaMetadataFile(
  type: 'diamond' | 'gem' | 'stack',
  id: string,
  metadata: OpenSeaMetadata
): void {
  const outputDir = path.join(process.cwd(), 'opensea_metadata');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const filename = `${type}_${id}_opensea.json`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(metadata, null, 2));
  
  console.log(`✅ OpenSea metadata saved: ${filepath}`);
}

// Generate royalty configuration
function generateRoyaltyConfig(
  feeRecipient: string,
  creators: Creator[] = SYSTEM_CREATORS
): RoyaltyConfig {
  const totalRoyalty = creators.reduce((sum, c) => sum + (c.royaltyPercentage || 0), 0);
  
  return {
    sellerFeeBasisPoints: Math.floor(totalRoyalty * 100), // Convert percentage to basis points
    feeRecipient,
    creators
  };
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === 'generate-diamond' && args[1]) {
    // Load Diamond data and generate OpenSea metadata
    const diamondId = args[1];
    const nftPath = path.join(process.cwd(), 'nfts', `diamond_${diamondId}_metadata.json`);
    
    if (!fs.existsSync(nftPath)) {
      console.error(`❌ NFT metadata not found for Diamond ${diamondId}`);
      console.error(`   Run: npm run nft generate ${diamondId} first`);
      return;
    }
    
    const nftData = JSON.parse(fs.readFileSync(nftPath, 'utf-8'));
    const accumulated = nftData.data_package.accumulated_formula;
    
    // Customize creators if needed
    const creators = SYSTEM_CREATORS;
    const royaltyConfig = generateRoyaltyConfig(
      creators[0]?.address || '0x0000000000000000000000000000000000000000',
      creators
    );
    
    const openseaMetadata = generateOpenSeaMetadata(
      diamondId,
      nftData.data_package,
      accumulated,
      creators,
      royaltyConfig
    );
    
    generateOpenSeaMetadataFile('diamond', diamondId, openseaMetadata);
    return;
  }
  
  if (args[0] === 'generate-stack') {
    // Generate stack metadata
    const stackId = args[1] || 'complete_stack_1';
    const diamonds = args[2] ? args[2].split(',') : ['1', '2', '3', '4', '5'];
    const gems = args[3] ? args[3].split(',') : [];
    
    const stack: StackNFT = {
      stackId,
      name: `Complete Diamond Stack ${stackId}`,
      diamonds,
      gems,
      totalValue: diamonds.length * 1000 + gems.length * 100,
      rarity: 'Legendary',
      blockNumber: Date.now() % 10000000
    };
    
    const creators = SYSTEM_CREATORS;
    const royaltyConfig = generateRoyaltyConfig(
      creators[0]?.address || '0x0000000000000000000000000000000000000000',
      creators
    );
    
    const openseaMetadata = generateStackOpenSeaMetadata(stack, creators, royaltyConfig);
    generateOpenSeaMetadataFile('stack', stackId, openseaMetadata);
    return;
  }
  
  if (args[0] === 'royalty-config') {
    const feeRecipient = args[1] || '0x0000000000000000000000000000000000000000';
    const config = generateRoyaltyConfig(feeRecipient);
    
    console.log(`\n💰 Royalty Configuration:\n`);
    console.log(`   Seller Fee: ${config.sellerFeeBasisPoints} basis points (${config.sellerFeeBasisPoints / 100}%)`);
    console.log(`   Fee Recipient: ${config.feeRecipient}`);
    console.log(`\n   Creators:\n`);
    config.creators.forEach((creator, i) => {
      console.log(`   ${i + 1}. ${creator.name} (${creator.role})`);
      console.log(`      Contribution: ${creator.contribution}`);
      console.log(`      Royalty: ${creator.royaltyPercentage || 0}%\n`);
    });
    
    // Save config
    const configPath = path.join(process.cwd(), 'royalty_config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Saved to: ${configPath}\n`);
    return;
  }
  
  console.log(`
🎨 OpenSea Marketplace Integration

Purpose: Honor tool creators and idea originators

Usage:
  npm run opensea generate-diamond <diamond-id>     - Generate OpenSea metadata for Diamond
  npm run opensea generate-stack [id] [diamonds] [gems] - Generate stack metadata
  npm run opensea royalty-config [fee-recipient]    - Generate royalty configuration

Examples:
  npm run opensea generate-diamond 1
  npm run opensea generate-stack stack1 "1,2,3,4,5" "gem1,gem2"
  npm run opensea royalty-config 0x1234...

Features:
  - Sell entire Diamond stack as single NFT
  - Sell individual gems with royalties
  - Attribution for tool creators and idea originators
  - Configurable royalty percentages
`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  generateOpenSeaMetadata,
  generateGemOpenSeaMetadata,
  generateStackOpenSeaMetadata,
  generateRoyaltyConfig,
  SYSTEM_CREATORS,
  Creator,
  RoyaltyConfig,
  OpenSeaMetadata
};
