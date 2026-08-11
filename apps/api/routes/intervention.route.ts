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
        kades: { select: { nama: true, jabatan: true } },
        disbursement: {
          include: {
            proposal: {
              include: {
                kaurTeknis: { select: { nama: true, jabatan: true } }
              }
            }
          }
        }
      }
    });

    if (!log) {
      res.status(404).json({ error: 'Log intervensi tidak ditemukan' });
      return;
    }

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    const safeId = log.id.slice(0, 8).toUpperCase();
    res.setHeader('Content-Type', 'application/pdf');
    // IDM Anti-Intercept: Kita hilangkan header Content-Disposition. 
    // Biarkan frontend yang men-download secara paksa lewat createObjectURL.
    doc.pipe(res);

    const disb = log.disbursement;
    const proposal = disb.proposal;
    const tanggal = new Date(log.createdAt).toLocaleString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
    });
    const nominalFormatted = `Rp ${Number(disb.nominal).toLocaleString('id-ID')}`;

    // ── HEADER ─────────────────────────────────────────────────────────────
    doc.rect(50, 40, 495, 90).fillAndStroke('#1e3a8a', '#1e3a8a');

    doc.fillColor('#ffffff')
      .fontSize(18).font('Helvetica-Bold')
      .text('SERTIFIKAT PENOLAKAN INTERVENSI', 60, 58, { align: 'center', width: 475 });

    doc.fontSize(10).font('Helvetica')
      .text('Sistem Transparansi Dana Desa — KOHALOCK', 60, 84, { align: 'center', width: 475 });

    doc.fontSize(9)
      .text('Dokumen ini diterbitkan secara otomatis dan tercatat permanen di Blockchain', 60, 102, { align: 'center', width: 475 });

    // ── NOMOR SERTIFIKAT ───────────────────────────────────────────────────
    doc.moveDown(4);
    doc.fillColor('#1e3a8a').fontSize(11).font('Helvetica-Bold')
      .text(`No. Sertifikat: CERT-INT-${safeId}`, { align: 'center' });

    doc.moveDown(0.3);
    doc.fillColor('#64748b').fontSize(9).font('Helvetica')
      .text(`Diterbitkan pada: ${tanggal}`, { align: 'center' });

    // ── GARIS PEMBATAS ─────────────────────────────────────────────────────
    doc.moveDown(1.5);
    const yLine = doc.y;
    doc.moveTo(50, yLine).lineTo(545, yLine).strokeColor('#cbd5e1').lineWidth(1).stroke();
    doc.moveDown(1);

    // ── MENERANGKAN BAHWA ──────────────────────────────────────────────────
    doc.fillColor('#334155').fontSize(11).font('Helvetica-Bold')
      .text('MENERANGKAN BAHWA:', 50);
    doc.moveDown(0.5);

    const drawRow = (label: string, value: string, isHighlight = false) => {
      const y = doc.y;
      doc.fillColor('#64748b').fontSize(9).font('Helvetica').text(label, 50, y, { width: 160 });
      doc.fillColor(isHighlight ? '#dc2626' : '#0f172a').fontSize(9).font(isHighlight ? 'Helvetica-Bold' : 'Helvetica')
        .text(value, 220, y, { width: 325 });
      doc.moveDown(0.7);
    };

    drawRow('ID Transaksi Pencairan', disb.id);
    drawRow('ID On-Chain', `#${disb.onChainId}`);
    drawRow('Program Kegiatan', proposal.judulUsulan);
    drawRow('Dusun / Lokasi', proposal.dusun);
    drawRow('Nominal Dana Diajukan', nominalFormatted, true);
    drawRow('Diajukan oleh (Kaur Teknis)', proposal.kaurTeknis?.nama || '-');
    drawRow('Status Akhir Transaksi', 'REJECTED_SYSTEM (Dana Diblokir)', true);

    // ── ALASAN PENOLAKAN ───────────────────────────────────────────────────
    doc.moveDown(0.5);
    const yLine2 = doc.y;
    doc.moveTo(50, yLine2).lineTo(545, yLine2).strokeColor('#fca5a5').lineWidth(1).stroke();
    doc.moveDown(0.8);

    doc.fillColor('#dc2626').fontSize(11).font('Helvetica-Bold').text('ALASAN PENOLAKAN INTERVENSI:');
    doc.moveDown(0.5);

    // Kotak merah untuk alasan
    const alasanY = doc.y;
    const alasanText = disb.keterangan || '(Alasan tidak tersedia)';
    doc.rect(50, alasanY, 495, 55).fillAndStroke('#fef2f2', '#fca5a5');
    doc.fillColor('#7f1d1d').fontSize(10).font('Helvetica-Oblique')
      .text(`"${alasanText}"`, 60, alasanY + 12, { width: 475 });
    doc.y = alasanY + 65;

    // ── CATATAN TX HASH ────────────────────────────────────────────────────
    doc.moveDown(0.8);
    doc.fillColor('#334155').fontSize(10).font('Helvetica-Bold').text('Bukti Pencatatan On-Chain (Blockchain):');
    doc.moveDown(0.4);

    const txY = doc.y;
    doc.rect(50, txY, 495, 38).fillAndStroke('#f0fdf4', '#86efac');
    doc.fillColor('#14532d').fontSize(8).font('Helvetica')
      .text(`TX Hash: ${log.txHash || '(Pending — transaksi sedang di-broadcast)'}`, 60, txY + 7, { width: 475 });
    doc.fillColor('#166534').fontSize(8).font('Helvetica')
      .text(`Dicatat pada: ${tanggal}  |  Status: ${log.status}`, 60, txY + 22, { width: 475 });
    doc.y = txY + 48;

    // ── TANDA TANGAN ───────────────────────────────────────────────────────
    doc.moveDown(2);
    const signY = doc.y;
    doc.moveTo(50, signY).lineTo(545, signY).strokeColor('#cbd5e1').lineWidth(1).stroke();
    doc.moveDown(1);

    // Tanda tangan Kades (kiri)
    doc.fillColor('#334155').fontSize(9).font('Helvetica-Bold').text('Diotorisasi oleh:', 50, doc.y);
    doc.moveDown(0.3);
    doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text(log.kades?.nama || 'Kepala Desa', 50);
    doc.fillColor('#64748b').fontSize(9).font('Helvetica').text(log.kades?.jabatan || 'Kepala Desa', 50);
    doc.moveDown(0.2);
    doc.fillColor('#1e3a8a').fontSize(8).font('Helvetica').text('[Tanda tangan digital tercatat di Blockchain]', 50);

    // Stempel KOHALOCK (kanan)
    doc.fillColor('#1e3a8a').fontSize(9).font('Helvetica-Bold').text('KOHALOCK', 380, signY + 16, { width: 160, align: 'center' });
    doc.fillColor('#475569').fontSize(7).font('Helvetica').text('Sistem Transparansi Dana Desa', 380, signY + 30, { width: 160, align: 'center' });
    doc.rect(375, signY + 10, 170, 55).strokeColor('#1e3a8a').lineWidth(1.5).stroke();

    // ── FOOTER ──────────────────────────────────────────────────────────────
    const pageBottom = doc.page.height - 50;
    doc.fillColor('#94a3b8').fontSize(7).font('Helvetica')
      .text(
        'Dokumen ini dihasilkan secara otomatis oleh sistem KOHALOCK. Keaslian dapat diverifikasi melalui TX Hash di atas pada jaringan blockchain yang digunakan.',
        50, pageBottom - 20, { width: 495, align: 'center' }
      );

    doc.end();

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
