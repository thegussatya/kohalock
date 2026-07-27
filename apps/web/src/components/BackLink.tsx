import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackLinkProps {
  to: string;
  label?: string;
}

export default function BackLink({ to, label = 'Kembali' }: BackLinkProps) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600 mb-4 cursor-pointer transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );
}
