import SharedProfilePage from '../shared/ProfilePage';
import { Search, FileSearch, Workflow, LockKeyhole, Download, HelpCircle } from 'lucide-react';
import { AUDITOR_MENU } from './menu';



export default function ProfilePage() {
  return (
    <SharedProfilePage 
      menuItems={AUDITOR_MENU}
      userName="Inspektur Andi"
      userRole="Auditor / APH"
      
    />
  );
}
