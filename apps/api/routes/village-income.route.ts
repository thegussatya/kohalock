import { Router, Response } from 'express';
import { PrismaClient, Prisma } from '../generated/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Inisialisasi JSON replacer untuk BigInt supaya bisa dikembalikan di response JSON
function serialize(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

const VALID_KELOMPOK = ["Transfer", "PADes", "Pendapatan Lain-lain"];

// POST /api/village-income
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'kaur-keuangan') {
      res.status(403).json({ error: 'Akses ditolak. Hanya Kaur Keuangan yang diizinkan.' });
      return;
    }

    const { tanggal, kelompok, jenis, uraian, nominal, sumberReferensi } = req.body;

    if (!tanggal || !kelompok || !jenis || !uraian || nominal === undefined) {
      res.status(400).json({ error: 'Data wajib tidak lengkap.' });
      return;
    }

    const nominalBigInt = BigInt(nominal);
    if (nominalBigInt <= 0n) {
      res.status(400).json({ error: 'Nominal harus lebih dari 0.' });
      return;
    }

    if (!VALID_KELOMPOK.includes(kelompok)) {
      res.status(400).json({ error: 'Kelompok pendapatan tidak valid.' });
      return;
    }

    const inputDate = new Date(tanggal);
    if (isNaN(inputDate.getTime())) {
      res.status(400).json({ error: 'Format tanggal tidak valid.' });
      return;
    }

    const inputBulan = inputDate.getMonth() + 1;
    const inputTahun = inputDate.getFullYear();

    // Check monthly closing
    const isClosed = await prisma.monthlyClosing.findFirst({
      where: { bulan: inputBulan, tahun: inputTahun }
    });

    if (isClosed) {
      res.status(400).json({ error: 'Periode ini sudah ditutup, gunakan Transaksi Koreksi' });
      return;
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // Create Income Entry
      const incomeEntry = await tx.villageIncomeEntry.create({
        data: {
          tanggal: inputDate,
          kelompok,
          jenis,
          uraian,
          nominal: nominalBigInt,
          sumberReferensi: sumberReferensi || null,
          bulan: inputBulan,
          tahun: inputTahun,
          dicatatOlehId: req.user!.userId,
        }
      });

      // Calculate CashBook balance
      const lastEntry = await tx.cashBookEntry.findFirst({
        orderBy: { tanggal: 'desc' }
      });
      const saldoSebelumnya = lastEntry ? lastEntry.saldoBerjalan : BigInt(0);
      const saldoBaru = saldoSebelumnya + nominalBigInt;

      // Create CashBook Entry
      const newCashBookEntry = await tx.cashBookEntry.create({
        data: {
          tanggal: inputDate,
          uraian: "Pendapatan: " + uraian,
          penerimaan: nominalBigInt,
          pengeluaran: BigInt(0),
          saldoBerjalan: saldoBaru,
          bulan: inputBulan,
          tahun: inputTahun,
          statusTerkunci: false
        }
      });

      // Calculate BankBook balance
      const lastBankEntry = await tx.bankBookEntry.findFirst({
        orderBy: { tanggal: 'desc' }
      });
      const saldoBankSebelumnya = lastBankEntry ? lastBankEntry.saldo : BigInt(0);
      const saldoBankBaru = saldoBankSebelumnya + nominalBigInt;

      // Create BankBook Entry
      const newBankEntry = await tx.bankBookEntry.create({
        data: {
          tanggal: inputDate,
          keterangan: "Penerimaan: " + uraian,
          debit: nominalBigInt,
          kredit: BigInt(0),
          saldo: saldoBankBaru,
          bulan: inputBulan,
          tahun: inputTahun
        }
      });

      // Link Income Entry to CashBook Entry
      const updatedIncomeEntry = await tx.villageIncomeEntry.update({
        where: { id: incomeEntry.id },
        data: { cashBookEntryId: newCashBookEntry.id }
      });

      return { incomeEntry: updatedIncomeEntry, cashBookEntry: newCashBookEntry, bankBookEntry: newBankEntry };
    });
    res.status(201).json(serialize(result));
  } catch (error: any) {
    console.error('Error creating village income:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

// GET /api/village-income
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bulan, tahun, kelompok, jenis, search } = req.query;

    const whereClause: Prisma.VillageIncomeEntryWhereInput = {};

    if (bulan) {
      whereClause.bulan = parseInt(bulan as string, 10);
    }
    if (tahun) {
      whereClause.tahun = parseInt(tahun as string, 10);
    }
    if (kelompok) {
      whereClause.kelompok = kelompok as string;
    }
    if (jenis) {
      whereClause.jenis = jenis as string;
    }
    if (search) {
      whereClause.OR = [
        { uraian: { contains: search as string, mode: 'insensitive' } },
        { sumberReferensi: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const incomeEntries = await prisma.villageIncomeEntry.findMany({
      where: whereClause,
      orderBy: { tanggal: 'desc' },
      include: {
        dicatatOleh: {
          select: { nama: true }
        }
      }
    });

    res.json(serialize(incomeEntries));
  } catch (error: any) {
    console.error('Error fetching village income:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

// GET /api/village-income/summary
router.get('/summary', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bulan, tahun } = req.query;
    const now = new Date();
    
    const filterBulan = bulan ? parseInt(bulan as string, 10) : now.getMonth() + 1;
    const filterTahun = tahun ? parseInt(tahun as string, 10) : now.getFullYear();

    const summary = await prisma.villageIncomeEntry.groupBy({
      by: ['kelompok'],
      where: {
        bulan: filterBulan,
        tahun: filterTahun
      },
      _sum: {
        nominal: true
      }
    });

    // Format output to a simple key-value map
    const result = {
      Transfer: BigInt(0),
      PADes: BigInt(0),
      'Pendapatan Lain-lain': BigInt(0)
    };

    summary.forEach((item: any) => {
      if (item.kelompok in result) {
        result[item.kelompok as keyof typeof result] = item._sum.nominal || BigInt(0);
      }
    });

    res.json(serialize(result));
  } catch (error: any) {
    console.error('Error fetching village income summary:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

export default router;
