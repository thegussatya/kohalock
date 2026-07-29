import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Command } from 'lucide-react';
import apiClient from '../lib/apiClient';

export type SearchItem = {
  label: string;
  path: string;
  category?: string;
};

interface TopbarProps {
  userName: string;
  userRole: string;
  searchData?: SearchItem[];
}

function timeAgo(dateString: string) {
  const diff = Math.max(0, Date.now() - new Date(dateString).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes}m lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  return `${days}h lalu`;
}

export function Topbar({ userName, userRole, searchData = [] }: TopbarProps) {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = '/' + location.pathname.split('/')[1];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    apiClient.get('/notifications/unread-count')
      .then(res => setUnreadCount(res.data.count))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (showNotif) {
      apiClient.get('/notifications')
        .then(res => setNotifications(res.data))
        .catch(err => console.error(err));
    }
  }, [showNotif]);

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Search logic
  const filteredSearch = searchQuery.length >= 2 
    ? searchData.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <div className="flex flex-row justify-between items-center bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 py-3.5 relative z-20 transition-all">
      {/* Kiri - Path Indicator / Welcome */}
      <div className="text-slate-500 font-medium text-xs hidden lg:flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-brand-500" />
        Sistem Transparansi Desa
      </div>

      {/* Kanan - Actions */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Search */}
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari program, menu, data..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearch(true);
            }}
            onFocus={() => setShowSearch(true)}
            className="w-[240px] sm:w-[280px] pl-9 pr-12 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-200/60 rounded text-[10px] text-slate-500 font-medium pointer-events-none">
            <Command className="w-2.5 h-2.5" /> K
          </div>
          
          {/* Search Dropdown */}
          {showSearch && searchQuery.length >= 2 && (
            <div className="absolute top-full right-0 mt-2.5 w-[320px] bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/70 z-50 overflow-hidden">
              {filteredSearch.length > 0 ? (
                <ul className="max-h-64 overflow-y-auto p-1.5 space-y-1">
                  {filteredSearch.map((item, index) => (
                    <li key={index}>
                      <button
                        onClick={() => {
                          navigate(item.path);
                          setShowSearch(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-brand-50/60 rounded-xl transition-colors group flex justify-between items-center"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-brand-900">{item.label}</p>
                          {item.category && (
                            <p className="text-[10px] text-slate-400 mt-0.5">{item.category}</p>
                          )}
                        </div>
                        <span className="text-[10px] text-brand-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Buka &rarr;</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-4 text-xs text-slate-400 text-center">
                  Tidak ada hasil untuk "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifikasi */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 rounded-xl transition-colors focus:outline-none border border-transparent hover:border-slate-200/60"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-rose-500 text-white text-[10px] font-bold border-2 border-white rounded-full animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/70 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 font-bold text-xs text-slate-800 flex items-center justify-between">
                <span>Notifikasi Masuk</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-bold">
                    {unreadCount} Baru
                  </span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto p-1 space-y-1">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-slate-400 text-xs">
                    Belum ada notifikasi
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors ${!notif.dibaca ? 'bg-brand-50/40 border border-brand-100/50' : ''}`}
                      onClick={() => {
                        setShowNotif(false);
                        navigate(`${basePath}/notifikasi`);
                      }}
                    >
                      <p className={`text-xs ${!notif.dibaca ? 'text-slate-900 font-bold' : 'text-slate-800 font-medium'}`}>{notif.judul}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{notif.pesan}</p>
                      <p className="text-[9px] text-brand-600 mt-1 font-semibold">{timeAgo(notif.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="px-3 py-2 border-t border-slate-100 text-center">
                <button 
                  onClick={() => {
                    setShowNotif(false);
                    navigate(`${basePath}/notifikasi`);
                  }}
                  className="text-xs text-brand-600 font-bold hover:text-brand-900 transition-colors"
                >
                  Lihat Semua Notifikasi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-slate-200/80" />

        {/* Profil / Avatar */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 p-1 pr-3 rounded-xl hover:bg-slate-100/70 transition-all focus:outline-none border border-transparent hover:border-slate-200/60 group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-brand-900 to-brand-600 text-white font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
              {getInitials(userName)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-brand-900 transition-colors">{userName}</p>
              <p className="text-[10px] text-slate-400 font-medium leading-tight">{userRole}</p>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2.5 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/70 p-1.5 z-50">
              <button 
                onClick={() => {
                  setShowProfile(false);
                  navigate(`${basePath}/profil`);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profil Saya
              </button>
              <div className="h-px bg-slate-100 my-1"></div>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

