import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-8">
          <img src="/logo.svg" alt="KohaLock Logo" className="w-16 h-16 mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-brand-900">KohaLock</h1>
          <p className="text-slate-500 text-sm mt-1 text-center">Sistem Transparansi Dana Desa Berbasis Blockchain</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nama Pengguna / Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email atau nama pengguna"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-slate-900"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-slate-900"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
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
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-semibold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 flex justify-center items-center"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
