import React from 'react';
import { ArrowRight, MapPin, Feather, Heart, Sparkles, Box, ShieldCheck, Truck, Headphones } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COLLECTIONS } from '../data/collections';
import { ProductCard } from '../components/ProductCard';

export const Home: React.FC = () => {
  const { products, navigateTo } = useApp();

  // Pick top 8 best products to display
  const featuredProducts = products.slice(0, 8);

  const categories = [
    {
      name: "Đặc sản Huế",
      desc: "Trà sen, mè xửng, vị ngọt dào ngọt",
      tag: "dac-san",
      image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Thủ công mỹ nghệ",
      desc: "Nón bài thơ, ly gốm mộc vuốt tay",
      tag: "thu-cong",
      image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Quà tặng văn hóa",
      desc: "Túi tote thêu cung đình, pháp lam cổ kính",
      tag: "qua-tang-van-hoa",
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Văn phòng phẩm & Postcard",
      desc: "Bưu thiếp ký họa màu nước sông Hương",
      tag: "van-phong-pham",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Quà tặng theo dịp",
      desc: "Set quà sang trọng tinh tươm biếu đối tác",
      tag: "qua-tang-theo-dip",
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80"
    }
  ];

  const valueProps = [
    {
      icon: ShieldCheck,
      title: "Đậm dấu ấn xứ Huế",
      desc: "Mỗi chế tác gói ghém 100% nguyên gốc cố đô, dột sương sương làng nghề cổ."
    },
    {
      icon: Box,
      title: "Đóng gói tinh tế",
      desc: "Mỹ thuật bọc gói bằng lạt mây, giấy thô và viết thiệp tay dào dạt nghĩa tình."
    },
    {
      icon: Truck,
      title: "Giao hàng toàn quốc",
      desc: "Được gia cố thùng gỗ bảo vệ sản phẩm cực kỳ kỹ lưỡng dẫu chuyển đi xa."
    },
    {
      icon: Headphones,
      title: "Cố vấn tận tụy",
      desc: "Lắng nghe nhu cầu, hỗ trợ viết thiệp chúc mừng riêng biệt từng người nhận."
    }
  ];

  const handleCategoryClick = (categoryKey: string) => {
    localStorage.setItem('huegifts_active_category_trigger', categoryKey);
    navigateTo('shop');
  };

  return (
    <div className="space-y-16 pb-16 font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[450px] md:h-[600px] w-full flex items-center justify-center overflow-hidden">
        {/* Ambient Darkened Background image */}
        <div className="absolute inset-0 bg-[#302A27]/40 z-10" />
        <img
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1500&q=90"
          alt="Xứ Huế mộng mơ bên bờ sông Hương hoàng hôn"
          className="absolute inset-0 w-full h-full object-cover transform scale-102 hover:scale-105 transition-transform duration-10000"
        />

        {/* Content Box */}
        <div className="relative z-20 text-center px-4 max-w-3xl flex flex-col items-center">
          <span className="text-brand-gold text-xs uppercase font-semibold tracking-widest mb-4 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
            ❀ Huegifts — Thương hiệu Quà lưu niệm & Văn hóa Cố Đô
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium text-amber-50 leading-tight tracking-tight mb-5 shadow-sm">
            Mang một miền thương về nhà
          </h2>
          <p className="text-sm md:text-base text-amber-50/90 leading-relaxed font-light mb-8 max-w-xl shadow-xs">
            Những món quà nhỏ bé đơm hoa chắt chiu từ ký ức yên bình, rêu phong làng cổ xưa và nếp trà tĩnh tại tinh tế của Huế thương yêu hiền hòa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigateTo('shop')}
              className="bg-[#6E4B67] hover:bg-[#54344E] text-white py-3 px-8 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              id="hero-shop-cta"
            >
              Khám phá quà Huế
            </button>
            <button
              onClick={() => navigateTo('stories')}
              className="bg-white/15 hover:bg-white/25 text-amber-50 hover:text-white border border-white/40 py-3 px-8 rounded-lg text-xs font-semibold uppercase tracking-wider backdrop-blur-sm transition-colors cursor-pointer"
              id="hero-stories-cta"
            >
              Lắng nghe chuyện Huế
            </button>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h3 className="font-serif font-medium text-2xl md:text-3xl text-text-charcoal tracking-tight mb-2">
            Danh mục quà tặng tuyển lựa
          </h3>
          <p className="text-xs text-text-muted font-light leading-relaxed">
            Chọn một bưu phẩm đong đầy dấu ấn Huế theo sở thích hay dịp đặc biệt để gởi thương mến
          </p>
        </div>

        {/* Responsive Horizontal categories slider / grids */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => handleCategoryClick(cat.tag)}
              className="group relative h-48 rounded-xl overflow-hidden shadow-xs cursor-pointer border border-zinc-200/40"
              id={`cat-card-${cat.tag}`}
            >
              {/* Backdrop darken */}
              <div className="absolute inset-0 bg-[#302A27]/50 group-hover:bg-[#302A27]/60 transition-colors z-10" />
              <img
                src={cat.image}
                alt={cat.name}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 p-4 z-20 flex flex-col justify-end text-white font-sans">
                <span className="text-[10px] text-brand-gold font-semibold uppercase tracking-widest mb-1">❀ Khám phá</span>
                <h4 className="font-serif font-semibold text-sm tracking-tight text-[#F7F2EA] group-hover:text-white transition-colors">
                  {cat.name}
                </h4>
                <p className="text-[9px] text-[#F7F2EA]/75 line-clamp-1 font-light leading-none mt-1">
                  {cat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. POPULAR PRODUCTS (MÓN QUÀ YÊU THÍCH) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-8 border-b border-zinc-250/20 pb-4">
          <div>
            <h3 className="font-serif font-medium text-2xl md:text-3xl text-text-charcoal tracking-tight mb-1">
              Món quà được yêu chuộng
            </h3>
            <p className="text-xs text-text-muted font-light">
              Những tạo tác đắt khách nhất do bạn hữu du phương đánh giá lựa chọn
            </p>
          </div>
          <button
            onClick={() => navigateTo('shop')}
            className="text-brand-purple hover:text-brand-purple/80 text-xs font-semibold tracking-wider font-sans uppercase mt-2 md:mt-0 flex items-center space-x-1 cursor-pointer"
            id="see-all-products-link"
          >
            <span>Bàn giao ngắm cửa hàng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 8 Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 4. EDITORIAL STORY SECTION */}
      <section className="bg-brand-purple-light/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Photo banner */}
          <div className="lg:col-span-5 relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg border border-white">
            <img
              src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=700&q=80"
              alt="Người thợ nắn nón lá bài thơ mộc mạc"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded text-[10px] font-sans font-semibold tracking-wide text-brand-purple shadow-sm uppercase">
              • Chuyện từ làng Dạ Lê
            </div>
          </div>

          {/* Text Editorial Column */}
          <div className="lg:col-span-7 font-sans">
            <span className="text-brand-gold text-xs uppercase font-bold tracking-widest mb-3 block">
              ✿ Sứ mệnh của chúng tôi
            </span>
            <h3 className="font-serif font-medium text-3xl md:text-4xl text-text-charcoal leading-tight tracking-tight mb-5">
              Mỗi món quà đều mang theo một câu chuyện dài...
            </h3>
            
            <p className="text-xs text-text-muted leading-relaxed font-light mb-4">
              Món quà lưu niệm gửi trao không chỉ là một cái móc khóa Pháp Lam hay chiếc bọc trà sen khô khan. Đó là giọt mồ hôi trên vạt áo rám mỡ láng của người thợ đúc đồng Phủ Cam thâu đêm gốm nung lửa hực; là lời rỉ rả thơ tình thầm kín nằm kẹp tơ lá mỏng dưới vành nón gồi của bà cô bến đò xưa; hay là làn hương hoài niệm ngọt bùi dính kẹo mè răng lúc Huế đổ gió bấc mưa dầm rỉ rả.
            </p>
            
            <div className="quote-decorative mb-6 my-4 pl-4 border-l-2 border-brand-gold">
              <p className="text-sm font-serif italic text-text-charcoal font-light leading-relaxed">
                “Huegifts không bán sản vật trơn tuột. Chúng tôi gửi trao chiếc hòm gỗ đan sáp chứa ký ức sương khói của cố cung thơ mộng, đắp đổi vẹn nguyên mộc mạc của quê hương gửi người ly xứ.”
              </p>
            </div>

            <button
              onClick={() => navigateTo('stories')}
              className="bg-brand-purple hover:bg-brand-purple/95 text-white text-xs font-semibold tracking-wider uppercase py-2.5 px-6 rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
              id="editorial-stories-btn"
            >
              <span>Lắng nghe câu chuyện Huế</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. THEMED COLLECTIONS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-brand-purple text-xs uppercase font-bold tracking-widest mb-1.5 block">✵ Cảm hứng Huế</span>
          <h3 className="font-serif font-medium text-2xl md:text-3xl text-text-charcoal tracking-tight mb-2">
            Độc bản bốn Bộ Sưu Tập
          </h3>
          <p className="text-xs text-text-muted font-light">
            Mỗi bộ sưu tập dệt nên bức thêu hoàn mỹ tượng trưng từng khoảnh khắc nao lòng của Huế thương
          </p>
        </div>

        {/* 4 Collections layout split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {COLLECTIONS.map((c) => (
            <div
              key={c.id}
              className="group bg-[#F4EDE2] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between border border-zinc-200/50"
              id={`collection-card-${c.id}`}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={c.bannerImage}
                  alt={c.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transform duration-500 group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-black/20" />
                <h4 className="absolute bottom-4 left-6 text-white font-serif font-semibold text-xl tracking-tight">
                  {c.name}
                </h4>
              </div>
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <p className="text-xs text-text-charcoal leading-relaxed mb-4 font-light">
                    {c.description}
                  </p>
                  <p className="text-[11px] text-text-muted italic leading-relaxed mb-4">
                    ❀ {c.shortIntro}
                  </p>
                </div>
                <button
                  onClick={() => navigateTo('collection', { slug: c.slug })}
                  className="text-brand-purple hover:text-brand-purple/80 text-xs font-semibold tracking-wider font-sans uppercase flex items-center space-x-1.5 cursor-pointer self-start"
                  id={`browse-collection-${c.id}`}
                >
                  <span>Khám phá bộ vật phẩm ({c.productIds.length} món)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. GUARANTEE / VALUES PROPS */}
      <section className="bg-[#1C1715] text-[#F7F2EA] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {valueProps.map((prop, idx) => {
              const Icon = prop.icon;
              return (
                <div key={idx} className="flex space-x-3 text-[#F7F2EA]">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 shrink-0 text-brand-gold h-10 w-10 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold tracking-wider uppercase text-amber-50 mb-1">
                      {prop.title}
                    </h4>
                    <p className="text-[11px] text-amber-100/60 leading-relaxed font-light">
                      {prop.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
    </div>
  );
};
