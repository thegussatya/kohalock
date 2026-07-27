import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import { LayoutDashboard, FileCheck, PieChart, MessageCircle, HelpCircle, History } from 'lucide-react';
import BudgetDonutChart from '../../components/BudgetDonutChart';
import { SEKDES_MENU } from './menu';



const BUDGET_DATA = [
  { label: 'Dana Telah Cair', value: 450000000, color: '#10b981' }, // Hijau
  { label: 'Dalam Proses Verifikasi', value: 150000000, color: '#eab308' }, // Kuning
  { label: 'Sisa Kas Belum Terpakai', value: 400000000, color: '#94a3b8' }, // Abu-abu
];

export default function BudgetMonitoringPage() {
  return (
    <RoleLayout menuItems={SEKDES_MENU} userName="Siti Rahma" userRole="Sekretaris Desa">
      <PageHeader title="Pantauan Anggaran" description="Halaman pemantauan postur anggaran dan realisasi program." />


      <div className="max-w-4xl">
        <BudgetDonutChart 
          title="Ringkasan Postur Anggaran" 
          data={BUDGET_DATA} 
        />
      </div>
    </RoleLayout>
  );
}
