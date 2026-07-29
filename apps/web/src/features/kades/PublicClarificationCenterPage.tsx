import PageHeader from '../../components/PageHeader';
import { useState, useEffect } from 'react';
import { LayoutDashboard, BadgeCheck, ShieldAlert, QrCode, Settings, HelpCircle, History, BarChart3 } from 'lucide-react';
import RoleLayout from '../../components/RoleLayout';
import { KADES_MENU } from './menu';
import apiClient from '../../lib/apiClient';

export default function PublicClarificationCenterPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiClient.get('/public/projects')
      .then(res => {
        const mapped = res.data.map((item: any) => ({
          id: item.id, // For display we might want a shorter ID like PRJ-101 but let's just use first 8 chars
          displayId: `PRJ-${item.id.substring(item.id.length - 4).toUpperCase()}`,
          name: item.judulUsulan,
          budget: `Rp ${Number(item.paguMaksimal).toLocaleString('id-ID')}`,
          status: item.status
        }));
        setProjects(mapped);
      })
      .catch(console.error);
  }, []);

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(`https://kohalock.id/proyek/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <RoleLayout menuItems={KADES_MENU} userName="Ahmad Fauzi" userRole="Kepala Desa" settingsPath="/kades/pengaturan">
      <div className="mb-8">
        <PageHeader title="Pusat Klarifikasi Publik (Sosialisasi)" description="Akses portal media sosialisasi proyek. Bagikan transparansi dana desa secara proaktif ke masyarakat melalui media sosial atau cetak QR Code di papan pengumuman." />

      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 max-w-5xl">
        <div className="mb-6 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari program atau proyek desa..."
            className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-300">
              Tidak ada proyek yang sesuai dengan pencarian Anda.
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => {
                  setSelectedProject(project);
                  setCopied(false);
                }}
                className="group bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{project.displayId}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  <div className="text-sm font-semibold text-green-700 mb-4">{project.budget}</div>
                </div>
                <button className="w-full py-2.5 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  Bagikan Proyek Ini
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Share Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-slate-900 leading-tight">Materi Sosialisasi</h3>
              <button 
                onClick={() => setSelectedProject(null)}
                className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <p className="text-sm text-slate-600 mb-6">
              Bagikan portal transparansi <span className="font-bold text-slate-900">{selectedProject.name}</span> kepada masyarakat.
            </p>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tautan Langsung (URL)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={`https://kohalock.id/proyek/${selectedProject.id}`}
                  className="flex-grow p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 outline-none"
                />
                <button 
                  onClick={() => handleCopy(selectedProject.id)}
                  className={`px-4 py-3 font-bold text-sm rounded-xl transition-colors flex items-center gap-2 ${
                    copied ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mb-6 flex flex-col items-center border-t border-b border-slate-100 py-6">
              <div className="w-40 h-40 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
                <span className="text-slate-400 text-xs font-bold text-center px-4">[QR Code akan ditampilkan di sini]</span>
              </div>
              <button className="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download QR Code
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Bagikan Cepat Ke Media Sosial</label>
              <div className="flex gap-3 justify-center">
                {/* WhatsApp Dummy Button */}
                <button className="flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold text-sm rounded-xl hover:bg-[#128C7E] transition-colors shadow-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </button>
                {/* Facebook Dummy Button */}
                <button className="flex items-center gap-2 px-6 py-3 bg-[#1877F2] text-white font-bold text-sm rounded-xl hover:bg-[#0c62d0] transition-colors shadow-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}
