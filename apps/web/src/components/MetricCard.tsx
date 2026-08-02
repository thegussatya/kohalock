import type { ReactNode } from 'react';
import { TrendingUp, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type MetricCardVariant = 'default' | 'warning' | 'success' | 'danger' | 'info';

export type MetricCardProps = {
  title: string;
  value: string | number;
  variant?: MetricCardVariant;
  description?: string;
  icon?: ReactNode;
  className?: string;
};

export default function MetricCard({
  title,
  value,
  variant = 'default',
  description,
  icon,
  className = '',
}: MetricCardProps) {
  
  const variantStyles: Record<MetricCardVariant, { bg: string, text: string, iconBg: string, glow: string, iconElement: ReactNode }> = {
    default: {
      bg: 'bg-gradient-to-br from-indigo-600 to-purple-800',
      text: 'text-white',
      iconBg: 'bg-white/20',
      glow: 'shadow-indigo-500/40',
      iconElement: <TrendingUp className="w-7 h-7 text-white" />,
    },
    warning: {
      bg: 'bg-gradient-to-br from-amber-500 to-orange-700',
      text: 'text-white',
      iconBg: 'bg-white/20',
      glow: 'shadow-orange-500/40',
      iconElement: <Clock className="w-7 h-7 text-white" />,
    },
    success: {
      bg: 'bg-gradient-to-br from-emerald-500 to-teal-800',
      text: 'text-white',
      iconBg: 'bg-white/20',
      glow: 'shadow-emerald-500/40',
      iconElement: <CheckCircle className="w-7 h-7 text-white" />,
    },
    danger: {
      bg: 'bg-gradient-to-br from-rose-500 to-red-800',
      text: 'text-white',
      iconBg: 'bg-white/20',
      glow: 'shadow-rose-500/40',
      iconElement: <AlertCircle className="w-7 h-7 text-white" />,
    },
    info: {
      bg: 'bg-gradient-to-br from-cyan-500 to-blue-700',
      text: 'text-white',
      iconBg: 'bg-white/20',
      glow: 'shadow-cyan-500/40',
      iconElement: <Info className="w-7 h-7 text-white" />,
    },
  };

  const currentStyle = variantStyles[variant] || variantStyles.default;
  
  // If the value is a very long string, reduce font size slightly so it doesn't wrap awkwardly
  const isLongValue = typeof value === 'string' && value.length > 14;

  return (
    <div className={`relative overflow-hidden rounded-3xl ${currentStyle.bg} ${currentStyle.text} p-6 sm:p-8 flex flex-col justify-between group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${currentStyle.glow} ${className}`}>
      
      {/* Decorative Background Elements */}
      <div className="absolute -right-8 -top-8 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500"></div>
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-black opacity-15 rounded-full blur-3xl group-hover:opacity-5 transition-opacity duration-500"></div>

      <div className="relative z-10 flex justify-between items-start mb-6 gap-3">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white/80 leading-tight">
          {title}
        </h3>
        <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${currentStyle.iconBg} backdrop-blur-md shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 border border-white/10`}>
          {icon ? <span className="text-white [&>svg]:w-7 [&>svg]:h-7">{icon}</span> : currentStyle.iconElement}
        </div>
      </div>
      
      <div className="relative z-10">
        <div className={`${isLongValue ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'} font-extrabold tracking-tight drop-shadow-sm`}>
          {value}
        </div>
        {description && (
          <p className="mt-3 text-sm text-white/75 leading-relaxed font-medium">{description}</p>
        )}
      </div>
    </div>
  );
}

