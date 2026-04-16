const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("=== Ethiopian Microfinance DApp - Local Deployment ===");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  
  console.log("\n1. Deploying EthiopianMicrofinanceSimple contract...");
  
  // Get contract factory
  const EthiopianMicrofinanceSimple = await ethers.getContractFactory("EthiopianMicrofinanceSimple");
  
  // Deploy contract
  console.log("Deploying contract...");
  const contract = await EthiopianMicrofinanceSimple.deploy();
  console.log("Transaction hash:", contract.deploymentTransaction().hash);
  
  console.log("\n2. Waiting for deployment confirmation...");
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  const deploymentTx = contract.deploymentTransaction();
  console.log("\n=== DEPLOYMENT SUCCESSFUL ===");
  console.log("Contract address:", contractAddress);
  console.log("Transaction hash:", deploymentTx.hash);
  console.log("Block number:", deploymentTx.blockNumber);
  
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
    network: "localhost",
    chainId: 1337,
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    transactionHash: deploymentTx.hash,
    blockNumber: deploymentTx.blockNumber,
    deployedAt: new Date().toISOString(),
    abi: EthiopianMicrofinanceSimple.interface.formatJson()
  };
  
  const fs = require("fs");
  fs.writeFileSync("deployment-local.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("\n5. Deployment info saved to deployment-local.json");
  
  // Create .env file for frontend
  const envContent = `
NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}
NEXT_PUBLIC_NETWORK_ID=1337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_NAME="Localhost"
NEXT_PUBLIC_CURRENCY_SYMBOL="ETH"
NEXT_PUBLIC_BLOCK_EXPLORER=""
  `;
  
  fs.writeFileSync(".env", envContent);
  console.log("6. Environment variables saved to .env");
  
  console.log("\n=== FRONTEND INSTRUCTIONS ===");
  console.log("The contract is now live on localhost at:", contractAddress);
  console.log("All frontend features should connect to this address");
  console.log("Users can now:");
  console.log("- Register in the system");
  console.log("- Deposit ETH to the lending pool");
  console.log("- Request micro-loans");
  console.log("- Repay loans and build credit");
  console.log("- View transparent transaction history");
  
  console.log("\n=== NEXT STEPS ===");
  console.log("1. Update the ContractProvider component with the new contract address");
  console.log("2. Start the frontend: npm run dev");
  console.log("3. Test all functionality on localhost");
  console.log("4. Deploy to Sepolia when ready");
  
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
