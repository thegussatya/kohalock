import React from 'react';
import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import MetricCard from '../../components/MetricCard';
import { LayoutDashboard, BadgeCheck, History, ShieldAlert, QrCode, BarChart3, Settings, HelpCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { KADES_MENU } from './menu';



const ANALYTICS_DATA = [
  { label: 'Progres Proyek', value: 45 },
  { label: 'Anggaran', value: 30 },
  { label: 'Jadwal Kerja', value: 25 },
  { label: 'Kualitas Material', value: 15 },
  { label: 'Lainnya', value: 8 },
];

export default function ClarificationAnalyticsPage() {
  return (
    <RoleLayout menuItems={KADES_MENU} userName="Ahmad Fauzi" userRole="Kepala Desa" settingsPath="/kades/pengaturan">
      <PageHeader 
        title="Analitik Klarifikasi Publik" 
        description="Ringkasan tren pertanyaan dan tingkat respons pemerintah desa terhadap warga." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <MetricCard
            title="Rata-rata Waktu Respon"
            value="4 Jam"
            variant="default"
            icon={<Clock className="w-5 h-5 text-brand-600" />}
          />
        </div>
        
        <div className="lg:col-span-2">
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full min-h-[350px] flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Topik Pertanyaan Warga Terbanyak</h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ANALYTICS_DATA}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} Pertanyaan`, 'Jumlah']}
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="value" fill="#00AEEF" radius={[4, 4, 0, 0]} barSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
