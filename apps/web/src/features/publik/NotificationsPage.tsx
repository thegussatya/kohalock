import SharedNotificationsPage from '../shared/NotificationsPage';
import { Home, Building2, MessageCircleQuestion, Lock, HelpCircle } from 'lucide-react';
import { PUBLIK_MENU } from './menu';



export default function NotificationsPage() {
  return (
    <SharedNotificationsPage 
      menuItems={PUBLIK_MENU}
      userName="Warga"
      userRole="Masyarakat"
      
    />
  );
}
