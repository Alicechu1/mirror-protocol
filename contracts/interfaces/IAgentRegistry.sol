// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IAgentRegistry
 * @dev MIRROR Protocol - ERC-8004 aligned Agent Identity Registry Interface
 * 
 * Registers agent identities on-chain, tracks generation lineage,
 * and enforces baseline inheritance across agent generations.
 */
interface IAgentRegistry {
    /// @notice Emitted when a new agent is registered (first generation)
    event AgentRegistered(
        address indexed agent,
        address indexed user,
        bytes32 baselineHash,
        uint256 generation
    );

    /// @notice Emitted when a new agent generation is created (inherits from parent)
    event AgentGenerationCreated(
        address indexed agent,
        address indexed parentAgent,
        bytes32 baselineHash,
        uint256 generation
    );

    /// @notice Emitted when agent authorization status changes
    event AgentAuthorizationChanged(address indexed agent, bool isAuthorized);

    /**
     * @dev Register a first-generation agent for a user
     * @param agent Address of the agent contract/EOA
     * @param baselineHash Hash of the persona baseline this agent inherits
     */
    function registerAgent(address agent, bytes32 baselineHash) external;

    /**
     * @dev Register a new agent generation (inherits from parent)
     * @param newAgent Address of the new agent
     * @param parentAgent Address of the parent agent to inherit from
     * @param baselineHash Baseline hash that must match parent's baseline
     */
    function registerAgentGeneration(
        address newAgent,
        address parentAgent,
        bytes32 baselineHash
    ) external;

    /**
     * @dev Check if an agent is authorized to act
     * @param agent Address of the agent
     * @return bool Whether the agent is authorized
     */
    function isAgentAuthorized(address agent) external view returns (bool);

    /**
     * @dev Get the baseline hash associated with an agent
     * @param agent Address of the agent
     * @return bytes32 The baseline commitment hash
     */
    function getAgentBaseline(address agent) external view returns (bytes32);

    /**
     * @dev Get agent generation number
     * @param agent Address of the agent
     * @return uint256 Generation number (1 = first gen)
     */
    function getAgentGeneration(address agent) external view returns (uint256);

    /**
     * @dev Get the parent agent address
     * @param agent Address of the agent
     * @return address Parent agent address (0 if first generation)
     */
    function getParentAgent(address agent) external view returns (address);
}
