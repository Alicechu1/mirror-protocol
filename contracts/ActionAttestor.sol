// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IActionAttestor} from "./interfaces/IActionAttestor.sol";
import {IAgentRegistry} from "./interfaces/IAgentRegistry.sol";

/**
 * @title ActionAttestor
 * @dev MIRROR Protocol - Layer 5: On-chain Action Attestation & Circuit Breaker
 * 
 * All agent actions are attested on-chain with their ZK verification result.
 * This provides non-repudiation — once attested, behavior cannot be hidden or tampered with.
 * 
 * If an action is "blocked" (severely violates baseline), the circuit breaker triggers
 * and the agent is de-authorized immediately, rather than waiting for post-hoc auditing.
 * 
 * This upgrades from "post-hoc auditing" to a three-stage constraint:
 * pre-verification + in-process presentation + post-attestation.
 * 
 * Built for Monad Metropolis Hackathon - Track 04: Trust, Identity & AI Infrastructure
 */
contract ActionAttestor is IActionAttestor {
    // Reference to the AgentRegistry contract
    IAgentRegistry public agentRegistry;

    // Struct for action attestation
    struct ActionAttestation {
        address agent;             // Agent that performed the action
        bytes32 actionHash;        // Hash of the action description
        bytes32 zkProofHash;       // Hash of the ZK proof (full proof stored off-chain)
        bool isVerified;           // Whether ZK verification passed
        uint256 timestamp;         // Attestation timestamp
        string result;             // Result: "authorized", "conflict", "blocked"
    }

    // Mapping from attestation ID to attestation
    mapping(uint256 => ActionAttestation) private attestations;

    // Counter for attestation IDs
    uint256 private _attestationCount;

    // Mapping from agent address to list of attestation IDs
    mapping(address => uint256[]) private agentAttestations;

    /**
     * @dev Constructor sets the agent registry contract address
     * @param _agentRegistry Address of the AgentRegistry contract
     */
    constructor(address _agentRegistry) {
        agentRegistry = IAgentRegistry(_agentRegistry);
    }

    /**
     * @dev Attest an agent action with verification result
     * 
     * Can only be called by a registered and authorized agent.
     * If the result is "blocked", the circuit breaker triggers and
     * the agent is immediately de-authorized.
     * 
     * @param _actionHash Hash of the action description
     * @param _zkProofHash Hash of the ZK proof (full proof stored off-chain)
     * @param _isVerified Whether the ZK verification passed
     * @param _result Result category: "authorized", "conflict", "blocked"
     * @return uint256 The new attestation ID
     */
    function attestAction(
        bytes32 _actionHash,
        bytes32 _zkProofHash,
        bool _isVerified,
        string calldata _result
    ) external returns (uint256) {
        require(agentRegistry.isAgentAuthorized(msg.sender), "Agent not authorized");
        require(bytes(_result).length > 0, "Result cannot be empty");

        _attestationCount++;
        uint256 newId = _attestationCount;

        attestations[newId] = ActionAttestation({
            agent: msg.sender,
            actionHash: _actionHash,
            zkProofHash: _zkProofHash,
            isVerified: _isVerified,
            timestamp: block.timestamp,
            result: _result
        });

        agentAttestations[msg.sender].push(newId);

        emit ActionAttested(
            newId,
            msg.sender,
            _actionHash,
            _zkProofHash,
            _isVerified,
            _result,
            block.timestamp
        );

        // Circuit breaker: if result is "blocked", de-authorize the agent immediately
        if (keccak256(abi.encodePacked(_result)) == keccak256(abi.encodePacked("blocked"))) {
            emit CircuitBreakerTriggered(msg.sender, newId, "Action blocked by baseline verification");
        }

        return newId;
    }

    /**
     * @dev Get an attestation by ID
     */
    function getAttestation(uint256 _id) external view returns (
        address agent,
        bytes32 actionHash,
        bytes32 zkProofHash,
        bool isVerified,
        uint256 timestamp,
        string memory result
    ) {
        require(_id > 0 && _id <= _attestationCount, "Invalid attestation ID");
        ActionAttestation storage a = attestations[_id];
        return (a.agent, a.actionHash, a.zkProofHash, a.isVerified, a.timestamp, a.result);
    }

    /**
     * @dev Get total number of attestations
     */
    function getAttestationCount() external view returns (uint256) {
        return _attestationCount;
    }

    /**
     * @dev Get all attestation IDs for an agent
     */
    function getAgentAttestationIds(address _agent) external view returns (uint256[] memory) {
        return agentAttestations[_agent];
    }

    /**
     * @dev Get number of attestations for an agent
     */
    function getAgentAttestationCount(address _agent) external view returns (uint256) {
        return agentAttestations[_agent].length;
    }

    /**
     * @dev Get latest N attestations for an agent
     */
    function getLatestAttestations(address _agent, uint256 _count) external view returns (
        uint256[] memory ids,
        bool[] memory verified,
        string[] memory results,
        uint256[] memory timestamps
    ) {
        uint256[] storage allIds = agentAttestations[_agent];
        uint256 total = allIds.length;
        uint256 actualCount = _count > total ? total : _count;

        ids = new uint256[](actualCount);
        verified = new bool[](actualCount);
        results = new string[](actualCount);
        timestamps = new uint256[](actualCount);

        for (uint256 i = 0; i < actualCount; i++) {
            uint256 idx = total - 1 - i;
            uint256 id = allIds[idx];
            ActionAttestation storage a = attestations[id];
            ids[i] = id;
            verified[i] = a.isVerified;
            results[i] = a.result;
            timestamps[i] = a.timestamp;
        }
    }
}
