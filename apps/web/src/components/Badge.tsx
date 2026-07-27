import React, { ReactNode } from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export type BadgeProps = {
  label: ReactNode;
  variant?: BadgeVariant;
};

export default function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const variantStyles = {
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-brand-50 text-brand-700',
    neutral: 'bg-slate-100 text-slate-600',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variantStyles[variant]}`}>
      {label}
    </span>
  );
}
