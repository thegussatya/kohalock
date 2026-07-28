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

router.get('/kaur-teknis', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const kaurTeknisId = req.user?.userId;
    if (!kaurTeknisId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // 1. Total Pagu Musrembang Tahun Ini
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const proposals = await prisma.proposal.findMany({
      where: {
        kaurTeknisId,
        createdAt: {
          gte: startOfYear,
          lte: endOfYear
        }
      }
    });

    const totalPagu = proposals.reduce((acc, curr) => acc + curr.paguMaksimal, BigInt(0));

    // 2. Pending & Rejected Disbursements
    const userDisbursements = await prisma.disbursement.findMany({
      where: {
        proposal: {
          kaurTeknisId
        }
      },
      select: {
        status: true,
        nominal: true,
        disbursedAt: true
      }
    });

    let pendingCount = 0;
    let rejectedCount = 0;

    userDisbursements.forEach(d => {
      if (['PENDING_SEKDES', 'PENDING_KADES', 'PENDING_EKSEKUSI'].includes(d.status)) {
        pendingCount++;
      } else if (['RETURNED_FOR_REVISION', 'REJECTED_SYSTEM'].includes(d.status)) {
        rejectedCount++;
      }
    });

    // 3. Chart Data (Last 6 Months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const chartData = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = monthNames[d.getMonth()];
      
      const disbursementsInMonth = userDisbursements.filter(dis => {
        if (dis.status !== 'DISBURSED' || !dis.disbursedAt) return false;
        const disDate = new Date(dis.disbursedAt);
        return disDate.getMonth() === d.getMonth() && disDate.getFullYear() === d.getFullYear();
      });
      
      const sumMonth = disbursementsInMonth.reduce((acc, curr) => acc + curr.nominal, BigInt(0));
      
      chartData.push({
        label: monthLabel,
        value: Number(sumMonth)
      });
    }

    res.json(serialize({
      totalPaguMusrembang: totalPagu,
      pendingCount,
      rejectedCount,
      chartData
    }));
  } catch (error: any) {
    console.error('Error fetching kaur teknis dashboard:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
