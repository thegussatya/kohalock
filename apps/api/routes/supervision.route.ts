import { Router, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { createNotification } from '../lib/notify';

const router = Router();
const prisma = new PrismaClient();

function serialize(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

// POST /api/supervision-notes
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { disbursementId, catatan } = req.body;
    if (!disbursementId || !catatan) {
      res.status(400).json({ error: 'disbursementId dan catatan wajib diisi' });
      return;
    }

    const note = await prisma.supervisionNote.create({
      data: {
        disbursementId,
        catatan,
        bpdUserId: userId
      },
      include: {
        disbursement: {
          include: { proposal: true }
        }
      }
    });

    // Notify Kades & Sekdes
    const targets = await prisma.user.findMany({
      where: { role: { in: ['KADES', 'SEKDES'] } }
    });

    for (const target of targets) {
      await createNotification(
        prisma,
        target.id,
        'Catatan Pengawasan Baru (BPD)',
        `BPD telah menambahkan catatan pengawasan pada usulan ${note.disbursement.proposal.judulUsulan}: "${catatan}"`
      );
    }

    res.status(201).json(serialize(note));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/supervision-notes/history
router.get('/history', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notes = await prisma.supervisionNote.findMany({
      include: {
        bpdUser: { select: { id: true, nama: true, role: true } },
        disbursement: {
          include: { proposal: { select: { judulUsulan: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(serialize(notes));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
