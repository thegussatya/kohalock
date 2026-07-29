import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function verifyRLS() {
  console.log("Verifikasi RLS dengan mensimulasikan role 'anon'...");

  try {
    await prisma.$transaction(async (tx) => {
      // Set role ke anon yang dipakai Supabase
      await tx.$executeRawUnsafe(`SET LOCAL ROLE anon;`);
      
      console.log("1. Cek tabel User (harusnya 0 baris/kosong karena diblokir)");
      const users: any[] = await tx.$queryRawUnsafe(`SELECT * FROM "User";`);
      console.log(`Jumlah User terbaca: ${users.length}`);
      if (users.length > 0) {
        throw new Error("RLS Gagal! Role anon masih bisa membaca tabel User.");
      }

      console.log("2. Cek tabel Proposal (harusnya bisa terbaca jika ada isinya)");
      const proposals: any[] = await tx.$queryRawUnsafe(`SELECT * FROM "Proposal";`);
      console.log(`Jumlah Proposal terbaca: ${proposals.length}`);
      
      console.log("Verifikasi RLS berhasil!");
    });
  } catch (error) {
    console.error("Terjadi error selama verifikasi:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRLS().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
