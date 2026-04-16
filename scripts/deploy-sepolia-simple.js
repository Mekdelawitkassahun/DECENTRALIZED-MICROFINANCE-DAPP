const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("=== Ethiopian Microfinance DApp - Sepolia Deployment ===");
  console.log("Deploying from wallet: 0x2646C40E21f8ef7637e3cD7AB6e33730Fba3C1A5");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  
  console.log("\n1. Deploying EthiopianMicrofinanceSimple contract...");
  
  // Get contract factory
  const EthiopianMicrofinanceSimple = await ethers.getContractFactory("EthiopianMicrofinanceSimple");
  
  // Deploy contract
  console.log("Deploying contract...");
  const contract = await EthiopianMicrofinanceSimple.deploy();
  const deployTx = contract.deploymentTransaction();
  console.log("Transaction hash:", deployTx.hash);
  
  console.log("\n2. Waiting for deployment confirmation...");
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log("\n=== DEPLOYMENT SUCCESSFUL ===");
  console.log("Contract address:", contractAddress);
  console.log("Transaction hash:", deployTx.hash);
  console.log("Block number:", deployTx.blockNumber);
  console.log("Gas used:", (await deployTx.wait()).gasUsed.toString());
  
  // Verify contract is working
  console.log("\n3. Verifying contract functionality...");
  
  // Get system stats
  const stats = await contract.getSystemStats();
  console.log("Initial system stats:");
  console.log("- Total Balance:", ethers.formatEther(stats.totalBalance), "ETH");
  console.log("- Active Loans:", stats.activeLoans.toString());
  console.log("- Total Repaid:", ethers.formatEther(stats.totalRepaid), "ETH");
  
  // Test registration (deployer should already be registered)
  console.log("\n4. Checking deployer registration...");
  const userStats = await contract.getUserStats(deployer.address);
  console.log("Deployer stats:");
  console.log("- Credit Score:", userStats.creditScore.toString());
  console.log("- Active Loans:", userStats.activeLoans.toString());
  console.log("- Completed Loans:", userStats.completedLoans.toString());
  console.log("- Is Registered:", userStats.isRegistered ? "Yes" : "No");
  
  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    chainId: 11155111,
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    transactionHash: deployTx.hash,
    blockNumber: deployTx.blockNumber,
    gasUsed: (await deployTx.wait()).gasUsed.toString(),
    deployedAt: new Date().toISOString(),
    abi: EthiopianMicrofinanceSimple.interface.formatJson()
  };
  
  const fs = require("fs");
  fs.writeFileSync("deployment-sepolia.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("\n5. Deployment info saved to deployment-sepolia.json");
  
  // Generate frontend configuration
  const frontendConfig = `
// Ethiopian Microfinance DApp - Sepolia Configuration
export const CONTRACT_ADDRESS = "${contractAddress}";
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
  
  // Create .env file for frontend
  const envContent = `
NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}
NEXT_PUBLIC_NETWORK_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
NEXT_PUBLIC_CHAIN_NAME="Sepolia Testnet"
NEXT_PUBLIC_CURRENCY_SYMBOL="ETH"
NEXT_PUBLIC_BLOCK_EXPLORER="https://sepolia.etherscan.io"
  `;
  
  fs.writeFileSync(".env", envContent);
  console.log("7. Environment variables saved to .env");
  
  console.log("\n=== FRONTEND INSTRUCTIONS ===");
  console.log("The contract is now live on Sepolia testnet at:", contractAddress);
  console.log("All frontend features should connect to this address");
  console.log("Users can now:");
  console.log("- Register in the system");
  console.log("- Deposit ETH to the lending pool");
  console.log("- Request micro-loans");
  console.log("- Repay loans and build credit");
  console.log("- View transparent transaction history");
  
  console.log("\n=== ETHERSCAN LINK ===");
  console.log(`View contract on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
  
  console.log("\n=== NEXT STEPS ===");
  console.log("1. Update the ContractProvider component with the new contract address");
  console.log("2. Start the frontend: npm run dev");
  console.log("3. Test all functionality on Sepolia testnet");
  console.log("4. Verify contract on Etherscan (optional)");
  
  return contract;
}

main()
  .then(() => {
    console.log("\n=== DEPLOYMENT COMPLETED SUCCESSFULLY ===");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n=== DEPLOYMENT FAILED ===");
    console.error(error);
    process.exit(1);
  });
