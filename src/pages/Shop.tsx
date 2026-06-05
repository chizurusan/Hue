import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Trash2, ArrowUpDown, Filter, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumb } from '../components/Breadcrumb';

export const Shop: React.FC = () => {
  const { products, navigateTo, addToast } = useApp();

  // State filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('all');
  const [easyToCarryOnly, setEasyToCarryOnly] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all'); // 'all', 'isNew', 'isBestSeller', 'onSale', 'inStock'
  const [sortBy, setSortBy] = useState<string>('featured'); // 'featured', 'newest', 'priceAsc', 'priceDesc', 'bestSeller'
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Cross-page event trigger handshakes
  useEffect(() => {
    // 1. Home page Category bubble clicks
    const homeCatTrigger = localStorage.getItem('huegifts_active_category_trigger');
    if (homeCatTrigger) {
      setSelectedCategory(homeCatTrigger);
      localStorage.removeItem('huegifts_active_category_trigger');
    }

    // 2. Header Search clicks
    const headerSearchTrigger = localStorage.getItem('huegifts_search_query_trigger');
    if (headerSearchTrigger) {
      setSearchTerm(headerSearchTrigger);
      localStorage.removeItem('huegifts_search_query_trigger');
    }
  }, []);

  // Filter & Sort math calculation
  const filteredProducts = products.filter(p => {
    // 1. Text Search query
    const matchSearch = !searchTerm.trim() || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Category
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;

    // 3. Price Ranges
    let matchPrice = true;
    if (selectedPriceRange === 'under-200') {
      matchPrice = p.price < 200000;
    } else if (selectedPriceRange === '200-500') {
      matchPrice = p.price >= 200000 && p.price <= 500000;
    } else if (selectedPriceRange === 'over-500') {
      matchPrice = p.price > 500000;
    }

    // 4. Recipient suite
    const matchRecipient = selectedRecipient === 'all' || p.suitability === selectedRecipient;

    // 5. Easy to Carry check
    const matchEasyCarry = !easyToCarryOnly || p.easyToCarry === true;

    // 6. Sub filter statuses
    let matchStatus = true;
    if (filterStatus === 'isNew') {
      matchStatus = !!p.isNew;
    } else if (filterStatus === 'isBestSeller') {
      matchStatus = !!p.isBestSeller;
    } else if (filterStatus === 'onSale') {
      matchStatus = !!p.originalPrice && p.originalPrice > p.price;
    } else if (filterStatus === 'inStock') {
      matchStatus = p.stock > 0;
    }

    return matchSearch && matchCategory && matchPrice && matchRecipient && matchEasyCarry && matchStatus;
  }).sort((a, b) => {
    // 7. Sắp xếp
    if (sortBy === 'newest') {
      // simulate priority ID or isNew
      return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    }
    if (sortBy === 'priceAsc') {
      return a.price - b.price;
    }
    if (sortBy === 'priceDesc') {
      return b.price - a.price;
    }
    if (sortBy === 'bestSeller') {
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    }
    // 'featured' standard sorting
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setSelectedRecipient('all');
    setEasyToCarryOnly(false);
    setFilterStatus('all');
    setSortBy('featured');
    addToast("Đã thiết lập lại toàn bộ bộ lọc sản phẩm.", "info");
  };

  const categoriesList = [
    { label: "Tất cả sản vật", key: "all" },
    { label: "Đặc sản ẩm thực", key: "dac-san" },
    { label: "Thủ công mỹ nghệ", key: "thu-cong" },
    { label: "Quà tặng văn hóa", key: "qua-tang-van-hoa" },
    { label: "Postcard & Tập viết", key: "van-phong-pham" },
    { label: "Quà tết & Doanh nghiệp", key: "qua-tang-theo-dip" }
  ];

  const priceRangesList = [
    { label: "Mọi giá tiền", key: "all" },
    { label: "Dưới 200.000 ₫", key: "under-200" },
    { label: "Từ 200.000 ₫ đến 500.000 ₫", key: "200-500" },
    { label: "Trên 500.000 ₫", key: "over-500" }
  ];

  const recipientList = [
    { label: "Dành cho mọi người", key: "all" },
    { label: "Bạn bè thương yêu", key: "ban-be" },
    { label: "Gia đình đầm ấm", key: "gia-dinh" },
    { label: "Đồng nghiệp thân thiết", key: "dong-nghiep" },
    { label: "Doanh nghiệp & Đối tác", key: "doanh-nghiep" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-16 font-sans">
      
      {/* 1. BREADCRUMBS & HEADER TITLE */}
      <Breadcrumb items={[{ label: 'Cửa hàng quà Huế' }]} />

      <div className="border-b border-zinc-200 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-text-charcoal tracking-tight">
            Cửa hàng quà Huế
          </h2>
          <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-xl font-light">
            Nơi trưng bày những tác vật nhỏ bé kết tinh từ đôi bàn tay hiền hậu, chắt chiu hương gió dòng Hương giang gửi tặng khách ghé chơi cố đô.
          </p>
        </div>

        {/* Free delivery badge inline */}
        <div className="bg-brand-gold-light p-3.5 rounded-xl flex items-center space-x-2.5 border border-brand-gold/20 self-start">
          <span className="text-brand-purple text-sm leading-none select-none">❀</span>
          <span className="text-[11px] text-[#5C452F] font-semibold leading-relaxed">
            Hỗ trợ ghi thiệp tay chúc mừng hoàn toàn miễn phí tại thanh toán!
          </span>
        </div>
      </div>

      {/* 2. LIVE DESK FILTERS AND GRID STRUCTURE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR FOR DESKTOP FILTERS */}
        <div className="hidden lg:block space-y-7">
          
          {/* A. Search filter */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-charcoal mb-3 flex items-center gap-1.5 border-b border-zinc-200/50 pb-2">
              <Search className="w-3.5 h-3.5" />
              <span>Tìm sản vật</span>
            </h4>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập tên bưu phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 pl-8 text-xs focus:ring-1 focus:ring-brand-purple focus:outline-none text-text-charcoal focus:bg-zinc-50"
                id="shop-sidebar-search"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* B. Category lists */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-charcoal mb-3 flex items-center gap-1.5 border-b border-zinc-200/50 pb-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Danh mục sản vật</span>
            </h4>
            <div className="space-y-1">
              {categoriesList.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`w-full text-left py-1.5 px-2.5 rounded text-xs font-medium tracking-tight transition-all cursor-pointer ${
                    selectedCategory === cat.key
                      ? 'bg-brand-purple text-white font-semibold'
                      : 'text-text-charcoal/80 hover:bg-zinc-150 hover:text-brand-purple'
                  }`}
                  id={`filter-cat-${cat.key}`}
                >
                  • {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* C. Price level range filter */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-charcoal mb-3 flex items-center gap-1.5 border-b border-zinc-200/50 pb-2">
              <span>Mức ngân sách</span>
            </h4>
            <div className="space-y-1">
              {priceRangesList.map(range => (
                <button
                  key={range.key}
                  onClick={() => setSelectedPriceRange(range.key)}
                  className={`w-full text-left py-1.5 px-2.5 rounded text-xs font-medium tracking-tight transition-all cursor-pointer ${
                    selectedPriceRange === range.key
                      ? 'bg-brand-purple text-white font-semibold'
                      : 'text-text-charcoal/80 hover:bg-zinc-150 hover:text-brand-purple'
                  }`}
                  id={`filter-price-${range.key}`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* D. Gift Recipient Filter */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-charcoal mb-3 flex items-center gap-1.5 border-b border-zinc-200/50 pb-2">
              <span>Đối tượng thụ nhận</span>
            </h4>
            <div className="space-y-1">
              {recipientList.map(rec => (
                <button
                  key={rec.key}
                  onClick={() => setSelectedRecipient(rec.key)}
                  className={`w-full text-left py-1.5 px-2.5 rounded text-xs font-medium tracking-tight transition-all cursor-pointer ${
                    selectedRecipient === rec.key
                      ? 'bg-brand-purple text-white font-semibold'
                      : 'text-text-charcoal/80 hover:bg-zinc-150 hover:text-brand-purple'
                  }`}
                  id={`filter-rec-${rec.key}`}
                >
                  {rec.label}
                </button>
              ))}
            </div>
          </div>

          {/* E. Checkboxes filter special details */}
          <div className="space-y-3.5 bg-brand-gold-light/40 p-4 rounded-xl border border-brand-gold/15">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#5C452F] mb-1">
              Tính chất bưu phẩm
            </h4>

            {/* Checkbox: Quà dễ mang đi */}
            <label className="flex items-center space-x-2.5 text-xs text-text-charcoal cursor-pointer select-none">
              <input
                type="checkbox"
                checked={easyToCarryOnly}
                onChange={() => setEasyToCarryOnly(!easyToCarryOnly)}
                className="rounded border-zinc-300 text-brand-purple focus:ring-brand-purple w-4 h-4 cursor-pointer"
                id="checkbox-easy-carry"
              />
              <span className="font-medium">Quà dễ xếp xếp hành lý</span>
            </label>

            <p className="text-[10px] text-text-muted leading-tight leading-relaxed font-light">
              Móc lọc danh sách các mặt hàng gọn gàng mỏng nhẹ thích hợp hành lý mang đi xa qua đường bay.
            </p>
          </div>

          {/* F. Trash cleaner clear filter */}
          <button
            onClick={clearAllFilters}
            className="w-full py-2 border border-brand-purple hover:bg-brand-purple hover:text-white text-brand-purple text-xs font-semibold rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
            id="clear-filters-sidebar-btn"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa bỏ bộ lọc</span>
          </button>
        </div>

        {/* PRODUCTS AREA (MAIN CONTAINER) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* MOBILES QUICK FILTERS BUTTONS */}
          <div className="block lg:hidden flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="bg-brand-purple text-white py-2 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer shadow"
              id="mobile-filters-trigger"
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0" />
              <span>Sàng lọc & Tìm kiếm</span>
            </button>
            {(selectedCategory !== 'all' || selectedPriceRange !== 'all' || selectedRecipient !== 'all' || easyToCarryOnly || searchTerm || filterStatus !== 'all') && (
              <button
                onClick={clearAllFilters}
                className="border border-red-500 text-red-500 hover:bg-red-50 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer flex items-center space-x-1"
                id="mobile-clear-filters-direct"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa hết lọc</span>
              </button>
            )}
          </div>

          {/* MOBILES FILTER ACCORDION OVERLAYS */}
          {showMobileFilters && (
            <div className="lg:hidden p-4 bg-white rounded-xl border border-zinc-250 shadow-md space-y-4">
              {/* Keyword Mobile */}
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal mb-1 block">Tìm kiếm</label>
                <input
                  type="text"
                  placeholder="Xoay nón, bánh, lụa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-brand-purple focus:outline-none"
                  id="mobile-search-input-field"
                />
              </div>

              {/* Categorize Mobile */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal mb-1 block font-sans">Danh mục</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-zinc-200 bg-white rounded text-xs py-1.5 px-2"
                    id="mobile-category-dropdown"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal mb-1 block font-sans">Giá tiền</label>
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                    className="w-full border border-zinc-200 bg-white rounded text-xs py-1.5 px-2"
                    id="mobile-price-dropdown"
                  >
                    {priceRangesList.map(range => (
                      <option key={range.key} value={range.key}>{range.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal mb-1 block font-sans">Bưu phẩm dành cho</label>
                  <select
                    value={selectedRecipient}
                    onChange={(e) => setSelectedRecipient(e.target.value)}
                    className="w-full border border-zinc-200 bg-white rounded text-xs py-1.5 px-2"
                    id="mobile-recipient-dropdown"
                  >
                    {recipientList.map(rec => (
                      <option key={rec.key} value={rec.key}>{rec.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-text-charcoal mb-1 block font-sans">Loại lọc phụ</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full border border-zinc-200 bg-white rounded text-xs py-1.5 px-2"
                    id="mobile-status-dropdown"
                  >
                    <option value="all">Tất cả tình trạng</option>
                    <option value="isNew">Sản phẩm mới</option>
                    <option value="isBestSeller">Bán chạy nhất</option>
                    <option value="onSale">Đang khuyến mãi</option>
                    <option value="inStock">Còn hàng sẵn</option>
                  </select>
                </div>
              </div>

              {/* Special toggling carry */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={easyToCarryOnly}
                  onChange={() => setEasyToCarryOnly(!easyToCarryOnly)}
                  className="rounded border-zinc-300 text-brand-purple focus:ring-brand-purple w-4 h-4"
                  id="mobile-easy-carry-checkbox"
                />
                <span className="text-xs text-text-charcoal font-medium">Bưu phẩm gọn nhẹ khi xếp vali du lịch</span>
              </div>

              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-brand-purple text-white py-2 rounded text-xs font-bold tracking-wider uppercase cursor-pointer"
                id="mobile-apply-filters-btn"
              >
                Áp dụng bộ lọc
              </button>
            </div>
          )}

          {/* GRID CONTROL TOP (SORT AND QUANTITY COUNTERS) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200/50 gap-4">
            <p className="text-xs text-text-muted font-sans font-light">
              Hiển thị <span className="font-semibold text-brand-purple">{filteredProducts.length}</span> món quà xinh đẹp trứ danh cố đô
            </p>

            <div className="flex items-center space-x-3 text-xs self-start sm:self-auto">
              
              {/* Status selectors desktop pills */}
              <div className="hidden md:flex items-center bg-[#ECEAEC] p-0.5 rounded-lg border border-zinc-200/50">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 text-xs rounded-md cursor-pointer ${filterStatus === 'all' ? 'bg-white text-brand-purple font-semibold shadow-xs' : 'text-text-muted/85 hover:text-brand-purple'}`}
                  id="tab-all-status"
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilterStatus('isNew')}
                  className={`px-3 py-1 text-xs rounded-md cursor-pointer ${filterStatus === 'isNew' ? 'bg-white text-brand-purple font-semibold shadow-xs' : 'text-text-muted/85 hover:text-brand-purple'}`}
                  id="tab-new-status"
                >
                  Mới
                </button>
                <button
                  onClick={() => setFilterStatus('isBestSeller')}
                  className={`px-3 py-1 text-xs rounded-md cursor-pointer ${filterStatus === 'isBestSeller' ? 'bg-white text-brand-purple font-semibold shadow-xs' : 'text-text-muted/85 hover:text-brand-purple'}`}
                  id="tab-bestseller-status"
                >
                  Bán chạy
                </button>
                <button
                  onClick={() => setFilterStatus('onSale')}
                  className={`px-3 py-1 text-xs rounded-md cursor-pointer ${filterStatus === 'onSale' ? 'bg-white text-brand-purple font-semibold shadow-xs' : 'text-text-muted/85 hover:text-brand-purple'}`}
                  id="tab-discount-status"
                >
                  Khuyến mãi
                </button>
              </div>

              {/* Grid sort */}
              <div className="flex items-center space-x-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="text-text-muted shrink-0 text-[11px]">Sắp theo:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-zinc-200 rounded px-2.5 py-1 text-xs text-text-charcoal focus:ring-1 focus:ring-brand-purple focus:outline-none"
                  id="shop-sort-dropdown"
                >
                  <option value="featured">Phổ biến tiêu biểu</option>
                  <option value="newest">Sản danh nổi lên</option>
                  <option value="priceAsc">Giá rẻ dần lên</option>
                  <option value="priceDesc">Giá cao hạ dần</option>
                  <option value="bestSeller">Xếp theo mến chuộng</option>
                </select>
              </div>

            </div>
          </div>

          {/* MAIN PRODUCT GRID */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            /* EMPTY FILTERED STATE */
            <div className="bg-[#FAF7F2] border border-dashed border-zinc-300 rounded-3xl p-16 text-center font-sans">
              <AlertCircle className="w-12 h-12 text-[#B88A55] mx-auto mb-4 shrink-0 animate-pulse" />
              <h3 className="font-serif font-semibold text-lg text-text-charcoal mb-1">
                Không tìm thấy món quà thích hợp
              </h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed font-light mb-6">
                Chưa tìm thấy bưu vật Huế nào khớp với cài đặt lọc hiện tại của bạn. Vui lòng nới lỏng từ khóa hoặc xóa lọc đi coi lại từ đầu dào dạt nhé.
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-brand-purple hover:bg-brand-purple/95 text-white text-xs font-semibold uppercase tracking-wider px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
                id="empty-clear-all-btn"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
