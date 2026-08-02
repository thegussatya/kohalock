import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import { Search, LockKeyhole, FileSearch, CheckCircle, Clock, Workflow, X } from 'lucide-react';
import DocumentPreviewViewer from '../../components/DocumentPreviewViewer';
import DataTable, { type TableColumn } from '../../components/DataTable';
import { AUDITOR_MENU } from './menu';
import apiClient from '../../lib/apiClient';

type LedgerData = {
  id: string;
  onChainId: number;
  proposal: {
    judulUsulan: string;
    dusun: string;
    kategori: string;
  };
  status: string;
  submittedAt: string;
};

type TimelineStage = {
  tahap: string;
  aktor: string | null;
  timestamp: string | null;
};

type DisbursementDetail = LedgerData & {
  timeline: TimelineStage[];
  beritaAcaraUrl?: string;
  fotoUrl?: string;
  lpjUrl?: string;
};

const COLUMNS: TableColumn[] = [
  { key: 'onChainId', label: 'ID Blok' },
  { key: 'namaProgram', label: 'Nama Program' },
  { key: 'tahap', label: 'Tahap Terakhir' },
  { key: 'timestamp', label: 'Tanggal Masuk' },
  { key: 'aksi', label: 'Aksi' }
];

export default function LedgerExplorerPage() {
  const [data, setData] = useState<LedgerData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<DisbursementDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [aktor, setAktor] = useState('');
  const [nominalMin, setNominalMin] = useState('');
  const [nominalMax, setNominalMax] = useState('');
  const [hasIntervention, setHasIntervention] = useState(false);

  const fetchTimeline = async (searchStr = '', aktorStr = '', minStr = '', maxStr = '', hasInt = false) => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchStr) params.search = searchStr;
      if (aktorStr) params.aktor = aktorStr;
      if (minStr) params.nominalMin = minStr;
      if (maxStr) params.nominalMax = maxStr;
      if (hasInt) params.hasIntervention = 'true';

      const res = await apiClient.get('/ledger/timeline', { params });
      setData(res.data);
    } catch (error) {
      console.error('Error fetching ledger timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTimeline(searchQuery, aktor, nominalMin, nominalMax, hasIntervention);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, aktor, nominalMin, nominalMax, hasIntervention]);

  const handleOpenDetail = async (id: string) => {
    setSelectedId(id);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await apiClient.get(`/ledger/timeline/${id}`);
      setDetailData(res.data);
    } catch (error) {
      console.error('Error fetching detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const renderCell = (row: LedgerData, columnKey: string) => {
    if (columnKey === 'onChainId') {
      return (
        <span className="font-mono text-sm font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200 flex items-center gap-1 w-max">
          <LockKeyhole size={14} />
          {row.onChainId}
        </span>
      );
    }
    if (columnKey === 'namaProgram') {
      return row.proposal?.judulUsulan || '-';
    }
    if (columnKey === 'tahap') {
      return (
        <span className="text-sm font-semibold text-slate-700">
          {row.status.replace(/_/g, ' ')}
        </span>
      );
    }
    if (columnKey === 'timestamp') {
      return new Date(row.submittedAt).toLocaleString('id-ID');
    }
    if (columnKey === 'aksi') {
      return (
        <button
          onClick={() => handleOpenDetail(row.id)}
          className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1"
        >
          <Workflow size={16} /> Detail
        </button>
      );
    }
    return undefined;
  };

  return (
    <RoleLayout menuItems={AUDITOR_MENU} userName="Inspektur Andi" userRole="Auditor / APH">
      <PageHeader title="Kronologi Transaksi" description="Ledger Explorer untuk menelusuri jejak rekam transaksi secara transparan dan tidak dapat diubah (immutable)." />

      {/* Filter Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-8 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Filter Penelusuran Blockchain</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex flex-col">
            <label htmlFor="search" className="text-xs font-semibold text-slate-600 mb-1.5">
              Nama Program
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari program..."
                className="w-full border border-slate-300 bg-white rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="aktor" className="text-xs font-semibold text-slate-600 mb-1.5">
              Aktor (Kaur/Sekdes/Kades)
            </label>
            <input
              type="text"
              id="aktor"
              value={aktor}
              onChange={(e) => setAktor(e.target.value)}
              placeholder="Nama aktor..."
              className="border border-slate-300 bg-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="nominalMin" className="text-xs font-semibold text-slate-600 mb-1.5">
              Nominal Min (Rp)
            </label>
            <input
              type="number"
              id="nominalMin"
              value={nominalMin}
              onChange={(e) => setNominalMin(e.target.value)}
              placeholder="0"
              className="border border-slate-300 bg-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="nominalMax" className="text-xs font-semibold text-slate-600 mb-1.5">
              Nominal Max (Rp)
            </label>
            <input
              type="number"
              id="nominalMax"
              value={nominalMax}
              onChange={(e) => setNominalMax(e.target.value)}
              placeholder="100000000"
              className="border border-slate-300 bg-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col justify-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasIntervention}
                onChange={(e) => setHasIntervention(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-slate-700">Hanya Flag Merah</span>
            </label>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">Riwayat Blok Transaksi</h3>
        {loading && <span className="text-sm text-slate-500">Memuat data...</span>}
      </div>
      
      <DataTable
        columns={COLUMNS}
        data={data}
        renderCell={renderCell}
      />

      {/* Detail Modal */}
      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Workflow className="text-blue-600" /> Detail Kronologi
              </h3>
              <button 
                onClick={() => setSelectedId(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {detailLoading ? (
                <div className="text-center py-10 text-slate-500">Memuat detail blockchain...</div>
              ) : detailData ? (
                <div>
                  <div className="mb-6 bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2">{detailData.proposal.judulUsulan}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500 block">ID Transaksi / Blok</span>
                        <span className="font-mono font-medium text-blue-700 flex items-center gap-1 mt-1">
                          <LockKeyhole size={14} /> {detailData.onChainId}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Status Terakhir</span>
                        <span className="font-semibold text-slate-700 mt-1 block">
                          {detailData.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <DocumentPreviewViewer 
                      beritaAcaraUrl={detailData.beritaAcaraUrl}
                      fotoUrl={detailData.fotoUrl}
                      lpjUrl={detailData.lpjUrl}
                    />
                  </div>

                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileSearch size={18} /> Timeline Proses
                  </h4>
                  
                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-8 pb-4 ml-3">
                    {detailData.timeline.map((stage, idx) => {
                      const isCompleted = !!stage.timestamp;
                      
                      return (
                        <div key={idx} className="relative">
                          <div className={`absolute -left-[35px] bg-white rounded-full p-1 border-2 ${
                            isCompleted ? 'border-green-500 text-green-500' : 'border-slate-300 text-slate-300'
                          }`}>
                            {isCompleted ? <CheckCircle size={16} /> : <Clock size={16} />}
                          </div>
                          <div>
                            <h5 className={`font-bold ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                              {stage.tahap}
                            </h5>
                            <div className="text-sm mt-1 flex flex-col gap-1 text-slate-600">
                              {stage.aktor && (
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Oleh:</span> {stage.aktor}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                {isCompleted ? new Date(stage.timestamp!).toLocaleString('id-ID') : 'Menunggu proses'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">Gagal memuat detail</div>
              )}
            </div>
            
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedId(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </RoleLayout>
  );
}
