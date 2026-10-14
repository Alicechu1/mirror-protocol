/**
 * MIRROR Protocol - deploy the zero-knowledge attestation layer.
 *
 * Deploys the snarkjs-generated Groth16 verifier and the ZKActionAttestor that
 * uses it to decide compliance on-chain, binding each proof to the baseline the
 * calling agent actually inherited from AgentRegistry.
 *
 * Reuses the already-deployed PersonaBaseline + AgentRegistry from
 * deployed-addresses.json, so it does not redeploy the core protocol.
 *
 * Run:  npx hardhat run scripts/deploy-zk.js --network monad_testnet
 */
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const ADDRESSES_FILE = path.join(__dirname, "..", "deployed-addresses.json");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const existing = JSON.parse(fs.readFileSync(ADDRESSES_FILE, "utf8"));
  const { personaBaseline, agentRegistry } = existing;

  console.log("========================================");
  console.log("MIRROR ZK Layer Deployment");
  console.log("Deployer:", deployer.address);
  console.log("Network :", hre.network.name);
  console.log("========================================");
  console.log("PersonaBaseline (existing):", personaBaseline);
  console.log("AgentRegistry   (existing):", agentRegistry);

  // Fail early if the core protocol contracts are not actually on this chain.
  for (const [name, addr] of [["PersonaBaseline", personaBaseline], ["AgentRegistry", agentRegistry]]) {
    const code = await hre.ethers.provider.getCode(addr);
    if (code === "0x") {
      throw new Error(`${name} has no code at ${addr} on ${hre.network.name}`);
    }
  }
  console.log("Core protocol contracts verified on-chain.");

  // Step 1: Groth16 verifier exported by snarkjs from ActionBaselineMatch.
  console.log("\n[1/2] Deploying Groth16Verifier...");
  const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddr = await verifier.getAddress();
  console.log("  Groth16Verifier:", verifierAddr);

  // Step 2: the trustless attestor that consumes the verifier.
  console.log("\n[2/2] Deploying ZKActionAttestor...");
  const ZKActionAttestor = await hre.ethers.getContractFactory("ZKActionAttestor");
  const zkAttestor = await ZKActionAttestor.deploy(verifierAddr, agentRegistry, personaBaseline);
  await zkAttestor.waitForDeployment();
  const zkAttestorAddr = await zkAttestor.getAddress();
  console.log("  ZKActionAttestor:", zkAttestorAddr);

  const updated = {
    ...existing,
    groth16Verifier: verifierAddr,
    zkActionAttestor: zkAttestorAddr,
    zkDeployedAt: new Date().toISOString()
  };
  fs.writeFileSync(ADDRESSES_FILE, JSON.stringify(updated, null, 2));

  console.log("\n========================================");
  console.log("Deployment Complete");
  console.log("========================================");
  console.log("Groth16Verifier :", verifierAddr);
  console.log("ZKActionAttestor:", zkAttestorAddr);
  console.log("Addresses saved to deployed-addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
