import React, { useState, useEffect } from 'react';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import { KAUR_KEUANGAN_MENU } from './menu';
import apiClient from '../../lib/apiClient';
import { Printer, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LaporanLpjPage() {
  const [lpjItems, setLpjItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<string>('Semua');
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    apiClient.get(`/reports/lpj-details?tahun=${currentYear}`)
      .then(res => {
        setLpjItems(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error('Gagal memuat rincian LPJ');
        setLoading(false);
      });
  }, [currentYear]);

  if (loading) {
    return (
      <RoleLayout menuItems={KAUR_KEUANGAN_MENU} userName="Hastuti" userRole="Kaur Keuangan">
        <div className="py-16 text-center text-slate-500 font-bold animate-pulse">Memuat Rincian LPJ...</div>
      </RoleLayout>
    );
  }

  const uniquePrograms = Array.from(new Set(lpjItems.map((item: any) => item.disbursement.proposal.judulUsulan)));

  const filteredItems = selectedProgram === 'Semua' 
    ? lpjItems 
    : lpjItems.filter((item: any) => item.disbursement.proposal.judulUsulan === selectedProgram);

  // Mengelompokkan item berdasarkan Program (Judul Usulan)
  const groupedItems = filteredItems.reduce((acc: any, item: any) => {
    const programName = item.disbursement.proposal.judulUsulan;
    const key = programName;
    
    if (!acc[key]) {
      acc[key] = {
        items: [],
        total: 0n,
        kategori: item.disbursement.proposal.kategori
      };
    }
    acc[key].items.push(item);
    acc[key].total += BigInt(item.totalHarga);
    return acc;
  }, {});

  const grandTotal = filteredItems.reduce((acc: any, item: any) => acc + BigInt(item.totalHarga), 0n);

  const exportToExcel = () => {
    let csvContent = "Program/Kegiatan,Kategori,No,Uraian / Nama Barang,Volume,Satuan,Harga Satuan (Rp),Total Harga (Rp)\n";
    
    Object.entries(groupedItems).forEach(([groupName, data]: [string, any]) => {
      data.items.forEach((item: any, idx: number) => {
        const safeGroupName = groupName.replace(/,/g, ' - ');
        const safeKategori = data.kategori.replace(/,/g, ' ');
        const safeUraian = item.uraian.replace(/,/g, ' ');
        csvContent += `${safeGroupName},${safeKategori},${idx + 1},${safeUraian},${item.volume},${item.satuan},${item.hargaSatuan},${item.totalHarga}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Rincian_LPJ_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Laporan berhasil diekspor ke format Excel/CSV');
  };

  return (
    <RoleLayout menuItems={KAUR_KEUANGAN_MENU} userName="Hastuti" userRole="Kaur Keuangan" settingsPath="/kaur-keuangan/pengaturan">
      <div className="relative mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <PageHeader 
          title={`Laporan Rincian LPJ Barang & Jasa - ${currentYear}`} 
          description="Rekapitulasi seluruh rincian belanja dari Kaur Teknis per kegiatan." 
        />
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <select 
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 outline-none focus:border-blue-500 shadow-sm font-medium w-full md:w-64"
          >
            <option value="Semua">Tampilkan Semua Program</option>
            {uniquePrograms.map((prog: any) => (
              <option key={prog} value={prog}>{prog}</option>
            ))}
          </select>
          
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
            <Printer className="w-4 h-4" /> Cetak Rincian (PDF)
          </button>
        </div>
      </div>

      {/* Tampilan Laporan (Kertas Cetak) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 print:shadow-none print:border-none print:p-0 mx-auto max-w-5xl">
        <div className="text-center mb-8 border-b-2 border-slate-800 pb-6">
          <h2 className="text-xl font-bold uppercase tracking-wide">Pemerintah Desa KOHALOCK</h2>
          <h1 className="text-2xl font-black uppercase mt-1">Laporan Rincian Belanja Pertanggungjawaban (LPJ)</h1>
          <p className="text-slate-600 font-medium mt-2">Tahun Anggaran {currentYear}</p>
        </div>

        <table className="w-full text-left border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
              <th className="py-3 px-4 font-bold border-r border-slate-300 w-12 text-center">No</th>
              <th className="py-3 px-4 font-bold border-r border-slate-300">Uraian / Nama Barang</th>
              <th className="py-3 px-4 font-bold border-r border-slate-300 w-24 text-center">Volume</th>
              <th className="py-3 px-4 font-bold border-r border-slate-300 w-32 text-right">Harga Satuan</th>
              <th className="py-3 px-4 font-bold text-right w-40">Total (Rp)</th>
            </tr>
          </thead>
          <tbody>
            
            {Object.entries(groupedItems).length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 font-semibold italic">Belum ada rincian LPJ yang dicatat untuk tahun ini.</td>
              </tr>
            )}

            {Object.entries(groupedItems).map(([groupName, data]: [string, any], groupIdx) => (
              <React.Fragment key={groupName}>
                {/* Header Grup Program */}
                <tr className="bg-slate-50 font-bold border-b border-slate-300">
                  <td className="py-3 px-4 border-r border-slate-300 text-center text-slate-500">{String.fromCharCode(65 + groupIdx)}</td>
                  <td colSpan={3} className="py-3 px-4 border-r border-slate-300 text-blue-800 uppercase text-sm">
                    {groupName} <span className="ml-2 text-xs text-slate-400 font-normal bg-slate-200 px-2 py-0.5 rounded-full">{data.kategori}</span>
                  </td>
                  <td className="py-3 px-4 text-right text-blue-700">{Number(data.total).toLocaleString('id-ID')}</td>
                </tr>

                {/* Baris Rincian per Program */}
                {data.items.map((item: any, idx: number) => (
                  <tr key={item.id} className="border-b border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-4 border-r border-slate-300 text-center">{idx + 1}</td>
                    <td className="py-2 px-4 border-r border-slate-300 font-medium">{item.uraian}</td>
                    <td className="py-2 px-4 border-r border-slate-300 text-center">{item.volume} {item.satuan}</td>
                    <td className="py-2 px-4 border-r border-slate-300 text-right">{Number(item.hargaSatuan).toLocaleString('id-ID')}</td>
                    <td className="py-2 px-4 text-right font-semibold">{Number(item.totalHarga).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {/* GRAND TOTAL */}
            {Object.entries(groupedItems).length > 0 && (
              <>
                <tr><td colSpan={5} className="h-4"></td></tr>
                <tr className="bg-slate-800 text-white font-bold">
                  <td colSpan={4} className="py-4 px-4 text-right uppercase tracking-wider">
                    Total Keseluruhan Belanja LPJ
                  </td>
                  <td className="py-4 px-4 text-right text-lg">
                    {Number(grandTotal).toLocaleString('id-ID')}
                  </td>
                </tr>
              </>
            )}

          </tbody>
        </table>

        <div className="mt-16 flex justify-end">
          <div className="text-center">
            <p className="mb-16 text-slate-700">KOHALOCK, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>Kaur Keuangan / Bendahara</p>
            <p className="font-bold underline text-slate-900">Hastuti</p>
          </div>
        </div>

      </div>
    </RoleLayout>
  );
}
