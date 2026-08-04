import { PrismaClient } from './src/generated/prisma';
import { recalculateCashBookBalances } from './src/utils/ledger.util';
const prisma = new PrismaClient();
async function main() {
  console.log('Recalculating cash book balances...');
  await recalculateCashBookBalances(prisma as any);
  console.log('Done!');
  
  const stats = await prisma.cashBookEntry.aggregate({
    _sum: { penerimaan: true, pengeluaran: true }
  });
  console.log('Total Penerimaan:', stats._sum.penerimaan);
  console.log('Total Pengeluaran:', stats._sum.pengeluaran);
  const last = await prisma.cashBookEntry.findFirst({
    orderBy: [{tanggal: 'desc'}, {id: 'desc'}]
  });
  console.log('Last Saldo (by tanggal,id desc):', last?.saldoBerjalan);
}
main().finally(() => prisma.$disconnect());
