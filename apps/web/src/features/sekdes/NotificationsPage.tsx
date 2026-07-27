import SharedNotificationsPage from '../shared/NotificationsPage';
import { LayoutDashboard, FileCheck, PieChart, MessageCircle, HelpCircle, History } from 'lucide-react';
import { SEKDES_MENU } from './menu';



export default function NotificationsPage() {
  return (
    <SharedNotificationsPage 
      menuItems={SEKDES_MENU}
      userName="Siti Rahma"
      userRole="Sekretaris Desa"
      
    />
  );
}
