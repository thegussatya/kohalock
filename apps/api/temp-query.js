const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();
async function main() {
  const stats = await prisma.cashBookEntry.aggregate({
    _sum: { penerimaan: true, pengeluaran: true }
  });
  console.log('Total Penerimaan:', stats._sum.penerimaan);
  console.log('Total Pengeluaran:', stats._sum.pengeluaran);
  const last = await prisma.cashBookEntry.findFirst({
    orderBy: [{tanggal: 'desc'}, {id: 'desc'}]
  });
  console.log('Last Saldo (by tanggal,id desc):', last?.saldoBerjalan);
  
  const entries = await prisma.cashBookEntry.findMany({
    orderBy: { tanggal: 'desc' },
    take: 5
  });
  console.log('Last 5 entries:');
  entries.forEach(e => {
    console.log(`ID: ${e.id}, Tanggal: ${e.tanggal.toISOString()}, Uraian: ${e.uraian}, Penerimaan: ${e.penerimaan}, Pengeluaran: ${e.pengeluaran}, Saldo: ${e.saldoBerjalan}`);
  });
}
main().finally(() => prisma.$disconnect());
