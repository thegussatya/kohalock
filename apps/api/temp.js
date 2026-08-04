const { PrismaClient } = require('./src/generated/prisma/index.js');
const prisma = new PrismaClient();

async function main() {
  console.log('Recalculating ledger...');
  const entries = await prisma.cashBookEntry.findMany({
    orderBy: [
      { tanggal: 'asc' },
      { id: 'asc' }
    ]
  });

  let currentBalance = BigInt(0);
  for (const entry of entries) {
    currentBalance = currentBalance + entry.penerimaan - entry.pengeluaran;
    if (entry.saldoBerjalan !== currentBalance) {
      await prisma.cashBookEntry.update({
        where: { id: entry.id },
        data: { saldoBerjalan: currentBalance }
      });
      console.log(`Updated entry ${entry.id} to balance ${currentBalance}`);
    }
  }
  console.log('Done!');
}
main().finally(() => prisma.$disconnect());
