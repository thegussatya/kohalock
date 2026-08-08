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

// GET /api/interventions
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await prisma.interventionLog.findMany({
      include: {
        kades: { select: { nama: true } },
        disbursement: {
          include: { proposal: { select: { judulUsulan: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(serialize(logs));
  } catch (error: any) {
    console.error('Error fetching interventions:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/interventions/:id/certificate
router.get('/:id/certificate', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const log = await prisma.interventionLog.findUnique({
      where: { id },
      include: {
        disbursement: {
          include: { proposal: true }
        }
      }
    });

    if (!log) {
      res.status(404).json({ error: 'Log intervensi tidak ditemukan' });
      return;
    }

    // Simulasi respons PDF. Di versi aslinya, di sini akan meng-generate file PDF dengan jsPDF/pdfkit
    res.json({
      message: 'Sertifikat Penolakan (Mock)',
      data: {
        txHash: log.txHash,
        waktu: log.createdAt,
        proposal: log.disbursement.proposal.judulUsulan,
        nominal: log.disbursement.nominal.toString()
      },
    // Simulasi URL PDF
      pdfUrl: `https://dummyimage.com/600x800/fecaca/991b1b.png&text=Sertifikat+Penolakan+${log.txHash}`
    });
  } catch (error: any) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/interventions/:id/status
router.put('/:id/status', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status wajib diisi' });
      return;
    }

    const updated = await prisma.interventionLog.update({
      where: { id },
      data: { status }
    });

    res.json(serialize(updated));
  } catch (error: any) {
    console.error('Error updating intervention status:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
