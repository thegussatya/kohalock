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
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Pipe to response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="legal_report.pdf"');
    doc.pipe(res);

    // Header Title
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#1e3a8a').text('LAPORAN HASIL AUDIT TERPADU', { align: 'center' });
    doc.fontSize(12).font('Helvetica').fillColor('#475569').text('Sistem Transparansi Dana Desa (KohaLock)', { align: 'center' });
    doc.moveDown(2);
    
    // Simulated Seal (Absolute positioning top-right)
    doc.save();
    doc.circle(500, 70, 35).lineWidth(3).strokeColor('#dc2626').stroke();
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#dc2626').text('SEALED\nVALIDATED', 465, 62, { align: 'center', width: 70 });
    doc.restore();

    // Explicitly reset cursor coordinates after drawing the absolute seal
    // This fixes the bug where all subsequent text is squeezed to the right side
    doc.y = 130;
    doc.x = 50;

    data.forEach((item, index) => {
      // Check if we need a new page before drawing the box (assume box height is ~230)
      if (doc.y + 230 > 750) {
        doc.addPage();
        doc.y = 50;
      }

      const startY = doc.y;
      
      // Draw background box for this transaction
      doc.rect(50, startY, 495, 220).fillAndStroke('#f8fafc', '#cbd5e1');
      
      // Box Title
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a')
         .text(`Transaksi #${index + 1}: ${item.proposal.judulUsulan}`, 65, startY + 15);
      
      // Metadata
      doc.fontSize(10).font('Helvetica').fillColor('#475569');
      doc.text(`ID Transaksi On-Chain: ${item.onChainId}   |   Status: ${item.status}`, 65, startY + 35);
      
      // Divider
      doc.moveTo(65, startY + 55).lineTo(530, startY + 55).lineWidth(1).strokeColor('#e2e8f0').stroke();
      
      // Details
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b').text('Detail Pencairan:', 65, startY + 65);
      doc.font('Helvetica').fontSize(10);
      doc.text(`Nominal      : Rp ${Number(item.nominal).toLocaleString('id-ID')}`, 65, startY + 85);
      doc.text(`Keterangan : ${item.keterangan}`, 65, startY + 100, { width: 450 });
      doc.text(`Kategori     : ${item.proposal.kategori} - Dusun ${item.proposal.dusun}`, 65, startY + 115);

      // Divider
      doc.moveTo(65, startY + 135).lineTo(530, startY + 135).lineWidth(1).strokeColor('#e2e8f0').stroke();

      // Signatures
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b').text('Jejak Otorisasi (Tanda Tangan Digital):', 65, startY + 145);
      doc.font('Helvetica').fontSize(10);
      doc.text(`[Pemohon] Kaur Teknis : ${item.proposal.kaurTeknis?.nama || '-'}`, 65, startY + 165);
      doc.text(`[Verifikator] Sekdes  : ${item.sekdesVerifier?.nama || '-'} (Timestamp: ${item.verifiedAt ? new Date(item.verifiedAt).toLocaleString('id-ID') : '-'})`, 65, startY + 180);
      doc.text(`[Otorisator] Kades    : ${item.kadesApprover?.nama || '-'} (Timestamp: ${item.authorizedAt ? new Date(item.authorizedAt).toLocaleString('id-ID') : '-'})`, 65, startY + 195);
      doc.text(`[Eksekutor] Keuangan  : Dieksekusi pada ${item.disbursedAt ? new Date(item.disbursedAt).toLocaleString('id-ID') : '-'}`, 65, startY + 210);

      // Move cursor down for next item
      doc.x = 50;
      doc.y = startY + 240;
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

// GET /export/realization
router.get('/realization', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const disbursements = await prisma.disbursement.findMany({
      where: { status: 'DISBURSED' },
      include: { proposal: true }
    });
    
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="laporan_realisasi.pdf"');
    doc.pipe(res);

    doc.fontSize(20).font('Helvetica-Bold').fillColor('#0f172a').text('LAPORAN REALISASI ANGGARAN', { align: 'center' });
    doc.moveDown(2);
    
    let total = 0n;
    disbursements.forEach((d, i) => {
      doc.fontSize(12).font('Helvetica-Bold').text(`${i + 1}. ${d.proposal.judulUsulan}`);
      doc.fontSize(10).font('Helvetica').text(`Nominal: Rp ${d.nominal.toString()}`);
      doc.text(`Tanggal Eksekusi: ${d.disbursedAt ? new Date(d.disbursedAt).toLocaleDateString('id-ID') : '-'}`);
      doc.moveDown(1);
      total += d.nominal;
    });

    doc.moveDown(2);
    doc.fontSize(14).font('Helvetica-Bold').text(`Total Realisasi: Rp ${total.toString()}`, { align: 'right' });
    
    doc.end();
  } catch (error: any) {
    console.error('Error generating realization report:', error);
    if (!res.headersSent) res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /export/lpj
router.get('/lpj', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="dokumen_lpj.pdf"');
    doc.pipe(res);

    doc.fontSize(20).font('Helvetica-Bold').fillColor('#0f172a').text('LEMBAR PERTANGGUNGJAWABAN (LPJ)', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Dokumen ini digenerate secara otomatis oleh sistem KohaLock.', { align: 'center' });
    doc.moveDown(3);
    
    doc.fontSize(12).font('Helvetica').text('Detail pelaporan akan diisi di sini berdasarkan format LPJ desa yang berlaku. Modul LPJ akan mengambil data seluruh transaksi bulan berjalan beserta bukti upload berita acara masing-masing pencairan.');

    doc.end();
  } catch (error: any) {
    console.error('Error generating LPJ:', error);
    if (!res.headersSent) res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
