import { PrismaClient } from '../generated/prisma';
import { JsonRpcProvider, Wallet, Contract, id, formatEther } from 'ethers';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as DanaDesaLedger from '../src/config/DanaDesaLedger.json';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const KAUR_ROLE = id("KAUR_ROLE");
const SEKDES_ROLE = id("SEKDES_ROLE");
const KADES_ROLE = id("KADES_ROLE");
const KAUR_KEUANGAN_ROLE = id("KAUR_KEUANGAN_ROLE");

const roleMap: Record<string, string | null> = {
  'kaur-teknis': KAUR_ROLE,
  'sekdes': SEKDES_ROLE,
  'kades': KADES_ROLE,
  'kaur-keuangan': KAUR_KEUANGAN_ROLE
};

async function main() {
  console.log("=== DIAGNOSTIC START ===");
  console.log("CONTRACT_ADDRESS from .env:", process.env.CONTRACT_ADDRESS);
  console.log("BLOCKCHAIN_RPC_URL from .env:", process.env.BLOCKCHAIN_RPC_URL);

  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
  const provider = new JsonRpcProvider(rpcUrl);

  try {
    const blockNumber = await provider.getBlockNumber();
    console.log("Connection to Hardhat Node: SUCCESS (Current Block:", blockNumber, ")");
  } catch (err: any) {
    console.error("Connection to Hardhat Node: FAILED");
    console.error(err.message);
    return;
  }

  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("CONTRACT_ADDRESS is empty in .env!");
    return;
  }

  let contract: any = null;
  try {
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      console.error(`Contract NOT deployed at address ${contractAddress}! (Returned 0x)`);
    } else {
      console.log(`Contract detected at address ${contractAddress}.`);
      const abi = (DanaDesaLedger as any).abi || DanaDesaLedger.abi;
      contract = new Contract(contractAddress, abi, provider);
    }
  } catch (err: any) {
    console.error("Failed to query contract code:", err.message);
  }

  const users = await prisma.user.findMany({
    where: {
      role: { in: ['kaur-teknis', 'sekdes', 'kades', 'kaur-keuangan'] }
    }
  });

  for (const user of users) {
    console.log(`\nUser: ${user.nama} (${user.role})`);
    console.log(`- DB Wallet Address: ${user.walletAddress}`);
    
    if (user.walletAddress) {
      try {
        const balance = await provider.getBalance(user.walletAddress);
        console.log(`- Blockchain Balance: ${formatEther(balance)} ETH`);

        if (contract && roleMap[user.role]) {
          const role = roleMap[user.role];
          const hasRole = await contract.hasRole(role, user.walletAddress);
          console.log(`- On-chain Role: ${hasRole ? "GRANTED ✅" : "NOT GRANTED ❌"}`);
        }
      } catch (err: any) {
        console.error(`- Failed to query blockchain status:`, err.message);
      }
    } else {
      console.error("- No wallet address in DB!");
    }
  }
}

main().finally(() => prisma.$disconnect());
