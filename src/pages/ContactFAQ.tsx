import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle, ChevronDown, HelpCircle, MessageSquare, Landmark, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FAQS } from '../data/faqs';
import { Breadcrumb } from '../components/Breadcrumb';

export const ContactFAQ: React.FC = () => {
  const { addToast } = useApp();

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active FAQ accordion state
  const [activeFaqIdx, setActiveFaqIdx] = useState<number | null>(0);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.message.trim()) {
      addToast("Vui lòng điền họ tên, email, số điện thoại và dòng thông điệp thưa gửi. ❀", "info");
      return;
    }

    if (formData.message.trim().length > 5000) {
      addToast("Dòng thông điệp quá dài (tối đa 5000 ký tự). ❀", "info");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        addToast(data.message || "Gửi thư thành công! Huegifts đã nhận được thông điệp từ lữ hữu. ❀", "success");
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        addToast(data.error || "Gửi thư thất bại. Vui lòng liên hệ trực tiếp bưu cục. ❀", "error");
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
      addToast("Không thể kết nối bưu cục gửi thư đi. Xin vui lòng kiểm tra lại mạng hoặc gọi hotline. ❀", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (idx: number) => {
    setActiveFaqIdx(activeFaqIdx === idx ? null : idx);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-16 font-sans">
      
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Liên hệ & Hỏi đáp FAQs' }]} />

      <div className="border-b border-zinc-200 pb-4 mb-10">
        <h2 className="text-3xl font-serif font-semibold text-text-charcoal tracking-tight">
          Liên hệ & Hỏi đáp cố đô
        </h2>
        <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-xl font-light">
          Gửi thư tín liên lạc trực tiếp tới bưu cục trà gốm Huegifts, hoặc đọc nhanh các thắc mắc thông dụng của bạn hữu muôn phương khi rước bưu gói.
        </p>
      </div>

      {/* TWO COLUMN GRID ROW: FORM VS INFO SHEETS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
        
        {/* L.Col: Contacts Information Cards (Col 5/12) */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <div className="bg-brand-purple-light/20 border border-brand-purple/10 p-6 rounded-2xl space-y-5">
            <h3 className="font-serif font-semibold text-lg text-text-charcoal flex items-center gap-2">
              <Landmark className="w-5 h-5 text-brand-purple shrink-0" />
              <span>Bưu cục gốc Huegifts</span>
            </h3>

            <p className="text-xs text-text-muted leading-relaxed font-light font-sans">
              Chúng tôi luôn khói lửa sấy trà mộc thêu gồi lá sen mở rộng hiên nhà gỗ chào đón bạn ghé thưởng trà đan nón bài thơ:
            </p>

            <div className="space-y-4 pt-3 text-xs text-text-charcoal font-sans">
              <div className="flex items-start space-x-3.5">
                <MapPin className="w-4 h-4 text-brand-purple mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-text-charcoal">Địa mốc nhà bưu cục:</p>
                  <p className="font-light text-text-muted leading-relaxed mt-0.5">67 Phan Đình Phùng, Thành Phố Huế</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <Phone className="w-4 h-4 text-brand-purple mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-text-charcoal">Đường dây nóng liên hệ:</p>
                  <p className="font-light text-text-muted leading-relaxed mt-0.5">0977047908 (Zalo thủ công trà sen)</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <Mail className="w-4 h-4 text-brand-purple mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-text-charcoal">Địa bạ hòm thư tín:</p>
                  <p className="font-light text-text-muted leading-relaxed mt-0.5">nvanhue069@gmail.com (Hồi đáp trong tàn 1 buổi nhang gỗ)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sincere message */}
          <div className="bg-[#FAF7F2] border border-dashed border-zinc-300 p-5 rounded-2xl text-xs text-text-muted italic leading-relaxed font-serif font-light text-[#5C4D44] text-center">
            "Có những dòng thương chỉ nhen nhóm qua bức thiệp tay viết nến mờ sương. Chúng tôi sẵn lòng ghi giùm bạn dấn sớ lời chúc thương gửi tận ngõ, chẳng mất thêm đồng xu lạt nào."
          </div>
        </div>

        {/* R.Col: Interactive feed form (Col 7/12) */}
        <div className="lg:col-span-12 xl:col-span-7 bg-white border border-zinc-200 p-6 md:p-8 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase text-brand-purple tracking-widest flex items-center gap-1.5 border-b border-zinc-100 pb-3">
            <MessageSquare className="w-4 h-4 text-brand-purple shrink-0" />
            <span>Gửi câu thơ, lời thưa liên lạc</span>
          </h3>

          <form onSubmit={handleContactSubmit} className="space-y-4 font-sans text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase font-bold tracking-wider text-text-charcoal block mb-1">Danh tính của lữ hữu *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lê Hoài Phương"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-purple focus:outline-none focus:bg-white text-text-charcoal"
                  id="contact-name"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold tracking-wider text-text-charcoal block mb-1">Địa mốc email nhận hồi đáp *</label>
                <input
                  type="email"
                  required
                  placeholder="hoaiphuong@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-purple focus:outline-none focus:bg-white text-text-charcoal"
                  id="contact-email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase font-bold tracking-wider text-text-charcoal block mb-1">Số điện thoại liên lạc *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0977047908"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-purple focus:outline-none focus:bg-white text-text-charcoal"
                  id="contact-phone"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold tracking-wider text-text-charcoal block mb-1">Chủ sự thông điệp</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tư vấn bọc quà hoặc đặt nón..."
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-purple focus:outline-none focus:bg-white text-text-charcoal"
                  id="contact-subject"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase font-bold tracking-wider text-text-charcoal block mb-1">Lời thưa gửi mộc mạc bộc lộ *</label>
              <textarea
                rows={4}
                required
                placeholder="Huegifts ơi, mình muốn gửi tặng túi tote cùng bánh măng in cho cơ quan hữu nghị dịp Tết sắp tới, xin tư vấn bọc thùng..."
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-purple focus:outline-none focus:bg-white text-text-charcoal font-sans font-light leading-relaxed"
                id="contact-message"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-purple hover:bg-[#54344E] text-white py-2.5 px-6 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer shadow flex items-center space-x-1.5 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              id="contact-form-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                  <span>Đang gửi thông tín...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Gửi thông tín tới bưu cục</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* INTERACTIVE FAQ ACCORDIONS SHIRT LIST */}
      <section className="border-t border-zinc-200 pt-12">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
          <HelpCircle className="w-10 h-10 text-brand-gold mx-auto shrink-0 bg-brand-gold-light/40 p-2 rounded-full" />
          <h3 className="font-serif font-semibold text-text-charcoal text-xl leading-none">
            Những băn khoăn tế vi bạn lữ thường vấn
          </h3>
          <p className="text-xs text-text-muted leading-relaxed font-light font-sans max-w-md mx-auto">
            Huegifts dột sương hồi đáp sẵn 6 câu thắc thỏm bấy lâu nay khi quý khách thỉnh mua sản vật mộc mạc:
          </p>
        </div>

        <div className="max-w-3xl mx-auto border border-zinc-200 rounded-2xl overflow-hidden bg-white divide-y divide-zinc-100">
          {FAQS.map((f, idx) => (
            <div key={idx} className="font-sans">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left p-4 md:p-5 flex justify-between items-center hover:bg-[#FDFCF9] transition-colors cursor-pointer text-xs md:text-sm text-text-charcoal font-semibold gap-4"
                id={`faq-btn-${idx}`}
              >
                <span>❀ {f.question}</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${activeFaqIdx === idx ? 'rotate-180 text-brand-purple' : ''}`} />
              </button>
              
              {activeFaqIdx === idx && (
                <div className="p-4 md:p-5 text-xs text-text-muted bg-[#FAF9F5] leading-relaxed font-light border-t border-zinc-100 font-sans whitespace-pre-line">
                  {f.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
