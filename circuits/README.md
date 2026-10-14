# MIRROR ZK Layer — Action / Baseline Compliance Proofs

Layer 1 of the MIRROR protocol ("the unverifiability of alignment") in code: an
agent proves that its proposed action complies with the user's persona baseline,
**without revealing the baseline or the action**.

Raw baseline data stays off-chain. Only a Poseidon commitment goes on-chain, and
only a Groth16 proof plus four public signals ever touch the contract.

---

## What the circuit proves

`circuits/ActionBaselineMatch.circom` — 4-dimensional baseline, 32-bit lanes.

Public signals (declaration order, `nPublic = 4`):

| index | signal | meaning |
|-------|--------|---------|
| 0 | `matchResult` | `1` = action complies, `0` = action violates |
| 1 | `baselineCommitment` | `Poseidon(baselineVector)` — must match on-chain state |
| 2 | `actionCommitment` | `Poseidon(actionVector)` — the attested action |
| 3 | `matchThreshold` | tolerated violations (protocol enforces `0`) |

Private inputs: `baselineVector[4]`, `actionVector[4]`.

The circuit enforces, in order:

1. `Poseidon(baselineVector) == baselineCommitment` — the private vector opens
   the commitment that is registered on-chain.
2. `Poseidon(actionVector) == actionCommitment` — the private vector opens the
   commitment being attested.
3. For every lane, the action respects its bound.
4. `violationCount <= matchThreshold`.

### Lane encoding

A single circuit expresses both "must be at most" and "must be at least" bounds
without extra public inputs by packing the direction bit into the baseline lane:

```
baselineVector[i] = limit_i * 2 + direction_i
  direction_i = 0  ->  action_i <= limit_i
  direction_i = 1  ->  action_i >= limit_i
```

The circuit decomposes each lane with `Num2Bits`, reconstructs `limit_i` from the
upper bits, reads `direction_i` from the low bit, then selects between
`LessEqThan` and `GreaterEqThan`.

---

## Reproduce it end to end

Prerequisites: Node.js. The `circom` compiler binary is fetched automatically
below (no Rust toolchain required).

```bash
# 1. dependencies
npm install

# 2. fetch the circom compiler (Windows build shown; linux/macos builds also exist)
#    https://github.com/iden3/circom/releases
mkdir tools
curl -L -o tools/circom.exe https://github.com/iden3/circom/releases/download/v2.2.3/circom-windows-amd64.exe

# 3. compile the circuit
tools/circom.exe circuits/ActionBaselineMatch.circom \
  --r1cs --wasm --sym -l node_modules/circomlib/circuits -o build/circuits

# 4. Powers of Tau (fully offline; pot12 = 4096 powers, enough for ~2100 constraints)
npx snarkjs powersoftau new bn128 12 build/circuits/pot12_0000.ptau -v
npx snarkjs powersoftau contribute build/circuits/pot12_0000.ptau build/circuits/pot12_0001.ptau \
  --name="MIRROR Metropolis" -e="mirror-protocol-monad-metropolis-2026-entropy"
npx snarkjs powersoftau prepare phase2 build/circuits/pot12_0001.ptau build/circuits/pot12_final.ptau -v

# 5. circuit-specific setup + verification key
npx snarkjs groth16 setup build/circuits/ActionBaselineMatch.r1cs build/circuits/pot12_final.ptau build/circuits/circuit_final.zkey
npx snarkjs zkey export verificationkey build/circuits/circuit_final.zkey build/circuits/verification_key.json

# 6. build witnesses (computes the Poseidon commitments)
node scripts/zk/generate-input.js

# 7. prove + verify, both scenarios
npx snarkjs groth16 fullprove build/circuits/input_compliant.json build/circuits/ActionBaselineMatch_js/ActionBaselineMatch.wasm build/circuits/circuit_final.zkey build/circuits/proof_compliant.json build/circuits/public_compliant.json
npx snarkjs groth16 verify build/circuits/verification_key.json build/circuits/public_compliant.json build/circuits/proof_compliant.json

npx snarkjs groth16 fullprove build/circuits/input_violating.json build/circuits/ActionBaselineMatch_js/ActionBaselineMatch.wasm build/circuits/circuit_final.zkey build/circuits/proof_violating.json build/circuits/public_violating.json
npx snarkjs groth16 verify build/circuits/verification_key.json build/circuits/public_violating.json build/circuits/proof_violating.json
```

Both `verify` calls print `OK!`. The compliant run yields `matchResult = 1`, the
violating run yields `matchResult = 0`.

---

## On-chain verification

```bash
npx hardhat compile
npx hardhat test test/zk-verifier.test.js
```

```
MIRROR ZK layer
  ✔ verifies a proof that a compliant action matches the persona baseline
  ✔ verifies a proof that a violating action breaks the persona baseline
  ✔ rejects a proof whose public signals were tampered with
  ✔ attests an action through ZKActionAttestor and trips the circuit breaker on a proven violation
  ✔ rejects an attestation whose proof is bound to a different baseline
  5 passing
```

### Why the contract verifies rather than trusts

The original `ActionAttestor` accepted an `isVerified` flag from the caller, so
its "verified" column was only as trustworthy as the caller. `ZKActionAttestor`
removes that trust assumption:

- the Groth16 verifier is called on-chain; a bad proof reverts
- `pubSignals[1]` must equal the baseline the agent **actually inherited** from
  `AgentRegistry`, otherwise a prover could satisfy the circuit with a
  self-chosen permissive baseline
- `pubSignals[3]` must equal the protocol's zero-tolerance threshold, so a
  prover cannot widen its own allowance
- a proven violation (`matchResult == 0`) emits `ZKCircuitBreakerTriggered`

---

## Files

| path | role |
|------|------|
| `circuits/ActionBaselineMatch.circom` | the circuit |
| `scripts/zk/generate-input.js` | encodes baselines/actions, computes Poseidon commitments |
| `contracts/BaselineVerifier.sol` | Groth16 verifier, generated by snarkjs |
| `contracts/ZKActionAttestor.sol` | on-chain verification, baseline binding, circuit breaker |
| `test/zk-verifier.test.js` | end-to-end chain tests |

## Parameters

| | |
|---|---|
| proof system | Groth16 (bn128) |
| hash | Poseidon |
| constraints | 1169 non-linear + 932 linear = 2101 |
| public inputs | 3 (+1 public output) |
| proof size | 3 group elements |
