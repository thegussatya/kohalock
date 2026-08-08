import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import AccountSettings from '../../components/AccountSettings';
import { KADES_MENU } from './menu';

export default function SettingsPage() {
  return (
    <RoleLayout menuItems={KADES_MENU} userName="Ahmad Fauzi" userRole="Kepala Desa" settingsPath="/kades/pengaturan">
      <div className="mb-8">
        <PageHeader title="Pengaturan & Kredensial" description="Kelola profil profil identitas digital, perbarui sertifikat enkripsi, dan amankan akun Executive Anda." />
      </div>

      <AccountSettings />
    </RoleLayout>
  );
}
