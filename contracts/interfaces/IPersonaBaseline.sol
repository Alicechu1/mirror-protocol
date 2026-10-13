// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IPersonaBaseline
 * @dev MIRROR Protocol - Layer 1: Computable Persona Baseline Interface
 * 
 * Users register a hash of their persona baseline on-chain.
 * Raw data stays off-chain; only the commitment hash is on-chain.
 */
interface IPersonaBaseline {
    /// @notice Emitted when a user registers a new baseline
    event BaselineRegistered(address indexed user, bytes32 commitmentHash, uint256 timestamp);

    /// @notice Emitted when a user updates their baseline
    event BaselineUpdated(address indexed user, bytes32 newCommitmentHash, uint256 timestamp);

    /**
     * @dev Register a new persona baseline for the caller
     * @param commitmentHash Hash of the persona baseline data
     * @param metadataURI Optional URI for encrypted baseline metadata
     */
    function registerBaseline(bytes32 commitmentHash, string calldata metadataURI) external;

    /**
     * @dev Update an existing persona baseline
     * @param newCommitmentHash New hash of the updated baseline
     * @param newMetadataURI New metadata URI
     */
    function updateBaseline(bytes32 newCommitmentHash, string calldata newMetadataURI) external;

    /**
     * @dev Get baseline commitment hash for a user
     * @param user Address of the user
     * @return bytes32 The baseline commitment hash
     */
    function getBaselineHash(address user) external view returns (bytes32);

    /**
     * @dev Check if a user has an active baseline
     * @param user Address of the user
     * @return bool Whether the baseline is active
     */
    function hasActiveBaseline(address user) external view returns (bool);
}
