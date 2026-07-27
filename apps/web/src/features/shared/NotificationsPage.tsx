import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import { CheckCircle, AlertTriangle, MessageCircle, Bell } from 'lucide-react';
import apiClient from '../../lib/apiClient';

interface NotificationsPageProps {
  menuItems: any[];
  userName: string;
  userRole: string;
  settingsPath?: string;
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

export default function NotificationsPage({ menuItems, userName, userRole, settingsPath }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/notifications')
      .then(res => setNotifications(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await apiClient.post(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, dibaca: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const renderIcon = (judul: string) => {
    const j = judul.toLowerCase();
    if (j.includes('dieksekusi') || j.includes('sukses') || j.includes('dijawab')) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (j.includes('peringatan') || j.includes('antrean')) {
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    }
    return <MessageCircle className="w-5 h-5 text-blue-500" />;
  };

  return (
    <RoleLayout menuItems={menuItems} userName={userName} userRole={userRole} settingsPath={settingsPath}>
      <PageHeader 
        title="Notifikasi" 
        description="Semua pembaruan dan aktivitas terkait akun Anda" 
      />
      
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-6">
        <ul className="divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-slate-400">
              <Bell className="w-12 h-12 mb-3 text-slate-300" />
              <p className="font-medium">Belum ada notifikasi baru</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <li 
                key={notif.id} 
                onClick={() => handleRead(notif.id, notif.dibaca)}
                className={`p-6 transition-colors flex items-start gap-4 cursor-pointer ${!notif.dibaca ? 'bg-brand-50/50 hover:bg-brand-50/70' : 'bg-white hover:bg-slate-50'}`}
              >
                <div className="shrink-0 mt-1">
                  {renderIcon(notif.judul)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className={`text-base font-bold truncate ${!notif.dibaca ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notif.judul}
                    </h4>
                    {!notif.dibaca && (
                      <span className="shrink-0 px-2 py-0.5 bg-brand-100 text-brand-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                        Baru
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mb-2 leading-relaxed ${!notif.dibaca ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                    {notif.pesan}
                  </p>
                  <p className="text-xs font-semibold text-slate-400">
                    {timeAgo(notif.createdAt)}
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </RoleLayout>
  );
}
