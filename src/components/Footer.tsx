import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { navigateTo, addToast } = useApp();
  const [emailInput, setEmailInput] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    
    addToast("Cảm ơn bạn đã đăng ký! Huegifts sẽ gửi lá thư văn hóa đầu tiên tới hòm thư của bạn sớm thôi nhé.", 'success');
    setEmailInput('');
  };

  const footerLinksLeft = [
    { label: 'Trang chủ', id: 'home' },
    { label: 'Cửa hàng quà Huế', id: 'shop' },
    { label: 'Câu chuyện cố đô', id: 'stories' },
    { label: 'Bộ sưu tập độc quyền', id: 'collections' },
    { label: 'Về chúng tôi', id: 'about' },
  ];

  const footerLinksRight = [
    { label: 'Chính sách bảo mật', action: () => addToast("Chính sách bảo mật mô phỏng đã được áp dụng.", "info") },
    { label: 'Chính sách vận chuyển', action: () => addToast("Miễn phí ship tiêu chuẩn từ 500.000 ₫.", "info") },
    { label: 'Hướng dẫn đổi trả', action: () => addToast("Đổi trả miễn phí 7 ngày nếu ly gốm, tranh vỡ nứt trong lúc vận chuyển.", "info") },
    { label: 'Liên hệ hợp tác quà tặng', action: () => navigateTo('contact') },
    { label: 'Câu hỏi thường gặp FAQ', action: () => navigateTo('contact') },
  ];

  return (
    <footer className="bg-[#1C1715] text-amber-50/90 font-sans border-t border-amber-900/10 pt-16 pb-8" id="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP ROW: LOGO, LINKS, NEWSLETTER */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Introduction */}
          <div>
            <div className="flex items-center space-x-2.5 mb-5 select-none text-[#E8DCC4]">
              <div className="relative w-8 h-8 flex items-center justify-center border border-[#E8DCC4]/30 rounded bg-white/5">
                <div className="absolute inset-0.5 border border-dashed border-brand-gold/50 rounded-xs flex items-center justify-center">
                  <span className="font-serif font-bold text-xs text-brand-gold leading-none">
                    Huế
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-base text-[#E8DCC4] tracking-widest leading-none">
                  HUEGIFTS
                </span>
                <span className="text-[8px] text-brand-gold uppercase tracking-widest font-sans font-bold mt-0.5 leading-none">
                  Tinh hoa bọc quà
                </span>
              </div>
            </div>
            <p className="text-sm text-amber-100/60 leading-relaxed mb-6 font-light">
              “Mang một miền thương về nhà”
              <br />
              Huegifts không chỉ cung cấp những món quà lưu niệm mộc mạc thủ công, mà là nơi gìn giữ, kể lại những mảnh ký ức ngọt ngào, đậm đà bản sắc Văn hóa Cố Đô.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-3.5">
              <button onClick={() => addToast("Chuyển hướng Facebook Huegifts ", "info")} className="p-2 rounded-full bg-white/5 hover:bg-brand-purple hover:text-white transition-colors cursor-pointer text-amber-50" title="Facebook">
                <Facebook className="w-4 h-4" />
              </button>
              <button onClick={() => addToast("Chuyển hướng Instagram Huegifts", "info")} className="p-2 rounded-full bg-white/5 hover:bg-brand-purple hover:text-white transition-colors cursor-pointer text-amber-50" title="Instagram">
                <Instagram className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Menu */}
          <div>
            <h4 className="font-serif font-semibold text-sm text-[#E8DCC4] uppercase tracking-wider mb-5">
              Khám Phá Huế
            </h4>
            <ul className="space-y-3 text-sm text-amber-100/65 font-light">
              {footerLinksLeft.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => navigateTo(link.id)}
                    className="hover:text-brand-gold hover:underline transition-all cursor-pointer text-left"
                  >
                    ❀ {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Support Guidelines */}
          <div>
            <h4 className="font-serif font-semibold text-sm text-[#E8DCC4] uppercase tracking-wider mb-5">
              Hỗ Trợ Khách Hàng
            </h4>
            <ul className="space-y-3 text-sm text-amber-100/65 font-light">
              {footerLinksRight.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={link.action}
                    className="hover:text-brand-gold hover:underline transition-all cursor-pointer text-left"
                  >
                    • {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h4 className="font-serif font-semibold text-sm text-[#E8DCC4] uppercase tracking-wider mb-4">
              Nhận Thư Từ Huế
            </h4>
            <p className="text-sm text-amber-100/60 leading-relaxed mb-4 font-light">
              Đăng ký để đón đọc những câu chuyện văn hóa trầm ấm xứ Cố đô và độc bản ưu đãi sớm nhất từ Huegifts gửi tặng.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative flex">
                <input
                  type="email"
                  placeholder="Hòm thư của bạn..."
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="bg-white/10 text-white rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-gold border-0 focus:outline-none w-full placeholder-amber-50/30 text-amber-55"
                  id="newsletter-email-input"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-gold hover:bg-brand-gold/90 text-[#1C1715] font-semibold text-sm py-2 px-4 rounded-lg tracking-wider uppercase transition-colors cursor-pointer"
                id="newsletter-submit-btn"
              >
                Gửi lòng thương nhớ
              </button>
            </form>
          </div>

        </div>

        {/* MIDDLE ROW: CONTACT INFOS */}
        <div className="border-t border-white/10 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-amber-100/70 font-light">
          <div className="flex items-start space-x-2.5">
            <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#E8DCC4]"> Cửa hàng tọa lạc </p>
              <p className="text-xs leading-relaxed">67 Phan Đình Phùng, Thành Phố Huế</p>
            </div>
          </div>
          <div className="flex items-start space-x-2.5">
            <Phone className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#E8DCC4]">Đàm thoại thưa gửi</p>
              <p className="text-xs leading-relaxed">Hotline: 0977047908</p>
            </div>
          </div>
          <div className="flex items-start space-x-2.5">
            <Mail className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#E8DCC4]">Hòm thư trao đi</p>
              <p className="text-xs leading-relaxed">Email: nvanhue069@gmail.com</p>
            </div>
          </div>
          <div className="flex items-start space-x-2.5">
            <Clock className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#E8DCC4]">Giờ mở cửa thảnh thơi</p>
              <p className="text-xs leading-relaxed">08:00 - 21:00 hàng ngày kể cả lễ Tết</p>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: COPYRIGHT */}
        <div className="border-t border-white/5 pt-8 text-center text-xs text-amber-100/40 font-light flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex flex-col sm:flex-row items-center gap-2">
            <span>© 2026 Huegifts — Mang một miền thương về nhà.</span>
            <span className="hidden sm:inline">|</span>
            <button 
              onClick={() => navigateTo('admin-login')} 
              className="hover:text-brand-gold hover:underline transition-colors cursor-pointer text-amber-100/30 text-[10px] font-mono whitespace-nowrap"
            >
              [Cài đặt & Quản trị]
            </button>
          </p>
          <p className="flex items-center gap-1">
            Chế tác bằng trọn tình yêu Huế <Heart className="w-3 h-3 fill-brand-purple text-brand-purple animate-pulse" />
          </p>
        </div>

      </div>
    </footer>
  );
};
