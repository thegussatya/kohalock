import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import Badge from '../../components/Badge';
import { AUDITOR_MENU } from './menu';

const TO_INVESTIGATE = [
  { id: 'INV-042', title: 'Mark-up Material Semen', category: 'Laporan Whistleblower', date: '21 Jul 2026' },
  { id: 'INV-043', title: 'Transfer Dana Mencurigakan', category: 'Anomali Transaksi', date: '20 Jul 2026' },
];

const IN_PROGRESS = [
  { id: 'INV-040', title: 'Audit Proyek Pengaspalan', category: 'Audit Rutin', date: '18 Jul 2026' },
];

const CLOSED = [
  { id: 'INV-035', title: 'Selisih Pagu Posyandu', category: 'Anomali Transaksi', date: '10 Jul 2026' },
  { id: 'INV-031', title: 'Laporan Kualitas Bibit', category: 'Laporan Whistleblower', date: '01 Jul 2026' },
];

export default function CaseManagementPage() {
  const renderCard = (item: any) => (
    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-3 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-slate-400">{item.id}</span>
        <Badge label={item.category} variant="warning" />
      </div>
      <h4 className="text-sm font-bold text-slate-800 mb-3">{item.title}</h4>
      <div className="text-xs text-slate-500 font-medium">Dibuka: {item.date}</div>
    </div>
  );

  return (
    <RoleLayout menuItems={AUDITOR_MENU} userName="Tim Auditor" userRole="Auditor Independen">
      <PageHeader 
        title="Manajemen Kasus Investigasi" 
        description="Kelola dan pantau status kasus audit dan laporan whistleblower."
      />

      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)] mt-4">
        {/* Kolom To Investigate */}
        <div className="flex-1 flex flex-col bg-slate-50 rounded-2xl p-4 border border-slate-200">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="font-bold text-slate-800">To Investigate</h3>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{TO_INVESTIGATE.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {TO_INVESTIGATE.map(renderCard)}
          </div>
        </div>

        {/* Kolom In Progress */}
        <div className="flex-1 flex flex-col bg-slate-50 rounded-2xl p-4 border border-slate-200">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="font-bold text-slate-800">In Progress</h3>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{IN_PROGRESS.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {IN_PROGRESS.map(renderCard)}
          </div>
        </div>

        {/* Kolom Closed */}
        <div className="flex-1 flex flex-col bg-slate-50 rounded-2xl p-4 border border-slate-200">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="font-bold text-slate-800">Closed</h3>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{CLOSED.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {CLOSED.map(renderCard)}
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
