import PageHeader from '../../components/PageHeader';
import { toast } from 'react-hot-toast';
import RoleLayout from '../../components/RoleLayout';
import { LayoutDashboard, Eye, Scale, Archive, Settings, HelpCircle } from 'lucide-react';
import Badge from '../../components/Badge';
import { BPD_ADAT_MENU } from './menu';



type ResolutionCase = {
  id: string;
  pihak: string;
  kategori: string;
  status: 'Sedang Musyawarah' | 'Selesai/Mufakat';
  deskripsi: string;
  tanggalLapor: string;
};

const DUMMY_CASES: ResolutionCase[] = [
  {
    id: 'KAS-001',
    pihak: 'Kaur Teknis vs Warga Dusun 2',
    kategori: 'Pelanggaran Integritas Aparat',
    status: 'Sedang Musyawarah',
    deskripsi: 'Dugaan manipulasi pengajuan material pembangunan jalan desa tanpa prosedur musyawarah desa yang benar.',
    tanggalLapor: '10 Okt 2023',
  },
  {
    id: 'KAS-002',
    pihak: 'Keluarga Bpk. Subandi vs Keluarga Bpk. Yanto',
    kategori: 'Sengketa Batas Tanah',
    status: 'Selesai/Mufakat',
    deskripsi: 'Sengketa pergeseran patok tanah kebun di area perbatasan wilayah timur desa yang dipicu oleh penebangan pohon.',
    tanggalLapor: '25 Sep 2023',
  },
  {
    id: 'KAS-003',
    pihak: 'Pemuda Dusun 1 vs Pemuda Dusun 3',
    kategori: 'Perselisihan Warga',
    status: 'Sedang Musyawarah',
    deskripsi: 'Konflik dan adu mulut akibat jadwal pemakaian lapangan olahraga desa yang tidak diatur secara merata.',
    tanggalLapor: '16 Okt 2023',
  },
];

export default function AdatResolutionBoardPage() {
  return (
    <RoleLayout menuItems={BPD_ADAT_MENU} userName="Bapak RT/Adat" userRole="BPD / Tokoh Adat" settingsPath="/bpd-adat/pengaturan">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <PageHeader title="Papan Resolusi Adat" description="Wadah penyelesaian perkara dan mediasi damai berbasis kearifan lokal (Khusus Tokoh Adat)." />

        </div>
        <button
          type="button"
          onClick={() => toast.success("Keputusan adat berhasil disimpan")}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
        >
          + Tambah Kasus Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_CASES.map((item) => (
          <div 
            key={item.id} 
            className="flex flex-col bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow h-full"
          >
            <div className="flex justify-between items-start mb-4 gap-2 flex-wrap">
              <Badge label={item.kategori} variant="neutral" />
              <Badge 
                label={item.status} 
                variant={item.status === 'Selesai/Mufakat' ? 'success' : 'warning'} 
              />
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">
              {item.pihak}
            </h3>
            
            <p className="text-sm text-slate-600 mb-6 flex-grow">
              {item.deskripsi}
            </p>
            
            <div className="pt-4 border-t border-slate-100 text-xs font-medium text-slate-500 mt-auto flex justify-between items-center">
              <span>Dilaporkan: {item.tanggalLapor}</span>
              <span className="text-slate-400">{item.id}</span>
            </div>
          </div>
        ))}
      </div>
    </RoleLayout>
  );
}
