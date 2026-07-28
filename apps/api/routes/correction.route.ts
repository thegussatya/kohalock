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

// GET /api/corrections
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bulan, tahun } = req.query;
    
    let whereClause: any = {};
    if (bulan || tahun) {
      const b = bulan ? parseInt(bulan as string, 10) : undefined;
      const t = tahun ? parseInt(tahun as string, 10) : undefined;
      
      if (b && t) {
        const startDate = new Date(t, b - 1, 1);
        const endDate = new Date(t, b, 0, 23, 59, 59, 999);
        whereClause.createdAt = { gte: startDate, lte: endDate };
      } else if (t) {
        const startDate = new Date(t, 0, 1);
        const endDate = new Date(t, 11, 31, 23, 59, 59, 999);
        whereClause.createdAt = { gte: startDate, lte: endDate };
      }
    }

    const corrections = await prisma.correctionTransaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: { dibuatOleh: { select: { nama: true } } }
    });

    res.json(serialize(corrections));
  } catch (error: any) {
    console.error('Error fetching corrections:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /api/corrections
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { transaksiAsalId, alasan, nilaiKoreksi } = req.body;

    if (!transaksiAsalId || !alasan || !nilaiKoreksi) {
      res.status(400).json({ error: 'Data tidak lengkap' });
      return;
    }

    const nilaiBigInt = BigInt(nilaiKoreksi);
    if (nilaiBigInt === 0n) {
      res.status(400).json({ error: 'Nilai koreksi tidak boleh 0' });
      return;
    }

    let isLocked = false;

    const cashEntry = await prisma.cashBookEntry.findUnique({
      where: { id: transaksiAsalId }
    });

    if (cashEntry) {
      isLocked = cashEntry.statusTerkunci;
      if (!isLocked) {
        const closing = await prisma.monthlyClosing.findFirst({
          where: { bulan: cashEntry.bulan, tahun: cashEntry.tahun }
        });
        if (closing) isLocked = true;
      }
    } else {
      const bankEntry = await prisma.bankBookEntry.findUnique({
        where: { id: transaksiAsalId }
      });
      if (bankEntry) {
        const closing = await prisma.monthlyClosing.findFirst({
          where: { bulan: bankEntry.bulan, tahun: bankEntry.tahun }
        });
        if (closing) isLocked = true;
      } else {
        res.status(404).json({ error: 'Transaksi asal tidak ditemukan' });
        return;
      }
    }

    if (!isLocked) {
      res.status(400).json({ error: 'Koreksi hanya untuk transaksi yang sudah terkunci (closing). Data terbuka dapat diedit secara langsung.' });
      return;
    }

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'User tidak teridentifikasi' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const correction = await tx.correctionTransaction.create({
        data: {
          transaksiAsalId,
          alasan,
          nilaiKoreksi: nilaiBigInt,
          dibuatOlehId: userId
        }
      });

      const sekarang = new Date();
      const currentBulan = sekarang.getMonth() + 1;
      const currentTahun = sekarang.getFullYear();

      // Check if current month is already closed
      const isCurrentMonthClosed = await tx.monthlyClosing.findFirst({
        where: { bulan: currentBulan, tahun: currentTahun }
      });
      
      if (isCurrentMonthClosed) {
        throw new Error('Buku kas bulan ini sudah ditutup, tidak bisa mencatat jurnal pembalik.');
      }

      const lastEntry = await tx.cashBookEntry.findFirst({
        orderBy: { tanggal: 'desc' }
      });

      const saldoSebelumnya = lastEntry ? lastEntry.saldoBerjalan : BigInt(0);
      const saldoBaru = saldoSebelumnya + nilaiBigInt;

      let penerimaan = BigInt(0);
      let pengeluaran = BigInt(0);

      if (nilaiBigInt > 0n) {
        penerimaan = nilaiBigInt;
      } else {
        pengeluaran = -nilaiBigInt;
      }

      const newCashEntry = await tx.cashBookEntry.create({
        data: {
          tanggal: sekarang,
          uraian: `KOREKSI (${transaksiAsalId}): ${alasan}`,
          penerimaan,
          pengeluaran,
          saldoBerjalan: saldoBaru,
          bulan: currentBulan,
          tahun: currentTahun,
          statusTerkunci: false
        }
      });

      return { correction, cashBookEntry: newCashEntry };
    });

    res.status(201).json(serialize(result));
  } catch (error: any) {
    console.error('Error creating correction:', error);
    if (error.message && error.message.includes('Buku kas bulan ini sudah ditutup')) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
