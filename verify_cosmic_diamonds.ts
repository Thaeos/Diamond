/**
 * Verify Cosmic Diamonds - Check results from AI agent
 */

import * as fs from 'fs';
import { createHash } from 'crypto';

const DIAMONDS_DIR = '/home/theos/diamonds';

interface FacetInfo {
  number: number;
  exists: boolean;
  gematria: number;
  glyph: string;
  fileSize: number;
  hash?: string;
}

function verifyDiamonds() {
  console.log('🔍 Verifying Cosmic Diamonds...');
  console.log('='.repeat(70));
  
  // Read manifest
  const manifestPath = `${DIAMONDS_DIR}/cosmic_manifest.json`;
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Manifest not found!');
    return;
  }
  
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  console.log(`📜 Manifest found: ${manifest.facets.length} facets listed`);
  console.log('');
  
  // Check which facets exist
  const facets: FacetInfo[] = [];
  let existingCount = 0;
  let missingCount = 0;
  
  for (const facet of manifest.facets) {
    const filePath = `${DIAMONDS_DIR}/DiamondFacet${facet.number}.sol`;
    const exists = fs.existsSync(filePath);
    
    if (exists) {
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf-8');
      const hash = createHash('sha256').update(content).digest('hex');
      
      facets.push({
        number: facet.number,
        exists: true,
        gematria: facet.gematria,
        glyph: facet.glyph,
        fileSize: stats.size,
        hash: hash
      });
      existingCount++;
    } else {
      facets.push({
        number: facet.number,
        exists: false,
        gematria: facet.gematria,
        glyph: facet.glyph,
        fileSize: 0
      });
      missingCount++;
    }
  }
  
  // Report
  console.log('📊 Verification Results:');
  console.log(`  ✅ Existing facets: ${existingCount}`);
  console.log(`  ❌ Missing facets: ${missingCount}`);
  console.log(`  📈 Completion: ${((existingCount / manifest.facets.length) * 100).toFixed(1)}%`);
  console.log('');
  
  // Show existing facets
  console.log('✅ Existing Facets:');
  const existing = facets.filter(f => f.exists).slice(0, 10);
  existing.forEach(f => {
    console.log(`  D${f.number.toString().padStart(3, '0')}: Gematria=${f.gematria}, Glyph=${f.glyph}, Size=${f.fileSize} bytes`);
  });
  if (existingCount > 10) {
    console.log(`  ... and ${existingCount - 10} more`);
  }
  console.log('');
  
  // Show missing facets (first 10)
  if (missingCount > 0) {
    console.log('❌ Missing Facets (first 10):');
    const missing = facets.filter(f => !f.exists).slice(0, 10);
    missing.forEach(f => {
      console.log(`  D${f.number.toString().padStart(3, '0')}: Gematria=${f.gematria}, Glyph=${f.glyph}`);
    });
    if (missingCount > 10) {
      console.log(`  ... and ${missingCount - 10} more missing`);
    }
    console.log('');
  }
  
  // Check for special facets (369, 419)
  console.log('🔮 Special Facets Check:');
  const facet369 = facets.find(f => f.number === 41); // 369 / 9 = 41
  const facet419 = facets.find(f => f.number === 46 || f.number === 47); // 419 / 9 ≈ 46.55
  
  if (facet369) {
    console.log(`  D41 (Gematria 369): ${facet369.exists ? '✅ EXISTS' : '❌ MISSING'}`);
    if (facet369.exists) {
      console.log(`    Glyph: ${facet369.glyph}`);
      console.log(`    Hash: ${facet369.hash?.substring(0, 16)}...`);
    }
  }
  
  if (facet419) {
    console.log(`  D46/D47 (Gematria ~419): ${facet419.exists ? '✅ EXISTS' : '❌ MISSING'}`);
    if (facet419.exists) {
      console.log(`    Glyph: ${facet419.glyph}`);
    }
  }
  console.log('');
  
  // Verify file integrity
  console.log('🔐 File Integrity Check:');
  const declarationPath = `${DIAMONDS_DIR}/DeclarationCovenant.sol`;
  if (fs.existsSync(declarationPath)) {
    const declaration = fs.readFileSync(declarationPath, 'utf-8');
    const declarationHash = createHash('sha256').update(declaration).digest('hex');
    console.log(`  DeclarationCovenant.sol: ✅`);
    console.log(`    Hash: ${declarationHash}`);
  } else {
    console.log(`  DeclarationCovenant.sol: ❌ MISSING`);
  }
  console.log('');
  
  // Summary
  console.log('='.repeat(70));
  console.log('📋 Summary:');
  console.log(`  Total facets in manifest: ${manifest.facets.length}`);
  console.log(`  Facets generated: ${existingCount}`);
  console.log(`  Facets missing: ${missingCount}`);
  console.log(`  Manifest date: ${manifest.generated_at}`);
  console.log('');
  
  if (missingCount === 0) {
    console.log('✨ All facets have been generated!');
  } else {
    console.log(`⚠️  ${missingCount} facets still need to be generated.`);
    console.log('   Run: npm run generate-cosmic');
  }
}

verifyDiamonds();
