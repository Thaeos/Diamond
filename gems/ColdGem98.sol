// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * Frost Cold Gem of Ice
 * ID: 98
 * School: Cold
 * Rarity: Legendary
 * Base Value: 882
 * Total Value: 1063
 * Socket Level Required: 10
 * Prefix: Frost (Multiplicative)\n * Suffix: of Ice (Additive)
 * 
 * This gem can be socketed into a Diamond contract.
 * Acts as a neuron in the Diamond nervous system.
 */

interface IColdGem98 {
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

contract ColdGem98 is IColdGem98 {
    uint256 private constant GEM_ID = 98;
    string private constant SCHOOL = "Cold";
    string private constant RARITY = "Legendary";
    uint256 private constant BASE_VALUE = 882;
    uint256 private constant TOTAL_VALUE = 1063;
    uint256 private constant SOCKET_LEVEL = 10;
    bool private constant CAN_COMBINE = false;
    
    
    // Prefix Modifier
    string private constant PREFIX_NAME = "Frost";
    uint256 private constant PREFIX_VALUE = 1.2;
    string private constant PREFIX_TYPE = "Multiplicative";
    
    
    
    // Suffix Modifier
    string private constant SUFFIX_NAME = "of Ice";
    uint256 private constant SUFFIX_VALUE = 5;
    string private constant SUFFIX_TYPE = "Additive";
    
    
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
        
        return (PREFIX_NAME, PREFIX_VALUE, PREFIX_TYPE);
        
    }
    
    function getSuffix() external pure override returns (string memory, uint256, string memory) {
        
        return (SUFFIX_NAME, SUFFIX_VALUE, SUFFIX_TYPE);
        
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
        
        
        // Apply prefix modifier
        if (keccak256(bytes(PREFIX_TYPE)) == keccak256(bytes("Additive"))) {
            result += PREFIX_VALUE;
        } else if (keccak256(bytes(PREFIX_TYPE)) == keccak256(bytes("Multiplicative"))) {
            result = (result * PREFIX_VALUE) / 100; // Assuming percentage
        }
        
        
        
        // Apply suffix modifier
        if (keccak256(bytes(SUFFIX_TYPE)) == keccak256(bytes("Additive"))) {
            result += SUFFIX_VALUE;
        } else if (keccak256(bytes(SUFFIX_TYPE)) == keccak256(bytes("Multiplicative"))) {
            result = (result * SUFFIX_VALUE) / 100; // Assuming percentage
        }
        
        
        return result;
    }
}
