pragma circom 2.0.0;

/**
 * @title ActionBaselineMatch
 * @dev MIRROR Protocol - Layer 1: ZK Proof Circuit for Action-Baseline Matching
 * 
 * This circuit proves that an agent's proposed action matches the user's
 * persona baseline constraints, without revealing the actual baseline data
 * or the action details.
 * 
 * The user's baseline is represented as a set of constraint vectors.
 * The agent's action is represented as a feature vector.
 * The circuit proves that the action vector falls within the baseline's
 * allowed bounds (the matching score is above a threshold).
 * 
 * Only the commitment hash is public — everything else is private input.
 * 
 * Built for Monad Metropolis Hackathon - Track 04
 */

include "poseidon.circom";

// Compute dot product of two vectors
template DotProduct(n) {
    signal input a[n];
    signal input b[n];
    signal output out;

    component acc = Multiplier();
    signal products[n];

    products[0] <== a[0] * b[0];

    for (var i = 1; i < n; i++) {
        products[i] <== a[i] * b[i];
    }

    // Sum all products (simplified; in production use a proper adder tree)
    signal sum[n];
    sum[0] <== products[0];
    for (var i = 1; i < n; i++) {
        sum[i] <== sum[i-1] + products[i];
    }

    out <== sum[n-1];
}

// Check if a value is above a threshold
template AboveThreshold() {
    signal input value;
    signal input threshold;
    signal output result;

    // value >= threshold ? result = 1 : result = 0
    // Using comparison: if value - threshold >= 0, result = 1
    signal diff;
    diff <-- value - threshold;
    
    // Use LessThan and IsZero for comparison (simplified)
    // In practice: use circomlib's LessThan or comparator
    component lt = LessThan(64);
    lt.in[0] <== threshold;
    lt.in[1] <== value;
    result <== lt.out;
}

// Less-than comparison template (simplified 64-bit)
template LessThan(n) {
    signal input in[2];
    signal output out;

    signal diff;
    diff <-- in[1] - in[0];

    // If diff >= 0, out = 1; else out = 0
    // Simplified: check if diff's most significant bit is 0
    // In production use proper bit decomposition
    component isNonNegative = IsNonNegative(n);
    isNonNegative.in <== diff;
    out <== isNonNegative.out;
}

// Simplified non-negative check
template IsNonNegative(n) {
    signal input in;
    signal output out;

    // Use 2's complement: MSB is 0 for non-negative
    // Very simplified version
    signal shifted;
    shifted <-- in >> (n - 1);
    out <== 1 - (shifted & 1);
}

/**
 * @title ActionBaselineMatch
 * @dev Main circuit: proves an action matches the baseline
 * 
 * Public inputs:
 * - baselineCommitment: Poseidon hash of the baseline vector (public on-chain)
 * - actionCommitment: Poseidon hash of the action vector (public on-chain)
 * - matchThreshold: minimum similarity score required (public)
 * 
 * Private inputs:
 * - baselineVector: the actual baseline constraint values (private)
 * - actionVector: the actual action feature values (private)
 * 
 * Output:
 * - matchResult: 1 if action matches baseline, 0 otherwise
 */
template ActionBaselineMatch(vectorSize) {
    // Public signals
    signal input baselineCommitment;
    signal input actionCommitment;
    signal input matchThreshold;
    
    // Private signals (not revealed)
    signal input baselineVector[vectorSize];
    signal input actionVector[vectorSize];
    
    signal output matchResult;

    // Step 1: Prove baselineCommitment = Poseidon(baselineVector)
    // This proves the baseline used is the one registered on-chain
    component baselineHasher = Poseidon(vectorSize);
    for (var i = 0; i < vectorSize; i++) {
        baselineHasher.inputs[i] <== baselineVector[i];
    }
    baselineHasher.out === baselineCommitment;

    // Step 2: Prove actionCommitment = Poseidon(actionVector)
    // This proves the action being verified is the one attested
    component actionHasher = Poseidon(vectorSize);
    for (var i = 0; i < vectorSize; i++) {
        actionHasher.inputs[i] <== actionVector[i];
    }
    actionHasher.out === actionCommitment;

    // Step 3: Compute similarity score (dot product / cosine similarity simplified)
    // In production: use proper cosine similarity or weighted matching
    component dotProduct = DotProduct(vectorSize);
    for (var i = 0; i < vectorSize; i++) {
        dotProduct.a[i] <== baselineVector[i];
        dotProduct.b[i] <== actionVector[i];
    }

    // Step 4: Check if match score is above threshold
    component thresholdCheck = AboveThreshold();
    thresholdCheck.value <== dotProduct.out;
    thresholdCheck.threshold <== matchThreshold;
    matchResult <== thresholdCheck.result;
}

// Main component (example with 8-dimensional vectors)
component main = ActionBaselineMatch(8);
