import PageHeader from '../../components/PageHeader';
import { useState, useEffect } from 'react';
import BackLink from '../../components/BackLink';
import { useNavigate, useParams } from 'react-router-dom';
import { Bell, BellRing } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RoleLayout from '../../components/RoleLayout';
import Badge from '../../components/Badge';
import { PUBLIK_MENU } from './menu';
import apiClient from '../../lib/apiClient';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      apiClient.get(`/public/projects/${id}`)
        .then(res => {
          setProject(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  const handleFollowToggle = () => {
    if (isFollowing) {
      setIsFollowing(false);
      toast.success('Anda berhenti mengikuti proyek ini');
    } else {
      setIsFollowing(true);
      toast.success('Anda akan menerima notifikasi progres proyek ini');
    }
  };

  return (
    <RoleLayout menuItems={PUBLIK_MENU} userName="Warga" userRole="Masyarakat">
      <div className="mb-6">
        <BackLink to="/publik/proyek" label="Kembali ke Daftar Proyek" />
      </div>
        
      {loading ? (
        <div className="py-16 text-center text-slate-500 font-bold animate-pulse">Memuat detail proyek...</div>
      ) : !project ? (
        <div className="py-16 text-center text-slate-500 font-bold">Proyek tidak ditemukan</div>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge label={project.id} variant="info" />
              <Badge label={project.kategori || "Infrastruktur"} variant="neutral" />
            </div>
            <PageHeader title={project.judulUsulan} />
          </div>
          <div className="flex w-full md:w-auto items-center gap-3">
            <button
              onClick={handleFollowToggle}
              className={`px-4 py-2.5 font-bold rounded-xl border-2 transition-colors flex items-center justify-center gap-2 w-full md:w-auto ${
                isFollowing 
                  ? 'bg-brand-50 border-brand-500 text-brand-700' 
                  : 'bg-white border-slate-300 text-slate-700 hover:border-brand-500 hover:text-brand-700'
              }`}
            >
              {isFollowing ? (
                <BellRing className="w-5 h-5 text-brand-600" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
              {isFollowing ? 'Mengikuti' : 'Ikuti Proyek Ini'}
            </button>
            <button 
              onClick={() => navigate('/publik/klarifikasi')}
              className="hidden md:flex px-5 py-2.5 bg-white border-2 border-slate-900 text-slate-900 font-bold rounded-xl hover:bg-slate-900 hover:text-white transition-colors items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Tanya
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Galeri Foto */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Galeri Progres (Geotagging)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.photos && project.photos.length > 0 ? project.photos.map((photo: any) => (
                <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <div className="aspect-[4/3] w-full">
                    <img src={photo.url} alt="Progress" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-4 text-white">
                    <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {photo.time}
                    </p>
                    <p className="text-sm font-semibold flex items-start gap-1">
                      <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {photo.location}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Belum ada foto progres untuk proyek ini.
                </div>
              )}
            </div>
            <p className="text-xs font-medium text-slate-500 mt-4">
              *Foto diambil melalui sistem kamera khusus yang menyegel koordinat dan waktu secara presisi untuk mencegah manipulasi.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Transparansi Dana */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Transparansi Dana
            </h2>

            <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Total Pagu Proyek</span>
              <span className="text-2xl font-black text-slate-900">Rp {Number(project.paguMaksimal).toLocaleString('id-ID')}</span>
            </div>
            
            <div className="flex flex-col gap-3">
              {project.terms && project.terms.length > 0 ? project.terms.map((t: any) => (
                <div key={t.id} className="bg-white border border-slate-200 p-4 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-3 text-sm">{t.term}</h4>
                  <div className="flex justify-between items-center text-sm font-medium text-slate-600 mb-1">
                    <span>Anggaran:</span>
                    <span>Rp {Number(t.anggaran).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-green-700 mb-3">
                    <span>Realisasi Cair:</span>
                    <span>Rp {Number(t.cair).toLocaleString('id-ID')}</span>
                  </div>
                  
                  <div className="flex justify-center mt-2">
                    <Badge 
                      label={t.status} 
                      variant={t.status === 'DISBURSED' ? 'success' : 'warning'} 
                    />
                  </div>
                  {t.beritaAcaraHash && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Hash On-Chain:</span>
                      <span className="font-mono bg-slate-100 px-2 py-1 rounded truncate w-32">{t.beritaAcaraHash.substring(0, 16)}...</span>
                    </div>
                  )}
                </div>
              )) : (
                <div className="py-4 text-center text-sm text-slate-500">Belum ada pencairan termin.</div>
              )}
            </div>
          </div>

          <button 
            onClick={() => navigate('/publik/klarifikasi')}
            className="md:hidden w-full px-5 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Tanya Tentang Proyek Ini
          </button>
        </div>
      </>
      )}
    </RoleLayout>
  );
}
