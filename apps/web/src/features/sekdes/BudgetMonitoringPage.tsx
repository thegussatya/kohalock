import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import BudgetDonutChart from '../../components/BudgetDonutChart';
import { SEKDES_MENU } from './menu';



import { useState, useEffect } from 'react';
import apiClient from '../../lib/apiClient';

export default function BudgetMonitoringPage() {
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/dashboard/sekdes/budget')
      .then(res => {
        const { danaCair, dalamProses, sisaKas } = res.data;
        setBudgetData([
          { label: 'Dana Telah Cair', value: Number(danaCair), color: '#10b981' }, // Hijau
          { label: 'Dalam Proses Verifikasi', value: Number(dalamProses), color: '#eab308' }, // Kuning
          { label: 'Sisa Kas Belum Terpakai', value: Number(sisaKas), color: '#94a3b8' }, // Abu-abu
        ]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  return (
    <RoleLayout menuItems={SEKDES_MENU} userName="Siti Rahma" userRole="Sekretaris Desa">
      <PageHeader title="Pantauan Anggaran" description="Halaman pemantauan postur anggaran dan realisasi program." />


      <div className="max-w-4xl">
        {!loading && (
          <BudgetDonutChart 
            title="Ringkasan Postur Anggaran" 
            data={budgetData} 
          />
        )}
      </div>
    </RoleLayout>
  );
}
