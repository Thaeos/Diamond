// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@safe-global/safe-contracts/contracts/Safe.sol";
import "@safe-global/safe-contracts/contracts/proxies/SafeProxyFactory.sol";
import "./SafeDiamondModule.sol";

/**
 * @title SafeDiamondFactory
 * @notice Factory for creating Safe{Wallets} with Diamond Contract integration
 */
contract SafeDiamondFactory {
    SafeProxyFactory public immutable safeProxyFactory;
    address public immutable safeSingleton;
    
    event SafeDiamondCreated(
        address indexed safe,
        address indexed diamond,
        address indexed module,
        address[] owners,
        uint256 threshold
    );
    
    constructor(address _safeProxyFactory, address _safeSingleton) {
        safeProxyFactory = SafeProxyFactory(_safeProxyFactory);
        safeSingleton = _safeSingleton;
    }
    
    /**
     * @notice Create Safe{Wallet} with Diamond Contract module
     * @param _diamondAddress Diamond Contract address
     * @param _owners Safe owners
     * @param _threshold Multi-sig threshold
     * @param _saltNonce Salt for deterministic address
     */
    function createSafeWithDiamond(
        address _diamondAddress,
        address[] memory _owners,
        uint256 _threshold,
        uint256 _saltNonce
    ) external returns (address safe, address module) {
        // Create Safe
        bytes memory initializer = abi.encodeWithSelector(
            Safe.setup.selector,
            _owners,
            _threshold,
            address(0),
            "",
            address(0),
            address(0),
            0,
            address(0)
        );
        
        safe = address(safeProxyFactory.createProxyWithNonce(
            safeSingleton,
            initializer,
            _saltNonce
        ));
        
        // Deploy Diamond module
        module = address(new SafeDiamondModule(_diamondAddress));
        
        // Enable module on Safe
        Safe(payable(safe)).enableModule(module);
        
        emit SafeDiamondCreated(safe, _diamondAddress, module, _owners, _threshold);
    }
}
