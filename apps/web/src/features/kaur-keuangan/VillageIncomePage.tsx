import React, { useState, useEffect } from 'react';
import apiClient from '../../lib/apiClient';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import MetricCard from '../../components/MetricCard';
import BudgetDonutChart, { type DonutData } from '../../components/BudgetDonutChart';
import DataTable, { type TableColumn } from '../../components/DataTable';
import Badge, { type BadgeVariant } from '../../components/Badge';
import { KAUR_KEUANGAN_MENU } from './menu';
import { INCOME_CATEGORIES, type IncomeCategoryGroup } from './constants';
import { Wallet, Plus, X, Search, Coins, ArrowUpRight, PiggyBank } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VillageIncomePage() {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({
    Transfer: 0,
    PADes: 0,
    'Pendapatan Lain-lain': 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formKelompok, setFormKelompok] = useState<IncomeCategoryGroup | ''>('');
  const [formJenis, setFormJenis] = useState('');
  const [formTanggal, setFormTanggal] = useState('');
  const [formNominal, setFormNominal] = useState('');
  const [formUraian, setFormUraian] = useState('');
  const [formSumber, setFormSumber] = useState('');

  // Filter State
  const [filterKelompok, setFilterKelompok] = useState<IncomeCategoryGroup | 'Semua'>('Semua');
  const [filterJenis, setFilterJenis] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Data
  const fetchSummary = async () => {
    try {
      const res = await apiClient.get('/village-income/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch summary', err);
    }
  };

  const fetchTableData = async () => {
    try {
      const params = new URLSearchParams();
      if (filterKelompok !== 'Semua') params.append('kelompok', filterKelompok);
      if (filterJenis !== 'Semua') params.append('jenis', filterJenis);
      if (searchQuery) params.append('search', searchQuery);
      
      const res = await apiClient.get(`/village-income?${params.toString()}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch table data', err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    // Optional debounce can be added here if needed for search
    const timer = setTimeout(() => {
      fetchTableData();
    }, 300);
    return () => clearTimeout(timer);
  }, [filterKelompok, filterJenis, searchQuery]);

  // Metrics derived from API Summary
  const totalTransfer = Number(summary['Transfer'] || 0);
  const totalPADes = Number(summary['PADes'] || 0);
  const totalLainLain = Number(summary['Pendapatan Lain-lain'] || 0);

  const donutData: DonutData[] = [
    { label: 'Transfer', value: totalTransfer, color: '#00AEEF' },
    { label: 'PADes', value: totalPADes, color: '#10B981' },
    { label: 'Pendapatan Lain-lain', value: totalLainLain, color: '#F59E0B' },
  ].filter(d => d.value > 0);

  const handleResetForm = () => {
    setFormKelompok('');
    setFormJenis('');
    setFormTanggal('');
    setFormNominal('');
    setFormUraian('');
    setFormSumber('');
  };

  const handleOpenModal = () => {
    handleResetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKelompok || !formJenis || !formTanggal || !formNominal || !formUraian) {
      toast.error('Mohon lengkapi data wajib!');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/village-income', {
        tanggal: formTanggal,
        kelompok: formKelompok,
        jenis: formJenis,
        uraian: formUraian,
        nominal: parseInt(formNominal.replace(/\D/g, ''), 10) || 0,
        sumberReferensi: formSumber || undefined,
      });

      toast.success('Pendapatan berhasil dicatat!');
      fetchSummary();
      fetchTableData();
      handleCloseModal();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Terjadi kesalahan pada server.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
  };

  // Table Setup
  const columns: TableColumn[] = [
    { key: 'tanggal', label: 'Tanggal' },
    { key: 'kelompok', label: 'Kelompok' },
    { key: 'jenis', label: 'Jenis' },
    { key: 'uraian', label: 'Uraian' },
    { key: 'sumber', label: 'Referensi/Sumber' },
    { key: 'nominal', label: 'Nominal' },
  ];

  const renderCell = (row: any, columnKey: string) => {
    switch (columnKey) {
      case 'tanggal':
        return <span className="text-slate-600 text-sm whitespace-nowrap">{new Date(row.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>;
      case 'kelompok':
        let variant: BadgeVariant = 'neutral';
        if (row.kelompok === 'Transfer') variant = 'info';
        else if (row.kelompok === 'PADes') variant = 'success';
        else if (row.kelompok === 'Pendapatan Lain-lain') variant = 'warning';
        return <Badge label={row.kelompok} variant={variant} />;
      case 'jenis':
        return <span className="text-slate-700 text-sm">{row.jenis}</span>;
      case 'uraian':
        return <span className="font-medium text-slate-900 text-sm">{row.uraian}</span>;
      case 'sumber':
        return <span className="text-slate-600 text-sm italic">{row.sumberReferensi || '-'}</span>;
      case 'nominal':
        return <span className="font-bold text-slate-900 text-sm">{formatRupiah(Number(row.nominal))}</span>;
      default:
        return (row as any)[columnKey];
    }
  };

  return (
    <RoleLayout
      menuItems={KAUR_KEUANGAN_MENU}
      userName="Hastuti"
      userRole="Kaur Keuangan"
      settingsPath="/kaur-keuangan/pengaturan"
    >
      <PageHeader 
        title="Pendapatan Desa" 
        description="Pencatatan sumber penerimaan kas desa dari Transfer, PADes, dan Pendapatan Lain-lain" 
      />

      {/* Metrics Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Total Transfer"
          value={formatRupiah(totalTransfer)}
          icon={<ArrowUpRight className="w-5 h-5 text-sky-600" />}
          variant="info"
        />
        <MetricCard
          title="Total PADes"
          value={formatRupiah(totalPADes)}
          icon={<Wallet className="w-5 h-5 text-emerald-600" />}
          variant="success"
        />
        <MetricCard
          title="Pendapatan Lain-lain"
          value={formatRupiah(totalLainLain)}
          icon={<PiggyBank className="w-5 h-5 text-amber-600" />}
          variant="warning"
        />
      </div>

      {donutData.length > 0 && (
        <div className="mb-8">
          <BudgetDonutChart 
            title="Komposisi Pendapatan Desa (Berdasarkan Filter)" 
            data={donutData} 
          />
        </div>
      )}

      {/* Actions and Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <button 
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Catat Pendapatan
        </button>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari uraian atau referensi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          
          <select 
            value={filterKelompok}
            onChange={(e) => {
              setFilterKelompok(e.target.value as IncomeCategoryGroup | 'Semua');
              setFilterJenis('Semua'); // reset sub-category
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="Semua">Semua Kelompok</option>
            {Object.keys(INCOME_CATEGORIES).map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>

          <select 
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            disabled={filterKelompok === 'Semua'}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="Semua">Semua Jenis</option>
            {filterKelompok !== 'Semua' && INCOME_CATEGORIES[filterKelompok as IncomeCategoryGroup].map(j => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mb-12">
        <DataTable 
          columns={columns}
          data={data}
          renderCell={renderCell}
        />
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Catat Pendapatan</h3>
                  <p className="text-xs text-slate-500">Rekam penerimaan kas masuk (PADes, Transfer, dll)</p>
                </div>
              </div>
              <button 
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="income-form" onSubmit={handleSubmit} className="space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Kelompok <span className="text-red-500">*</span></label>
                    <select 
                      value={formKelompok}
                      onChange={(e) => {
                        setFormKelompok(e.target.value as IncomeCategoryGroup);
                        setFormJenis('');
                      }}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    >
                      <option value="" disabled>-- Pilih Kelompok --</option>
                      {Object.keys(INCOME_CATEGORIES).map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Jenis <span className="text-red-500">*</span></label>
                    <select 
                      value={formJenis}
                      onChange={(e) => setFormJenis(e.target.value)}
                      required
                      disabled={!formKelompok}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm disabled:bg-slate-50"
                    >
                      <option value="" disabled>-- Pilih Jenis --</option>
                      {formKelompok && INCOME_CATEGORIES[formKelompok as IncomeCategoryGroup].map(j => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Tanggal <span className="text-red-500">*</span></label>
                    <input 
                      type="date"
                      value={formTanggal}
                      onChange={(e) => setFormTanggal(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Nominal (Rp) <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      placeholder="Contoh: 15000000"
                      value={formNominal}
                      onChange={(e) => {
                        // Allow only numbers
                        const val = e.target.value.replace(/\D/g, '');
                        // Format with thousand separators
                        const formatted = val ? new Intl.NumberFormat('id-ID').format(parseInt(val, 10)) : '';
                        setFormNominal(formatted);
                      }}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Uraian / Keterangan <span className="text-red-500">*</span></label>
                  <textarea 
                    rows={2}
                    placeholder="Contoh: Pencairan Dana Desa Tahap 1"
                    value={formUraian}
                    onChange={(e) => setFormUraian(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Referensi / Sumber <span className="text-slate-400 font-normal">(Opsional)</span></label>
                  <input 
                    type="text"
                    placeholder="Contoh: SP2D Pusat, Rekening Bank, Nama Penyewa"
                    value={formSumber}
                    onChange={(e) => setFormSumber(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                  />
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0">
              <button 
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit"
                form="income-form"
                disabled={isSubmitting}
                className="px-5 py-2 text-sm font-bold bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed text-white rounded-lg shadow-sm transition-colors flex items-center justify-center min-w-[160px]"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : (
                  'Simpan Pendapatan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}
