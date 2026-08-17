import React, { useState, useEffect } from 'react';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import { KAUR_KEUANGAN_MENU } from './menu';
import apiClient from '../../lib/apiClient';
import { Printer, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LaporanKeuanganPage() {
  const [apbdes, setApbdes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    apiClient.get(`/reports/apbdes?tahun=${currentYear}`)
      .then(res => {
        setApbdes(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [currentYear]);

  if (loading) {
    return (
      <RoleLayout menuItems={KAUR_KEUANGAN_MENU} userName="Hastuti" userRole="Kaur Keuangan">
        <div className="py-16 text-center text-slate-500 font-bold animate-pulse">Memuat Laporan Keuangan...</div>
      </RoleLayout>
    );
  }

  const exportToExcel = () => {
    let csvContent = "KODE REKENING,URAIAN,ANGGARAN (Rp.),REALISASI (Rp.),LEBIH/ KURANG (Rp.),KET.\n";
    
    // 1. Pendapatan
    csvContent += `1,PENDAPATAN,${apbdes?.totalPendapatanAnggaran || 0},${apbdes?.totalPendapatanRealisasi || 0},${BigInt(apbdes?.totalPendapatanAnggaran || 0) - BigInt(apbdes?.totalPendapatanRealisasi || 0)},\n`;
    if (apbdes?.pendapatan) {
      Object.entries(apbdes.pendapatan).forEach(([kelompok, jenisObj]: [string, any], idx1) => {
        csvContent += `1.${idx1+1},${kelompok.replace(/,/g, ' ')},-,-,-,\n`;
        Object.entries(jenisObj).forEach(([jenis, nominal]: [string, any], idx2) => {
          csvContent += `1.${idx1+1}.${idx2+1},${jenis.replace(/,/g, ' ')},${nominal},${nominal},0,\n`;
        });
      });
    }

    // Spacer
    csvContent += `,,,,, \n`;

    // 2. Belanja
    csvContent += `2,BELANJA,${apbdes?.totalBelanjaAnggaran || 0},${apbdes?.totalBelanjaRealisasi || 0},${BigInt(apbdes?.totalBelanjaAnggaran || 0) - BigInt(apbdes?.totalBelanjaRealisasi || 0)},\n`;
    if (apbdes?.belanja) {
      Object.entries(apbdes.belanja).forEach(([bidang, data]: [string, any], idx1) => {
        csvContent += `2.${idx1+1},${bidang.replace(/,/g, ' ')},${data.anggaran || 0},${data.realisasi || 0},${BigInt(data.anggaran || 0) - BigInt(data.realisasi || 0)},\n`;
        if (data.rincian) {
          Object.entries(data.rincian).forEach(([rincianName, rincianData]: [string, any], idx2) => {
            csvContent += `2.${idx1+1}.${idx2+1},${rincianName.replace(/,/g, ' ')},${rincianData.anggaran || 0},${rincianData.realisasi || 0},${BigInt(rincianData.anggaran || 0) - BigInt(rincianData.realisasi || 0)},\n`;
          });
        }
      });
    }

    // Surplus/Defisit
    csvContent += `,,,,, \n`;
    csvContent += `,SURPLUS / (DEFISIT),${apbdes?.surplusDefisitAnggaran || 0},${apbdes?.surplusDefisitRealisasi || 0},${BigInt(apbdes?.surplusDefisitAnggaran || 0) - BigInt(apbdes?.surplusDefisitRealisasi || 0)},\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_APBDes_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Laporan APBDes berhasil diekspor ke Excel/CSV');
  };

  return (
    <RoleLayout menuItems={KAUR_KEUANGAN_MENU} userName="Hastuti" userRole="Kaur Keuangan" settingsPath="/kaur-keuangan/pengaturan">
      <div className="relative mb-6 flex justify-between items-center">
        <PageHeader 
          title={`Laporan Keuangan Desa (APBDes) - ${currentYear}`} 
          description="Rekapitulasi otomatis Pendapatan dan Realisasi Belanja dari sistem." 
        />
        <div className="flex flex-wrap gap-3">
          <a 
            href="/templates/Template Laporan Keuangan Desa (Pertanggungjawaban APBDes).docx" 
            download 
            className="px-4 py-2 bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 rounded-lg shadow-sm font-bold flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Template (Word)
          </a>
          <button 
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg shadow-sm font-bold flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Export ke Excel
          </button>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm font-bold flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <Printer className="w-4 h-4" /> Cetak (PDF)
          </button>
        </div>
      </div>

      {/* Tampilan Laporan (Mirip Kertas) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 print:shadow-none print:border-none print:p-0 mx-auto max-w-7xl overflow-x-auto">
        <div className="text-center mb-8 border-b-2 border-slate-800 pb-6">
          <h2 className="text-xl font-bold uppercase tracking-wide">Pemerintah Desa KOHALOCK</h2>
          <h1 className="text-2xl font-black uppercase mt-1">Laporan Realisasi Anggaran Pendapatan dan Belanja Desa</h1>
          <p className="text-slate-600 font-medium mt-2">Tahun Anggaran {currentYear}</p>
        </div>

        <table className="w-full text-left border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
              <th className="py-3 px-4 font-bold border-r border-slate-300 w-16 text-center">KODE REKENING</th>
              <th className="py-3 px-4 font-bold border-r border-slate-300">URAIAN</th>
              <th className="py-3 px-4 font-bold border-r border-slate-300 text-right w-40">ANGGARAN<br/>(Rp.)</th>
              <th className="py-3 px-4 font-bold border-r border-slate-300 text-right w-40">REALISASI<br/>(Rp.)</th>
              <th className="py-3 px-4 font-bold border-r border-slate-300 text-right w-40">LEBIH/ KURANG<br/>(Rp.)</th>
              <th className="py-3 px-4 font-bold text-center w-24">KET.</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-slate-200/50 text-slate-500 text-xs font-bold border-b border-slate-300">
              <td className="py-1 px-4 text-center border-r border-slate-300">1</td>
              <td className="py-1 px-4 text-center border-r border-slate-300">2</td>
              <td className="py-1 px-4 text-center border-r border-slate-300">3</td>
              <td className="py-1 px-4 text-center border-r border-slate-300">4</td>
              <td className="py-1 px-4 text-center border-r border-slate-300">5</td>
              <td className="py-1 px-4 text-center">6</td>
            </tr>
            
            {/* 1. PENDAPATAN */}
            <tr className="bg-blue-50/50 font-bold border-b border-slate-300">
              <td className="py-3 px-4 border-r border-slate-300 text-center">1</td>
              <td className="py-3 px-4 border-r border-slate-300">PENDAPATAN</td>
              <td className="py-3 px-4 border-r border-slate-300 text-right text-blue-700">{Number(apbdes?.totalPendapatanAnggaran || 0).toLocaleString('id-ID')}</td>
              <td className="py-3 px-4 border-r border-slate-300 text-right text-blue-700">{Number(apbdes?.totalPendapatanRealisasi || 0).toLocaleString('id-ID')}</td>
              <td className="py-3 px-4 border-r border-slate-300 text-right text-slate-500">{Number(BigInt(apbdes?.totalPendapatanAnggaran || 0) - BigInt(apbdes?.totalPendapatanRealisasi || 0)).toLocaleString('id-ID')}</td>
              <td className="py-3 px-4 text-center"></td>
            </tr>

            {apbdes?.pendapatan && Object.entries(apbdes.pendapatan).map(([kelompok, jenisObj], idx1) => (
              <React.Fragment key={kelompok}>
                <tr className="bg-slate-50 font-semibold border-b border-slate-200 text-sm">
                  <td className="py-2 px-4 border-r border-slate-300 text-center">1.{idx1+1}</td>
                  <td className="py-2 px-4 border-r border-slate-300 pl-8">{kelompok}</td>
                  <td className="py-2 px-4 border-r border-slate-300 text-right">-</td>
                  <td className="py-2 px-4 border-r border-slate-300 text-right">-</td>
                  <td className="py-2 px-4 border-r border-slate-300 text-right">-</td>
                  <td className="py-2 px-4 text-center"></td>
                </tr>
                {Object.entries(jenisObj as any).map(([jenis, nominal], idx2) => (
                  <tr key={jenis} className="border-b border-slate-100 text-sm text-slate-700">
                    <td className="py-2 px-4 border-r border-slate-300 text-center">1.{idx1+1}.{idx2+1}</td>
                    <td className="py-2 px-4 border-r border-slate-300 pl-12">{jenis}</td>
                    <td className="py-2 px-4 border-r border-slate-300 text-right">{Number(nominal).toLocaleString('id-ID')}</td>
                    <td className="py-2 px-4 border-r border-slate-300 text-right">{Number(nominal).toLocaleString('id-ID')}</td>
                    <td className="py-2 px-4 border-r border-slate-300 text-right">0</td>
                    <td className="py-2 px-4 text-center"></td>
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {/* SPACER */}
            <tr><td colSpan={3} className="h-4 bg-slate-50 border-y border-slate-300"></td></tr>

            {/* 2. BELANJA */}
            <tr className="bg-amber-50/50 font-bold border-b border-slate-300">
              <td className="py-3 px-4 border-r border-slate-300 text-center">2</td>
              <td className="py-3 px-4 border-r border-slate-300">BELANJA</td>
              <td className="py-3 px-4 border-r border-slate-300 text-right text-amber-700">{Number(apbdes?.totalBelanjaAnggaran || 0).toLocaleString('id-ID')}</td>
              <td className="py-3 px-4 border-r border-slate-300 text-right text-amber-700">{Number(apbdes?.totalBelanjaRealisasi || 0).toLocaleString('id-ID')}</td>
              <td className="py-3 px-4 border-r border-slate-300 text-right text-slate-500">{Number(BigInt(apbdes?.totalBelanjaAnggaran || 0) - BigInt(apbdes?.totalBelanjaRealisasi || 0)).toLocaleString('id-ID')}</td>
              <td className="py-3 px-4 text-center"></td>
            </tr>

            {apbdes?.belanja && Object.entries(apbdes.belanja).map(([bidang, data]: [string, any], idx1) => (
              <React.Fragment key={bidang}>
               <tr className="border-b border-slate-200 text-sm bg-slate-50">
                 <td className="py-2 px-4 border-r border-slate-300 text-center font-semibold">2.{idx1+1}</td>
                 <td className="py-2 px-4 border-r border-slate-300 pl-8 font-semibold">{bidang}</td>
                 <td className="py-2 px-4 border-r border-slate-300 text-right font-semibold">{Number(data.anggaran || 0).toLocaleString('id-ID')}</td>
                 <td className="py-2 px-4 border-r border-slate-300 text-right font-semibold">{Number(data.realisasi || 0).toLocaleString('id-ID')}</td>
                 <td className="py-2 px-4 border-r border-slate-300 text-right font-semibold">{Number(BigInt(data.anggaran || 0) - BigInt(data.realisasi || 0)).toLocaleString('id-ID')}</td>
                 <td className="py-2 px-4 text-center"></td>
               </tr>
               {data.rincian && Object.entries(data.rincian).map(([rincianName, rincianData]: [string, any], idx2) => (
                 <tr key={rincianName} className="border-b border-slate-100 text-sm text-slate-700">
                    <td className="py-2 px-4 border-r border-slate-300 text-center">2.{idx1+1}.{idx2+1}</td>
                    <td className="py-2 px-4 border-r border-slate-300 pl-12">{rincianName}</td>
                    <td className="py-2 px-4 border-r border-slate-300 text-right">{Number(rincianData.anggaran || 0).toLocaleString('id-ID')}</td>
                    <td className="py-2 px-4 border-r border-slate-300 text-right">{Number(rincianData.realisasi || 0).toLocaleString('id-ID')}</td>
                    <td className="py-2 px-4 border-r border-slate-300 text-right">{Number(BigInt(rincianData.anggaran || 0) - BigInt(rincianData.realisasi || 0)).toLocaleString('id-ID')}</td>
                    <td className="py-2 px-4 text-center"></td>
                 </tr>
               ))}
              </React.Fragment>
            ))}

            {/* SURPLUS/DEFISIT */}
            <tr><td colSpan={6} className="h-4 bg-slate-50 border-y border-slate-300"></td></tr>
            <tr className="bg-slate-800 text-white font-bold">
              <td colSpan={2} className="py-4 px-4 text-right uppercase tracking-wider border-r border-slate-700">
                SURPLUS / (DEFISIT)
              </td>
              <td className="py-4 px-4 text-right text-lg border-r border-slate-700">
                {Number(apbdes?.surplusDefisitAnggaran || 0).toLocaleString('id-ID')}
              </td>
              <td className="py-4 px-4 text-right text-lg border-r border-slate-700">
                {Number(apbdes?.surplusDefisitRealisasi || 0).toLocaleString('id-ID')}
              </td>
              <td className="py-4 px-4 text-right text-lg border-r border-slate-700">
                {Number(BigInt(apbdes?.surplusDefisitAnggaran || 0) - BigInt(apbdes?.surplusDefisitRealisasi || 0)).toLocaleString('id-ID')}
              </td>
              <td className="py-4 px-4 text-center"></td>
            </tr>

          </tbody>
        </table>

        <div className="mt-16 flex justify-end">
          <div className="text-center">
            <p className="mb-16 text-slate-700">KOHALOCK, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>Kepala Desa</p>
            <p className="font-bold underline text-slate-900">Dr. Ir. Budi Santoso</p>
          </div>
        </div>

      </div>
    </RoleLayout>
  );
}
