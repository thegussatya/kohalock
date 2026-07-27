import { Router, Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { createNotification } from '../lib/notify';
const router = Router();
const prisma = new PrismaClient();

// Helper to serialize BigInt
function serialize(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

// GET /clarifications (Public)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const clarifications = await prisma.clarificationTicket.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(serialize(clarifications));
  } catch (error: any) {
    console.error('Error fetching clarifications:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /clarifications (Public)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { namaWarga, programId, pertanyaan } = req.body;

    if (!pertanyaan) {
      res.status(400).json({ error: 'Pertanyaan wajib diisi' });
      return;
    }

    const newTicket = await prisma.clarificationTicket.create({
      data: {
        namaWarga: namaWarga || null,
        programId: programId || null,
        pertanyaan,
        status: 'MENUNGGU_JAWABAN' // Default status
      }
    });

    res.status(201).json(serialize(newTicket));
  } catch (error: any) {
    console.error('Error creating clarification:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /clarifications/:id/reply (Protected)
router.post('/:id/reply', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { jawaban } = req.body;

    if (!jawaban) {
      res.status(400).json({ error: 'Jawaban wajib diisi' });
      return;
    }

    const existing = await prisma.clarificationTicket.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Tiket klarifikasi tidak ditemukan' });
      return;
    }

    const updated = await prisma.clarificationTicket.update({
      where: { id },
      data: {
        jawaban,
        status: 'SELESAI',
        dijawabOlehId: req.user?.userId,
        answeredAt: new Date()
      }
    });

    if (updated.namaWarga) {
      const relatedUser = await prisma.user.findFirst({
        where: { nama: updated.namaWarga }
      });
      if (relatedUser) {
        await createNotification(
          prisma,
          relatedUser.id,
          "Klarifikasi Anda Telah Dijawab",
          `Tiket: ${updated.pertanyaan.substring(0, 30)}...`
        );
      }
    }

    res.json(serialize(updated));
  } catch (error: any) {
    console.error('Error replying to clarification:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
