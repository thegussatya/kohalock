import { Wallet, Contract, ContractTransactionReceipt, getAddress, parseEther } from 'ethers';
import { provider } from './blockchain.service';
import * as DanaDesaLedger from '../config/DanaDesaLedger.json';
import { decryptPrivateKey } from './crypto.service';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();
/**
 * Executes a transaction on the DanaDesaLedger contract.
 * @param userPrivateKey The private key of the user executing the transaction.
 * @param functionName The name of the contract function to call.
 * @param args The arguments to pass to the contract function.
 * @returns The transaction receipt.
 */
export async function executeContractTx(
  userPrivateKey: string,
  functionName: string,
  args: any[] = []
): Promise<ContractTransactionReceipt | null> {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error('CONTRACT_ADDRESS is not defined in environment variables');
  }

  const safeAddress = getAddress(contractAddress.toLowerCase());
  // Connect the wallet to the provider
  const wallet = new Wallet(userPrivateKey, provider);

  // Auto-fund user wallet with gas from Master Deployer Wallet if balance is low (Optimized Auto-Funding: 0.08 POL)
  try {
    const masterKey = process.env.PRIVATE_KEY;
    if (masterKey) {
      const userBalance = await provider.getBalance(wallet.address);
      // Mainnet Gas Auto-Funding (Threshold: < 0.04 POL, Funding: 0.08 POL)
      if (userBalance < parseEther('0.04')) {
        const safeMasterKey = masterKey.startsWith('0x') ? masterKey : `0x${masterKey}`;
        const masterWallet = new Wallet(safeMasterKey, provider);
        const feeData = await provider.getFeeData();
        const txReq: any = {
          to: wallet.address,
          value: parseEther('0.08')
        };
        if (feeData.maxPriorityFeePerGas) {
          txReq.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas * 12n / 10n;
        }
        if (feeData.maxFeePerGas) {
          txReq.maxFeePerGas = feeData.maxFeePerGas * 12n / 10n;
        }
        const fundTx = await masterWallet.sendTransaction(txReq);
        await fundTx.wait();
        console.log(`Auto-funded user wallet ${wallet.address} with 0.08 POL gas fee on Polygon Mainnet.`);
      }
    }
  } catch (fundErr) {
    console.warn('Auto-funding user wallet warning:', fundErr);
  }

  // Use the ABI from the hardhat artifact
  const abi = (DanaDesaLedger as any).abi || DanaDesaLedger.abi;

  // Create a read-write contract instance connected to the wallet
  const contract = new Contract(safeAddress, abi, wallet);

  // Verify function exists
  if (typeof contract[functionName] !== 'function') {
      throw new Error(`Function ${functionName} does not exist on the contract`);
  }

  // Execute the transaction
  const tx = await contract[functionName](...args);
  
  // Wait for the transaction to be mined
  const receipt = await tx.wait();
  
  return receipt;
}

/**
 * Convenience function to look up a user, decrypt their private key using their PIN,
 * and execute a transaction.
 */
export async function executeAsUser(
  userId: string,
  pin: string,
  functionName: string,
  args: any[] = []
): Promise<ContractTransactionReceipt | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.encryptedPrivateKey) {
    throw new Error('User wallet not found or not initialized');
  }

  // This will throw if PIN is incorrect
  const privateKey = decryptPrivateKey(user.encryptedPrivateKey, pin);

  return executeContractTx(privateKey, functionName, args);
}
