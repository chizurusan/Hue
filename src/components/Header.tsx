import React, { useState } from 'react';
import { Menu, X, Heart, ShoppingBag, User, Search, MapPin, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { page, cart, wishlist, user, products, navigateTo } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const totalCartItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalWishlistItems = wishlist.length;

  const menuItems = [
    { label: 'Trang chủ', id: 'home' },
    { label: 'Cửa hàng', id: 'shop' },
    { label: 'Câu chuyện Huế', id: 'stories' },
    { label: 'Bộ sưu tập', id: 'collections' },
    { label: 'Về chúng tôi', id: 'about' },
    { label: 'Liên hệ & FAQ', id: 'contact' },
  ];

  const handleMenuClick = (targetId: string) => {
    navigateTo(targetId);
    setMobileMenuOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(q.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 5);
    setSearchResults(filtered);
  };

  const handleSearchResultClick = (slug: string) => {
    navigateTo('product', { slug });
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('shop');
      // Pass query in state or simple localStorage trigger
      localStorage.setItem('huegifts_search_query_trigger', searchQuery.trim());
      setSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full" id="site-header">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-brand-purple text-brand-gold-light text-center py-1.5 px-4 text-[11px] font-medium tracking-wider flex items-center justify-center gap-2">
        <span>Gói ghém một chút dịu dàng của Huế - Miễn phí vận chuyển khi mua từ 500.000 ₫</span>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <div className="bg-white/95 backdrop-blur-md border-b border-zinc-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 md:h-16 flex items-center justify-between">
          
          {/* Logo & Hamburg Button (Left/Center) */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-zinc-100 rounded-lg text-text-charcoal cursor-pointer"
              id="mobile-menu-hamburger"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Title Brand Logo */}
            <div
              onClick={() => navigateTo('home')}
              className="hover:opacity-90 cursor-pointer flex items-center space-x-2 p-1 group"
              id="brand-logo"
            >
              <div className="relative w-8 h-8 md:w-9 md:h-9 flex items-center justify-center border border-brand-purple/40 rounded bg-[#FAF9F5]/90 transition-transform group-hover:scale-105">
                <div className="absolute inset-0.5 border border-dashed border-brand-gold/60 rounded-xs flex items-center justify-center">
                  <span className="font-serif font-bold text-xs md:text-sm text-brand-purple leading-none select-none">
                    Huế
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-sm md:text-lg text-brand-purple tracking-widest leading-none">
                  HUEGIFTS
                </span>
                <span className="text-[7.5px] md:text-[8.5px] text-brand-gold uppercase tracking-widest font-sans font-bold mt-0.5 leading-none">
                  Quà tặng Cố đô
                </span>
              </div>
            </div>
          </div>

          {/* Navigates Menu (Desktop Center) */}
          <nav className="hidden lg:flex items-center space-x-8 font-sans">
            {menuItems.map((item) => {
              const isActive = page === item.id || (item.id === 'stories' && page === 'story') || (item.id === 'collections' && page === 'collection');
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`text-xs uppercase font-medium tracking-wider hover:text-brand-purple transition-smooth cursor-pointer relative py-2 ${
                    isActive ? 'text-brand-purple font-semibold' : 'text-text-charcoal/80'
                  }`}
                  id={`nav-link-${item.id}`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-brand-purple rounded" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Hub Icons (Right) */}
          <div className="flex items-center space-x-1.5 md:space-x-3 text-text-charcoal">
            
            {/* Search toggler */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-1.5 rounded-full cursor-pointer transition-colors ${searchOpen ? 'bg-brand-purple-light text-brand-purple' : 'hover:bg-zinc-100'}`}
                id="search-toggle-btn"
                aria-label="Tìm kiếm sản phẩm"
              >
                <Search className="w-4 h-4 md:w-5 h-5 shrink-0" />
              </button>

              {/* Overlay Interactive Search Dropdown */}
              {searchOpen && (
                <div className="absolute right-0 mt-3 bg-white border border-zinc-200 shadow-xl rounded-xl w-64 md:w-80 p-4 z-50">
                  <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Tìm nón lá, trà sen, lụa tím..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-1.5 pl-3 pr-8 text-xs focus:ring-1 focus:ring-brand-purple focus:outline-none focus:bg-white text-text-charcoal"
                      id="header-search-input"
                      autoFocus
                    />
                    <button type="submit" className="absolute right-2 text-text-muted hover:text-brand-purple" id="header-search-submit-btn">
                      <Search className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </form>

                  {/* Immediate suggestion list */}
                  {searchResults.length > 0 && (
                    <div className="mt-3 border-t border-zinc-100 pt-2 space-y-2 max-h-48 overflow-y-auto">
                      <p className="text-[11px] text-text-muted font-bold tracking-wider uppercase mb-1">Gợi ý từ Huegifts:</p>
                      {searchResults.map(p => (
                        <div
                          key={p.id}
                          onClick={() => handleSearchResultClick(p.slug)}
                          className="flex items-center space-x-2.5 p-1 rounded hover:bg-brand-gold-light/40 cursor-pointer"
                        >
                          <img src={p.images[0]} alt={p.name} referrerPolicy="no-referrer" className="w-8 h-8 rounded object-cover shrink-0" />
                          <div className="overflow-hidden">
                            <h5 className="text-xs font-medium text-text-charcoal truncate">{p.name}</h5>
                            <span className="text-[11px] text-brand-purple font-semibold">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchQuery && searchResults.length === 0 && (
                    <div className="mt-3 border-t border-zinc-100 pt-3 text-center">
                      <p className="text-xs text-text-muted">Không tìm thấy "{{searchQuery}}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Hearts */}
            <button
              onClick={() => navigateTo('wishlist')}
              className={`p-1.5 rounded-full cursor-pointer hover:bg-zinc-100 transition-colors relative ${page === 'wishlist' ? 'text-brand-purple' : ''}`}
              id="wishlist-header-btn"
              aria-label="Danh sách yêu thích"
            >
              <Heart className="w-4 h-4 md:w-5 h-5 shrink-0" />
              {totalWishlistItems > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {totalWishlistItems}
                </span>
              )}
            </button>

            {/* Shopping Bags */}
            <button
              onClick={() => navigateTo('cart')}
              className={`p-1.5 rounded-full cursor-pointer hover:bg-zinc-100 transition-colors relative ${page === 'cart' ? 'text-brand-purple' : ''}`}
              id="cart-header-btn"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="w-4 h-4 md:w-5 h-5 shrink-0" />
              {totalCartItems > 0 && (
                <span className="absolute top-0 right-0 bg-brand-purple text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* User Profiles */}
            <button
              onClick={() => navigateTo('profile')}
              className={`p-1.5 rounded-full cursor-pointer hover:bg-zinc-100 transition-colors relative ${page === 'profile' ? 'text-brand-purple bg-brand-purple-light' : ''}`}
              id="account-header-btn"
              aria-label="Tài khoản cá nhân"
            >
              <User className="w-4 h-4 md:w-5 h-5 shrink-0" />
              {user && (
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-brand-green rounded-full ring-2 ring-white" />
              )}
            </button>

          </div>
        </div>
      </div>

      {/* 3. MOBILE MENU BAR OVERLAY */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-zinc-200 shadow-xl transition-all z-40 max-h-[85vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-between ${
                  page === item.id ? 'bg-brand-purple/5 text-brand-purple' : 'text-text-charcoal hover:bg-zinc-50'
                }`}
                id={`mobile-nav-link-${item.id}`}
              >
                <span>{item.label}</span>
                <span className="text-[10px] text-zinc-400">❀</span>
              </button>
            ))}

            {user && (
              <div className="pt-4 border-t border-zinc-100 mt-4 flex items-center space-x-3 px-3">
                <div className="w-8 h-8 rounded-full bg-brand-purple/10 flex items-center justify-center text-xs text-brand-purple font-serif font-black">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-charcoal">{user.name}</p>
                  <p className="text-[10px] text-text-muted">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
