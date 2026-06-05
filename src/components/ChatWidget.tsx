import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User } from 'lucide-react';

interface Msg {
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Msg[]>([
    {
      sender: 'bot',
      text: "Dạ Huegifts xin chào ạ! Con người xứ Huế hiền hòa đón tiếp bạn. Bạn cần tư vấn đặc sản bánh mứt, trà sen Hồ Tịnh Tâm hay quà thêu tay truyền thống làm quà tặng người thương ạ?",
      time: "Vừa xong"
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    const userMsg: Msg = { sender: 'user', text: userText, time };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Trigger simulation reply
    setTimeout(() => {
      let botText = "Dạ, em ghi nhận câu nói của anh chị ạ. Shop tụi em luôn đóng gói chỉn chu, viết thiệp tay miễn phí để mang trọn một miền thương Huế về nhà.";

      const lower = userText.toLowerCase();
      if (lower.includes('trà') || lower.includes('tra') || lower.includes('sen')) {
        botText = "Dạ, trà sen bách diệp hồ Tịnh Tâm của Huegifts là loại tiến vua thượng hạng đó ạ! Trà được ướp thơm lựng nồng ấm chắt chiu từ sương sớm hoàng cung xứ Huế cổ rêu phong, thích hợp biếu tặng các trưởng bối hoặc cấp trên ạ.";
      } else if (lower.includes('khăn') || lower.includes('khan') || lower.includes('lụa') || lower.includes('lua') || lower.includes('tím')) {
        botText = "Dạ, chiếc Khăn Lụa Tơ Tằm Tím Kinh Kỳ dệt tay 100% tơ tằm nguyên bản cực mát da chính là tuyệt phẩm bán chạy của Huegifts, mang sắc tím lãng mạn trứ danh tà áo dài dòng sông Hương thơ mộng ạ.";
      } else if (lower.includes('nón') || lower.includes('non') || lower.includes('bài thơ')) {
        botText = "Dạ chiếc nón bài thơ thủ công Dạ Lê do nghệ nhân vót tre đan mỏng lách giấy rất khéo. Soi dưới ánh nắng sẽ nổi lên hình ảnh cầu Trường Tiền cổ kính và câu thơ duyên thầm, là quà lưu niệm thanh tao nhất đấy ạ.";
      } else if (lower.includes('ship') || lower.includes('phí') || lower.includes('giao hàng') || lower.includes('gui')) {
        botText = "Dạ bên em ship hàng toàn quốc nhanh chóng ạ. Với hóa đơn trên 500.000 ₫ bên em hoàn toàn miễn phí vận chuyển tiêu chuẩn. Tại Huế bên em có hỗ trợ giao hỏa tốc trong ngày để quý khách kịp xếp vào hành lý du lịch ạ.";
      } else if (lower.includes('gói') || lower.includes('goi qua') || lower.includes('thiệp') || lower.includes('thiep')) {
        botText = "Dạ đúng rồi ạ! Tại trang đặt hàng, anh chị chỉ cần tick chọn 'Gói quà giúp bạn' và ghi lời nhắn, tụi em sẽ dùng hộp mộc mạc thơm tùng bọc giấy, thắt lạt tre và viết thiệp tay gửi người thương không đính giá tiền ạ.";
      } else if (lower.includes('địa chỉ') || lower.includes('cua hang') || lower.includes('ở đâu')) {
        botText = "Dạ cửa hàng mẫu Huegifts nằm bình yên tại 67 Phan Đình Phùng, Thành Phố Huế ạ. Rất mong được đón tiếp anh chị gõ cửa uống một tách chén trà ấm lướt sen ạ.";
      }

      setMessages(prev => [...prev, {
        sender: 'bot',
        text: botText,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 font-sans pointer-events-auto">
      {isOpen ? (
        <div className="w-80 md:w-96 h-[450px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200/50">
          {/* Header */}
          <div className="bg-brand-purple p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-brand-gold-light/20 flex items-center justify-center text-brand-gold font-bold font-serif">
                H
              </div>
              <div>
                <h4 className="text-sm font-semibold">Tư vấn Huegifts</h4>
                <p className="text-[10px] text-brand-gold-light/80">● Đang trực tuyến dột sương</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
              id="close-chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50 scrollbar-thin">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-brand-purple text-white rounded-br-none'
                      : 'bg-white border border-gray-100 text-text-charcoal rounded-bl-none shadow-sm'
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-white/70' : 'text-text-muted/70'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Hỏi Huegifts điều gì..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple focus:bg-white text-text-charcoal"
              id="chat-input"
            />
            <button
              type="submit"
              className="bg-brand-purple hover:bg-brand-purple/90 text-white p-2 rounded-lg transition-colors cursor-pointer"
              id="send-chat-btn"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-brand-purple hover:bg-brand-purple/95 text-white p-4 rounded-full shadow-xl flex items-center justify-center cursor-pointer transform hover:scale-105 active:scale-95 transition-all group"
          id="open-chat-btn"
          aria-label="Mở tư vấn trực tuyến"
        >
          <MessageCircle className="w-6 h-6 shrink-0 transition-transform group-hover:rotate-12" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 text-xs font-medium tracking-tight whitespace-nowrap">
            Hỏi chuyện Huế
          </span>
        </button>
      )}
    </div>
  );
};
