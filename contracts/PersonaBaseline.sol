// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IPersonaBaseline} from "./interfaces/IPersonaBaseline.sol";

/**
 * @title PersonaBaseline
 * @dev MIRROR Protocol - Layer 1: Computable Persona Baseline Registry
 * 
 * Users register a hash of their persona baseline (value structure,
 * decision preferences, behavioral boundaries) on-chain.
 * Raw data stays off-chain (local to user). Only the commitment hash is on-chain.
 * 
 * Agents must reference a valid baseline to be authorized.
 * Baselines can be inherited across agent generations.
 * 
 * Built for Monad Metropolis Hackathon - Track 04: Trust, Identity & AI Infrastructure
 */
contract PersonaBaseline is IPersonaBaseline {
    // Struct representing a persona baseline commitment
    struct Baseline {
        bytes32 commitmentHash;    // Hash of the full persona baseline data
        uint256 createdAt;         // Registration timestamp
        uint256 updatedAt;         // Last update timestamp
        bool isActive;             // Whether baseline is active
        address owner;             // Owner of the baseline (user)
        string metadataURI;        // Optional: IPFS/Arweave URI for encrypted baseline
    }

    // Mapping from user address to their baseline
    mapping(address => Baseline) private baselines;

    /**
     * @dev Register a new persona baseline for the caller
     * @param _commitmentHash Hash of the persona baseline data
     * @param _metadataURI Optional URI for encrypted baseline metadata
     */
    function registerBaseline(bytes32 _commitmentHash, string calldata _metadataURI) external {
        require(!baselines[msg.sender].isActive, "Baseline already exists");
        require(_commitmentHash != bytes32(0), "Invalid commitment hash");

        baselines[msg.sender] = Baseline({
            commitmentHash: _commitmentHash,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            isActive: true,
            owner: msg.sender,
            metadataURI: _metadataURI
        });

        emit BaselineRegistered(msg.sender, _commitmentHash, block.timestamp);
    }

    /**
     * @dev Update an existing persona baseline
     * @param _newCommitmentHash New hash of the updated baseline
     * @param _newMetadataURI New metadata URI
     */
    function updateBaseline(bytes32 _newCommitmentHash, string calldata _newMetadataURI) external {
        Baseline storage baseline = baselines[msg.sender];
        require(baseline.isActive, "No active baseline");
        require(_newCommitmentHash != bytes32(0), "Invalid commitment hash");

        baseline.commitmentHash = _newCommitmentHash;
        baseline.updatedAt = block.timestamp;
        baseline.metadataURI = _newMetadataURI;

        emit BaselineUpdated(msg.sender, _newCommitmentHash, block.timestamp);
    }

    /**
     * @dev Get baseline commitment hash for a user
     */
    function getBaselineHash(address _user) external view returns (bytes32) {
        return baselines[_user].commitmentHash;
    }

    /**
     * @dev Check if a user has an active baseline
     */
    function hasActiveBaseline(address _user) external view returns (bool) {
        return baselines[_user].isActive;
    }

    /**
     * @dev Get full baseline info for a user
     */
    function getBaseline(address _user) external view returns (
        bytes32 commitmentHash,
        uint256 createdAt,
        uint256 updatedAt,
        bool isActive,
        string memory metadataURI
    ) {
        Baseline storage b = baselines[_user];
        return (b.commitmentHash, b.createdAt, b.updatedAt, b.isActive, b.metadataURI);
    }
}
