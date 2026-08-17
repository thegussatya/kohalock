import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileSearch, Workflow, LockKeyhole, Download, HelpCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { AUDITOR_MENU } from './menu';
import apiClient from '../../lib/apiClient';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/dashboard/auditor')
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

  const totalTurnover = data?.totalTurnover ? `Rp ${Number(data.totalTurnover).toLocaleString('id-ID')}` : 'Rp 0';
  const redFlagCount = data?.redFlagCount?.toString() || "0";
  const chartData = data?.chartData || [];
  const timeBoundAccess = data?.timeBoundAccess || "-";
  const unresolvedWhistleblowersCount = data?.unresolvedWhistleblowersCount || 0;

  return (
    <RoleLayout menuItems={AUDITOR_MENU} userName="Inspektur Andi" userRole="Auditor / APH" settingsPath="/auditor/profil">
      <PageHeader title="Dashboard Auditor" description="Selamat datang di dashboard panel untuk Inspektorat / Auditor." />

      {unresolvedWhistleblowersCount > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 animate-pulse">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h4 className="text-red-800 font-bold">Perhatian: Ada Laporan Masyarakat Baru!</h4>
            <p className="text-red-700 text-sm mt-1">Terdapat {unresolvedWhistleblowersCount} laporan whistleblower yang memerlukan peninjauan dan dekripsi segera.</p>
          </div>
        </div>
      )}

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
        <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
        <div>
          <h4 className="text-blue-800 font-bold">Pemberitahuan Peran Sistem</h4>
          <p className="text-blue-700 text-sm mt-1">
            KOHALOCK <strong>bukanlah auditor dan tidak menggantikan fungsi Inspektorat</strong>. 
            Sistem ini berperan sebagai penyedia data, dokumentasi, <em>audit trail</em> kriptografis, dan bukti pendukung digital yang tak terubah (<em>immutable</em>) untuk mempermudah proses pemeriksaan Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Sisa Akses (Time-Bound)"
          value={timeBoundAccess}
          variant="warning"
        />
        <MetricCard
          title="Total Perputaran Uang"
          value={totalTurnover}
          variant="default"
        />
        <div onClick={() => navigate('/auditor/ledger')} className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl">
          <MetricCard
            title="Transaksi Anomali (Red Flags)"
            value={redFlagCount}
            variant="danger"
          />
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Workflow className="w-5 h-5 text-red-500" />
          Tren Red Flag 6 Bulan Terakhir
        </h3>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartData.length > 0 ? (
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <RechartsTooltip 
                  cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [value, 'Anomali']}
                />
                <Line type="monotone" dataKey="anomalies" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#ef4444' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }} />
              </LineChart>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">Belum ada data intervensi</div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-blue-500" />
          Daftar Dokumen Transaksi (Real-time)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Program & Tanggal</th>
                <th className="px-4 py-3">Nominal Transaksi</th>
                <th className="px-4 py-3">Dokumen Tersedia</th>
                <th className="px-4 py-3 rounded-tr-lg text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data?.transactionDocuments?.length > 0 ? (
                data.transactionDocuments.map((doc: any) => (
                  <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{doc.namaProgram}</div>
                      <div className="text-xs text-slate-500">{new Date(doc.tanggal).toLocaleDateString('id-ID')}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(doc.nominal)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {doc.rabUrl ? (
                          <a href={doc.rabUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold hover:bg-blue-100">
                            <CheckCircle2 className="w-3 h-3" /> RAB
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-400 rounded text-xs font-semibold">
                            RAB
                          </span>
                        )}
                        {doc.beritaAcaraUrl ? (
                          <a href={doc.beritaAcaraUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-semibold hover:bg-green-100">
                            <CheckCircle2 className="w-3 h-3" /> B.Acara
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-400 rounded text-xs font-semibold">
                            B.Acara
                          </span>
                        )}
                        {doc.fotoUrl ? (
                          <a href={doc.fotoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs font-semibold hover:bg-orange-100">
                            <CheckCircle2 className="w-3 h-3" /> Foto
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-400 rounded text-xs font-semibold">
                            Foto
                          </span>
                        )}
                        {doc.lpjTeknisUrl || doc.lpjKeuanganUrl ? (
                          <a href={doc.lpjTeknisUrl || doc.lpjKeuanganUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-semibold hover:bg-purple-100">
                            <CheckCircle2 className="w-3 h-3" /> LPJ
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-400 rounded text-xs font-semibold">
                            LPJ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => navigate('/auditor/uji-bukti')} className="text-blue-600 font-bold hover:underline flex items-center justify-end gap-1 w-full">
                        <LockKeyhole className="w-4 h-4" /> Cek Hash
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Belum ada data transaksi yang tersedia untuk diaudit.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </RoleLayout>
  );
}
