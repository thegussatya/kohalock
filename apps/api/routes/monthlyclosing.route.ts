import { Router, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

function serialize(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

// GET /api/monthly-closing/status
router.get('/status', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const monthsData = [];
    
    // Generate last 3 months
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth() + 1; // 1-12
      const y = d.getFullYear();
      
      const closing = await prisma.monthlyClosing.findFirst({
        where: { bulan: m, tahun: y }
      });

      const monthName = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      
      monthsData.push({
        value: `${y}-${m.toString().padStart(2, '0')}`,
        bulan: m,
        tahun: y,
        label: monthName,
        locked: !!closing,
        hashKunci: closing ? closing.hashKunci : null
      });
    }

    // Determine the current open month (the earliest unlocked month in the list)
    const currentOpenMonth = monthsData.find(m => !m.locked);
    
    let validations = {
      kasSeimbang: true,
      bankCocok: true,
      pajakLengkap: true
    };

    if (currentOpenMonth) {
      const { bulan, tahun } = currentOpenMonth;
      
      const lastCashEntry = await prisma.cashBookEntry.findFirst({
        where: { bulan, tahun },
        orderBy: { tanggal: 'desc' }
      });
      
      const lastBankEntry = await prisma.bankBookEntry.findFirst({
        where: { bulan, tahun },
        orderBy: { tanggal: 'desc' }
      });

      if (lastCashEntry && lastBankEntry) {
        validations.bankCocok = lastCashEntry.saldoBerjalan === lastBankEntry.saldo;
      } else if (!lastCashEntry && !lastBankEntry) {
        validations.bankCocok = true; // both empty
      } else {
        validations.bankCocok = false;
      }
      
      // Kas seimbang: just a placeholder logic that assumes true if no data anomalies found
      validations.kasSeimbang = true;
      validations.pajakLengkap = true;
    }

    res.json({
      months: monthsData,
      validations,
      currentOpenMonth: currentOpenMonth || null
    });

  } catch (error: any) {
    console.error('Error fetching monthly closing status:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /api/monthly-closing/close
router.post('/close', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bulan, tahun, pin } = req.body;
    
    // Validasi input
    if (!bulan || !tahun || !pin) {
      res.status(400).json({ error: 'Bulan, tahun, dan PIN wajib diisi' });
      return;
    }

    if (pin.length !== 6) {
      res.status(400).json({ error: 'PIN tidak valid' });
      return;
    }

    // Pastikan belum ditutup
    const existing = await prisma.monthlyClosing.findFirst({
      where: { bulan: Number(bulan), tahun: Number(tahun) }
    });

    if (existing) {
      res.status(400).json({ error: 'Bulan tersebut sudah dikunci sebelumnya' });
      return;
    }

    // Lakukan validasi ulang (seimbang)
    const lastCashEntry = await prisma.cashBookEntry.findFirst({
      where: { bulan: Number(bulan), tahun: Number(tahun) },
      orderBy: { tanggal: 'desc' }
    });
    
    const lastBankEntry = await prisma.bankBookEntry.findFirst({
      where: { bulan: Number(bulan), tahun: Number(tahun) },
      orderBy: { tanggal: 'desc' }
    });

    if (lastCashEntry || lastBankEntry) {
      if (!lastCashEntry || !lastBankEntry || lastCashEntry.saldoBerjalan !== lastBankEntry.saldo) {
        res.status(400).json({ error: 'Validasi gagal: Saldo Buku Kas dan Buku Bank tidak cocok.' });
        return;
      }
    }

    // Generate simulasi hash
    const dataToHash = `${bulan}-${tahun}-${new Date().toISOString()}-${pin}`;
    const hashKunci = crypto.createHash('sha256').update(dataToHash).digest('hex');

    // Eksekusi transaksi
    const closing = await prisma.$transaction(async (tx) => {
      // Buat rekaman closing
      const newClosing = await tx.monthlyClosing.create({
        data: {
          bulan: Number(bulan),
          tahun: Number(tahun),
          hashKunci,
          ditutupOlehId: req.user!.userId,
          ditutupPada: new Date()
        }
      });

      // Kunci entri buku kas (statusTerkunci = true)
      await tx.cashBookEntry.updateMany({
        where: { bulan: Number(bulan), tahun: Number(tahun) },
        data: { statusTerkunci: true }
      });

      return newClosing;
    });

    res.status(201).json(closing);

  } catch (error: any) {
    console.error('Error closing month:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
