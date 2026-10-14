/**
 * MIRROR Protocol - end-to-end on-chain verification of the ZK layer.
 *
 * Proves the whole Layer 1 loop works on Monad testnet:
 *   1. register the Poseidon commitment of a persona baseline on-chain
 *   2. register an agent that inherits that baseline
 *   3. generate a real Groth16 proof in this process (same circuit the browser runs)
 *   4. submit the proof to ZKActionAttestor, which re-verifies it on-chain
 *   5. repeat with a violating action to show the circuit breaker firing
 *
 * Run:  node node_modules/hardhat/internal/cli/bootstrap.js run scripts/zk-onchain-test.js --network monad_testnet
 */
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");
const { buildPoseidon } = require("circomlibjs");

const ROOT = path.join(__dirname, "..");
const ADDRESSES_FILE = path.join(ROOT, "deployed-addresses.json");
const WASM = path.join(ROOT, "demo", "assets", "ActionBaselineMatch.wasm");
const ZKEY = path.join(ROOT, "demo", "assets", "circuit_final.zkey");
const VKEY = require(path.join(ROOT, "demo", "assets", "verification_key.json"));

const encodeLane = (limit, direction = 0) => BigInt(limit) * 2n + BigInt(direction);

// Same baseline the browser demo builds from its default sliders:
// risk <= 50, position <= 30%, leverage <= 1x, futures disabled.
const BASELINE_VECTOR = [
  encodeLane(50, 0),
  encodeLane(30, 0),
  encodeLane(1, 0),
  encodeLane(0, 0)
];

const SCENARIOS = {
  compliant: [30n, 10n, 1n, 0n], // buy ETH spot, $1,000
  violating: [80n, 10n, 10n, 1n] // open 10x BTC futures
};

const toBytes32 = (decimal) => "0x" + BigInt(decimal).toString(16).padStart(64, "0");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const add = JSON.parse(fs.readFileSync(ADDRESSES_FILE, "utf8"));

  const poseidon = await buildPoseidon();
  const commit = (vector) => poseidon.F.toString(poseidon(vector));

  const baselineCommitment = commit(BASELINE_VECTOR);
  const baselineBytes32 = toBytes32(baselineCommitment);

  console.log("========================================");
  console.log("MIRROR ZK On-Chain Verification");
  console.log("Network :", hre.network.name);
  console.log("Agent   :", deployer.address);
  console.log("========================================");
  console.log("baselineCommitment:", baselineBytes32);

  const persona = await hre.ethers.getContractAt("PersonaBaseline", add.personaBaseline);
  const registry = await hre.ethers.getContractAt("AgentRegistry", add.agentRegistry);
  const zk = await hre.ethers.getContractAt("ZKActionAttestor", add.zkActionAttestor);

  // 1. publish the baseline commitment
  if (!(await persona.hasActiveBaseline(deployer.address))) {
    console.log("\n[1/4] registerBaseline...");
    await (await persona.registerBaseline(baselineBytes32, "")).wait();
  } else if ((await persona.getBaselineHash(deployer.address)).toLowerCase() !== baselineBytes32.toLowerCase()) {
    console.log("\n[1/4] updateBaseline...");
    await (await persona.updateBaseline(baselineBytes32, "")).wait();
  } else {
    console.log("\n[1/4] baseline already registered with matching commitment");
  }

  // 2. register the agent so it inherits the baseline
  if (!(await registry.isAgentAuthorized(deployer.address))) {
    console.log("[2/4] registerAgent...");
    await (await registry.registerAgent(deployer.address, baselineBytes32)).wait();
  } else {
    console.log("[2/4] agent already authorized");
  }

  console.log("      on-chain baseline:", await registry.getAgentBaseline(deployer.address));
  console.log("      authorized      :", await registry.isAgentAuthorized(deployer.address));

  // 3 + 4. prove and attest each scenario
  let step = 3;
  for (const [name, actionVector] of Object.entries(SCENARIOS)) {
    console.log(`\n[${step}/4] scenario "${name}" — action vector [${actionVector.map(String).join(", ")}]`);

    const actionCommitment = commit(actionVector);
    const input = {
      baselineCommitment,
      actionCommitment,
      matchThreshold: "0",
      baselineVector: BASELINE_VECTOR.map(String),
      actionVector: actionVector.map(String)
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, WASM, ZKEY);
    const localOk = await snarkjs.groth16.verify(VKEY, publicSignals, proof);
    console.log("      proof generated, local verify:", localOk, "| matchResult:", publicSignals[0]);

    const call = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
    const [pA, pB, pC, pub] = JSON.parse("[" + call + "]");

    const actionHash = hre.ethers.keccak256(
      hre.ethers.toUtf8Bytes(`MIRROR:${name}:${actionVector.map(String).join(",")}`)
    );

    const tx = await zk.attestAction(actionHash, pA, pB, pC, pub);
    const receipt = await tx.wait();

    const id = await zk.getAttestationCount();
    const att = await zk.getAttestation(id);

    console.log("      tx:", receipt.hash);
    console.log("      attestation #" + String(id) + " -> compliant:", att.compliant, "| actionHash:", actionHash);
    console.log("      violationCount:", String(await zk.violationCount(deployer.address)));

    const breaker = receipt.logs
      .map((l) => { try { return zk.interface.parseLog(l); } catch { return null; } })
      .filter(Boolean)
      .find((e) => e.name === "ZKCircuitBreakerTriggered");
    if (breaker) console.log("      circuit breaker fired:", breaker.args[1].toString());
    step++;
  }

  console.log("\n========================================");
  console.log("All proofs accepted by the on-chain verifier.");
  console.log("========================================");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
