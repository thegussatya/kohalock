import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing on-chain dependent data from DB...');
  await prisma.auditNote.deleteMany();
  await prisma.lpjItem.deleteMany();
  await prisma.taxBookEntry.deleteMany();
  await prisma.supervisionNote.deleteMany();
  await prisma.whistleblowerReport.deleteMany();
  await prisma.clarificationTicket.deleteMany();
  await prisma.adatCase.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.interventionLog.deleteMany();
  await prisma.rejectionLog.deleteMany();
  await prisma.disbursement.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.laporanRealisasiDesa.deleteMany();
  await prisma.monthlyClosing.deleteMany();
  await prisma.correctionTransaction.deleteMany();
  await prisma.villageIncomeEntry.deleteMany();
  await prisma.cashBookEntry.deleteMany();
  await prisma.bankBookEntry.deleteMany();
  console.log('Done. DB is now in sync with fresh blockchain. Mulai alur dari awal.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
