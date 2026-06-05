import React from 'react';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { wishlist, toggleWishlist, addToCart, setQuickViewProduct, navigateTo } = useApp();

  const isFavorited = wishlist.includes(product.id);
  const discountRate = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Format currency helpers e.g. 185.000 ₫
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(value)
      .replace('₫', '₫');
  };

  const handleClickCard = () => {
    navigateTo('product', { slug: product.slug });
  };

  return (
    <div
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-zinc-100/50"
      id={`product-card-${product.id}`}
    >
      {/* Visual Top Area */}
      <div className="relative aspect-square overflow-hidden bg-zinc-50 cursor-pointer" onClick={handleClickCard}>
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {product.isBestSeller && (
            <span className="bg-brand-purple text-white text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded shadow-sm">
              Bán chạy
            </span>
          )}
          {product.isNew && (
            <span className="bg-brand-green text-white text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded shadow-sm">
              Mới
            </span>
          )}
          {discountRate > 0 && (
            <span className="bg-brand-gold text-white text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded shadow-sm">
              Giảm {discountRate}%
            </span>
          )}
        </div>

        {/* Wishlist triggers */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full cursor-pointer transition-all duration-300 shadow-sm hover:scale-110 active:scale-95 ${
            isFavorited
              ? 'bg-red-50 text-red-500 hover:bg-red-100'
              : 'bg-white/90 text-text-charcoal hover:bg-white'
          }`}
          id={`wishlist-btn-${product.id}`}
        >
          <Heart className={`w-4 h-4 shrink-0 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Hover action overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="p-3 bg-white hover:bg-brand-purple hover:text-white text-text-charcoal rounded-full shadow-md transition-colors cursor-pointer transform translate-y-4 group-hover:translate-y-0 duration-300"
            title="Xem nhanh"
            id={`quickview-btn-${product.id}`}
          >
            <Eye className="w-4 h-4 shrink-0" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            className="p-3 bg-white hover:bg-brand-purple hover:text-white text-text-charcoal rounded-full shadow-md transition-colors cursor-pointer transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
            title="Thêm vào giỏ"
            id={`addcart-inline-${product.id}`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
          </button>
        </div>

        {/* Product Image */}
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[11px] text-text-muted/80 tracking-wider uppercase font-sans mb-1 block font-medium">
            {product.categoryName}
          </span>

          {/* Product Name */}
          <h3
            onClick={handleClickCard}
            className="font-serif font-medium text-sm text-text-charcoal hover:text-brand-purple transition-colors line-clamp-2 cursor-pointer mb-1 tracking-tight leading-relaxed"
            id={`product-name-link-${product.id}`}
          >
            {product.name}
          </h3>

          {/* Ratings */}
          <div className="flex items-center space-x-1 mb-2">
            <span className="flex items-center text-brand-gold">
              <Star className="w-3 h-3 fill-current shrink-0" />
              <span className="text-xs font-semibold font-sans ml-0.5">{product.rating}</span>
            </span>
            <span className="text-[11px] text-text-muted">({product.reviewCount} đánh giá)</span>
          </div>

          {/* Description Snippet */}
          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-3 font-sans font-light">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Action button */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-[11px] text-text-muted/60 line-through font-sans">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-sm font-semibold text-brand-purple font-sans leading-none">
              {formatPrice(product.price)}
            </span>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            className="flex items-center space-x-1 text-xs font-medium text-brand-purple hover:text-white border border-brand-purple hover:bg-brand-purple py-1.5 px-3 rounded-lg transition-all cursor-pointer font-sans"
            id={`addcart-simple-${product.id}`}
          >
            <ShoppingBag className="w-3 h-3 shrink-0" />
            <span>+ Giỏ hàng</span>
          </button>
        </div>
      </div>
    </div>
  );
};
