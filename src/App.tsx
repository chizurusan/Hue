import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';

// Component layout imports
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ChatWidget } from './components/ChatWidget';
import { ToastContainer } from './components/Toast';

// Core pages imports
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Stories } from './pages/Stories';
import { StoryDetail } from './pages/StoryDetail';
import { Collections } from './pages/Collections';
import { CollectionDetail } from './pages/CollectionDetail';
import { Cart } from './pages/Cart';
import { Wishlist } from './pages/Wishlist';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Account } from './pages/Account';
import { ContactFAQ } from './pages/ContactFAQ';
import { TrackOrder } from './pages/TrackOrder';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { VnpayResult } from './pages/VnpayResult';
import { NotFound } from './pages/NotFound';

const MainLayout: React.FC = () => {
  const { page, toasts, removeToast } = useApp();

  // Scroll to top upon navigating to a different page route
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);

  // Route router distributor
  const renderActiveRoute = () => {
    switch (page) {
      case 'home':
        return <Home />;
      case 'shop':
        return <Shop />;
      case 'product':
        return <ProductDetail />;
      case 'stories':
        return <Stories />;
      case 'story':
        return <StoryDetail />;
      case 'collections':
        return <Collections />;
      case 'collection':
        return <CollectionDetail />;
      case 'cart':
        return <Cart />;
      case 'wishlist':
        return <Wishlist />;
      case 'checkout':
        return <Checkout />;
      case 'order-success':
        return <OrderSuccess />;
      case 'account':
        return <Account />;
      case 'contact':
        return <ContactFAQ />;
      case 'track-order':
        return <TrackOrder />;
      case 'admin-login':
        return <AdminLogin />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'vnpay-result':
        return <VnpayResult />;
      default:
        return <NotFound />;
    }
  };

  const isAdminPage = page === 'admin-login' || page === 'admin-dashboard';

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-[#0F0D0C] text-zinc-100 flex flex-col justify-between selection:bg-brand-purple/30 selection:text-white">
        <main className="flex-grow flex flex-col">
          {renderActiveRoute()}
        </main>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-beige selection:bg-brand-purple-light selection:text-brand-purple flex flex-col justify-between">
      
      {/* Dynamic announcements banners for e-commerce conversions */}
      <div className="bg-[#1C1715] text-[10px] text-amber-50 uppercase tracking-widest text-center py-2.5 px-4 font-sans font-medium flex items-center justify-center space-x-2 border-b border-white/5">
        <span>❀ mang một miền thương về nhà ❀ MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC CHO ĐƠN HÀNG TỪ 500K</span>
      </div>

      {/* Primary header navbar */}
      <Header />

      {/* Main content viewport */}
      <main className="flex-grow">
        {renderActiveRoute()}
      </main>

      {/* Standard footer */}
      <Footer />

      {/* Simulated automated AI helper chat bubble */}
      <ChatWidget />

      {/* Global Notification Toast Container */}
      <ToastContainer />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
