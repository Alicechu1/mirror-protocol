pragma circom 2.0.0;

/**
 * @title ActionBaselineMatch
 * @dev MIRROR Protocol - Layer 1: Zero-Knowledge proof that an agent action
 *      complies with a user's persona baseline, without revealing either the
 *      baseline values or the action values.
 *
 * Design:
 *   - The user's persona baseline is encoded as a vector of constraint values.
 *     Its Poseidon hash ("baselineCommitment") is registered on-chain by the
 *     PersonaBaseline contract.
 *   - An agent's proposed action is encoded as a vector of feature values.
 *     Its Poseidon hash ("actionCommitment") is the value attested on-chain.
 *   - The circuit proves BOTH commitments open to the private vectors AND that
 *     every action feature respects its corresponding baseline bound.
 *
 * Public inputs (3):
 *   baselineCommitment  - Poseidon(baselineVector), matches on-chain state
 *   actionCommitment    - Poseidon(actionVector), matches attested value
 *   matchThreshold      - max number of tolerated violations (usually 0)
 *
 * Private inputs:
 *   baselineVector[VECTOR_SIZE]
 *   actionVector[VECTOR_SIZE]
 *
 * Output:
 *   matchResult - 1 if the action fully complies, 0 otherwise
 *
 * Built for Monad Metropolis Hackathon - Track 04
 */

include "poseidon.circom";
include "comparators.circom";

// ---------------------------------------------------------------------------
// Baseline rule semantics
// ---------------------------------------------------------------------------
// Each lane of the vectors is interpreted as a (value, limit) pair with a
// direction encoded in the baseline vector's low bit, so that a single
// circuit can express both "must be below limit" and "must be above limit"
// style constraints without extra public inputs:
//
//   baselineVector[i] = limit_i * 2 + direction_i
//     direction_i = 0 -> require actionVector[i] <= limit_i
//     direction_i = 1 -> require actionVector[i] >= limit_i
//
// The circuit decomposes the encoded lane, enforces the correct comparison,
// and accumulates the number of violated lanes. Compliance holds when the
// total number of violations is <= matchThreshold.
// ---------------------------------------------------------------------------

template ActionBaselineMatch(VECTOR_SIZE, N_BITS) {
    // ---- public ----
    signal input baselineCommitment;
    signal input actionCommitment;
    signal input matchThreshold;

    // ---- private ----
    signal input baselineVector[VECTOR_SIZE];
    signal input actionVector[VECTOR_SIZE];

    // ---- output ----
    signal output matchResult;

    // Step 1: the private baseline vector must open the public commitment.
    component baselineHasher = Poseidon(VECTOR_SIZE);
    for (var i = 0; i < VECTOR_SIZE; i++) {
        baselineHasher.inputs[i] <== baselineVector[i];
    }
    baselineHasher.out === baselineCommitment;

    // Step 2: the private action vector must open the public commitment.
    component actionHasher = Poseidon(VECTOR_SIZE);
    for (var i = 0; i < VECTOR_SIZE; i++) {
        actionHasher.inputs[i] <== actionVector[i];
    }
    actionHasher.out === actionCommitment;

    // Step 3: evaluate every lane against its bound and count violations.
    component limitBits[VECTOR_SIZE];
    component dirBits[VECTOR_SIZE];
    component leCheck[VECTOR_SIZE];
    component geCheck[VECTOR_SIZE];

    signal limit[VECTOR_SIZE];
    signal direction[VECTOR_SIZE];
    signal leSelected[VECTOR_SIZE];
    signal geSelected[VECTOR_SIZE];
    signal satisfied[VECTOR_SIZE];
    signal violated[VECTOR_SIZE];

    for (var i = 0; i < VECTOR_SIZE; i++) {
        // Decode the lane: limit_i = encoded >> 1, direction_i = encoded & 1
        limitBits[i] = Num2Bits(N_BITS + 1);
        limitBits[i].in <== baselineVector[i];
        dirBits[i] = Num2Bits(N_BITS + 1);
        dirBits[i].in <== baselineVector[i];

        // limit = floor(encoded / 2) = sum of bits 1..N
        var lSum = 0;
        for (var b = 1; b <= N_BITS; b++) {
            lSum += limitBits[i].out[b] * (1 << (b - 1));
        }
        limit[i] <== lSum;
        direction[i] <== dirBits[i].out[0];

        // direction == 0 -> action <= limit ; direction == 1 -> action >= limit
        leCheck[i] = LessEqThan(N_BITS);
        leCheck[i].in[0] <== actionVector[i];
        leCheck[i].in[1] <== limit[i];

        geCheck[i] = GreaterEqThan(N_BITS);
        geCheck[i].in[0] <== actionVector[i];
        geCheck[i].in[1] <== limit[i];

        // pick the comparison that matches the lane direction
        leSelected[i] <== leCheck[i].out * (1 - direction[i]);
        geSelected[i] <== geCheck[i].out * direction[i];
        satisfied[i] <== leSelected[i] + geSelected[i];
        violated[i] <== 1 - satisfied[i];
    }

    // Step 4: total violations must not exceed the public threshold.
    signal violationCount[VECTOR_SIZE + 1];
    violationCount[0] <== 0;
    for (var i = 0; i < VECTOR_SIZE; i++) {
        violationCount[i + 1] <== violationCount[i] + violated[i];
    }

    component thresholdCheck = LessEqThan(N_BITS);
    thresholdCheck.in[0] <== violationCount[VECTOR_SIZE];
    thresholdCheck.in[1] <== matchThreshold;

    matchResult <== thresholdCheck.out;
}

// 4-dimension baseline (risk, position size, leverage, allow-futures flag)
// with 32-bit lane values. Kept intentionally small so proof generation stays
// fast in the browser demo.
// The three commitment/threshold signals are public because they are read from
// on-chain state; only the raw vectors stay private.
component main {public [baselineCommitment, actionCommitment, matchThreshold]} = ActionBaselineMatch(4, 32);
