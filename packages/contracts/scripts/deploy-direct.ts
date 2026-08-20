import { JsonRpcProvider, Wallet, ContractFactory } from 'ethers';
import * as dotenv from 'dotenv';
import * as DanaDesaLedger from '../artifacts/contracts/DanaDesaLedger.sol/DanaDesaLedger.json';

dotenv.config();

async function main() {
  const rpcUrl = process.env.POLYGON_MAINNET_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/alch_iS927Gncl1WqbvodECN7O';
  const rawPrivateKey = process.env.PRIVATE_KEY;
  if (!rawPrivateKey) throw new Error('PRIVATE_KEY is missing');

  const privateKey = rawPrivateKey.startsWith('0x') ? rawPrivateKey : `0x${rawPrivateKey}`;
  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(privateKey, provider);

  console.log(`Starting Mainnet deployment from wallet: ${wallet.address}`);
  const balance = await provider.getBalance(wallet.address);
  console.log(`Master Wallet Balance on Polygon Mainnet: ${balance.toString()} wei`);

  const factory = new ContractFactory(DanaDesaLedger.abi, DanaDesaLedger.bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`🎉 DanaDesaLedger DEPLOYED TO POLYGON POS MAINNET: ${address}`);
}

main().catch((err) => {
  console.error('Deployment error:', err);
  process.exit(1);
});
