const ethers = require("ethers");
require("dotenv").config();

const rpcUrl = process.env.MONAD_TESTNET_RPC;
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey);

async function main() {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  console.log("Checking balance on Monad Testnet...");
  console.log("Address:", wallet.address);
  console.log("RPC:", rpcUrl);
  
  try {
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    console.log("");
    console.log("Balance:", balanceEth, "MON");
    
    if (balance > 0n) {
      console.log("✅ Has balance - ready to deploy!");
    } else {
      console.log("❌ No balance - get testnet ETH from faucet first");
      console.log("Faucet: https://faucet.monad.xyz/");
    }
  } catch (e) {
    console.log("Error checking balance:", e.message);
    console.log("RPC may be unreachable.");
  }
}

main();
