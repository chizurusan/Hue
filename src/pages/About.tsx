import React from 'react';
import { Sparkles, Heart, Landmark, HelpCircle, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Breadcrumb } from '../components/Breadcrumb';

export const About: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-16 font-sans">
      
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Về Huegifts' }]} />

      {/* Hero Banner Title */}
      <section className="text-center space-y-4 max-w-2xl mx-auto py-8">
        <span className="text-brand-purple text-xs font-bold uppercase tracking-widest bg-brand-purple-light px-3 py-1 rounded inline-block shadow-xs">
          ❀ gieo chút tình cố đô vào hẻm vắng ❀
        </span>
        <h2 className="text-2xl md:text-4xl font-serif text-text-charcoal leading-snug tracking-tight">
          Nguồn cơn ra đời thương mến “Huegifts”
        </h2>
        <p className="text-xs md:text-sm text-text-muted leading-relaxed font-light">
          “Mang một miền thương về nhà” - Huegifts ra đời không chỉ với bổn phận gói bán quà bưu vật, mà dệt lạt nâng niu dòng ký ức cổ kính mộng mơ trầm rêu gửi gắm tới mọi lữ phương ái mến.
        </p>
      </section>

      {/* Editorial Content split grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center my-12">
        
        {/* Photo Left */}
        <div className="relative aspect-square md:aspect-video lg:aspect-square bg-zinc-100 rounded-3xl overflow-hidden shadow-md border">
          <img
            src="https://images.unsplash.com/photo-1543731068-7e0f5beff43a?auto=format&fit=crop&w=700&q=80"
            alt="Mái hiên chùa cổ rêu phủ kính dột sương Huế mộng mơ"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#3F332C]/15" />
          <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur shadow p-4 rounded-2xl text-xs">
            <p className="font-serif italic font-semibold text-text-charcoal pr-4">"Huế thanh tĩnh sâu lắng dưới màn mưa bụi, nét mộc mạc ấy nằm ẩn trong những bọc trà mộc thơm giăng tà sen hồ Tịnh Tâm..."</p>
          </div>
        </div>

        {/* Text Right Details */}
        <div className="space-y-6 font-sans">
          <div className="flex items-center space-x-2">
            <Landmark className="w-5 h-5 text-brand-purple shrink-0" />
            <h3 className="font-serif font-semibold text-lg md:text-xl text-text-charcoal">
              Sứ mệnh dệt lạt tre nâng niu nón lá xứ Thơ
            </h3>
          </div>

          <div className="space-y-4 text-xs text-text-charcoal/85 leading-relaxed font-light">
            <p>
              Đối với người lữ khách ghé thăm cố đô, Huế luôn hiện rõ dưới bóng dừa lòa xòa, dưới tà áo tím dập dìu qua làn sương mịt cồn Hến, hay hương kẹo mứt nồng cay râm ran góc bếp lò than ngày đông sụt sùi mưa dột. Nhưng làm sao gói gắm những thi vị của gió sông Hương ấy vác bọc trong vali mang theo về thềm nhà thị thành náo nhiệt?
            </p>
            
            <p>
              Huegifts ra đời chính là chiếc rương gỗ mộc mạc nâng bước lữ hành ấy. Từ những chiếc nón bài thơ bài trí quạt, những hũ phấn nụ hoa nhài cổ truyền cung đình, cho tới bông sen hồ Tịnh sấy mộc thăng hoa dột sương, mỗi món quà đều do nghệ nhân cố cựu chính tay nặn nung gốm và đan lạt phơi khô che liếp.
            </p>

            <blockquote className="border-l-2 border-brand-gold pl-4 py-1 italic bg-[#FAF9F5] rounded-r-lg font-serif text-[#5C452F]">
              “Chúng tôi không kinh doanh đại trà công nghiệp. Chúng tôi đi góp nhặt mảnh hồng ký ức lịch sử xưa của Huế rồi đơm lạt giấy gửi đi.”
            </blockquote>

            <p>
              Bằng việc sắm bọc từng món quà lưu niệm tại Huegifts, bạn không chỉ rước duyên nét cổ mộc mạc lãng mạng về hiên gỗ nhà, mà còn đóng góp trực tiếp dưỡng nuôi nguồn tài lực giúp 4 làng nghề thêu dệt nón tre cổ xứ Huế giữ gìn ngọn lửa nung lò dột sương lộng lẫy hằng thế kỷ.
            </p>
          </div>
        </div>

      </div>

      {/* 4 CORE CULTURE VALUES BRAND PILLARS */}
      <section className="bg-[#FAF8F5] border border-zinc-200 p-8 md:p-12 rounded-3xl my-16 font-sans space-y-8">
        
        <h3 className="text-center font-serif text-xl font-semibold text-text-charcoal tracking-tight">
          Bốn dòng tinh hoa Huế gìn giữ trong lòng thương hiệu
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-150 space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-purple-light text-brand-purple flex items-center justify-center font-serif font-bold text-xs">
              01
            </div>
            <h4 className="font-serif font-semibold text-sm text-text-charcoal">Cung đình tế vi</h4>
            <p className="text-xs text-text-muted leading-relaxed font-light font-sans">
              Chiết lọc nét đoan trang cổ kính, phấn nụ nhài trắng, trà tim sen ngự tuyển tỉ mỉ mực ngòi cung vua xưa.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-150 space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-gold-light text-brand-gold flex items-center justify-center font-serif font-bold text-xs">
              02
            </div>
            <h4 className="font-serif font-semibold text-sm text-text-charcoal">Mộc mạc tà tre</h4>
            <p className="text-xs text-text-muted leading-relaxed font-light font-sans">
              Nón gồi tre đan mỏng lướt râm, quạt giấy trầm thơm, thanh gỗ khía tạc kẽ mộc mạc hoài sương.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-150 space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center font-serif font-bold text-xs">
              03
            </div>
            <h4 className="font-serif font-semibold text-sm text-text-charcoal">Dòng Hương dạt dào</h4>
            <p className="text-xs text-text-muted leading-relaxed font-light font-sans">
              Nét vẽ màu sáp sơn mài, tà postcard mộng mỏng lướt đi tiếng vọng lãng đãng của sương chiều sông Hương.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-150 space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-serif font-bold text-xs">
              04
            </div>
            <h4 className="font-serif font-semibold text-sm text-text-charcoal">Vị ngon ngào ngạt</h4>
            <p className="text-xs text-text-muted leading-relaxed font-light font-sans">
              Bánh in rồng, mè xửng mật mía vàng lóng lánh tơi xốp rôm rả hương mè chài vị cay ấm nồng nàn cố đô.
            </p>
          </div>
        </div>

      </section>

      {/* Artisans team sections */}
      <section className="text-center py-6 space-y-4">
        <h4 className="font-serif text-lg font-semibold text-text-charcoal">Sát cánh dạo chơi cùng mâm quà Huế</h4>
        <button
          onClick={() => navigateTo('shop')}
          className="bg-brand-purple hover:bg-[#54344E] text-white py-3 px-8 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors shadow"
          id="about-to-shop-btn"
        >
          Ghé dạo coi cửa hàng quà Huế
        </button>
      </section>

    </div>
  );
};
