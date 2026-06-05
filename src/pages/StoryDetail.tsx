import React from 'react';
import { ArrowLeft, Clock, Calendar, User, ShoppingBag, Landmark } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STORIES } from '../data/stories';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumb } from '../components/Breadcrumb';

export const StoryDetail: React.FC = () => {
  const { routeParams, navigateTo } = useApp();

  const slug = routeParams?.slug;
  const story = STORIES.find(st => st.slug === slug) || STORIES[0];

  if (!story) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-sans tracking-tight">
        <h3 className="font-serif font-semibold text-lg text-text-charcoal mb-4">Không tìm thấy câu chuyện</h3>
        <button onClick={() => navigateTo('stories')} className="bg-[#6E4B67] text-white px-6 py-2 rounded text-xs shrink-0 cursor-pointer">
          Trở lại mục lục chuyện
        </button>
      </div>
    );
  }

  // Find related products mentioned in this story
  const matchedProducts = PRODUCTS.filter(p => story.relatedProductIds.includes(p.id));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 pb-16 font-sans">
      
      {/* 1. BREADCRUMBS */}
      <Breadcrumb items={[
        { label: 'Câu chuyện Huế', page: 'stories' },
        { label: story.title }
      ]} />

      {/* 2. ARTICLE META HEADER */}
      <header className="space-y-4 mb-8 text-center pt-4">
        <span className="text-brand-purple text-[10px] uppercase font-bold tracking-widest bg-brand-purple/5 px-3 py-1 rounded inline-block shadow-xs">
          ❀ Chuyên mục: {story.tag}
        </span>
        <h1 className="text-2xl md:text-4xl font-serif text-text-charcoal tracking-tight leading-snug font-medium max-w-3xl mx-auto">
          {story.title}
        </h1>

        <div className="flex items-center justify-center space-x-4 text-xs text-text-muted font-sans font-light">
          <span className="flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-brand-gold shrink-0" />
            <span>Kể bởi {story.author}</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>{story.publishDate}</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>{story.readTime}</span>
          </span>
        </div>
      </header>

      {/* 3. HERO ARTICLE BANNER */}
      <div className="relative aspect-video rounded-3xl overflow-hidden shadow-md mb-12 border border-zinc-200/50">
        <img
          src={story.image}
          alt={story.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 4. MAIN EDITORIAL CONTENT TEXT */}
      <section className="font-serif leading-relaxed text-text-charcoal text-sm md:text-base space-y-6 max-w-2xl mx-auto mb-16">
        {story.content.map((paragraph, index) => {
          if (index === 0) {
            return (
              <p key={index} className="leading-relaxed text-slate-800 font-light first-letter:text-6xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:font-black first-letter:text-[#6E4B67] select-all">
                {paragraph}
              </p>
            );
          }
          return (
            <p key={index} className="leading-relaxed text-[#4A4440] font-light">
              {paragraph}
            </p>
          );
        })}

        {/* Elegant callout quote block */}
        {story.quote && (
          <div className="quote-decorative bg-[#FAF6EE] p-6 rounded-r-2xl border-l-4 border-brand-gold my-8 shadow-xs">
            <p className="text-sm italic text-slate-800 font-light leading-relaxed">
              “{story.quote}”
            </p>
          </div>
        )}
      </section>

      {/* 5. COMMERCE BRIDGE: MATCHED SOUVENIR PRODUCTS */}
      {matchedProducts.length > 0 && (
        <section className="bg-brand-gold-light/40 border border-brand-gold/15 rounded-3xl p-8 mb-12 font-sans">
          <div className="flex items-center space-x-2 mb-6 justify-center">
            <Landmark className="w-5 h-5 text-brand-gold shrink-0" />
            <h3 className="font-serif font-semibold text-lg text-text-charcoal leading-none">
              Mang câu chuyện Huế này dạo thềm nhà gỗ
            </h3>
          </div>

          <p className="text-xs text-text-muted font-sans font-light text-center max-w-md mx-auto mb-8">
            Huegifts gợi mở chắt lọc những vật phẩm đặc biệt liên quan tới ký ức câu chuyện của bài viết phía trên:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {matchedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 6. REDIRECT LINK TO INDEX */}
      <div className="border-t border-zinc-200 pt-8 text-center font-sans mt-16">
        <button
          onClick={() => navigateTo('stories')}
          className="text-brand-purple hover:text-[#54344E] text-xs font-semibold tracking-wider uppercase flex items-center space-x-1.5 mx-auto cursor-pointer"
          id="detailstory-back-index-btn"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Quay lại trang đề lục chuyện xưa</span>
        </button>
      </div>

    </div>
  );
};
