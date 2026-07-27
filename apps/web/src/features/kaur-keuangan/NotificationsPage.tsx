import SharedNotificationsPage from '../shared/NotificationsPage';
import { KAUR_KEUANGAN_MENU } from './menu';

export default function NotificationsPage() {
  return (
    <SharedNotificationsPage 
      menuItems={KAUR_KEUANGAN_MENU}
      userName="Hastuti"
      userRole="Kaur Keuangan"
      settingsPath="/kaur-keuangan/pengaturan"
    />
  );
}
