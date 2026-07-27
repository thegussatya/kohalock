import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut } from 'lucide-react';
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
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
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
    <div className="flex flex-row justify-between items-center bg-white border-b border-slate-200 px-6 py-3 relative z-20">
      {/* Kiri */}
      <div className="text-slate-800 font-semibold text-sm">
      </div>

      {/* Kanan */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearch(true);
            }}
            onFocus={() => setShowSearch(true)}
            className="w-[250px] pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-slate-400"
          />
          
          {/* Search Dropdown */}
          {showSearch && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
              {filteredSearch.length > 0 ? (
                <ul className="max-h-64 overflow-y-auto py-1">
                  {filteredSearch.map((item, index) => (
                    <li key={index}>
                      <button
                        onClick={() => {
                          navigate(item.path);
                          setShowSearch(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                      >
                        <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                        {item.category && (
                          <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">
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
            className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold border-2 border-white rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-sm py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 font-semibold text-sm text-slate-800">
                Notifikasi
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-slate-500 text-sm">
                    Belum ada notifikasi
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 transition-colors ${!notif.dibaca ? 'bg-brand-50/30' : ''}`}
                      onClick={() => {
                        setShowNotif(false);
                        navigate(`${basePath}/notifikasi`);
                      }}
                    >
                      <p className={`text-sm ${!notif.dibaca ? 'text-slate-900 font-bold' : 'text-slate-800 font-medium'}`}>{notif.judul}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{notif.pesan}</p>
                      <p className="text-[10px] text-brand-600 mt-1 font-semibold">{timeAgo(notif.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <button 
                  onClick={() => {
                    setShowNotif(false);
                    navigate(`${basePath}/notifikasi`);
                  }}
                  className="text-xs text-brand-600 font-medium hover:text-brand-900 transition-colors"
                >
                  Lihat Semua
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profil / Avatar */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-slate-50 transition-colors focus:outline-none border border-transparent hover:border-slate-200"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-900 font-bold text-sm">
              {getInitials(userName)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{userName}</p>
              <p className="text-xs text-slate-500 leading-tight">{userRole}</p>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-sm py-1 z-50">
              <button 
                onClick={() => {
                  setShowProfile(false);
                  navigate(`${basePath}/profil`);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profil
              </button>
              <div className="h-px bg-slate-100 my-1"></div>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
