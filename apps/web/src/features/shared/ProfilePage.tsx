import React from 'react';
import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import AccountSettings from '../../components/AccountSettings';

interface ProfilePageProps {
  menuItems: any[];
  userName: string;
  userRole: string;
  settingsPath?: string;
}

export default function ProfilePage({ menuItems, userName, userRole, settingsPath }: ProfilePageProps) {
  return (
    <RoleLayout menuItems={menuItems} userName={userName} userRole={userRole} settingsPath={settingsPath}>
      <div className="mb-8">
        <PageHeader 
          title="Profil Saya" 
          description="Kelola informasi pribadi dan keamanan akun Anda"
        />
      </div>
      
      <AccountSettings />
    </RoleLayout>
  );
}
