import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../../components/MetricCard';
import { BPD_ADAT_MENU } from './menu';
import apiClient from '../../lib/apiClient';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/dashboard/bpd-adat')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Memuat dashboard...</div>;

  const performanceRate = data?.performanceRate || "-";
  const redFlags = data?.redFlags?.toString() || "0";
  const flags = data?.flags || [];
  const timeline = data?.timeline || [];

  return (
    <RoleLayout menuItems={BPD_ADAT_MENU} userName="Bapak RT/Adat" userRole="BPD / Tokoh Adat" settingsPath="/bpd-adat/pengaturan">
      <div className="mb-8">
        <PageHeader title="Dashboard BPD & Tokoh Adat" description="Dashboard Bersama: Pusat komando pengawasan terpadu. Pantau realisasi anggaran, deteksi anomali keamanan sistem, dan telusuri jejak resolusi kearifan lokal." />
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <MetricCard
            title="Kinerja Desa (Realisasi Program)"
            value={performanceRate}
            description="Persentase total program berjalan berbanding selesai"
            variant="default"
          />
          <div onClick={() => navigate('/bpd-adat/pantauan-transaksi')} className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl">
            <MetricCard
              title="Potensi Pelanggaran (Red Flags)"
              value={redFlags}
              description="Berdasarkan aduan masyarakat & sistem AI"
              variant="danger"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Security Flags */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Status Keamanan (Flags)
          </h2>
          
          <div className="flex flex-col gap-4">
            {flags.length > 0 ? flags.map((flag: any) => (
              <div key={flag.id} className={`p-4 border rounded-xl flex gap-4 items-start ${flag.type === 'danger' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="mt-0.5">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${flag.type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {flag.type === 'danger' ? '!' : '?'}
                  </span>
                </div>
                <div>
                  <h4 className={`text-sm font-bold mb-1 ${flag.type === 'danger' ? 'text-red-900' : 'text-yellow-900'}`}>{flag.title}</h4>
                  <p className={`text-xs font-medium ${flag.type === 'danger' ? 'text-red-700' : 'text-yellow-700'}`}>{flag.description}</p>
                  <p className={`text-[10px] mt-1 ${flag.type === 'danger' ? 'text-red-500' : 'text-yellow-500'}`}>{new Date(flag.timestamp).toLocaleString('id-ID')}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada anomali atau flag terbaru.</p>
            )}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Aktivitas Terkini
          </h2>

          <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
            {timeline.length > 0 ? timeline.map((item: any) => (
              <div key={item.id} className="relative pl-6">
                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 ring-white border ${
                  item.type === 'success' ? 'bg-green-500 border-green-200' : 
                  item.type === 'purple' ? 'bg-purple-500 border-purple-200' : 
                  'bg-blue-500 border-blue-200'
                }`}></div>
                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">{new Date(item.timestamp).toLocaleString('id-ID')}</p>
              </div>
            )) : (
              <p className="text-sm text-slate-500 py-4 ml-6">Belum ada aktivitas tercatat.</p>
            )}
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
