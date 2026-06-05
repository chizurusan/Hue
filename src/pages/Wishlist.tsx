import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRODUCTS } from '../data/products';
import { Breadcrumb } from '../components/Breadcrumb';

export const Wishlist: React.FC = () => {
  const { wishlist, toggleWishlist, addToCart, navigateTo } = useApp();

  const favoritedProducts = PRODUCTS.filter(p => wishlist.includes(p.id));

  const handleAddQuickToCart = (p: typeof PRODUCTS[0]) => {
    addToCart(p, 1);
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-16 font-sans">
      
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Quà lưu niệm yêu thích' }]} />

      <div className="border-b border-zinc-200 pb-4 mb-8">
        <h2 className="text-3xl font-serif font-semibold text-text-charcoal tracking-tight">
          Danh mục quà yêu thích
        </h2>
        <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-xl font-light">
          Nơi lưu giữ lại những bưu phẩm xinh tươi, những câu chuyện Huế lãng vãng mà tâm can bạn hằng mong mỏi rước về thềm nhà gỗ.
        </p>
      </div>

      {favoritedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favoritedProducts.map((p) => {
            const discountRate = p.originalPrice
              ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
              : 0;

            return (
              <div
                key={p.id}
                className="group bg-white rounded-xl overflow-hidden border border-zinc-150 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                id={`wishlist-item-${p.id}`}
              >
                {/* Image core details */}
                <div className="relative aspect-square overflow-hidden bg-zinc-50">
                  {discountRate > 0 && (
                    <span className="absolute top-2 left-2 bg-brand-gold text-white text-[9px] font-semibold tracking-wider px-1.5 py-0.5 rounded shadow-xs z-10">
                      Giảm {discountRate}%
                    </span>
                  )}
                  {/* Remove cross */}
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/95 rounded-full text-red-500 shadow-sm hover:scale-105 active:scale-95 cursor-pointer z-10"
                    title="Xóa ra mục lưu tủ"
                    id={`wishlist-delete-${p.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <img
                    src={p.images[0]}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    onClick={() => navigateTo('product', { slug: p.slug })}
                    className="w-full h-full object-cover transform duration-500 hover:scale-103 cursor-pointer"
                  />
                </div>

                {/* Content specifications */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-text-muted tracking-wider uppercase block mb-1 font-sans">{p.categoryName}</span>
                    <h3
                      onClick={() => navigateTo('product', { slug: p.slug })}
                      className="font-serif text-sm font-semibold text-text-charcoal cursor-pointer hover:text-brand-purple line-clamp-2 leading-relaxed mb-2"
                      id={`wishlist-title-${p.id}`}
                    >
                      {p.name}
                    </h3>
                    <p className="text-xs font-bold text-brand-purple mb-4">
                      {formatPrice(p.price)}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-100">
                    <button
                      onClick={() => handleAddQuickToCart(p)}
                      disabled={p.stock <= 0}
                      className="w-full bg-brand-purple hover:bg-brand-purple/95 disabled:bg-zinc-300 text-white py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                      id={`add-cart-wishlist-${p.id}`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                      <span>Thêm giỏ hàng</span>
                    </button>
                    <button
                      onClick={() => navigateTo('product', { slug: p.slug })}
                      className="w-full bg-[#ECEAEC] hover:bg-[#DDDADE] text-text-charcoal py-1.5 rounded text-xs px-2 cursor-pointer text-center text-[11px]"
                      id={`readstory-wishlist-${p.id}`}
                    >
                      ❀ Đọc chuyện phía sau
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* STYLED EMPTY STATE FOR WISHLIST */
        <div className="bg-[#FAF7F2] border border-dashed border-zinc-300 rounded-3xl p-16 text-center max-w-xl mx-auto my-12">
          <Heart className="w-12 h-12 text-[#B88A55] mx-auto mb-4 animate-bounce shrink-0" />
          <h3 className="font-serif font-semibold text-lg text-text-charcoal mb-1">
            Chưa lưu giữ bưu phẩm nào
          </h3>
          <p className="text-xs text-text-muted leading-relaxed font-light mb-6 max-w-sm mx-auto">
            Hòm rương lãng vãng yêu mến của bạn hiện tại còn trơ trống lắm. Đi một lèo dạo gõ ngõ cửa hàng, gửi hoa sen nón lá bọc thư sương nhé.
          </p>
          <button
            onClick={() => navigateTo('shop')}
            className="bg-brand-purple hover:bg-brand-purple/95 text-white text-xs font-semibold uppercase tracking-wider px-8 py-2.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-2 mx-auto"
            id="wishlist-empty-to-shop-btn"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Ghé coi cửa hàng quà</span>
          </button>
        </div>
      )}

    </div>
  );
};
