import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function applyRLS() {
  console.log("Menerapkan Row Level Security (RLS) di database...");

  const queries = [
    // 1. Mengaktifkan RLS untuk semua tabel
    `ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "Proposal" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "Disbursement" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "RejectionLog" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "InterventionLog" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "ClarificationTicket" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "WhistleblowerReport" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "AdatCase" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "SupervisionNote" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "AuditorAccessToken" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "CashBookEntry" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "BankBookEntry" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "TaxBookEntry" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "MonthlyClosing" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "CorrectionTransaction" ENABLE ROW LEVEL SECURITY;`,

    // 2. Drop existing policies to avoid conflicts if re-running
    `DROP POLICY IF EXISTS "Public Read-Only Proposal" ON "Proposal";`,
    `DROP POLICY IF EXISTS "Public Read-Only Disbursement" ON "Disbursement";`,
    `DROP POLICY IF EXISTS "Permissive Authenticated Access" ON "User";`,
    `DROP POLICY IF EXISTS "Permissive Authenticated Access" ON "Proposal";`,
    `DROP POLICY IF EXISTS "Permissive Authenticated Access" ON "Disbursement";`,
    `DROP POLICY IF EXISTS "Permissive Authenticated Access" ON "RejectionLog";`,
    `DROP POLICY IF EXISTS "Permissive Authenticated Access" ON "InterventionLog";`,
    `DROP POLICY IF EXISTS "Permissive Authenticated Access" ON "ClarificationTicket";`,
    `DROP POLICY IF EXISTS "Permissive Authenticated Access" ON "Notification";`,
    `DROP POLICY IF EXISTS "Permissive Authenticated Access" ON "AdatCase";`,
    `DROP POLICY IF EXISTS "Permissive Authenticated Access" ON "SupervisionNote";`,
    `DROP POLICY IF EXISTS "Permissive Authenticated Access" ON "AuditorAccessToken";`,
    `DROP POLICY IF EXISTS "Permissive Authenticated Access" ON "CashBookEntry";`,
    `DROP POLICY IF EXISTS "Permissive Authenticated Access" ON "BankBookEntry";`,
    `DROP POLICY IF EXISTS "Permissive Authenticated Access" ON "TaxBookEntry";`,
    `DROP POLICY IF EXISTS "Permissive Authenticated Access" ON "MonthlyClosing";`,
    `DROP POLICY IF EXISTS "Permissive Authenticated Access" ON "CorrectionTransaction";`,
    `DROP POLICY IF EXISTS "Auditor Read-Only Whistleblower" ON "WhistleblowerReport";`,

    // 3. Policy untuk Anon (Public)
    `CREATE POLICY "Public Read-Only Proposal" ON "Proposal" FOR SELECT TO anon USING (true);`,
    `CREATE POLICY "Public Read-Only Disbursement" ON "Disbursement" FOR SELECT TO anon USING (true);`,

    // 4. Policy untuk Authenticated (MVP Permissive)
    `CREATE POLICY "Permissive Authenticated Access" ON "User" FOR ALL TO authenticated USING (true);`,
    `CREATE POLICY "Permissive Authenticated Access" ON "Proposal" FOR ALL TO authenticated USING (true);`,
    `CREATE POLICY "Permissive Authenticated Access" ON "Disbursement" FOR ALL TO authenticated USING (true);`,
    `CREATE POLICY "Permissive Authenticated Access" ON "RejectionLog" FOR ALL TO authenticated USING (true);`,
    `CREATE POLICY "Permissive Authenticated Access" ON "InterventionLog" FOR ALL TO authenticated USING (true);`,
    `CREATE POLICY "Permissive Authenticated Access" ON "ClarificationTicket" FOR ALL TO authenticated USING (true);`,
    `CREATE POLICY "Permissive Authenticated Access" ON "Notification" FOR ALL TO authenticated USING (true);`,
    `CREATE POLICY "Permissive Authenticated Access" ON "AdatCase" FOR ALL TO authenticated USING (true);`,
    `CREATE POLICY "Permissive Authenticated Access" ON "SupervisionNote" FOR ALL TO authenticated USING (true);`,
    `CREATE POLICY "Permissive Authenticated Access" ON "AuditorAccessToken" FOR ALL TO authenticated USING (true);`,
    `CREATE POLICY "Permissive Authenticated Access" ON "CashBookEntry" FOR ALL TO authenticated USING (true);`,
    `CREATE POLICY "Permissive Authenticated Access" ON "BankBookEntry" FOR ALL TO authenticated USING (true);`,
    `CREATE POLICY "Permissive Authenticated Access" ON "TaxBookEntry" FOR ALL TO authenticated USING (true);`,
    `CREATE POLICY "Permissive Authenticated Access" ON "MonthlyClosing" FOR ALL TO authenticated USING (true);`,
    `CREATE POLICY "Permissive Authenticated Access" ON "CorrectionTransaction" FOR ALL TO authenticated USING (true);`,

    // 5. Policy Khusus untuk WhistleblowerReport
    `CREATE POLICY "Auditor Read-Only Whistleblower" 
     ON "WhistleblowerReport" FOR SELECT TO authenticated 
     USING (
       EXISTS (
         SELECT 1 FROM "User" 
         WHERE "User".id = auth.uid()::text 
         AND "User".role = 'AUDITOR'
       )
     );`
  ];

  for (const query of queries) {
    try {
      await prisma.$executeRawUnsafe(query);
    } catch (e: any) {
      console.error(`Error executing query: ${query}`);
      console.error(e.message);
    }
  }

  console.log("Selesai menerapkan RLS.");
  await prisma.$disconnect();
}

applyRLS().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
