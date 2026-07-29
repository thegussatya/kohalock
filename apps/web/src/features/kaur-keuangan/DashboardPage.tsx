import { useState, useEffect } from 'react';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import MetricCard from '../../components/MetricCard';
import { Landmark, Wallet, Calendar, Lock, CheckCircle2, Receipt, Building2, Activity } from 'lucide-react';
import { KAUR_KEUANGAN_MENU } from './menu';
import apiClient from '../../lib/apiClient';

export default function DashboardPage() {
  const [data, setData] = useState<any>({
    pendingExecutions: 0,
    saldoKas: 0,
    tenggatPelaporan: '-',
    recentActivities: []
  });

  useEffect(() => {
    apiClient.get('/dashboard/kaur-keuangan')
      .then(res => {
        setData(res.data);
      })
      .catch(console.error);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'lock': return Lock;
      case 'wallet': return Wallet;
      case 'receipt': return Receipt;
      case 'building': return Building2;
      default: return CheckCircle2;
    }
  };

  return (
    <RoleLayout
      menuItems={KAUR_KEUANGAN_MENU}
      userName="Hastuti"
      userRole="Kaur Keuangan"
      settingsPath="/kaur-keuangan/pengaturan"
    >
      <PageHeader 
        title="Dashboard Kaur Keuangan" 
        description="Ringkasan eksekusi keuangan dan saldo kas desa."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Transaksi Menunggu Eksekusi"
          value={String(data.pendingExecutions)}
          variant="warning"
          icon={<Landmark className="w-5 h-5" />}
        />
        <MetricCard
          title="Saldo Kas Bulan Ini"
          value={`Rp ${Number(data.saldoKas).toLocaleString('id-ID')}`}
          variant="default"
          icon={<Wallet className="w-5 h-5" />}
        />
        <MetricCard
          title="Tenggat Pelaporan Berikutnya"
          value={data.tenggatPelaporan}
          variant="info"
          icon={<Calendar className="w-5 h-5" />}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden max-w-3xl">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Aktivitas Terbaru
          </h2>
        </div>
        <div className="p-6">
          <div className="relative border-l border-slate-200 ml-4 space-y-6 pb-2">
            {data.recentActivities.length > 0 ? data.recentActivities.map((activity: any) => {
              const Icon = getIcon(activity.iconType);
              return (
                <div key={activity.id} className="relative pl-6">
                  <div className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${activity.bg} ${activity.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800">{activity.title}</span>
                    <span className="text-xs text-slate-500 mt-1">{activity.time}</span>
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-slate-500 ml-4">Belum ada aktivitas baru.</p>
            )}
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
