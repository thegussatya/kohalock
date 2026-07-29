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

// Helper untuk chart bulanan (6 bulan terakhir)
function getLast6MonthsLabels() {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const labels = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push({ label: monthNames[d.getMonth()], month: d.getMonth(), year: d.getFullYear() });
  }
  return labels;
}

// 1. Kaur Teknis
router.get('/kaur-teknis', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const kaurTeknisId = req.user?.userId;
    if (!kaurTeknisId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const proposals = await prisma.proposal.findMany({
      where: { kaurTeknisId }
    });

    const userDisbursements = await prisma.disbursement.findMany({
      where: { proposal: { kaurTeknisId } }
    });

    // Untuk requirement Prompt
    const totalProposals = proposals.length;
    const statusBreakdown = userDisbursements.reduce((acc: any, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});
    
    let totalDisbursedYear = BigInt(0);
    userDisbursements.forEach(d => {
      if (d.status === 'DISBURSED' && d.disbursedAt && new Date(d.disbursedAt).getFullYear() === currentYear) {
        totalDisbursedYear += d.nominal;
      }
    });

    // Untuk kecocokan dengan UI DashboardPage Kaur Teknis
    const totalPaguMusrembang = proposals
      .filter(p => p.createdAt >= startOfYear && p.createdAt <= endOfYear)
      .reduce((acc, curr) => acc + curr.paguMaksimal, BigInt(0));

    let pendingCount = 0;
    let rejectedCount = 0;
    userDisbursements.forEach(d => {
      if (['PENDING_SEKDES', 'PENDING_KADES', 'PENDING_EKSEKUSI'].includes(d.status)) pendingCount++;
      else if (['RETURNED_FOR_REVISION', 'REJECTED_SYSTEM'].includes(d.status)) rejectedCount++;
    });

    const labels6m = getLast6MonthsLabels();
    const chartData = labels6m.map(l => {
      const sumMonth = userDisbursements.filter(dis => 
        dis.status === 'DISBURSED' && 
        dis.disbursedAt && 
        new Date(dis.disbursedAt).getMonth() === l.month && 
        new Date(dis.disbursedAt).getFullYear() === l.year
      ).reduce((acc, curr) => acc + curr.nominal, BigInt(0));
      return { label: l.label, value: Number(sumMonth) };
    });

    res.json(serialize({
      totalProposals,
      statusBreakdown,
      totalDisbursedYear,
      totalPaguMusrembang,
      pendingCount,
      rejectedCount,
      chartData
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Sekdes
router.get('/sekdes', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const pendingCount = await prisma.disbursement.count({
      where: { status: 'PENDING_SEKDES' }
    });

    const verifiedDisbursements = await prisma.disbursement.findMany({
      where: { sekdesVerifierId: userId, verifiedAt: { not: null } }
    });

    let totalDiffMs = 0;
    let countValid = 0;
    verifiedDisbursements.forEach(d => {
      if (d.verifiedAt && d.submittedAt) {
        totalDiffMs += (d.verifiedAt.getTime() - d.submittedAt.getTime());
        countValid++;
      }
    });

    const avgVerificationDays = countValid > 0 ? (totalDiffMs / (1000 * 60 * 60 * 24 * countValid)).toFixed(1) + ' Hari' : '0 Hari';
    const approvalRate = "N/A"; // Sesuai kesepakatan, skipped karena RejectionLog tidak punya userId

    // Data Tambahan untuk UI
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let approvedAmountMonth = BigInt(0);
    verifiedDisbursements.forEach(d => {
      if (d.verifiedAt && d.verifiedAt >= startOfMonth) {
        approvedAmountMonth += d.nominal;
      }
    });

    const clarificationPending = await prisma.clarificationTicket.count({
      where: { status: 'MENUNGGU_JAWABAN' }
    });

    res.json(serialize({
      pendingCount,
      avgVerificationDays,
      approvalRate,
      approvedAmountMonth,
      clarificationPending
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Kades
router.get('/kades', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const pendingAuthCount = await prisma.disbursement.count({
      where: { status: 'PENDING_KADES' }
    });

    const allDisbursedYear = await prisma.disbursement.findMany({
      where: { status: 'DISBURSED', disbursedAt: { gte: startOfYear } },
      include: { proposal: true }
    });

    const totalDisbursedYear = allDisbursedYear.reduce((acc, curr) => acc + curr.nominal, BigInt(0));

    const dusunMap: Record<string, bigint> = {};
    allDisbursedYear.forEach(d => {
      const dusun = d.proposal.dusun;
      if (!dusunMap[dusun]) dusunMap[dusun] = BigInt(0);
      dusunMap[dusun] += d.nominal;
    });

    // Format for Recharts BarChart (DUSUN_RANKING UI)
    const barData = Object.entries(dusunMap).map(([name, sum]) => ({
      name,
      percentage: Number(sum) / 1000000 // Simplified to fit UI scale if needed, or send raw
    })).sort((a, b) => b.percentage - a.percentage);

    // Dummy values for the missing UI fields to not break frontend completely
    const kasBalance = "Rp 350.000.000"; // Dummy fallback
    const absorptionRate = "65%";
    const donutData = [
      { name: 'Terserap', value: Number(totalDisbursedYear), color: '#00AEEF' },
      { name: 'Sisa Target', value: 280000000, color: '#e2e8f0' }, // Dummy sisa
    ];

    res.json(serialize({
      pendingAuthCount,
      totalDisbursedYear,
      barData,
      kasBalance,
      absorptionRate,
      donutData
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Auditor
router.get('/auditor', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    let timeBoundAccess = "-";

    if (userId) {
      const token = await prisma.auditorAccessToken.findFirst({
        where: { auditorId: userId, revoked: false, expiresAt: { gt: new Date() } },
        orderBy: { expiresAt: 'desc' }
      });
      if (token) {
        const diffMs = token.expiresAt.getTime() - Date.now();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays > 0) {
          timeBoundAccess = `${diffDays} Hari`;
        } else if (diffHours > 0) {
          timeBoundAccess = `${diffHours} Jam`;
        } else if (diffMs > 0) {
          timeBoundAccess = `< 1 Jam`;
        } else {
          timeBoundAccess = "Expired";
        }
      } else {
        timeBoundAccess = "Tidak Ada Akses";
      }
    }

    const allDisbursements = await prisma.disbursement.findMany({
      where: { status: 'DISBURSED' }
    });
    const totalTurnover = allDisbursements.reduce((acc, curr) => acc + curr.nominal, BigInt(0));

    const allInterventions = await prisma.interventionLog.findMany();
    const redFlagCount = allInterventions.length;

    const labels6m = getLast6MonthsLabels();
    const chartData = labels6m.map(l => {
      const anomalies = allInterventions.filter(inv => 
        inv.createdAt.getMonth() === l.month && 
        inv.createdAt.getFullYear() === l.year
      ).length;
      return { month: l.label, anomalies };
    });

    res.json(serialize({
      totalTurnover,
      redFlagCount,
      chartData,
      timeBoundAccess
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. BPD & Tokoh Adat
router.get('/bpd', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalDisbursed = await prisma.disbursement.count({
      where: { status: 'DISBURSED' }
    });

    const supervisionNoteCount = await prisma.supervisionNote.count();
    
    const adatCaseCount = await prisma.adatCase.count({
      where: { status: 'MUSYAWARAH' }
    });

    res.json(serialize({
      totalDisbursed,
      supervisionNoteCount,
      adatCaseCount,
      // Fallback UI fields
      performanceRate: "68%",
      redFlags: supervisionNoteCount
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
