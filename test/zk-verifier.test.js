const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const BUILD_DIR = path.join(__dirname, "..", "build", "circuits");

// snarkjs emits proof coordinates as decimal strings; the Solidity verifier
// expects the G2 point's coordinate pairs swapped, which is a well-known
// snarkjs quirk.
function loadProof(name) {
  const proof = JSON.parse(fs.readFileSync(path.join(BUILD_DIR, `proof_${name}.json`), "utf8"));
  const pubSignals = JSON.parse(
    fs.readFileSync(path.join(BUILD_DIR, `public_${name}.json`), "utf8")
  );

  return {
    pA: [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])],
    pB: [
      [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
      [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
    ],
    pC: [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])],
    pubSignals: pubSignals.map((v) => BigInt(v)),
  };
}

describe("MIRROR ZK layer", function () {
  let verifier;

  before(async function () {
    const Verifier = await ethers.getContractFactory("Groth16Verifier");
    verifier = await Verifier.deploy();
    await verifier.waitForDeployment();
  });

  it("verifies a proof that a compliant action matches the persona baseline", async function () {
    const { pA, pB, pC, pubSignals } = loadProof("compliant");

    expect(pubSignals[0]).to.equal(1n, "matchResult should be 1 for a compliant action");
    expect(await verifier.verifyProof(pA, pB, pC, pubSignals)).to.equal(true);
  });

  it("verifies a proof that a violating action breaks the persona baseline", async function () {
    const { pA, pB, pC, pubSignals } = loadProof("violating");

    expect(pubSignals[0]).to.equal(0n, "matchResult should be 0 for a violating action");
    expect(await verifier.verifyProof(pA, pB, pC, pubSignals)).to.equal(true);
  });

  it("rejects a proof whose public signals were tampered with", async function () {
    const { pA, pB, pC, pubSignals } = loadProof("compliant");
    const tampered = [...pubSignals];
    tampered[0] = 0n; // pretend the action was non-compliant

    expect(await verifier.verifyProof(pA, pB, pC, tampered)).to.equal(false);
  });

  it("attests an action through ZKActionAttestor and trips the circuit breaker on a proven violation", async function () {
    const Verifier = await ethers.getContractFactory("Groth16Verifier");
    const freshVerifier = await Verifier.deploy();
    await freshVerifier.waitForDeployment();

    const Baseline = await ethers.getContractFactory("PersonaBaseline");
    const baseline = await Baseline.deploy();
    await baseline.waitForDeployment();

    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    const registry = await AgentRegistry.deploy(await baseline.getAddress());
    await registry.waitForDeployment();

    const Attestor = await ethers.getContractFactory("ZKActionAttestor");
    const attestor = await Attestor.deploy(
      await freshVerifier.getAddress(),
      await registry.getAddress(),
      await baseline.getAddress()
    );
    await attestor.waitForDeployment();

    const [user, agent] = await ethers.getSigners();

    const compliant = loadProof("compliant");
    const violating = loadProof("violating");
    const baselineCommitment = compliant.pubSignals[1];

    // The agent inherits the user's baseline (as a bytes32 commitment).
    const baselineHash = ethers.zeroPadValue(ethers.toBeHex(baselineCommitment), 32);
    await baseline.connect(user).registerBaseline(baselineHash, "");
    await registry.connect(user).registerAgent(agent.address, baselineHash);

    // Compliant action: proof verifies, attestation recorded, no violation.
    await expect(
      attestor
        .connect(agent)
        .attestAction(ethers.id("buy-eth-spot"), compliant.pA, compliant.pB, compliant.pC, compliant.pubSignals)
    )
      .to.emit(attestor, "ZKActionAttested")
      .withArgs(1n, agent.address, ethers.id("buy-eth-spot"), baselineCommitment, compliant.pubSignals[2], true, anyValue);

    expect(await attestor.violationCount(agent.address)).to.equal(0n);

    // Violating action: the proof is still valid, but matchResult is 0, so the
    // circuit breaker fires.
    await expect(
      attestor
        .connect(agent)
        .attestAction(ethers.id("open-btc-10x"), violating.pA, violating.pB, violating.pC, violating.pubSignals)
    ).to.emit(attestor, "ZKCircuitBreakerTriggered");

    expect(await attestor.violationCount(agent.address)).to.equal(1n);
    expect(await attestor.getAttestationCount()).to.equal(2n);
  });

  it("rejects an attestation whose proof is bound to a different baseline", async function () {
    const Verifier = await ethers.getContractFactory("Groth16Verifier");
    const freshVerifier = await Verifier.deploy();
    await freshVerifier.waitForDeployment();

    const Baseline = await ethers.getContractFactory("PersonaBaseline");
    const baseline = await Baseline.deploy();
    await baseline.waitForDeployment();

    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    const registry = await AgentRegistry.deploy(await baseline.getAddress());
    await registry.waitForDeployment();

    const Attestor = await ethers.getContractFactory("ZKActionAttestor");
    const attestor = await Attestor.deploy(
      await freshVerifier.getAddress(),
      await registry.getAddress(),
      await baseline.getAddress()
    );
    await attestor.waitForDeployment();

    const [user, agent] = await ethers.getSigners();
    const compliant = loadProof("compliant");

    // Register a *different* baseline than the one the proof was made against.
    const otherHash = ethers.id("some-other-baseline");
    await baseline.connect(user).registerBaseline(otherHash, "");
    await registry.connect(user).registerAgent(agent.address, otherHash);

    await expect(
      attestor
        .connect(agent)
        .attestAction(ethers.id("buy-eth-spot"), compliant.pA, compliant.pB, compliant.pC, compliant.pubSignals)
    ).to.be.revertedWith("Baseline commitment does not match inherited baseline");
  });
});

// chai matcher helper for the timestamp argument
function anyValue() {
  return true;
}
