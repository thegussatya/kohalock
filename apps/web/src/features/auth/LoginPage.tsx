import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../lib/apiClient';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Email dan password harus diisi');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.status === 200 && response.data.token) {
        localStorage.setItem('kohalock_token', response.data.token);
        localStorage.setItem('kohalock_user', JSON.stringify(response.data.user));
        
        toast.success('Login berhasil!');
        
        // Navigate based on role
        navigate(`/${response.data.user.role}`);
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Email atau password salah');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden p-4">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-50/60 rounded-full blur-2xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100/80 p-8 sm:p-10 overflow-hidden transition-all duration-300">
        
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-900 via-brand-500 to-brand-600" />

        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative mb-4 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-brand-900 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
            <div className="relative w-20 h-20 rounded-2xl bg-white shadow-md shadow-brand-500/10 border border-slate-100 flex items-center justify-center p-3.5">
              <img src="/logo.svg" alt="KOHALOCK Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-brand-900 via-brand-900 to-brand-600 bg-clip-text text-transparent">
            KOHALOCK
          </h1>
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-900 border border-brand-100/80">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-brand-500" />
            Transparansi Akuntabel
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-2 text-center max-w-xs leading-relaxed">
            Sistem Transparansi Dana Desa Berbasis Blockchain
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Nama Pengguna / Email
            </label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email atau nama pengguna"
                className="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all text-slate-900 text-sm placeholder:text-slate-400"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-11 pr-12 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all text-slate-900 text-sm placeholder:text-slate-400"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none rounded-md transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-900 via-brand-600 to-brand-500 hover:from-brand-900 hover:to-brand-600 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-brand-900/15 hover:shadow-xl hover:shadow-brand-900/25 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-[0.99] flex justify-center items-center text-sm tracking-wide"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                'Masuk ke Sistem'
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-center text-center">
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-brand-500" />
            Keamanan Terenkripsi & Immutable Ledger
          </p>
        </div>

      </div>
    </div>
  );
}
