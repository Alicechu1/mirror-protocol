const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("========================================");
  console.log("MIRROR Protocol Suite Deployment");
  console.log("Deployer:", deployer.address);
  console.log("Network:", hre.network.name);
  console.log("========================================");

  // Step 1: Deploy PersonaBaseline
  console.log("\n[1/3] Deploying PersonaBaseline...");
  const PersonaBaseline = await hre.ethers.getContractFactory("PersonaBaseline");
  const baseline = await PersonaBaseline.deploy();
  await baseline.waitForDeployment();
  const baselineAddr = await baseline.getAddress();
  console.log("  PersonaBaseline deployed at:", baselineAddr);

  // Step 2: Deploy AgentRegistry
  console.log("\n[2/3] Deploying AgentRegistry...");
  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const registry = await AgentRegistry.deploy(baselineAddr);
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("  AgentRegistry deployed at:", registryAddr);

  // Step 3: Deploy ActionAttestor
  console.log("\n[3/3] Deploying ActionAttestor...");
  const ActionAttestor = await hre.ethers.getContractFactory("ActionAttestor");
  const attestor = await ActionAttestor.deploy(registryAddr);
  await attestor.waitForDeployment();
  const attestorAddr = await attestor.getAddress();
  console.log("  ActionAttestor deployed at:", attestorAddr);

  console.log("\n========================================");
  console.log("Deployment Complete!");
  console.log("========================================");
  console.log("PersonaBaseline:  ", baselineAddr);
  console.log("AgentRegistry:    ", registryAddr);
  console.log("ActionAttestor:   ", attestorAddr);
  console.log("========================================");

  // Save addresses to a file
  const fs = require("fs");
  const addresses = {
    personaBaseline: baselineAddr,
    agentRegistry: registryAddr,
    actionAttestor: attestorAddr,
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync("./deployed-addresses.json", JSON.stringify(addresses, null, 2));
  console.log("\nAddresses saved to deployed-addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
