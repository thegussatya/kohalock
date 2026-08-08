import { Router, Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

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

// POST /reports (Public)
router.post('/reports', async (req: Request, res: Response): Promise<void> => {
  try {
    const { ticketCode, encryptedPayload, attachmentUrls = [] } = req.body;

    if (!ticketCode || !encryptedPayload) {
      res.status(400).json({ error: 'ticketCode dan encryptedPayload wajib diisi' });
      return;
    }

    await prisma.whistleblowerReport.create({
      data: {
        ticketCode,
        encryptedPayload,
        attachmentUrls,
        status: 'DITERIMA'
      }
    });

    // Return 201 dengan ticketCode saja sesuai permintaan
    res.status(201).json({ ticketCode });
  } catch (error: any) {
    console.error('Error creating whistleblower report:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET /reports/:ticketCode/status (Public)
router.get('/reports/:ticketCode/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const ticketCode = req.params.ticketCode as string;

    const report = await prisma.whistleblowerReport.findUnique({
      where: { ticketCode },
      select: { status: true }
    });

    if (!report) {
      res.status(404).json({ error: 'Kode tiket tidak ditemukan' });
      return;
    }

    res.json({ status: report.status });
  } catch (error: any) {
    console.error('Error fetching whistleblower status:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET /reports (Protected)
router.get('/reports', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reports = await prisma.whistleblowerReport.findMany({
      select: {
        ticketCode: true,
        createdAt: true,
        encryptedPayload: true,
        status: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(serialize(reports));
  } catch (error: any) {
    console.error('Error fetching whistleblower reports:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /reports/:id/decrypt (Protected - Auditor)
// Endpoint ini hanya mengambil ciphertext. Dekripsi dilakukan di client-side.
router.post('/reports/:id/decrypt', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    // Server menerima privateKeyPassphrase tetapi TIDAK memakainya untuk dekripsi
    // Server hanya menggunakannya untuk verifikasi hak akses ekstra jika diperlukan (saat ini diabaikan)
    const { privateKeyPassphrase } = req.body;

    const report = await prisma.whistleblowerReport.findFirst({
      where: {
        OR: [
          { id },
          { ticketCode: id } // support fallback to ticketCode just in case
        ]
      },
      select: {
        ticketCode: true,
        encryptedPayload: true,
        createdAt: true,
        status: true
      }
    });

    if (!report) {
      res.status(404).json({ error: 'Laporan tidak ditemukan' });
      return;
    }

    res.json(serialize(report));
  } catch (error: any) {
    console.error('Error fetching report for decryption:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// PUT /reports/:ticketCode/status (Protected - Auditor)
router.put('/reports/:ticketCode/status', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ticketCode = req.params.ticketCode as string;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status wajib diisi' });
      return;
    }

    const updated = await prisma.whistleblowerReport.update({
      where: { ticketCode },
      data: { status }
    });

    res.json(serialize(updated));
  } catch (error: any) {
    console.error('Error updating report status:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
