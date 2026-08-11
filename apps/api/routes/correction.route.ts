import { Router, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

function serialize(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

// GET /api/koreksi/locked-entries
router.get('/locked-entries', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const entries = await prisma.cashBookEntry.findMany({
      where: { statusTerkunci: true },
      orderBy: { tanggal: 'desc' }
    });
    res.json(serialize(entries));
  } catch (error: any) {
    console.error('Error fetching locked entries:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /api/koreksi
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetEntryId, jenis, nominalKoreksi, uraian } = req.body;

    if (!targetEntryId || !jenis || !nominalKoreksi || !uraian) {
      res.status(400).json({ error: 'Semua field wajib diisi' });
      return;
    }

    const nominal = BigInt(nominalKoreksi);
    
    // Pastikan transaksi asal ada
    const targetEntry = await prisma.cashBookEntry.findUnique({
      where: { id: targetEntryId }
    });

    if (!targetEntry) {
      res.status(404).json({ error: 'Transaksi asal tidak ditemukan' });
      return;
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Pastikan bulan ini belum ditutup
    const closing = await prisma.monthlyClosing.findFirst({
      where: { bulan: currentMonth, tahun: currentYear }
    });

    if (closing) {
      res.status(400).json({ error: 'Bulan ini sudah ditutup, tidak bisa membuat entri koreksi' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Catat CorrectionTransaction
      const correction = await tx.correctionTransaction.create({
        data: {
          transaksiAsalId: targetEntry.id,
          alasan: uraian,
          nilaiKoreksi: nominal,
          dibuatOlehId: req.user!.userId
        }
      });

      // 2. Ambil saldo terakhir untuk CashBook
      const lastCashEntry = await tx.cashBookEntry.findFirst({
        orderBy: { tanggal: 'desc' }
      });
      const currentSaldo = lastCashEntry ? lastCashEntry.saldoBerjalan : 0n;

      let newPenerimaan = 0n;
      let newPengeluaran = 0n;
      let newSaldo = currentSaldo;

      if (jenis === 'KREDIT') {
        // Jurnal Pembalik Kredit (Mengembalikan dana kas yang keluar)
        newPenerimaan = nominal;
        newSaldo = currentSaldo + nominal;
      } else {
        // Jurnal Pembalik Debit (Mengurangi penerimaan yang salah dicatat)
        newPengeluaran = nominal;
        newSaldo = currentSaldo - nominal;
      }

      // 3. Buat CashBookEntry baru
      const newCashEntry = await tx.cashBookEntry.create({
        data: {
          tanggal: now,
          uraian: `[KOREKSI: ${targetEntry.uraian}] ${uraian}`,
          penerimaan: newPenerimaan,
          pengeluaran: newPengeluaran,
          saldoBerjalan: newSaldo,
          bulan: currentMonth,
          tahun: currentYear,
          statusTerkunci: false
        }
      });

      return { correction, newCashEntry };
    });

    res.status(201).json(serialize(result));
  } catch (error: any) {
    console.error('Error creating correction:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
