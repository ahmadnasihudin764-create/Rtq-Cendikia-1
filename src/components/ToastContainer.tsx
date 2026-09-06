import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div id="toast-container" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-emerald-800 text-white border-emerald-700';
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />;

        if (toast.type === 'error') {
          bg = 'bg-red-800 text-white border-red-700';
          icon = <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0" />;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-800 text-white border-amber-700';
          icon = <AlertTriangle className="w-5 h-5 text-amber-300 flex-shrink-0" />;
        } else if (toast.type === 'info') {
          bg = 'bg-teal-900 text-white border-teal-700';
          icon = <Info className="w-5 h-5 text-teal-300 flex-shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-3.5 rounded-xl border shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${bg}`}
          >
            <div className="mr-2.5 mt-0.5">{icon}</div>
            <p className="text-xs font-medium flex-1 leading-snug">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
