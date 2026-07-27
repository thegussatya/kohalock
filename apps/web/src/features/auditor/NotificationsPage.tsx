import SharedNotificationsPage from '../shared/NotificationsPage';
import { Search, FileSearch, Workflow, LockKeyhole, Download, HelpCircle } from 'lucide-react';
import { AUDITOR_MENU } from './menu';



export default function NotificationsPage() {
  return (
    <SharedNotificationsPage 
      menuItems={AUDITOR_MENU}
      userName="Inspektur Andi"
      userRole="Auditor / APH"
      
    />
  );
}
