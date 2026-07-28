import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const tables = [
    'User',
    'Proposal',
    'Disbursement',
    'RejectionLog',
    'InterventionLog',
    'ClarificationTicket',
    'WhistleblowerReport',
    'Notification',
    'AdatCase',
    'SupervisionNote',
    'AuditorAccessToken',
    'CashBookEntry',
    'BankBookEntry',
    'TaxBookEntry',
    'MonthlyClosing',
    'CorrectionTransaction'
  ];

  for (const table of tables) {
    console.log(`Enabling RLS for "${table}"...`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
  }
  
  console.log('All tables successfully configured with RLS.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
