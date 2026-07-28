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

export default router;
