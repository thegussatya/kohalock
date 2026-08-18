import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  const address = await signer.getAddress();
  const balance = await ethers.provider.getBalance(address);
  const formattedBalance = ethers.formatEther(balance);
  const network = await ethers.provider.getNetwork();

  console.log(`========================================`);
  console.log(`Network Name  : ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Wallet Address : ${address}`);
  console.log(`Saldo Token    : ${formattedBalance} POL/MATIC`);
  console.log(`========================================`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
