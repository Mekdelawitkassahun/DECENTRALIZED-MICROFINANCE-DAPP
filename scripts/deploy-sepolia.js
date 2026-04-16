const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("=== Ethiopian Microfinance DApp - Sepolia Deployment ===");
  console.log("Deploying from wallet: 0x2646C40E21f8ef7637e3cD7AB6e33730Fba3C1A5");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");
  
  // Verify we're using the correct wallet
  if (deployer.address.toLowerCase() !== "0x2646c40e21f8ef7637e3cd7ab6e33730fba3c1a5") {
    throw new Error("Deployment must be from wallet: 0x2646C40E21f8ef7637e3cD7AB6e33730Fba3C1A5");
  }
  
  console.log("\n1. Deploying EthiopianMicrofinance contract...");
  
  const EthiopianMicrofinance = await ethers.getContractFactory("EthiopianMicrofinance");
  
  // Estimate gas
  const deployTx = EthiopianMicrofinance.getDeployTransaction();
  const estimatedGas = await deployer.estimateGas(deployTx);
  console.log("Estimated gas:", estimatedGas.toString());
  
  // Deploy contract
  const contract = await EthiopianMicrofinance.deploy();
  console.log("Transaction hash:", contract.deployTransaction.hash);
  
  console.log("2. Waiting for deployment confirmation...");
  await contract.deployed();
  
  console.log("\n=== DEPLOYMENT SUCCESSFUL ===");
  console.log("Contract address:", contract.address);
  console.log("Transaction hash:", contract.deployTransaction.hash);
  console.log("Block number:", contract.deployTransaction.blockNumber);
  console.log("Gas used:", (await contract.deployTransaction.wait()).gasUsed.toString());
  
  // Verify contract is working
  console.log("\n3. Verifying contract functionality...");
  
  // Get system stats
  const stats = await contract.getSystemStats();
  console.log("Initial system stats:");
  console.log("- Total Balance:", ethers.utils.formatEther(stats.totalBalance), "ETH");
  console.log("- Active Loans:", stats.activeLoans.toString());
  console.log("- Total Repaid:", ethers.utils.formatEther(stats.totalRepaid), "ETH");
  
  // Test registration
  console.log("\n4. Testing user registration...");
  const registerTx = await contract.register();
  await registerTx.wait();
  console.log("Deployer registered successfully");
  
  // Get user stats
  const userStats = await contract.getUserStats(deployer.address);
  console.log("Deployer stats:");
  console.log("- Credit Score:", userStats.creditScore.toString());
  console.log("- Active Loans:", userStats.activeLoans.toString());
  console.log("- Completed Loans:", userStats.completedLoans.toString());
  
  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    chainId: 11155111,
    contractAddress: contract.address,
    deployerAddress: deployer.address,
    transactionHash: contract.deployTransaction.hash,
    blockNumber: contract.deployTransaction.blockNumber,
    gasUsed: (await contract.deployTransaction.wait()).gasUsed.toString(),
    deployedAt: new Date().toISOString(),
    abi: EthiopianMicrofinance.interface.format(ethers.utils.FormatTypes.json)
  };
  
  const fs = require("fs");
  fs.writeFileSync("deployment-sepolia.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("\n5. Deployment info saved to deployment-sepolia.json");
  
  // Generate frontend configuration
  const frontendConfig = `
// Ethiopian Microfinance DApp - Sepolia Configuration
export const CONTRACT_ADDRESS = "${contract.address}";
export const NETWORK_ID = 11155111;
export const NETWORK_NAME = "sepolia";
export const RPC_URL = "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
export const EXPLORER_URL = "https://sepolia.etherscan.io";
export const CHAIN_NAME = "Sepolia Testnet";
export const CURRENCY_SYMBOL = "ETH";
export const BLOCK_EXPLORER = "https://sepolia.etherscan.io";
  `;
  
  fs.writeFileSync("frontend-config.js", frontendConfig);
  console.log("6. Frontend configuration saved to frontend-config.js");
  
  console.log("\n=== FRONTEND INSTRUCTIONS ===");
  console.log("Add this to your .env file:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contract.address}`);
  console.log(`NEXT_PUBLIC_NETWORK_ID=11155111`);
  console.log(`NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`);
  
  console.log("\n=== CONTRACT READY FOR USE ===");
  console.log("The contract is now live on Sepolia testnet at:", contract.address);
  console.log("All frontend features should connect to this address");
  console.log("Users can now register, deposit, request loans, and repay on-chain");
  
  return contract;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
