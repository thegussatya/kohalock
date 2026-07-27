import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    {
      nama: 'Budi Santoso',
      email: 'budi.santoso.kaur-teknis@kohalock.desa',
      passwordHash,
      role: 'kaur-teknis',
      jabatan: 'Kaur Teknis'
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
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`Upserted user: ${createdUser.nama} (${createdUser.role})`);
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
