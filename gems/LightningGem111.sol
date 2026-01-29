// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * Thunderous Lightning Gem
 * ID: 111
 * School: Lightning
 * Rarity: Magic
 * Base Value: 999
 * Total Value: 1024
 * Socket Level Required: 12
 * Prefix: Thunderous (Additive)
 * 
 * This gem can be socketed into a Diamond contract.
 * Acts as a neuron in the Diamond nervous system.
 */

interface ILightningGem111 {
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

contract LightningGem111 is ILightningGem111 {
    uint256 private constant GEM_ID = 111;
    string private constant SCHOOL = "Lightning";
    string private constant RARITY = "Magic";
    uint256 private constant BASE_VALUE = 999;
    uint256 private constant TOTAL_VALUE = 1024;
    uint256 private constant SOCKET_LEVEL = 12;
    bool private constant CAN_COMBINE = false;
    
    
    // Prefix Modifier
    string private constant PREFIX_NAME = "Thunderous";
    uint256 private constant PREFIX_VALUE = 25;
    string private constant PREFIX_TYPE = "Additive";
    
    
    
    
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
        
        return ("", 0, "");
        
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
        
        
        
        
        return result;
    }
}
