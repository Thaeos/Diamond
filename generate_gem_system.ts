/**
 * Path of Exile + Diablo 2 LoD Gem System for Diamond Standard
 * 
 * Concept:
 * - Gems (Facets) can be socketed into Diamonds
 * - Gems have prefixes/suffixes (modifiers)
 * - Gems belong to elemental schools
 * - Gems have multiplicative/additive effects
 * - Diamonds act as neurons in a nervous system
 * - Diamonds communicate via "rsync" (cross-contract calls)
 */

import * as fs from 'fs';
import { createHash } from 'crypto';

// Elemental Schools (like PoE)
enum ElementalSchool {
  FIRE = 'Fire',
  COLD = 'Cold',
  LIGHTNING = 'Lightning',
  CHAOS = 'Chaos',
  PHYSICAL = 'Physical',
  POISON = 'Poison',
  HOLY = 'Holy',
  SHADOW = 'Shadow'
}

// Gem Rarity (like Diablo 2)
enum GemRarity {
  NORMAL = 'Normal',
  MAGIC = 'Magic',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary'
}

// Modifier Types
enum ModifierType {
  ADDITIVE = 'Additive',      // Flat addition
  MULTIPLICATIVE = 'Multiplicative', // Percentage multiplier
  EXPONENTIAL = 'Exponential' // Power-based
}

// Prefixes (like Diablo 2)
const PREFIXES = {
  [ElementalSchool.FIRE]: [
    { name: 'Burning', value: 10, type: ModifierType.ADDITIVE },
    { name: 'Flaming', value: 15, type: ModifierType.ADDITIVE },
    { name: 'Infernal', value: 25, type: ModifierType.ADDITIVE },
    { name: 'Blazing', value: 1.2, type: ModifierType.MULTIPLICATIVE },
    { name: 'Scorching', value: 1.5, type: ModifierType.MULTIPLICATIVE }
  ],
  [ElementalSchool.COLD]: [
    { name: 'Chilling', value: 10, type: ModifierType.ADDITIVE },
    { name: 'Freezing', value: 15, type: ModifierType.ADDITIVE },
    { name: 'Glacial', value: 25, type: ModifierType.ADDITIVE },
    { name: 'Frost', value: 1.2, type: ModifierType.MULTIPLICATIVE },
    { name: 'Arctic', value: 1.5, type: ModifierType.MULTIPLICATIVE }
  ],
  [ElementalSchool.LIGHTNING]: [
    { name: 'Shocking', value: 10, type: ModifierType.ADDITIVE },
    { name: 'Electrifying', value: 15, type: ModifierType.ADDITIVE },
    { name: 'Thunderous', value: 25, type: ModifierType.ADDITIVE },
    { name: 'Voltaic', value: 1.2, type: ModifierType.MULTIPLICATIVE },
    { name: 'Storm', value: 1.5, type: ModifierType.MULTIPLICATIVE }
  ],
  [ElementalSchool.CHAOS]: [
    { name: 'Chaotic', value: 10, type: ModifierType.ADDITIVE },
    { name: 'Void', value: 15, type: ModifierType.ADDITIVE },
    { name: 'Abyssal', value: 25, type: ModifierType.ADDITIVE },
    { name: 'Entropic', value: 1.2, type: ModifierType.MULTIPLICATIVE },
    { name: 'Oblivion', value: 1.5, type: ModifierType.MULTIPLICATIVE }
  ]
};

// Suffixes (like Diablo 2)
const SUFFIXES = {
  [ElementalSchool.FIRE]: [
    { name: 'of Flame', value: 5, type: ModifierType.ADDITIVE },
    { name: 'of Embers', value: 8, type: ModifierType.ADDITIVE },
    { name: 'of Conflagration', value: 12, type: ModifierType.ADDITIVE },
    { name: 'of Intensity', value: 1.1, type: ModifierType.MULTIPLICATIVE },
    { name: 'of Annihilation', value: 1.3, type: ModifierType.MULTIPLICATIVE }
  ],
  [ElementalSchool.COLD]: [
    { name: 'of Ice', value: 5, type: ModifierType.ADDITIVE },
    { name: 'of Frost', value: 8, type: ModifierType.ADDITIVE },
    { name: 'of Winter', value: 12, type: ModifierType.ADDITIVE },
    { name: 'of Rigor', value: 1.1, type: ModifierType.MULTIPLICATIVE },
    { name: 'of Absolute Zero', value: 1.3, type: ModifierType.MULTIPLICATIVE }
  ],
  [ElementalSchool.LIGHTNING]: [
    { name: 'of Sparks', value: 5, type: ModifierType.ADDITIVE },
    { name: 'of Bolts', value: 8, type: ModifierType.ADDITIVE },
    { name: 'of Tempest', value: 12, type: ModifierType.ADDITIVE },
    { name: 'of Voltage', value: 1.1, type: ModifierType.MULTIPLICATIVE },
    { name: 'of Thunder', value: 1.3, type: ModifierType.MULTIPLICATIVE }
  ],
  [ElementalSchool.CHAOS]: [
    { name: 'of Chaos', value: 5, type: ModifierType.ADDITIVE },
    { name: 'of Void', value: 8, type: ModifierType.ADDITIVE },
    { name: 'of Entropy', value: 12, type: ModifierType.ADDITIVE },
    { name: 'of Disorder', value: 1.1, type: ModifierType.MULTIPLICATIVE },
    { name: 'of Oblivion', value: 1.3, type: ModifierType.MULTIPLICATIVE }
  ]
};

interface GemModifier {
  name: string;
  value: number;
  type: ModifierType;
}

interface GemDefinition {
  id: number;
  name: string;
  school: ElementalSchool;
  rarity: GemRarity;
  baseValue: number;
  prefix?: GemModifier;
  suffix?: GemModifier;
  socketLevel: number; // Required socket level
  canCombine: boolean; // Can combine with other gems
}

// Generate gem with prefix/suffix
function generateGem(id: number, school: ElementalSchool, rarity: GemRarity): GemDefinition {
  const baseValue = id * 9; // Base gematria value
  
  // Select prefix/suffix based on rarity
  const prefixPool = PREFIXES[school] || [];
  const suffixPool = SUFFIXES[school] || [];
  
  let prefix: GemModifier | undefined;
  let suffix: GemModifier | undefined;
  
  // Normal: No modifiers
  // Magic: Prefix only
  // Rare: Prefix + Suffix
  // Epic: Prefix + Suffix (better rolls)
  // Legendary: Prefix + Suffix (best rolls)
  
  if (rarity === GemRarity.MAGIC || rarity === GemRarity.RARE || rarity === GemRarity.EPIC || rarity === GemRarity.LEGENDARY) {
    prefix = prefixPool[Math.floor(Math.random() * prefixPool.length)];
  }
  if (rarity === GemRarity.RARE || rarity === GemRarity.EPIC || rarity === GemRarity.LEGENDARY) {
    suffix = suffixPool[Math.floor(Math.random() * suffixPool.length)];
  }
  
  // Calculate socket level requirement
  const socketLevel = Math.floor(id / 10) + 1;
  
  // Generate gem name
  let gemName = `${school} Gem`;
  if (prefix) gemName = `${prefix.name} ${gemName}`;
  if (suffix) gemName = `${gemName} ${suffix.name}`;
  
  return {
    id,
    name: gemName,
    school,
    rarity,
    baseValue,
    prefix,
    suffix,
    socketLevel,
    canCombine: rarity >= GemRarity.RARE
  };
}

// Generate Solidity gem contract
function generateGemContract(gem: GemDefinition): string {
  const totalValue = calculateTotalValue(gem);
  const modifiers = [];
  
  if (gem.prefix) {
    modifiers.push(`Prefix: ${gem.prefix.name} (${gem.prefix.type})`);
  }
  if (gem.suffix) {
    modifiers.push(`Suffix: ${gem.suffix.name} (${gem.suffix.type})`);
  }
  
  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * ${gem.name}
 * ID: ${gem.id}
 * School: ${gem.school}
 * Rarity: ${gem.rarity}
 * Base Value: ${gem.baseValue}
 * Total Value: ${totalValue}
 * Socket Level Required: ${gem.socketLevel}
 * ${modifiers.length > 0 ? modifiers.join('\\n * ') : ''}
 * 
 * This gem can be socketed into a Diamond contract.
 * Acts as a neuron in the Diamond nervous system.
 */

interface I${gem.school.replace(/\s+/g, '')}Gem${gem.id} {
    function getGemId() external pure returns (uint256);
    function getSchool() external pure returns (string memory);
    function getRarity() external pure returns (string memory);
    function getBaseValue() external pure returns (uint256);
    function getTotalValue() external pure returns (uint256);
    function getPrefix() external pure returns (string memory, uint256, string memory);
    function getSuffix() external pure returns (string memory, uint256, string memory);
    function getSocketLevel() external pure returns (uint256);
    function canCombine() external pure returns (bool);
    
    // Neuron functions - for Diamond-to-Diamond communication
    function receiveImpulse(address fromDiamond, uint256 value) external pure returns (uint256);
    function sendImpulse(address toDiamond, uint256 value) external pure returns (bool);
    function processImpulse(uint256 inputValue) external pure returns (uint256);
}

contract ${gem.school.replace(/\s+/g, '')}Gem${gem.id} is I${gem.school.replace(/\s+/g, '')}Gem${gem.id} {
    uint256 private constant GEM_ID = ${gem.id};
    string private constant SCHOOL = "${gem.school}";
    string private constant RARITY = "${gem.rarity}";
    uint256 private constant BASE_VALUE = ${gem.baseValue};
    uint256 private constant TOTAL_VALUE = ${totalValue};
    uint256 private constant SOCKET_LEVEL = ${gem.socketLevel};
    bool private constant CAN_COMBINE = ${gem.canCombine};
    
    ${gem.prefix ? `
    // Prefix Modifier
    string private constant PREFIX_NAME = "${gem.prefix.name}";
    uint256 private constant PREFIX_VALUE = ${gem.prefix.value};
    string private constant PREFIX_TYPE = "${gem.prefix.type}";
    ` : ''}
    
    ${gem.suffix ? `
    // Suffix Modifier
    string private constant SUFFIX_NAME = "${gem.suffix.name}";
    uint256 private constant SUFFIX_VALUE = ${gem.suffix.value};
    string private constant SUFFIX_TYPE = "${gem.suffix.type}";
    ` : ''}
    
    function getGemId() external pure override returns (uint256) {
        return GEM_ID;
    }
    
    function getSchool() external pure override returns (string memory) {
        return SCHOOL;
    }
    
    function getRarity() external pure override returns (string memory) {
        return RARITY;
    }
    
    function getBaseValue() external pure override returns (uint256) {
        return BASE_VALUE;
    }
    
    function getTotalValue() external pure override returns (uint256) {
        return TOTAL_VALUE;
    }
    
    function getPrefix() external pure override returns (string memory, uint256, string memory) {
        ${gem.prefix ? `
        return (PREFIX_NAME, PREFIX_VALUE, PREFIX_TYPE);
        ` : `
        return ("", 0, "");
        `}
    }
    
    function getSuffix() external pure override returns (string memory, uint256, string memory) {
        ${gem.suffix ? `
        return (SUFFIX_NAME, SUFFIX_VALUE, SUFFIX_TYPE);
        ` : `
        return ("", 0, "");
        `}
    }
    
    function getSocketLevel() external pure override returns (uint256) {
        return SOCKET_LEVEL;
    }
    
    function canCombine() external pure override returns (bool) {
        return CAN_COMBINE;
    }
    
    /**
     * @dev Receive electrical impulse from another Diamond (neuron)
     * This is the "rsync" mechanism - cross-contract communication
     */
    function receiveImpulse(address fromDiamond, uint256 value) external pure override returns (uint256) {
        // Process the impulse through this gem's modifiers
        return processImpulse(value);
    }
    
    /**
     * @dev Send electrical impulse to another Diamond (neuron)
     * This is the "rsync" mechanism - cross-contract communication
     */
    function sendImpulse(address toDiamond, uint256 value) external pure override returns (bool) {
        // In a real implementation, this would call the target Diamond
        // For now, return success
        return true;
    }
    
    /**
     * @dev Process an electrical impulse through this gem's modifiers
     * Applies prefix/suffix effects (additive/multiplicative)
     */
    function processImpulse(uint256 inputValue) external pure override returns (uint256) {
        uint256 result = inputValue;
        
        ${gem.prefix ? `
        // Apply prefix modifier
        if (keccak256(bytes(PREFIX_TYPE)) == keccak256(bytes("Additive"))) {
            result += PREFIX_VALUE;
        } else if (keccak256(bytes(PREFIX_TYPE)) == keccak256(bytes("Multiplicative"))) {
            result = (result * PREFIX_VALUE) / 100; // Assuming percentage
        }
        ` : ''}
        
        ${gem.suffix ? `
        // Apply suffix modifier
        if (keccak256(bytes(SUFFIX_TYPE)) == keccak256(bytes("Additive"))) {
            result += SUFFIX_VALUE;
        } else if (keccak256(bytes(SUFFIX_TYPE)) == keccak256(bytes("Multiplicative"))) {
            result = (result * SUFFIX_VALUE) / 100; // Assuming percentage
        }
        ` : ''}
        
        return result;
    }
}
`;
}

// Calculate total value with modifiers
function calculateTotalValue(gem: GemDefinition): number {
  let total = gem.baseValue;
  
  if (gem.prefix) {
    if (gem.prefix.type === ModifierType.ADDITIVE) {
      total += gem.prefix.value;
    } else if (gem.prefix.type === ModifierType.MULTIPLICATIVE) {
      total = Math.floor(total * gem.prefix.value);
    }
  }
  
  if (gem.suffix) {
    if (gem.suffix.type === ModifierType.ADDITIVE) {
      total += gem.suffix.value;
    } else if (gem.suffix.type === ModifierType.MULTIPLICATIVE) {
      total = Math.floor(total * gem.suffix.value);
    }
  }
  
  return total;
}

// Generate nervous system Diamond (acts as neuron)
function generateNervousSystemDiamond(): string {
  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * Nervous System Diamond
 * 
 * This Diamond acts as a neuron in the Diamond nervous system.
 * It can:
 * - Socket gems (facets) from different schools
 * - Receive electrical impulses from other Diamonds
 * - Send electrical impulses to other Diamonds
 * - Process impulses through socketed gems
 * - Act as part of a larger "program tree" nervous system
 * 
 * The "rsync" mechanism: Cross-contract calls between Diamonds
 */

interface INervousSystemDiamond {
    // Gem socketing
    function socketGem(address gemAddress, uint256 socketIndex) external;
    function unsocketGem(uint256 socketIndex) external;
    function getSocketedGems() external view returns (address[] memory);
    
    // Neuron functions - Diamond-to-Diamond communication
    function receiveImpulse(address fromDiamond, uint256 value) external returns (uint256);
    function sendImpulse(address toDiamond, uint256 value) external returns (bool);
    function processThroughGems(uint256 inputValue) external view returns (uint256);
    
    // Nervous system functions
    function connectToDiamond(address diamondAddress) external;
    function disconnectFromDiamond(address diamondAddress) external;
    function getConnectedDiamonds() external view returns (address[] memory);
    function propagateImpulse(address[] memory path, uint256 value) external returns (uint256);
}

contract NervousSystemDiamond is INervousSystemDiamond {
    // Socket system (like PoE)
    address[] private socketedGems;
    mapping(uint256 => address) private sockets; // socketIndex => gemAddress
    uint256 public constant MAX_SOCKETS = 6; // Like PoE
    
    // Nervous system connections (like neurons)
    address[] private connectedDiamonds;
    mapping(address => bool) private isConnected;
    
    // Impulse processing
    mapping(address => uint256) private impulseHistory;
    
    /**
     * @dev Socket a gem into this Diamond
     * Like PoE gem socketing system
     */
    function socketGem(address gemAddress, uint256 socketIndex) external override {
        require(socketIndex < MAX_SOCKETS, "Invalid socket index");
        require(sockets[socketIndex] == address(0), "Socket already occupied");
        
        sockets[socketIndex] = gemAddress;
        socketedGems.push(gemAddress);
    }
    
    /**
     * @dev Unsocket a gem from this Diamond
     */
    function unsocketGem(uint256 socketIndex) external override {
        require(socketIndex < MAX_SOCKETS, "Invalid socket index");
        require(sockets[socketIndex] != address(0), "Socket is empty");
        
        address gemAddress = sockets[socketIndex];
        sockets[socketIndex] = address(0);
        
        // Remove from array
        for (uint256 i = 0; i < socketedGems.length; i++) {
            if (socketedGems[i] == gemAddress) {
                socketedGems[i] = socketedGems[socketedGems.length - 1];
                socketedGems.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Get all socketed gems
     */
    function getSocketedGems() external view override returns (address[] memory) {
        return socketedGems;
    }
    
    /**
     * @dev Receive electrical impulse from another Diamond (neuron)
     * This is the "rsync" mechanism
     */
    function receiveImpulse(address fromDiamond, uint256 value) external override returns (uint256) {
        require(isConnected[fromDiamond] || fromDiamond == address(this), "Not connected");
        
        impulseHistory[fromDiamond] = value;
        
        // Process through socketed gems
        return processThroughGems(value);
    }
    
    /**
     * @dev Send electrical impulse to another Diamond (neuron)
     * This is the "rsync" mechanism
     */
    function sendImpulse(address toDiamond, uint256 value) external override returns (bool) {
        require(isConnected[toDiamond], "Diamond not connected");
        
        // In real implementation, this would call toDiamond.receiveImpulse()
        // For now, return success
        return true;
    }
    
    /**
     * @dev Process impulse through all socketed gems
     * Each gem modifies the value (additive/multiplicative)
     */
    function processThroughGems(uint256 inputValue) public view override returns (uint256) {
        uint256 result = inputValue;
        
        // Process through each socketed gem
        for (uint256 i = 0; i < socketedGems.length; i++) {
            address gemAddress = socketedGems[i];
            if (gemAddress != address(0)) {
                // Call gem's processImpulse function
                // In real implementation, use interface call
                // result = IGem(gemAddress).processImpulse(result);
            }
        }
        
        return result;
    }
    
    /**
     * @dev Connect to another Diamond (neuron connection)
     */
    function connectToDiamond(address diamondAddress) external override {
        require(!isConnected[diamondAddress], "Already connected");
        require(diamondAddress != address(this), "Cannot connect to self");
        
        connectedDiamonds.push(diamondAddress);
        isConnected[diamondAddress] = true;
    }
    
    /**
     * @dev Disconnect from a Diamond
     */
    function disconnectFromDiamond(address diamondAddress) external override {
        require(isConnected[diamondAddress], "Not connected");
        
        isConnected[diamondAddress] = false;
        
        // Remove from array
        for (uint256 i = 0; i < connectedDiamonds.length; i++) {
            if (connectedDiamonds[i] == diamondAddress) {
                connectedDiamonds[i] = connectedDiamonds[connectedDiamonds.length - 1];
                connectedDiamonds.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Get all connected Diamonds
     */
    function getConnectedDiamonds() external view override returns (address[] memory) {
        return connectedDiamonds;
    }
    
    /**
     * @dev Propagate impulse through a path of Diamonds
     * This creates the "program tree" nervous system
     */
    function propagateImpulse(address[] memory path, uint256 value) external override returns (uint256) {
        require(path.length > 0, "Path cannot be empty");
        
        uint256 result = value;
        
        // Process through each Diamond in the path
        for (uint256 i = 0; i < path.length; i++) {
            address diamondAddress = path[i];
            require(isConnected[diamondAddress] || diamondAddress == address(this), "Path contains unconnected Diamond");
            
            // In real implementation, call diamond's receiveImpulse
            // result = INervousSystemDiamond(diamondAddress).receiveImpulse(address(this), result);
        }
        
        return result;
    }
}
`;
}

// Main generation function
async function main() {
  console.log('🎮 Generating PoE/Diablo 2 Gem System for Diamond Standard...');
  console.log('='.repeat(70));
  
  const gemsDir = '/home/theos/gems';
  const nervousDir = '/home/theos/nervous_system';
  
  // Create directories
  if (!fs.existsSync(gemsDir)) {
    fs.mkdirSync(gemsDir, { recursive: true });
  }
  if (!fs.existsSync(nervousDir)) {
    fs.mkdirSync(nervousDir, { recursive: true });
  }
  
  // Generate gems for each school
  const schools = Object.values(ElementalSchool);
  const rarities = Object.values(GemRarity);
  const gems: GemDefinition[] = [];
  
  let gemId = 1;
  for (const school of schools) {
    for (const rarity of rarities) {
      // Generate 10 gems per school/rarity combination
      for (let i = 0; i < 10; i++) {
        const gem = generateGem(gemId++, school, rarity);
        gems.push(gem);
        
        const gemCode = generateGemContract(gem);
        const gemPath = `${gemsDir}/${school.replace(/\s+/g, '')}Gem${gem.id}.sol`;
        fs.writeFileSync(gemPath, gemCode);
        
        console.log(`✅ Generated: ${gem.name} (ID: ${gem.id}, School: ${gem.school}, Rarity: ${gem.rarity})`);
      }
    }
  }
  
  // Generate nervous system Diamond
  const nervousCode = generateNervousSystemDiamond();
  fs.writeFileSync(`${nervousDir}/NervousSystemDiamond.sol`, nervousCode);
  console.log(`✅ Generated: NervousSystemDiamond.sol`);
  
  // Generate manifest
  const manifest = {
    system: 'PoE/Diablo 2 Gem System for Diamond Standard',
    concept: 'Diamonds as neurons in a nervous system',
    communication: 'rsync-like cross-contract calls',
    gems: gems.map(g => ({
      id: g.id,
      name: g.name,
      school: g.school,
      rarity: g.rarity,
      baseValue: g.baseValue,
      totalValue: calculateTotalValue(g),
      prefix: g.prefix,
      suffix: g.suffix,
      socketLevel: g.socketLevel
    })),
    generated_at: new Date().toISOString()
  };
  
  fs.writeFileSync(`${gemsDir}/gem_manifest.json`, JSON.stringify(manifest, null, 2));
  console.log(`✅ Generated: gem_manifest.json`);
  
  console.log('');
  console.log('='.repeat(70));
  console.log('✨ Gem System Generation Complete!');
  console.log(`   Total Gems: ${gems.length}`);
  console.log(`   Schools: ${schools.length}`);
  console.log(`   Rarities: ${rarities.length}`);
  console.log('');
  console.log('🎮 System Features:');
  console.log('   • PoE-style gem socketing');
  console.log('   • Diablo 2 prefix/suffix modifiers');
  console.log('   • Elemental schools');
  console.log('   • Additive/multiplicative effects');
  console.log('   • Diamond-to-Diamond communication (rsync)');
  console.log('   • Nervous system architecture');
}

main().catch(console.error);
