import SharedProfilePage from '../shared/ProfilePage';
import { Home, Building2, MessageCircleQuestion, Lock, HelpCircle } from 'lucide-react';
import { PUBLIK_MENU } from './menu';



export default function ProfilePage() {
  return (
    <SharedProfilePage 
      menuItems={PUBLIK_MENU}
      userName="Warga"
      userRole="Masyarakat"
      
    />
  );
}
