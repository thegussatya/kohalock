import PageHeader from '../../components/PageHeader';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';

import RoleLayout from '../../components/RoleLayout';
import GeotagCameraCapture from '../../components/GeotagCameraCapture';
import { KAUR_TEKNIS_MENU } from './menu';
import apiClient from '../../lib/apiClient';

export default function SubmitDisbursementPage() {
  const [programList, setProgramList] = useState<any[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [sisaPagu, setSisaPagu] = useState<number>(0);
  const [keterangan, setKeterangan] = useState('');
  const [nominal, setNominal] = useState<string>('');
  const [geotagCoords, setGeotagCoords] = useState<{lat: number, lng: number} | null>(null);
  const [geotagPhoto, setGeotagPhoto] = useState<string | null>(null);
  const [beritaAcaraFile, setBeritaAcaraFile] = useState<File | null>(null);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check for edit mode
    const params = new URLSearchParams(window.location.search);
    const edit = params.get('edit');
    if (edit) {
      setEditId(edit);
      setIsEditing(true);
      // Fetch existing disbursement
      apiClient.get(`/disbursements/${edit}`).then(res => {
        const d = res.data;
        setSelectedProgramId(d.proposalId);
        setKeterangan(d.keterangan);
        setNominal(d.nominal ? new Intl.NumberFormat('id-ID').format(Number(d.nominal)) : '');
        if (d.geotagLat && d.geotagLng) {
          setGeotagCoords({ lat: d.geotagLat, lng: d.geotagLng });
        }
      }).catch(err => {
        console.error(err);
        toast.error('Gagal mengambil data pengajuan yang akan direvisi');
      });
    }

    apiClient.get('/proposals').then(res => {
      setProgramList(res.data);
    }).catch(err => {
      console.error(err);
      toast.error('Gagal mengambil daftar program');
    });
  }, []);

  useEffect(() => {
    if (selectedProgramId) {
      apiClient.get(`/disbursements/sisa-pagu/${selectedProgramId}`).then(res => {
        setSisaPagu(Number(res.data.sisaPagu));
      }).catch(err => {
        console.error(err);
        toast.error('Gagal mengambil sisa pagu');
      });
    } else {
      setSisaPagu(0);
    }
  }, [selectedProgramId]);
  
  const selectedProgram = programList.find(p => p.id === selectedProgramId);
  
  // Validasi sederhana: Cek apakah nominal melebihi sisa pagu anggaran
  const parsedNominal = Number(nominal.replace(/\./g, ''));
  const isNominalExceeds = parsedNominal > sisaPagu;

  return (
    <RoleLayout menuItems={KAUR_TEKNIS_MENU} userName="Budi Santoso" userRole="Kaur Teknis">
      <PageHeader 
        title={isEditing ? "Revisi Pengajuan Pencairan" : "Ajukan Pencairan"} 
        description={isEditing ? "Perbaiki data pengajuan yang dikembalikan oleh Sekdes." : "Formulir pengajuan pencairan dana untuk program yang telah disetujui di Musrembang."} 
      />


      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 max-w-4xl">
        <form onSubmit={async (e) => { 
          e.preventDefault(); 
          if (!selectedProgramId) {
            toast.error("Pilih program terlebih dahulu");
            return;
          }
          setIsSubmitting(true);
            
          const rawNominal = Number(nominal.replace(/\./g, ''));
          const isNominalExceeds = rawNominal > sisaPagu;

          if (!nominal || rawNominal <= 0) {
            toast.error('Nominal tidak valid');
            setIsSubmitting(false);
            return;
          }
          if (isNominalExceeds) {
            toast.error('Nominal melebihi sisa pagu!');
            setIsSubmitting(false);
            return;
          }
          if (!keterangan) {
            toast.error('Keterangan wajib diisi');
            setIsSubmitting(false);
            return;
          }
          if (!geotagCoords) {
            toast.error("Silakan ambil foto bukti lapangan beserta geotagging terlebih dahulu");
            setIsSubmitting(false);
            return;
          }

          try {
            const formData = new FormData();
            formData.append('proposalId', selectedProgramId);
            formData.append('keterangan', keterangan);
            formData.append('nominal', rawNominal.toString());
            formData.append('geotagLat', geotagCoords.lat.toString());
            formData.append('geotagLng', geotagCoords.lng.toString());
            
            if (beritaAcaraFile) {
              formData.append('beritaAcara', beritaAcaraFile);
            }
            
            if (geotagPhoto) {
              // Convert dataURL to Blob
              const res = await fetch(geotagPhoto);
              const blob = await res.blob();
              formData.append('foto', blob, 'geotag.jpg');
            }

            let response;
            if (isEditing && editId) {
              response = await apiClient.put(`/disbursements/${editId}`, {
                keterangan,
                nominal: rawNominal,
                geotagLat: geotagCoords.lat,
                geotagLng: geotagCoords.lng
              });
            } else {
              response = await apiClient.post('/disbursements', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
            }

            if (response.status === 201 || response.status === 200) {
              toast.success(isEditing ? "Revisi berhasil dikirim kembali ke Sekdes" : "Pengajuan pencairan berhasil dikirim ke Sekdes");
              // Refresh sisa pagu
              apiClient.get(`/disbursements/sisa-pagu/${selectedProgramId}`).then(res => {
                setSisaPagu(Number(res.data.sisaPagu));
              });
              
              if (isEditing) {
                // If edit mode is complete, optionally redirect back to rejection history
                setTimeout(() => {
                  window.location.href = '/kaur-teknis/riwayat-penolakan';
                }, 1500);
              } else {
                setNominal('');
                setKeterangan('');
                setGeotagCoords(null);
              }
            }
          } catch (error: any) {
            const msg = error.response?.data?.error || error.response?.data?.message || "Gagal mengajukan pencairan";
            toast.error(msg);
          }
        }}>
          
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Program Terdaftar */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Program Terdaftar</label>
              <select 
                value={selectedProgramId}
                onChange={(e) => {
                  setSelectedProgramId(e.target.value);
                  setNominal(''); // Reset nominal ketika ganti program agar validasi ikut terset
                }}
                className="w-full p-3.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-medium bg-white transition-colors"
              >
                <option value="" disabled>-- Pilih Program Tersedia --</option>
                {programList.map(p => (
                  <option key={p.id} value={p.id}>{p.judulUsulan}</option>
                ))}
              </select>
            </div>

            {/* Read Only Sisa Pagu */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Sisa Pagu Anggaran
              </span>
              <span className={`text-2xl font-bold ${selectedProgram ? 'text-blue-700' : 'text-slate-400'}`}>
                {selectedProgram ? `Rp ${sisaPagu.toLocaleString('id-ID')}` : 'Rp 0'}
              </span>
            </div>
          </div>

          {/* Nominal Pengajuan */}
          <div className="max-w-md mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Nominal Pengajuan</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rp</span>
              <input 
                type="text" 
                value={nominal}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  const formatted = val ? new Intl.NumberFormat('id-ID').format(parseInt(val, 10)) : '';
                  setNominal(formatted);
                }}
                disabled={!selectedProgramId}
                className={`w-full pl-12 p-3.5 border rounded-lg focus:ring-2 outline-none text-base font-bold transition-all ${
                  !selectedProgramId 
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : isNominalExceeds 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 text-red-700' 
                      : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white'
                }`}
                placeholder={selectedProgramId ? "Masukkan angka pengajuan..." : "Pilih program terlebih dahulu"}
              />
            </div>
            {isNominalExceeds && (
              <p className="text-sm font-bold text-red-600 mt-2 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Peringatan: Nominal melebihi sisa pagu anggaran!
              </p>
            )}
          </div>

          {/* Keterangan */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Keterangan Pengajuan</label>
            <textarea 
              rows={4}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none transition-colors"
              placeholder="Tuliskan tujuan pencairan secara jelas dan rinci..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* Berita Acara Fisik */}
            <div className="flex flex-col">
              <label className="block text-sm font-bold text-slate-700 mb-2">Berita Acara Fisik (Lampiran PDF)</label>
              <input 
                type="file" 
                accept=".pdf"
                onChange={(e) => setBeritaAcaraFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-600 file:mr-4 file:py-3 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-300 rounded-lg cursor-pointer bg-white transition-colors"
              />
              <p className="text-xs text-slate-500 mt-2 font-medium">Hanya mendukung format .pdf dengan ukuran maksimal 5MB.</p>
            </div>

            {/* Bukti Lapangan / Kamera Geotagging */}
            <div className="flex flex-col">
              <label className="block text-sm font-bold text-slate-700 mb-2">Bukti Lapangan (Geotagging)</label>
              <GeotagCameraCapture onCapture={(coords, photoUrl) => {
                setGeotagCoords(coords);
                setGeotagPhoto(photoUrl);
              }} />
            </div>
          </div>

          {/* Action */}
          <div className="pt-6 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-8 py-3.5 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors uppercase tracking-wide text-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Memproses..." : (isEditing ? "Tanda Tangani & Kirim Revisi" : "Tanda Tangani & Ajukan")}
            </button>
          </div>
        </form>
      </div>
    </RoleLayout>
  );
}
