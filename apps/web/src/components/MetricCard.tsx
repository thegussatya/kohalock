import React, { ReactNode } from 'react';
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
  
  const variantStyles: Record<MetricCardVariant, { bg: string, iconElement: ReactNode }> = {
    default: {
      bg: 'bg-brand-50',
      iconElement: <TrendingUp className="w-5 h-5 text-brand-600" />,
    },
    warning: {
      bg: 'bg-amber-50',
      iconElement: <Clock className="w-5 h-5 text-amber-600" />,
    },
    success: {
      bg: 'bg-green-50',
      iconElement: <CheckCircle className="w-5 h-5 text-green-600" />,
    },
    danger: {
      bg: 'bg-red-50',
      iconElement: <AlertCircle className="w-5 h-5 text-red-600" />,
    },
    info: {
      bg: 'bg-blue-50',
      iconElement: <Info className="w-5 h-5 text-blue-600" />,
    },
  };

  const currentStyle = variantStyles[variant] || variantStyles.default;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4 gap-4">
        <h3 className="text-sm font-medium text-slate-500 leading-tight">
          {title}
        </h3>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${currentStyle.bg}`}>
          {icon || currentStyle.iconElement}
        </div>
      </div>
      
      <div>
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        {description && (
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        )}
      </div>
    </div>
  );
}
