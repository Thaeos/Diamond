// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@safe-global/safe-contracts/contracts/base/ModuleManager.sol";
import "@safe-global/safe-contracts/contracts/interfaces/ISafe.sol";

/**
 * @title SafeDiamondModule
 * @notice Safe{Wallet} module for Diamond Contract operations
 * 
 * Enables Diamond Contract to be controlled via Safe{Wallet}:
 * - Diamond upgrades via multi-sig
 * - Trading operations via Safe
 * - Multi-chain operations
 * - Gasless transactions
 */
contract SafeDiamondModule is Module {
    // Diamond Contract address
    address public immutable diamondAddress;
    
    // Events
    event DiamondCutExecuted(address indexed diamond, bytes4[] selectors);
    event DiamondOperationExecuted(address indexed diamond, bytes4 selector, bytes data);
    
    constructor(address _diamondAddress) {
        require(_diamondAddress != address(0), "Invalid diamond address");
        diamondAddress = _diamondAddress;
    }
    
    /**
     * @notice Execute Diamond Cut via Safe{Wallet}
     * @param _diamondCut Diamond cut data
     */
    function executeDiamondCut(
        IDiamondCut.FacetCut[] memory _diamondCut,
        address _init,
        bytes memory _calldata
    ) external {
        // Only Safe{Wallet} can call
        require(msg.sender == address(safe), "Only Safe can execute");
        
        // Execute diamond cut
        IDiamondCut(diamondAddress).diamondCut(_diamondCut, _init, _calldata);
        
        // Emit event
        bytes4[] memory selectors = new bytes4[](_diamondCut.length);
        for (uint i = 0; i < _diamondCut.length; i++) {
            selectors[i] = _diamondCut[i].functionSelectors[0];
        }
        emit DiamondCutExecuted(diamondAddress, selectors);
    }
    
    /**
     * @notice Execute Diamond operation via Safe{Wallet}
     * @param _data Encoded function call
     */
    function executeDiamondOperation(bytes memory _data) external {
        // Only Safe{Wallet} can call
        require(msg.sender == address(safe), "Only Safe can execute");
        
        // Get selector
        bytes4 selector;
        assembly {
            selector := mload(add(_data, 0x20))
        }
        
        // Execute via delegatecall
        (bool success, ) = diamondAddress.delegatecall(_data);
        require(success, "Diamond operation failed");
        
        emit DiamondOperationExecuted(diamondAddress, selector, _data);
    }
    
    /**
     * @notice Get Diamond address
     */
    function getDiamondAddress() external view returns (address) {
        return diamondAddress;
    }
}
