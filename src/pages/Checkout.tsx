import React, { useState, useEffect } from 'react';
import { ShieldCheck, Truck, CreditCard, ArrowLeft, Heart, CheckSquare, XCircle, Sparkles, AlertCircle, Copy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Breadcrumb } from '../components/Breadcrumb';

interface CheckoutForm {
  name: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  notes: string;
  shippingMethod: 'standard' | 'express';
  paymentMethod: 'cod' | 'bank' | 'momo' | 'vnpay';
  wrapAsGift: boolean;
  giftMessage: string;
  agreeTerms: boolean;
}

export const Checkout: React.FC = () => {
  const { cart, user, discountPercentage, discountCode, addOrder, clearCart, navigateTo, addToast } = useApp();

  const [draftOrderId] = useState(() => `HUEGIFTS${Math.floor(1000 + Math.random() * 9000)}`);

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
          addToast(`Hãy tự bôi đen và sao chép nhé!`, "info");
        }
      }
    } catch (err) {
      addToast(`Hãy tự bôi tiền sao chép nhé!`, "info");
    }
  };

  const [form, setForm] = useState<CheckoutForm>({
    name: '',
    phone: '',
    email: '',
    province: 'Thừa Thiên Huế',
    district: 'Thành phố Huế',
    ward: '',
    addressDetail: '',
    notes: '',
    shippingMethod: 'standard',
    paymentMethod: 'cod',
    wrapAsGift: false,
    giftMessage: '',
    agreeTerms: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);

  // Auto populate user profile on mount
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        province: user.province || 'Thừa Thiên Huế',
        district: user.district || 'Thành phố Huế',
        ward: user.ward || '',
        addressDetail: user.addressDetail || ''
      }));
    }
  }, [user]);

  // If cart empty
  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-sans">
        <AlertCircle className="w-12 h-12 text-[#B88A55] mx-auto mb-4 shrink-0" />
        <h3 className="font-serif font-semibold text-lg">Giỏ quà trống rỗng</h3>
        <p className="text-xs text-text-muted mt-2">Vui lòng chọn ít nhất dột món quà lưu niệm Huế trước khi tới thanh toán ạ.</p>
        <button onClick={() => navigateTo('shop')} className="mt-6 bg-[#6E4B67] text-white text-xs uppercase font-bold py-2 px-6 rounded-lg cursor-pointer">
          Trở lại coi cửa hàng
        </button>
      </div>
    );
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Calculations
  const subtotal = cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
  const discountAmount = subtotal * (discountPercentage / 100);
  
  const isFreeShip = subtotal >= 500000;
  const shippingCharge = form.shippingMethod === 'standard' 
    ? (isFreeShip ? 0 : 30000) 
    : 45000;

  const grandTotal = subtotal - discountAmount + shippingCharge;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }

    // clear fields errors immediately upon typing
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Vui lòng nhập Họ và tên người nhận quà.";
    if (!form.phone.trim()) {
      errs.phone = "Vui lòng nhập Số điện thoại liên lạc.";
    } else if (!/^[0-9+ ]{9,12}$/.test(form.phone.trim())) {
      errs.phone = "Số điện thoại không đúng cấu trúc tiếng Việt (9-12 chữ số).";
    }
    
    if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email.trim())) {
      errs.email = "Định dạng thư điện tử Email không hợp lý.";
    }

    if (!form.province.trim()) errs.province = "Vui lòng ghi nhận Tỉnh/Thành phố.";
    if (!form.district.trim()) errs.district = "Vui lòng ghi nhận Quận/Huyện.";
    if (!form.ward.trim()) errs.ward = "Vui lòng nhập Phường/Xã nhận bưu phẩm.";
    if (!form.addressDetail.trim()) errs.addressDetail = "Vui lòng ghi địa số nhà, ngõ ngách chi tiết.";
    
    if (!form.agreeTerms) errs.agreeTerms = "Bạn cần đồng thuận với Điều ước giao dịch bưu phẩm.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!validateForm()) {
      addToast("Có lỗi thông tin. Vui lòng kiểm tra lại các dòng đỏ phía dưới ạ.", "error");
      return;
    }

    setSubmitting(true);
    addToast("Đang ghi nhận đơn hàng...", "info");

    const orderPayload = {
      customerName: form.name,
      phone: form.phone,
      email: form.email,
      province: form.province,
      district: form.district,
      ward: form.ward,
      addressDetail: form.addressDetail,
      notes: form.notes,
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0]
      })),
      subtotal,
      discount: discountAmount,
      shippingFee: shippingCharge,
      total: grandTotal,
      paymentMethod: form.paymentMethod,
      shippingMethod: form.shippingMethod,
      wrapAsGift: form.wrapAsGift,
      giftMessage: form.giftMessage,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const orderData = await res.json();
        if (orderData.success && orderData.order) {
          addOrder(orderData.order);
          clearCart();

          // VNPay: redirect sang cổng thanh toán
          if (form.paymentMethod === 'vnpay' && orderData.vnpayUrl) {
            addToast("Đang chuyển sang cổng thanh toán VNPay...", "info");
            window.location.href = orderData.vnpayUrl;
            return;
          }

          if (form.paymentMethod === 'bank') {
            addToast("Đơn hàng đã lưu. Vui lòng chuyển khoản đúng nội dung để xác nhận.", "success");
          } else {
            addToast("Đặt hàng thành công! Email xác nhận đã được gửi.", "success");
          }
          navigateTo('order-success', { orderId: orderData.order.id });
        } else {
          addToast(orderData.error || "Lỗi lưu đơn hàng.", "error");
        }
      } else {
        const errorData = await res.json();
        addToast(errorData.error || "Máy chủ từ chối đơn hàng.", "error");
      }
    } catch {
      addToast("Không thể kết nối máy chủ. Kiểm tra mạng.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-16 font-sans">
      
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: 'Giỏ hàng bưu phẩm', page: 'cart' },
        { label: 'Ghi nhận thanh toán hóa đơn' }
      ]} />

      <div className="border-b border-zinc-200 pb-4 mb-8">
        <h2 className="text-3xl font-serif font-semibold text-text-charcoal tracking-tight">
          Giao Biên Lai Đơn Quà
        </h2>
        <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-xl font-light">
          Hãy hoàn thành nốt dột vài nét về hòm thư nơi bạn hữu trú ngụ, để bưu tá giao duyên tới tận thềm hiên nhà.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMN LEFT: FORMS ADRESSES / OPTIONS (L.Col 7/12) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: RECIPIENT INFORMATION */}
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase text-brand-purple tracking-widest flex items-center gap-1.5 border-b border-zinc-100 pb-3">
              <span className="bg-brand-purple text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px]">1</span>
              <span>Thông tin lữ chủ thưa nhận quà</span>
            </h3>

            {/* Split row Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal block mb-1">
                  Họ và tên người nhận <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Ngyuyen Van Hue "
                  className={`w-full bg-zinc-50 border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-purple focus:outline-none focus:bg-white text-text-charcoal ${errors.name ? 'border-red-500' : 'border-zinc-200'}`}
                  id="checkout-name-field"
                />
                {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal block mb-1">
                  Số điện thoại bưu cầm <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Ví dụ: 0977047908"
                  className={`w-full bg-zinc-50 border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-purple focus:outline-none focus:bg-white text-text-charcoal ${errors.phone ? 'border-red-500' : 'border-zinc-200'}`}
                  id="checkout-phone-field"
                />
                {errors.phone && <p className="text-[10px] text-red-500 mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal block mb-1">
                Địa bạ hòm thư Email (Không ép)
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="nvanhue025@gmail.com"
                className={`w-full bg-zinc-50 border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-purple focus:outline-none focus:bg-white text-text-charcoal ${errors.email ? 'border-red-500' : 'border-zinc-200'}`}
                id="checkout-email-field"
              />
              {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Provinces/Districts/Wards split triplestripe */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal block mb-1">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-text-charcoal focus:outline-none"
                  id="checkout-province"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal block mb-1">Quận / Huyện <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-text-charcoal focus:outline-none"
                  id="checkout-district"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal block mb-1">Phường / Xã <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="ward"
                  value={form.ward}
                  onChange={handleChange}
                  placeholder="Ví dụ: Vỹ Dạ"
                  className={`w-full bg-zinc-50 border rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-brand-purple focus:bg-white focus:outline-none text-text-charcoal ${errors.ward ? 'border-red-500' : 'border-zinc-200'}`}
                  id="checkout-ward"
                />
                {errors.ward && <p className="text-[10px] text-red-500 mt-1">{errors.ward}</p>}
              </div>
            </div>

            {/* Core home number detailed ADDRESS */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal block mb-1">Địa chỉ chi tiết (nhà riêng/ngõ ngách) <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="addressDetail"
                value={form.addressDetail}
                onChange={handleChange}
                placeholder="Ví dụ: Số 12 Chi Lăng"
                className={`w-full bg-zinc-50 border rounded-lg px-2.5 py-2 text-xs focus:ring-1 focus:ring-brand-purple focus:bg-white focus:outline-none text-text-charcoal ${errors.addressDetail ? 'border-red-500' : 'border-zinc-200'}`}
                id="checkout-addressdetail"
              />
              {errors.addressDetail && <p className="text-[10px] text-red-500 mt-1">{errors.addressDetail}</p>}
            </div>

            {/* Customer Notes */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal block mb-1">Ghi chú bưu tá (Nếu có)</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Ví dụ: Giao ngoài giờ hành chính, gọi điện trước khi ghé hiên..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-purple focus:bg-white focus:outline-none text-text-charcoal font-sans font-light"
                id="checkout-notes"
              />
            </div>

          </div>

          {/* STEP 2: SHIPPING PREFERENCES */}
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase text-brand-purple tracking-widest flex items-center gap-1.5 border-b border-zinc-100 pb-3">
              <span className="bg-brand-purple text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px]">2</span>
              <span>Phương thức bưu tá vận chuyển</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option standard */}
              <label className={`border p-4 rounded-xl flex items-start gap-3.5 cursor-pointer select-none transition-all ${
                form.shippingMethod === 'standard' ? 'border-brand-purple bg-brand-purple-light/20' : 'border-zinc-200 hover:bg-zinc-50'
              }`}>
                <input
                  type="radio"
                  name="shippingMethod"
                  value="standard"
                  checked={form.shippingMethod === 'standard'}
                  onChange={handleChange}
                  className="mt-0.5 text-brand-purple focus:ring-brand-purple"
                />
                <div className="text-xs font-sans">
                  <p className="font-semibold text-text-charcoal">Giao hàng Tiêu Chuẩn</p>
                  <p className="text-[10px] text-text-muted mt-1 leading-normal">Chuyển phát 2-3 ngày dột sương sương toàn quốc. Phí 30.000 ₫ hoặc miễn phí trên mốc 500k.</p>
                </div>
              </label>

              {/* Option express */}
              <label className={`border p-4 rounded-xl flex items-start gap-3.5 cursor-pointer select-none transition-all ${
                form.shippingMethod === 'express' ? 'border-brand-purple bg-brand-purple-light/20' : 'border-zinc-200 hover:bg-zinc-50'
              }`}>
                <input
                  type="radio"
                  name="shippingMethod"
                  value="express"
                  checked={form.shippingMethod === 'express'}
                  onChange={handleChange}
                  className="mt-0.5 text-brand-purple focus:ring-brand-purple"
                />
                <div className="text-xs font-sans">
                  <p className="font-semibold text-text-charcoal">Giao Hàng Nhanh Hỏa Tốc</p>
                  <p className="text-[10px] text-text-muted mt-1 leading-normal">Được gia cố thùng sấy hộp kỹ bọc giấy lót mút. Giao nhanh 1-2 ngày. Phí cố định 45.000 ₫.</p>
                </div>
              </label>
            </div>
          </div>

          {/* STEP 3: MOCK PAYMENTS SELECTIONS */}
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase text-brand-purple tracking-widest flex items-center gap-1.5 border-b border-zinc-100 pb-3">
              <span className="bg-brand-purple text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px]">3</span>
              <span>Hình thức thanh toán dột sương hoài niệm (Simulated)</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {/* COD */}
              <label className={`border p-3 rounded-lg text-center cursor-pointer select-none transition-all flex flex-col items-center gap-2 ${
                form.paymentMethod === 'cod' ? 'border-brand-purple bg-brand-purple-light/25 font-semibold text-brand-purple' : 'border-zinc-200 hover:bg-zinc-50 text-text-charcoal'
              }`}>
                <input type="radio" name="paymentMethod" value="cod" checked={form.paymentMethod === 'cod'} onChange={handleChange} className="sr-only" />
                <Truck className="w-5 h-5 text-zinc-600 shrink-0" />
                <span className="text-[11px] leading-tight">Nhận hàng COD</span>
              </label>

              {/* Bank Transfer */}
              <label className={`border p-3 rounded-lg text-center cursor-pointer select-none transition-all flex flex-col items-center gap-2 ${
                form.paymentMethod === 'bank' ? 'border-brand-purple bg-brand-purple-light/25 font-semibold text-brand-purple' : 'border-zinc-200 hover:bg-zinc-50 text-text-charcoal'
              }`}>
                <input type="radio" name="paymentMethod" value="bank" checked={form.paymentMethod === 'bank'} onChange={handleChange} className="sr-only" />
                <CreditCard className="w-5 h-5 text-zinc-600 shrink-0" />
                <span className="text-[11px] leading-tight">Chuyển khoản</span>
              </label>

              {/* VNPay */}
              <label className={`border p-3 rounded-lg text-center cursor-pointer select-none transition-all flex flex-col items-center gap-2 ${
                form.paymentMethod === 'vnpay' ? 'border-[#003087] bg-blue-50/50 font-semibold text-[#003087]' : 'border-zinc-200 hover:bg-zinc-50 text-text-charcoal'
              }`}>
                <input type="radio" name="paymentMethod" value="vnpay" checked={form.paymentMethod === 'vnpay'} onChange={handleChange} className="sr-only" />
                <div className="w-5 h-5 rounded flex items-center justify-center bg-[#003087] shrink-0">
                  <span className="text-white font-black text-[7px] leading-none">VN</span>
                </div>
                <span className="text-[11px] leading-tight flex flex-col items-center">
                  VNPay
                  <span className="text-[9px] text-emerald-600 font-semibold">✓ Thực tế</span>
                </span>
              </label>

              {/* MoMo */}
              <label className={`border p-3 rounded-lg text-center cursor-pointer select-none transition-all flex flex-col items-center gap-2 ${
                form.paymentMethod === 'momo' ? 'border-brand-purple bg-brand-purple-light/25 font-semibold text-brand-purple' : 'border-zinc-200 hover:bg-zinc-50 text-text-charcoal'
              }`}>
                <input type="radio" name="paymentMethod" value="momo" checked={form.paymentMethod === 'momo'} onChange={handleChange} className="sr-only" />
                <span className="w-5 h-5 font-bold font-sans text-xs bg-pink-600 text-white flex items-center justify-center rounded-md text-[9px] shadow-sm">M</span>
                <span className="text-[11px] leading-tight flex flex-col">MoMo <span className="text-[9px] text-[#A69785]">(Demo)</span></span>
              </label>
            </div>

            {/* Instruction note details depending on payment method */}
            {/* Instruction note details depending on payment method */}
            {form.paymentMethod === 'bank' && (
              <div className="p-5 bg-[#FAF8F3]/75 border border-brand-gold/25 rounded-2xl text-xs text-[#5C452F] space-y-4 font-sans shadow-xs">
                <div className="text-center space-y-1 bg-white/40 p-3 rounded-xl border border-brand-gold/10">
                  <p className="font-serif font-bold text-sm text-brand-purple">❀ Quét mã VietQR chuyển khoản thanh toán ❀</p>
                  <p className="text-[10px] text-text-muted leading-relaxed">Vui lòng quét mã và chuyển chính xác thông tin để bưu cục bọc quà kịp vận hành giao ạ.</p>
                </div>

                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-brand-gold/15 max-w-xs mx-auto shadow-xs">
                  <img 
                    src={`https://img.vietqr.io/image/MB-8668866678-compact2.png?amount=${grandTotal}&addInfo=${draftOrderId}&accountName=${encodeURIComponent("NGUYEN VAN HUE")}`} 
                    alt="Mã VietQR Huegifts"
                    className="w-44 h-44 rounded-lg object-contain"
                  />
                  <div className="mt-2 text-[9px] text-[#A05C29] font-mono font-bold bg-brand-gold-light/60 px-2 py-0.5 rounded tracking-wider animate-pulse">
                    MÃ ĐƠN: {draftOrderId}
                  </div>
                </div>

                <div className="bg-white/85 rounded-xl p-4 border border-brand-gold/15 space-y-3 font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-b border-brand-gold/10 pb-2.5">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-text-muted">Ngân hàng hưởng</p>
                      <p className="font-semibold text-text-charcoal mt-0.5">MB (Ngân hàng Quân Đội)</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-text-muted">Chủ tài khoản</p>
                      <p className="font-bold text-text-charcoal mt-0.5 uppercase">NGUYEN VAN HUE</p>
                    </div>
                  </div>

                  <div className="border-b border-brand-gold/10 pb-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-text-muted">Số tài khoản thụ hưởng</p>
                      <p className="font-bold font-mono text-xs text-brand-purple mt-0.5">8668866678</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("8668866678", "Số tài khoản")}
                      className="bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Sao chép</span>
                    </button>
                  </div>

                  <div className="border-b border-brand-gold/10 pb-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-text-muted">Số tiền dâng bộ</p>
                      <p className="font-extrabold text-xs text-brand-purple mt-0.5 font-sans">{formatPrice(grandTotal)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(grandTotal.toString(), "Số tiền")}
                      className="text-[9px] text-[#A05C29] hover:underline transition-all cursor-pointer font-semibold"
                    >
                      Sao chép tiền
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-[#A05C29] font-semibold">Nội dung chuyển khoản (bắt buộc đúng)</p>
                      <p className="font-black font-mono text-xs text-[#A05C29] mt-0.5">{draftOrderId}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(draftOrderId, "Nội dung chuyển khoản")}
                      className="bg-[#A05C29]/10 hover:bg-[#A05C29]/20 text-[#A05C29] px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Sao chép</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-brand-purple/5 rounded-xl text-[10px] text-text-muted flex items-start gap-2.5 border border-brand-purple/10">
                  <AlertCircle className="w-3.5 h-3.5 text-brand-purple shrink-0 mt-0.5" />
                  <p className="leading-relaxed">Đơn hàng bọc quà sẽ được tạm giữ dưới trạng thái <strong>Chờ thanh toán (pending_payment)</strong> sau khi quý khách xác nhận. Bưu cụ chỉ giao khi nhận đủ thanh toán hóa đơn.</p>
                </div>
              </div>
            )}

            {/* VNPay Info */}
            {form.paymentMethod === 'vnpay' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#003087] flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-[8px]">VN</span>
                  </div>
                  <p className="font-bold text-[#003087]">Thanh toán qua cổng VNPay</p>
                </div>
                <p className="text-[#1E3A5F] leading-relaxed">
                  Sau khi xác nhận đặt hàng, bạn sẽ được chuyển hướng tới <strong>cổng thanh toán VNPay</strong> để hoàn tất giao dịch.
                  Hỗ trợ: ATM, Internet Banking, Thẻ Visa/Mastercard/JCB.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Vietcombank', 'BIDV', 'Techcombank', 'MB Bank', 'ACB', 'VPBank'].map(b => (
                    <span key={b} className="bg-white border border-blue-200 text-[#003087] px-2 py-0.5 rounded text-[10px] font-medium">{b}</span>
                  ))}
                  <span className="text-[10px] text-blue-400">& 40+ ngân hàng khác</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Giao dịch bảo mật SSL — Mã hóa 256-bit — Chứng nhận PCI DSS</span>
                </div>
              </div>
            )}

            {form.paymentMethod === 'momo' && (
              <div className="p-3 bg-[#FAF8F3] border border-[#B88A55]/15 rounded-lg text-xs text-[#5C452F]">
                <p className="font-semibold">❀ MoMo Ví điện tử demo:</p>
                <p>Quét mã QR hoặc chuyển trực tiếp tới SĐT: <b>0977047908</b>.</p>
              </div>
            )}
          </div>

          {/* STEP 4: CÂU CHUYỆN GÓI QUÀ GIÚP BẠN */}
          <div className="bg-brand-gold-light/40 border border-brand-gold/20 p-6 rounded-2xl shadow-xs space-y-4 font-sans">
            <h3 className="text-xs font-black uppercase text-[#5C452F] tracking-wider flex items-center gap-1.5 border-b border-brand-gold/10 pb-3">
              <Heart className="w-4 h-4 text-brand-gold shrink-0" />
              <span>Dịch vụ đặc sắc: Gói quà bưu thiếp gửi trao</span>
            </h3>

            <label className="flex items-start space-x-2.5 text-xs text-text-charcoal cursor-pointer select-none">
              <input
                type="checkbox"
                name="wrapAsGift"
                checked={form.wrapAsGift}
                onChange={handleChange}
                className="rounded border-zinc-300 text-brand-purple focus:ring-brand-purple w-4 h-4 mt-0.5"
                id="checkout-wrap-gift-checkbox"
              />
              <div>
                <p className="font-semibold text-text-charcoal">Tích chọn dịch vụ "Gói quà mộc mạc" (Cực kỳ yêu thích)</p>
                <p className="text-[10px] text-text-muted mt-0.5 font-light leading-relaxed">Chúng tôi gói xắn sản vật trong khay mộc tre bẹ dán, dệt thắt lạt xanh sấy khô, lót thớ giấy nến bảo hộ và viết giùm bức thư tay ghi lời yêu thương của riêng bạn gửi trực tiếp cho người thương (không dột đính hóa đơn tiền) hoàn toàn miễn phí.</p>
              </div>
            </label>

            {form.wrapAsGift && (
              <div className="space-y-2 pt-2 transition-all">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#5C452F] block">Nội dung lời nhắn rủ trong thiệp sen thêu</label>
                <textarea
                  name="giftMessage"
                  value={form.giftMessage}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Ví dụ: Huế có nón lá sông Hương dịu mát, gửi tặng bạn hữu dột sương chút lòng thương nhớ này nồng ấm nhé..."
                  className="w-full bg-white border border-brand-gold/25 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-purple focus:outline-none text-text-charcoal font-serif italic"
                  id="checkout-giftmessage"
                />
              </div>
            )}
          </div>

        </div>

        {/* COLUMN RIGHT: ORDER STICKY SUMMARY (R.Col 5/12) */}
        <div className="lg:col-span-12 xl:col-span-5 bg-white border border-zinc-250 p-6 rounded-2xl shadow-sm font-sans space-y-6 lg:sticky lg:top-24">
          
          <h3 className="text-xs font-bold uppercase text-text-charcoal tracking-wider border-b border-zinc-150 pb-3 block">
            Bưu phẩm trong giỏ hàng
          </h3>

          {/* Miniature List Cards */}
          <div className="max-h-56 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {cart.map(item => (
              <div key={item.product.id} className="flex items-center space-x-3 text-xs">
                <img src={item.product.images[0]} alt={item.product.name} className="w-10 h-10 rounded-lg object-cover border shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <h5 className="font-medium text-text-charcoal truncate">{item.product.name}</h5>
                  <p className="text-[10px] text-text-muted">
                    {formatPrice(item.product.price)} × {item.quantity} món
                  </p>
                </div>
                <span className="font-semibold text-text-charcoal shrink-0">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing calculations total checkboxes */}
          <div className="space-y-3.5 text-xs text-text-charcoal border-t border-zinc-100 pt-4">
            <div className="flex items-center justify-between font-light">
              <span className="text-text-muted">Tạm tính giỏ hàng:</span>
              <span className="font-semibold font-sans">{formatPrice(subtotal)}</span>
            </div>

            {discountPercentage > 0 && (
              <div className="flex items-center justify-between text-brand-green bg-brand-green/5 p-2 rounded">
                <span>Mã chiết khấu {discountCode} (10%):</span>
                <span className="font-semibold font-sans">-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="flex items-center justify-between font-light">
              <span className="text-text-muted">Bưu tá ship tận ngõ:</span>
              <span className="font-semibold font-sans">
                {shippingCharge > 0 ? formatPrice(shippingCharge) : "Miễn phí chuyển phát"}
              </span>
            </div>
            
            {form.wrapAsGift && (
              <div className="flex items-center justify-between text-brand-gold text-[11px] font-medium bg-brand-gold-light/40 p-2 rounded">
                <span>❀ Quà tặng thêu hộp gói mộc mạc:</span>
                <span className="font-sans uppercase">Đính miễn phí</span>
              </div>
            )}
          </div>

          {/* Final grand cost */}
          <div className="flex items-baseline justify-between text-brand-purple border-t border-zinc-100 pt-4">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng cộng dột sương:</span>
            <span className="text-xl font-bold font-sans">{formatPrice(grandTotal)}</span>
          </div>

          {/* Agreements checkboxes */}
          <div className="space-y-3.5 border-t border-zinc-100 pt-4">
            <label className="flex items-start space-x-2 text-[11px] text-text-muted cursor-pointer leading-relaxed">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={form.agreeTerms}
                onChange={handleChange}
                className="rounded border-zinc-300 text-brand-purple focus:ring-brand-purple w-4 h-4 mt-0.5"
                id="checkbox-terms"
              />
              <span>Tôi xác nhận địa chép họ danh thưa nhận của tôi là khớp thật hoàn toàn, hoàn trả bưu tá mộc mạc trong bọc gói cẩn thận.</span>
            </label>
            {errors.agreeTerms && <p className="text-[10px] text-red-500">{errors.agreeTerms}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-purple hover:bg-brand-purple/95 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest text-center cursor-pointer transition-all flex items-center justify-center space-x-2 shadow"
            id="submit-order-checkout-btn"
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              {submitting
                ? (form.paymentMethod === 'vnpay' ? "Đang chuyển sang VNPay..." : "Đang xử lý đơn hàng...")
                : form.paymentMethod === 'vnpay'
                  ? "Đặt hàng & Thanh toán VNPay"
                  : "Xác nhận đặt hàng"}
            </span>
          </button>

        </div>

      </form>

    </div>
  );
};
