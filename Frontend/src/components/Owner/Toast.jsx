import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Toast({ toasts = [] }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none" aria-live="polite">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className="pointer-events-auto flex items-center gap-3 bg-white border border-[#d8d4c7] rounded-xl px-4 py-3 text-sm font-bold text-[#1a1c22] shadow-xl animate-toast"
        >
          <CheckCircle2 size={18} className="text-[#b38728] flex-shrink-0" />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
