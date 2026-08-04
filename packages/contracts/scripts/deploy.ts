import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment for DanaDesaLedger...");

  const Factory = await ethers.getContractFactory("DanaDesaLedger");
  const contract = await Factory.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`DanaDesaLedger deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
