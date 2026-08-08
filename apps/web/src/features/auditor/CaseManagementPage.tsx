import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import Badge from '../../components/Badge';
import { AUDITOR_MENU } from './menu';
import { useState, useEffect } from 'react';
import apiClient from '../../lib/apiClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function CaseManagementPage() {
  const [cases, setCases] = useState({
    toInvestigate: [],
    inProgress: [],
    closed: []
  });

  useEffect(() => {
    apiClient.get('/dashboard/auditor/cases')
      .then(res => setCases(res.data))
      .catch(console.error);
  }, []);
  const navigate = useNavigate();

  const renderCard = (item: any) => (
    <div 
      key={item.id} 
      onClick={() => {
        if (item.category === 'Laporan Whistleblower') {
          navigate('/auditor/kotak-rahasia');
        } else if (item.category === 'Anomali Transaksi') {
          navigate('/auditor/ledger');
        } else {
          toast('Detail kasus belum tersedia', { icon: '🚧' });
        }
      }}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-3 hover:shadow-md transition-shadow cursor-pointer hover:border-brand-300"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-slate-400">{item.id}</span>
        <Badge label={item.category} variant="warning" />
      </div>
      <h4 className="text-sm font-bold text-slate-800 mb-3">{item.title}</h4>
      <div className="text-xs text-slate-500 font-medium">Dibuka: {item.date}</div>
    </div>
  );

  return (
    <RoleLayout menuItems={AUDITOR_MENU} userName="Tim Auditor" userRole="Auditor Independen" settingsPath="/auditor/profil">
      <PageHeader 
        title="Manajemen Kasus Investigasi" 
        description="Kelola dan pantau status kasus audit dan laporan whistleblower."
      />

      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)] mt-4">
        {/* Kolom To Investigate */}
        <div className="flex-1 flex flex-col bg-slate-50 rounded-2xl p-4 border border-slate-200">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="font-bold text-slate-800">To Investigate</h3>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{cases.toInvestigate.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {cases.toInvestigate.map(renderCard)}
          </div>
        </div>

        {/* Kolom In Progress */}
        <div className="flex-1 flex flex-col bg-slate-50 rounded-2xl p-4 border border-slate-200">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="font-bold text-slate-800">In Progress</h3>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{cases.inProgress.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {cases.inProgress.map(renderCard)}
          </div>
        </div>

        {/* Kolom Closed */}
        <div className="flex-1 flex flex-col bg-slate-50 rounded-2xl p-4 border border-slate-200">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="font-bold text-slate-800">Closed</h3>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{cases.closed.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {cases.closed.map(renderCard)}
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
