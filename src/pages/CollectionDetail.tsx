import React from 'react';
import { ArrowLeft, ShoppingBag, Landmark, Star, Gift, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COLLECTIONS } from '../data/collections';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumb } from '../components/Breadcrumb';

export const CollectionDetail: React.FC = () => {
  const { routeParams, addToCart, navigateTo, addToast } = useApp();

  const slug = routeParams?.slug;
  const collection = COLLECTIONS.find(c => c.slug === slug) || COLLECTIONS[0];

  if (!collection) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-sans">
        <h3 className="font-serif font-semibold text-lg text-text-charcoal mb-4">Không tìm thấy bộ sưu tập</h3>
        <button onClick={() => navigateTo('collections')} className="bg-[#6E4B67] text-white px-6 py-2 rounded text-xs cursor-pointer">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // Find products matching collection tags or exact ids list
  const collectionProducts = PRODUCTS.filter(p => collection.productIds.includes(p.id));

  // UX Shortcut: Add whole box to shopping cart!
  const handleAddFullCollectionToCart = () => {
    if (collectionProducts.length === 0) return;
    
    collectionProducts.forEach(prod => {
      addToCart(prod, 1);
    });

    addToast(`Đã thêm trọn vẹn ${collectionProducts.length} món quà thuộc Bộ "${collection.name}" vào giỏ gói của bạn rồi nhé! ❀`, 'success');
    navigateTo('cart');
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const totalPackPrice = collectionProducts.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-16 font-sans">
      
      {/* 1. BREADCRUMBS */}
      <Breadcrumb items={[
        { label: 'Bộ sưu tập', page: 'collections' },
        { label: collection.name }
      ]} />

      {/* 2. MAIN BOLD HERO HERO HEADER */}
      <section className="relative rounded-3xl overflow-hidden h-64 md:h-80 w-full flex items-center justify-center mb-10">
        <div className="absolute inset-0 bg-[#281D17]/40 z-10" />
        <img
          src={collection.bannerImage}
          alt={collection.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative z-20 text-center px-4 max-w-xl font-sans text-white">
          <span className="text-brand-gold text-[9px] tracking-widest uppercase font-black bg-white/10 px-2.5 py-1 rounded backdrop-blur-xs mb-3 inline-block">
            ❀ Dệt ước kinh kỳ ❀
          </span>
          <h1 className="text-xl md:text-3xl font-serif text-[#FAF8F5] leading-snug font-semibold">
            Bộ sưu tập: {collection.name}
          </h1>
          <p className="text-xs text-amber-50/80 leading-relaxed max-w-md mx-auto mt-2 font-light">
            Sắp đặt hài hòa gửi gắm trọn vẹn phong hoa Huế trong bọc rương gấm thêu tay.
          </p>
        </div>
      </section>

      {/* 3. COLLECTION CONCEPT SUMMARY */}
      <section className="bg-brand-gold-light/40 border border-brand-gold/15 rounded-3xl p-6 md:p-10 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 font-sans">
        
        <div className="space-y-4 max-w-xl">
          <span className="text-[10px] text-brand-gold uppercase tracking-wider font-bold block">❀ Câu chuyện chủ đề</span>
          <h2 className="text-lg md:text-xl font-serif font-semibold text-text-charcoal leading-none">
            Cảm hứng từ nét dịu đằm xứ Thần Kinh
          </h2>
          <p className="text-xs text-text-muted leading-relaxed font-light">
            {collection.description}
          </p>
          <p className="text-xs italic text-[#5C452F] font-serif border-l-2 border-brand-gold pl-3 leading-relaxed">
            "{collection.shortIntro}"
          </p>
        </div>

        {/* Packing Option Upsell Core Card */}
        {collectionProducts.length > 0 && (
          <div className="bg-white border border-brand-gold/20 p-5 rounded-2xl md:w-80 shadow-xs space-y-3 shrink-0">
            <h4 className="text-xs font-semibold text-text-charcoal uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-2">
              <Gift className="w-4 h-4 text-brand-gold" />
              <span>Mua trọn bộ khay mẫu</span>
            </h4>
            <div className="text-xs font-sans space-y-1.5 text-text-muted">
              <p className="font-light">Thêm nhanh trọn bộ gồm <span className="font-semibold text-brand-purple">{collectionProducts.length} sản vật</span> thêu lạt mộc.</p>
              <p className="font-light">Giá gom: <span className="text-base font-bold text-brand-purple font-sans block mt-1">{formatPrice(totalPackPrice)}</span></p>
            </div>
            <button
              onClick={handleAddFullCollectionToCart}
              className="w-full bg-[#6E4B67] hover:bg-[#54344E] text-white py-2 rounded text-xs font-bold uppercase tracking-widest text-center cursor-pointer transition-colors shadow-xs"
              id="buy-full-pack-trigger"
            >
              Gom mua trọn bộ
            </button>
          </div>
        )}

      </section>

      {/* 4. PRODUCTS CLASSIFIED GRID */}
      <div className="space-y-8">
        <h3 className="font-serif font-medium text-lg text-text-charcoal pb-4 border-b border-zinc-200 flex items-center gap-2">
          <Landmark className="w-5 h-5 text-brand-purple shrink-0" />
          <span>Sản vật kết hợp trong bộ sưu tập ({collectionProducts.length})</span>
        </h3>

        {collectionProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {collectionProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-muted italic">Đang cập nhật sản phẩm liên quan...</p>
        )}
      </div>

      {/* 5. REDIRECT LINK */}
      <div className="border-t border-zinc-200 pt-8 mt-16 text-center">
        <button
          onClick={() => navigateTo('collections')}
          className="text-brand-purple hover:text-brand-purple/85 text-xs font-semibold tracking-wider uppercase flex items-center space-x-1.5 mx-auto cursor-pointer"
          id="detailcol-back-index-btn"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Trở về xem các Bộ sưu tập khác</span>
        </button>
      </div>

    </div>
  );
};
