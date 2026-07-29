import { Router, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

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

// GET /ledger/timeline
router.get('/timeline', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, aktor, nominalMin, nominalMax, hasIntervention } = req.query;

    const whereClause: any = {};
    
    if (search && typeof search === 'string') {
      whereClause.proposal = {
        ...whereClause.proposal,
        judulUsulan: {
          contains: search,
          mode: 'insensitive'
        }
      };
    }

    if (aktor && typeof aktor === 'string') {
      whereClause.OR = [
        { proposal: { kaurTeknis: { nama: { contains: aktor, mode: 'insensitive' } } } },
        { sekdesVerifier: { nama: { contains: aktor, mode: 'insensitive' } } },
        { kadesApprover: { nama: { contains: aktor, mode: 'insensitive' } } },
      ];
    }

    if (nominalMin !== undefined || nominalMax !== undefined) {
      whereClause.nominal = {};
      if (nominalMin && typeof nominalMin === 'string') {
        whereClause.nominal.gte = BigInt(nominalMin);
      }
      if (nominalMax && typeof nominalMax === 'string') {
        whereClause.nominal.lte = BigInt(nominalMax);
      }
    }

    if (hasIntervention === 'true') {
      whereClause.interventionLogs = {
        some: {}
      };
    }

    const disbursements = await prisma.disbursement.findMany({
      where: whereClause,
      include: {
        proposal: {
          select: {
            judulUsulan: true,
            dusun: true,
            kategori: true,
            kaurTeknis: {
              select: { nama: true }
            }
          }
        },
        sekdesVerifier: {
          select: { nama: true }
        },
        kadesApprover: {
          select: { nama: true }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    res.json(serialize(disbursements));
  } catch (error: any) {
    console.error('Error fetching ledger timeline:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET /ledger/timeline/:id
router.get('/timeline/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
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
        },
        sekdesVerifier: {
          select: { nama: true }
        },
        kadesApprover: {
          select: { nama: true }
        }
      }
    });

    if (!disbursement) {
      res.status(404).json({ error: 'Disbursement tidak ditemukan' });
      return;
    }

    // Menyesuaikan jumlah tahap dengan data timestamp yang benar-benar ada
    // 1. submittedAt (Pengajuan)
    // 2. verifiedAt (Verifikasi Sekdes)
    // 3. disbursedAt (Eksekusi)
    // Untuk aktor di Eksekusi, kita cantumkan Kades (otorisasi) dan sistem/bendahara (eksekusi)
    const timeline = [];

    timeline.push({
      tahap: 'Pengajuan',
      aktor: disbursement.proposal?.kaurTeknis?.nama || null,
      timestamp: disbursement.submittedAt
    });

    if (disbursement.verifiedAt || disbursement.sekdesVerifier) {
      timeline.push({
        tahap: 'Verifikasi Sekdes',
        aktor: disbursement.sekdesVerifier?.nama || null,
        timestamp: disbursement.verifiedAt || null
      });
    }

    if (disbursement.kadesApprover) {
      timeline.push({
        tahap: 'Otorisasi Kades',
        aktor: disbursement.kadesApprover?.nama || null,
        timestamp: (disbursement as any).authorizedAt || null // Menggunakan field authorizedAt yang baru
      });
    }

    if (disbursement.disbursedAt || disbursement.status === 'DISBURSED') {
      timeline.push({
        tahap: 'Eksekusi',
        aktor: null, // Tidak ada relasi khusus eksekutor di model
        timestamp: disbursement.disbursedAt || null
      });
    }

    const detail = {
      ...disbursement,
      timeline
    };

    res.json(serialize(detail));
  } catch (error: any) {
    console.error('Error fetching disbursement detail:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
