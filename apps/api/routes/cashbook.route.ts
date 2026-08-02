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

    const entries = await prisma.cashBookEntry.findMany({
      where: whereClause,
      orderBy: { tanggal: 'asc' }
    });

    let saldoAwal = BigInt(0);
    if (bulan && tahun) {
      const b = parseInt(bulan as string, 10);
      const t = parseInt(tahun as string, 10);
      
      const lastEntry = await prisma.cashBookEntry.findFirst({
        where: {
          OR: [
            { tahun: { lt: t } },
            { tahun: t, bulan: { lt: b } }
          ]
        },
        orderBy: { tanggal: 'desc' }
      });
      if (lastEntry) {
        saldoAwal = lastEntry.saldoBerjalan;
      }
    }

    res.json(serialize({ entries, saldoAwal }));
  } catch (error: any) {
    console.error('Error fetching cash book entries:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
