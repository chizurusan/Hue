import React, { useState } from 'react';
import { X, Heart, Star, ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProductQuickView: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, wishlist, toggleWishlist, addToCart, navigateTo } = useApp();
  const [qty, setQty] = useState(1);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isFavorited = wishlist.includes(product.id);
  const discountRate = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleClose = () => {
    setQty(1);
    setQuickViewProduct(null);
  };

  const handleAddToCart = () => {
    addToCart(product, qty);
    handleClose();
  };

  const handleViewMore = () => {
    navigateTo('product', { slug: product.slug });
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6" id="quickview-overlay">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Content modal */}
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto relative z-10 shadow-2xl flex flex-col md:flex-row border border-zinc-200/50">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white rounded-full text-text-charcoal hover:text-brand-purple shadowtransition-colors cursor-pointer"
          id="close-quickview-cross"
        >
          <X className="w-5 h-5 shrink-0" />
        </button>

        {/* Gallery Panel */}
        <div className="w-full md:w-1/2 p-6 md:p-8 bg-zinc-50 border-r border-zinc-100 flex items-center justify-center relative min-h-[300px]">
          {discountRate > 0 && (
            <span className="absolute top-6 left-6 bg-brand-gold text-white text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm">
              Giảm {discountRate}%
            </span>
          )}
          <img
            src={product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full max-h-[350px] object-cover rounded-xl shadow-md"
          />
        </div>

        {/* Info detail Panel */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between font-sans">
          <div>
            {/* Category */}
            <span className="text-[10px] text-brand-purple font-medium tracking-wider uppercase block mb-1">
              {product.categoryName}
            </span>

            {/* Name */}
            <h2 className="text-xl md:text-2xl font-serif font-medium text-text-charcoal tracking-tight leading-snug mb-2">
              {product.name}
            </h2>

            {/* Ratings & status */}
            <div className="flex items-center space-x-3 mb-4">
              <span className="flex items-center text-brand-gold">
                <Star className="w-4 h-4 fill-current shrink-0" />
                <span className="text-xs font-semibold ml-1">{product.rating}</span>
              </span>
              <span className="text-xs text-text-muted">({product.reviewCount} lượt khách đánh giá)</span>
              <span className="text-xs text-gray-300">|</span>
              <span className={`text-[11px] font-semibold tracking-wide ${product.stock > 0 ? 'text-brand-green' : 'text-red-500'}`}>
                {product.stock > 0 ? `Còn hàng (Sẵn ${product.stock})` : 'Hết hàng'}
              </span>
            </div>

            {/* Prices */}
            <div className="flex items-baseline space-x-3 mb-4 bg-zinc-55 p-3 rounded-lg border border-zinc-100/50">
              <span className="text-xl font-bold text-brand-purple">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-text-muted/60 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Description card */}
            <p className="text-xs text-text-muted mb-4 leading-relaxed font-light">
              {product.shortDescription}
            </p>

            {/* Story snippet decorative */}
            <div className="mb-6 p-4 bg-brand-gold-light/40 border-l-2 border-brand-gold rounded-r-lg">
              <h4 className="text-[11px] font-semibold text-brand-gold tracking-wide uppercase mb-1">
                ❀ Chuyện sau món quà
              </h4>
              <p className="text-xs text-text-charcoal italic line-clamp-3 leading-relaxed font-serif">
                "{product.story}"
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              {/* Qty count selector */}
              <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setQty(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 hover:bg-zinc-100 active:bg-zinc-250 cursor-pointer text-xs font-black"
                  id="desc-qty-quick"
                >
                  -
                </button>
                <span className="px-3 text-xs font-semibold w-8 text-center">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(prev => Math.min(product.stock, prev + 1))}
                  className="px-3 py-1.5 hover:bg-zinc-100 active:bg-zinc-250 cursor-pointer text-xs font-black"
                  id="inc-qty-quick"
                >
                  +
                </button>
              </div>

              {/* Add directly to cart */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 bg-brand-purple hover:bg-brand-purple/95 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 text-xs font-medium cursor-pointer"
                id="add-cart-quickview-action"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>Thêm vào giỏ ({formatPrice(product.price * qty)})</span>
              </button>

              {/* Heart wishlist toggle */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  isFavorited
                    ? 'border-red-100 bg-red-50 text-red-500'
                    : 'border-zinc-200 text-text-muted hover:bg-zinc-50'
                }`}
                title="Lưu yêu thích"
                id="wishlist-toggle-quick"
              >
                <Heart className={`w-4 h-4 shrink-0 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* See complete page link */}
            <button
              onClick={handleViewMore}
              className="w-full text-center hover:text-brand-purple text-text-muted text-xs font-semibold py-2 rounded border border-dotted border-zinc-200 hover:border-brand-purple/50 bg-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
              id="view-more-quickview-action"
            >
              <span>Xem chi tiết & gửi câu chuyện đầy đủ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
