import SharedNotificationsPage from '../shared/NotificationsPage';
import { LayoutDashboard, Eye, Scale, Archive, Settings, HelpCircle } from 'lucide-react';
import { BPD_ADAT_MENU } from './menu';



export default function NotificationsPage() {
  return (
    <SharedNotificationsPage 
      menuItems={BPD_ADAT_MENU}
      userName="Bapak RT/Adat"
      userRole="BPD / Tokoh Adat"
      settingsPath="/bpd-adat/pengaturan"
    />
  );
}
