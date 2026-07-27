import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Eye, Scale, Archive, Settings, HelpCircle } from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import { BPD_ADAT_MENU } from './menu';



export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <RoleLayout menuItems={BPD_ADAT_MENU} userName="Bapak RT/Adat" userRole="BPD / Tokoh Adat" settingsPath="/bpd-adat/pengaturan">
      <div className="mb-8">
        <PageHeader title="Dashboard BPD & Tokoh Adat" description="Dashboard Bersama: Pusat komando pengawasan terpadu. Pantau realisasi anggaran, deteksi anomali keamanan sistem, dan telusuri jejak resolusi kearifan lokal." />

      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <MetricCard
            title="Kinerja Desa (Realisasi Program)"
            value="68%"
            description="Persentase total program berjalan berbanding selesai"
            variant="default"
          />
          <div onClick={() => navigate('/bpd-adat/pantauan-transaksi')} className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl">
            <MetricCard
              title="Potensi Pelanggaran (Red Flags)"
              value="2"
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
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-4 items-start">
              <div className="mt-0.5">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold">!</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-900 mb-1">Tombol Darurat Ditekan Kades</h4>
                <p className="text-xs text-red-700 font-medium">Transaksi darurat diaktifkan oleh pihak eksekutif pada proyek pengadaan pada pukul 09:15 WIB.</p>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-4 items-start">
              <div className="mt-0.5">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 font-bold">?</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-yellow-900 mb-1">Ditolak Sistem</h4>
                <p className="text-xs text-yellow-700 font-medium">Sistem pintar menolak pencairan Termin 2 akibat ketidaksesuaian nominal bukti dengan pagu anggaran.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Aktivitas Terkini
          </h2>

          <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
            
            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-green-500 ring-4 ring-white border border-green-200"></div>
              <p className="text-sm font-bold text-slate-900">Kades mencairkan Termin 1</p>
              <p className="text-xs text-slate-500 mt-1">Pencairan program pembangunan posyandu Dusun 3 telah disetujui penuh.</p>
              <p className="text-xs font-semibold text-slate-400 mt-1">Hari ini, 10:30 WIB</p>
            </div>

            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-purple-500 ring-4 ring-white border border-purple-200"></div>
              <p className="text-sm font-bold text-slate-900">Tokoh Adat mencatat Resolusi Sengketa Dusun 2</p>
              <p className="text-xs text-slate-500 mt-1">Hasil mediasi adat terkait hak guna lahan berhasil dicatat secara on-chain.</p>
              <p className="text-xs font-semibold text-slate-400 mt-1">Kemarin, 15:45 WIB</p>
            </div>

            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-white border border-blue-200"></div>
              <p className="text-sm font-bold text-slate-900">BPD memantau transaksi masuk</p>
              <p className="text-xs text-slate-500 mt-1">Aktivitas peninjauan ulang dan penelusuran arus kas oleh anggota BPD.</p>
              <p className="text-xs font-semibold text-slate-400 mt-1">Kemarin, 09:12 WIB</p>
            </div>

          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
