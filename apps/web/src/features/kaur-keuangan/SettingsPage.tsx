import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import AccountSettings from '../../components/AccountSettings';
import { KAUR_KEUANGAN_MENU } from './menu';

export default function SettingsPage() {
  return (
    <RoleLayout menuItems={KAUR_KEUANGAN_MENU} userName="Hastuti" userRole="Kaur Keuangan" settingsPath="/kaur-keuangan/pengaturan">
      <div className="mb-8">
        <PageHeader title="Pengaturan & Kredensial" description="Kelola profil profil identitas digital, perbarui sertifikat enkripsi, dan amankan akun Anda." />
      </div>

      <AccountSettings />
    </RoleLayout>
  );
}
