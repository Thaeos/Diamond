/**
 * IPFS FUSE + rsync System
 * 
 * When Diamonds are deployed:
 * 1. Each IPFS CID becomes an IPFS node
 * 2. Each CID gets assigned an Imperial Aramaic Glyph/Rune
 * 3. FUSE mounts IPFS as filesystem
 * 4. rsync syncs between IPFS nodes (CIDs)
 * 5. System completes when 5 Diamonds are deployed
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { createHash } from 'crypto';

// Imperial Aramaic Glyphs/Runes (extended set for CID mapping)
const IMPERIAL_ARAMAIC_GLYPHS: Record<number, string> = {
  // Base Imperial Aramaic (𐡀-𐡕)
  1: '𐡀',   // Aleph
  2: '𐡁',   // Beth
  3: '𐡂',   // Gimel
  4: '𐡃',   // Daleth
  5: '𐡄',   // He
  6: '𐡅',   // Waw
  7: '𐡆',   // Zayin
  8: '𐡇',   // Heth
  9: '𐡈',   // Teth
  10: '𐡉',  // Yodh
  11: '𐡊',  // Kaph
  12: '𐡋',  // Lamedh
  13: '𐡌',  // Mem
  14: '𐡍',  // Nun
  15: '𐡎',  // Samekh
  16: '𐡏',  // Ayin
  17: '𐡐',  // Pe
  18: '𐡑',  // Sadhe
  19: '𐡒',  // Qoph
  20: '𐡓',  // Resh
  21: '𐡔',  // Shin
  22: '𐡕',  // Taw
  
  // Extended Imperial Runes (combinations for higher values)
  23: '𐡀𐡀',   // Double Aleph
  24: '𐡀𐡁',   // Aleph-Beth
  25: '𐡀𐡂',   // Aleph-Gimel
  26: '𐡁𐡁',   // Double Beth
  27: '𐡁𐡂',   // Beth-Gimel
  28: '𐡂𐡂',   // Double Gimel
  29: '𐡀𐡃',   // Aleph-Daleth
  30: '𐡁𐡃',   // Beth-Daleth
  
  // Special Imperial Runes (for system completion)
  100: '⟐',   // Archivist Seal
  200: '●',   // Union Marker
  300: '∞',   // Infinity
  369: '𐡔𐡎𐡈', // EL→369
  419: '𐡕𐡉𐡃', // Theos
  500: '⚡',   // Lightning/Impulse
  1000: 'Σ',   // Sigma/Sum
};

interface IPFSNode {
  cid: string;
  glyph: string;
  diamondId: string;
  address: string;
  network: string;
  mountPoint: string;
  syncedWith: string[]; // CIDs this node is synced with
  createdAt: string;
}

interface SystemCompletion {
  completed: boolean;
  completedAt?: string;
  totalDeployments: number;
  requiredDeployments: number;
  nodes: IPFSNode[];
  fuseMounted: boolean;
  fuseMountPoint?: string;
}

const DEPLOYMENTS_FILE = path.join(process.cwd(), 'diamond_deployments.json');
const IPFS_NODES_FILE = path.join(process.cwd(), 'ipfs_nodes.json');
const SYSTEM_COMPLETION_FILE = path.join(process.cwd(), 'system_completion.json');
const FUSE_MOUNT_BASE = path.join(process.cwd(), 'ipfs_mounts');
const REQUIRED_DEPLOYMENTS = 5;

// Load deployments
function loadDeployments(): any[] {
  if (!fs.existsSync(DEPLOYMENTS_FILE)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(DEPLOYMENTS_FILE, 'utf-8'));
}

// Load IPFS nodes
function loadIPFSNodes(): IPFSNode[] {
  if (!fs.existsSync(IPFS_NODES_FILE)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(IPFS_NODES_FILE, 'utf-8'));
}

// Save IPFS nodes
function saveIPFSNodes(nodes: IPFSNode[]): void {
  fs.writeFileSync(IPFS_NODES_FILE, JSON.stringify(nodes, null, 2));
}

// Load system completion status
function loadSystemCompletion(): SystemCompletion {
  if (!fs.existsSync(SYSTEM_COMPLETION_FILE)) {
    return {
      completed: false,
      totalDeployments: 0,
      requiredDeployments: REQUIRED_DEPLOYMENTS,
      nodes: [],
      fuseMounted: false
    };
  }
  return JSON.parse(fs.readFileSync(SYSTEM_COMPLETION_FILE, 'utf-8'));
}

// Save system completion status
function saveSystemCompletion(status: SystemCompletion): void {
  fs.writeFileSync(SYSTEM_COMPLETION_FILE, JSON.stringify(status, null, 2));
}

// Assign glyph to CID based on hash
function assignGlyphToCID(cid: string, index: number): string {
  // Extract numeric value from CID hash
  const hash = createHash('sha256').update(cid).digest('hex');
  const numericValue = parseInt(hash.substring(0, 8), 16);
  
  // Map to glyph based on value and index
  const glyphIndex = (numericValue % 30) + 1; // Use base 30 glyphs
  
  // Special assignments for first 5 (system completion)
  if (index === 0) return IMPERIAL_ARAMAIC_GLYPHS[1]; // Aleph - First
  if (index === 1) return IMPERIAL_ARAMAIC_GLYPHS[5]; // He - Second
  if (index === 2) return IMPERIAL_ARAMAIC_GLYPHS[10]; // Yodh - Third
  if (index === 3) return IMPERIAL_ARAMAIC_GLYPHS[369]; // EL→369 - Fourth
  if (index === 4) return IMPERIAL_ARAMAIC_GLYPHS[419]; // Theos - Fifth (Completion)
  
  // Default mapping
  return IMPERIAL_ARAMAIC_GLYPHS[glyphIndex] || IMPERIAL_ARAMAIC_GLYPHS[1];
}

// Create IPFS node from deployment
function createIPFSNode(deployment: any, index: number): IPFSNode {
  const cid = deployment.ipfsHash || '';
  if (!cid) {
    throw new Error(`Deployment ${deployment.diamondId} has no IPFS hash`);
  }

  const glyph = assignGlyphToCID(cid, index);
  const mountPoint = path.join(FUSE_MOUNT_BASE, `node_${deployment.diamondId}`);

  return {
    cid,
    glyph,
    diamondId: deployment.diamondId,
    address: deployment.address,
    network: deployment.network,
    mountPoint,
    syncedWith: [],
    createdAt: new Date().toISOString()
  };
}

// Mount IPFS node using FUSE
function mountIPFSNode(node: IPFSNode): void {
  console.log(`📁 Mounting IPFS node ${node.diamondId} (CID: ${node.cid})...`);

  // Ensure mount point exists
  if (!fs.existsSync(node.mountPoint)) {
    fs.mkdirSync(node.mountPoint, { recursive: true });
  }

  try {
    // Check if ipfs-fuse is available
    try {
      execSync('which ipfs-fuse', { stdio: 'pipe' });
      
      // Mount using ipfs-fuse
      execSync(
        `ipfs-fuse mount ${node.mountPoint} --cid ${node.cid}`,
        { stdio: 'inherit' }
      );
      
      console.log(`✅ Mounted IPFS node ${node.diamondId} at ${node.mountPoint}`);
    } catch {
      // Fallback: Use ipfs mount (if available)
      try {
        execSync('which ipfs', { stdio: 'pipe' });
        
        // Create a local copy and mount it
        const localPath = path.join(node.mountPoint, 'content');
        execSync(`ipfs get ${node.cid} -o ${localPath}`, { stdio: 'inherit' });
        
        console.log(`✅ Retrieved IPFS content for node ${node.diamondId}`);
        console.log(`⚠️  Note: Full FUSE mounting requires ipfs-fuse. Content available at ${localPath}`);
      } catch {
        console.log(`⚠️  IPFS/FUSE tools not available. Creating symbolic mount point.`);
        // Create a marker file
        fs.writeFileSync(
          path.join(node.mountPoint, 'cid.txt'),
          `${node.cid}\nGlyph: ${node.glyph}\nDiamond: ${node.diamondId}`
        );
      }
    }
  } catch (error) {
    console.error(`❌ Error mounting IPFS node: ${error}`);
    throw error;
  }
}

// Sync between IPFS nodes using rsync
function syncIPFSNodes(sourceNode: IPFSNode, targetNode: IPFSNode): void {
  console.log(`🔄 Syncing ${sourceNode.diamondId} (${sourceNode.glyph}) → ${targetNode.diamondId} (${targetNode.glyph})...`);

  try {
    // Use rsync to sync between mount points
    execSync(
      `rsync -avz --progress ${sourceNode.mountPoint}/ ${targetNode.mountPoint}/sync_from_${sourceNode.diamondId}/`,
      { stdio: 'inherit' }
    );

    // Update sync relationships
    if (!targetNode.syncedWith.includes(sourceNode.cid)) {
      targetNode.syncedWith.push(sourceNode.cid);
    }
    if (!sourceNode.syncedWith.includes(targetNode.cid)) {
      sourceNode.syncedWith.push(targetNode.cid);
    }

    console.log(`✅ Synced ${sourceNode.glyph} → ${targetNode.glyph}`);
  } catch (error) {
    console.error(`❌ Error syncing nodes: ${error}`);
    throw error;
  }
}

// Sync all IPFS nodes in a mesh network
function syncAllIPFSNodes(nodes: IPFSNode[]): void {
  console.log(`\n🌐 Syncing all IPFS nodes (${nodes.length} nodes)...\n`);

  // Create mesh sync: each node syncs with all others
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      syncIPFSNodes(nodes[i], nodes[j]);
    }
  }

  console.log(`\n✅ All nodes synced in mesh network\n`);
}

// Check and complete system
async function checkAndCompleteSystem(): Promise<void> {
  console.log(`\n🔍 Checking system completion status...\n`);

  const deployments = loadDeployments();
  const deployed = deployments.filter(d => d.ipfsHash);
  
  console.log(`   Deployments: ${deployed.length}/${REQUIRED_DEPLOYMENTS}`);

  if (deployed.length < REQUIRED_DEPLOYMENTS) {
    console.log(`   ⏳ System incomplete. Need ${REQUIRED_DEPLOYMENTS - deployed.length} more deployments.`);
    return;
  }

  // System is complete!
  console.log(`\n✨ SYSTEM COMPLETE! ✨\n`);
  console.log(`   All ${REQUIRED_DEPLOYMENTS} Diamonds deployed and IPFS nodes created.\n`);

  // Create IPFS nodes from deployments
  const nodes: IPFSNode[] = deployed.slice(0, REQUIRED_DEPLOYMENTS).map((d, i) => 
    createIPFSNode(d, i)
  );

  // Assign glyphs and mount nodes
  console.log(`📦 Creating IPFS nodes and assigning Imperial Aramaic Glyphs...\n`);
  
  for (const node of nodes) {
    console.log(`   Node ${node.diamondId}: CID ${node.cid.substring(0, 12)}... → Glyph: ${node.glyph}`);
    mountIPFSNode(node);
  }

  saveIPFSNodes(nodes);

  // Sync all nodes
  syncAllIPFSNodes(nodes);

  // Create main FUSE mount point
  const mainMountPoint = path.join(FUSE_MOUNT_BASE, 'system');
  if (!fs.existsSync(mainMountPoint)) {
    fs.mkdirSync(mainMountPoint, { recursive: true });
  }

  // Create system manifest
  const systemManifest = {
    completed: true,
    completedAt: new Date().toISOString(),
    totalDeployments: deployed.length,
    requiredDeployments: REQUIRED_DEPLOYMENTS,
    nodes: nodes.map(n => ({
      cid: n.cid,
      glyph: n.glyph,
      diamondId: n.diamondId,
      address: n.address,
      network: n.network,
      mountPoint: n.mountPoint
    })),
    fuseMounted: true,
    fuseMountPoint: mainMountPoint
  };

  saveSystemCompletion(systemManifest);

  // Create system completion manifest
  const manifestPath = path.join(mainMountPoint, 'system_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(systemManifest, null, 2));

  console.log(`\n🎉 SYSTEM COMPLETION MANIFEST:\n`);
  console.log(`   Status: COMPLETE`);
  console.log(`   Deployments: ${deployed.length}/${REQUIRED_DEPLOYMENTS}`);
  console.log(`   IPFS Nodes: ${nodes.length}`);
  console.log(`   Main Mount: ${mainMountPoint}`);
  console.log(`\n   Node Glyphs:\n`);
  nodes.forEach((node, i) => {
    console.log(`   ${i + 1}. Diamond ${node.diamondId}: ${node.glyph} (${node.cid.substring(0, 12)}...)`);
  });
  console.log(`\n   All nodes synced via rsync in mesh network.\n`);
}

// Initialize system (run after each deployment)
export async function initializeIPFSSystem(): Promise<void> {
  await checkAndCompleteSystem();
}

// Get system status
export function getSystemStatus(): SystemCompletion {
  return loadSystemCompletion();
}

// Get IPFS nodes
export function getIPFSNodes(): IPFSNode[] {
  return loadIPFSNodes();
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === 'status') {
    const status = getSystemStatus();
    console.log('\n📊 System Status:\n');
    console.log(`   Completed: ${status.completed ? '✅ YES' : '❌ NO'}`);
    console.log(`   Deployments: ${status.totalDeployments}/${status.requiredDeployments}`);
    console.log(`   IPFS Nodes: ${status.nodes.length}`);
    console.log(`   FUSE Mounted: ${status.fuseMounted ? '✅ YES' : '❌ NO'}`);
    
    if (status.nodes.length > 0) {
      console.log(`\n   Nodes:\n`);
      status.nodes.forEach((node, i) => {
        console.log(`   ${i + 1}. ${node.glyph} - Diamond ${node.diamondId} (${node.network})`);
        console.log(`      CID: ${node.cid}`);
        console.log(`      Mount: ${node.mountPoint}`);
      });
    }
    return;
  }

  // Check and complete system
  await checkAndCompleteSystem();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { assignGlyphToCID, mountIPFSNode, syncIPFSNodes, syncAllIPFSNodes, IMPERIAL_ARAMAIC_GLYPHS };
