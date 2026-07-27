import React from 'react';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import Badge from '../../components/Badge';
import { useParams, Link } from 'react-router-dom';
import { LayoutDashboard, FilePlus, FolderKanban, Wallet, History, HelpCircle, ArrowLeft, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { KAUR_TEKNIS_MENU } from './menu';



export default function ProgramDetailPage() {
  const { id } = useParams();

  // In real app, fetch program details by id
  const program = {
    id,
    name: 'Pembangunan Posyandu Dusun 1',
    category: 'Kesehatan',
    status: 'Aktif',
    totalFunds: 150000000,
  };

  const timelineEvents = [
    { id: 1, termin: 'Termin 1 (30%)', status: 'Selesai', date: '12 Jan 2026', amount: 45000000, note: 'Pencairan tahap awal untuk pembelian material pondasi telah selesai dan divalidasi oleh Sekdes.' },
    { id: 2, termin: 'Termin 2 (40%)', status: 'Ditolak', date: '05 Mar 2026', amount: 60000000, note: 'Foto geotag tidak sesuai dengan lokasi koordinat proyek. Harap upload ulang bukti progres lapangan.' },
    { id: 3, termin: 'Termin 2 (Revisi)', status: 'Diproses', date: '10 Mar 2026', amount: 60000000, note: 'Dokumen revisi telah diajukan dan sedang menunggu verifikasi Sekdes.' },
  ];

  return (
    <RoleLayout menuItems={KAUR_TEKNIS_MENU} userName="Budi Santoso" userRole="Kaur Teknis">
      <div className="mb-6">
        <Link 
          to="/kaur-teknis/program-saya" 
          className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Program Saya
        </Link>
      </div>

      <PageHeader 
        title={program.name} 
        description={`Kategori: ${program.category} | Total Pagu: Rp ${program.totalFunds.toLocaleString('id-ID')}`}
      />

      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Riwayat Termin Pencairan</h3>
        
        <div className="relative border-l-2 border-slate-200 ml-3 md:ml-4 space-y-8">
          {timelineEvents.map((event) => (
            <div key={event.id} className="relative pl-6 md:pl-8">
              {/* Timeline dot/icon */}
              <div className="absolute -left-[11px] md:-left-[13px] top-1 bg-white p-1">
                {event.status === 'Selesai' && <CheckCircle2 className="w-5 h-5 text-green-500 bg-white" />}
                {event.status === 'Diproses' && <Clock className="w-5 h-5 text-amber-500 bg-white" />}
                {event.status === 'Ditolak' && <XCircle className="w-5 h-5 text-red-500 bg-white" />}
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{event.termin}</h4>
                    <div className="text-sm font-medium text-slate-500 mt-0.5">Rp {event.amount.toLocaleString('id-ID')} • {event.date}</div>
                  </div>
                  <div>
                    <Badge 
                      label={event.status} 
                      variant={event.status === 'Selesai' ? 'success' : event.status === 'Diproses' ? 'warning' : 'danger'} 
                    />
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mt-3">
                  {event.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleLayout>
  );
}
