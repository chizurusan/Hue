import React, { useState } from 'react';
import { ShoppingBag, Trash2, ArrowLeft, ArrowRight, Ticket, Check, HelpCircle, Gift } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Breadcrumb } from '../components/Breadcrumb';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, navigateTo, discountCode, discountPercentage, applyDiscount } = useApp();
  const [voucherInput, setVoucherInput] = useState('');

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(value)
      .replace('₫', '₫');
  };

  // 1. Math totals
  const subtotal = cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
  const discountAmount = subtotal * (discountPercentage / 100);
  
  // Free delivery threshold: 500.000 ₫
  const freeShipThreshold = 500000;
  const isFreeShip = subtotal >= freeShipThreshold;
  const shippingFee = subtotal > 0 && !isFreeShip ? 30000 : 0;
  const grandTotal = subtotal - discountAmount + shippingFee;

  // Progress to free shipping percentage calculation
  const percentToFreeShip = Math.min(100, (subtotal / freeShipThreshold) * 100);
  const neededForFreeShip = freeShipThreshold - subtotal;

  const handleVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;
    applyDiscount(voucherInput);
    setVoucherInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-16 font-sans">
      
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Giỏ hàng bưu phẩm' }]} />

      <div className="border-b border-zinc-200 pb-4 mb-8">
        <h2 className="text-3xl font-serif font-semibold text-text-charcoal tracking-tight">
          Giỏ quà của bạn
        </h2>
        <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-xl font-light">
          Xem xét lại danh sách bưu vật gởi tặng lữ chủ phương xa trước khi gói ghém bọc thùng tùng sấy.
        </p>
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: PRODUCTS TABLE (L.Col 8/12) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* A. FREE SHIPPING METRIC TRAILER */}
            <div className="bg-brand-gold-light/40 border border-brand-gold/15 rounded-2xl p-5 font-sans space-y-3">
              <div className="flex items-start md:items-center space-x-3">
                <Gift className="w-5 h-5 text-brand-gold shrink-0 mt-0.5 md:mt-0" />
                <div className="text-xs">
                  {isFreeShip ? (
                    <p className="font-semibold text-[#5C452F]">
                      Chúc mừng bạn! Biên lai của bạn đã đạt điều kiện miễn phí vận chuyển tiêu chuẩn 30.000 ₫ toàn quốc! ❀
                    </p>
                  ) : (
                    <p className="font-light text-[#5C452F]/90">
                      Mua thêm <span className="font-semibold text-brand-purple">{formatPrice(neededForFreeShip)}</span> nữa để được hưởng chính sách <span className="font-semibold">Miễn phí vận chuyển tiêu chuẩn</span> toàn quốc nhé lữ chủ hữu tình.
                    </p>
                  )}
                </div>
              </div>

              {/* Progress bar line */}
              <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-gold rounded-full transition-all duration-500"
                  style={{ width: `${percentToFreeShip}%` }}
                />
              </div>
            </div>

            {/* B. LIST OF CHOSEN ITEMS */}
            <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              
              {/* Header row descriptor */}
              <div className="hidden sm:grid grid-cols-12 bg-zinc-50 p-4 border-b border-zinc-100 text-xs font-semibold text-text-charcoal uppercase tracking-wider">
                <div className="col-span-6">Sản vật</div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-right">Tổng tiền</div>
              </div>

              <div className="divide-y divide-zinc-100">
                {cart.map((item) => {
                  const itemTotal = item.product.price * item.quantity;

                  return (
                    <div
                      key={item.product.id}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 md:p-6"
                      id={`cart-item-${item.product.id}`}
                    >
                      {/* Product identity info */}
                      <div className="col-span-12 sm:col-span-6 flex items-start space-x-4">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          onClick={() => navigateTo('product', { slug: item.product.slug })}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 cursor-pointer border border-zinc-200"
                        />
                        <div className="font-sans">
                          <span className="text-[10px] text-text-muted uppercase tracking-wider">{item.product.categoryName}</span>
                          <h4
                            onClick={() => navigateTo('product', { slug: item.product.slug })}
                            className="text-xs md:text-sm font-serif font-semibold text-text-charcoal cursor-pointer hover:text-brand-purple line-clamp-1 leading-normal"
                          >
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-[11px] text-red-500 hover:text-red-700 mt-1 flex items-center space-x-1 cursor-pointer"
                            id={`remove-from-cart-${item.product.id}`}
                          >
                            <Trash2 className="w-3 h-3 text-red-500 shrink-0" />
                            <span>Xóa khỏi giỏ</span>
                          </button>
                        </div>
                      </div>

                      {/* Item simple unit price */}
                      <div className="col-span-6 sm:col-span-2 text-left sm:text-center text-xs">
                        <span className="sm:hidden text-text-muted font-light mr-1">Đơn giá:</span>
                        <span className="font-semibold text-text-charcoal font-sans">{formatPrice(item.product.price)}</span>
                      </div>

                      {/* Qty controller adjustments */}
                      <div className="col-span-6 sm:col-span-2 flex justify-start sm:justify-center">
                        <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-white shrink-0 scale-90">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="px-2.5 py-1 hover:bg-zinc-100 active:bg-zinc-200 font-bold"
                            id={`desc-qty-cart-${item.product.id}`}
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-semibold w-8 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="px-2.5 py-1 hover:bg-zinc-100 active:bg-zinc-200 font-bold"
                            id={`inc-qty-cart-${item.product.id}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Total cost box */}
                      <div className="col-span-12 sm:col-span-2 text-right text-xs">
                        <span className="sm:hidden text-text-muted font-light mr-1 block sm:inline">Tổng:</span>
                        <span className="font-semibold text-brand-purple font-sans text-sm">{formatPrice(itemTotal)}</span>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

            {/* C. BOTTOM CONTINUATION REDIRECT */}
            <button
              onClick={() => navigateTo('shop')}
              className="text-brand-purple hover:text-brand-purple/85 text-xs font-semibold tracking-wider uppercase font-sans flex items-center space-x-1.5 cursor-pointer"
              id="cart-back-to-shop-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Tiếp tục mua hàng, lụm quà Huế</span>
            </button>

          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY SHEET (R.Col 4/12) */}
          <div className="lg:col-span-4 bg-white border border-zinc-250 p-6 rounded-2xl shadow-sm font-sans space-y-6">
            
            <h3 className="text-sm font-bold uppercase text-text-charcoal tracking-wider border-b border-zinc-100 pb-3 block">
              Tóm tắt đơn hàng
            </h3>

            {/* Calculations items metadata */}
            <div className="space-y-3.5 text-xs text-text-charcoal border-b border-zinc-100 pb-4">
              <div className="flex items-center justify-between font-light">
                <span className="text-text-muted font-light">Tạm tính giỏ ({cart.length} sản phẩm):</span>
                <span className="font-semibold font-sans">{formatPrice(subtotal)}</span>
              </div>

              {/* Coupon active elements */}
              {discountPercentage > 0 && (
                <div className="flex items-center justify-between text-brand-green font-light bg-brand-green/5 p-2 rounded">
                  <div className="flex items-center space-x-1.5">
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Mã {discountCode} (10%)</span>
                  </div>
                  <span className="font-semibold font-sans">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between font-light">
                <span className="text-text-muted font-light flex items-center gap-1">
                  <span>Phí ship dự kiến:</span>
                  <span className="text-[10px] text-brand-gold italic">({isFreeShip ? "Đã miễn ship" : "Cách mốc 500k"})</span>
                </span>
                <span className="font-semibold font-sans">
                  {shippingFee > 0 ? formatPrice(shippingFee) : "Miễn phí"}
                </span>
              </div>
            </div>

            {/* Grand totals */}
            <div className="flex items-baseline justify-between text-brand-purple">
              <span className="text-xs font-semibold uppercase tracking-wider">Tổng cộng cần thanh toán:</span>
              <span className="text-xl font-bold font-sans">{formatPrice(grandTotal)}</span>
            </div>

            {/* D. APPLY PROMOTION REDUCTIONS FORM */}
            <form onSubmit={handleVoucherSubmit} className="space-y-2 border-t border-zinc-100 pt-4">
              <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal block mb-0.5">Nhập mã giảm giá đặc quyền</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ví dụ: HUEGIFTS10"
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value)}
                  className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-brand-purple focus:bg-white focus:outline-none"
                  id="voucher-input-box"
                />
                <button
                  type="submit"
                  className="bg-brand-purple/10 hover:bg-brand-purple hover:text-white text-brand-purple font-semibold text-xs py-1.5 px-4 rounded-lg tracking-wider transition-colors cursor-pointer"
                  id="apply-voucher-btn"
                >
                  Áp dụng
                </button>
              </div>
              <p className="text-[9px] text-brand-gold italic">
                * Nhập mã <b>HUEGIFTS10</b> đặc cách được chiết khấu 10% trực tiếp dột sương!
              </p>
            </form>

            <button
              onClick={() => navigateTo('checkout')}
              className="w-full bg-[#6E4B67] hover:bg-[#54344E] text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest text-center cursor-pointer transition-all flex items-center justify-center space-x-2 shadow-sm"
              id="proceed-checkout-btn"
            >
              <span>Tiến hành ghi nhận thanh toán</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>

          </div>

        </div>
      ) : (
        /* CART EMPTY STYLED PANELS */
        <div className="bg-[#FAF7F2] border border-dashed border-zinc-300 rounded-3xl p-16 text-center max-w-xl mx-auto my-12 font-sans">
          <ShoppingBag className="w-12 h-12 text-[#B88A55] mx-auto mb-4 animate-bounce shrink-0" />
          <h3 className="font-serif font-semibold text-lg text-text-charcoal mb-1">
            Giỏ quà chưa gởi gắm gì
          </h3>
          <p className="text-xs text-text-muted leading-relaxed font-light mb-6 max-w-sm mx-auto">
            Hòm kẹo mứt trà sen dột sương của bạn chưa có gì bày gửi cả. Ghé qua danh sách quà Huế thêu tay để dệt gửi yêu mến ngọt dịu nhé lữ khách hữu ái.
          </p>
          <button
            onClick={() => navigateTo('shop')}
            className="bg-brand-purple hover:bg-brand-purple/95 text-white text-xs font-semibold uppercase tracking-wider px-8 py-2.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-2 mx-auto"
            id="cart-empty-back-shop-btn"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Xách bọc coi mâm quà</span>
          </button>
        </div>
      )}

    </div>
  );
};
