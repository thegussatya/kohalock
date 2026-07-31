import { Router, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { createNotification } from '../lib/notify';
import multer from 'multer';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

// Helper to serialize BigInt
function serialize(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

// GET /disbursements/sisa-pagu/:proposalId
router.get('/sisa-pagu/:proposalId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const proposalId = req.params.proposalId as string;

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      res.status(404).json({ error: 'Proposal tidak ditemukan' });
      return;
    }

    const disbursements = await prisma.disbursement.findMany({
      where: {
        proposalId,
        status: {
          notIn: ['REJECTED_SYSTEM', 'RETURNED_FOR_REVISION']
        }
      }
    });

    const totalTerpakai = disbursements.reduce((acc, curr) => acc + curr.nominal, BigInt(0));
    const sisaPagu = proposal.paguMaksimal - totalTerpakai;

    res.json({ sisaPagu: sisaPagu.toString() });
  } catch (error: any) {
    console.error('Error fetching sisa pagu:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /disbursements
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { proposalId, keterangan, nominal, geotagLat, geotagLng } = req.body;

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      res.status(404).json({ error: 'Proposal tidak ditemukan' });
      return;
    }

    const existingDisbursements = await prisma.disbursement.findMany({
      where: {
        proposalId,
        status: {
          notIn: ['REJECTED_SYSTEM', 'RETURNED_FOR_REVISION']
        }
      }
    });

    const totalTerpakai = existingDisbursements.reduce((acc, curr) => acc + curr.nominal, BigInt(0));
    const sisaPagu = proposal.paguMaksimal - totalTerpakai;

    const reqNominal = BigInt(nominal);
    if (reqNominal > sisaPagu) {
      res.status(400).json({ 
        error: `Nominal melebihi sisa pagu, sisa pagu saat ini: Rp ${sisaPagu.toString()}` 
      });
      return;
    }

    // kaurTeknisId dari req.user.userId sebenarnya tidak disimpan di tabel Disbursement,
    // karena relasi kaurTeknis ada di model Proposal. 
    // Jika maksudnya memastikan yg membuat adalah kaurTeknis proposal tersebut, 
    // kita bisa melakukan check di sini (opsional).
    if (proposal.kaurTeknisId !== req.user?.userId) {
      // res.status(403).json({ error: 'Bukan penanggung jawab proposal ini' });
      // return;
    }

    const disbursement = await prisma.disbursement.create({
      data: {
        proposalId,
        keterangan,
        nominal: reqNominal,
        geotagLat: Number(geotagLat),
        geotagLng: Number(geotagLng),
        geotagTimestamp: new Date(),
        status: 'PENDING_SEKDES',
        onChainId: Math.floor(Math.random() * 1000000), // Dummy
        beritaAcaraUrl: '', // Dummy string
        beritaAcaraHash: '', // Dummy string
        fotoUrl: '', // Dummy string
      }
    });

    try {
      const sekdesUsers = await prisma.user.findMany({ where: { role: 'sekdes' } });
      for (const sekdes of sekdesUsers) {
        await createNotification(
          prisma, 
          sekdes.id, 
          "Pengajuan Pencairan Baru", 
          `Pengajuan pencairan baru menunggu verifikasi Anda: ${proposal.judulUsulan}`
        );
      }
      console.log(`[Notification] Berhasil mengirim notifikasi ke ${sekdesUsers.length} Sekdes`);
    } catch (notifErr) {
      console.error('[Notification] Gagal mengirim notifikasi ke Sekdes:', notifErr);
    }

    res.status(201).json(serialize(disbursement));
  } catch (error: any) {
    console.error('Error creating disbursement:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// PUT /disbursements/:id
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { keterangan, nominal, geotagLat, geotagLng } = req.body;

    const existingDisbursement = await prisma.disbursement.findUnique({
      where: { id },
      include: { proposal: true }
    });

    if (!existingDisbursement) {
      res.status(404).json({ error: 'Disbursement tidak ditemukan' });
      return;
    }

    if (existingDisbursement.status !== 'RETURNED_FOR_REVISION') {
      res.status(400).json({ error: 'Hanya pengajuan yang dikembalikan untuk revisi yang dapat diubah' });
      return;
    }

    const reqNominal = BigInt(nominal);

    // Cek sisa pagu
    const existingDisbursements = await prisma.disbursement.findMany({
      where: {
        proposalId: existingDisbursement.proposalId,
        status: {
          notIn: ['REJECTED_SYSTEM', 'RETURNED_FOR_REVISION']
        },
        id: { not: id } // Exclude the current one just in case, though it's already in RETURNED_FOR_REVISION
      }
    });

    const totalTerpakai = existingDisbursements.reduce((acc, curr) => acc + curr.nominal, BigInt(0));
    const sisaPagu = existingDisbursement.proposal.paguMaksimal - totalTerpakai;

    if (reqNominal > sisaPagu) {
      res.status(400).json({ 
        error: `Nominal melebihi sisa pagu, sisa pagu saat ini: Rp ${sisaPagu.toString()}` 
      });
      return;
    }

    const updated = await prisma.disbursement.update({
      where: { id },
      data: {
        keterangan,
        nominal: reqNominal,
        geotagLat: Number(geotagLat),
        geotagLng: Number(geotagLng),
        geotagTimestamp: new Date(),
        status: 'PENDING_SEKDES',
        catatanRevisi: null // Clear the rejection note
      }
    });

    try {
      const sekdesUsers = await prisma.user.findMany({ where: { role: 'sekdes' } });
      for (const sekdes of sekdesUsers) {
        await createNotification(
          prisma, 
          sekdes.id, 
          "Pengajuan Revisi Dikirim Ulang", 
          `Pengajuan revisi telah dikirim ulang, menunggu verifikasi: ${existingDisbursement.proposal.judulUsulan}`
        );
      }
      console.log(`[Notification] Berhasil mengirim notifikasi revisi ke ${sekdesUsers.length} Sekdes`);
    } catch (notifErr) {
      console.error('[Notification] Gagal mengirim notifikasi revisi ke Sekdes:', notifErr);
    }

    res.json(serialize(updated));
  } catch (error: any) {
    console.error('Error updating disbursement:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET /disbursements
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const whereClause: any = {};
    if (status && typeof status === 'string') {
      whereClause.status = status;
    }

    const disbursements = await prisma.disbursement.findMany({
      where: whereClause,
      include: {
        proposal: {
          select: {
            judulUsulan: true,
            kaurTeknis: {
              select: {
                nama: true
              }
            }
          }
        }
      }
    });

    res.json(serialize(disbursements));
  } catch (error: any) {
    console.error('Error fetching disbursements:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET /disbursements/rejections
router.get('/rejections', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rejectionLogs = await prisma.rejectionLog.findMany({
      include: {
        disbursement: {
          include: {
            proposal: { select: { judulUsulan: true } }
          }
        }
      }
    });

    const interventionLogs = await prisma.interventionLog.findMany({
      include: {
        disbursement: {
          include: {
            proposal: { select: { judulUsulan: true } }
          }
        }
      }
    });

    const combined = [
      ...rejectionLogs.map(l => ({
        id: `rej_${l.id}`,
        disbursementId: l.disbursementId,
        proposalId: l.disbursement?.proposalId,
        tanggal: l.createdAt,
        namaProgram: l.disbursement?.proposal?.judulUsulan || '-',
        tahap: 'Pencairan (Verifikasi Sekdes)',
        jenis: 'sekdes',
        alasan: l.pesanError,
        status: l.disbursement?.status === 'RETURNED_FOR_REVISION' ? 'Belum Diperbaiki' : 'Sudah Diperbaiki'
      })),
      ...interventionLogs.map(l => ({
        id: `int_${l.id}`,
        disbursementId: l.disbursementId,
        proposalId: l.disbursement?.proposalId,
        tanggal: l.createdAt,
        namaProgram: l.disbursement?.proposal?.judulUsulan || '-',
        tahap: 'Pencairan (Otorisasi Kades)',
        jenis: 'sistem',
        alasan: l.disbursement?.catatanRevisi || 'Penolakan Sistem/Intervensi',
        status: l.disbursement?.status === 'REJECTED_SYSTEM' ? 'Belum Diperbaiki' : 'Sudah Diperbaiki'
      }))
    ].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

    res.json(serialize(combined));
  } catch (error: any) {
    console.error('Error fetching rejections:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET /disbursements/execution-queue
router.get('/execution-queue', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const disbursements = await prisma.disbursement.findMany({
      where: { status: 'PENDING_EKSEKUSI' },
      include: {
        proposal: {
          select: { judulUsulan: true }
        },
        kadesApprover: {
          select: { nama: true }
        }
      }
    });
    res.json(serialize(disbursements));
  } catch (error: any) {
    console.error('Error fetching execution queue:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});



// POST /disbursements/:id/verify
router.post('/:id/verify', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    
    const updated = await prisma.disbursement.update({
      where: { id },
      data: {
        status: 'PENDING_KADES',
        sekdesVerifierId: req.user?.userId,
        verifiedAt: new Date()
      },
      include: { proposal: true }
    });

    try {
      const kadesUsers = await prisma.user.findMany({ where: { role: 'kades' } });
      for (const kades of kadesUsers) {
        await createNotification(
          prisma, 
          kades.id, 
          "Pengajuan Menunggu Otorisasi", 
          `Pengajuan pencairan menunggu otorisasi Anda: ${updated.proposal?.judulUsulan}`
        );
      }
      console.log(`[Notification] Berhasil mengirim notifikasi ke ${kadesUsers.length} Kades`);
    } catch (notifErr) {
      console.error('[Notification] Gagal mengirim notifikasi ke Kades:', notifErr);
    }

    res.json(serialize(updated));
  } catch (error: any) {
    console.error('Error verifying disbursement:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET /disbursements/verifications
router.get('/verifications', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sekdesId = req.user?.userId;
    
    // Disetujui
    const verified = await prisma.disbursement.findMany({
      where: { sekdesVerifierId: sekdesId, verifiedAt: { not: null } },
      include: { proposal: { select: { judulUsulan: true } } }
    });

    // Revisi (since we can't filter by sekdesId directly in RejectionLog, we filter by jenisPenolakan 
    // and assume it corresponds to the current Sekdes or just list all 'Verifikasi Sekdes' logs)
    const rejections = await prisma.rejectionLog.findMany({
      where: { jenisPenolakan: 'Verifikasi Sekdes' },
      include: { disbursement: { include: { proposal: { select: { judulUsulan: true } } } } }
    });

    const combined = [
      ...verified.map(v => ({
        id: `v_${v.id}`,
        tanggal: v.verifiedAt || new Date(),
        namaProgram: v.proposal?.judulUsulan,
        keputusan: 'Disetujui',
        nominal: v.nominal
      })),
      ...rejections.map(r => ({
        id: `r_${r.id}`,
        tanggal: r.createdAt,
        namaProgram: r.disbursement?.proposal?.judulUsulan,
        keputusan: 'Revisi',
        nominal: r.disbursement?.nominal || BigInt(0)
      }))
    ].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

    res.json(serialize(combined));
  } catch (error: any) {
    console.error('Error fetching verifications:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET /disbursements/authorizations
router.get('/authorizations', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const kadesId = req.user?.userId;
    
    const authorized = await prisma.disbursement.findMany({
      where: { kadesApproverId: kadesId },
      include: { proposal: { select: { judulUsulan: true, dusun: true, kategori: true } } },
      orderBy: { authorizedAt: 'desc' }
    });

    const mapped = authorized.map(a => ({
      id: a.id,
      tanggal: a.authorizedAt || new Date(),
      namaProgram: a.proposal?.judulUsulan,
      dusun: a.proposal?.dusun,
      kategori: a.proposal?.kategori,
      nominal: Number(a.nominal)
    }));

    res.json(serialize(mapped));
  } catch (error: any) {
    console.error('Error fetching authorizations:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET /disbursements/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const disbursement = await prisma.disbursement.findUnique({
      where: { id },
      include: {
        proposal: {
          include: {
            kaurTeknis: {
              select: { nama: true }
            }
          }
        }
      }
    });

    if (!disbursement) {
      res.status(404).json({ error: 'Disbursement tidak ditemukan' });
      return;
    }

    res.json(serialize(disbursement));
  } catch (error: any) {
    console.error('Error fetching disbursement:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /disbursements/:id/return-revision
router.post('/:id/return-revision', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { catatan } = req.body;
    const sekdesId = req.user?.userId;

    if (!sekdesId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const updated = await prisma.disbursement.update({
      where: { id },
      data: {
        status: 'RETURNED_FOR_REVISION',
        catatanRevisi: catatan
      },
      include: { proposal: true }
    });

    await prisma.rejectionLog.create({
      data: {
        disbursementId: id,
        jenisPenolakan: 'Verifikasi Sekdes',
        pesanError: catatan
      }
    });

    try {
      if (updated.proposal?.kaurTeknisId) {
        await createNotification(
          prisma,
          updated.proposal.kaurTeknisId,
          "Pengajuan Dikembalikan (Revisi)",
          `Pengajuan Anda dikembalikan untuk revisi: ${catatan}`
        );
        console.log(`[Notification] Berhasil mengirim notifikasi revisi ke Kaur Teknis (ID: ${updated.proposal.kaurTeknisId})`);
      }
    } catch (notifErr) {
      console.error('[Notification] Gagal mengirim notifikasi revisi ke Kaur Teknis:', notifErr);
    }

    res.json(serialize(updated));
  } catch (error: any) {
    console.error('Error returning disbursement for revision:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /disbursements/:id/reject-intervention
router.post('/:id/reject-intervention', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { alasan } = req.body;
    
    const disbursement = await prisma.disbursement.findUnique({
      where: { id }
    });

    if (!disbursement) {
      res.status(404).json({ error: 'Disbursement tidak ditemukan' });
      return;
    }

    // Hanya bisa menolak intervensi yang sedang menunggu persetujuan (atau diizinkan kades)
    // Walaupun dalam kondisi darurat Kades bisa membekukan yang sudah dieksekusi, sesuai spec MVP kita bekukan yang PENDING.
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.disbursement.update({
        where: { id },
        data: {
          status: 'REJECTED_SYSTEM',
          kadesApproverId: req.user?.userId,
        } as any
      });

      const log = await tx.interventionLog.create({
        data: {
          disbursementId: id,
          kadesId: req.user?.userId!,
          txHash: `0xMOCK${Math.random().toString(16).substr(2, 8).toUpperCase()}`,
        }
      });

      return { updated, log };
    });

    res.json(serialize(result));
  } catch (error: any) {
    console.error('Error rejecting intervention:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /disbursements/:id/authorize
router.post('/:id/authorize', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    
    const disbursement = await prisma.disbursement.findUnique({
      where: { id }
    });

    if (!disbursement) {
      res.status(404).json({ error: 'Disbursement tidak ditemukan' });
      return;
    }

    if (disbursement.status !== 'PENDING_KADES') {
      res.status(400).json({ error: 'Pengajuan tidak dalam status PENDING_KADES' });
      return;
    }

    const updated = await prisma.disbursement.update({
      where: { id },
      data: {
        status: 'PENDING_EKSEKUSI',
        kadesApproverId: req.user?.userId,
        authorizedAt: new Date()
      } as any,
      include: { proposal: true }
    });

    try {
      const kaurKeuanganUsers = await prisma.user.findMany({ where: { role: 'kaur-keuangan' } });
      for (const kaurKeuangan of kaurKeuanganUsers) {
        await createNotification(
          prisma, 
          kaurKeuangan.id, 
          "Transaksi Baru di Antrean Eksekusi", 
          `Proposal: ${updated.proposal?.judulUsulan}`
        );
      }
      console.log(`[Notification] Berhasil mengirim notifikasi ke ${kaurKeuanganUsers.length} Kaur Keuangan`);
    } catch (notifErr) {
      console.error('[Notification] Gagal mengirim notifikasi ke Kaur Keuangan:', notifErr);
    }

    res.json(serialize(updated));
  } catch (error: any) {
    console.error('Error authorizing disbursement:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /disbursements/:id/execute
router.post('/:id/execute', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { potonganPajak } = req.body;
    
    const disbursement = await prisma.disbursement.findUnique({
      where: { id },
      include: { proposal: true }
    });

    if (!disbursement) {
      res.status(404).json({ error: 'Disbursement tidak ditemukan' });
      return;
    }

    if (disbursement.status !== 'PENDING_EKSEKUSI') {
      res.status(400).json({ error: 'Pengajuan tidak dalam status PENDING_EKSEKUSI' });
      return;
    }

    const sekarang = new Date();
    const currentBulan = sekarang.getMonth() + 1;
    const currentTahun = sekarang.getFullYear();

    const isClosed = await prisma.monthlyClosing.findFirst({
      where: { bulan: currentBulan, tahun: currentTahun }
    });

    if (isClosed) {
      res.status(400).json({ error: 'Buku kas untuk bulan ini sudah ditutup, eksekusi pencairan tidak diizinkan.' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedDisbursement = await tx.disbursement.update({
        where: { id },
        data: {
          status: 'DISBURSED',
          disbursedAt: new Date()
        }
      });

      const sekarang = new Date();

      // CashBook Entry
      const lastEntry = await tx.cashBookEntry.findFirst({
        orderBy: { tanggal: 'desc' }
      });

      const saldoSebelumnya = lastEntry ? lastEntry.saldoBerjalan : BigInt(0);
      const saldoBaru = saldoSebelumnya - disbursement.nominal;

      const newEntry = await tx.cashBookEntry.create({
        data: {
          tanggal: sekarang,
          uraian: "Pencairan dana: " + disbursement.proposal.judulUsulan,
          penerimaan: BigInt(0),
          pengeluaran: disbursement.nominal,
          saldoBerjalan: saldoBaru,
          bulan: sekarang.getMonth() + 1,
          tahun: sekarang.getFullYear(),
          statusTerkunci: false
        }
      });

      // BankBook Entry
      const lastBankEntry = await tx.bankBookEntry.findFirst({
        orderBy: { tanggal: 'desc' }
      });

      const saldoBankSebelumnya = lastBankEntry ? lastBankEntry.saldo : BigInt(0);
      const saldoBankBaru = saldoBankSebelumnya - disbursement.nominal;

      const newBankEntry = await tx.bankBookEntry.create({
        data: {
          tanggal: sekarang,
          keterangan: "Pencairan dana: " + disbursement.proposal.judulUsulan,
          debit: BigInt(0),
          kredit: disbursement.nominal,
          saldo: saldoBankBaru,
          bulan: sekarang.getMonth() + 1,
          tahun: sekarang.getFullYear()
        }
      });

      // TaxBook Entries
      const taxEntries = [];
      if (potonganPajak && Array.isArray(potonganPajak)) {
        for (const p of potonganPajak) {
          if (!p.jenisPajak || !p.nominal) continue;
          
          try {
            const nominalPajak = BigInt(p.nominal);
            if (nominalPajak <= 0n) continue;

            const newTax = await tx.taxBookEntry.create({
              data: {
                tanggal: sekarang,
                jenisPajak: p.jenisPajak,
                nominal: nominalPajak,
                statusSetor: "BELUM_SETOR",
                bulan: sekarang.getMonth() + 1,
                tahun: sekarang.getFullYear(),
                disbursementId: id
              }
            });
            taxEntries.push(newTax);
          } catch (e) {
            // Ignore if nominal is invalid bigint
          }
        }
      }

      return { disbursement: updatedDisbursement, cashBookEntry: newEntry, bankBookEntry: newBankEntry, taxEntries };
    });

    try {
      if (disbursement.proposal?.kaurTeknisId) {
        await createNotification(
          prisma, 
          disbursement.proposal.kaurTeknisId, 
          "Dana Pencairan Anda Telah Dieksekusi", 
          `Proposal: ${disbursement.proposal.judulUsulan} (Rp ${disbursement.nominal.toString()})`
        );
        console.log(`[Notification] Berhasil mengirim notifikasi eksekusi ke Kaur Teknis (ID: ${disbursement.proposal.kaurTeknisId})`);
      }
    } catch (notifErr) {
      console.error('[Notification] Gagal mengirim notifikasi ke Kaur Teknis:', notifErr);
    }

    res.json(serialize(result));
  } catch (error: any) {
    console.error('Error executing disbursement:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /disbursements/verify-hash
router.post('/verify-hash', authenticate, upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { disbursementId } = req.body;
    
    if (!req.file) {
      res.status(400).json({ error: 'File tidak ditemukan' });
      return;
    }

    if (!disbursementId) {
      res.status(400).json({ error: 'disbursementId wajib diisi' });
      return;
    }

    const disbursement = await prisma.disbursement.findUnique({
      where: { id: disbursementId }
    });

    if (!disbursement) {
      res.status(404).json({ error: 'Disbursement tidak ditemukan' });
      return;
    }

    const hashUpload = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    const hashTersimpan = disbursement.beritaAcaraHash;
    const cocok = hashUpload === hashTersimpan;

    res.json({
      cocok,
      hashUpload,
      hashTersimpan
    });
  } catch (error: any) {
    console.error('Error verifying hash:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
