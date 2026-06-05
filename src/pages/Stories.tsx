import React, { useState } from 'react';
import { Clock, User, Sparkles, Filter, ChevronRight, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STORIES } from '../data/stories';
import { Breadcrumb } from '../components/Breadcrumb';

export const Stories: React.FC = () => {
  const { navigateTo } = useApp();
  const [activeTag, setActiveTag] = useState<string>('all');

  const tagsList = [
    { label: "Tất cả chuyện", key: "all" },
    { label: "Ẩm thực cố đô", key: "Ẩm thực cố đô" },
    { label: "Chuyện từ làng nghề", key: "Chuyện từ làng nghề" },
    { label: "Biểu tượng Huế", key: "Biểu tượng Huế" },
    { label: "Một thoáng sông Hương", key: "Một thoáng sông Hương" }
  ];

  const filteredStories = activeTag === 'all'
    ? STORIES
    : STORIES.filter(st => st.tag === activeTag);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-16 font-sans">
      
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Câu chuyện Huế' }]} />

      {/* Editorial Header Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden h-72 md:h-96 w-full flex items-center justify-center mb-12">
        <div className="absolute inset-0 bg-[#302A27]/50 z-10" />
        <img
          src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80"
          alt="Không khí hiên cổ rêu phong lãng bảng sương sớm Huế"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative z-20 text-center px-4 max-w-2xl font-sans text-white">
          <span className="text-brand-gold text-[10px] tracking-widest uppercase font-bold bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm mb-3.5 inline-block">
            ❀ lắng nghe tiếng vọng cố đô
          </span>
          <h2 className="text-2xl md:text-4xl font-serif text-[#F7F2EA] leading-snug tracking-tight mb-4">
            Mỗi món quà gửi đi mang theo một câu chuyện dài...
          </h2>
          <p className="text-xs md:text-sm text-amber-50/90 font-light leading-relaxed max-w-lg mx-auto">
            Huegifts gieo vào trang ghi chép này hơi thở rêu phong của hiên nhà vườn vắng, tiếng kim thêu kẽ kẹt đêm thâu xưa, xoa dịu những huyên náo thường nhật.
          </p>
        </div>
      </section>

      {/* Tab Sorters Filters */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3.5 mb-10 pb-4 border-b border-zinc-200">
        <span className="text-xs text-text-muted font-semibold flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span>Lọc theo chủ đề:</span>
        </span>

        {tagsList.map(tag => (
          <button
            key={tag.key}
            onClick={() => setActiveTag(tag.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTag === tag.key
                ? 'bg-[#6E4B67] text-white font-bold'
                : 'bg-[#ECEAEC] text-text-charcoal hover:bg-zinc-200'
            }`}
            id={`tag-story-filter-${tag.key}`}
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* EDITORIAL GRID STORIES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredStories.map((st) => (
          <article
            key={st.id}
            onClick={() => navigateTo('story', { slug: st.slug })}
            className="group bg-[#FCFAF7] border border-zinc-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
            id={`story-article-${st.id}`}
          >
            
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
              <img
                src={st.image}
                alt={st.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transform duration-500 group-hover:scale-103"
              />
              <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-sans font-semibold text-brand-purple uppercase shadow-sm">
                ❀ {st.tag}
              </span>
            </div>

            {/* Content text */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                {/* Meta details */}
                <div className="flex items-center space-x-3 text-[10px] text-text-muted mb-2 font-sans font-light">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{st.readTime}</span>
                  </span>
                  <span>•</span>
                  <span>Ngày {st.publishDate}</span>
                </div>

                {/* Title */}
                <h3 className="font-serif font-semibold text-base text-text-charcoal group-hover:text-brand-purple transition-colors mb-3 line-clamp-2 leading-snug tracking-tight">
                  {st.title}
                </h3>

                {/* Brief draft message */}
                <p className="text-xs text-text-muted line-clamp-3 leading-relaxed mb-4 font-sans font-light">
                  {st.summary}
                </p>
              </div>

              {/* Read button links */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 mt-4 text-[11px] text-text-muted">
                <span className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  <span>Kể bởi {st.author}</span>
                </span>
                <span className="text-brand-purple flex items-center gap-1 font-semibold group-hover:underline uppercase tracking-wider text-[10px]">
                  <span>Vào đọc tiếp</span>
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                </span>
              </div>
            </div>

          </article>
        ))}
      </div>

    </div>
  );
};
