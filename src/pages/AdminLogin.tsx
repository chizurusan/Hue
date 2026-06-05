import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { KeyRound, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { adminToken, adminLogin, navigateTo, addToast } = useApp();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, bypass login
  useEffect(() => {
    if (adminToken) {
      navigateTo('admin-dashboard');
    }
  }, [adminToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast("Vui lòng nhập Email người vận hành hệ thống.", "error");
      return;
    }

    setLoading(true);
    const success = await adminLogin(email.trim());
    setLoading(false);

    if (success) {
      navigateTo('admin-dashboard');
    }
  };

  const handleGoogleLoginMock = async () => {
    // Elegant, highly-detailed custom interactive popup flow for Google Login simulation
    const demoAdminEmail = "nvanhue069@gmail.com";
    setEmail(demoAdminEmail);
    addToast("Bắt đầu đăng nhập bằng tài khoản Google...", "info");
    
    setLoading(true);
    // Simulate delay for social auth handshake
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const success = await adminLogin(demoAdminEmail);
    setLoading(false);

    if (success) {
      navigateTo('admin-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#120F0E] flex flex-col items-center justify-center px-4 relative overflow-hidden font-sans">
      
      {/* Background Decorative traditional motifs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-purple/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-brand-gold-light/5 blur-[150px] pointer-events-none" />

      {/* Floating back button to return to standard consumer storefront */}
      <button 
        onClick={() => navigateTo('home')}
        className="absolute top-6 left-6 text-zinc-400 hover:text-white transition-colors flex items-center space-x-1.5 text-xs uppercase tracking-wider cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Trở lại cửa hàng</span>
      </button>

      {/* Primary login frame container */}
      <div className="w-full max-w-md bg-[#1C1715] border border-white/5 rounded-2xl shadow-2xl p-8 relative z-10">
        
        {/* Core Royal imperial seal aesthetic */}
        <div className="text-center mb-8 space-y-3">
          <div className="w-14 h-14 bg-brand-purple/10 border border-brand-purple/30 text-brand-purple rounded-full flex items-center justify-center mx-auto shadow-inner text-lg font-serif">
            ❀
          </div>
          <h2 className="text-xl md:text-2xl font-serif text-amber-50 tracking-wide font-medium">
            HUEGIFTS CRM
          </h2>
          <p className="text-[11px] text-zinc-400 font-light tracking-wide max-w-[280px] mx-auto leading-relaxed">
            Hệ thống Cổng thông tin & Trực thuộc Ban Quản lý Đơn hàng, Quà tặng di sản Cố đô Huế.
          </p>
        </div>

        {/* Dynamic warning banner mapping the ADMIN email requirement */}
        <div className="mb-6 p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start space-x-3 text-left">
          <ShieldAlert className="w-4 h-4 text-[#B88A55] shrink-0 mt-0.5" />
          <div className="text-[10.5px] text-zinc-300 leading-relaxed font-light">
            <span className="font-semibold text-white">Xác thực đặc quyền:</span> Chỉ những hòm thư khớp cấu hình <code className="bg-white/5 px-1 py-0.5 rounded text-amber-300 font-mono text-[9px]">ADMIN_EMAIL</code> mới có thể đăng cơ bệ hạ cố đô.
          </div>
        </div>

        {/* Input credentials segment */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-400 tracking-wider uppercase block font-medium">Hòm thư Admin</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nvanhue069@gmail.com"
                className="w-full bg-[#120F0E] border border-white/10 rounded-xl px-4 py-3 pl-10 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand-purple/60 transition-colors font-sans"
              />
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 shrink-0" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6E4B67] hover:bg-[#54344E] disabled:bg-[#402035] text-white text-xs uppercase font-semibold tracking-wider py-3.5 rounded-xl transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-lg mt-6"
            id="admin-form-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Đang kết nối thư viện...</span>
              </>
            ) : (
              <span>Đăng nhập hệ thống</span>
            )}
          </button>
        </form>

        {/* Social auth alternative trigger */}
        <div className="mt-6 pt-6 border-t border-white/5">
          <button
            type="button"
            onClick={handleGoogleLoginMock}
            disabled={loading}
            className="w-full bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center space-x-2.5 border border-white/10 cursor-pointer"
            id="admin-google-mock-btn"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.14-5.138 4.14A5.92 5.92 0 0 1 8 12.632a5.92 5.92 0 0 1 5.99-5.91c1.556 0 2.975.584 4.053 1.543l3.054-3.054A9.9 9.9 0 0 0 13.99 2 9.92 9.92 0 0 0 4 11.916a9.92 9.92 0 0 0 9.99 9.916c5.568 0 10.01-4.04 10.01-9.916 0-.67-.06-1.32-.178-1.954H12.24Z"
              />
            </svg>
            <span>Tiếp tục bằng tài khoản Google</span>
          </button>
        </div>

      </div>

      {/* Imperial Seal Logo Credits */}
      <div className="mt-8 text-[10px] text-zinc-500 tracking-wider">
        © HUEGIFTS — KIÊN TRÌ DI SẢN CỐ ĐÔ HUẾ
      </div>

    </div>
  );
};
