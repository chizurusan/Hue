import React, { useState, useEffect } from 'react';
import { CheckCircle, Truck, Heart, ArrowRight, ShieldCheck, Tag, Copy, AlertCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRODUCTS } from '../data/products';
import { Breadcrumb } from '../components/Breadcrumb';

export const OrderSuccess: React.FC = () => {
  const { routeParams, orders, navigateTo, addToast, updateOrderStatusLocal, clearCart } = useApp();

  const handleCopy = (text: string, label: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        addToast(`Đã sao chép ${label} thành công!`, "success");
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (successful) {
          addToast(`Đã sao chép ${label} thành công!`, "success");
        } else {
          addToast(`Hãy tự bôi chọn nhé!`, "info");
        }
      }
    } catch {
      addToast(`Hãy tự bôi chọn số nhé!`, "info");
    }
  };

  const orderId = routeParams?.orderId;
  const fromVnpay = routeParams?.fromVnpay === true;
  const activeOrder = orders.find(o => o.id === orderId) || orders[0];

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const paymentConfig = {
    bankAccount: "8668866678",
    bankCode: "MB",
    accountName: "NGUYEN VAN HUE"
  };

  // Background poller for bank dynamic transfers checking status
  useEffect(() => {
    if (!activeOrder || activeOrder.paymentMethod !== 'bank' || activeOrder.status === 'confirmed') {
      return;
    }

    let intervalId: any;
    
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/orders/${activeOrder.id}/payment-status`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'confirmed') {
            updateOrderStatusLocal(activeOrder.id, 'confirmed');
            addToast("Hệ thống đã tự động ghi nhận thanh toán thành công!", "success");
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tự động kiểm tra thanh toán:", err);
      }
    };

    // Poll every 3 seconds
    intervalId = setInterval(checkPaymentStatus, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeOrder?.id, activeOrder?.status, activeOrder?.paymentMethod]);

  const handleSimulatePayment = async () => {
    if (isSimulatingPayment || !activeOrder) return;
    setIsSimulatingPayment(true);
    addToast("Đang gửi yêu cầu giả lập quét giao dịch...", "info");
    try {
      const response = await fetch(`/api/orders/${activeOrder.id}/simulate-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'confirmed') {
          updateOrderStatusLocal(activeOrder.id, 'confirmed');
          addToast("Xác nhận thanh toán tự động thành công!", "success");
        }
      } else {
        addToast("Không sủi thấy phản hồi từ giả lập thanh toán.", "error");
      }
    } catch (err) {
      addToast("Có lỗi xảy ra khi gửi yêu cầu giả lập.", "error");
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  if (!activeOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center font-sans">
        <CheckCircle className="w-12 h-12 text-brand-green mx-auto mb-4 shrink-0" />
        <h3 className="font-serif font-semibold text-lg text-text-charcoal mb-2">Đặt quà lưu niệm thành công!</h3>
        <p className="text-xs text-text-muted mb-6 leading-relaxed">Đơn hàng của bạn đã được ghi nhận trên cơ sở dữ liệu mẫu. Cảm ơn bạn very nhiều vì đã đồng lòng yêu mến Huegifts.</p>
        <button onClick={() => navigateTo('shop')} className="bg-[#6E4B67] text-white py-2 px-6 rounded text-xs tracking-wider uppercase font-bold cursor-pointer">
          Quay lại cửa hàng
        </button>
      </div>
    );
  }

  // Calculate estimated arrival - standard is 3 days
  const arrivalDate = new Date();
  arrivalDate.setDate(arrivalDate.getDate() + (activeOrder.shippingMethod === 'express' ? 2 : 3));
  const arrivalStr = arrivalDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-16 font-sans">
      
      {/* 1. GRATITUDE HERO HEADER */}
      <section className="text-center space-y-4 py-8 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mx-auto mb-2">
          <CheckCircle className="w-10 h-10 shrink-0" />
        </div>
        <h2 className="text-2xl md:text-3xl font-serif font-medium text-text-charcoal leading-snug tracking-tight">
          Cảm ơn bạn đã mang một phần Huế về nhà!
        </h2>
        <p className="text-xs text-text-muted leading-relaxed font-light">
          Biên lai mã số đại mạch <span className="font-semibold text-brand-purple">{activeOrder.id}</span> đã được chuyển tới bàn soạn đóng gói của Huegifts. Bưu tá mộc mạc dạ thưa sẽ dạo bước giao tới thềm nhà bạn thảnh thơi dột sương.
        </p>
      </section>

      {/* VNPay Success Banner */}
      {fromVnpay && activeOrder.paymentMethod === 'vnpay' && (
        <div className="max-w-xl mx-auto mb-6">
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 text-center space-y-2 shadow-sm">
            <div className="flex items-center justify-center gap-2 text-emerald-700">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span className="font-bold text-sm">Thanh toán VNPay thành công!</span>
            </div>
            <p className="text-xs text-emerald-600">Giao dịch đã được xác nhận. Email xác nhận đã được gửi tới hộp thư của bạn.</p>
          </div>
        </div>
      )}

      {/* DYNAMIC VietQR TRANSFER GUIDE FOR BANK ORDERS */}
      {activeOrder.paymentMethod === 'bank' && (
        <div className="max-w-xl mx-auto mb-8">
          {activeOrder.status === 'confirmed' ? (
            <div className="bg-emerald-50/90 border-2 border-brand-green/40 rounded-2xl p-6 text-center space-y-4 shadow-sm font-sans animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 shrink-0 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-sm text-brand-green uppercase tracking-wide">❀ THANH TOÁN THÀNH CÔNG ❀</h3>
                <p className="text-[11px] text-[#2c533c] max-w-sm mx-auto leading-relaxed">
                  Cửa hàng Huegifts đã tự động kiểm tra, khớp với giao dịch chuyển tiền <strong className="text-brand-purple font-semibold">{formatPrice(activeOrder.total)}</strong> thụ hưởng tại ngân hàng <strong>Quân Đội (MB)</strong>.
                </p>
              </div>
              <div className="bg-white/80 rounded-xl p-4 border border-brand-green/15 max-w-sm mx-auto text-left text-xs space-y-1.5 text-zinc-700">
                <p>• <b>Mã bưu gửi:</b> <span className="font-mono font-medium text-brand-purple">{activeOrder.id}</span></p>
                <p>• <b>Khách hàng:</b> {activeOrder.customerName} ({activeOrder.phone})</p>
                <p>• <b>Trạng thái đơn:</b> <span className="inline-block bg-brand-green/20 text-brand-green px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wide">Tự động xác nhận</span></p>
                <p className="text-[10px] text-zinc-500 italic mt-1 leading-normal">
                  ✿ Hệ thống đã chuyển cho bưu tả soạn bọc quà và gửi thư biên nhận điện tử chu đáo tới email của quý khách.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#FAF8F3]/80 border-2 border-brand-gold/30 rounded-2xl p-6 space-y-4 shadow-sm font-sans">
              <div className="flex items-start gap-3 bg-brand-purple/5 p-4 rounded-xl border border-brand-purple/10">
                <div className="bg-brand-purple/15 text-brand-purple p-1.5 rounded-lg shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif font-bold text-xs text-[#5C452F] uppercase tracking-wider leading-snug">Vui lòng hoàn tất thanh toán chuyển khoản:</h3>
                  <p className="text-[11px] text-[#8C765C] mt-1 leading-relaxed">
                    Đơn hàng đã được ghi nhận thành công. Hệ thống đang thiết lập quét tài khoản thụ hưởng để tự động kích hoạt bọc quà chuẩn bị giao hàng.
                  </p>
                </div>
              </div>

              {/* LIVE TRACKING PULSE */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-[#A05C29] bg-[#A05C29]/10 py-2.5 px-4 rounded-xl border border-[#A05C29]/20 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Hệ thống đang bật quét chuyển tiền tự động liên tục (Cập nhật trong 10-15s)
              </div>

              <div className="pt-2 flex flex-col md:flex-row items-center gap-6">
                <div className="shrink-0 bg-white p-3 rounded-2xl border border-brand-gold/15 shadow-xs flex flex-col items-center">
                  <img 
                    src={`https://img.vietqr.io/image/${paymentConfig.bankCode}-${paymentConfig.bankAccount}-compact2.png?amount=${activeOrder.total}&addInfo=${activeOrder.id}&accountName=${encodeURIComponent(paymentConfig.accountName)}`} 
                    alt="Mã VietQR"
                    className="w-36 h-36 object-contain"
                  />
                  <p className="text-[9px] text-[#A05C29] text-center font-bold mt-1.5 font-mono bg-brand-gold-light/60 px-2 py-0.5 rounded tracking-wide">{activeOrder.id}</p>
                </div>

                <div className="flex-1 w-full space-y-2 text-xs text-[#5C452F]">
                  <div className="grid grid-cols-2 gap-2 text-[10px] border-b border-brand-gold/10 pb-2">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-text-muted/85">Ngân hàng thụ hưởng</span>
                      <p className="font-semibold text-text-charcoal mt-0.5">{paymentConfig.bankCode} Bank</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-text-muted/85">Chủ tài khoản</span>
                      <p className="font-bold text-text-charcoal mt-0.5 uppercase">{paymentConfig.accountName}</p>
                    </div>
                  </div>

                  <div className="border-b border-brand-gold/10 pb-2 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-text-muted/85">Số tài khoản thụ hưởng</span>
                      <p className="font-bold font-mono text-brand-purple mt-0.5 text-xs">{paymentConfig.bankAccount}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentConfig.bankAccount, "Số tài khoản")}
                      className="bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple text-[10px] py-0.5 px-2 rounded-md font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Sao chép</span>
                    </button>
                  </div>

                  <div className="border-b border-brand-gold/10 pb-2 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-text-muted/85">Số tiền cần chuyển</span>
                      <p className="font-extrabold text-brand-purple mt-0.5 text-xs">{formatPrice(activeOrder.total)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeOrder.total.toString(), "Số tiền")}
                      className="text-[9px] text-[#A05C29] hover:underline cursor-pointer font-semibold"
                    >
                      Sao chép tiền
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[#A05C29] font-semibold">Nội dung ghi (bắt buộc đúng)</span>
                      <p className="font-black font-mono text-[#A05C29] text-xs mt-0.5">{activeOrder.id}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeOrder.id, "Nội dung chuyển khoản")}
                      className="bg-[#A05C29]/10 hover:bg-[#A05C29]/20 text-[#A05C29] text-[10px] py-0.5 px-2 rounded-md font-bold cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Sao chép</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* DEMO TOOLBAR SIMULATOR ACTION BUTTON */}
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isSimulatingPayment}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2 border border-emerald-400"
              >
                {isSimulatingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang kiểm tra...</span>
                  </>
                ) : (
                  <span>⚡ GIẢ LẬP GIAO DỊCH CHUYỂN KHOẢN THÀNH CÔNG (TEST NHANH)</span>
                )}
              </button>

              {/* CONFIG WEBHOOK INSTRUCTION FOR ADMIN */}
              <div className="bg-[#5C452F]/5 rounded-xl p-4 border border-[#5C452F]/10 space-y-2 mt-4 text-[11px] text-[#5C452F] leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-xs uppercase text-[#A05C29]">
                  <span>⚙️ TÍCH HỢP TỰ ĐỘNG THẬT 100% QUA WEBHOOK</span>
                </div>
                <p>
                  Khi có giao dịch chuyển khoản thật ngoài đời đúng nội dung <b>{activeOrder.id}</b>, bưu cục sẽ tự động ghi nhận thanh toán nhờ cấu hình webhook.
                </p>
                <div className="bg-white/90 p-2.5 rounded-lg border border-[#ebdcb9] space-y-1">
                  <span className="block font-semibold font-mono text-[10px] text-zinc-500 uppercase tracking-wide">Đường dẫn Webhook của cổng thanh toán:</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={`${window.location.origin}/api/payment-webhook`}
                      className="bg-zinc-50 text-brand-purple font-mono text-[10px] px-2 py-1 rounded border border-zinc-200 flex-1 resize-none select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(`${window.location.origin}/api/payment-webhook`, "Đường dẫn Webhook")}
                      className="bg-brand-purple hover:bg-brand-purple/90 text-white text-[10px] px-3 py-1 rounded font-bold cursor-pointer transition-colors shrink-0"
                    >
                      Sao chép URL
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 italic font-light">
                  * Khi có giao dịch chuyển khoản thật ngoài đời đúng nội dung <b>{activeOrder.id}</b>, tín hiệu sẽ gửi tới Webhook này và trang web này sẽ ngay lập tức tự động đổi trạng thái sang "Thanh toán thành công" trên màn hình điện thoại của bạn mà không cần nhấn nút giả lập!
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. PAPER ORDER TICKET LAYOUT */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-md divide-y divide-dashed divide-zinc-200 overflow-hidden mb-8">
        
        {/* Top: Receipt brief metadata */}
        <div className="p-6 bg-[#FAF9F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-text-muted tracking-wider uppercase">Mã bưu phẩm</span>
            <h4 className="text-base font-bold text-text-charcoal flex items-center gap-1.5 mt-0.5">
              <Tag className="w-4 h-4 text-brand-purple shrink-0" />
              <span>{activeOrder.id}</span>
            </h4>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-text-muted tracking-wider uppercase">Thời điểm gởi đi</span>
            <p className="text-xs text-text-charcoal mt-0.5">
              {new Date(activeOrder.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>

          <div>
            <span className="text-[10px] text-text-muted tracking-wider uppercase block mb-1">Phương thức</span>
            <span className="bg-brand-purple/10 text-brand-purple px-2 py-0.5 rounded font-semibold text-[10px] tracking-wide uppercase">
              {activeOrder.paymentMethod === 'cod' ? 'Thanh toán COD' : 'Chuyển khoản VietQR'}
            </span>
          </div>
        </div>

        {/* Middle: Grid list summary items */}
        <div className="p-6 space-y-4">
          <h5 className="text-xs font-bold text-text-charcoal uppercase tracking-wider mb-2">Danh mục bưu phẩm bọc thùng:</h5>
          
          <div className="space-y-3">
            {activeOrder.items.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-sans">
                <div className="flex items-center space-x-3 overflow-hidden pr-4">
                  <img src={it.image} alt={it.name} className="w-10 h-10 rounded-lg object-cover border shrink-0" />
                  <div className="truncate">
                    <span className="font-semibold text-text-charcoal truncate block max-w-sm">{it.name}</span>
                    <span className="text-[10px] text-text-muted/80">Số lượng: {it.quantity} món x {formatPrice(it.price)}</span>
                  </div>
                </div>

                <span className="font-semibold text-text-charcoal font-sans shrink-0">
                  {formatPrice(it.price * it.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gift layout if selected card */}
        {activeOrder.wrapAsGift && (
          <div className="p-6 bg-brand-gold-light/20 flex flex-col md:flex-row items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-gold-light text-[#B88A55] flex items-center justify-center font-bold text-xs shrink-0 self-start">
              ❀
            </div>
            <div className="text-xs font-sans flex-1">
              <p className="font-bold text-[#5C452F]">❀ Gói quà thủ công & Lá thiệp tay đính ước:</p>
              <p className="text-text-charcoal italic mt-1 leading-relaxed border-l-2 border-brand-gold pl-3 py-1 bg-white/60 rounded-r-lg font-serif">
                "{activeOrder.giftMessage || 'Huế gửi thương yêu...'}"
              </p>
            </div>
          </div>
        )}

        {/* Bottom: Totals calculation sheets */}
        <div className="p-6 space-y-2.5 text-xs text-text-charcoal">
          <div className="flex items-center justify-between font-light">
            <span className="text-text-muted font-light">Tạm tính giỏ quà:</span>
            <span className="font-semibold font-sans">{formatPrice(activeOrder.subtotal)}</span>
          </div>

          {activeOrder.discount > 0 && (
            <div className="flex items-center justify-between text-brand-green">
              <span>Đã giảm trừ mã {activeOrder.discount > 0 ? "HUEGIFTS10" : ""}:</span>
              <span className="font-semibold font-sans">-{formatPrice(activeOrder.discount)}</span>
            </div>
          )}

          <div className="flex items-center justify-between font-light">
            <span className="text-text-muted font-light">Bưu tá ship hỏa tốc/tiêu chuẩn:</span>
            <span className="font-semibold font-sans">
              {activeOrder.shippingFee > 0 ? formatPrice(activeOrder.shippingFee) : "Miễn phí chuyển phát"}
            </span>
          </div>

          <div className="flex items-baseline justify-between text-brand-purple border-t border-zinc-100 pt-3 text-sm font-bold uppercase">
            <span>Tổng số dư ghi nhận:</span>
            <span className="text-lg font-bold font-sans text-brand-purple">{formatPrice(activeOrder.total)}</span>
          </div>
        </div>

        {/* Bottom Address target */}
        <div className="p-6 bg-zinc-50 flex flex-col md:flex-row gap-6 text-xs text-text-muted font-light border-t border-zinc-200">
          <div>
            <p className="font-semibold text-text-charcoal mb-1 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-brand-green" /> Nhận quà bởi:</p>
            <p className="font-bold text-text-charcoal">{activeOrder.customerName}</p>
            <p>Số dđ: {activeOrder.phone}</p>
            <p>Thư: {activeOrder.email || 'Không khai báo Email'}</p>
          </div>

          <div>
            <p className="font-semibold text-text-charcoal mb-1 flex items-center gap-1.5"><Truck className="w-4 h-4 text-brand-purple" /> Chuyển tới bưu cục:</p>
            <p className="leading-relaxed font-sans">{activeOrder.addressDetail}, {activeOrder.ward}, {activeOrder.district}, {activeOrder.province}</p>
            <p className="text-[10px] italic text-[#B88A55] mt-1 font-semibold block">• Dự kiến bưu tá thưa gửi gõ cổng: {arrivalStr}</p>
          </div>
        </div>

      </div>

      {/* 3. CTA LOWER BUTTON ACTIONS */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => {
            localStorage.setItem('huegifts_track_order_prefetch', JSON.stringify({ id: activeOrder.id, phone: activeOrder.phone }));
            navigateTo('track-order');
          }}
          className="w-full sm:w-auto bg-[#6E4B67] hover:bg-[#54344E] text-white text-xs font-semibold uppercase tracking-wider py-3 px-8 rounded-lg shadow-sm transition-colors cursor-pointer text-center"
          id="track-order-success-trigger"
        >
          Theo dõi hành trình bưu phẩm
        </button>
        <button
          onClick={() => navigateTo('shop')}
          className="w-full sm:w-auto bg-[#ECEAEC] hover:bg-[#DEDADC] text-text-charcoal text-xs font-semibold uppercase tracking-wider py-3 px-8 rounded-lg transition-colors cursor-pointer text-center"
          id="continue-shop-success-trigger"
        >
          Tiếp tục dạo chơi cửa hàng
        </button>
      </div>

    </div>
  );
};
