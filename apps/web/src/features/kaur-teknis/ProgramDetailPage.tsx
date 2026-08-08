import { useState, useEffect } from 'react';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import Badge from '../../components/Badge';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, XCircle, FileText, Edit } from 'lucide-react';
import { KAUR_TEKNIS_MENU } from './menu';
import apiClient from '../../lib/apiClient';



export default function ProgramDetailPage() {
  const { id } = useParams();
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      apiClient.get(`/public/projects/${id}`)
        .then(res => {
          setProgram(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id, refreshKey]);


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


      {loading ? (
        <div className="py-16 text-center text-slate-500 font-bold animate-pulse">Memuat detail program...</div>
      ) : !program ? (
        <div className="py-16 text-center text-slate-500 font-bold">Program tidak ditemukan</div>
      ) : (
        <>
          <PageHeader 
            title={program.judulUsulan} 
            description={`Kategori: ${program.kategori} | Total Pagu: Rp ${Number(program.paguMaksimal).toLocaleString('id-ID')}`}
          />

      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Riwayat Termin Pencairan</h3>
        
        {program.terms && program.terms.length > 0 ? (
          <div className="relative border-l-2 border-slate-200 ml-3 md:ml-4 space-y-8">
            {program.terms.map((event: any) => (
              <div key={event.id} className="relative pl-6 md:pl-8">
                {/* Timeline dot/icon */}
                <div className="absolute -left-[11px] md:-left-[13px] top-1 bg-white p-1">
                  {event.status === 'DISBURSED' && <CheckCircle2 className="w-5 h-5 text-green-500 bg-white" />}
                  {['PENDING_SEKDES', 'PENDING_KADES', 'PENDING_EKSEKUSI'].includes(event.status) && <Clock className="w-5 h-5 text-amber-500 bg-white" />}
                  {['REJECTED_SYSTEM', 'RETURNED_FOR_REVISION'].includes(event.status) && <XCircle className="w-5 h-5 text-red-500 bg-white" />}
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 md:p-5">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">{event.term}</h4>
                      <div className="text-sm font-medium text-slate-500 mt-0.5">Rp {Number(event.anggaran).toLocaleString('id-ID')} • {new Date(event.tanggal).toLocaleDateString('id-ID')}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        label={event.status === 'DISBURSED' ? 'Selesai' : (['REJECTED_SYSTEM', 'RETURNED_FOR_REVISION'].includes(event.status) ? 'Ditolak/Revisi' : 'Diproses')} 
                        variant={event.status === 'DISBURSED' ? 'success' : (['REJECTED_SYSTEM', 'RETURNED_FOR_REVISION'].includes(event.status) ? 'danger' : 'warning')} 
                      />
                      {event.status === 'DISBURSED' && (
                        <div className="mt-2 flex gap-2">
                          {event.lpjTeknisUrl && event.lpjStatus === 'LOCKED_ONCHAIN' ? (
                            <a 
                              href={event.lpjTeknisUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Lihat Dokumen Termin
                            </a>
                          ) : (
                            <button
                              onClick={() => {
                                navigate(`/kaur-teknis/lengkapi-lpj/${event.id}`);
                              }}
                              className="inline-flex items-center text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              {event.lpjStatus === 'DRAFT' ? 'Lanjutkan LPJ (Draft)' : 'Lengkapi LPJ (Rincian)'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 italic py-6">Belum ada riwayat termin pencairan.</div>
        )}
      </div>
      </>
      )}

    </RoleLayout>
  );
}
