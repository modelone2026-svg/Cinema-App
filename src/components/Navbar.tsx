import React, { useState } from 'react';
import { Search, Film, Tv, ShieldAlert, LogOut } from 'lucide-react';

interface NavbarProps {
  currentCategory: 'all' | 'movie' | 'series';
  setCategory: (category: 'all' | 'movie' | 'series') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAdminClick: () => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
  onLogoClick: () => void;
}

export default function Navbar({
  currentCategory,
  setCategory,
  searchQuery,
  setSearchQuery,
  onAdminClick,
  isAdminLoggedIn,
  onLogout,
  onLogoClick,
}: NavbarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <nav id="app-navbar" className="sticky top-0 z-50 bg-[#0c0a0f]/90 backdrop-blur-md border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div 
            id="nav-logo"
            onClick={onLogoClick} 
            className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
          >
            <div className="p-2 bg-red-600 rounded-lg text-white group-hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">
              <Film size={20} className="group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-white via-gray-100 to-red-500 bg-clip-text text-transparent">
              سينما<span className="text-red-500">مجان</span>
            </span>
          </div>

          {/* Navigation Categories */}
          <div id="nav-categories" className="hidden md:flex items-center gap-2">
            <button
              id="category-all-btn"
              onClick={() => { setCategory('all'); onLogoClick(); }}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                currentCategory === 'all'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              الرئيسية
            </button>
            <button
              id="category-movies-btn"
              onClick={() => { setCategory('movie'); onLogoClick(); }}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                currentCategory === 'movie'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film size={15} />
              الأفلام
            </button>
            <button
              id="category-series-btn"
              onClick={() => { setCategory('series'); onLogoClick(); }}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                currentCategory === 'series'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Tv size={15} />
              المسلسلات
            </button>
          </div>

          {/* Smart Search and Control Panel */}
          <div className="flex items-center gap-3 flex-1 md:flex-initial justify-end">
            <div 
              id="nav-search-container"
              className={`relative flex items-center bg-[#13111c] border rounded-full px-3 py-1.5 transition-all duration-300 w-full max-w-xs ${
                isSearchFocused ? 'border-red-500 shadow-md shadow-red-500/5' : 'border-white/5'
              }`}
            >
              <Search className="text-gray-400 shrink-0" size={16} />
              <input
                id="search-input"
                type="text"
                placeholder="ابحث عن فيلم أو مسلسل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full pr-2 text-right"
              />
            </div>

            {/* Admin Bypass Link/Actions */}
            <div id="nav-admin-actions" className="flex items-center gap-2">
              {isAdminLoggedIn ? (
                <div className="flex items-center gap-2">
                  <button
                    id="nav-admin-btn"
                    onClick={onAdminClick}
                    className="p-2.5 bg-red-600/15 text-red-500 rounded-full hover:bg-red-600/20 transition-all border border-red-500/10 flex items-center justify-center"
                    title="لوحة تحكم الأدمن"
                  >
                    <ShieldAlert size={18} />
                  </button>
                  <button
                    id="nav-logout-btn"
                    onClick={onLogout}
                    className="p-2.5 bg-white/5 text-gray-400 rounded-full hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                    title="تسجيل الخروج"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button
                  id="nav-hidden-admin-trigger"
                  onClick={onAdminClick}
                  className="p-2 text-gray-600/50 hover:text-red-500 transition-colors rounded-full"
                  title="بوابة المسؤول"
                >
                  <ShieldAlert size={16} />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
