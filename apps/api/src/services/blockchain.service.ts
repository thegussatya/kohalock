import { JsonRpcProvider, Contract } from 'ethers';
import * as DanaDesaLedger from '../config/DanaDesaLedger.json';

const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
export const provider = new JsonRpcProvider(rpcUrl);

/**
 * Returns a read-only instance of the DanaDesaLedger contract.
 */
export function getContract(): Contract {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error('CONTRACT_ADDRESS is not defined in environment variables');
  }

  // Use the ABI from the hardhat artifact
  const abi = (DanaDesaLedger as any).abi || DanaDesaLedger.abi;
  return new Contract(contractAddress, abi, provider);
}
