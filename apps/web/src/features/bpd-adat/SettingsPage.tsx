import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import AccountSettings from '../../components/AccountSettings';
import { BPD_ADAT_MENU } from './menu';

export default function SettingsPage() {
  return (
    <RoleLayout menuItems={BPD_ADAT_MENU} userName="Bapak RT/Adat" userRole="BPD / Tokoh Adat" settingsPath="/bpd-adat/pengaturan">
      <div className="mb-8">
        <PageHeader title="Pengaturan Akun" description="Kelola profil pengawas, perbarui tingkat keamanan kata sandi, dan atur email pemulihan untuk akun akses BPD/Tokoh Adat Anda." />
      </div>

      <AccountSettings />
    </RoleLayout>
  );
}
