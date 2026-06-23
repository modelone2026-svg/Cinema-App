import React, { useState, useEffect } from 'react';
import { MediaItem, AdsConfig, MaintenanceConfig } from './types';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MediaGrid from './components/MediaGrid';
import VideoPlayer from './components/VideoPlayer';
import AdminPanel from './components/AdminPanel';
import Maintenance from './components/Maintenance';
import { Loader, Film, ShieldAlert, AlertTriangle } from 'lucide-react';
import {
  dbGetItems,
  dbGetAdsConfig,
  dbGetMaintenanceConfig,
  subscribeToAuth,
  authLogoutAdmin,
  dbTriggerManualRefreshAndSeed,
  isSupabaseConfigured
} from './lib/supabase';

export default function App() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [adsConfig, setAdsConfig] = useState<AdsConfig | null>(null);
  const [maintenanceConfig, setMaintenanceConfig] = useState<MaintenanceConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<string>('');

  // Routing and Navigation States
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [category, setCategory] = useState<'all' | 'movie' | 'series'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Load data function
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const items = await dbGetItems();
      setMediaItems(items);
      
      const ads = await dbGetAdsConfig();
      setAdsConfig(ads);
      
      const maint = await dbGetMaintenanceConfig();
      setMaintenanceConfig(maint);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();

    // Subscribe to Auth state changes
    const unsubscribeAuth = subscribeToAuth((isAdmin) => {
      setIsAdminLoggedIn(isAdmin);
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const triggerManualRefreshAndSeed = async () => {
    try {
      await dbTriggerManualRefreshAndSeed();
      await loadAllData();
    } catch (err) {
      console.error("Failed to seed database:", err);
    }
  };

  const handleLogout = async () => {
    await authLogoutAdmin();
    setIsAdminLoggedIn(false);
    setShowAdmin(false);
  };


  // Filter media items by category and search queries
  const filteredItems = mediaItems.filter((item) => {
    const matchesCategory = category === 'all' || item.type === category;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get featured item for Hero section (first item in the list or filtered list)
  const heroItem = filteredItems.length > 0 ? filteredItems[0] : null;

  // Active view router logic
  // 1. Maintenance Mode override
  const isMaintenanceModeActive = maintenanceConfig?.active && !isAdminLoggedIn;

  if (isMaintenanceModeActive) {
    return (
      <Maintenance 
        message={maintenanceConfig?.message || ''} 
        onAdminClick={() => setShowAdmin(true)} 
      />
    );
  }

  // 2. Admin Portal Panel Screen
  if (showAdmin) {
    return (
      <AdminPanel
        mediaItems={mediaItems}
        adsConfig={adsConfig}
        maintenanceConfig={maintenanceConfig}
        onRefreshData={triggerManualRefreshAndSeed}
        onClose={() => setShowAdmin(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0a0f] text-[#f3f4f6]">
      
      {/* Navigation bar */}
      <Navbar
        currentCategory={category}
        setCategory={setCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAdminClick={() => setShowAdmin(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleLogout}
        onLogoClick={() => {
          setActiveItem(null);
          setCategory('all');
          setSearchQuery('');
        }}
      />

      {/* Loading state indicator */}
      {isLoading ? (
        <div id="global-spinner" className="flex-1 flex flex-col items-center justify-center py-32 gap-3">
          <Loader size={36} className="animate-spin text-red-600" />
          <span className="text-xs text-gray-400 font-bold">جاري تحميل الأفلام والمسلسلات الحصرية...</span>
        </div>
      ) : (
        <div className="flex-1">
          {activeItem ? (
            /* Immersive Video Player detail view */
            <VideoPlayer
              item={activeItem}
              adsConfig={adsConfig}
              onBack={() => setActiveItem(null)}
            />
          ) : (
            /* Main Portal Homepage Catalog */
            <>
              {/* Featured banner for premium spotlight */}
              {searchQuery === '' && (
                <Hero 
                  item={heroItem} 
                  onPlayClick={(item) => setActiveItem(item)} 
                />
              )}

              {/* Main content grid displaying films/series */}
              <main className="py-8">
                <MediaGrid
                  items={filteredItems}
                  onItemClick={(item) => setActiveItem(item)}
                  selectedCategory={category}
                />
              </main>
            </>
          )}
        </div>
      )}

      {/* Footer block */}
      <footer className="border-t border-white/5 py-8 bg-[#0a080d] mt-12 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-bold text-gray-400">
            <Film size={14} className="text-red-500" />
            <span>سينما مجان - بوابة المشاهدة المجانية بالكامل</span>
          </div>
          <p className="font-light">جميع الحقوق محفوظة &copy; {new Date().getFullYear()} - مشغل الفيديو مدمج بالكامل لحماية الخصوصية ومكافحة التتبع</p>
        </div>
      </footer>

    </div>
  );
}
