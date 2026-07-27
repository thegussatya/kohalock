import SharedProfilePage from '../shared/ProfilePage';
import { LayoutDashboard, FileCheck, PieChart, MessageCircle, HelpCircle, History } from 'lucide-react';
import { SEKDES_MENU } from './menu';



export default function ProfilePage() {
  return (
    <SharedProfilePage 
      menuItems={SEKDES_MENU}
      userName="Siti Rahma"
      userRole="Sekretaris Desa"
      
    />
  );
}
