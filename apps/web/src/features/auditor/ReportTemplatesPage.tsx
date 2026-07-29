import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import { FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AUDITOR_MENU } from './menu';
import { useState, useEffect } from 'react';
import apiClient from '../../lib/apiClient';

export default function ReportTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/dashboard/auditor/templates')
      .then(res => setTemplates(res.data))
      .catch(console.error);
  }, []);

  const handleUseTemplate = () => {
    toast.success('Template siap diisi');
  };

  return (
    <RoleLayout menuItems={AUDITOR_MENU} userName="Tim Auditor" userRole="Auditor Independen">
      <PageHeader 
        title="Pustaka Template Laporan" 
        description="Pilih dari berbagai format dokumen forensik terstandar yang tersedia."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {templates.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-slate-100 p-3 rounded-xl">
                <FileText className="w-6 h-6 text-slate-700" />
              </div>
              <h3 className="font-bold text-slate-800 leading-tight">{item.title}</h3>
            </div>
            
            <p className="text-sm text-slate-500 mb-6 flex-1">
              {item.description}
            </p>
            
            <button 
              onClick={handleUseTemplate}
              className="w-full py-2.5 bg-brand-50 text-brand-600 font-bold text-sm rounded-xl hover:bg-brand-100 transition-colors"
            >
              Gunakan Template
            </button>
          </div>
        ))}
      </div>
    </RoleLayout>
  );
}
