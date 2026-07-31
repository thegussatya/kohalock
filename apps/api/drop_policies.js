const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const tables = [
    'User', 'Proposal', 'Disbursement', 'RejectionLog', 
    'InterventionLog', 'ClarificationTicket', 'WhistleblowerReport', 
    'Notification', 'AdatCase', 'SupervisionNote', 'AuditorAccessToken', 
    'CashBookEntry', 'BankBookEntry', 'TaxBookEntry', 'MonthlyClosing', 
    'CorrectionTransaction', 'VillageIncomeEntry', 'Village'
  ];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Tenant Isolation Policy" ON "${table}" CASCADE;`);
      console.log(`Dropped Tenant Isolation Policy on ${table}`);
    } catch (e) {
      console.log(`Failed to drop policy on ${table}:`, e.message);
    }
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
