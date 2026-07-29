import type { ReactNode } from 'react';
import { TrendingUp, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type MetricCardVariant = 'default' | 'warning' | 'success' | 'danger' | 'info';

export type MetricCardProps = {
  title: string;
  value: string | number;
  variant?: MetricCardVariant;
  description?: string;
  icon?: ReactNode;
};

export default function MetricCard({
  title,
  value,
  variant = 'default',
  description,
  icon,
}: MetricCardProps) {
  
  const variantStyles: Record<MetricCardVariant, { bg: string, border: string, iconElement: ReactNode }> = {
    default: {
      bg: 'bg-gradient-to-br from-brand-50 to-brand-100/50 text-brand-600',
      border: 'border-brand-100/80',
      iconElement: <TrendingUp className="w-5 h-5 text-brand-600" />,
    },
    warning: {
      bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-600',
      border: 'border-amber-100/80',
      iconElement: <Clock className="w-5 h-5 text-amber-600" />,
    },
    success: {
      bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-600',
      border: 'border-emerald-100/80',
      iconElement: <CheckCircle className="w-5 h-5 text-emerald-600" />,
    },
    danger: {
      bg: 'bg-gradient-to-br from-rose-50 to-rose-100/50 text-rose-600',
      border: 'border-rose-100/80',
      iconElement: <AlertCircle className="w-5 h-5 text-rose-600" />,
    },
    info: {
      bg: 'bg-gradient-to-br from-sky-50 to-sky-100/50 text-sky-600',
      border: 'border-sky-100/80',
      iconElement: <Info className="w-5 h-5 text-sky-600" />,
    },
  };

  const currentStyle = variantStyles[variant] || variantStyles.default;

  return (
    <div className="bg-white rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between group">
      <div className="flex justify-between items-start mb-4 gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 leading-tight">
          {title}
        </h3>
        <div className={`flex items-center justify-center w-11 h-11 rounded-2xl border ${currentStyle.border} ${currentStyle.bg} shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}>
          {icon || currentStyle.iconElement}
        </div>
      </div>
      
      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        {description && (
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}

