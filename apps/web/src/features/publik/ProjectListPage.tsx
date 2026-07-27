import PageHeader from '../../components/PageHeader';
import { useState } from 'react';
import { Home, Building2, MessageCircleQuestion, Lock, HelpCircle, SearchX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { PUBLIK_MENU } from './menu';



const DUMMY_PROJECTS = [
  { id: 'PRJ-101', title: 'Pembangunan Posyandu Dusun 3', status: 'Sedang Berjalan', progress: 45, dusun: 'Dusun 3' },
  { id: 'PRJ-102', title: 'Pengaspalan Jalan Utama (RT 01 - 04)', status: 'Sedang Berjalan', progress: 70, dusun: 'Dusun 1' },
  { id: 'PRJ-103', title: 'Bantuan Bibit Jagung Unggul', status: 'Selesai', progress: 100, dusun: 'Dusun 2' },
  { id: 'PRJ-104', title: 'Perbaikan Saluran Irigasi Tersier', status: 'Sedang Berjalan', progress: 20, dusun: 'Dusun 4' },
  { id: 'PRJ-105', title: 'Pengadaan Lampu Jalan Tenaga Surya', status: 'Selesai', progress: 100, dusun: 'Dusun 1' },
];

export default function ProjectListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDusun, setSelectedDusun] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const navigate = useNavigate();

  const filteredProjects = DUMMY_PROJECTS.filter(p => {
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedDusun && p.dusun !== selectedDusun) return false;
    if (selectedStatus && p.status !== selectedStatus) return false;
    return true;
  });

  return (
    <RoleLayout menuItems={PUBLIK_MENU} userName="Warga" userRole="Masyarakat">
      <div className="mb-8">
        <PageHeader title="Pantau Proyek & Progres" description="Lihat daftar program yang sedang dijalankan oleh Pemerintah Desa. Informasi yang ditampilkan ditarik berdasarkan data transparan (Smart Contract)." />

      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 max-w-5xl mb-8">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative flex-grow w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama proyek atau program..."
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-colors"
            />
          </div>

          <select
            value={selectedDusun}
            onChange={(e) => setSelectedDusun(e.target.value)}
            className="w-full md:w-48 px-4 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-white"
          >
            <option value="">Semua Dusun</option>
            <option value="Dusun 1">Dusun 1</option>
            <option value="Dusun 2">Dusun 2</option>
            <option value="Dusun 3">Dusun 3</option>
            <option value="Dusun 4">Dusun 4</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-48 px-4 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-white"
          >
            <option value="">Semua Status</option>
            <option value="Sedang Berjalan">Sedang Berjalan</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <SearchX className="w-12 h-12 text-slate-400 mb-4" />
              <p className="text-slate-600 font-medium">Tidak ada proyek yang cocok dengan pencarian Anda</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedDusun(''); setSelectedStatus(''); }}
                className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => navigate(`/publik/proyek/${project.id}`)}
                className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer flex flex-col"
              >
                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{project.id}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      project.status === 'Selesai' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                    {project.title}
                  </h3>
                  
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                      <span>Progres Fisik</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          project.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-blue-600 group-hover:bg-blue-50 transition-colors">
                  Lihat Detail
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </RoleLayout>
  );
}
