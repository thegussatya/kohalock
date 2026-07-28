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

// GET /api/reports/realization
router.get('/realization', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bulan, tahun } = req.query;

    let b = bulan ? parseInt(bulan as string, 10) : undefined;
    let t = tahun ? parseInt(tahun as string, 10) : undefined;

    let disbursementWhere: any = { status: 'DISBURSED' };
    let proposalWhere: any = {};
    let taxWhere: any = {};
    let cashWhere: any = {};
    
    if (b && t) {
      const startDate = new Date(t, b - 1, 1);
      const endDate = new Date(t, b, 0, 23, 59, 59, 999);
      disbursementWhere.disbursedAt = { gte: startDate, lte: endDate };
      proposalWhere.createdAt = { gte: startDate, lte: endDate };
      taxWhere.bulan = b;
      taxWhere.tahun = t;
      cashWhere.bulan = b;
      cashWhere.tahun = t;
    } else if (t) {
      const startDate = new Date(t, 0, 1);
      const endDate = new Date(t, 11, 31, 23, 59, 59, 999);
      disbursementWhere.disbursedAt = { gte: startDate, lte: endDate };
      proposalWhere.createdAt = { gte: startDate, lte: endDate };
      taxWhere.tahun = t;
      cashWhere.tahun = t;
    }

    // 1. Total Pagu (dari semua Proposal)
    const proposals = await prisma.proposal.findMany({
      where: proposalWhere,
      select: { paguMaksimal: true, dusun: true, kategori: true }
    });
    const totalPagu = proposals.reduce((acc, p) => acc + p.paguMaksimal, 0n);

    // 2. Total Realisasi (dari Disbursement) & Breakdown per Dusun/Kategori
    const disbursements = await prisma.disbursement.findMany({
      where: disbursementWhere,
      include: { proposal: true }
    });
    const totalRealisasi = disbursements.reduce((acc, d) => acc + d.nominal, 0n);
    const sisaPagu = totalPagu - totalRealisasi;

    const breakdownDusun: Record<string, bigint> = {};
    const breakdownKategori: Record<string, bigint> = {};

    disbursements.forEach(d => {
      const dusun = d.proposal.dusun;
      const kategori = d.proposal.kategori;
      breakdownDusun[dusun] = (breakdownDusun[dusun] || 0n) + d.nominal;
      breakdownKategori[kategori] = (breakdownKategori[kategori] || 0n) + d.nominal;
    });

    // 3. Breakdown Pajak (TaxBookEntry)
    const pajakGroups = await prisma.taxBookEntry.groupBy({
      by: ['statusSetor'],
      where: taxWhere,
      _sum: { nominal: true }
    });

    let pajakSudahSetor = 0n;
    let pajakBelumSetor = 0n;

    pajakGroups.forEach(g => {
      if (g.statusSetor === 'SUDAH_SETOR') {
        pajakSudahSetor += BigInt(g._sum.nominal || 0);
      } else {
        pajakBelumSetor += BigInt(g._sum.nominal || 0);
      }
    });

    // 4. CashBookEntry summary
    const cashStats = await prisma.cashBookEntry.aggregate({
      where: cashWhere,
      _sum: {
        penerimaan: true,
        pengeluaran: true
      }
    });

    const breakdownDusunObj = Object.fromEntries(
      Object.entries(breakdownDusun).map(([k, v]) => [k, v.toString()])
    );
    const breakdownKategoriObj = Object.fromEntries(
      Object.entries(breakdownKategori).map(([k, v]) => [k, v.toString()])
    );

    res.json({
      totalPagu: totalPagu.toString(),
      totalRealisasi: totalRealisasi.toString(),
      sisaPagu: sisaPagu.toString(),
      breakdownDusun: breakdownDusunObj,
      breakdownKategori: breakdownKategoriObj,
      pajak: {
        sudahSetor: pajakSudahSetor.toString(),
        belumSetor: pajakBelumSetor.toString()
      },
      bukuKas: {
        totalPenerimaan: (cashStats._sum.penerimaan || 0n).toString(),
        totalPengeluaran: (cashStats._sum.pengeluaran || 0n).toString(),
      }
    });
  } catch (error: any) {
    console.error('Error fetching realization report:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
