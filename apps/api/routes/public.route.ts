import { Router, Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import multer from 'multer';
import crypto from 'crypto';

const upload = multer({ dest: 'uploads/' });

const router = Router();
const prisma = new PrismaClient();

function serialize(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

// GET /api/public/summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const proposals = await prisma.proposal.findMany({
      include: {
        disbursements: true
      }
    });

    let totalDana = BigInt(0);
    let totalRealisasi = BigInt(0);
    let aktifCount = 0;
    let selesaiCount = 0;

    proposals.forEach(p => {
      totalDana += p.paguMaksimal;

      let projectRealisasi = BigInt(0);
      p.disbursements.forEach(d => {
        if (d.status === 'DISBURSED') {
          projectRealisasi += d.nominal;
          totalRealisasi += d.nominal;
        }
      });

      if (projectRealisasi >= p.paguMaksimal) {
        selesaiCount++;
      } else {
        aktifCount++;
      }
    });

    const totalDanaNumber = Number(totalDana);
    const totalRealisasiNumber = Number(totalRealisasi);
    const persentaseRealisasi = totalDanaNumber > 0 
      ? Math.round((totalRealisasiNumber / totalDanaNumber) * 100) 
      : 0;

    const laporanDitindaklanjuti = await prisma.clarificationTicket.count({
      where: {
        status: 'SELESAI'
      }
    });

    res.json(serialize({
      totalDana,
      totalRealisasi,
      persentaseRealisasi,
      proyekAktif: aktifCount,
      proyekSelesai: selesaiCount,
      laporanDitindaklanjuti
    }));
  } catch (error: any) {
    console.error('Public Summary Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/public/projects
router.get('/projects', async (req: Request, res: Response) => {
  try {
    const { search, dusun, status } = req.query;

    const proposals = await prisma.proposal.findMany({
      include: {
        disbursements: true
      },
      orderBy: { createdAt: 'desc' }
    });

    let mapped = proposals.map(p => {
      let projectRealisasi = BigInt(0);
      p.disbursements.forEach(d => {
        if (d.status === 'DISBURSED') {
          projectRealisasi += d.nominal;
        }
      });

      const paguMaksimalNum = Number(p.paguMaksimal);
      const realisasiNum = Number(projectRealisasi);
      const progress = paguMaksimalNum > 0 
        ? Math.round((realisasiNum / paguMaksimalNum) * 100) 
        : 0;
      
      const calcStatus = projectRealisasi >= p.paguMaksimal ? 'Selesai' : 'Sedang Berjalan';

      return {
        id: p.id,
        judulUsulan: p.judulUsulan,
        dusun: p.dusun,
        kategori: p.kategori,
        paguMaksimal: p.paguMaksimal,
        totalRealisasi: projectRealisasi,
        progress: progress > 100 ? 100 : progress,
        status: calcStatus,
        lpjKeuanganUrl: p.lpjKeuanganUrl,
        lpjKeuanganHash: p.lpjKeuanganHash
      };
    });

    if (search) {
      const q = (search as string).toLowerCase();
      mapped = mapped.filter(m => m.judulUsulan.toLowerCase().includes(q));
    }
    if (dusun) {
      mapped = mapped.filter(m => m.dusun === (dusun as string));
    }
    if (status) {
      mapped = mapped.filter(m => m.status === (status as string));
    }

    res.json(serialize(mapped));
  } catch (error: any) {
    console.error('Public Projects Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/public/projects/:id
router.get('/projects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const proposal = await prisma.proposal.findUnique({
      where: { id: id as string },
      include: {
        disbursements: {
          orderBy: { submittedAt: 'asc' }
        }
      }
    });

    if (!proposal) {
      res.status(404).json({ error: 'Proposal not found' });
      return;
    }

    let projectRealisasi = BigInt(0);
    const photos: any[] = [];
    const terms = proposal.disbursements.map((d: any, index: number) => {
      if (d.status === 'DISBURSED') {
        projectRealisasi += d.nominal;
      }

      if (d.fotoUrl && d.geotagLat && d.geotagLng && d.geotagTimestamp) {
        photos.push({
          id: d.id,
          url: d.fotoUrl,
          time: new Date(d.geotagTimestamp).toLocaleDateString('id-ID', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          }) + ' WIB',
          location: `Lat: ${d.geotagLat}, Lng: ${d.geotagLng}`
        });
      }

      return {
        id: d.id,
        term: `Pengajuan ${index + 1}: ${d.keterangan}`,
        anggaran: d.nominal,
        cair: d.status === 'DISBURSED' ? d.nominal : BigInt(0),
        status: d.status,
        tanggal: d.submittedAt,
        beritaAcaraHash: d.beritaAcaraHash,
        beritaAcaraUrl: d.beritaAcaraUrl,
        lpjTeknisUrl: d.lpjTeknisUrl,
        lpjStatus: d.lpjStatus
      };
    });

    const paguMaksimalNum = Number(proposal.paguMaksimal);
    const realisasiNum = Number(projectRealisasi);
    const progress = paguMaksimalNum > 0 
      ? Math.round((realisasiNum / paguMaksimalNum) * 100) 
      : 0;
    
    const calcStatus = projectRealisasi >= proposal.paguMaksimal ? 'Selesai' : 'Sedang Berjalan';

    res.json(serialize({
      id: proposal.id,
      judulUsulan: proposal.judulUsulan,
      dusun: proposal.dusun,
      kategori: proposal.kategori,
      paguMaksimal: proposal.paguMaksimal,
      totalRealisasi: projectRealisasi,
      progress: progress > 100 ? 100 : progress,
      status: calcStatus,
      formulirMusrembangUrl: typeof proposal.fileUrls === 'object' && proposal.fileUrls ? (proposal.fileUrls as any).formulirMusrembangUrl : null,
      rabUrl: typeof proposal.fileUrls === 'object' && proposal.fileUrls ? (proposal.fileUrls as any).rabUrl : null,
      terms,
      photos
    }));
  } catch (error: any) {
    console.error('Public Project Detail Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/public/clarifications
router.post('/clarifications', async (req: Request, res: Response): Promise<void> => {
  try {
    const { namaWarga, programId, pertanyaan } = req.body;
    
    if (!pertanyaan) {
      res.status(400).json({ error: 'Pertanyaan wajib diisi' });
      return;
    }

    const ticket = await prisma.clarificationTicket.create({
      data: {
        namaWarga,
        programId,
        pertanyaan
      }
    });

    res.status(201).json({ id: ticket.id });
  } catch (error: any) {
    console.error('Public Clarification Create Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/public/clarifications
router.get('/clarifications', async (req: Request, res: Response) => {
  try {
    const { programId } = req.query;
    
    const filter: any = {};
    if (programId) {
      filter.programId = programId as string;
    }
    
    const tickets = await prisma.clarificationTicket.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' }
    });

    res.json(serialize(tickets));
  } catch (error: any) {
    console.error('Public Clarification List Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/public/whistleblower
router.post('/whistleblower', async (req: Request, res: Response) => {
  try {
    const { encryptedPayload, attachmentUrls } = req.body;
    
    // Generate unique ticketCode format "WB-" + random string
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ticketCode = `WB-${randomStr}`;

    const report = await prisma.whistleblowerReport.create({
      data: {
        ticketCode,
        encryptedPayload,
        attachmentUrls: attachmentUrls || []
      }
    });

    res.status(201).json({ ticketCode: report.ticketCode });
  } catch (error: any) {
    console.error('Public Whistleblower Create Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/public/whistleblower/:ticketCode/status
router.get('/whistleblower/:ticketCode/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { ticketCode } = req.params;
    
    const report = await prisma.whistleblowerReport.findUnique({
      where: { ticketCode: ticketCode as string },
      select: { status: true } // STRICTLY return only status, DO NOT return encryptedPayload
    });

    if (!report) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    res.json({ status: report.status });
  } catch (error: any) {
    console.error('Public Whistleblower Status Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/public/reports/desa
router.get('/reports/desa', async (req: Request, res: Response) => {
  try {
    const reports = await prisma.laporanRealisasiDesa.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(serialize(reports));
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/public/verify-hash
router.post('/verify-hash', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  const fs = require('fs');
  try {
    const { docType, docId } = req.body;
    
    if (!req.file) {
      res.status(400).json({ success: false, error: 'File tidak ditemukan' });
      return;
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const hashUpload = '0x' + crypto.createHash('sha256').update(fileBuffer).digest('hex');
    let hashTersimpan: string | null = null;

    if (docType === 'berita_acara' || docType === 'lpj_teknis') {
      const disbursement = await prisma.disbursement.findUnique({ where: { id: docId } });
      if (disbursement) {
        hashTersimpan = docType === 'berita_acara' ? disbursement.beritaAcaraHash : disbursement.lpjTeknisHash;
      }
    } else if (docType === 'lpj_keuangan') {
      const proposal = await prisma.proposal.findUnique({ where: { id: docId } });
      if (proposal) {
        hashTersimpan = proposal.lpjKeuanganHash;
      }
    } else if (docType === 'lpj_desa') {
      const report = await prisma.laporanRealisasiDesa.findUnique({ where: { id: docId } });
      if (report) {
        hashTersimpan = report.dokumenHash;
      }
    }

    const isAuthentic = hashTersimpan ? (hashUpload === hashTersimpan) : false;

    res.json({
      success: true,
      isAuthentic,
      calculatedHash: hashUpload,
      onChainHash: hashTersimpan,
      message: isAuthentic ? 'Dokumen otentik dan belum mengalami perubahan' : 'Peringatan: Dokumen ini telah dimodifikasi atau tidak otentik!'
    });
  } catch (error: any) {
    console.error('Error in verify-hash:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
  }
});

export default router;
