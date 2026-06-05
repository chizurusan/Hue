import React, { useState } from 'react';
import { User, LogIn, Key, Mail, Phone, MapPin, Box, Landmark, Eye, LogOut, CheckCircle, Save, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumb } from '../components/Breadcrumb';

export const Account: React.FC = () => {
  const { user, login, logout, updateUserProfile, orders, recentlyViewed, navigateTo, addToast } = useApp();

  // Auth local states
  const [isRegister, setIsRegister] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');

  // Profile edit states
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editProvince, setEditProvince] = useState(user?.province || 'Thừa Thiên Huế');
  const [editDistrict, setEditDistrict] = useState(user?.district || 'Thành phố Huế');
  const [editWard, setEditWard] = useState(user?.ward || '');
  const [editAddress, setEditAddress] = useState(user?.addressDetail || '');

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      addToast("Vui lòng nhập tên lữ hữu.", "info");
      return;
    }
    // Perform simulated login
    const mockupUser = {
      name: userName,
      email: userEmail || `${userName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      phone: userPhone || '0977047908',
      province: 'Thừa Thiên Huế',
      district: 'Thành phố Huế',
      ward: 'Vỹ Dạ',
      addressDetail: 'Vọng Cảnh gỗ xưa'
    };
    login(mockupUser);
    
    // Populate EDIT fields too
    setEditName(mockupUser.name);
    setEditPhone(mockupUser.phone);
    setEditEmail(mockupUser.email);
    setEditWard(mockupUser.ward);
    setEditAddress(mockupUser.addressDetail);
  };

  const handleQuickDemoLogin = () => {
    const backupDemo = {
      name: "Tôn Nữ Hạo Nhiên",
      email: "tonnu.haonhien@hue.vn",
      phone: "0905111222",
      province: "Thừa Thiên Huế",
      district: "Thành phố Huế",
      ward: "Vỹ Dạ",
      addressDetail: "12 Vỹ Dạ Trăng Vỹ"
    };
    login(backupDemo);
    
    // prefill states edit fields
    setEditName(backupDemo.name);
    setEditPhone(backupDemo.phone);
    setEditEmail(backupDemo.email);
    setEditWard(backupDemo.ward);
    setEditAddress(backupDemo.addressDetail);
    
    addToast("Chào đón Tôn Nữ ghé thăm bạ sách gỗ!", "success");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      addToast("Tên người nhận không được để cá trống.", "error");
      return;
    }
    updateUserProfile({
      name: editName,
      phone: editPhone,
      email: editEmail,
      province: editProvince,
      district: editDistrict,
      ward: editWard,
      addressDetail: editAddress
    });
    addToast("Đã lưu bạ thông tin sổ vận chuyển thành công!", "success");
  };

  // Recently viewed items list
  const recentProductsList = PRODUCTS.filter(p => recentlyViewed.includes(p.id));

  // User's order list
  const userOrders = orders; // simulated all orders placed in this browser belong together

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-16 font-sans">
      
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Tài khoản lữ khách' }]} />

      {/* GATE 1: IF NOT AUTHORIZED */}
      {!user ? (
        <section className="max-w-md mx-auto my-12 bg-white border border-zinc-200 rounded-3xl p-8 shadow-md font-sans space-y-6">
          <div className="text-center space-y-2">
            <User className="w-12 h-12 text-[#B88A55] mx-auto mb-1 shrink-0 bg-brand-gold-light/50 p-2.5 rounded-full" />
            <h2 className="text-2xl font-serif font-semibold text-text-charcoal tracking-tight">Ký danh bạ lưu niệm</h2>
            <p className="text-xs text-text-muted leading-relaxed font-light font-sans max-w-xs mx-auto">
              Đăng ký bạ để lưu danh các món quà Huế ưa chuộng, đặt hàng nhanh hơn không dột tốn công gõ lại địa mục.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal block mb-1">Họ tên lữ chủ *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lê Đăng Khoa"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 pl-9 text-xs focus:ring-1 focus:ring-brand-purple focus:bg-white focus:outline-none"
                  id="auth-name-field"
                />
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal block mb-1">Số điện thoại liên hệ (Để giao bưu tá)</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Ví dụ: 0977047908"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 pl-9 text-xs focus:ring-1 focus:ring-brand-purple focus:bg-white focus:outline-none"
                  id="auth-phone-field"
                />
                <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal block mb-1">Hòm thư điện tử Email (Không ép) *</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="guithongdiep.hue@gmail.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 pl-9 text-xs focus:ring-1 focus:ring-brand-purple focus:bg-white focus:outline-none"
                  id="auth-email-field"
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-purple hover:bg-brand-purple/95 text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-center cursor-pointer transition-colors flex items-center justify-center space-x-1.5 shadow"
              id="auth-login-submit-btn"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span>Ghi danh thềm gỗ</span>
            </button>
          </form>

          {/* Quick interactive demologin action shortcut */}
          <div className="border-t border-zinc-150 pt-4 text-center space-y-3">
            <p className="text-[10px] text-text-muted font-sans font-light">
              Hoặc dùng nhanh tài khoản lữ hữu danh vọng soạn sẵn của Huegifts để thử nghiệm tức khắc:
            </p>
            <button
              onClick={handleQuickDemoLogin}
              className="bg-brand-gold-light hover:bg-brand-gold-light/95 border border-brand-gold/15 text-[#5C452F] py-2 px-4 rounded-lg text-[11px] font-sans font-bold flex items-center space-x-1.5 mx-auto cursor-pointer"
              id="auth-quick-demologin"
            >
              <Star className="w-3.5 h-3.5 text-brand-gold fill-current" />
              <span>Đăng nhập demo "Tôn Nữ Hạo Nhiên"</span>
            </button>
          </div>

        </section>
      ) : (
        
        /* GATE 2: USER PROFILE INTERFACES */
        <div className="space-y-12">
          
          {/* Header profiles */}
          <div className="border-b border-zinc-300 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-serif font-semibold text-text-charcoal leading-none">
                Xin chào hữu lữ, <span className="text-brand-purple italic">{user.name}</span>
              </h2>
              <p className="text-xs text-text-muted mt-1 leading-relaxed font-light">
                Ghé thăm bạ gỗ nhà vườn Huế. Thảnh thơi điều chỉnh thông tin gửi bưu hoặc ngắm lại dấu chân hành tinh xưa.
              </p>
            </div>

            <button
              onClick={logout}
              className="border border-red-500 hover:bg-red-50 text-red-500 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer self-start md:self-auto"
              id="logout-main-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đóng bọc đăng xuất</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* 1. EDIT DEFAULT DISPATCH ADDRESS DETAILS (R.Col 7/12) */}
            <div className="lg:col-span-7 bg-white border border-zinc-200 p-6 rounded-2xl shadow-xs space-y-5">
              <h3 className="text-xs font-bold uppercase text-brand-purple tracking-widest flex items-center gap-1.5 border-b border-zinc-100 pb-3">
                <MapPin className="w-4 h-4 text-brand-purple shrink-0" />
                <span>Sổ địa bạ nhận bưu phẩm mặc định</span>
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal mb-1 block">Tên người thưa nhận</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-purple focus:bg-white focus:outline-none"
                      id="profile-name-field"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal mb-1 block">Số điện thoại liên lạc</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-purple focus:bg-white focus:outline-none"
                      id="profile-phone-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal mb-1 block">Địa chỉ hòm thư Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-purple focus:bg-white focus:outline-none"
                    id="profile-email-field"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal mb-1 block">Tỉnh thành</label>
                    <input
                      type="text"
                      value={editProvince}
                      onChange={(e) => setEditProvince(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-text-muted focus:outline-none cursor-not-allowed bg-zinc-150"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal mb-1 block">Quận / Huyện</label>
                    <input
                      type="text"
                      value={editDistrict}
                      onChange={(e) => setEditDistrict(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-text-charcoal focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal mb-1 block">Phường / Xã</label>
                    <input
                      type="text"
                      value={editWard}
                      placeholder="Ví dụ: Vỹ Dạ"
                      onChange={(e) => setEditWard(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-brand-purple focus:bg-white focus:outline-none"
                      id="profile-ward-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal mb-1 block">Địa số nhà, Số ngõ cụ thể</label>
                  <input
                    type="text"
                    value={editAddress}
                    placeholder="Ví dụ: Ngách 4/12 kiệt thôn Vỹ Dạ"
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-purple focus:bg-white focus:outline-none"
                    id="profile-addressdetail-field"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-brand-purple hover:bg-brand-purple/95 text-white py-2 px-6 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  id="profile-save-submit-btn"
                >
                  <Save className="w-4 h-4 shrink-0" />
                  <span>Cập nhật sổ bảo bạ</span>
                </button>
              </form>
            </div>

            {/* 2. PLACED ORDERS TIMELINE DRAWER FOR USER RECORD (R.Col 5/12) */}
            <div className="lg:col-span-12 xl:col-span-5 bg-white border border-zinc-250 p-6 rounded-2xl shadow-sm space-y-5 font-sans">
              <h3 className="text-xs font-bold uppercase text-brand-purple tracking-widest flex items-center gap-1.5 border-b border-zinc-100 pb-3">
                <Box className="w-4 h-4 text-brand-purple shrink-0" />
                <span>Bẹp ghi biên bạ đã gởi kính</span>
              </h3>

              {userOrders.length > 0 ? (
                <div className="space-y-4">
                  {userOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-[#FAF8F5] border border-zinc-150 p-4 rounded-xl space-y-3 font-sans"
                      id={`order-log-${ord.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-text-charcoal bg-white border px-2 py-0.5 rounded shadow-xs">{ord.id}</span>
                        <span className="text-[10px] text-brand-gold font-semibold uppercase tracking-wider">
                          ❀ {ord.status === 'confirmed' ? 'Mộc sấy măng chuẩn bị' : 'Đang di chuyển'}
                        </span>
                      </div>

                      <div className="text-[11px] text-text-muted space-y-1">
                        <p>• Ngày gởi: {new Date(ord.createdAt).toLocaleDateString('vi-VN')}</p>
                        <p>• Trị giá sớ quà: <span className="font-semibold text-[#6E4B67]">{formatPrice(ord.total)}</span></p>
                        <p className="truncate">• Gửi ngỏ: {ord.addressDetail}, {ord.ward}</p>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 flex gap-2">
                        <button
                          onClick={() => {
                            localStorage.setItem('huegifts_track_order_prefetch', JSON.stringify({ id: ord.id, phone: ord.phone }));
                            navigateTo('track-order');
                          }}
                          className="bg-brand-purple hover:bg-[#54344E] text-white py-1 px-3 rounded text-[10px] font-semibold cursor-pointer whitespace-nowrap uppercase tracking-wider"
                          id={`track-order-log-${ord.id}`}
                        >
                          Theo hành trình bưu
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 font-sans bg-zinc-50 rounded-xl">
                  <Box className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-50 shrink-0" />
                  <p className="text-xs text-text-muted font-light">Chưa có lịch sử ký dột hóa đơn bọc quà nào.</p>
                </div>
              )}
            </div>

          </div>

          {/* 3. RECENTLY VIEWED SHELF PRODUCTS */}
          {recentProductsList.length > 0 && (
            <section className="border-t border-zinc-200 pt-10">
              <h3 className="font-serif font-medium text-lg text-text-charcoal tracking-tight mb-6 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-brand-purple shrink-0 animate-pulse" />
                <span>Những món quà Huế hữu lữ mới ghé ngó qua</span>
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {recentProductsList.slice(0, 4).map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}

    </div>
  );
};
