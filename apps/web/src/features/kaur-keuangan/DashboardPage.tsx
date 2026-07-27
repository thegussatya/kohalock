import React from 'react';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import MetricCard from '../../components/MetricCard';
import { Landmark, Wallet, Calendar, Lock, CheckCircle2, Receipt, Building2, Activity } from 'lucide-react';
import { KAUR_KEUANGAN_MENU } from './menu';

const RECENT_ACTIVITIES = [
  { id: 1, title: 'Buku Kas Umum bulan Juni berhasil dikunci', time: '2 hari lalu', icon: Lock, color: 'text-green-600', bg: 'bg-green-100' },
  { id: 2, title: 'Eksekusi dana program Pengaspalan Jalan berhasil dicatat', time: '3 hari lalu', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 3, title: 'Pajak PPh 21 disetor ke kas negara', time: '5 hari lalu', icon: Receipt, color: 'text-orange-600', bg: 'bg-orange-100' },
  { id: 4, title: 'Rekonsiliasi Bank bulan Mei selesai', time: '1 minggu lalu', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-100' },
];

export default function DashboardPage() {
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
          value="4"
          variant="warning"
          icon={<Landmark className="w-5 h-5" />}
        />
        <MetricCard
          title="Saldo Kas Bulan Ini"
          value="Rp 85.000.000"
          variant="default"
          icon={<Wallet className="w-5 h-5" />}
        />
        <MetricCard
          title="Tenggat Pelaporan Berikutnya"
          value="31 Juli 2026"
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
            {RECENT_ACTIVITIES.map((activity, index) => {
              const Icon = activity.icon;
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
            })}
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
