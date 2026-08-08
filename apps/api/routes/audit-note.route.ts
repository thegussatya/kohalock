import { Router, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// POST /api/audit-notes — Simpan catatan audit
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { docType, docId, catatan, hasil, hashUpload, hashOnChain } = req.body;

    if (!docType || !docId || !catatan) {
      res.status(400).json({ error: 'docType, docId, dan catatan wajib diisi' });
      return;
    }

    const note = await prisma.auditNote.create({
      data: {
        docType,
        docId,
        catatan,
        hasil: hasil || 'BELUM_DIUJI',
        hashUpload: hashUpload || null,
        hashOnChain: hashOnChain || null,
        auditorId: req.user!.userId
      }
    });

    res.status(201).json(note);
  } catch (error: any) {
    console.error('Error creating audit note:', error);
    res.status(500).json({ error: 'Gagal menyimpan catatan audit' });
  }
});

// GET /api/audit-notes?docType=...&docId=... — Ambil catatan per dokumen
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { docType, docId } = req.query;

    const where: any = {};
    if (docType && typeof docType === 'string') where.docType = docType;
    if (docId && typeof docId === 'string') where.docId = docId;

    const notes = await prisma.auditNote.findMany({
      where,
      include: {
        auditor: { select: { nama: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(notes);
  } catch (error: any) {
    console.error('Error fetching audit notes:', error);
    res.status(500).json({ error: 'Gagal mengambil catatan audit' });
  }
});

// GET /api/audit-notes/by-proposal/:proposalId — Ambil semua catatan terkait proposal
router.get('/by-proposal/:proposalId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const proposalId = req.params.proposalId;

    // Ambil semua disbursement IDs untuk proposal ini
    const disbursements = await prisma.disbursement.findMany({
      where: { proposalId: proposalId as string },
      select: { id: true }
    });
    const disbursementIds = disbursements.map(d => d.id);

    // Ambil semua catatan terkait proposal ini (baik level proposal maupun disbursement)
    const notes = await prisma.auditNote.findMany({
      where: {
        OR: [
          { docId: proposalId as string },
          { docId: { in: disbursementIds } }
        ]
      },
      include: {
        auditor: { select: { nama: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(notes);
  } catch (error: any) {
    console.error('Error fetching audit notes by proposal:', error);
    res.status(500).json({ error: 'Gagal mengambil catatan audit' });
  }
});

export default router;
