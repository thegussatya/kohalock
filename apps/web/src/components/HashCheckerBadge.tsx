import React from 'react';

export type HashCheckerBadgeProps = {
  isValid: boolean;
};

export default function HashCheckerBadge({ isValid }: HashCheckerBadgeProps) {
  if (isValid) {
    return (
      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-bold bg-green-100 text-green-800 border border-green-200 shadow-sm whitespace-nowrap">
        <span>✅</span>
        <span>Dokumen Otentik</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-bold bg-red-100 text-red-800 border border-red-200 shadow-sm whitespace-nowrap">
      <span>🚨</span>
      <span>Peringatan: Hash Berbeda / File Dimodifikasi</span>
    </span>
  );
}
