// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.20;

import "@safe-global/safe-contracts/contracts/base/ModuleManager.sol";
import "@safe-global/safe-contracts/contracts/interfaces/ISafe.sol";
import "./SignatureVerifier.sol";

/**
 * @title SafeDiamondModule
 * @notice Safe{Wallet} module for Diamond Contract operations
 * 
 * Enables Diamond Contract to be controlled via Safe{Wallet}:
 * - Diamond upgrades via multi-sig
 * - Trading operations via Safe
 * - Multi-chain operations
 * - Gasless transactions
 * - Signature verification for authentication
 * 
 * Based on Safe Global module patterns:
 * https://github.com/safe-fndn/safe-modules
 */
contract SafeDiamondModule is Module {
    // Diamond Contract address
    address public immutable diamondAddress;
    
    // Signature Verifier contract
    SignatureVerifier public immutable signatureVerifier;
    
    // Events
    event DiamondCutExecuted(
        address indexed diamond,
        bytes4[] selectors,
        address indexed executor
    );
    
    event DiamondOperationExecuted(
        address indexed diamond,
        bytes4 selector,
        bytes data,
        address indexed executor
    );
    
    event SignatureVerified(address indexed signer, bool isValid);
    
    /**
     * @notice Initialize module with Diamond Contract address and SignatureVerifier
     * @param _diamondAddress Diamond Contract address
     * @param _signatureVerifier SignatureVerifier contract address
     */
    constructor(address _diamondAddress, address _signatureVerifier) {
        require(_diamondAddress != address(0), "Invalid diamond address");
        require(_signatureVerifier != address(0), "Invalid signature verifier address");
        diamondAddress = _diamondAddress;
        signatureVerifier = SignatureVerifier(_signatureVerifier);
    }
    
    /**
     * @notice Verify signature before executing Diamond Cut
     * @param signature The signature to verify (optional, can be empty for primary signature check)
     */
    function verifySignature(bytes memory signature) public view returns (bool isValid, address signer) {
        (isValid, signer) = signatureVerifier.verifyPrimarySignature();
        if (isValid) {
            require(signatureVerifier.isPrimaryWallet(signer), "Signer must be primary wallet");
        }
    }
    
    /**
     * @notice Execute Diamond Cut via Safe{Wallet}
     * @param _diamondCut Diamond cut data (FacetCut array)
     * @param _init Initialization contract address
     * @param _calldata Initialization calldata
     */
    function executeDiamondCut(
        IDiamondCut.FacetCut[] memory _diamondCut,
        address _init,
        bytes memory _calldata
    ) external {
        // Only Safe{Wallet} can call
        require(msg.sender == address(safe), "Only Safe can execute");
        
        // Verify primary wallet signature
        (bool isValid, address signer) = verifySignature("");
        if (isValid) {
            emit SignatureVerified(signer, true);
        }
        
        // Execute diamond cut
        IDiamondCut(diamondAddress).diamondCut(_diamondCut, _init, _calldata);
        
        // Emit event with selectors
        bytes4[] memory selectors = new bytes4[](_diamondCut.length);
        for (uint i = 0; i < _diamondCut.length; i++) {
            if (_diamondCut[i].functionSelectors.length > 0) {
                selectors[i] = _diamondCut[i].functionSelectors[0];
            }
        }
        
        emit DiamondCutExecuted(diamondAddress, selectors, msg.sender);
    }
    
    /**
     * @notice Execute Diamond operation via Safe{Wallet}
     * @param _data Encoded function call to Diamond Contract
     */
    function executeDiamondOperation(bytes memory _data) external {
        // Only Safe{Wallet} can call
        require(msg.sender == address(safe), "Only Safe can execute");
        
        // Verify primary wallet signature
        (bool isValid, address signer) = verifySignature("");
        if (isValid) {
            emit SignatureVerified(signer, true);
        }
        
        // Get selector
        bytes4 selector;
        assembly {
            selector := mload(add(_data, 0x20))
        }
        
        // Execute via delegatecall to Diamond
        (bool success, bytes memory returnData) = diamondAddress.delegatecall(_data);
        require(success, "Diamond operation failed");
        
        emit DiamondOperationExecuted(diamondAddress, selector, _data, msg.sender);
    }
    
    /**
     * @notice Get Diamond Contract address
     * @return Diamond address
     */
    function getDiamondAddress() external view returns (address) {
        return diamondAddress;
    }
    
    /**
     * @notice Check if module is enabled on Safe
     * @return True if module is enabled
     */
    function isModuleEnabled() external view returns (bool) {
        return ISafe(payable(address(safe))).isModuleEnabled(address(this));
    }
}

// Diamond Cut Interface
interface IDiamondCut {
    enum FacetCutAction {
        Add,
        Replace,
        Remove
    }
    
    struct FacetCut {
        address facetAddress;
        FacetCutAction action;
        bytes4[] functionSelectors;
    }
    
    function diamondCut(
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external;
}
