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

// GET /api/reports/apbdes
router.get('/apbdes', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tahun } = req.query;
    const t = tahun ? parseInt(tahun as string, 10) : new Date().getFullYear();

    // 1. Pendapatan
    const incomes = await prisma.villageIncomeEntry.findMany({
      where: { tahun: t }
    });
    
    // Group pendapatan
    const pendapatan: any = {};
    let totalPendapatan = 0n;
    incomes.forEach(inc => {
       if (!pendapatan[inc.kelompok]) pendapatan[inc.kelompok] = {};
       if (!pendapatan[inc.kelompok][inc.jenis]) pendapatan[inc.kelompok][inc.jenis] = 0n;
       pendapatan[inc.kelompok][inc.jenis] += inc.nominal;
       totalPendapatan += inc.nominal;
    });

    // 2. Belanja (Realisasi dari LpjItem)
    const lpjItems = await prisma.lpjItem.findMany({
      where: {
         disbursement: {
            disbursedAt: {
               gte: new Date(t, 0, 1),
               lte: new Date(t, 11, 31, 23, 59, 59, 999)
            }
         }
      },
      include: {
         disbursement: {
            include: { proposal: true }
         }
      }
    });

    const belanja: any = {
      "Bidang Penyelenggaraan Pemerintahan Desa": { anggaran: 0n, realisasi: 0n, rincian: {} },
      "Bidang Pelaksanaan Pembangunan Desa": { anggaran: 0n, realisasi: 0n, rincian: {} },
      "Bidang Pembinaan Kemasyarakatan": { anggaran: 0n, realisasi: 0n, rincian: {} },
      "Bidang Pemberdayaan Masyarakat": { anggaran: 0n, realisasi: 0n, rincian: {} },
      "Bidang Tak Terduga": { anggaran: 0n, realisasi: 0n, rincian: {} }
    };
    
    let totalBelanjaAnggaran = 0n;
    let totalBelanjaRealisasi = 0n;

    // First loop Proposals to get Anggaran
    const proposals = await prisma.proposal.findMany({
      where: {
        createdAt: {
          gte: new Date(t, 0, 1),
          lte: new Date(t, 11, 31, 23, 59, 59, 999)
        }
      }
    });

    proposals.forEach(p => {
       // Mapping simplified
       let bidangName = "Bidang Pelaksanaan Pembangunan Desa";
       if (p.kategori.toLowerCase().includes("pemerintahan") || p.kategori.toLowerCase().includes("atk")) bidangName = "Bidang Penyelenggaraan Pemerintahan Desa";
       if (p.kategori.toLowerCase().includes("pembinaan")) bidangName = "Bidang Pembinaan Kemasyarakatan";
       if (p.kategori.toLowerCase().includes("pemberdayaan")) bidangName = "Bidang Pemberdayaan Masyarakat";
       if (p.kategori.toLowerCase().includes("darurat") || p.kategori.toLowerCase().includes("bencana")) bidangName = "Bidang Tak Terduga";

       if (!belanja[bidangName].rincian[p.judulUsulan]) {
         belanja[bidangName].rincian[p.judulUsulan] = { anggaran: p.paguMaksimal, realisasi: 0n };
       } else {
         belanja[bidangName].rincian[p.judulUsulan].anggaran += p.paguMaksimal;
       }
       belanja[bidangName].anggaran += p.paguMaksimal;
       totalBelanjaAnggaran += p.paguMaksimal;
    });

    lpjItems.forEach(item => {
       const p = item.disbursement.proposal;
       let bidangName = "Bidang Pelaksanaan Pembangunan Desa";
       if (p.kategori.toLowerCase().includes("pemerintahan") || p.kategori.toLowerCase().includes("atk")) bidangName = "Bidang Penyelenggaraan Pemerintahan Desa";
       if (p.kategori.toLowerCase().includes("pembinaan")) bidangName = "Bidang Pembinaan Kemasyarakatan";
       if (p.kategori.toLowerCase().includes("pemberdayaan")) bidangName = "Bidang Pemberdayaan Masyarakat";
       if (p.kategori.toLowerCase().includes("darurat") || p.kategori.toLowerCase().includes("bencana")) bidangName = "Bidang Tak Terduga";

       if (!belanja[bidangName].rincian[p.judulUsulan]) {
         belanja[bidangName].rincian[p.judulUsulan] = { anggaran: p.paguMaksimal, realisasi: 0n };
         belanja[bidangName].anggaran += p.paguMaksimal;
         totalBelanjaAnggaran += p.paguMaksimal;
       }
       
       belanja[bidangName].realisasi += item.totalHarga;
       belanja[bidangName].rincian[p.judulUsulan].realisasi += item.totalHarga;
       totalBelanjaRealisasi += item.totalHarga;
    });

    res.json(serialize({
      tahun: t,
      totalPendapatanAnggaran: totalPendapatan, // Assuming anggaran = realisasi for pendapatan in this mock
      totalPendapatanRealisasi: totalPendapatan,
      pendapatan,
      totalBelanjaAnggaran,
      totalBelanjaRealisasi,
      belanja,
      surplusDefisitAnggaran: totalPendapatan - totalBelanjaAnggaran,
      surplusDefisitRealisasi: totalPendapatan - totalBelanjaRealisasi
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/lpj-details
router.get('/lpj-details', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tahun } = req.query;
    const t = tahun ? parseInt(tahun as string, 10) : new Date().getFullYear();

    const lpjItems = await prisma.lpjItem.findMany({
      where: {
        disbursement: {
           disbursedAt: {
             gte: new Date(t, 0, 1),
             lte: new Date(t, 11, 31, 23, 59, 59, 999)
           }
        }
      },
      include: {
        disbursement: {
          include: { proposal: true }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json(serialize(lpjItems));
  } catch (error: any) {
    console.error('Error fetching LPJ details:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
