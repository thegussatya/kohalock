import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import DataTable, { type TableColumn } from '../../components/DataTable';
import { LayoutDashboard, BadgeCheck, History, ShieldAlert, QrCode, Settings, HelpCircle, Wallet, BarChart3 } from 'lucide-react';
import { KADES_MENU } from './menu';



type AuthHistoryData = {
  id: string;
  tanggal: string;
  namaProgram: string;
  dusun: string;
  kategori: string;
  nominal: number;
};

const DUMMY_HISTORY: AuthHistoryData[] = [
  { id: '1', tanggal: '2023-10-15', namaProgram: 'Pembangunan Posyandu', dusun: 'Dusun 1', kategori: 'Kesehatan', nominal: 150000000 },
  { id: '2', tanggal: '2023-10-14', namaProgram: 'Pengaspalan Jalan Utama', dusun: 'Dusun 3', kategori: 'Infrastruktur', nominal: 300000000 },
  { id: '3', tanggal: '2023-10-12', namaProgram: 'Bantuan Bibit Jagung', dusun: 'Dusun 2', kategori: 'Pemberdayaan', nominal: 25000000 },
  { id: '4', tanggal: '2023-10-10', namaProgram: 'Beasiswa Pendidikan', dusun: 'Dusun 4', kategori: 'Pendidikan', nominal: 50000000 },
  { id: '5', tanggal: '2023-10-08', namaProgram: 'Pelatihan Kader PKK', dusun: 'Dusun 1', kategori: 'Pemberdayaan', nominal: 15000000 },
  { id: '6', tanggal: '2023-10-05', namaProgram: 'Pengadaan Lampu Jalan', dusun: 'Dusun 3', kategori: 'Infrastruktur', nominal: 75000000 },
  { id: '7', tanggal: '2023-10-02', namaProgram: 'Pembangunan Gapura Desa', dusun: 'Dusun 2', kategori: 'Infrastruktur', nominal: 30000000 },
  { id: '8', tanggal: '2023-10-01', namaProgram: 'Dana Siaga Bencana', dusun: 'Dusun 4', kategori: 'Darurat', nominal: 20000000 },
];

const COLUMNS: TableColumn[] = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'namaProgram', label: 'Nama Program' },
  { key: 'dusun', label: 'Dusun' },
  { key: 'nominal_formatted', label: 'Nominal' },
];

export default function AuthorizationHistoryPage() {
  const [filterDusun, setFilterDusun] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredHistory = DUMMY_HISTORY.filter(h => {
    if (filterDusun && h.dusun !== filterDusun) return false;
    if (filterKategori && h.kategori !== filterKategori) return false;
    if (dateFrom && new Date(h.tanggal) < new Date(dateFrom)) return false;
    if (dateTo && new Date(h.tanggal) > new Date(dateTo)) return false;
    return true;
  });

  const totalNominal = filteredHistory.reduce((sum, item) => sum + item.nominal, 0);

  const tableData = filteredHistory.map(item => ({
    ...item,
    nominal_formatted: `Rp ${item.nominal.toLocaleString('id-ID')}`
  }));

  return (
    <RoleLayout menuItems={KADES_MENU} userName="Ahmad Fauzi" userRole="Kepala Desa" settingsPath="/kades/pengaturan">
      <PageHeader 
        title="Riwayat Otorisasi" 
        description="Daftar pencairan dana yang telah Anda setujui." 
      />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filterDusun}
            onChange={e => setFilterDusun(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Semua Dusun</option>
            <option value="Dusun 1">Dusun 1</option>
            <option value="Dusun 2">Dusun 2</option>
            <option value="Dusun 3">Dusun 3</option>
            <option value="Dusun 4">Dusun 4</option>
          </select>

          <select
            value={filterKategori}
            onChange={e => setFilterKategori(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Semua Kategori</option>
            <option value="Kesehatan">Kesehatan</option>
            <option value="Infrastruktur">Infrastruktur</option>
            <option value="Pemberdayaan">Pemberdayaan</option>
            <option value="Pendidikan">Pendidikan</option>
            <option value="Darurat">Darurat</option>
          </select>

          <div className="flex items-center gap-2">
            <input 
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 flex-1"
            />
            <span className="text-slate-400">-</span>
            <input 
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 flex-1"
            />
          </div>
        </div>
      </div>

      <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 mb-6 flex items-center gap-4 shadow-sm">
        <div className="bg-brand-100 p-3 rounded-lg">
          <Wallet className="w-6 h-6 text-brand-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-brand-800">Total Nominal Periode Ini</p>
          <h3 className="text-2xl font-bold text-brand-900 mt-1">Rp {totalNominal.toLocaleString('id-ID')}</h3>
        </div>
      </div>

      <DataTable 
        columns={COLUMNS} 
        data={tableData} 
      />
    </RoleLayout>
  );
}
