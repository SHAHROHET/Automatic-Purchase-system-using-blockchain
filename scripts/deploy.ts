import { ethers } from "hardhat";

async function main() {
  console.log("Deploying PurchaseOrderManager contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const PurchaseOrderManager = await ethers.getContractFactory("PurchaseOrderManager");
  const contract = await PurchaseOrderManager.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("PurchaseOrderManager deployed to:", contractAddress);
  console.log("\nUpdate your .env file:");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`DEPLOYER_PRIVATE_KEY=<your-private-key>`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
