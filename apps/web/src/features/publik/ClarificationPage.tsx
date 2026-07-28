import PageHeader from '../../components/PageHeader';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';

import RoleLayout from '../../components/RoleLayout';
import Badge from '../../components/Badge';
import { PUBLIK_MENU } from './menu';
import apiClient from '../../lib/apiClient';

export default function ClarificationPage() {
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchDiscussions = async () => {
    try {
      const res = await apiClient.get('/public/clarifications');
      setDiscussions(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengambil data diskusi');
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const handleSend = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      await apiClient.post('/public/clarifications', {
        namaWarga: name.trim() || undefined,
        pertanyaan: question.trim()
      });
      toast.success('Pertanyaan berhasil dikirim!');
      setName('');
      setQuestion('');
      fetchDiscussions();
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengirim pertanyaan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleLayout menuItems={PUBLIK_MENU} userName="Warga" userRole="Masyarakat">
      <div className="mb-8">
        <PageHeader title="Klarifikasi (Tanya Jawab Publik)" description="Ruang diskusi terbuka antara masyarakat dan Pemerintah Desa. Sampaikan pertanyaan, keluhan, atau minta penjelasan mengenai program kerja dan anggaran desa." />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Daftar Diskusi Publik */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
            Diskusi Terbuka
          </h2>
          
          <div className="flex flex-col gap-5">
            {discussions.map((discussion) => (
              <div key={discussion.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-sm">
                      {!discussion.namaWarga ? '?' : discussion.namaWarga.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{discussion.namaWarga || 'Anonim'}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {new Date(discussion.createdAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div>
                    {discussion.status === 'SELESAI' ? (
                      <Badge 
                        label={
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            Telah Dijawab
                          </span>
                        } 
                        variant="success" 
                      />
                    ) : (
                      <Badge 
                        label={
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Menunggu Jawaban
                          </span>
                        } 
                        variant="warning" 
                      />
                    )}
                  </div>
                </div>
                
                <p className="text-slate-800 leading-relaxed font-medium mb-4">
                  "{discussion.pertanyaan}"
                </p>

                {discussion.status === 'SELESAI' && discussion.jawaban && (
                  <div className="ml-4 pl-4 border-l-2 border-blue-200 bg-blue-50/50 p-4 rounded-r-xl">
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Tanggapan Resmi (Sekdes)
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {discussion.jawaban}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {discussions.length === 0 && (
              <div className="text-center p-8 bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
                <p className="text-slate-500 font-medium">Belum ada diskusi terbuka.</p>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Formulir Tanya */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sticky top-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Tulis Pertanyaan Baru
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">
              Pertanyaan Anda akan diteruskan ke Inbox Klarifikasi Warga dan dijawab langsung oleh perangkat desa terkait.
            </p>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nama Lengkap <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Anonim"
                  disabled={loading}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-slate-50 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Isi Pertanyaan / Keluhan <span className="text-red-500">*</span>
                </label>
                <textarea 
                  rows={5}
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="Tuliskan keluhan atau hal yang ingin Anda klarifikasi..."
                  disabled={loading}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm resize-none bg-slate-50 focus:bg-white transition-colors"
                ></textarea>
              </div>

              <button
                onClick={handleSend}
                disabled={!question.trim() || loading}
                className="w-full px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 text-sm"
              >
                {loading ? 'Mengirim...' : 'Kirim Pertanyaan'}
                {!loading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
              </button>
            </div>
          </div>
        </div>

      </div>
    </RoleLayout>
  );
}
