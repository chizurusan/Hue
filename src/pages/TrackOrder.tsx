import React, { useState, useEffect } from 'react';
import { Search, Compass, RefreshCw, Landmark, Calendar, MapPin, Box, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Breadcrumb } from '../components/Breadcrumb';

interface TrackingData {
  orderId: string;
  phone: string;
}

export const TrackOrder: React.FC = () => {
  const { orders, navigateTo, addToast } = useApp();
  
  const [inputs, setInputs] = useState<TrackingData>({
    orderId: '',
    phone: ''
  });

  const [hasQueried, setHasQueried] = useState(false);
  const [matchedOrder, setMatchedOrder] = useState<any | null>(null);

  // Hook up prefetch hooks on checkout completions
  useEffect(() => {
    const prefetchStr = localStorage.getItem('huegifts_track_order_prefetch');
    if (prefetchStr) {
      try {
        const decoded = JSON.parse(prefetchStr);
        setInputs({
          orderId: decoded.id || '',
          phone: decoded.phone || ''
        });
        localStorage.removeItem('huegifts_track_order_prefetch');
        
        // Immediate query resolution if match in lists
        const match = orders.find(o => o.id === decoded.id || o.id?.toLowerCase() === decoded.id?.toLowerCase());
        if (match) {
          setMatchedOrder(match);
          setHasQueried(true);
        } else {
          // If fresh system with only simulated storage
          setMatchedOrder(null);
          setHasQueried(true);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [orders]);

  const handleQuery = (e: React.FormEvent) => {
    e.preventDefault();
    setHasQueried(false);

    if (!inputs.orderId.trim()) {
      addToast("Vui lòng điền Mã bưu phẩm.", "info");
      return;
    }

    // Try finding in master orders storage
    const found = orders.find(
      o => o.id.trim().toLowerCase() === inputs.orderId.trim().toLowerCase() ||
      o.id.trim().toLowerCase().includes(inputs.orderId.trim().toLowerCase())
    );

    if (found) {
      setMatchedOrder(found);
      setHasQueried(true);
      addToast("Đã định vị biên lai bưu tá thành công!", "success");
    } else {
      setMatchedOrder(null);
      setHasQueried(true);
      addToast("Không định vị được mã quà lưu niệm trên hệ thống mẫu.", "error");
    }
  };

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'Chờ chuyển khoản thanh toán';
      case 'confirmed': return 'Đã nhận đơn quà';
      case 'processing': return 'Đang đan lạt gói quà';
      case 'shipped': return 'Bưu tá đã lăn bánh';
      case 'delivered': return 'Đã gõ cửa gửi hoa';
      default: return 'Đang sửa bọc gói';
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-16 font-sans">
      
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Hành trình bưu tá' }]} />

      <div className="border-b border-zinc-200 pb-4 mb-8">
        <h2 className="text-3xl font-serif font-semibold text-text-charcoal tracking-tight">
          Dõi tay Hòm thư Bưu tá
        </h2>
        <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-xl font-light">
          Nhập mã ghi bưu phẩm để tìm dấu chân thưa bưu văn du ngoạn non sông, gửi hương bối gió lành dìu dịu tới ngõ nhà.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* QUERY INPUT FORM COMPACT PANEL (L.Col 4/12) */}
        <div className="lg:col-span-4 bg-white border border-zinc-250 p-6 rounded-2xl shadow-sm space-y-4 font-sans">
          <h4 className="text-xs font-bold uppercase text-brand-purple tracking-widest flex items-center gap-1.5 border-b border-zinc-100 pb-3">
            <Compass className="w-4 h-4 text-brand-purple shrink-0" />
            <span>Định vị bưu phẩm</span>
          </h4>

          <form onSubmit={handleQuery} className="space-y-4">
            <div>
              <label className="text-[11px] uppercase font-bold tracking-wider text-text-charcoal block mb-1">Mã bưu phẩm lưu niệm *</label>
              <input
                type="text"
                value={inputs.orderId}
                onChange={(e) => setInputs(prev => ({ ...prev, orderId: e.target.value }))}
                placeholder="Ví dụ: DH2026-12345"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-purple focus:outline-none focus:bg-white text-text-charcoal"
                id="tracking-id-input"
              />
              <p className="text-[11px] text-text-muted mt-1 italic block leading-normal">
                * Có thể tìm mã trong trang lịch sử cá nhân hoặc biên nhận thành công.
              </p>
            </div>

            <div>
              <label className="text-[11px] uppercase font-bold tracking-wider text-text-charcoal block mb-1">Số điện thoại liên lạc (Nếu có)</label>
              <input
                type="tel"
                value={inputs.phone}
                onChange={(e) => setInputs(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Ví dụ: 0977047908"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-purple focus:outline-none focus:bg-white text-text-charcoal"
                id="tracking-phone-input"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-purple hover:bg-brand-purple/95 text-white py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest text-center cursor-pointer transition-all flex items-center justify-center space-x-1"
              id="tracking-submit-btn"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Tìm hòm thư bưu tá</span>
            </button>
          </form>

          {/* Quick tips demo helper for user verification */}
          {orders.length > 0 && (
            <div className="bg-[#FAF8F3] border border-brand-gold/15 p-3.5 rounded-xl text-xs text-[#5C452F] space-y-1.5 font-sans leading-relaxed">
              <span className="font-semibold block">✿ Mã bưu phẩm khả dụng của bạn:</span>
              <div className="space-y-1">
                {orders.map(o => (
                  <button
                    key={o.id}
                    onClick={() => setInputs(prev => ({ ...prev, orderId: o.id }))}
                    className="block text-brand-purple hover:underline font-bold text-left cursor-pointer"
                  >
                    • {o.id}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* TIMELINE PROGRESS FLOW PANELS AREA (R.Col 8/12) */}
        <div className="lg:col-span-8">
          {hasQueried ? (
            matchedOrder ? (
              
              /* STAGE TIMELINE DISPATCH */
              <div className="bg-white border border-zinc-200 p-6 md:p-8 rounded-3xl shadow-sm space-y-8 font-sans">
                
                {/* Brief Title Order summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-150 pb-5 gap-3">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase tracking-wider block">Trạng thái định vị</span>
                    <h3 className="text-lg font-serif font-semibold text-text-charcoal mt-1 flex items-center gap-1.5">
                      <Box className="w-5 h-5 text-brand-purple" />
                      <span>{getOrderStatusLabel(matchedOrder.status)}</span>
                    </h3>
                  </div>

                  <div className="text-left sm:text-right text-xs">
                    <p className="font-semibold text-text-charcoal font-sans">Tổng bọc bưu vật: {formatPrice(matchedOrder.total)}</p>
                    <p className="text-[11px] text-text-muted mt-0.5 font-light">Người nhận: {matchedOrder.customerName}</p>
                  </div>
                </div>

                {/* Vertical Timeline list */}
                <div className="relative border-l-2 border-zinc-200/60 ml-5 pl-7 space-y-8 py-3">
                  
                  {/* Step 1: Confirmed */}
                  <div className="relative">
                    {/* Circle dot checkbox */}
                    <span className="absolute -left-10 top-0 w-6 h-6 rounded-full bg-brand-green text-white flex items-center justify-center shadow">
                      <CheckCircle className="w-3.5 h-3.5 fill-current" />
                    </span>
                    <div className="text-xs">
                      <h4 className="font-semibold text-text-charcoal text-sm">Ghi sớ biên nhận đơn quà cổ cổ</h4>
                      <p className="text-[11px] text-text-muted font-light mt-0.5 leading-normal">Bưu cục Huegifts xác nhận thông tin đơn, chưng cất bọc thùng bưu phẩm gỗ.</p>
                      <span className="text-[10px] text-brand-gold italic mt-1 block flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Đã lưu nhận tại bưu bạ, ngày {new Date(matchedOrder.createdAt).toLocaleDateString('vi-VN')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Step 2: Processing */}
                  <div className="relative">
                    <span className={`absolute -left-10 top-0 w-6 h-6 rounded-full flex items-center justify-center shadow ${
                      ['processing', 'shipped', 'delivered'].includes(matchedOrder.status) || matchedOrder.status === 'confirmed' // demo always checked or active
                        ? 'bg-brand-green text-white' : 'bg-zinc-200 text-zinc-500'
                    }`}>
                      <CheckCircle className="w-3.5 h-3.5 fill-current" />
                    </span>
                    <div className="text-xs">
                      <h4 className="font-semibold text-text-charcoal text-sm">Nung gốm mộc, đan rương xếp gồi</h4>
                      <p className="text-[11px] text-text-muted font-light mt-0.5 leading-normal">Các nghệ nhân thêu tay và bọc thư sen dột sương, viết cẩn thận tấm thiệp tay gởi lữ khách.</p>
                      <span className="text-[10px] text-zinc-400 italic mt-1 block">Tác nghiệp thủ công tại xưởng đan thợ Huế</span>
                    </div>
                  </div>

                  {/* Step 3: Shipped */}
                  <div className="relative">
                    <span className={`absolute -left-10 top-0 w-6 h-6 rounded-full flex items-center justify-center shadow ${
                      ['shipped', 'delivered'].includes(matchedOrder.status)
                        ? 'bg-brand-green text-white' : 'bg-zinc-200 text-zinc-500'
                    }`}>
                      <CheckCircle className="w-3.5 h-3.5 fill-current" />
                    </span>
                    <div className="text-xs">
                      <h4 className="font-semibold text-text-charcoal text-sm">Bưu tá rước duyên lăn bánh ngoại đô</h4>
                      <p className="text-[11px] text-text-muted font-light mt-0.5 leading-normal">Bọc thùng gỗ đã thông hành qua đèo Hải Vân hoặc bến cảng hành trình gửi đi muôn ngả non sông.</p>
                      <span className="text-[10px] text-zinc-400 italic mt-1 block flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>Đối tác vận tải cố đô đảm bảo</span>
                      </span>
                    </div>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="relative">
                    <span className={`absolute -left-10 top-0 w-6 h-6 rounded-full flex items-center justify-center shadow ${
                      matchedOrder.status === 'delivered'
                        ? 'bg-brand-green text-white' : 'bg-zinc-200 text-zinc-500'
                    }`}>
                      <CheckCircle className="w-3.5 h-3.5 fill-current" />
                    </span>
                    <div className="text-xs">
                      <h4 className="font-semibold text-text-charcoal text-sm">Gõ cổng mộc gửi bọc thơ yêu sương</h4>
                      <p className="text-[11px] text-text-muted font-light mt-0.5 leading-normal">Bưu tá trao tay lữ chủ thềm hương nồng ấm. Chúc mừng hữu lữ rước một phần Huế ngọt thơm về thềm nhà gỗ.</p>
                    </div>
                  </div>

                </div>

                {/* Package list inline for confirmation */}
                <div className="border-t border-zinc-150 pt-5 mt-5">
                  <p className="text-xs text-text-muted font-light uppercase tracking-wider mb-2">Bưu vật đính kèm bọc gỗ:</p>
                  <div className="space-y-2">
                    {matchedOrder.items.map((it: any, itIdx: number) => (
                      <div key={itIdx} className="text-xs text-text-charcoal flex justify-between">
                        <span>• {it.name} (x{it.quantity} món)</span>
                        <span className="font-semibold font-sans">{formatPrice(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              /* ORDER NOT FOUND PANEL SLOP */
              <div className="bg-[#FAF7F2] border border-dashed border-zinc-200 rounded-3xl p-12 text-center font-sans">
                <Box className="w-12 h-12 text-[#B88A55] mx-auto mb-4 shrink-0" />
                <h3 className="font-serif font-semibold text-text-charcoal text-base mb-1">
                  Chưa định vị được bưu phẩm
                </h3>
                <p className="text-xs text-text-muted leading-relaxed font-light max-w-sm mx-auto mb-6">
                  Mã bưu phẩm số <span className="font-bold text-brand-purple">"{inputs.orderId}"</span> hiện thời chưa xuất hiện trên hệ thống hóa đơn mẫu dột sương này. Vui lòng kiểm tra lại biên nhận hoặc điền mã bưu thí nghiệm click dột ở rương bên trái ạ.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setInputs({ orderId: 'DH2026-CHUYEN-KHOAN', phone: '' });
                      setMatchedOrder({
                        id: 'DH2026-CHUYEN-KHOAN',
                        customerName: 'Hữu lữ Thử Nghiệm',
                        phone: '0905999888',
                        createdAt: new Date().toISOString(),
                        status: 'processing',
                        items: [{ name: 'Trà Sen Tịnh Tâm Thượng Hạng', quantity: 1, price: 290000 }],
                        total: 320000
                      });
                      setHasQueried(true);
                    }}
                    className="bg-[#ECEAEC] hover:bg-[#DEDADC] text-text-charcoal border text-[11px] font-semibold tracking-wider py-1.5 px-4 rounded-lg cursor-pointer transition-colors"
                  >
                    Nạp mẫu thử tự động
                  </button>
                </div>
              </div>
            )
          ) : (
            /* INTRO FIRST ENTRY DISPLAY AT TRACK ORDER */
            <div className="bg-zinc-50 border rounded-3xl p-16 text-center font-sans max-w-md mx-auto relative overflow-hidden">
              <Compass className="w-16 h-16 text-[#B88A55] mx-auto mb-4 opacity-35 shrink-0" />
              <h4 className="font-serif font-semibold text-text-charcoal mb-1">Đang chờ tra cứu thông linh</h4>
              <p className="text-xs text-text-muted font-light leading-relaxed">
                Điền mã số bưu gửi của bạn bên tấm gỗ rương để định vị dột sương của bọc quà Huế hằng mến trao duyên lộng lẫy nhé hữu hữu.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
