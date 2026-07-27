import SharedNotificationsPage from '../shared/NotificationsPage';
import { LayoutDashboard, FilePlus, Wallet, History, HelpCircle, FolderKanban } from 'lucide-react';
import { KAUR_TEKNIS_MENU } from './menu';



export default function NotificationsPage() {
  return (
    <SharedNotificationsPage 
      menuItems={KAUR_TEKNIS_MENU}
      userName="Budi Santoso"
      userRole="Kaur Teknis"
      
    />
  );
}
