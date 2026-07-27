import SharedProfilePage from '../shared/ProfilePage';
import { LayoutDashboard, BadgeCheck, ShieldAlert, QrCode, Settings, HelpCircle, History, BarChart3 } from 'lucide-react';
import { KADES_MENU } from './menu';



export default function ProfilePage() {
  return (
    <SharedProfilePage 
      menuItems={KADES_MENU}
      userName="Ahmad Fauzi"
      userRole="Kepala Desa"
      settingsPath="/kades/pengaturan"
    />
  );
}
