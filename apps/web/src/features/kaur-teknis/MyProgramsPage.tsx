import React, { useState } from 'react';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import Badge, { type BadgeVariant } from '../../components/Badge';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FilePlus, FolderKanban, Wallet, History, HelpCircle, Search } from 'lucide-react';
import { KAUR_TEKNIS_MENU } from './menu';



const DUMMY_PROGRAMS = [
  { id: 1, name: 'Pembangunan Posyandu Dusun 1', category: 'Kesehatan', status: 'Aktif', totalFunds: 150000000, realized: 50000000, remaining: 100000000 },
  { id: 2, name: 'Pengaspalan Jalan Utama', category: 'Infrastruktur', status: 'Selesai', totalFunds: 300000000, realized: 300000000, remaining: 0 },
  { id: 3, name: 'Bantuan Bibit Pertanian', category: 'Pemberdayaan Masyarakat', status: 'Ditolak', totalFunds: 25000000, realized: 0, remaining: 25000000 },
  { id: 4, name: 'Beasiswa Pendidikan Anak Desa', category: 'Pendidikan', status: 'Aktif', totalFunds: 50000000, realized: 10000000, remaining: 40000000 },
  { id: 5, name: 'Pengadaan Lampu Jalan', category: 'Infrastruktur', status: 'Aktif', totalFunds: 75000000, realized: 25000000, remaining: 50000000 },
  { id: 6, name: 'Dana Siaga Bencana Alam', category: 'Bencana & Keadaan Darurat', status: 'Aktif', totalFunds: 20000000, realized: 0, remaining: 20000000 },
];

export default function MyProgramsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredPrograms = DUMMY_PROGRAMS.filter(p => {
    if (filterCategory && p.category !== filterCategory) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusVariant = (status: string): BadgeVariant => {
    if (status === 'Aktif') return 'info';
    if (status === 'Selesai') return 'success';
    return 'danger';
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Infrastruktur': return 'bg-orange-100 text-orange-800';
      case 'Pemberdayaan Masyarakat': return 'bg-green-100 text-green-800';
      case 'Kesehatan': return 'bg-rose-100 text-rose-800';
      case 'Pendidikan': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <RoleLayout menuItems={KAUR_TEKNIS_MENU} userName="Budi Santoso" userRole="Kaur Teknis">
      <PageHeader 
        title="Program Saya" 
        description="Semua usulan Musrembang yang pernah Anda ajukan" 
      />

      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari program..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
        >
          <option value="">Semua Kategori</option>
          <option value="Infrastruktur">Infrastruktur</option>
          <option value="Pemberdayaan Masyarakat">Pemberdayaan Masyarakat</option>
          <option value="Kesehatan">Kesehatan</option>
          <option value="Pendidikan">Pendidikan</option>
          <option value="Bencana & Keadaan Darurat">Bencana & Keadaan Darurat</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
        >
          <option value="">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Selesai">Selesai</option>
          <option value="Ditolak">Ditolak</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrograms.map((program) => {
          const progressPercentage = Math.round((program.realized / program.totalFunds) * 100);
          return (
            <div 
              key={program.id}
              onClick={() => navigate(`/kaur-teknis/program-saya/${program.id}`)}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${getCategoryColor(program.category)}`}>
                  {program.category}
                </span>
                <Badge label={program.status} variant={getStatusVariant(program.status)} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-1 leading-tight flex-1">{program.name}</h3>
              
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
                  <span>Realisasi Dana ({progressPercentage}%)</span>
                  <span>Total: Rp {program.totalFunds.toLocaleString('id-ID')}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
                  <div 
                    className="bg-brand-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercentage}%` }} 
                  />
                </div>
                <div className="text-sm font-semibold text-slate-700">
                  Sisa Pagu: Rp {program.remaining.toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          );
        })}
        {filteredPrograms.length === 0 && (
          <div className="col-span-full py-10 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl">
            Tidak ada program yang sesuai dengan filter Anda.
          </div>
        )}
      </div>
    </RoleLayout>
  );
}
