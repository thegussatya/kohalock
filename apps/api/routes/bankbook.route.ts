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

// GET /
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bulan, tahun } = req.query;

    const whereClause: any = {};

    if (bulan) {
      whereClause.bulan = parseInt(bulan as string, 10);
    }

    if (tahun) {
      whereClause.tahun = parseInt(tahun as string, 10);
    }

    const entries = await prisma.bankBookEntry.findMany({
      where: whereClause,
      orderBy: { tanggal: 'asc' }
    });

    res.json(serialize(entries));
  } catch (error: any) {
    console.error('Error fetching bank book entries:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /reconcile
router.post('/reconcile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bulan, tahun, saldoAktualBank } = req.body;
    
    if (!bulan || !tahun || typeof saldoAktualBank === 'undefined') {
      res.status(400).json({ error: 'Bulan, tahun, dan saldoAktualBank wajib diisi' });
      return;
    }
    
    const isClosed = await prisma.monthlyClosing.findFirst({
      where: { bulan: Number(bulan), tahun: Number(tahun) }
    });
    
    if (isClosed) {
      res.status(400).json({ error: 'Bulan ini sudah ditutup, tidak dapat melakukan rekonsiliasi' });
      return;
    }
    
    const lastBankEntryMonth = await prisma.bankBookEntry.findFirst({
      where: { bulan: Number(bulan), tahun: Number(tahun) },
      orderBy: { tanggal: 'desc' }
    });
    
    let saldoSebelumnya = lastBankEntryMonth ? lastBankEntryMonth.saldo : BigInt(0);
    
    if (!lastBankEntryMonth) {
      const absoluteLast = await prisma.bankBookEntry.findFirst({
        where: {
          OR: [
            { tahun: { lt: Number(tahun) } },
            { tahun: Number(tahun), bulan: { lt: Number(bulan) } }
          ]
        },
        orderBy: { tanggal: 'desc' }
      });
      saldoSebelumnya = absoluteLast ? absoluteLast.saldo : BigInt(0);
    }
    
    const saldoAktual = BigInt(saldoAktualBank);
    
    // Fetch last cash book entry to determine the sign
    const lastCashEntryMonth = await prisma.cashBookEntry.findFirst({
      where: { bulan: Number(bulan), tahun: Number(tahun) },
      orderBy: { tanggal: 'desc' }
    });
    
    const isCashNegative = lastCashEntryMonth && lastCashEntryMonth.saldoBerjalan < 0n;
    
    let absSaldoAktual = BigInt(saldoAktualBank);
    if (absSaldoAktual < 0n) {
      absSaldoAktual = -absSaldoAktual;
    }
    
    const finalSaldoAktual = isCashNegative ? -absSaldoAktual : absSaldoAktual;
    
    let debit = BigInt(0);
    let kredit = BigInt(0);
    
    if (finalSaldoAktual > saldoSebelumnya) {
      debit = finalSaldoAktual - saldoSebelumnya;
    } else if (finalSaldoAktual < saldoSebelumnya) {
      kredit = saldoSebelumnya - finalSaldoAktual;
    } else {
      res.status(400).json({ error: 'Saldo aktual sama dengan saldo tercatat, tidak perlu rekonsiliasi.' });
      return;
    }
    
    const newEntry = await prisma.bankBookEntry.create({
      data: {
        tanggal: new Date(),
        keterangan: "Penyesuaian Rekonsiliasi",
        debit,
        kredit,
        saldo: finalSaldoAktual,
        bulan: Number(bulan),
        tahun: Number(tahun)
      }
    });
    
    res.status(201).json(serialize(newEntry));
  } catch (error: any) {
    console.error('Error reconciling bank book:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
