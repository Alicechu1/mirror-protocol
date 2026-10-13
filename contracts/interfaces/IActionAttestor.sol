// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IActionAttestor
 * @dev MIRROR Protocol - Layer 5: On-chain Action Attestation Interface
 * 
 * Attests agent actions on-chain with ZK proof hashes.
 * Provides non-repudiation and auditability for all agent behavior.
 */
interface IActionAttestor {
    /// @notice Emitted when an action is attested on-chain
    event ActionAttested(
        uint256 indexed attestationId,
        address indexed agent,
        bytes32 actionHash,
        bytes32 zkProofHash,
        bool isVerified,
        string result,
        uint256 timestamp
    );

    /// @notice Emitted when an agent triggers the circuit breaker
    event CircuitBreakerTriggered(address indexed agent, uint256 attestationId, string reason);

    /**
     * @dev Attest an agent action with verification result
     * @param actionHash Hash of the action description
     * @param zkProofHash Hash of the ZK proof (full proof stored off-chain)
     * @param isVerified Whether the verification passed
     * @param result Result category: "authorized", "conflict", "blocked"
     */
    function attestAction(
        bytes32 actionHash,
        bytes32 zkProofHash,
        bool isVerified,
        string calldata result
    ) external returns (uint256);

    /**
     * @dev Get an attestation by ID
     * @param id Attestation ID
     */
    function getAttestation(uint256 id) external view returns (
        address agent,
        bytes32 actionHash,
        bytes32 zkProofHash,
        bool isVerified,
        uint256 timestamp,
        string memory result
    );

    /**
     * @dev Get total number of attestations
     */
    function getAttestationCount() external view returns (uint256);
}
