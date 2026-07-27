import PageHeader from '../../components/PageHeader';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { LayoutDashboard, FileCheck, PieChart, MessageCircle, ArrowLeft, HelpCircle, History } from 'lucide-react';
import RoleLayout from '../../components/RoleLayout';
import { SEKDES_MENU } from './menu';
import apiClient from '../../lib/apiClient';

export default function ClarificationInboxPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await apiClient.get('/clarifications');
      setMessages(res.data);
      if (selectedTicket) {
        const updated = res.data.find((m: any) => m.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengambil data inbox');
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setLoading(true);
    try {
      await apiClient.post(`/clarifications/${selectedTicket.id}/reply`, {
        jawaban: replyText.trim()
      });
      toast.success("Balasan berhasil dikirim & dipublikasikan");
      setReplyText('');
      fetchMessages();
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengirim balasan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleLayout menuItems={SEKDES_MENU} userName="Siti Rahma" userRole="Sekretaris Desa">
      <PageHeader title="Inbox Klarifikasi Warga" description="Layanan interaktif penanganan aduan dan keluhan warga terkait pelaksanaan program desa." />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Inbox List Panel */}
        <div className="w-full lg:w-5/12 flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => { setSelectedTicket(msg); setIsMobileDetailOpen(true); }}
              className={`p-5 border rounded-xl cursor-pointer transition-all ${
                selectedTicket?.id === msg.id
                  ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-3 gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-full border ${
                    msg.status === 'SELESAI'
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                  }`}
                >
                  {msg.status === 'SELESAI' ? 'Selesai' : 'Menunggu Jawaban'}
                </span>
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  {new Date(msg.createdAt).toLocaleString('id-ID')}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2 line-clamp-1">{msg.programId || 'Program Umum'}</h3>
              <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{msg.pertanyaan}</p>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="text-center p-8 bg-white border border-slate-200 rounded-xl shadow-sm">
              <p className="text-slate-500 font-medium">Belum ada tiket masuk dari warga.</p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div 
          className={`w-full lg:w-7/12 ${
            isMobileDetailOpen 
              ? 'fixed inset-0 z-50 bg-slate-50 overflow-y-auto p-4 lg:relative lg:inset-auto lg:z-auto lg:bg-transparent lg:p-0 lg:overflow-visible' 
              : 'hidden lg:block'
          }`}
        >
          {selectedTicket ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm lg:sticky lg:top-6 min-h-full">
              {/* Mobile Back Button */}
              <div className="lg:hidden mb-6">
                <button 
                  onClick={() => setIsMobileDetailOpen(false)}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium bg-white border border-slate-200 px-4 py-2 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Kembali ke Daftar
                </button>
              </div>
              
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">Detail Tiket {selectedTicket.id.split('-')[0]}</h2>
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                    selectedTicket.status === 'SELESAI'
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                  }`}
                >
                  {selectedTicket.status === 'SELESAI' ? 'Selesai' : 'Menunggu Jawaban'}
                </span>
              </div>
              
              <div className="space-y-5 mb-8">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Program Terkait</label>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{selectedTicket.programId || 'Umum / Tidak Spesifik'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pengirim</label>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{selectedTicket.namaWarga || 'Anonim'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Waktu Pengaduan</label>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {new Date(selectedTicket.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 mt-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Isi Keluhan</label>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedTicket.pertanyaan}</p>
                </div>
                {selectedTicket.status === 'SELESAI' && selectedTicket.jawaban && (
                  <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mt-2">
                    <label className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block">Tanggapan Resmi</label>
                    <p className="text-sm text-blue-900 leading-relaxed">{selectedTicket.jawaban}</p>
                  </div>
                )}
              </div>

              {/* Reply Form */}
              <div className="border-t border-slate-200 pt-6">
                <label className="block text-sm font-bold text-slate-800 mb-3">
                  Balasan Resmi Pemerintah Desa
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm mb-4 resize-none transition-colors"
                  placeholder={
                    selectedTicket.status === 'SELESAI'
                      ? "Tiket sudah diselesaikan. Tidak bisa membalas lagi."
                      : "Ketik jawaban resmi dan klarifikasi Anda di sini..."
                  }
                  disabled={selectedTicket.status === 'SELESAI' || loading}
                ></textarea>
                <button
                  type="button"
                  disabled={selectedTicket.status === 'SELESAI' || loading || !replyText.trim()}
                  className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                  onClick={handleReply}
                >
                  {selectedTicket.status === 'SELESAI' 
                    ? 'Tiket Telah Selesai' 
                    : loading 
                      ? 'Mengirim...' 
                      : 'Kirim Balasan Resmi'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-center h-full min-h-[500px]">
              <div className="w-20 h-20 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Pilih Pesan Pengaduan</h3>
              <p className="text-slate-500 max-w-sm">
                Klik salah satu tiket di sebelah kiri untuk melihat detail dan membalas keluhan warga.
              </p>
            </div>
          )}
        </div>
      </div>
    </RoleLayout>
  );
}
