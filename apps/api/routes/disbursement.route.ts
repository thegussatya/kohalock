import { Router, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { createNotification } from '../lib/notify';
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

    res.status(201).json(serialize(disbursement));
  } catch (error: any) {
    console.error('Error creating disbursement:', error);
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
      const kadesUser = await prisma.user.findFirst({ where: { role: 'kades' } });
      if (kadesUser) {
        await createNotification(prisma, kadesUser.id, "Pengajuan Baru Menunggu Otorisasi", `Pengajuan ${updated.proposal?.judulUsulan} menunggu otorisasi Anda`);
        console.log(`[Notification] Berhasil mengirim notifikasi ke Kades (ID: ${kadesUser.id})`);
      }
    } catch (notifErr) {
      console.error('[Notification] Gagal mengirim notifikasi ke Kades:', notifErr);
    }

    res.json(serialize(updated));
  } catch (error: any) {
    console.error('Error verifying disbursement:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /disbursements/:id/return-revision
router.post('/:id/return-revision', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { catatan } = req.body;

    const updated = await prisma.disbursement.update({
      where: { id },
      data: {
        status: 'RETURNED_FOR_REVISION',
        catatanRevisi: catatan
      }
    });

    res.json(serialize(updated));
  } catch (error: any) {
    console.error('Error returning disbursement for revision:', error);
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
      const kaurKeuanganUser = await prisma.user.findFirst({ where: { role: 'kaur-keuangan' } });
      if (kaurKeuanganUser) {
        await createNotification(prisma, kaurKeuanganUser.id, "Transaksi Baru di Antrean Eksekusi", `Proposal: ${updated.proposal?.judulUsulan}`);
        console.log(`[Notification] Berhasil mengirim notifikasi ke Kaur Keuangan (ID: ${kaurKeuanganUser.id})`);
      }
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

            const newTax = await (tx as any).taxBookEntry.create({
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

export default router;
