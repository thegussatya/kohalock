import React, { useState } from 'react';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import DataTable, { type TableColumn } from '../../components/DataTable';
import { KAUR_KEUANGAN_MENU } from './menu';
import { toast } from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

const COLUMNS: TableColumn[] = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'idAsal', label: 'ID Transaksi Asal' },
  { key: 'alasan', label: 'Alasan' },
  { key: 'nilai', label: 'Nilai Koreksi' },
];

const DUMMY_DATA = [
  { id: 1, tanggal: '05 Okt 2023', idAsal: 'TRX-101', alasan: 'Kelebihan catat nominal pembelian', nilai: '-Rp 5.000.000' },
  { id: 2, tanggal: '12 Okt 2023', idAsal: 'TRX-095', alasan: 'Kekurangan catat pajak pungutan', nilai: '+Rp 1.500.000' },
];

export default function CorrectionTransactionPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState('');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');

  const renderCell = (row: typeof DUMMY_DATA[0], columnKey: string) => {
    switch (columnKey) {
      case 'tanggal':
        return <span className="text-slate-600 text-sm">{row.tanggal}</span>;
      case 'idAsal':
        return <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-700 border border-slate-200">{row.idAsal}</span>;
      case 'alasan':
        return <span className="text-slate-900 text-sm">{row.alasan}</span>;
      case 'nilai':
        const isNegative = row.nilai.startsWith('-');
        return <span className={`text-sm font-bold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>{row.nilai}</span>;
      default:
        return (row as any)[columnKey];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx || !amount || !reason) return;
    
    toast.success(`Transaksi koreksi berhasil dicatat, merujuk ke transaksi asal ${selectedTx}`);
    setShowModal(false);
    setSelectedTx('');
    setReason('');
    setAmount('');
  };

  const isNegativeInput = amount.startsWith('-');
  const isPositiveInput = amount.startsWith('+') || (amount.length > 0 && !isNegativeInput && amount !== '0');
  
  let inputColorClass = 'text-slate-900';
  if (isNegativeInput) inputColorClass = 'text-red-600 font-bold bg-red-50';
  else if (isPositiveInput) inputColorClass = 'text-green-600 font-bold bg-green-50';

  return (
    <RoleLayout
      menuItems={KAUR_KEUANGAN_MENU}
      userName="Hastuti"
      userRole="Kaur Keuangan"
      settingsPath="/kaur-keuangan/pengaturan"
    >
      <div className="relative">
        <div className="absolute top-0 right-0 z-10">
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm font-bold flex items-center justify-center gap-2 text-sm transition-colors active:scale-95"
          >
            <Plus className="w-5 h-5" /> Buat Transaksi Koreksi
          </button>
        </div>
        <PageHeader 
          title="Transaksi Koreksi" 
          description="Perbaikan kesalahan pencatatan melalui transaksi pembalik, tanpa mengubah data asli yang sudah terkunci" 
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable
          columns={COLUMNS}
          data={DUMMY_DATA}
          renderCell={renderCell}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Formulir Transaksi Koreksi</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-5">
                <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Transaksi Asal yang Dikoreksi</label>
                <select 
                  required
                  value={selectedTx}
                  onChange={(e) => setSelectedTx(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                >
                  <option value="" disabled>-- Pilih ID Transaksi --</option>
                  <option value="TRX-101">TRX-101 (Rp 50.000.000) - Pembelian Material</option>
                  <option value="TRX-095">TRX-095 (Rp 5.000.000) - Pajak Pungutan</option>
                  <option value="TRX-082">TRX-082 (Rp 12.000.000) - ATK Desa</option>
                </select>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-bold text-slate-700 mb-2">Nilai Koreksi</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-semibold">Rp</span>
                  </div>
                  <input 
                    type="text" 
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="-5.000.000 atau +1.500.000"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow ${inputColorClass}`}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Gunakan tanda minus (-) untuk pembalik (mengurangi saldo) atau plus (+) untuk menambah saldo.</p>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-2">Alasan Koreksi</label>
                <textarea 
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow resize-none"
                  placeholder="Jelaskan alasan pencatatan pembalik ini secara detail..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-sm"
                >
                  Ajukan Koreksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}
