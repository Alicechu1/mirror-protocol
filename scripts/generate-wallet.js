const ethers = require("ethers");

// Generate a new random wallet
const wallet = ethers.Wallet.createRandom();

console.log("========================================");
console.log("New Test Wallet Generated");
console.log("========================================");
console.log("Address:    ", wallet.address);
console.log("Private Key:", wallet.privateKey);
console.log("Mnemonic:   ", wallet.mnemonic.phrase);
console.log("========================================");
console.log("");
console.log("IMPORTANT: This is a TESTNET-only wallet.");
console.log("Send testnet ETH to the address above to deploy.");
console.log("Faucet: https://faucet.monad.xyz/");
