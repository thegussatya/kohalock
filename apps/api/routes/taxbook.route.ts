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

    // Asumsi kita menggunakan properti bulan dan tahun jika ditambah ke schema, 
    // tetapi schema.prisma untuk TaxBookEntry saat ini TIDAK memiliki 'bulan' dan 'tahun'
    // Jadi kita lakukan filter berdasar kolom 'tanggal'
    if (bulan || tahun) {
      const b = bulan ? parseInt(bulan as string, 10) : undefined;
      const t = tahun ? parseInt(tahun as string, 10) : undefined;
      
      if (b && t) {
        // filter bulan dan tahun
        const startDate = new Date(t, b - 1, 1);
        const endDate = new Date(t, b, 0, 23, 59, 59, 999);
        whereClause.tanggal = {
          gte: startDate,
          lte: endDate
        };
      } else if (t) {
        // filter tahun saja
        const startDate = new Date(t, 0, 1);
        const endDate = new Date(t, 11, 31, 23, 59, 59, 999);
        whereClause.tanggal = {
          gte: startDate,
          lte: endDate
        };
      }
    }

    const entries = await prisma.taxBookEntry.findMany({
      where: whereClause,
      orderBy: { tanggal: 'asc' }
    });

    res.json(serialize(entries));
  } catch (error: any) {
    console.error('Error fetching tax book entries:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
