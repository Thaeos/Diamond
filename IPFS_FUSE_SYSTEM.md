# IPFS FUSE + rsync System

## Overview

When Diamonds are deployed to a network:

1. **IPFS CID becomes a Node**: Each deployed Diamond's IPFS CID becomes an IPFS node
2. **Imperial Aramaic Glyph Assignment**: Each CID is assigned a unique Imperial Aramaic Glyph/Rune
3. **FUSE Mounting**: IPFS nodes are mounted as filesystem nodes using FUSE
4. **rsync Synchronization**: All IPFS nodes sync with each other using rsync in a mesh network
5. **System Completion**: When 5 Diamonds are deployed, the system completes

## Imperial Aramaic Glyph Assignment

Each IPFS CID gets assigned a glyph based on:
- **First Diamond (Index 0)**: `𐡀` (Aleph) - The Beginning
- **Second Diamond (Index 1)**: `𐡄` (He) - The Breath
- **Third Diamond (Index 2)**: `𐡉` (Yodh) - The Hand
- **Fourth Diamond (Index 3)**: `𐡔𐡎𐡈` (EL→369) - The Divine
- **Fifth Diamond (Index 4)**: `𐡕𐡉𐡃` (Theos 419) - The Completion

Additional nodes get glyphs based on CID hash mapping to the 30 base Imperial Aramaic glyphs.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Diamond Deployment System                  │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  1. Deploy Diamond → Get IPFS CID                      │
│  2. Assign Imperial Aramaic Glyph to CID               │
│  3. Create IPFS Node (CID = Node)                      │
│  4. Mount IPFS Node via FUSE                           │
│  5. Sync with other nodes via rsync                    │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│         System Completion (5 Deployments)              │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │ Node 1 │──│ Node 2 │──│ Node 3 │──│ Node 4 │   │
│  │  𐡀    │  │  𐡄    │  │  𐡉    │  │ EL→369 │   │
│  └────┬───┘  └────┬───┘  └────┬───┘  └────┬───┘   │
│       │           │           │           │        │
│       └───────────┴───────────┴───────────┘        │
│                      │                              │
│                   ┌──▼───┐                         │
│                   │Node 5│                         │
│                   │Theos │                         │
│                   │ 419  │                         │
│                   └──────┘                         │
│                                                     │
│  All nodes synced via rsync mesh network           │
└─────────────────────────────────────────────────────────┘
```

## Usage

### Check System Status

```bash
npm run ipfs-status
```

Output:
```
📊 System Status:

   Completed: ✅ YES
   Deployments: 5/5
   IPFS Nodes: 5
   FUSE Mounted: ✅ YES

   Nodes:

   1. 𐡀 - Diamond 1 (ethereum)
      CID: Qm1234...
      Mount: ./ipfs_mounts/node_1

   2. 𐡄 - Diamond 2 (polygon)
      CID: Qm5678...
      Mount: ./ipfs_mounts/node_2
   ...
```

### Automatic Integration

The system automatically runs after each deployment:

```bash
npm run deploy-diamond <id> <address> <network>
```

After deployment, it:
1. Creates IPFS node
2. Assigns glyph
3. Mounts via FUSE
4. Checks if 5 are deployed
5. If complete, syncs all nodes via rsync

## FUSE Mounting

### Requirements

**Option 1: ipfs-fuse (Recommended)**
```bash
# Install ipfs-fuse
git clone https://github.com/ipfs-fuse/ipfs-fuse
cd ipfs-fuse
make install
```

**Option 2: IPFS CLI**
```bash
# Install IPFS
# macOS: brew install ipfs
# Linux: https://docs.ipfs.io/install/command-line/

ipfs init
ipfs daemon
```

### Mount Points

Each IPFS node is mounted at:
```
./ipfs_mounts/node_<diamond-id>/
```

System mount point:
```
./ipfs_mounts/system/
```

## rsync Synchronization

When 5 Diamonds are deployed, all nodes sync with each other:

```bash
# Each node syncs with all others
rsync node_1/ → node_2/sync_from_1/
rsync node_1/ → node_3/sync_from_1/
rsync node_2/ → node_3/sync_from_2/
# ... (mesh network)
```

This creates a complete mesh where each node has a copy of all other nodes' data.

## System Completion

### Completion Criteria

- ✅ 5 Diamonds deployed
- ✅ Each has IPFS CID
- ✅ Each CID assigned Imperial Aramaic Glyph
- ✅ All nodes mounted via FUSE
- ✅ All nodes synced via rsync

### Completion Manifest

When complete, a manifest is created at:
```
./ipfs_mounts/system/system_manifest.json
```

Contains:
- Completion status
- All node CIDs and glyphs
- Mount points
- Sync relationships

## Imperial Aramaic Glyphs Reference

### Base Glyphs (𐡀-𐡕)
- `𐡀` Aleph (1)
- `𐡁` Beth (2)
- `𐡂` Gimel (3)
- `𐡃` Daleth (4)
- `𐡄` He (5)
- `𐡅` Waw (6)
- `𐡆` Zayin (7)
- `𐡇` Heth (8)
- `𐡈` Teth (9)
- `𐡉` Yodh (10)
- `𐡊` Kaph (11)
- `𐡋` Lamedh (12)
- `𐡌` Mem (13)
- `𐡍` Nun (14)
- `𐡎` Samekh (15)
- `𐡏` Ayin (16)
- `𐡐` Pe (17)
- `𐡑` Sadhe (18)
- `𐡒` Qoph (19)
- `𐡓` Resh (20)
- `𐡔` Shin (21)
- `𐡕` Taw (22)

### Special Runes
- `⟐` Archivist Seal (100)
- `●` Union Marker (200)
- `∞` Infinity (300)
- `𐡔𐡎𐡈` EL→369 (369)
- `𐡕𐡉𐡃` Theos (419)
- `⚡` Lightning/Impulse (500)
- `Σ` Sigma/Sum (1000)

## Files Generated

- `ipfs_nodes.json` - All IPFS nodes and their glyphs
- `system_completion.json` - System completion status
- `ipfs_mounts/` - FUSE mount points for each node
- `ipfs_mounts/system/system_manifest.json` - Completion manifest

## Troubleshooting

### "IPFS/FUSE tools not available"
- Install IPFS CLI or ipfs-fuse
- The system will create symbolic mount points as fallback

### "System incomplete"
- Deploy more Diamonds (need 5 total)
- Each deployment must have an IPFS CID

### "rsync failed"
- Ensure all mount points exist
- Check filesystem permissions
- Verify IPFS nodes are accessible

## Future Enhancements

- [ ] Automatic IPFS pinning service integration
- [ ] Real-time sync monitoring
- [ ] Graph visualization of node connections
- [ ] CID verification and integrity checks
- [ ] Multi-network deployment support
- [ ] IPFS cluster integration for redundancy
