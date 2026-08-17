import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcrypt';
import { JsonRpcProvider, Wallet, Contract, id } from 'ethers';
import { encryptPrivateKey } from '../src/services/crypto.service';
import * as DanaDesaLedger from '../src/config/DanaDesaLedger.json';

const prisma = new PrismaClient();
const DEFAULT_PIN = '123456';

const KAUR_ROLE = id("KAUR_ROLE");
const SEKDES_ROLE = id("SEKDES_ROLE");
const KADES_ROLE = id("KADES_ROLE");
const KAUR_KEUANGAN_ROLE = id("KAUR_KEUANGAN_ROLE");

const roleMap: Record<string, string | null> = {
  'kaur-teknis': KAUR_ROLE,
  'sekdes': SEKDES_ROLE,
  'kades': KADES_ROLE,
  'kaur-keuangan': KAUR_KEUANGAN_ROLE,
  'publik': null,
  'auditor': null,
  'bpd-adat': null
};

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // Setup Ethers connection
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
  const provider = new JsonRpcProvider(rpcUrl);
  
  let contract: any = null;
  let adminSigner: any = null;

  try {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (contractAddress) {
      adminSigner = await provider.getSigner(0);
      const abi = (DanaDesaLedger as any).abi || DanaDesaLedger.abi;
      contract = new Contract(contractAddress, abi, adminSigner);
      console.log('Connected to contract as admin (account 0).');
    } else {
      console.warn('CONTRACT_ADDRESS not found. Seed will create wallets but not grant blockchain roles.');
    }
  } catch (err) {
    console.warn('Could not connect to hardhat node. Wallet roles will not be granted.', err);
  }

  const users = [
    {
      nama: 'Budi Santoso',
      email: 'budi.santoso.operator-desa@kohalock.desa',
      passwordHash,
      role: 'kaur-teknis',
      jabatan: 'Operator Desa'
    },
    {
      nama: 'Siti Rahma',
      email: 'siti.rahma.sekdes@kohalock.desa',
      passwordHash,
      role: 'sekdes',
      jabatan: 'Sekretaris Desa'
    },
    {
      nama: 'Ahmad Fauzi',
      email: 'ahmad.fauzi.kades@kohalock.desa',
      passwordHash,
      role: 'kades',
      jabatan: 'Kepala Desa'
    },
    {
      nama: 'Warga Publik',
      email: 'warga.publik@kohalock.desa',
      passwordHash,
      role: 'publik',
      jabatan: 'Warga'
    },
    {
      nama: 'Inspektur Wilayah',
      email: 'inspektur.auditor@kohalock.desa',
      passwordHash,
      role: 'auditor',
      jabatan: 'Auditor Inspektorat'
    },
    {
      nama: 'Ketua BPD',
      email: 'ketua.bpd-adat@kohalock.desa',
      passwordHash,
      role: 'bpd-adat',
      jabatan: 'Ketua BPD & Tokoh Adat'
    },
    {
      nama: 'Hastuti',
      email: 'hastuti.kaur-keuangan@kohalock.desa',
      passwordHash,
      role: 'kaur-keuangan',
      jabatan: 'Kaur Keuangan / Bendahara'
    }
  ];

  console.log('Start seeding...');
  
  for (const user of users) {
    let walletAddress: string | null = null;
    let encryptedPrivateKey: string | null = null;

    // Generate wallet for all users (or we could just do it for roles that need it)
    const wallet = Wallet.createRandom();
    walletAddress = wallet.address;
    encryptedPrivateKey = encryptPrivateKey(wallet.privateKey, DEFAULT_PIN);

    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        walletAddress,
        encryptedPrivateKey
      },
      create: {
        ...user,
        walletAddress,
        encryptedPrivateKey
      },
    });
    console.log(`Upserted user: ${createdUser.nama} (${createdUser.role}) with wallet: ${walletAddress}`);

    // Grant Role on-chain if applicable
    if (contract && roleMap[user.role]) {
      const role = roleMap[user.role];
      try {
        const hasRole = await contract.hasRole(role, walletAddress);
        if (!hasRole) {
          const tx = await contract.grantRole(role, walletAddress);
          await tx.wait();
          console.log(`Granted blockchain role to ${user.role} (${walletAddress})`);
        } else {
          console.log(`Wallet ${walletAddress} already has role`);
        }
      } catch (err) {
        console.error(`Failed to grant role for ${user.role}:`, err);
      }
    }

    // Fund the new wallet with 1 ETH for gas
    if (adminSigner) {
      try {
        const txFund = await adminSigner.sendTransaction({
          to: walletAddress,
          value: 1000000000000000000n // 1 ETH
        });
        await txFund.wait();
        console.log(`Funded ${walletAddress} with 1 ETH`);
      } catch (err) {
        console.error(`Failed to fund ${walletAddress}:`, err);
      }
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
