import { Router, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import PDFDocument from 'pdfkit';

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

// POST /export/raw-data
router.post('/raw-data', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { disbursementIds } = req.body;

    if (!Array.isArray(disbursementIds) || disbursementIds.length === 0) {
      res.status(400).json({ error: 'disbursementIds harus berupa array string dan tidak boleh kosong' });
      return;
    }

    const data = await prisma.disbursement.findMany({
      where: {
        id: {
          in: disbursementIds
        }
      },
      include: {
        proposal: {
          include: {
            kaurTeknis: { select: { nama: true, jabatan: true } }
          }
        },
        sekdesVerifier: { select: { nama: true, jabatan: true } },
        kadesApprover: { select: { nama: true, jabatan: true } },
        interventionLogs: {
          include: {
            kades: { select: { nama: true } }
          }
        },
        supervisionNotes: {
          include: {
            bpdUser: { select: { nama: true } }
          }
        },
        rejectionLogs: true
      }
    });

    res.json(serialize(data));
  } catch (error: any) {
    console.error('Error exporting raw data:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /export/legal-report
router.post('/legal-report', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { disbursementIds } = req.body;

    if (!Array.isArray(disbursementIds) || disbursementIds.length === 0) {
      res.status(400).json({ error: 'disbursementIds harus berupa array string dan tidak boleh kosong' });
      return;
    }

    const data = await prisma.disbursement.findMany({
      where: {
        id: {
          in: disbursementIds
        }
      },
      include: {
        proposal: {
          include: {
            kaurTeknis: { select: { nama: true, jabatan: true } }
          }
        },
        sekdesVerifier: { select: { nama: true, jabatan: true } },
        kadesApprover: { select: { nama: true, jabatan: true } }
      }
    });

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Pipe to response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="legal_report.pdf"');
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Laporan Pencairan Dana Desa (Legal Report)', { align: 'center' });
    doc.moveDown();
    
    // Simulated Seal
    doc.save();
    doc.circle(500, 70, 30).lineWidth(3).strokeColor('red').stroke();
    doc.fontSize(12).fillColor('red').text('SEALED\nVALIDATED', 475, 60, { align: 'center' });
    doc.restore();

    doc.moveDown(2);

    data.forEach((item, index) => {
      doc.fontSize(14).fillColor('black').text(`Pencairan #${index + 1}: ${item.proposal.judulUsulan}`);
      doc.fontSize(12).text(`ID Transaksi (On-Chain): ${item.onChainId}`);
      doc.text(`Keterangan: ${item.keterangan}`);
      doc.text(`Nominal: Rp ${item.nominal.toString()}`);
      doc.text(`Status: ${item.status}`);
      doc.text(`Dusun: ${item.proposal.dusun}`);
      doc.text(`Kategori: ${item.proposal.kategori}`);
      doc.moveDown();
      
      doc.text(`Kaur Teknis: ${item.proposal.kaurTeknis?.nama || '-'}`);
      doc.text(`Diverifikasi oleh Sekdes: ${item.sekdesVerifier?.nama || '-'} (Pada: ${item.verifiedAt ? item.verifiedAt.toISOString() : '-'})`);
      doc.text(`Diotorisasi oleh Kades: ${item.kadesApprover?.nama || '-'} (Pada: ${item.authorizedAt ? item.authorizedAt.toISOString() : '-'})`);
      doc.text(`Dicairkan pada: ${item.disbursedAt ? item.disbursedAt.toISOString() : '-'}`);
      doc.moveDown();
      
      doc.text('--------------------------------------------------');
      doc.moveDown();
    });

    // Finalize PDF file
    doc.end();
  } catch (error: any) {
    console.error('Error generating legal report:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
});

export default router;
