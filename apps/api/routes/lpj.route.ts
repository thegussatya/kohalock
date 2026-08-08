import { Router, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import { executeContractTx } from '../src/services/signer.service';
import crypto from 'crypto';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

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

// POST /api/lpj/desa
router.post('/desa', authenticate, upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('--- POST /desa ---');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    const { tahun, semester, pin } = req.body;
    
    if (!tahun || semester === undefined || !req.file) {
      res.status(400).json({ error: 'Tahun, semester, dan file wajib diisi' });
      return;
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const lpjHashHex = '0x' + crypto.createHash('sha256').update(fileUrl + Date.now().toString()).digest('hex');

    // Hardhat Account #3 is Kades
    const privateKey = '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97'; 
    // MOCK Smart Contract Call
    await new Promise(resolve => setTimeout(resolve, 1500));
    const dummyTxHash = '0x' + crypto.randomBytes(32).toString('hex');

    await prisma.laporanRealisasiDesa.create({
      data: {
        tahun: Number(tahun),
        semester: Number(semester),
        dokumenUrl: fileUrl,
        dokumenHash: lpjHashHex,
        kadesId: req.user!.userId
      }
    });

    res.status(200).json({
      message: 'LPJ Desa berhasil dikunci (Mocked)',
      txHash: dummyTxHash,
      lpjHash: lpjHashHex
    });
  } catch (error: any) {
    console.error('Error submitting LPJ Desa:', error);
    res.status(500).json({ error: 'Gagal mengunci LPJ Desa: ' + error.message });
  }
});

// POST /api/lpj/:disbursementId
router.post('/:disbursementId', authenticate, upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const disbursementId = req.params.disbursementId as string;
    let items = [];
    try {
      items = JSON.parse(req.body.items);
    } catch (e) {
      // In case they didn't send form data (fallback)
      items = req.body.items;
    }

    if (!Array.isArray(items)) {
       res.status(400).json({ error: 'Data items tidak valid' });
       return;
    }

    const disbursement = await prisma.disbursement.findUnique({
      where: { id: disbursementId }
    });

    if (!disbursement) {
       res.status(404).json({ error: 'Disbursement tidak ditemukan' });
       return;
    }

    // Hitung total LPJ
    let totalLpj = BigInt(0);
    const lpjData = items.map((item: any) => {
      const harga = BigInt(item.hargaSatuan || 0);
      const total = harga * BigInt(Math.round(item.volume || 1));
      totalLpj += total;
      
      return {
        disbursementId,
        uraian: item.uraian,
        volume: Number(item.volume),
        satuan: item.satuan,
        hargaSatuan: harga,
        totalHarga: total
      };
    });

    if (totalLpj > disbursement.nominal) {
      res.status(400).json({ error: 'Total LPJ melebihi nominal pencairan' });
      return;
    }

    // Simpan LPJ items
    await prisma.$transaction([
      // Hapus yang lama jika ada (agar bisa diupdate)
      prisma.lpjItem.deleteMany({ where: { disbursementId } }),
      // Insert yang baru
      prisma.lpjItem.createMany({ data: lpjData })
    ]);

    if (req.file) {
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      await prisma.disbursement.update({
        where: { id: disbursementId },
        data: { lpjTeknisUrl: fileUrl }
      });
    }

    res.status(200).json({ message: 'LPJ draft berhasil disimpan' });
  } catch (error: any) {
    console.error('Error saving LPJ:', error);
    res.status(500).json({ error: 'Gagal menyimpan data LPJ' });
  }
});

// POST /api/lpj/:disbursementId/lock
router.post('/:disbursementId/lock', authenticate, upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const disbursementId = req.params.disbursementId as string;
    let items = [];
    try {
      items = JSON.parse(req.body.items);
    } catch (e) {
      items = req.body.items;
    }

    if (!Array.isArray(items)) {
       res.status(400).json({ error: 'Data items tidak valid' });
       return;
    }

    const disbursement = await prisma.disbursement.findUnique({
      where: { id: disbursementId }
    });

    if (!disbursement) {
       res.status(404).json({ error: 'Disbursement tidak ditemukan' });
       return;
    }

    if (disbursement.lpjStatus === 'LOCKED_ONCHAIN') {
       res.status(400).json({ error: 'LPJ sudah dikunci secara permanen di blockchain' });
       return;
    }

    // Hitung total LPJ
    let totalLpj = BigInt(0);
    const lpjData = items.map((item: any) => {
      const harga = BigInt(item.hargaSatuan || 0);
      const total = harga * BigInt(Math.round(item.volume || 1));
      totalLpj += total;
      
      return {
        disbursementId,
        uraian: item.uraian,
        volume: Number(item.volume),
        satuan: item.satuan,
        hargaSatuan: harga,
        totalHarga: total
      };
    });

    if (totalLpj > disbursement.nominal) {
      res.status(400).json({ error: 'Total LPJ melebihi nominal pencairan' });
      return;
    }

    // Simpan LPJ items dulu
    await prisma.$transaction([
      prisma.lpjItem.deleteMany({ where: { disbursementId } }),
      prisma.lpjItem.createMany({ data: lpjData })
    ]);

    let fileUrl = disbursement.lpjTeknisUrl;
    if (req.file) {
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      await prisma.disbursement.update({
        where: { id: disbursementId },
        data: { lpjTeknisUrl: fileUrl }
      });
    }

    // --- BLOCKCHAIN INTEGRATION ---
    // Create Hash of LPJ Data
    const payloadToHash = {
      disbursementId,
      items: lpjData.map(d => ({...d, hargaSatuan: d.hargaSatuan.toString(), totalHarga: d.totalHarga.toString()})),
      totalLpj: totalLpj.toString(),
      fileUrl
    };
    const lpjHashHex = '0x' + crypto.createHash('sha256').update(JSON.stringify(payloadToHash)).digest('hex');

    // Default mock PIN/Private Key mapping for testing
    // In real scenario, use decrypt logic like in disbursement.route.ts
    const userPin = req.body.pin || '123456'; 
    const mockPrivateKeyMap: Record<string, string> = {
      '123456': '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    };
    const privateKey = mockPrivateKeyMap[userPin] || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Default Hardhat Account #0

    try {
      // MOCK Smart Contract Call (Backend Sederhana)
      await new Promise(resolve => setTimeout(resolve, 1500));
      const dummyTxHash = '0x' + crypto.randomBytes(32).toString('hex');

      // Save to database as LOCKED
      await prisma.disbursement.update({
        where: { id: disbursementId },
        data: {
          lpjStatus: 'LOCKED_ONCHAIN',
          lpjTxHash: dummyTxHash,
          lpjTeknisHash: lpjHashHex // Simpan hash teknis
        }
      });

      res.status(200).json({ 
        message: 'LPJ berhasil dikunci (Mocked)',
        txHash: dummyTxHash,
        lpjHash: lpjHashHex 
      });
    } catch (blockchainError: any) {
      console.error('Blockchain error:', blockchainError);
      res.status(500).json({ error: 'Gagal mengunci LPJ ke Smart Contract: ' + blockchainError.message });
    }
  } catch (error: any) {
    console.error('Error locking LPJ:', error);
    res.status(500).json({ error: 'Gagal mengunci data LPJ' });
  }
});

// GET /api/lpj/:disbursementId
router.get('/:disbursementId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const disbursementId = req.params.disbursementId as string;
    const items = await prisma.lpjItem.findMany({
      where: { disbursementId }
    });
    
    const disbursement = await prisma.disbursement.findUnique({
      where: { id: disbursementId },
      select: { lpjStatus: true, lpjTxHash: true }
    });

    res.status(200).json(serialize({
      items,
      status: disbursement?.lpjStatus || 'DRAFT',
      txHash: disbursement?.lpjTxHash || null
    }));
  } catch (error: any) {
    console.error('Error fetching LPJ:', error);
    res.status(500).json({ error: 'Gagal mengambil data LPJ' });
  }
});

// POST /api/lpj/keuangan/:proposalId
router.post('/keuangan/:proposalId', authenticate, upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('--- POST /keuangan ---');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    const proposalId = req.params.proposalId as string;
    
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId }
    });

    if (!proposal) {
      res.status(404).json({ error: 'Proposal tidak ditemukan' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'File LPJ Keuangan wajib diunggah' });
      return;
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    // Hash file content or URL. For simplicity in this demo, hash the URL + timestamp
    const lpjHashHex = '0x' + crypto.createHash('sha256').update(fileUrl + Date.now().toString()).digest('hex');

    const userPin = req.body.pin || '123456';
    // Hardhat Account #4 is Kaur Keuangan in standard test setup, but let's just use a mock key
    const privateKey = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'; // Account #4 private key
    // MOCK Smart Contract Call
    await new Promise(resolve => setTimeout(resolve, 1500));
    const dummyTxHash = '0x' + crypto.randomBytes(32).toString('hex');

    await prisma.proposal.update({
      where: { id: proposalId },
      data: {
        lpjKeuanganUrl: fileUrl,
        lpjKeuanganHash: lpjHashHex,
        tanggalLpjKeuangan: new Date()
      }
    });

    res.status(200).json({
      message: 'LPJ Keuangan berhasil dikunci (Mocked)',
      txHash: dummyTxHash,
      lpjHash: lpjHashHex
    });
  } catch (error: any) {
    console.error('Error submitting LPJ Keuangan:', error);
    res.status(500).json({ error: 'Gagal mengunci LPJ Keuangan: ' + error.message });
  }
});

export default router;
