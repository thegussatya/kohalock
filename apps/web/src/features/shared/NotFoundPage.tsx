import { SearchX, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans']">
      <SearchX className="w-24 h-24 text-slate-400 mb-6" strokeWidth={1.5} />
      <h1 className="text-4xl font-bold text-slate-900 mb-2">404 - Halaman Tidak Ditemukan</h1>
      <p className="text-slate-600 mb-8 text-lg">Halaman yang Anda cari tidak ada atau sudah dipindahkan.</p>
      <button 
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-[#00AEEF] hover:bg-[#0090C7] text-white font-medium rounded-lg transition-colors shadow-sm"
      >
        Kembali ke Beranda
      </button>
    </div>
  );
}
