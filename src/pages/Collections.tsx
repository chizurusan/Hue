import React from 'react';
import { ArrowRight, Sparkles, Feather, Bookmark } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COLLECTIONS } from '../data/collections';
import { Breadcrumb } from '../components/Breadcrumb';

export const Collections: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-16 font-sans">
      
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Bộ sưu tập' }]} />

      <div className="border-b border-zinc-200 pb-4 mb-10">
        <h2 className="text-3xl font-serif font-semibold text-text-charcoal tracking-tight">
          Bộ sưu tập chủ đề
        </h2>
        <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-xl font-light">
          Những món bưu phẩm đan kết hài hòa theo những dòng cảm hứng kinh điển, chưng cất trọn vị duyên lắng đọng xứ Huế.
        </p>
      </div>

      {/* Grid Collections lists */}
      <div className="space-y-12">
        {COLLECTIONS.map((c, idx) => {
          const isOdd = idx % 2 !== 0;

          return (
            <div
              key={c.id}
              className={`flex flex-col lg:flex-row items-center border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-xs hover:shadow-md transition-all gap-6 lg:gap-0 ${
                isOdd ? 'lg:flex-row-reverse' : ''
              }`}
              id={`col-entry-${c.id}`}
            >
              {/* Photo Area */}
              <div className="w-full lg:w-1/2 h-64 md:h-80 relative overflow-hidden shrink-0">
                <img
                  src={c.bannerImage}
                  alt={c.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transform duration-500 hover:scale-102"
                />
                <div className="absolute inset-0 bg-black/15" />
                <span className="absolute top-4 left-4 bg-white/95 px-3 py-1 rounded text-[10px] font-sans font-bold text-brand-purple uppercase shadow flex items-center gap-1">
                  <Bookmark className="w-3 h-3 text-brand-gold shrink-0" />
                  <span>Bộ sưu tập số 0{idx + 1}</span>
                </span>
              </div>

              {/* Text Description area */}
              <div className="w-full lg:w-1/2 p-6 md:p-10 font-sans space-y-4">
                <span className="text-brand-gold text-[10px] font-bold uppercase tracking-widest block">❀ Cảm hứng Dấn Huế</span>
                <h3 className="font-serif font-semibold text-xl md:text-2xl text-text-charcoal leading-none">
                  Bộ: {c.name}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed font-light">
                  {c.description}
                </p>
                <div className="p-4 bg-brand-gold-light/40 border-l-2 border-brand-gold rounded-r-lg">
                  <p className="text-xs italic text-[#5C452F] font-serif leading-relaxed">
                    "{c.shortIntro}"
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigateTo('collection', { slug: c.slug })}
                    className="bg-[#6E4B67] hover:bg-[#54344E] text-white text-xs font-semibold uppercase tracking-wider py-2.5 px-6 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 shadow-sm"
                    id={`browse-col-landing-${c.id}`}
                  >
                    <span>Xem {c.productIds.length} tặng vật liên quan</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
