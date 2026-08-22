import { JsonRpcProvider, Wallet, formatEther, parseEther } from 'ethers';
import * as dotenv from 'dotenv';
import { PrismaClient } from '../generated/prisma';
import { decryptPrivateKey } from '../src/services/crypto.service';

dotenv.config();

const DEFAULT_PIN = '123456';
const MASTER_ADDRESS = '0x4DDEa3f08800Dd8cb130a3Fc6AAcc2ab0FB902A0';

async function main() {
  const rpcUrl = process.env.POLYGON_MAINNET_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/alch_iS927Gncl1WqbvodECN7O';
  const provider = new JsonRpcProvider(rpcUrl);
  const prisma = new PrismaClient();

  console.log('=== STARTING POL SWEEP REFUND PROCESS TO MASTER WALLET ===');
  console.log(`Target Master Wallet: ${MASTER_ADDRESS}\n`);

  const users = await prisma.user.findMany();
  let totalSweptWei = 0n;

  for (const user of users) {
    if (!user.encryptedPrivateKey) continue;

    let privateKey: string;
    try {
      privateKey = decryptPrivateKey(user.encryptedPrivateKey, DEFAULT_PIN);
    } catch (e) {
      console.warn(`Could not decrypt private key for ${user.nama} (${user.email})`);
      continue;
    }

    const userWallet = new Wallet(privateKey, provider);
    const balance = await provider.getBalance(userWallet.address);

    console.log(`User: ${user.nama} (${user.role}) | Address: ${userWallet.address} | Balance: ${formatEther(balance)} POL`);

    // Minimum balance threshold to sweep (0.005 POL)
    if (balance > parseEther('0.005')) {
      try {
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice || parseEther('0.00000003'); // 30 Gwei fallback
        const gasLimit = 21000n; // Standard native transfer gas limit
        const gasCost = gasLimit * gasPrice;

        if (balance > gasCost) {
          const sweepValue = balance - (gasCost * 12n / 10n); // 20% safety margin for gas price fluctuation
          if (sweepValue > 0n) {
            console.log(`--> Sweeping ${formatEther(sweepValue)} POL from ${user.nama} to Master Wallet...`);
            const tx = await userWallet.sendTransaction({
              to: MASTER_ADDRESS,
              value: sweepValue
            });
            await tx.wait();
            totalSweptWei += sweepValue;
            console.log(`✅ Successfully swept ${formatEther(sweepValue)} POL from ${user.nama}!`);
          }
        }
      } catch (err: any) {
        console.error(`❌ Failed to sweep from ${user.nama}:`, err.message);
      }
    }
  }

  const finalMasterBal = await provider.getBalance(MASTER_ADDRESS);
  console.log('\n==================================================');
  console.log(`🎉 Total POL Swept: ${formatEther(totalSweptWei)} POL`);
  console.log(`💰 Updated Master Wallet Balance: ${formatEther(finalMasterBal)} POL`);
  console.log('==================================================');
}

main().catch(err => {
  console.error('Sweep script error:', err);
  process.exit(1);
});
