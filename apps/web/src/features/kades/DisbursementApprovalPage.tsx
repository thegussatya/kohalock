import PageHeader from '../../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, BadgeCheck, ShieldAlert, QrCode, Settings, HelpCircle, History, BarChart3 } from 'lucide-react';
import RoleLayout from '../../components/RoleLayout';
import DataTable, { type TableColumn } from '../../components/DataTable';
import Badge from '../../components/Badge';
import { KADES_MENU } from './menu';
import apiClient from '../../lib/apiClient';
import toast from 'react-hot-toast';



const COLUMNS: TableColumn[] = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'program', label: 'Nama Program' },
  { key: 'dusun', label: 'Dusun' },
  { key: 'nominal', label: 'Nominal' },
  { key: 'status', label: 'Status' },
];

export default function DisbursementApprovalPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/disbursements?status=PENDING_KADES')
      .then(res => {
        const formatted = res.data.map((item: any) => ({
          id: item.id,
          tanggal: new Date(item.submittedAt).toISOString().split('T')[0],
          program: item.proposal?.judulUsulan || '-',
          dusun: item.proposal?.dusun || '-',
          nominal: `Rp ${Number(item.nominal).toLocaleString('id-ID')}`,
          status: '✅ Sekdes Valid'
        }));
        setData(formatted);
      })
      .catch(err => {
        console.error(err);
        toast.error('Gagal mengambil data antrean');
      });
  }, []);

  const handleRowClick = (id: string) => {
    navigate(`/kades/persetujuan-pencairan/${id}`);
  };

  const renderCell = (row: any, columnKey: string) => {
    let content;
    if (columnKey === 'nominal') {
      content = <span className="font-bold text-slate-900">{row.nominal}</span>;
    } else if (columnKey === 'status') {
      content = <Badge label={row.status} variant="success" />;
    } else if (columnKey === 'program') {
      content = <span className="font-bold text-blue-600 group-hover:underline">{row.program}</span>;
    } else {
      content = <span className="font-medium text-slate-600">{row[columnKey]}</span>;
    }

    // Wrap with clickable div to simulate row click without modifying DataTable
    return (
      <div 
        onClick={() => handleRowClick(row.id)}
        className="cursor-pointer w-full h-full min-h-[2rem] flex items-center group"
      >
        {content}
      </div>
    );
  };

  return (
    <RoleLayout menuItems={KADES_MENU} userName="Ahmad Fauzi" userRole="Kepala Desa" settingsPath="/kades/pengaturan">
      <div className="mb-8">
        <PageHeader title="Persetujuan Pencairan (Antrean Final)" description="Daftar pengajuan pencairan dana yang telah divalidasi oleh Sekretaris Desa. Klik pada baris untuk melihat detail dan melakukan otorisasi final." />

      </div>

      <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          Dokumen Menunggu Tanda Tangan
        </h2>
        <DataTable
          columns={COLUMNS}
          data={data}
          renderCell={renderCell}
        />
      </div>
    </RoleLayout>
  );
}
