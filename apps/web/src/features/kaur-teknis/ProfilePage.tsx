import SharedProfilePage from '../shared/ProfilePage';
import { LayoutDashboard, FilePlus, Wallet, History, HelpCircle, FolderKanban } from 'lucide-react';
import { KAUR_TEKNIS_MENU } from './menu';



export default function ProfilePage() {
  return (
    <SharedProfilePage 
      menuItems={KAUR_TEKNIS_MENU}
      userName="Budi Santoso"
      userRole="Kaur Teknis"
      
    />
  );
}
