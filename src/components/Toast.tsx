import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let Icon = Info;
        let bgStyle = 'bg-white border-l-4 border-brand-purple text-text-charcoal';
        let iconColor = 'text-brand-purple';

        if (toast.type === 'success') {
          Icon = CheckCircle;
          bgStyle = 'bg-white border-l-4 border-brand-green text-text-charcoal';
          iconColor = 'text-brand-green';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          bgStyle = 'bg-white border-l-4 border-red-500 text-text-charcoal';
          iconColor = 'text-red-500';
        }

        return (
          <div
            key={toast.id}
            className={`flex items-start md:items-center justify-between p-4 rounded shadow-lg pointer-events-auto transition-all transform duration-300 translate-y-0 opacity-100 ${bgStyle}`}
            id={`toast-${toast.id}`}
          >
            <div className="flex items-center space-x-3">
              <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
              <p className="text-sm font-medium tracking-tight font-sans leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              id={`close-toast-${toast.id}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
