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
    const { proposalId } = req.body;

    if (!proposalId) {
      res.status(400).json({ error: 'proposalId tidak boleh kosong' });
      return;
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        kaurTeknis: { select: { nama: true, jabatan: true } }
      }
    });

    if (!proposal) {
      res.status(404).json({ error: 'Proposal tidak ditemukan' });
      return;
    }

    const data = await prisma.disbursement.findMany({
      where: { proposalId },
      include: {
        sekdesVerifier: { select: { nama: true, jabatan: true } },
        kadesApprover: { select: { nama: true, jabatan: true } }
      },
      orderBy: { submittedAt: 'asc' }
    });

    // Ambil Laporan Desa terbaru
    const laporanDesa = await prisma.laporanRealisasiDesa.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    // Helper Verifikasi File Hash
    const crypto = require('crypto');
    const fs = require('fs');
    const path = require('path');

    const verifyFileHash = (url: string | null, onChainHash: string | null) => {
      if (!url) return '[⚠️ BELUM ADA BUKTI FISIK]';
      if (!onChainHash) return '[⚠️ BELUM TERKUNCI DI BLOCKCHAIN]';
      
      try {
        const filename = url.split('/').pop();
        if (!filename) return '[❌ URL TIDAK VALID]';
        
        const filePath = path.join(__dirname, '..', 'uploads', filename);
        if (!fs.existsSync(filePath)) return '[❌ FILE HILANG DI SERVER]';

        const fileBuffer = fs.readFileSync(filePath);
        const calcHash = '0x' + crypto.createHash('sha256').update(fileBuffer).digest('hex');
        
        if (calcHash === onChainHash) {
          return '[✅ OTENTIK - Hash Cocok]';
        } else {
          return '[❌ BERBEDA - File Termodifikasi]';
        }
      } catch (err) {
        return '[❌ GAGAL MEMBACA FILE]';
      }
    };

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Pipe to response
    const safeFilename = proposal.judulUsulan.replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF ]/g, '').replace(/\s+/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="legal_report_${safeFilename}.pdf"`);
    doc.pipe(res);

    // Header Title
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#1e3a8a').text('LAPORAN HASIL AUDIT TERPADU', { align: 'center' });
    doc.fontSize(12).font('Helvetica').fillColor('#475569').text('Sistem Transparansi Dana Desa (KOHALOCK)', { align: 'center' });
    doc.moveDown(2);
    
    // Simulated Seal (Absolute positioning top-right)
    doc.save();
    doc.circle(500, 70, 35).lineWidth(3).strokeColor('#dc2626').stroke();
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#dc2626').text('SEALED\nVALIDATED', 465, 62, { align: 'center', width: 70 });
    doc.restore();

    doc.y = 130;
    doc.x = 50;

    // Info Program
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a').text(`Program / Kegiatan: ${proposal.judulUsulan}`);
    doc.fontSize(10).font('Helvetica').fillColor('#475569').text(`Kategori: ${proposal.kategori} | Dusun: ${proposal.dusun}`);
    
    // Uji Bukti Program-Level (LPJ Keuangan & LPJ Desa)
    doc.moveDown(1);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e3a8a').text('Hasil Uji Integritas Dokumen Tingkat Program (Otomatis):');
    doc.fontSize(10).font('Helvetica').fillColor('#334155');
    
    const statusLpjKeuangan = verifyFileHash(proposal.lpjKeuanganUrl, proposal.lpjKeuanganHash);
    doc.text(`1. LPJ Keuangan (Kaur Keuangan) : ${statusLpjKeuangan}`);
    
    const statusLpjDesa = laporanDesa ? verifyFileHash(laporanDesa.dokumenUrl, laporanDesa.dokumenHash) : '[⚠️ BELUM ADA BUKTI FISIK]';
    doc.text(`2. Laporan Realisasi Desa (Kades): ${statusLpjDesa}`);
    doc.moveDown(2);

    data.forEach((item, index) => {
      if (doc.y + 260 > 750) {
        doc.addPage();
        doc.y = 50;
      }

      const startY = doc.y;
      
      // Draw background box for this transaction
      doc.rect(50, startY, 495, 250).fillAndStroke('#f8fafc', '#cbd5e1');
      
      // Box Title
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f172a')
         .text(`Pencairan Tahap ${index + 1}`, 65, startY + 15);
      
      // Metadata
      doc.fontSize(10).font('Helvetica').fillColor('#475569');
      doc.text(`ID Transaksi On-Chain: ${item.onChainId}   |   Status: ${item.status}`, 65, startY + 30);
      
      doc.moveTo(65, startY + 45).lineTo(530, startY + 45).lineWidth(1).strokeColor('#e2e8f0').stroke();
      
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b').text('Detail Pencairan:', 65, startY + 55);
      doc.font('Helvetica').fontSize(10);
      doc.text(`Nominal      : Rp ${Number(item.nominal).toLocaleString('id-ID')}`, 65, startY + 70);
      doc.text(`Keterangan : ${item.keterangan}`, 65, startY + 85, { width: 450 });

      doc.moveTo(65, startY + 115).lineTo(530, startY + 115).lineWidth(1).strokeColor('#e2e8f0').stroke();

      // Uji Bukti Disbursement-Level
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b').text('Hasil Uji Integritas Dokumen Pencairan:', 65, startY + 125);
      doc.font('Helvetica').fontSize(10);
      
      const statusBA = verifyFileHash(item.beritaAcaraUrl, item.beritaAcaraHash);
      doc.text(`1. Berita Acara & Foto Fisik (Sekdes) : ${statusBA}`, 65, startY + 140);
      
      const statusLpjTeknis = verifyFileHash(item.lpjTeknisUrl, item.lpjTeknisHash);
      doc.text(`2. LPJ Fisik / Teknis (Kaur Teknis) : ${statusLpjTeknis}`, 65, startY + 155);

      doc.moveTo(65, startY + 175).lineTo(530, startY + 175).lineWidth(1).strokeColor('#e2e8f0').stroke();

      // Signatures
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b').text('Jejak Otorisasi (Tanda Tangan Digital):', 65, startY + 185);
      doc.font('Helvetica').fontSize(10);
      doc.text(`[Verifikator] Sekdes  : ${item.sekdesVerifier?.nama || '-'}`, 65, startY + 200);
      doc.text(`[Otorisator] Kades    : ${item.kadesApprover?.nama || '-'}`, 65, startY + 215);
      doc.text(`[Eksekutor] Keuangan  : ${item.disbursedAt ? new Date(item.disbursedAt).toLocaleString('id-ID') : '-'}`, 65, startY + 230);

      doc.x = 50;
      doc.y = startY + 270;
    });

    // Fetch Catatan Auditor terkait proposal ini
    const allDisbursementIds = data.map(d => d.id);
    const orConditions: any[] = [
      { docId: proposalId },
      { docId: { in: allDisbursementIds } }
    ];

    if (laporanDesa) {
      orConditions.push({ docId: laporanDesa.id });
    }

    const auditNotes = await prisma.auditNote.findMany({
      where: {
        OR: orConditions
      },
      include: { auditor: { select: { nama: true } } },
      orderBy: { createdAt: 'asc' }
    });

    if (auditNotes.length > 0) {
      if (doc.y + 100 > 750) { doc.addPage(); doc.y = 50; }

      doc.moveDown(1);
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#92400e').text('Catatan Auditor (Hasil Verifikasi Manual):');
      doc.moveDown(0.5);

      auditNotes.forEach((note, idx) => {
        if (doc.y + 60 > 750) { doc.addPage(); doc.y = 50; }

        const hasilColor = note.hasil === 'OTENTIK' ? '#166534' : '#991b1b';
        doc.fontSize(10).font('Helvetica-Bold').fillColor(hasilColor)
           .text(`${idx + 1}. [${note.hasil}] — ${note.docType.toUpperCase()}`);
        doc.fontSize(9).font('Helvetica').fillColor('#334155')
           .text(`   "${note.catatan}"`, { indent: 15 });
        doc.fontSize(8).font('Helvetica').fillColor('#94a3b8')
           .text(`   Oleh: ${note.auditor.nama} — ${new Date(note.createdAt).toLocaleString('id-ID')}`, { indent: 15 });
        doc.moveDown(0.5);
      });
    }

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
