import { FileText } from 'lucide-react';
import { getMediaUrl } from '../lib/getMediaUrl';

interface DocumentPreviewViewerProps {
  beritaAcaraUrl?: string;
  lpjUrl?: string;
}

export default function DocumentPreviewViewer({ beritaAcaraUrl, lpjUrl }: DocumentPreviewViewerProps) {
  return (
    <div className="grid grid-cols-1 gap-4">

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Hash Berita Acara</h4>
            <p className="text-sm font-semibold text-green-600">{beritaAcaraUrl ? 'Dokumen Otentik' : 'Belum Ada'}</p>
          </div>
        </div>
        {beritaAcaraUrl && (
          <div className="mt-2 flex flex-col gap-2">
            <iframe src={getMediaUrl(beritaAcaraUrl)} title="Berita Acara" className="w-full h-[600px] border border-slate-200 rounded-lg"></iframe>
            <a href={getMediaUrl(beritaAcaraUrl)} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              Buka Dokumen Penuh <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          </div>
        )}
      </div>

      {lpjUrl && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-slate-900 text-sm mb-1">Dokumen Pendukung Termin</h4>
              </div>
              {lpjUrl.endsWith('.pdf') ? (
                <iframe src={getMediaUrl(lpjUrl)} title="LPJ" className="w-full h-[600px] border border-slate-200 rounded-lg"></iframe>
              ) : (
                <img src={getMediaUrl(lpjUrl)} alt="LPJ" className="w-full h-[600px] object-cover rounded-lg border border-slate-200" />
              )}
              <a href={getMediaUrl(lpjUrl)} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                Buka Dokumen Penuh <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
