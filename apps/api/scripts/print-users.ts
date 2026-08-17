import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("=== USERS IN DATABASE ===");
  console.log(users.map(u => ({
    id: u.id,
    nama: u.nama,
    email: u.email,
    role: u.role,
    walletAddress: u.walletAddress
  })));
}

main().finally(() => prisma.$disconnect());
