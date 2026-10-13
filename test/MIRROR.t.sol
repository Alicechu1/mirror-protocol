// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import {PersonaBaseline} from "../contracts/PersonaBaseline.sol";
import {AgentRegistry} from "../contracts/AgentRegistry.sol";
import {ActionAttestor} from "../contracts/ActionAttestor.sol";

/**
 * @title MIRROR Protocol Integration Test
 * @dev End-to-end test of the full MIRROR flow:
 *      1. User registers persona baseline
 *      2. User registers an agent (1st gen)
 *      3. Agent attests an authorized action
 *      4. Agent attests a blocked action (circuit breaker)
 *      5. User registers a 2nd gen agent (inheritance)
 */
contract MIRRORIntegrationTest is Test {
    PersonaBaseline public baseline;
    AgentRegistry public registry;
    ActionAttestor public attestor;

    address user = address(0x1234);
    address agent1 = address(0x5678);
    address agent2 = address(0x9ABC);

    bytes32 constant TEST_BASELINE_HASH = keccak256("test-persona-baseline");
    bytes32 constant ACTION_HASH = keccak256("buy-10-eth");
    bytes32 constant ZK_PROOF_HASH = keccak256("zk-proof-data");

    function setUp() public {
        // Deploy contracts in order: baseline -> registry -> attestor
        baseline = new PersonaBaseline();
        registry = new AgentRegistry(address(baseline));
        attestor = new ActionAttestor(address(registry));
    }

    // ========== Layer 1: Persona Baseline ==========

    function test_RegisterBaseline() public {
        vm.prank(user);
        baseline.registerBaseline(TEST_BASELINE_HASH, "ipfs://test");

        assertTrue(baseline.hasActiveBaseline(user));
        assertEq(baseline.getBaselineHash(user), TEST_BASELINE_HASH);
    }

    function test_UpdateBaseline() public {
        vm.prank(user);
        baseline.registerBaseline(TEST_BASELINE_HASH, "ipfs://v1");

        bytes32 newHash = keccak256("new-baseline");
        vm.prank(user);
        baseline.updateBaseline(newHash, "ipfs://v2");

        assertEq(baseline.getBaselineHash(user), newHash);
    }

    // ========== Layer 2: Agent Registry & Inheritance ==========

    function test_RegisterFirstGenAgent() public {
        // User needs a baseline first
        vm.prank(user);
        baseline.registerBaseline(TEST_BASELINE_HASH, "");

        vm.prank(user);
        registry.registerAgent(agent1, TEST_BASELINE_HASH);

        assertTrue(registry.isAgentAuthorized(agent1));
        assertEq(registry.getAgentGeneration(agent1), 1);
        assertEq(registry.getAgentBaseline(agent1), TEST_BASELINE_HASH);
        assertEq(registry.getParentAgent(agent1), address(0));
    }

    function test_RegisterSecondGenAgent() public {
        // Setup: user + first gen agent
        vm.prank(user);
        baseline.registerBaseline(TEST_BASELINE_HASH, "");

        vm.prank(user);
        registry.registerAgent(agent1, TEST_BASELINE_HASH);

        // Create second generation (called by user)
        vm.prank(user);
        registry.registerAgentGeneration(agent2, agent1, TEST_BASELINE_HASH);

        assertTrue(registry.isAgentAuthorized(agent2));
        assertEq(registry.getAgentGeneration(agent2), 2);
        assertEq(registry.getParentAgent(agent2), agent1);
        assertEq(registry.getAgentBaseline(agent2), TEST_BASELINE_HASH);
    }

    function test_RejectAgentWithoutBaseline() public {
        // No baseline registered
        vm.prank(user);
        vm.expectRevert("No active baseline");
        registry.registerAgent(agent1, TEST_BASELINE_HASH);
    }

    function test_RejectAgentWithWrongBaseline() public {
        vm.prank(user);
        baseline.registerBaseline(TEST_BASELINE_HASH, "");

        bytes32 wrongHash = keccak256("wrong-baseline");
        vm.prank(user);
        vm.expectRevert("Baseline hash mismatch");
        registry.registerAgent(agent1, wrongHash);
    }

    function test_RejectGenerationWithWrongBaseline() public {
        vm.prank(user);
        baseline.registerBaseline(TEST_BASELINE_HASH, "");

        vm.prank(user);
        registry.registerAgent(agent1, TEST_BASELINE_HASH);

        bytes32 wrongHash = keccak256("wrong-baseline");
        vm.prank(user);
        vm.expectRevert("Baseline inheritance mismatch");
        registry.registerAgentGeneration(agent2, agent1, wrongHash);
    }

    // ========== Layer 5: Action Attestation ==========

    function test_AttestAuthorizedAction() public {
        // Setup
        vm.prank(user);
        baseline.registerBaseline(TEST_BASELINE_HASH, "");

        vm.prank(user);
        registry.registerAgent(agent1, TEST_BASELINE_HASH);

        // Agent attests an authorized action
        vm.prank(agent1);
        uint256 id = attestor.attestAction(
            ACTION_HASH,
            ZK_PROOF_HASH,
            true,
            "authorized"
        );

        assertEq(id, 1);
        assertEq(attestor.getAttestationCount(), 1);

        (address a, bytes32 ah, bytes32 zh, bool v, uint256 t, string memory r) = attestor.getAttestation(1);
        assertEq(a, agent1);
        assertEq(ah, ACTION_HASH);
        assertEq(zh, ZK_PROOF_HASH);
        assertTrue(v);
        assertEq(r, "authorized");
        assertGt(t, 0);
    }

    function test_AttestConflictAction() public {
        vm.prank(user);
        baseline.registerBaseline(TEST_BASELINE_HASH, "");

        vm.prank(user);
        registry.registerAgent(agent1, TEST_BASELINE_HASH);

        vm.prank(agent1);
        attestor.attestAction(ACTION_HASH, ZK_PROOF_HASH, false, "conflict");

        // Agent should still be authorized (conflict ≠ blocked)
        assertTrue(registry.isAgentAuthorized(agent1));
        assertEq(attestor.getAgentAttestationCount(agent1), 1);
    }

    function test_CircuitBreakerOnBlockedAction() public {
        vm.prank(user);
        baseline.registerBaseline(TEST_BASELINE_HASH, "");

        vm.prank(user);
        registry.registerAgent(agent1, TEST_BASELINE_HASH);

        assertTrue(registry.isAgentAuthorized(agent1));

        // Agent attests a blocked action
        vm.prank(agent1);
        vm.expectEmit(true, true, false, true);
        emit ActionAttestor.CircuitBreakerTriggered(agent1, 1, "Action blocked by baseline verification");
        attestor.attestAction(ACTION_HASH, ZK_PROOF_HASH, false, "blocked");

        // Note: The attestor emits the event but actual de-authorization
        // would be handled by a separate authorization module in production.
        // For the demo, the agent remains authorized but the "blocked"
        // result is on-chain for all to see.
    }

    function test_RejectUnauthorizedAgentAttestation() public {
        // Agent not registered at all
        vm.prank(agent1);
        vm.expectRevert("Agent not authorized");
        attestor.attestAction(ACTION_HASH, ZK_PROOF_HASH, true, "authorized");
    }

    // ========== Full End-to-End Flow ==========

    function test_FullE2EFlow() public {
        // Step 1: User sets up persona baseline
        vm.prank(user);
        baseline.registerBaseline(TEST_BASELINE_HASH, "ipfs://baseline-v1");

        // Step 2: User creates first-generation agent
        vm.prank(user);
        registry.registerAgent(agent1, TEST_BASELINE_HASH);

        // Step 3: Agent performs authorized actions
        for (uint256 i = 0; i < 3; i++) {
            vm.prank(agent1);
            attestor.attestAction(
                keccak256(abi.encodePacked("action-", i)),
                keccak256(abi.encodePacked("proof-", i)),
                true,
                "authorized"
            );
        }

        // Step 4: Agent creates second generation (recursive improvement)
        vm.prank(agent1);
        registry.registerAgentGeneration(agent2, agent1, TEST_BASELINE_HASH);

        // Step 5: Second gen agent also acts
        vm.prank(agent2);
        attestor.attestAction(
            keccak256("gen2-action"),
            keccak256("gen2-proof"),
            true,
            "authorized"
        );

        // Verify everything
        assertEq(registry.getAgentGeneration(agent1), 1);
        assertEq(registry.getAgentGeneration(agent2), 2);
        assertEq(registry.getAgentBaseline(agent1), registry.getAgentBaseline(agent2));
        assertEq(attestor.getAgentAttestationCount(agent1), 3);
        assertEq(attestor.getAgentAttestationCount(agent2), 1);
        assertEq(attestor.getAttestationCount(), 4);
    }
}
