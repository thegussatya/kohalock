import SharedProfilePage from '../shared/ProfilePage';
import { KAUR_KEUANGAN_MENU } from './menu';

export default function ProfilePage() {
  return (
    <SharedProfilePage 
      menuItems={KAUR_KEUANGAN_MENU}
      userName="Hastuti"
      userRole="Kaur Keuangan"
      settingsPath="/kaur-keuangan/pengaturan"
    />
  );
}
