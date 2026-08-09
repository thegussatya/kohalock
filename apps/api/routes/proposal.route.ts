import { Router, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { executeAsUser } from '../src/services/signer.service';
import { id as ethersId, Interface } from 'ethers';
import * as DanaDesaLedger from '../src/config/DanaDesaLedger.json';

const router = Router();
const prisma = new PrismaClient();
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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

// Helper to serialize BigInt since JSON.stringify doesn't support it natively
function serialize(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

router.post('/', authenticate, upload.fields([{ name: 'formulirMusrembang', maxCount: 1 }, { name: 'rab', maxCount: 1 }]), async (req: AuthRequest, res: Response) => {
  try {
    const {
      dusun,
      judulUsulan,
      kategori,
      volume,
      satuan,
      paguMaksimal,
      dokumenHash = 'dummy-hash',
      pin
    } = req.body;

    if (!pin) {
      return res.status(400).json({ message: 'PIN otorisasi wajib diisi' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const formulirMusrembangUrl = files?.['formulirMusrembang']?.[0] ? `/uploads/${files['formulirMusrembang'][0].filename}` : null;
    const rabUrl = files?.['rab']?.[0] ? `/uploads/${files['rab'][0].filename}` : null;

    // 1. Panggil Smart Contract
    const bytes32Hash = dokumenHash.startsWith('0x') && dokumenHash.length === 66 ? dokumenHash : ethersId(dokumenHash);
    let receipt;
    try {
      receipt = await executeAsUser(req.user.userId, pin, 'registerProposal', [
        dusun,
        kategori,
        paguMaksimal, // passes string, ethers handles converting to uint256
        bytes32Hash
      ]);
    } catch (err: any) {
      console.error('Smart contract error:', err);
      return res.status(400).json({ message: 'Gagal mencatat ke blockchain. Periksa PIN atau koneksi.', error: err.message });
    }

    // Ekstrak proposalId dari event ProposalRegistered jika ada
    let onChainId = Math.floor(Math.random() * 1000000); // fallback
    if (receipt) {
       const iface = new Interface((DanaDesaLedger as any).abi || DanaDesaLedger.abi);
       for (const log of receipt.logs) {
         try {
           const parsed = iface.parseLog({ topics: [...log.topics], data: log.data });
           if (parsed?.name === 'ProposalRegistered') {
             onChainId = Number(parsed.args[0]); // args.proposalId or args[0]
           }
         } catch (e) {}
       }
    }

    const proposal = await prisma.proposal.create({
      data: {
        dusun,
        judulUsulan,
        kategori,
        volume: Number(volume),
        satuan,
        paguMaksimal: BigInt(paguMaksimal),
        dokumenHash,
        fileUrls: { formulirMusrembangUrl, rabUrl },
        kaurTeknisId: req.user.userId,
        onChainId: onChainId
      }
    });

    res.status(201).json(serialize(proposal));
  } catch (error: any) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const proposals = await prisma.proposal.findMany({
      include: {
        kaurTeknis: {
          select: {
            nama: true
          }
        },
        disbursements: {
          where: {
            status: {
              notIn: ['REJECTED_SYSTEM', 'RETURNED_FOR_REVISION']
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Hitung realisasi dan sisa pagu per proposal
    const formattedProposals = proposals.map((p) => {
      const terpakai = p.disbursements.reduce((acc, curr) => acc + curr.nominal, BigInt(0));
      return {
        ...p,
        realisasi: terpakai,
        sisaPagu: p.paguMaksimal - terpakai
      };
    });

    res.json(serialize(formattedProposals));
  } catch (error: any) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /api/proposals/:id/lpj-keuangan (Kaur Keuangan)
router.post('/:id/lpj-keuangan', authenticate, upload.single('lpjKeuangan'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { pin } = req.body;
    const file = req.file;

    if (!pin) {
      res.status(400).json({ error: 'PIN diperlukan' });
      return;
    }
    if (!file) {
      res.status(400).json({ error: 'Dokumen LPJ Keuangan diperlukan' });
      return;
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id }
    });

    if (!proposal) {
      res.status(404).json({ error: 'Proposal tidak ditemukan' });
      return;
    }

    const fileUrl = `/uploads/${file.filename}`;
    
    // Hash file content
    const fileBuffer = fs.readFileSync(file.path);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const lpjHash = '0x' + hashSum.digest('hex');

    // Execute Smart Contract
    await executeAsUser(req.user.userId, pin, 'submitLpjKeuangan', [proposal.onChainId, lpjHash]);

    // Update DB
    const updated = await prisma.proposal.update({
      where: { id },
      data: {
        lpjKeuanganUrl: fileUrl,
        lpjKeuanganHash: lpjHash,
        tanggalLpjKeuangan: new Date()
      }
    });

    res.json({ message: 'LPJ Keuangan berhasil disubmit ke blockchain', proposal: serialize(updated) });
  } catch (error: any) {
    console.error('Error submitting LPJ Keuangan:', error);
    res.status(500).json({ error: error.message || 'Gagal submit LPJ Keuangan' });
  }
});

export default router;
