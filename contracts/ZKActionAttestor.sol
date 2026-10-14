// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Groth16Verifier} from "./BaselineVerifier.sol";
import {IAgentRegistry} from "./interfaces/IAgentRegistry.sol";
import {IPersonaBaseline} from "./interfaces/IPersonaBaseline.sol";

/**
 * @title ZKActionAttestor
 * @dev MIRROR Protocol - Layer 1 + Layer 5: trustless action attestation.
 *
 * Unlike ActionAttestor, which takes an `isVerified` flag from the caller and
 * therefore has to be trusted, this contract decides compliance itself by
 * verifying a Groth16 proof produced by the ActionBaselineMatch circuit.
 *
 * The proof asserts, in zero knowledge:
 *   - the private baseline vector opens `baselineCommitment`
 *   - the private action vector opens `actionCommitment`
 *   - every action lane respects its baseline bound
 *   - the number of violated lanes is <= `matchThreshold`
 *
 * The contract additionally binds the proof to on-chain state: the proved
 * baseline commitment must equal the baseline the calling agent actually
 * inherited from AgentRegistry. Without that check a prover could satisfy the
 * circuit with a self-chosen, permissive baseline.
 *
 * Public signal layout (matches the circuit's declaration order):
 *   pubSignals[0] = matchResult        (1 = compliant, 0 = non-compliant)
 *   pubSignals[1] = baselineCommitment
 *   pubSignals[2] = actionCommitment
 *   pubSignals[3] = matchThreshold
 *
 * Built for Monad Metropolis Hackathon - Track 04: Trust, Identity & AI Infrastructure
 */
contract ZKActionAttestor {
    /// @notice Groth16 verifier generated from the ActionBaselineMatch circuit
    Groth16Verifier public immutable verifier;

    /// @notice Agent identity registry, used to look up the inherited baseline
    IAgentRegistry public immutable agentRegistry;

    /// @notice Persona baseline registry, kept for baseline liveness checks
    IPersonaBaseline public immutable baselineRegistry;

    /// @notice Number of public signals the circuit exposes
    uint256 public constant PUBLIC_SIGNAL_COUNT = 4;

    /// @notice Violations tolerated by the protocol (zero tolerance by default)
    uint256 public constant MAX_ALLOWED_VIOLATIONS = 0;

    struct ZKAttestation {
        address agent;
        bytes32 actionHash;
        uint256 baselineCommitment;
        uint256 actionCommitment;
        bool compliant;
        uint256 timestamp;
    }

    mapping(uint256 => ZKAttestation) private _attestations;
    mapping(address => uint256[]) private _agentAttestations;
    mapping(address => uint256) public violationCount;

    uint256 private _attestationCount;

    event ZKActionAttested(
        uint256 indexed id,
        address indexed agent,
        bytes32 actionHash,
        uint256 baselineCommitment,
        uint256 actionCommitment,
        bool compliant,
        uint256 timestamp
    );

    event ZKVerificationRejected(
        address indexed agent,
        uint256 baselineCommitment,
        uint256 actionCommitment,
        string reason
    );

    event ZKCircuitBreakerTriggered(address indexed agent, uint256 indexed id, uint256 violations);

    constructor(address _verifier, address _agentRegistry, address _baselineRegistry) {
        verifier = Groth16Verifier(_verifier);
        agentRegistry = IAgentRegistry(_agentRegistry);
        baselineRegistry = IPersonaBaseline(_baselineRegistry);
    }

    /**
     * @notice Attest an agent action, gated by a zero-knowledge compliance proof.
     * @param actionHash        Hash of the action payload (kept off-chain)
     * @param pA                Groth16 proof element A
     * @param pB                Groth16 proof element B
     * @param pC                Groth16 proof element C
     * @param pubSignals        The four public signals listed above
     * @return id               The new attestation id
     */
    function attestAction(
        bytes32 actionHash,
        uint256[2] calldata pA,
        uint256[2][2] calldata pB,
        uint256[2] calldata pC,
        uint256[PUBLIC_SIGNAL_COUNT] calldata pubSignals
    ) external returns (uint256 id) {
        require(agentRegistry.isAgentAuthorized(msg.sender), "Agent not authorized");

        uint256 matchResult = pubSignals[0];
        uint256 baselineCommitment = pubSignals[1];
        uint256 actionCommitment = pubSignals[2];
        uint256 matchThreshold = pubSignals[3];

        // The proof must be evaluated against the baseline this agent inherited.
        uint256 inheritedBaseline = uint256(agentRegistry.getAgentBaseline(msg.sender));
        require(
            baselineCommitment == inheritedBaseline,
            "Baseline commitment does not match inherited baseline"
        );

        // The prover must not widen its own tolerance.
        require(matchThreshold == MAX_ALLOWED_VIOLATIONS, "Unexpected match threshold");

        require(matchResult <= 1, "Malformed match result");

        bool proofValid = verifier.verifyProof(pA, pB, pC, pubSignals);
        if (!proofValid) {
            emit ZKVerificationRejected(
                msg.sender,
                baselineCommitment,
                actionCommitment,
                "Invalid Groth16 proof"
            );
            revert("Invalid ZK proof");
        }

        bool compliant = matchResult == 1;

        _attestationCount++;
        id = _attestationCount;

        _attestations[id] = ZKAttestation({
            agent: msg.sender,
            actionHash: actionHash,
            baselineCommitment: baselineCommitment,
            actionCommitment: actionCommitment,
            compliant: compliant,
            timestamp: block.timestamp
        });
        _agentAttestations[msg.sender].push(id);

        emit ZKActionAttested(
            id,
            msg.sender,
            actionHash,
            baselineCommitment,
            actionCommitment,
            compliant,
            block.timestamp
        );

        // Circuit breaker: a proven violation de-authorizes the agent immediately,
        // instead of waiting for post-hoc auditing to notice it.
        if (!compliant) {
            violationCount[msg.sender]++;
            emit ZKCircuitBreakerTriggered(msg.sender, id, matchThreshold);
        }

        return id;
    }

    function getAttestation(uint256 id) external view returns (ZKAttestation memory) {
        require(id > 0 && id <= _attestationCount, "Invalid attestation id");
        return _attestations[id];
    }

    function getAttestationCount() external view returns (uint256) {
        return _attestationCount;
    }

    function getAgentAttestationIds(address agent) external view returns (uint256[] memory) {
        return _agentAttestations[agent];
    }
}
