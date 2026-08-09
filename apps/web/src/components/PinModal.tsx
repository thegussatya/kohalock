import { useState, useRef, useEffect } from 'react';
import { Fingerprint } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export default function PinModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Tanda Tangan Digital",
  description = "Masukkan 6 digit PIN kredensial Anda untuk menyetujui dan mengunci data ini.",
  isLoading = false
}: PinModalProps) {
  const [pin, setPin] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      ></div>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col items-center text-center p-8 border border-slate-100">
        
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
          <Fingerprint className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-sm text-slate-500 mb-8 max-w-[280px]">
          {description}
        </p>

        <div className="relative w-full max-w-[240px] mb-8">
          <input 
            ref={inputRef}
            type="password"
            autoComplete="new-password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            disabled={isLoading}
            className="w-full text-center tracking-[1em] text-3xl p-4 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono"
          />
        </div>

        <div className="flex gap-3 w-full mt-2">
          <button 
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button 
            type="button"
            disabled={pin.length < 6 || isLoading}
            onClick={() => onConfirm(pin)}
            className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Memproses...' : 'Konfirmasi'}
          </button>
        </div>
      </div>
    </div>
  );
}
