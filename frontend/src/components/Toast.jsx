import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 max-w-md p-4 rounded-xl shadow-xl border transition-all transform translate-y-0 ${
      isSuccess 
        ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
        : isError 
        ? 'bg-rose-50 border-rose-200 text-rose-900' 
        : 'bg-blue-50 border-blue-200 text-blue-900'
    }`}>
      <div className="flex-shrink-0 mt-0.5">
        {isSuccess && <CheckCircle className="w-5 h-5 text-emerald-600" />}
        {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-600" />}
      </div>
      <div className="flex-1 text-sm font-medium leading-relaxed">
        {message}
      </div>
      <button 
        onClick={onClose}
        className="flex-shrink-0 text-slate-400 hover:text-slate-700 transition-colors p-1"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
