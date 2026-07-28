import PageHeader from '../../components/PageHeader';
import { useState, useEffect } from 'react';
import { SearchX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { PUBLIK_MENU } from './menu';
import apiClient from '../../lib/apiClient';

export default function ProjectListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDusun, setSelectedDusun] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (selectedDusun) params.append('dusun', selectedDusun);
        if (selectedStatus) params.append('status', selectedStatus);

        const res = await apiClient.get(`/public/projects?${params.toString()}`);
        setProjects(res.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchProjects();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedDusun, selectedStatus]);

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
          {loading ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
              <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="h-4 bg-slate-200 rounded w-48"></div>
              </div>
            </div>
          ) : projects.length === 0 ? (
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
            projects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => navigate(`/publik/proyek/${project.id}`)}
                className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer flex flex-col"
              >
                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate" title={project.id}>
                      {project.id}
                    </span>
                    <span className={`shrink-0 whitespace-nowrap inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      project.status === 'Selesai' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                    {project.judulUsulan}
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
