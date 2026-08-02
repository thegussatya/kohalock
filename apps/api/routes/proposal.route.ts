import { Router, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();
import multer from 'multer';
import path from 'path';

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

router.post('/', authenticate, upload.fields([{ name: 'formulirMusrembang', maxCount: 1 }, { name: 'rab', maxCount: 1 }]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      dusun,
      judulUsulan,
      kategori,
      volume,
      satuan,
      paguMaksimal,
      dokumenHash = 'dummy-hash'
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const formulirMusrembangUrl = files?.['formulirMusrembang']?.[0] ? `/uploads/${files['formulirMusrembang'][0].filename}` : null;
    const rabUrl = files?.['rab']?.[0] ? `/uploads/${files['rab'][0].filename}` : null;

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
        onChainId: Math.floor(Math.random() * 1000000) // Dummy unique integer
      }
    });

    res.status(201).json(serialize(proposal));
  } catch (error: any) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
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

export default router;
