const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying Ensirat DApp contracts...");

  // Deploy SimpleEqub
  const SimpleEqub = await ethers.getContractFactory("SimpleEqub");
  const simpleEqub = await SimpleEqub.deploy();
  await simpleEqub.deployed();
  console.log("SimpleEqub deployed to:", simpleEqub.address);

  // Deploy SimpleIddir
  const SimpleIddir = await ethers.getContractFactory("SimpleIddir");
  const simpleIddir = await SimpleIddir.deploy();
  await simpleIddir.deployed();
  console.log("SimpleIddir deployed to:", simpleIddir.address);

  // Deploy Reputation
  const Reputation = await ethers.getContractFactory("Reputation");
  const reputation = await Reputation.deploy();
  await reputation.deployed();
  console.log("Reputation deployed to:", reputation.address);

  // Get deployer address
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Save deployment addresses
  const deploymentInfo = {
    network: "localhost",
    chainId: 31337,
    deployer: deployer.address,
    contracts: {
      SimpleEqub: simpleEqub.address,
      SimpleIddir: simpleIddir.address,
      Reputation: reputation.address
    },
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    "./frontend/src/contracts.json", 
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n✅ Deployment complete!");
  console.log("\n📋 Contract Addresses:");
  console.log("SimpleEqub:", simpleEqub.address);
  console.log("SimpleIddir:", simpleIddir.address);
  console.log("Reputation:", reputation.address);
  
  console.log("\n📄 Deployment info saved to: ./frontend/src/contracts.json");
  console.log("\n🚀 Now start the frontend: cd frontend && npm start");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
