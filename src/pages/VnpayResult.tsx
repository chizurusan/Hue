import React, { useEffect } from 'react';
import { XCircle, ShieldCheck, RefreshCw, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VnpayResult: React.FC = () => {
  const { routeParams, navigateTo, addToast } = useApp();
  const { orderId, status, reason } = routeParams as { orderId: string; status: string; reason: string };

  const isFailed = status === 'failed';

  useEffect(() => {
    if (isFailed) {
      addToast(`Thanh toán VNPay không thành công: ${reason}`, 'error');
    }
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 py-16 font-sans text-center">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isFailed ? 'bg-red-100' : 'bg-emerald-100'}`}>
        {isFailed
          ? <XCircle className="w-8 h-8 text-red-500" />
          : <ShieldCheck className="w-8 h-8 text-emerald-500" />
        }
      </div>

      <h2 className="text-2xl font-serif font-semibold text-text-charcoal mb-2">
        {isFailed ? 'Thanh toán không thành công' : 'Thanh toán thành công!'}
      </h2>

      {orderId && (
        <p className="text-sm text-text-muted mb-2">
          Mã đơn hàng: <strong className="text-brand-purple font-mono">{orderId}</strong>
        </p>
      )}

      {isFailed && reason && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 text-left">
          <p className="font-semibold mb-1">Lý do:</p>
          <p>{reason}</p>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        {isFailed && orderId && (
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/vnpay/create-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ orderId }),
                });
                const data = await res.json();
                if (data.payUrl) {
                  window.location.href = data.payUrl;
                } else {
                  addToast(data.error || 'Không thể tạo link thanh toán.', 'error');
                }
              } catch {
                addToast('Lỗi kết nối máy chủ.', 'error');
              }
            }}
            className="flex items-center justify-center gap-2 bg-[#003087] hover:bg-[#00206B] text-white px-6 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Thử thanh toán lại
          </button>
        )}

        <button
          onClick={() => navigateTo('track-order')}
          className="flex items-center justify-center gap-2 bg-brand-purple hover:bg-brand-purple/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
        >
          Tra cứu đơn hàng
        </button>

        <button
          onClick={() => navigateTo('shop')}
          className="flex items-center justify-center gap-2 border border-zinc-300 hover:bg-zinc-50 text-text-charcoal px-6 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
        >
          Tiếp tục mua sắm
        </button>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-text-muted">
        <Phone className="w-3.5 h-3.5" />
        <span>Hỗ trợ: <a href="tel:0977047908" className="text-brand-purple font-semibold">0977 047 908</a></span>
      </div>
    </div>
  );
};
