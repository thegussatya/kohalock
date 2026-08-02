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
  { key: 'tanggal', label: 'TANGGAL' },
  { key: 'program', label: 'NAMA PROGRAM' },
  { key: 'dusun', label: 'DUSUN' },
  { key: 'nominal', label: 'NOMINAL' },
  { key: 'status', label: 'STATUS' },
  { key: 'aksi', label: 'AKSI' },
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
    if (columnKey === 'nominal') {
      return <span className="font-bold text-slate-900">{row.nominal}</span>;
    }
    if (columnKey === 'status') {
      return <Badge label={row.status} variant="success" />;
    }
    if (columnKey === 'program') {
      return <span className="font-bold text-slate-900">{row.program}</span>;
    }
    if (columnKey === 'aksi') {
      return (
        <button
          onClick={() => handleRowClick(row.id)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
        >
          Periksa Berkas
        </button>
      );
    }
    
    return <span className="font-medium text-slate-600">{row[columnKey]}</span>;
  };

  return (
    <RoleLayout menuItems={KADES_MENU} userName="Ahmad Fauzi" userRole="Kepala Desa" settingsPath="/kades/pengaturan">
      <div className="mb-8">
        <PageHeader title="Persetujuan Pencairan (Antrean Final)" description="Daftar pengajuan pencairan dana yang telah divalidasi oleh Sekretaris Desa. Klik pada baris untuk melihat detail dan melakukan otorisasi final." />

      </div>

      <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
        Dokumen Menunggu Tanda Tangan
      </h2>
      <DataTable
        columns={COLUMNS}
        data={data}
        renderCell={renderCell}
      />
    </RoleLayout>
  );
}
