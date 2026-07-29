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

// POST /api/adat-cases - buat kasus baru
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const pihakTerlibat = req.body.pihakTerlibat;
    const kategori = req.body.kategori;

    if (!pihakTerlibat || !kategori) {
      res.status(400).json({ error: 'pihakTerlibat dan kategori wajib diisi' });
      return;
    }

    const newCase = await prisma.adatCase.create({
      data: {
        pihakTerlibat,
        kategori: String(kategori),
        dicatatOlehId: userId
      }
    });

    res.status(201).json(serialize(newCase));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/adat-cases - list kasus dengan filter status
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const statusQuery = req.query.status;
    
    const whereCondition: any = {};
    if (statusQuery) {
      whereCondition.status = String(statusQuery);
    }

    const cases = await prisma.adatCase.findMany({
      where: whereCondition,
      include: {
        dicatatOleh: {
          select: {
            id: true,
            nama: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(serialize(cases));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/adat-cases/:id - update status/keputusanResolusi
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existingCase = await prisma.adatCase.findUnique({ where: { id: String(id) } });
    if (!existingCase) {
      res.status(404).json({ error: 'AdatCase tidak ditemukan' });
      return;
    }

    const dataToUpdate: any = {};
    if (req.body.status !== undefined) dataToUpdate.status = String(req.body.status);
    if (req.body.keputusanResolusi !== undefined) dataToUpdate.keputusanResolusi = String(req.body.keputusanResolusi);

    const updatedCase = await prisma.adatCase.update({
      where: { id: String(id) },
      data: dataToUpdate
    });

    res.json(serialize(updatedCase));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
