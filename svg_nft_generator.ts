/**
 * SVG NFT Generator
 * 
 * Purpose: Generate unique SVG NFTs from rich data packages
 * 
 * Each Diamond contains enough data for NFT generation:
 * - CID hash (cryptographic identity)
 * - Aramaic glyph (visual symbol)
 * - Greek letters (from computation formulas)
 * - Math symbols (from formulas)
 * - Gematria values (numerical encoding)
 * 
 * Nothing is coincidence - each element contributes meaningful data
 * Together, they form a complete data package for AI-generated SVG NFTs
 */

import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

interface DiamondNFTData {
  diamondId: string;
  address: string;
  network: string;
  cid: string;
  glyph: string;
  gematria: number;
  greekLetters: string[];
  mathSymbols: string[];
  formulas: string[];
  rarity: string;
  color: string;
  createdAt: string;
  blockNumber: number; // Block position where Diamond was deployed
  txHash: string; // Transaction hash
}

interface SVGAttributes {
  width: number;
  height: number;
  viewBox: string;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  shapes: Array<{
    type: 'circle' | 'rect' | 'path' | 'text' | 'polygon';
    attributes: Record<string, string | number>;
    content?: string;
  }>;
  patterns: Array<{
    id: string;
    type: 'linearGradient' | 'radialGradient' | 'pattern';
    attributes: Record<string, string | number>;
  }>;
}

// Accumulated Data Formula: Combines all elements
function calculateAccumulatedFormula(data: DiamondNFTData): {
  formula: string;
  numericValue: number;
  components: Record<string, number>;
} {
  // Extract numeric components
  const cidNumeric = parseInt(data.cid.substring(2, 10), 16) || 0; // First 8 hex chars of CID
  const glyphNumeric = data.gematria;
  const blockNumeric = data.blockNumber;
  const gematriaNumeric = data.gematria;
  const greekNumeric = data.greekLetters.length * 100; // Weight Greek letters
  const mathNumeric = data.mathSymbols.length * 50; // Weight math symbols
  
  // Accumulated formula: CID + Glyph + Block + Gematria + Greek + Math
  const accumulatedValue = 
    (cidNumeric % 10000) +
    (glyphNumeric * 10) +
    (blockNumeric % 100000) +
    (gematriaNumeric * 5) +
    greekNumeric +
    mathNumeric;
  
  // Create formula string representation
  const formula = `(CID:${cidNumeric % 1000} + Glyph:${glyphNumeric} × 10 + Block:${blockNumeric % 10000} + Gematria:${gematriaNumeric} × 5 + Greek:${greekNumeric} + Math:${mathNumeric}) = ${accumulatedValue}`;
  
  return {
    formula,
    numericValue: accumulatedValue,
    components: {
      cid: cidNumeric % 10000,
      glyph: glyphNumeric,
      block: blockNumeric % 100000,
      gematria: gematriaNumeric,
      greek: greekNumeric,
      math: mathNumeric
    }
  };
}

// Generate unique color palette from accumulated data formula
function generateColorPalette(data: DiamondNFTData): {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  blockColor: string;
} {
  // Use accumulated formula for deterministic colors
  const accumulated = calculateAccumulatedFormula(data);
  
  // Combine CID + Block + Glyph + Gematria for hash
  const hash = createHash('sha256')
    .update(data.cid + data.blockNumber.toString() + data.glyph + data.gematria.toString())
    .digest('hex');
  
  // Extract colors from hash (influenced by block position)
  const r1 = parseInt(hash.substring(0, 2), 16);
  const g1 = parseInt(hash.substring(2, 4), 16);
  const b1 = parseInt(hash.substring(4, 6), 16);
  
  const r2 = parseInt(hash.substring(6, 8), 16);
  const g2 = parseInt(hash.substring(8, 10), 16);
  const b2 = parseInt(hash.substring(10, 12), 16);
  
  // Block position influences color (modulate by block number)
  const blockMod = data.blockNumber % 255;
  const blockR = (r1 + blockMod) % 255;
  const blockG = (g1 + (blockMod * 2)) % 255;
  const blockB = (b1 + (blockMod * 3)) % 255;
  
  // Dark background (from rarity color + block position)
  const bgHash = createHash('md5').update(data.rarity + data.blockNumber.toString()).digest('hex');
  const bgR = Math.floor(parseInt(bgHash.substring(0, 2), 16) * 0.1);
  const bgG = Math.floor(parseInt(bgHash.substring(2, 4), 16) * 0.1);
  const bgB = Math.floor(parseInt(bgHash.substring(4, 6), 16) * 0.1);
  
  return {
    primary: `rgb(${r1}, ${g1}, ${b1})`,
    secondary: `rgb(${r2}, ${g2}, ${b2})`,
    accent: data.color, // From rarity system
    background: `rgb(${bgR}, ${bgG}, ${bgB})`,
    blockColor: `rgb(${blockR}, ${blockG}, ${blockB})` // Block-influenced color
  };
}

// Generate SVG path from glyph shape (influenced by block position)
function generateGlyphPath(glyph: string, gematria: number, blockNumber: number): string {
  // Use accumulated formula: gematria + block position determines complexity
  const complexity = Math.min((gematria + (blockNumber % 100)) % 20, 10);
  
  // Generate path based on glyph + gematria + block position
  const hash = createHash('md5')
    .update(glyph + gematria.toString() + blockNumber.toString())
    .digest('hex');
  
  // Block position influences starting point
  const blockOffsetX = (blockNumber % 50) - 25;
  const blockOffsetY = ((blockNumber * 2) % 50) - 25;
  
  // Create organic path from hash (block-influenced)
  let path = `M ${50 + (parseInt(hash.substring(0, 2), 16) % 20) + blockOffsetX} ${50 + (parseInt(hash.substring(2, 4), 16) % 20) + blockOffsetY}`;
  
  for (let i = 0; i < complexity; i++) {
    // Block position influences each point
    const blockMod = (blockNumber + i) % 100;
    const x = 50 + (parseInt(hash.substring(i * 2, i * 2 + 2), 16) % 100) + (blockMod % 10);
    const y = 50 + (parseInt(hash.substring(i * 2 + 1, i * 2 + 3), 16) % 100) + ((blockMod * 2) % 10);
    const curve = i % 2 === 0 ? 'Q' : 'L';
    path += ` ${curve} ${x} ${y}`;
  }
  
  path += ' Z';
  return path;
}

// Generate Greek letter shapes
function generateGreekShapes(greekLetters: string[]): Array<{ type: string; attributes: Record<string, any> }> {
  return greekLetters.map((letter, i) => {
    const angle = (i * 360) / greekLetters.length;
    const radius = 30 + (i * 5);
    const x = 100 + radius * Math.cos((angle * Math.PI) / 180);
    const y = 100 + radius * Math.sin((angle * Math.PI) / 180);
    
    return {
      type: 'text',
      attributes: {
        x: x,
        y: y,
        'font-family': 'serif',
        'font-size': 20 + i * 2,
        'fill': `rgba(255, 255, 255, ${0.7 + i * 0.1})`,
        'text-anchor': 'middle',
        transform: `rotate(${angle} ${x} ${y})`
      },
      content: letter
    };
  });
}

// Generate math symbol patterns
function generateMathPatterns(mathSymbols: string[]): Array<{ id: string; type: string; attributes: Record<string, any> }> {
  return mathSymbols.map((symbol, i) => {
    const hash = createHash('md5').update(symbol).digest('hex');
    const r = parseInt(hash.substring(0, 2), 16);
    const g = parseInt(hash.substring(2, 4), 16);
    const b = parseInt(hash.substring(4, 6), 16);
    
    return {
      id: `pattern_${i}`,
      type: 'pattern',
      attributes: {
        id: `pattern_${i}`,
        x: i * 20,
        y: i * 20,
        width: 40,
        height: 40,
        patternUnits: 'userSpaceOnUse'
      }
    };
  });
}

// Generate complete SVG NFT using accumulated data formula
function generateSVGNFT(data: DiamondNFTData): string {
  // Calculate accumulated data formula
  const accumulated = calculateAccumulatedFormula(data);
  
  const colors = generateColorPalette(data);
  const glyphPath = generateGlyphPath(data.glyph, data.gematria, data.blockNumber);
  const greekShapes = generateGreekShapes(data.greekLetters);
  const mathPatterns = generateMathPatterns(data.mathSymbols);
  
  // Block position influences visual elements
  const blockAngle = (data.blockNumber % 360); // Rotation angle from block
  const blockScale = 1 + ((data.blockNumber % 100) / 1000); // Subtle scale variation
  
  // Calculate dimensions based on data complexity
  const width = 400;
  const height = 400;
  
  // Generate SVG
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background gradient -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.background};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.primary};stop-opacity:0.3" />
    </linearGradient>
    
    <!-- Primary gradient -->
    <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
    </linearGradient>
    
    <!-- Accent gradient -->
    <radialGradient id="accentGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${colors.accent};stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.2" />
    </radialGradient>
    
    ${mathPatterns.map(p => `
    <pattern id="${p.id}" x="${p.attributes.x}" y="${p.attributes.y}" 
             width="${p.attributes.width}" height="${p.attributes.height}" 
             patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="5" fill="${colors.accent}" opacity="0.3"/>
    </pattern>`).join('')}
    
    <!-- Glow filter -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
  
  <!-- Math symbol patterns overlay -->
  ${mathPatterns.map((p, i) => 
    `<rect x="${p.attributes.x}" y="${p.attributes.y}" 
           width="${p.attributes.width}" height="${p.attributes.height}" 
           fill="url(#${p.id})" opacity="0.1"/>`
  ).join('')}
  
  <!-- Central glyph shape (block-influenced rotation) -->
  <g transform="translate(${width/2}, ${height/2}) rotate(${blockAngle}) scale(${blockScale})">
    <path d="${glyphPath}" 
          fill="url(#primaryGradient)" 
          stroke="${colors.accent}" 
          stroke-width="2"
          filter="url(#glow)"
          opacity="0.9"/>
    
    <!-- Glyph text overlay -->
    <text x="0" y="0" 
          font-family="serif" 
          font-size="80" 
          fill="${colors.accent}" 
          text-anchor="middle" 
          dominant-baseline="central"
          opacity="0.8"
          filter="url(#glow)">${data.glyph}</text>
  </g>
  
  <!-- Block position indicator (visual representation) -->
  <g transform="translate(${width/2}, ${height/2})">
    <circle cx="0" cy="-120" r="30" 
            fill="${colors.blockColor}" 
            opacity="0.6"
            stroke="${colors.accent}"
            stroke-width="2"/>
    <text x="0" y="-115" 
          font-family="monospace" 
          font-size="16" 
          fill="${colors.background}" 
          text-anchor="middle"
          font-weight="bold">#${data.blockNumber}</text>
  </g>
  
  <!-- Greek letters orbiting -->
  ${greekShapes.map(shape => `
    <text x="${shape.attributes.x}" y="${shape.attributes.y}"
          font-family="${shape.attributes['font-family']}"
          font-size="${shape.attributes['font-size']}"
          fill="${shape.attributes.fill}"
          text-anchor="${shape.attributes['text-anchor']}"
          transform="${shape.attributes.transform}">${shape.content}</text>
  `).join('')}
  
  <!-- Gematria value display -->
  <text x="${width - 20}" y="${height - 20}" 
        font-family="monospace" 
        font-size="24" 
        fill="${colors.accent}" 
        text-anchor="end"
        opacity="0.6">${data.gematria}</text>
  
  <!-- CID hash (small, bottom) -->
  <text x="${width/2}" y="${height - 10}" 
        font-family="monospace" 
        font-size="10" 
        fill="${colors.secondary}" 
        text-anchor="middle"
        opacity="0.4">${data.cid.substring(0, 16)}...</text>
  
  <!-- Network badge -->
  <circle cx="${width - 30}" cy="30" r="15" fill="${colors.accent}" opacity="0.7"/>
  <text x="${width - 30}" y="35" 
        font-family="monospace" 
        font-size="12" 
        fill="${colors.background}" 
        text-anchor="middle"
        font-weight="bold">${data.network.substring(0, 3).toUpperCase()}</text>
  
  <!-- Rarity indicator -->
  <rect x="10" y="10" width="60" height="25" 
        fill="${colors.accent}" 
        opacity="0.8" 
        rx="5"/>
  <text x="40" y="27" 
        font-family="sans-serif" 
        font-size="14" 
        fill="${colors.background}" 
        text-anchor="middle"
        font-weight="bold">${data.rarity}</text>
  
  <!-- Formula indicators -->
  ${data.formulas.slice(0, 3).map((formula, i) => `
    <text x="20" y="${50 + i * 20}" 
          font-family="monospace" 
          font-size="12" 
          fill="${colors.secondary}" 
          opacity="0.5">${formula.substring(0, 20)}...</text>
  `).join('')}
  
  <!-- Accumulated Data Formula Display -->
  <rect x="10" y="${height - 80}" width="${width - 20}" height="70" 
        fill="${colors.background}" 
        opacity="0.8" 
        rx="5"
        stroke="${colors.blockColor}"
        stroke-width="1"/>
  <text x="${width/2}" y="${height - 60}" 
        font-family="monospace" 
        font-size="10" 
        fill="${colors.accent}" 
        text-anchor="middle"
        font-weight="bold">Accumulated Formula:</text>
  <text x="${width/2}" y="${height - 45}" 
        font-family="monospace" 
        font-size="9" 
        fill="${colors.secondary}" 
        text-anchor="middle"
        opacity="0.9">${accumulated.formula.substring(0, 60)}...</text>
  <text x="${width/2}" y="${height - 30}" 
        font-family="monospace" 
        font-size="10" 
        fill="${colors.blockColor}" 
        text-anchor="middle"
        font-weight="bold">Value: ${accumulated.numericValue.toLocaleString()}</text>
  <text x="${width/2}" y="${height - 15}" 
        font-family="monospace" 
        font-size="8" 
        fill="${colors.secondary}" 
        text-anchor="middle"
        opacity="0.7">Block: ${data.blockNumber} | CID: ${data.cid.substring(0, 12)}... | Glyph: ${data.glyph} | Gematria: ${data.gematria}</text>
</svg>`;

  return svg;
}

// Load Diamond data and generate NFT
function generateNFTFromDiamond(diamondId: string): void {
  // Load deployment data
  const deploymentsPath = path.join(process.cwd(), 'diamond_deployments.json');
  const ipfsNodesPath = path.join(process.cwd(), 'ipfs_nodes.json');
  
  if (!fs.existsSync(deploymentsPath)) {
    throw new Error('No deployments found. Deploy a Diamond first.');
  }
  
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf-8'));
  const deployment = deployments.find((d: any) => d.diamondId === diamondId);
  
  if (!deployment) {
    throw new Error(`Diamond ${diamondId} not found in deployments`);
  }
  
  // Load IPFS node data
  let ipfsNode: any = null;
  if (fs.existsSync(ipfsNodesPath)) {
    const nodes = JSON.parse(fs.readFileSync(ipfsNodesPath, 'utf-8'));
    ipfsNode = nodes.find((n: any) => n.diamondId === diamondId);
  }
  
  // Extract gematria from cosmic manifest
  const cosmicManifestPath = path.join(process.cwd(), 'diamonds', 'cosmic_manifest.json');
  let gematria = 0;
  if (fs.existsSync(cosmicManifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(cosmicManifestPath, 'utf-8'));
    const facet = manifest.facets.find((f: any) => f.number === parseInt(diamondId));
    if (facet) {
      gematria = facet.gematria || 0;
    }
  }
  
  // Extract formulas (from computation system)
  const formulas: string[] = [];
  if (ipfsNode) {
    // Add default formulas based on glyph
    formulas.push(`${ipfsNode.glyph} × π → β`);
    formulas.push(`∑(${ipfsNode.glyph}) → σ`);
  }
  
  // Build NFT data package (with block position)
  const nftData: DiamondNFTData = {
    diamondId,
    address: deployment.address,
    network: deployment.network,
    cid: deployment.ipfsHash || '',
    glyph: ipfsNode?.glyph || '𐡀',
    gematria: gematria || parseInt(diamondId) * 9,
    greekLetters: ['α', 'β', 'γ', 'δ', 'ε'].slice(0, Math.min(5, parseInt(diamondId) % 5 + 1)),
    mathSymbols: ['π', 'φ', '∑', '√', '∞'].slice(0, Math.min(5, parseInt(diamondId) % 5 + 1)),
    formulas,
    rarity: 'Epic', // Default, should come from Obsidian tree
    color: '#9B59B6', // Default purple
    createdAt: deployment.deployedAt || new Date().toISOString(),
    blockNumber: deployment.blockNumber || 0, // Block position
    txHash: deployment.txHash || '' // Transaction hash
  };
  
  // Calculate accumulated formula
  const accumulated = calculateAccumulatedFormula(nftData);
  
  // Generate SVG
  const svg = generateSVGNFT(nftData);
  
  // Save SVG
  const outputDir = path.join(process.cwd(), 'nfts');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const svgPath = path.join(outputDir, `diamond_${diamondId}_nft.svg`);
  fs.writeFileSync(svgPath, svg);
  
  // Generate metadata JSON (with accumulated formula)
  const metadata = {
    name: `Diamond ${diamondId} NFT`,
    description: `NFT generated from Diamond ${diamondId} accumulated data formula: CID + Glyph + Block Position + Greek + Math + Gematria`,
    image: `ipfs://${deployment.ipfsHash}`,
    attributes: [
      { trait_type: 'Diamond ID', value: diamondId },
      { trait_type: 'Glyph', value: nftData.glyph },
      { trait_type: 'Gematria', value: nftData.gematria },
      { trait_type: 'Block Number', value: nftData.blockNumber },
      { trait_type: 'Block Position', value: `Block #${nftData.blockNumber}` },
      { trait_type: 'Network', value: nftData.network },
      { trait_type: 'Rarity', value: nftData.rarity },
      { trait_type: 'CID', value: nftData.cid },
      { trait_type: 'Transaction Hash', value: nftData.txHash },
      { trait_type: 'Greek Letters', value: nftData.greekLetters.join(', ') },
      { trait_type: 'Math Symbols', value: nftData.mathSymbols.join(', ') },
      { trait_type: 'Formulas', value: nftData.formulas.join(' | ') },
      { trait_type: 'Accumulated Formula Value', value: accumulated.numericValue },
      { trait_type: 'Accumulated Formula', value: accumulated.formula }
    ],
    data_package: {
      cid: nftData.cid,
      glyph: nftData.glyph,
      gematria: nftData.gematria,
      block_number: nftData.blockNumber,
      block_position: `Block #${nftData.blockNumber}`,
      tx_hash: nftData.txHash,
      greek_letters: nftData.greekLetters,
      math_symbols: nftData.mathSymbols,
      formulas: nftData.formulas,
      accumulated_formula: {
        formula: accumulated.formula,
        value: accumulated.numericValue,
        components: accumulated.components
      }
    }
  };
  
  const metadataPath = path.join(outputDir, `diamond_${diamondId}_metadata.json`);
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  
  console.log(`\n✨ NFT Generated!\n`);
  console.log(`   Diamond: ${diamondId}`);
  console.log(`   SVG: ${svgPath}`);
  console.log(`   Metadata: ${metadataPath}`);
  console.log(`\n   Accumulated Data Package:`);
  console.log(`   - CID: ${nftData.cid.substring(0, 20)}...`);
  console.log(`   - Glyph: ${nftData.glyph}`);
  console.log(`   - Gematria: ${nftData.gematria}`);
  console.log(`   - Block Position: #${nftData.blockNumber}`);
  console.log(`   - Greek: ${nftData.greekLetters.join(', ')}`);
  console.log(`   - Math: ${nftData.mathSymbols.join(', ')}`);
  console.log(`   - Formulas: ${nftData.formulas.length}`);
  console.log(`\n   Accumulated Formula:`);
  console.log(`   ${accumulated.formula}`);
  console.log(`   Value: ${accumulated.numericValue.toLocaleString()}\n`);
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === 'generate' && args[1]) {
    try {
      generateNFTFromDiamond(args[1]);
    } catch (error) {
      console.error(`❌ Error: ${error}`);
      process.exit(1);
    }
    return;
  }
  
  if (args[0] === 'generate-all') {
    // Generate NFTs for all deployed Diamonds
    const deploymentsPath = path.join(process.cwd(), 'diamond_deployments.json');
    if (!fs.existsSync(deploymentsPath)) {
      console.error('❌ No deployments found');
      return;
    }
    
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf-8'));
    const deployed = deployments.filter((d: any) => d.ipfsHash);
    
    console.log(`\n🎨 Generating NFTs for ${deployed.length} Diamonds...\n`);
    
    deployed.forEach((deployment: any) => {
      try {
        generateNFTFromDiamond(deployment.diamondId);
      } catch (error) {
        console.error(`❌ Error generating NFT for Diamond ${deployment.diamondId}: ${error}`);
      }
    });
    
    console.log(`\n✅ Complete!\n`);
    return;
  }
  
  console.log(`
🎨 SVG NFT Generator

Purpose: Generate unique SVG NFTs from rich Diamond data packages
Each glyph contains enough data: CID + Glyph + Greek + Math + Gematria

Usage:
  npm run nft generate <diamond-id>     - Generate NFT for one Diamond
  npm run nft generate-all               - Generate NFTs for all deployed Diamonds

Example:
  npm run nft generate 1
  npm run nft generate-all
`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateSVGNFT, generateNFTFromDiamond, DiamondNFTData };
