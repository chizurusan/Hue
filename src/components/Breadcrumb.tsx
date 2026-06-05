import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BreadcrumbItem {
  label: string;
  page?: string;
  params?: any;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const { navigateTo } = useApp();

  return (
    <nav className="flex items-center space-x-2 text-xs text-text-muted font-sans py-4 mb-2 overflow-x-auto whitespace-nowrap scrollbar-none" aria-label="Breadcrumb">
      <button
        onClick={() => navigateTo('home')}
        className="flex items-center space-x-1 hover:text-brand-purple transition-colors cursor-pointer"
        id="breadcrumb-home"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Trang chủ</span>
      </button>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {isLast ? (
              <span className="font-medium text-brand-purple truncate max-w-[200px] md:max-w-xs">{item.label}</span>
            ) : (
              <button
                onClick={() => item.page && navigateTo(item.page, item.params)}
                className="hover:text-brand-purple transition-colors cursor-pointer truncate max-w-[150px]"
                id={`breadcrumb-item-${idx}`}
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
