// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IAgentRegistry} from "./interfaces/IAgentRegistry.sol";
import {IPersonaBaseline} from "./interfaces/IPersonaBaseline.sol";

/**
 * @title AgentRegistry
 * @dev MIRROR Protocol - Agent Identity Registry (ERC-8004 aligned)
 * 
 * Registers agent identities on-chain, tracks generation lineage,
 * and enforces baseline inheritance across agent generations.
 * 
 * Every agent must inherit the user's persona baseline hash before activation.
 * If an agent doesn't carry the correct baseline hash, it cannot be authorized.
 * 
 * This addresses the core risk of recursive self-improvement:
 * safety constraints are no longer "training traces" inside the model,
 * but "inheritance conditions" at the protocol layer.
 * 
 * Built for Monad Metropolis Hackathon - Track 04: Trust, Identity & AI Infrastructure
 */
contract AgentRegistry is IAgentRegistry {
    // Reference to the PersonaBaseline contract
    IPersonaBaseline public personaBaseline;

    // Struct for agent registration
    struct Agent {
        address agentAddress;      // Agent contract/EOA address
        bytes32 baselineHash;      // Inherited baseline commitment
        uint256 generation;        // Agent generation number
        address parentAgent;       // Parent agent (0 if first gen)
        address user;              // User who owns this agent
        bool isAuthorized;         // Whether agent is authorized to act
        uint256 registeredAt;      // Registration timestamp
    }

    // Mapping from agent address to agent info
    mapping(address => Agent) private agents;

    // Mapping from user to list of their agents
    mapping(address => address[]) private userAgents;

    /**
     * @dev Constructor sets the persona baseline contract address
     * @param _personaBaseline Address of the PersonaBaseline contract
     */
    constructor(address _personaBaseline) {
        personaBaseline = IPersonaBaseline(_personaBaseline);
    }

    /**
     * @dev Register a first-generation agent for the caller (user)
     * 
     * The agent must inherit the user's current baseline hash.
     * If the user doesn't have an active baseline, registration fails.
     * 
     * @param _agent Address of the agent contract/EOA
     * @param _baselineHash Hash of the baseline this agent inherits
     */
    function registerAgent(address _agent, bytes32 _baselineHash) external {
        require(_agent != address(0), "Invalid agent address");
        require(agents[_agent].agentAddress == address(0), "Agent already registered");
        require(personaBaseline.hasActiveBaseline(msg.sender), "No active baseline");
        require(
            personaBaseline.getBaselineHash(msg.sender) == _baselineHash,
            "Baseline hash mismatch"
        );

        agents[_agent] = Agent({
            agentAddress: _agent,
            baselineHash: _baselineHash,
            generation: 1,
            parentAgent: address(0),
            user: msg.sender,
            isAuthorized: true,
            registeredAt: block.timestamp
        });

        userAgents[msg.sender].push(_agent);

        emit AgentRegistered(_agent, msg.sender, _baselineHash, 1);
        emit AgentAuthorizationChanged(_agent, true);
    }

    /**
     * @dev Register a new agent generation (inherits from parent agent)
     * 
     * The new agent must inherit the same baseline hash as its parent.
     * This ensures safety constraints are preserved across generations.
     * 
     * Can be called by the parent agent itself (for recursive self-improvement scenarios)
     * or by the user who owns the parent agent.
     * 
     * @param _newAgent Address of the new agent
     * @param _parentAgent Address of the parent agent to inherit from
     * @param _baselineHash Baseline hash that must match parent's baseline
     */
    function registerAgentGeneration(
        address _newAgent,
        address _parentAgent,
        bytes32 _baselineHash
    ) external {
        require(_newAgent != address(0), "Invalid new agent address");
        require(agents[_newAgent].agentAddress == address(0), "Agent already registered");

        Agent storage parent = agents[_parentAgent];
        require(parent.agentAddress != address(0), "Parent agent not found");
        require(parent.isAuthorized, "Parent agent not authorized");
        require(parent.baselineHash == _baselineHash, "Baseline inheritance mismatch");

        // Caller must be either the parent agent or the user who owns it
        require(
            msg.sender == _parentAgent || msg.sender == parent.user,
            "Not authorized to create generation"
        );

        agents[_newAgent] = Agent({
            agentAddress: _newAgent,
            baselineHash: _baselineHash,
            generation: parent.generation + 1,
            parentAgent: _parentAgent,
            user: parent.user,
            isAuthorized: true,
            registeredAt: block.timestamp
        });

        userAgents[parent.user].push(_newAgent);

        emit AgentGenerationCreated(_newAgent, _parentAgent, _baselineHash, parent.generation + 1);
        emit AgentAuthorizationChanged(_newAgent, true);
    }

    /**
     * @dev Set agent authorization status (only by baseline owner)
     * @param _agent Address of the agent
     * @param _isAuthorized New authorization status
     */
    function setAgentAuthorization(address _agent, bool _isAuthorized) external {
        Agent storage agent = agents[_agent];
        require(agent.agentAddress != address(0), "Agent not found");
        require(agent.user == msg.sender, "Not the agent owner");
        require(agent.isAuthorized != _isAuthorized, "No change");

        agent.isAuthorized = _isAuthorized;
        emit AgentAuthorizationChanged(_agent, _isAuthorized);
    }

    /**
     * @dev Check if an agent is authorized to act
     */
    function isAgentAuthorized(address _agent) external view returns (bool) {
        return agents[_agent].isAuthorized;
    }

    /**
     * @dev Get the baseline hash associated with an agent
     */
    function getAgentBaseline(address _agent) external view returns (bytes32) {
        return agents[_agent].baselineHash;
    }

    /**
     * @dev Get agent generation number
     */
    function getAgentGeneration(address _agent) external view returns (uint256) {
        return agents[_agent].generation;
    }

    /**
     * @dev Get the parent agent address
     */
    function getParentAgent(address _agent) external view returns (address) {
        return agents[_agent].parentAgent;
    }

    /**
     * @dev Get full agent info
     */
    function getAgent(address _agent) external view returns (
        address user,
        bytes32 baselineHash,
        uint256 generation,
        address parentAgent,
        bool isAuthorized,
        uint256 registeredAt
    ) {
        Agent storage a = agents[_agent];
        return (a.user, a.baselineHash, a.generation, a.parentAgent, a.isAuthorized, a.registeredAt);
    }

    /**
     * @dev Get all agents for a user
     */
    function getUserAgents(address _user) external view returns (address[] memory) {
        return userAgents[_user];
    }

    /**
     * @dev Get number of agents for a user
     */
    function getUserAgentCount(address _user) external view returns (uint256) {
        return userAgents[_user].length;
    }
}
