// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/PersonaBaseline.sol";

/**
 * @title DeployPersonaBaseline
 * @dev Deployment script for MIRROR Protocol's PersonaBaseline contract
 * 
 * Usage:
 *   forge script script/DeployPersonaBaseline.s.sol:DeployPersonaBaseline \
 *     --rpc-url $MONAD_TESTNET_RPC \
 *     --private-key $PRIVATE_KEY \
 *     --broadcast \
 *     --verify
 * 
 * Monad Testnet RPC: https://testnet-rpc.monad.xyz
 * Chain ID: 10143
 */
contract DeployPersonaBaseline is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        PersonaBaseline baseline = new PersonaBaseline();
        
        vm.stopBroadcast();
        
        console.log("PersonaBaseline deployed at:", address(baseline));
    }
}
