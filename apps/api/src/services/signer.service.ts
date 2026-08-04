import { Wallet, Contract, ContractTransactionReceipt } from 'ethers';
import { provider } from './blockchain.service';
import * as DanaDesaLedger from '../config/DanaDesaLedger.json';

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

  // Connect the wallet to the provider
  const wallet = new Wallet(userPrivateKey, provider);

  // Use the ABI from the hardhat artifact
  const abi = (DanaDesaLedger as any).abi || DanaDesaLedger.abi;

  // Create a read-write contract instance connected to the wallet
  const contract = new Contract(contractAddress, abi, wallet);

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
