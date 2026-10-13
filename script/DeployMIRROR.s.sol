// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import {PersonaBaseline} from "../contracts/PersonaBaseline.sol";
import {AgentRegistry} from "../contracts/AgentRegistry.sol";
import {ActionAttestor} from "../contracts/ActionAttestor.sol";

/**
 * @title DeployMIRROR
 * @dev Deployment script for MIRROR Protocol Suite
 * 
 * Deploys all three core contracts in the correct order:
 * 1. PersonaBaseline
 * 2. AgentRegistry (depends on PersonaBaseline)
 * 3. ActionAttestor (depends on AgentRegistry)
 * 
 * Usage:
 *   forge script script/DeployMIRROR.s.sol:DeployMIRROR \
 *     --rpc-url $MONAD_TESTNET_RPC \
 *     --private-key $PRIVATE_KEY \
 *     --broadcast
 * 
 * Monad Testnet:
 *   RPC: https://testnet-rpc.monad.xyz
 *   Chain ID: 10143
 */
contract DeployMIRROR is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("========================================");
        console.log("MIRROR Protocol Suite Deployment");
        console.log("Deployer:", deployer);
        console.log("========================================");

        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Deploy PersonaBaseline
        console.log("\n[1/3] Deploying PersonaBaseline...");
        PersonaBaseline baseline = new PersonaBaseline();
        console.log("  PersonaBaseline deployed at:", address(baseline));

        // Step 2: Deploy AgentRegistry
        console.log("\n[2/3] Deploying AgentRegistry...");
        AgentRegistry registry = new AgentRegistry(address(baseline));
        console.log("  AgentRegistry deployed at:", address(registry));

        // Step 3: Deploy ActionAttestor
        console.log("\n[3/3] Deploying ActionAttestor...");
        ActionAttestor attestor = new ActionAttestor(address(registry));
        console.log("  ActionAttestor deployed at:", address(attestor));

        vm.stopBroadcast();

        console.log("\n========================================");
        console.log("Deployment Complete!");
        console.log("========================================");
        console.log("PersonaBaseline:  ", address(baseline));
        console.log("AgentRegistry:    ", address(registry));
        console.log("ActionAttestor:   ", address(attestor));
        console.log("========================================");
    }
}
