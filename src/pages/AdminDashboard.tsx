import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShoppingBag, 
  PackageOpen, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Trash2, 
  Plus, 
  Edit3, 
  LogOut, 
  CheckCircle, 
  Truck, 
  Inbox, 
  Eye, 
  X, 
  Calendar,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Search
} from 'lucide-react';
import { Product, Order } from '../types';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  unreadContacts: number;
  revenue: number;
  vnpaySuccess?: number;
}

export const AdminDashboard: React.FC = () => {
  const { adminToken, adminLogout, products, fetchProducts, navigateTo, addToast } = useApp();
  
  // Tab states: 'dashboard' | 'products' | 'orders' | 'contacts'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'contacts'>('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    unreadContacts: 0,
    revenue: 0,
    vnpaySuccess: 0,
  });

  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [contactsList, setContactsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Search/Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Modals / Editor States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Product Form State
  const [productForm, setProductForm] = useState<Partial<Product>>({
    id: '',
    slug: '',
    name: '',
    category: 'thu-cong',
    categoryName: 'Thủ công mỹ nghệ',
    shortDescription: '',
    fullDescription: '',
    story: '',
    price: 0,
    originalPrice: undefined,
    images: ['https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=650&q=80'],
    rating: 5.0,
    reviewCount: 0,
    stock: 20,
    tags: [],
    materialsOrIngredients: '',
    careInstructions: '',
    suitability: 'ban-be',
    easyToCarry: true
  });

  // Verify access or fetch database metrics initializers
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrdersList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/admin/contacts', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContactsList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const refreshAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchProducts(),
      fetchStats(),
      fetchOrders(),
      fetchContacts()
    ]);
    setLoading(false);
  };

  // Run on load and whenever tab switch happens
  useEffect(() => {
    if (!adminToken) {
      navigateTo('admin-login');
      return;
    }
    refreshAllData();
  }, [adminToken, activeTab]);

  // Order status transition functions
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        addToast(`Đã thay đổi trạng thái bưu thiếp đơn ${orderId} thành công!`, 'success');
        fetchOrders();
        fetchStats();
        // Update currently shown order card details
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
        }
      } else {
        addToast('Lỗi thay đổi trạng thái đơn bọc.', 'error');
      }
    } catch (e) {
      addToast('Không thể tương tác bưu cục.', 'error');
    }
  };

  // Contacts toggling action resolver
  const handleToggleContactRead = async (contactId: string, currentRead: boolean) => {
    try {
      const res = await fetch(`/api/admin/contacts/${contactId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ read: !currentRead })
      });
      if (res.ok) {
        addToast(!currentRead ? 'Đã đánh dấu xử lý bức thư.' : 'Đặt thư thỉnh cầu về chưa đọc.', 'info');
        fetchContacts();
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!window.confirm("Lữ hữu quản trị có thực tâm muốn xóa vĩnh viễn bức tâm tư này của lữ khách?")) return;
    try {
      const res = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (res.ok) {
        addToast('Xóa bức thơ liên hệ thành công.', 'success');
        fetchContacts();
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Products CRUD operations
  const handleOpenProductEdit = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({ ...prod });
    setShowProductModal(true);
  };

  const handleOpenProductAdd = () => {
    setEditingProduct(null);
    setProductForm({
      id: '',
      slug: '',
      name: '',
      category: 'thu-cong',
      categoryName: 'Thủ công mỹ nghệ',
      shortDescription: '',
      fullDescription: '',
      story: '',
      price: 0,
      originalPrice: undefined,
      images: ['https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=650&q=80'],
      rating: 5.0,
      reviewCount: 0,
      stock: 20,
      tags: [],
      materialsOrIngredients: '',
      careInstructions: '',
      suitability: 'ban-be',
      easyToCarry: true
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.slug || !productForm.price) {
      addToast("Vui lòng hoàn thành đầy đủ thông tin Tên, Slug, Giá tiền.", "error");
      return;
    }

    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const endpoint = editingProduct 
        ? `/api/admin/products/${editingProduct.id}` 
        : '/api/admin/products';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(productForm)
      });

      if (res.ok) {
        addToast(editingProduct ? "Đã sửa món quà thành công!" : "Đã bổ sung quà tặng cố đô!", "success");
        setShowProductModal(false);
        refreshAllData();
      } else {
        const errorData = await res.json();
        addToast(errorData.error || "Gặp lỗi lưu sản phẩm.", "error");
      }
    } catch (e) {
      addToast("Không gởi lưu được bưu tin sản phẩm.", "error");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Bệ hạ có quyết từ gạt xóa món quà lưu niệm Huế này khỏi kho bày biện không? Hành động này dỡ bỏ sản phẩm vĩnh viễn.")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (res.ok) {
        addToast("Món quà đã được dỡ bày và xóa hẳn khói kho.", "info");
        refreshAllData();
      }
    } catch (e) {
      addToast("Không thể dỡ bỏ sản phẩm.", "error");
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="min-h-screen bg-[#0F0D0C] text-zinc-100 flex font-sans">
      
      {/* 1. LEFT UTILITY DASHBOARD NAVIGATION RAIL */}
      <aside className="w-64 bg-[#14100E] border-r border-white/5 flex flex-col justify-between shrink-0">
        <div>
          
          <div className="p-6 border-b border-white/5 flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#6E4B67]/20 border border-[#6E4B67]/40 rounded-full flex items-center justify-center text-brand-purple font-serif text-lg">
              ❀
            </div>
            <div>
              <h3 className="font-serif text-amber-50 text-sm font-semibold tracking-wider">HUEGIFTS CRM</h3>
              <p className="text-[9px] text-[#B88A55] tracking-widest font-mono uppercase mt-0.5">Quản lý cố đô</p>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-brand-purple/15 text-brand-purple-light border border-brand-purple/30'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>Tổng quan cố đô</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'products'
                  ? 'bg-brand-purple/15 text-brand-purple-light border border-brand-purple/30'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Kho quà lưu niệm</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'orders'
                  ? 'bg-brand-purple/15 text-brand-purple-light border border-brand-purple/30'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <PackageOpen className="w-4 h-4 shrink-0" />
              <span>Vận đơn bưu toán</span>
              {stats.pendingOrders > 0 && (
                <span className="ml-auto bg-[#B88A55] text-[#14100E] px-2 py-0.5 text-[8px] font-bold rounded-full font-sans">
                  {stats.pendingOrders}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('contacts')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'contacts'
                  ? 'bg-brand-purple/15 text-brand-purple-light border border-brand-purple/30'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Bưu tâm khảm sư (CRM)</span>
              {stats.unreadContacts > 0 && (
                <span className="ml-auto bg-brand-purple text-white px-2 py-0.5 text-[8px] font-bold rounded-full font-sans">
                  {stats.unreadContacts}
                </span>
              )}
            </button>
          </nav>

        </div>

        {/* Sidebar Footer Log out segment */}
        <div className="p-4 border-t border-white/5 space-y-3 bg-[#110E0C]">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center font-mono text-xs font-bold uppercase">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-zinc-300 font-bold leading-none truncate">Quản trị viên Huegifts</p>
              <span className="text-[8px] text-zinc-500 font-mono block mt-1 truncate">nvanhue069@gmail.com</span>
            </div>
          </div>
          
          <button 
            onClick={adminLogout}
            className="w-full bg-white/5 hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center space-x-2 py-2 p-1 border border-white/5 rounded-lg text-[10px] uppercase font-bold tracking-wider cursor-pointer text-zinc-400 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Kết thúc phiên</span>
          </button>
        </div>
      </aside>

      {/* 2. RIGHT WORKSPACE VIEWPORT LAYER */}
      <main className="flex-grow flex flex-col min-w-0">
        
        {/* Top Navbar Header */}
        <header className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-[#14100E]">
          <div>
            <span className="text-[10px] text-brand-purple-light uppercase tracking-widest font-bold">Hệ thống đồng đẳng quản trị</span>
            <h2 className="text-lg font-serif font-medium text-amber-50 mt-1 uppercase tracking-wide">
              {activeTab === 'dashboard' && "Khung Cố Đô Thống Kê"}
              {activeTab === 'products' && "Kho Sản Vật & Bày Trí Quà"}
              {activeTab === 'orders' && "Hóa Đơn & Chuyển Phát Bưu Trình"}
              {activeTab === 'contacts' && "Quản Lý Thư Tín Và Tâm Tư Bưu Cục"}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={refreshAllData}
              disabled={loading}
              className="bg-white/5 hover:bg-white/10 text-xs px-3 py-2 rounded-lg border border-white/10 flex items-center space-x-1.5 transition-colors cursor-pointer text-zinc-300"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="font-medium">Nạp mới số liệu</span>
            </button>

            <span className="text-[10px] text-zinc-500 font-mono tracking-wider bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
              HÔM NAY: 01.06.2026
            </span>
          </div>
        </header>

        {/* Scrollable container view */}
        <section className="flex-grow overflow-y-auto p-8 bg-[#0F0D0C] space-y-8">
          
          {/* TAB 1: DASHBOARD METRICS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Aggregates widgets grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                
                <div className="bg-[#14100E] border border-white/5 p-6 rounded-2xl flex items-center space-x-4 shadow-lg pr-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-[#B88A55] flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">Lưu niệm bày bán</span>
                    <h4 className="text-2xl font-serif text-amber-50 mt-1">{stats.totalProducts} món</h4>
                  </div>
                </div>

                <div className="bg-[#14100E] border border-white/5 p-6 rounded-2xl flex items-center space-x-4 shadow-lg pr-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center">
                    <PackageOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">Tổng vận lưu niên</span>
                    <h4 className="text-2xl font-serif text-amber-50 mt-1">{stats.totalOrders} đơn</h4>
                  </div>
                </div>

                <div className="bg-[#14100E] border border-white/5 p-6 rounded-2xl flex items-center space-x-4 shadow-lg pr-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">Chờ phân lề nắn</span>
                    <h4 className="text-2xl font-serif text-amber-50 mt-1">{stats.pendingOrders} bưu</h4>
                  </div>
                </div>

                <div className="bg-[#14100E] border border-white/5 p-6 rounded-2xl flex items-center space-x-4 shadow-lg pr-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">Doanh thu xác nhận</span>
                    <h4 className="text-xl font-sans text-brand-purple-light font-bold mt-1 max-w-[140px] truncate">{formatPrice(stats.revenue)}</h4>
                  </div>
                </div>

                <div className="bg-[#14100E] border border-white/5 p-6 rounded-2xl flex items-center space-x-4 shadow-lg pr-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <span className="font-black text-[11px]">VNP</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">VNPay thành công</span>
                    <h4 className="text-2xl font-serif text-amber-50 mt-1">{stats.vnpaySuccess ?? 0} GD</h4>
                  </div>
                </div>

              </div>

              {/* CRM Messages alert card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left: Interactive Quick panel */}
                <div className="lg:col-span-2 bg-[#14100E] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
                  <h3 className="font-serif text-sm font-semibold text-amber-50 uppercase tracking-wide border-b border-white/5 pb-4">
                    Bưu vận mới nhận gần đây
                  </h3>

                  <div className="divide-y divide-white/5 space-y-3.5">
                    {ordersList.slice(0, 5).map((ord) => (
                      <div key={ord.id} className="flex items-center justify-between text-xs font-sans pt-3.5 first:pt-0">
                        <div className="space-y-1">
                          <p className="font-bold text-amber-50 flex items-center gap-1.5">
                            <span>#{ord.id}</span>
                            <span className="font-normal text-zinc-500 text-[10px] font-mono">({ord.customerName})</span>
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate max-w-sm">
                            {ord.items.map(i => `${i.name} (x${i.quantity})`).join(", ")}
                          </p>
                        </div>

                        <div className="text-right space-y-1.5 shrink-0 pl-4">
                          <p className="font-bold text-brand-purple">{formatPrice(ord.total)}</p>
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wide font-bold inline-block ${
                            ord.status === 'delivered' ? 'bg-brand-green/20 text-brand-green' :
                            ord.status === 'shipping' ? 'bg-[#B88A55]/20 text-[#B88A55]' :
                            ord.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            ord.status === 'pending_payment' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-brand-purple/20 text-brand-purple'
                          }`}>
                            {ord.status === 'pending_payment' ? "Chờ CK" :
                             ord.status === 'confirmed' ? "Đã duyệt" :
                             ord.status === 'packing' ? "Đóng gói" :
                             ord.status === 'shipping' ? "Đang ship" : "Hoàn tất"}
                          </span>
                        </div>
                      </div>
                    ))}

                    {ordersList.length === 0 && (
                      <div className="text-zinc-600 text-xs py-8 text-center font-light">
                        Chưa có đơn bưu chính nào nằm sổ bọc.
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Promo: Stats and notices */}
                <div className="bg-[#14100E] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-amber-50 uppercase tracking-wide border-b border-white/5 pb-4">
                      Tóm tắt Thư lữ bạn
                    </h3>
                    
                    <div className="mt-4 space-y-4 text-xs font-sans">
                      <div className="flex justify-between items-center text-zinc-400 pb-2 border-b border-white/5">
                        <span>Số thư mộc mạc lưu trữ:</span>
                        <span className="font-bold text-amber-50">{contactsList.length}</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-400 pb-2 border-b border-white/5">
                        <span>Bản tin thưa chưa hoàn đọc:</span>
                        <span className="font-bold text-brand-purple text-sm">{stats.unreadContacts} bức</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1C1715] border border-white/5 p-4 rounded-xl space-y-2">
                    <p className="text-[10px] text-zinc-400 font-light leading-relaxed">
                      Lữ hữu hãy kiểm tra thường nhật các dòng liên hệ biểu thị để xem lữ khách muôn phương gửi tặng lời động viên hay yêu cầu giải bày chi tiết. <span className="text-[#B88A55]">Trân quý!</span>
                    </p>
                    <button 
                      onClick={() => setActiveTab('contacts')}
                      className="text-[10px] text-brand-purple hover:underline flex items-center space-x-1 font-semibold block cursor-pointer transition-colors mt-2"
                    >
                      <span>Tới bưu thiếp hồi tín</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: PRODUCTS TABLE MANAGER */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              
              {/* Toolbar search actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#14100E] p-4 rounded-2xl border border-white/5 pr-4">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm món quà bằng tên, từ khóa..."
                    className="w-full bg-[#0F0D0C] border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-brand-purple transition-all"
                  />
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 shrink-0" />
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto self-stretch sm:self-center">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-[#0F0D0C] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-brand-purple shrink-0"
                  >
                    <option value="all">Tất cả chủng loại</option>
                    <option value="dac-san">Đặc sản Huế</option>
                    <option value="thu-cong">Thủ công mỹ nghệ</option>
                    <option value="văn phòng phẩm">Văn phòng phẩm</option>
                    <option value="qua-tang-van-hoa">Quà tặng văn hóa</option>
                  </select>

                  <button
                    onClick={handleOpenProductAdd}
                    className="ml-auto sm:ml-0 bg-[#6E4B67] hover:bg-[#54344E] text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
                    id="admin-add-product-btn"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Mới Món Quà</span>
                  </button>
                </div>
              </div>

              {/* Table rendering list */}
              <div className="bg-[#14100E] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#1C1715] text-zinc-400 font-semibold border-b border-white/5">
                        <th className="p-4">Hình ảnh</th>
                        <th className="p-4">Tên Quà / Mã Số</th>
                        <th className="p-4">Chủng loại</th>
                        <th className="p-4 text-right">Giá niên yết</th>
                        <th className="p-4 text-center">Số Kho</th>
                        <th className="p-4 text-center">Xử Sĩ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-[#14100E]">
                      {products
                        .filter(p => {
                          const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
                          const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
                          return matchesSearch && matchesCat;
                        })
                        .map((prod) => (
                          <tr key={prod.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 shrink-0">
                              <img src={prod.images[0]} alt={prod.name} className="w-12 h-12 rounded-lg object-cover border border-white/5" />
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-amber-50 max-w-xs truncate">{prod.name}</div>
                              <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">{prod.id} / /{prod.slug}</span>
                            </td>
                            <td className="p-4">
                              <span className="bg-[#1C1715] border border-white/10 px-2.5 py-1 rounded text-[10px] text-zinc-300">
                                {prod.categoryName || prod.category}
                              </span>
                            </td>
                            <td className="p-4 text-right font-bold text-[#b88a55]">
                              {formatPrice(prod.price)}
                              {prod.originalPrice && (
                                <span className="text-[9px] text-zinc-500 line-through block mt-0.5">{formatPrice(prod.originalPrice)}</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <span className={`font-mono text-xs px-2 py-0.5 rounded ${prod.stock <= 5 ? 'text-red-400 bg-red-400/10 font-bold' : 'text-zinc-300'}`}>
                                {prod.stock} chiếc
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleOpenProductEdit(prod)}
                                  className="p-1 px-2.5 bg-[#B88A55]/10 hover:bg-[#B88A55]/20 text-[#B88A55] rounded-md transition-colors text-[10px] tracking-wide uppercase font-bold cursor-pointer"
                                  title="Biên tập"
                                >
                                  Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="p-1 px-2 text-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition-all text-[10px] tracking-wide uppercase font-bold cursor-pointer"
                                  title="Xóa bỏ"
                                >
                                  Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ORDERS PROCESSOR SYSTEM */}
          {activeTab === 'orders' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Orders list selection */}
              <div className="lg:col-span-2 space-y-4">
                
                <div className="flex items-center justify-between bg-[#14100E] p-4 rounded-2xl border border-white/5 pr-4">
                  <span className="text-xs text-zinc-400 font-semibold">Tất cả biên vụ hóa bọc</span>
                  
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-[#0F0D0C] border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
                  >
                    <option value="all">Mọi trạng thái</option>
                    <option value="pending_payment">Chờ chuyển khoản</option>
                    <option value="confirmed">Đã duyệt / Xác nhận</option>
                    <option value="packing">Đang ráo đóng gói</option>
                    <option value="shipping">Biên bưu đang giao</option>
                    <option value="delivered">Đã giao tới thềm</option>
                    <option value="cancelled">Đã gạt hủy đơn</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {ordersList
                    .filter(o => orderStatusFilter === 'all' || o.status === orderStatusFilter)
                    .map((ord) => (
                      <div 
                        key={ord.id} 
                        onClick={() => setSelectedOrder(ord)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer text-xs font-sans ${
                          selectedOrder?.id === ord.id 
                            ? 'bg-[#1C1715] border-brand-purple/50 shadow-lg' 
                            : 'bg-[#14100E] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3.5">
                          <div>
                            <span className="font-bold text-amber-50">#{ord.id}</span>
                            <span className="text-zinc-500 font-mono text-[10px] block mt-0.5">
                              {new Date(ord.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wide font-bold inline-block ${
                            ord.status === 'delivered' ? 'bg-brand-green/20 text-brand-green' :
                            ord.status === 'shipping' ? 'bg-[#B88A55]/20 text-[#B88A55]' :
                            ord.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            ord.status === 'pending_payment' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-brand-purple/20 text-brand-purple'
                          }`}>
                            {ord.status === 'pending_payment' ? "Chờ chuyển khoản" :
                             ord.status === 'confirmed' ? "Đã xác nhận" :
                             ord.status === 'packing' ? "Đang đóng gói" :
                             ord.status === 'shipping' ? "Đang ship" :
                             ord.status === 'delivered' ? "Giao thành công" : "Đã hủy bỏ"}
                          </span>
                        </div>

                        <div className="space-y-2 text-zinc-300">
                          <p><span className="text-zinc-500 font-light">Người nhận:</span> <span className="font-semibold">{ord.customerName}</span> ({ord.phone})</p>
                          <p className="truncate max-w-lg"><span className="text-zinc-500 font-light">Địa chỉ bưu thiếp:</span> {ord.addressDetail}, {ord.ward}, {ord.district}, {ord.province}</p>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-3.5">
                          <span className="text-zinc-400 text-[10px]">{ord.items.length} hạng mục bọc quà</span>
                          <span className="font-bold text-amber-50 text-sm">{formatPrice(ord.total)}</span>
                        </div>
                      </div>
                    ))}

                  {ordersList.length === 0 && (
                    <div className="text-zinc-500 text-xs py-12 text-center">
                      Không hiển thị đơn bọc quà nào thích hợp.
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Active Selected Order details sheet */}
              <div className="bg-[#14100E] border border-white/5 rounded-2xl p-6 shadow-2xl relative self-start">
                {selectedOrder ? (
                  <div className="space-y-6 text-xs font-sans">
                    
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div>
                        <h4 className="text-sm font-bold text-amber-5s">Hồ Sơ Đơn Hàng</h4>
                        <span className="text-[10px] font-mono text-[#B88A55] tracking-widest block font-bold uppercase select-all">#{selectedOrder.id}</span>
                      </div>
                      <button onClick={() => setSelectedOrder(null)} className="text-zinc-500 hover:text-white shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Vận tiến status operations drawer */}
                    <div className="bg-[#1C1715] border border-white/5 p-4 rounded-xl space-y-3.5">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Cập nhật bưu trình quốc vận:</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-[9px] uppercase tracking-wider font-bold">
                        <button
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'pending_payment')}
                          className={`py-2 rounded px-1 transition-all cursor-pointer ${selectedOrder.status === 'pending_payment' ? 'bg-amber-600 text-white' : 'bg-white/5 hover:bg-white/10 text-zinc-300'}`}
                        >
                          Chờ chuyển khoản
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'confirmed')}
                          className={`py-2 rounded px-1 transition-all cursor-pointer ${selectedOrder.status === 'confirmed' ? 'bg-brand-purple text-white' : 'bg-white/5 hover:bg-white/10 text-zinc-300'}`}
                        >
                          Xác nhận đơn
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'packing')}
                          className={`py-2 rounded px-1 transition-all cursor-pointer ${selectedOrder.status === 'packing' ? 'bg-orange-600/70 text-white' : 'bg-white/5 hover:bg-white/10 text-zinc-300'}`}
                        >
                          Đóng gói
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'shipping')}
                          className={`py-2 rounded px-1 transition-all cursor-pointer ${selectedOrder.status === 'shipping' ? 'bg-blue-600/70 text-white' : 'bg-white/5 hover:bg-white/10 text-zinc-300'}`}
                        >
                          Giao đi
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'delivered')}
                          className={`col-span-2 py-2 rounded px-1 transition-all cursor-pointer ${selectedOrder.status === 'delivered' ? 'bg-green-600/70 text-white' : 'bg-white/5 hover:bg-white/10 text-zinc-300'}`}
                        >
                          Hoàn tất giao hàng
                        </button>
                      </div>

                      <button
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'cancelled')}
                        className={`w-full py-2.5 rounded text-[9px] font-bold tracking-wider uppercase transition-all cursor-pointer ${selectedOrder.status === 'cancelled' ? 'bg-red-600 text-white' : 'bg-red-600/10 hover:bg-red-600/20 text-red-400'}`}
                      >
                        Huỷ bỏ đơn hàng này
                      </button>
                    </div>

                    {/* Customer info table */}
                    <div className="space-y-3.5">
                      <h5 className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Người nhận & Địa chỉ:</h5>
                      <div className="bg-[#0F0D0C] p-3 rounded-xl border border-white/5 space-y-2 text-zinc-300">
                        <p><span className="text-zinc-500 font-light">Lữ hữu:</span> <span className="font-semibold text-white">{selectedOrder.customerName}</span></p>
                        <p><span className="text-zinc-500 font-light">Số điện thoại:</span> {selectedOrder.phone}</p>
                        <p><span className="text-zinc-500 font-light">Email hồi âm:</span> {selectedOrder.email || "Không cung cấp"}</p>
                        <p className="leading-relaxed"><span className="text-zinc-500 font-light">Nơi nhận:</span> {selectedOrder.addressDetail}, {selectedOrder.ward}, {selectedOrder.district}, {selectedOrder.province}</p>
                        {selectedOrder.notes && (
                          <p className="border-t border-white/5 pt-2 mt-2 text-[11px] font-light italic text-amber-100/70 leading-relaxed">
                            "Lời dặn dò: {selectedOrder.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Gift wrap message info sheet */}
                    {selectedOrder.wrapAsGift && (
                      <div className="bg-[#B88A55]/10 border border-[#B88A55]/20 p-3 rounded-xl">
                        <p className="font-bold text-[#b88a55]">❀ Có yêu cầu bọc quà & viết thiệp:</p>
                        <p className="italic text-zinc-300 pl-3 border-l border-[#b88a55] mt-1.5 leading-relaxed">
                          "{selectedOrder.giftMessage || 'Huế gửi thương yêu...'}"
                        </p>
                      </div>
                    )}

                    {/* Pricing sheets */}
                    <div className="space-y-3.5">
                      <h5 className="text-[10px] text-zinc-400 uppercase tracking-wider">Hạt phần bưu hóa chi tiết:</h5>
                      <div className="space-y-2.5">
                        {selectedOrder.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-start text-xs font-sans pb-2 border-b border-white/5 last:border-0">
                            <div>
                              <p className="font-semibold text-zinc-200">{it.name}</p>
                              <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">{it.quantity} món x {formatPrice(it.price)}</span>
                            </div>
                            <span className="font-bold text-amber-50 shrink-0">{formatPrice(it.price * it.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-white/5 pt-3 space-y-1.5 text-zinc-400">
                        <div className="flex justify-between">
                          <span>Cơ quà cộng hợp:</span>
                          <span>{formatPrice(selectedOrder.subtotal)}</span>
                        </div>
                        {selectedOrder.discount > 0 && (
                          <div className="flex justify-between text-green-400">
                            <span>Chiết giảm:</span>
                            <span>-{formatPrice(selectedOrder.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Phí bưu tá:</span>
                          <span>{selectedOrder.shippingFee > 0 ? formatPrice(selectedOrder.shippingFee) : "Miễn phí ship"}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold border-t border-white/5 pt-2 text-brand-purple mt-2">
                          <span>TỔNG THU HỘ:</span>
                          <span>{formatPrice(selectedOrder.total)}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="text-zinc-600 text-xs py-24 text-center font-light leading-relaxed">
                    <AlertCircle className="w-8 h-8 text-zinc-700 mx-auto mb-3 shrink-0" />
                    <span>Lữ hữu vui lòng nhấp chọn một dòng mã bưu đơn ở danh mục kế bên để kéo xuống xem toàn vẹn thông tin chi tiết.</span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: CONTACTS SUBMISSION LOOPS */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              
              <div className="bg-[#14100E] border border-white/5 rounded-2xl p-6 shadow-2xl">
                
                <div className="divide-y divide-white/5 space-y-6">
                  {contactsList.map((ct) => (
                    <div key={ct.id} className="pt-6 first:pt-0 font-sans text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3.5">
                        
                        <div>
                          <div className="flex items-center space-x-2.5">
                            <span className="font-bold text-base text-amber-50">{ct.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${ct.read ? 'bg-zinc-800 text-zinc-500' : 'bg-brand-purple/20 text-brand-purple animate-pulse'}`}>
                              {ct.read ? "Đã đọc / Đã xử lý" : "Mới / Chưa xử lý"}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-mono mt-1">
                            Gửi ngày: {ct.createdAt ? new Date(ct.createdAt).toLocaleString('vi-VN') : 'Không rõ'}
                          </p>
                        </div>

                        {/* CRM actions toolbar */}
                        <div className="flex items-center space-x-3 shrink-0">
                          <button
                            onClick={() => handleToggleContactRead(ct.id, ct.read)}
                            className={`p-1.5 px-3 rounded-lg text-[10px] tracking-wider uppercase font-bold cursor-pointer transition-colors ${
                              ct.read 
                                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400' 
                                : 'bg-[#6E4B67] hover:bg-[#54344E] text-white'
                            }`}
                          >
                            {ct.read ? "Đánh dấu chưa đọc" : "Xác nhận xử lý"}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteContact(ct.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Xóa vĩnh viễn"
                          >
                            <Trash2 className="w-4 h-4 shrink-0" />
                          </button>
                        </div>

                      </div>

                      {/* Message details sheet */}
                      <div className="bg-[#0F0D0C] p-4 rounded-xl border border-white/5 space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-zinc-400 font-light border-b border-white/5 pb-2.5">
                          <p><span className="text-zinc-600 font-semibold uppercase text-[9px] tracking-wide block mb-0.5">Thư điện tử</span> <a href={`mailto:${ct.email}`} className="text-zinc-200 hover:underline">{ct.email}</a></p>
                          <p><span className="text-zinc-600 font-semibold uppercase text-[9px] tracking-wide block mb-0.5">Số điện thoại</span> <span className="text-zinc-200">{ct.phone}</span></p>
                          <p><span className="text-zinc-600 font-semibold uppercase text-[9px] tracking-wide block mb-0.5">Chủ đề biểu đạt</span> <span className="text-zinc-200 italic font-semibold font-serif">"{ct.subject || 'Không đề tựa'}"</span></p>
                        </div>
                        <div className="text-zinc-300 text-xs leading-relaxed white-space-pre-line font-light">
                          {ct.message}
                        </div>
                      </div>

                    </div>
                  ))}

                  {contactsList.length === 0 && (
                    <div className="text-zinc-600 text-sm py-16 text-center font-light">
                      <Inbox className="w-10 h-10 text-zinc-800 mx-auto mb-3 shrink-0" />
                      <span>Hộp thư bưu tín đang hoàn toàn trống trải.</span>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </section>
      </main>

      {/* 3. CORE MODAL FOR PRODUCTS ADDING OR EDITING */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-[#070505]/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#14100E] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto text-xs font-sans shadow-2xl">
            
            <form onSubmit={handleSaveProduct}>
              
              {/* Modal header */}
              <div className="p-6 border-b border-white/5 bg-[#1C1715] flex items-center justify-between">
                <h3 className="font-serif text-base font-semibold text-amber-50">
                  {editingProduct ? "CHỈNH SỬA SẢN PHẨM" : "THÊM MỚI SẢN PHẨM KHO"}
                </h3>
                <button 
                  type="button" 
                  onClick={() => setShowProductModal(false)}
                  className="text-zinc-500 hover:text-white shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body form fields */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column: General stats */}
                <div className="space-y-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Mã số sản phẩm (ID, duy nhất)</label>
                    <input
                      type="text"
                      required
                      placeholder="sp-nonla hoặc sp-vydatra"
                      disabled={!!editingProduct}
                      value={productForm.id}
                      onChange={(e) => setProductForm(p => ({ ...p, id: e.target.value }))}
                      className="w-full bg-[#0F0D0C] border border-white/10 rounded-xl px-3 py-2.5 text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-purple disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Mã định danh URL (Slug, duy nhất)</label>
                    <input
                      type="text"
                      required
                      placeholder="non-la-bai-tho-hue"
                      value={productForm.slug}
                      onChange={(e) => setProductForm(p => ({ ...p, slug: e.target.value }))}
                      className="w-full bg-[#0F0D0C] border border-white/10 rounded-xl px-3 py-2.5 text-zinc-200 placeholder-zinc-700 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Tên sản phẩm bày trí</label>
                    <input
                      type="text"
                      required
                      placeholder="Nón Lá Bài Thơ Huế Thủ Công"
                      value={productForm.name}
                      onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full bg-[#0F0D0C] border border-white/10 rounded-xl px-3 py-2.5 text-zinc-200 focus:outline-none font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Giá bán (VND)</label>
                      <input
                        type="number"
                        required
                        value={productForm.price || ''}
                        onChange={(e) => setProductForm(p => ({ ...p, price: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-[#0F0D0C] border border-white/10 rounded-xl px-3 py-2.5 text-zinc-200 font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Giá gốc (VND, tuỳ chọn)</label>
                      <input
                        type="number"
                        value={productForm.originalPrice || ''}
                        onChange={(e) => setProductForm(p => ({ ...p, originalPrice: parseInt(e.target.value) || undefined }))}
                        className="w-full bg-[#0F0D0C] border border-white/10 rounded-xl px-3 py-2.5 text-zinc-200 text-zinc-400 line-through"
                        placeholder="Không áp dụng"
                      />
                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Chủng loại sản phẩm</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => {
                          const val = e.target.value;
                          const labels: Record<string, string> = {
                            'dac-san': 'Đặc sản Huế',
                            'thu-cong': 'Thủ công mỹ nghệ',
                            'van-phong-pham': 'Văn phòng phẩm và bưu thiếp',
                            'qua-tang-van-hoa': 'Quà tặng văn hóa',
                            'qua-tang-theo-dip': 'Quà tặng theo dịp'
                          };
                          setProductForm(p => ({ ...p, category: val as any, categoryName: labels[val] || val }));
                        }}
                        className="w-full bg-[#0F0D0C] border border-white/10 rounded-xl px-3 py-2.5 text-zinc-300"
                      >
                        <option value="dac-san">Đặc sản Huế</option>
                        <option value="thu-cong">Thủ công mỹ nghệ</option>
                        <option value="van-phong-pham">Văn phòng phẩm</option>
                        <option value="qua-tang-van-hoa">Quà tặng văn hóa</option>
                        <option value="qua-tang-theo-dip">Quà tặng theo dịp</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-[#b88a55] font-bold uppercase tracking-wider block">Số lượng tồn (Stock)</label>
                      <input
                        type="number"
                        required
                        value={productForm.stock || 0}
                        onChange={(e) => setProductForm(p => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-[#0F0D0C] border border-white/10 rounded-xl px-3 py-2.5 text-zinc-200 font-mono text-xs font-bold"
                      />
                    </div>

                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Mắc sắc dệt (URL ảnh mô tả, cách nhau dấu phẩy)</label>
                    <input
                      type="text"
                      required
                      value={productForm.images ? productForm.images.join(", ") : ''}
                      onChange={(e) => setProductForm(p => ({ ...p, images: e.target.value.split(",").map(i => i.trim()).filter(Boolean) }))}
                      className="w-full bg-[#0F0D0C] border border-white/10 rounded-xl px-3 py-2.5 text-zinc-300 font-mono text-[10px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Mô tả tóm tắt (Phục vụ SEO & List)</label>
                    <textarea
                      placeholder="Lời tóm tắt ngắn..."
                      value={productForm.shortDescription || ''}
                      onChange={(e) => setProductForm(p => ({ ...p, shortDescription: e.target.value }))}
                      rows={3}
                      className="w-full bg-[#0F0D0C] border border-white/10 rounded-xl px-3 py-2.5 text-zinc-300 focus:outline-none"
                    />
                  </div>

                </div>

                {/* Right Column: Narrative details stories */}
                <div className="space-y-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Câu chuyện phía sau món quà (Đặc sắc cố đô)</label>
                    <textarea
                      placeholder="Ghi nhận linh hồn, truyền tích, hay công phu chế tác thủ công..."
                      value={productForm.story || ''}
                      onChange={(e) => setProductForm(p => ({ ...p, story: e.target.value }))}
                      rows={4}
                      className="w-full bg-[#0F0D0C] border border-[#B88A55]/30 rounded-xl px-3 py-2.5 text-zinc-300 focus:outline-none focus:border-brand-purple font-serif leading-relaxed italic bg-amber-50/[0.01]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Mô tả đầy đủ công năng, thông số</label>
                    <textarea
                      placeholder="Chi tiết kết quả, độ thẩm mỹ..."
                      value={productForm.fullDescription || ''}
                      onChange={(e) => setProductForm(p => ({ ...p, fullDescription: e.target.value }))}
                      rows={3}
                      className="w-full bg-[#0F0D0C] border border-white/10 rounded-xl px-3 py-2.5 text-zinc-300 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Nguyên vật liệu chế biến</label>
                      <input
                        type="text"
                        placeholder="Lá gồi tự nhiên phơi sương, thớ gỗ thông sấy..."
                        value={productForm.materialsOrIngredients || ''}
                        onChange={(e) => setProductForm(p => ({ ...p, materialsOrIngredients: e.target.value }))}
                        className="w-full bg-[#0F0D0C] border border-white/10 rounded-xl px-3 py-2.5 text-zinc-300"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Bảo quản bọc đóng</label>
                      <input
                        type="text"
                        placeholder="Tránh ẩm ướt tuyệt đối, để mát lành..."
                        value={productForm.careInstructions || ''}
                        onChange={(e) => setProductForm(p => ({ ...p, careInstructions: e.target.value }))}
                        className="w-full bg-[#0F0D0C] border border-white/10 rounded-xl px-3 py-2.5 text-zinc-300"
                      />
                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Thích hợp tặng tặng dối tượng</label>
                      <select
                        value={productForm.suitability}
                        onChange={(e) => setProductForm(p => ({ ...p, suitability: e.target.value as any }))}
                        className="w-full bg-[#0F0D0C] border border-white/10 rounded-xl px-3 py-2.5 text-zinc-300"
                      >
                        <option value="ban-be">Bạn bè phương xa</option>
                        <option value="gia-dinh">Gia đình, lân cận</option>
                        <option value="dong-nghiep">Đồng nghiệp tri thức</option>
                        <option value="doanh-nghiep">Đối tác doanh nghiệp</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2 pt-6 shrink-0">
                      <input
                        type="checkbox"
                        id="easyToCarry"
                        checked={!!productForm.easyToCarry}
                        onChange={(e) => setProductForm(p => ({ ...p, easyToCarry: e.target.checked }))}
                        className="w-4 h-4 rounded text-brand-purple focus:ring-brand-purple bg-[#0F0D0C] border-white/10"
                      />
                      <label htmlFor="easyToCarry" className="text-[10px] text-zinc-300 cursor-pointer">Bộ lọc dễ đem đi du lịch (nhỏ nhẹ)</label>
                    </div>

                  </div>

                </div>

              </div>

              {/* Modal controls actions footer */}
              <div className="p-6 border-t border-white/5 bg-[#1C1715] flex items-center justify-end space-x-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="bg-white/5 hover:bg-white/10 text-zinc-300 text-xs py-2 px-6 rounded-lg transition-colors cursor-pointer"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  className="bg-[#6E4B67] hover:bg-[#54344E] text-white text-xs font-semibold py-2 px-6 rounded-lg transition-colors cursor-pointer"
                  id="admin-save-product-modal-btn"
                >
                  Lưu vào Sổ Cố Đô
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
