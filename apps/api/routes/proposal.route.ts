import { Router, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Helper to serialize BigInt since JSON.stringify doesn't support it natively
function serialize(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
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

    const proposal = await prisma.proposal.create({
      data: {
        dusun,
        judulUsulan,
        kategori,
        volume: Number(volume),
        satuan,
        paguMaksimal: BigInt(paguMaksimal),
        dokumenHash,
        fileUrls: [], // Provide empty array as dummy
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
        }
      }
    });
    
    res.json(serialize(proposals));
  } catch (error: any) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
