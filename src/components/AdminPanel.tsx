import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Settings, ListCollapse, Play, LayoutGrid, 
  ToggleLeft, ToggleRight, Hammer, Save, LogIn, Eye, EyeOff, ShieldCheck, Loader, Film, Tv
} from 'lucide-react';
import { MediaItem, AdsConfig, MaintenanceConfig, AlternativeServer } from '../types';
import {
  authLoginAdmin,
  authLoginWithGoogle,
  authLogoutAdmin,
  subscribeToAuth,
  dbSaveItem,
  dbDeleteItem,
  dbSaveAdsConfig,
  dbSaveMaintenanceConfig,
  isSupabaseConfigured
} from '../lib/supabase';

interface AdminPanelProps {
  mediaItems: MediaItem[];
  adsConfig: AdsConfig | null;
  maintenanceConfig: MaintenanceConfig | null;
  onRefreshData: () => void;
  onClose: () => void;
}

export default function AdminPanel({
  mediaItems,
  adsConfig,
  maintenanceConfig,
  onRefreshData,
  onClose,
}: AdminPanelProps) {
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'items' | 'ads' | 'maintenance'>('items');

  // Media items manager states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPosterUrl, setItemPosterUrl] = useState('');
  const [itemIframeUrl, setItemIframeUrl] = useState('');
  const [itemType, setItemType] = useState<'movie' | 'series'>('movie');
  const [itemRating, setItemRating] = useState<number>(8.0);
  const [alternativeServers, setAlternativeServers] = useState<AlternativeServer[]>([]);
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  // Alternative server state input helper
  const [newServerName, setNewServerName] = useState('');
  const [newServerUrl, setNewServerUrl] = useState('');

  // Ads state (local inputs)
  const [popunderCode, setPopunderCode] = useState('');
  const [popunderActive, setPopunderActive] = useState(false);
  const [bannerAboveCode, setBannerAboveCode] = useState('');
  const [bannerAboveActive, setBannerAboveActive] = useState(false);
  const [bannerBelowCode, setBannerBelowCode] = useState('');
  const [bannerBelowActive, setBannerBelowActive] = useState(false);
  const [isSubmittingAds, setIsSubmittingAds] = useState(false);

  // Maintenance state (local inputs)
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [isSubmittingMaintenance, setIsSubmittingMaintenance] = useState(false);

  // Success indicator triggers
  const [saveSuccess, setSaveSuccess] = useState('');

  // Check login state on load
  useEffect(() => {
    const unsubscribe = subscribeToAuth((isAdmin) => {
      setIsLoggedIn(isAdmin);
    });

    // Seed local settings from config
    if (adsConfig) {
      setPopunderCode(adsConfig.popunderCode || '');
      setPopunderActive(adsConfig.popunderActive || false);
      setBannerAboveCode(adsConfig.bannerAboveCode || '');
      setBannerAboveActive(adsConfig.bannerAboveActive || false);
      setBannerBelowCode(adsConfig.bannerBelowCode || '');
      setBannerBelowActive(adsConfig.bannerBelowActive || false);
    }

    if (maintenanceConfig) {
      setMaintenanceActive(maintenanceConfig.active || false);
      setMaintenanceMessage(maintenanceConfig.message || '');
    }

    return () => unsubscribe();
  }, [adsConfig, maintenanceConfig]);

  // Handle Admin Auth Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);

    if (email !== 'modelone2026@gmail.com') {
      setAuthError('عذراً! البريد الإلكتروني المدخل ليس بريد الأدمن المعتمد.');
      setIsAuthLoading(false);
      return;
    }

    try {
      await authLoginAdmin(email, password);
      setIsLoggedIn(true);
    } catch (err: any) {
      setAuthError(err.message || 'خطأ تسجيل الدخول.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    setAuthError('');
    try {
      await authLoginWithGoogle();
      setIsLoggedIn(true);
    } catch (err: any) {
      setAuthError(err.message || 'فشل تسجيل الدخول باستخدام Google.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await authLogoutAdmin();
    setIsLoggedIn(false);
  };

  // Add Alternative Server helper
  const addServerHelper = () => {
    if (!newServerName || !newServerUrl) return;
    setAlternativeServers([...alternativeServers, { name: newServerName, url: newServerUrl }]);
    setNewServerName('');
    setNewServerUrl('');
  };

  const removeServerHelper = (index: number) => {
    setAlternativeServers(alternativeServers.filter((_, idx) => idx !== index));
  };

  // Handle Add/Edit Media Item Submit
  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingItem(true);
    setSaveSuccess('');

    const itemData = {
      title: itemTitle,
      description: itemDescription,
      posterUrl: itemPosterUrl,
      iframeUrl: itemIframeUrl,
      type: itemType,
      rating: Number(itemRating) || 8.0,
      alternativeServers,
      id: isEditing && editingId ? editingId : undefined
    };

    try {
      await dbSaveItem(itemData);
      if (isEditing && editingId) {
        setSaveSuccess('تم تعديل العرض بنجاح!');
      } else {
        setSaveSuccess('تمت إضافة العرض الجديد بنجاح!');
      }

      // Reset form fields
      resetItemForm();
      onRefreshData();
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ العمل: ' + (err.message || err));
    } finally {
      setIsSubmittingItem(false);
    }
  };

  const resetItemForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setItemTitle('');
    setItemDescription('');
    setItemPosterUrl('');
    setItemIframeUrl('');
    setItemType('movie');
    setItemRating(8.0);
    setAlternativeServers([]);
  };

  const triggerEdit = (item: MediaItem) => {
    setIsEditing(true);
    setEditingId(item.id || null);
    setItemTitle(item.title);
    setItemDescription(item.description);
    setItemPosterUrl(item.posterUrl);
    setItemIframeUrl(item.iframeUrl);
    setItemType(item.type);
    setItemRating(item.rating);
    setAlternativeServers(item.alternativeServers || []);
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العرض بالكامل؟')) return;
    try {
      await dbDeleteItem(id);
      setSaveSuccess('تم حذف العرض بنجاح!');
      onRefreshData();
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ أثناء حذف العمل: ' + (err.message || err));
    }
  };

  // Save Ads configuration
  const handleSaveAds = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAds(true);
    setSaveSuccess('');

    try {
      await dbSaveAdsConfig({
        popunderCode,
        popunderActive,
        bannerAboveCode,
        bannerAboveActive,
        bannerBelowCode,
        bannerBelowActive,
      });
      setSaveSuccess('تم حفظ إعدادات الإعلانات وتحديثها فوراً!');
      onRefreshData();
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ الإعلانات: ' + (err.message || err));
    } finally {
      setIsSubmittingAds(false);
    }
  };

  // Save Maintenance Mode Configuration
  const handleSaveMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingMaintenance(true);
    setSaveSuccess('');

    try {
      await dbSaveMaintenanceConfig({
        active: maintenanceActive,
        message: maintenanceMessage,
      });
      setSaveSuccess('تم تحديث حالة الصيانة العامة للموقع!');
      onRefreshData();
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ وضع الصيانة: ' + (err.message || err));
    } finally {
      setIsSubmittingMaintenance(false);
    }
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div id="admin-login-screen" className="min-h-screen flex items-center justify-center p-6 bg-[#0c0a0f]">
        <div className="w-full max-w-md bg-[#13111c] border border-white/5 rounded-2xl p-8 shadow-2xl text-right relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-purple-600"></div>
          
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-600/10 text-red-500 rounded-full">
              <ShieldCheck size={36} />
            </div>
          </div>

          <h2 className="text-2xl font-black text-white text-center mb-2">لوحة تحكم الإدارة الآمنة</h2>
          <p className="text-gray-400 text-xs text-center mb-6">يرجى تسجيل الدخول للوصول للميزات الإدارية والتحكم في المحتوى والإعلانات.</p>

          {authError && (
            <div id="auth-error-banner" className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs mb-4 text-center leading-relaxed font-semibold">
              {authError}
            </div>
          )}

          {/* Google Drive Sign In Button */}
          <button
            id="google-signin-btn"
            type="button"
            disabled={isAuthLoading}
            onClick={handleGoogleLogin}
            className="w-full py-3.5 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3 cursor-pointer text-sm mb-4"
          >
            {isAuthLoading ? (
              <Loader size={18} className="animate-spin text-gray-950" />
            ) : (
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
            )}
            <span>تسجيل الدخول السريع بـ Google</span>
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-white/5"></div>
            <span className="px-3 text-xs text-gray-500">أو تسجيل دخول يدوي</span>
            <div className="flex-1 border-t border-white/5"></div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">البريد الإلكتروني للأدمن</label>
              <input
                id="login-email-input"
                type="email"
                required
                placeholder="modelone2026@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1c1829] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">كلمة المرور</label>
              <div className="relative">
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1c1829] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none text-right pl-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="submit-login-btn"
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 mt-2"
            >
              {isAuthLoading ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              <span>تسجيل الدخول الآمن</span>
            </button>
          </form>

          <div className="mt-6 border-t border-white/5 pt-4 text-center">
            <button
              id="login-close-btn"
              onClick={onClose}
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              العودة للموقع الرئيسي
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard Main Layout
  return (
    <div id="admin-dashboard" className="min-h-screen bg-[#0c0a0f] text-right">
      
      {/* Top Header */}
      <header className="bg-[#13111c] border-b border-white/5 py-4 px-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">لوحة تحكم المسؤول</h1>
              <span className="text-xs text-red-500 font-semibold">تحكم كامل ومباشر بالمحتوى والإعلانات</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="admin-close-btn"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/5"
            >
              العودة للموقع
            </button>
            <button
              id="admin-logout-btn"
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600/10 text-red-500 hover:bg-red-600/20 rounded-xl text-xs font-semibold transition-all"
            >
              تسجيل خروج الأدمن
            </button>
          </div>
        </div>
      </header>

      {/* Main dashboard body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Save success banner */}
        {saveSuccess && (
          <div id="success-toast" className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs font-bold mb-6 flex items-center gap-2">
            <span>✓</span>
            <span>{saveSuccess}</span>
          </div>
        )}

        {/* Tab Switch buttons */}
        <div id="dashboard-tabs" className="flex items-center gap-2 mb-8 bg-[#13111c]/60 p-1 rounded-xl border border-white/5 w-fit">
          <button
            id="tab-items"
            onClick={() => { setActiveTab('items'); setSaveSuccess(''); }}
            className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'items' ? 'bg-red-600 text-white shadow-lg shadow-red-600/10' : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutGrid size={14} />
            <span>إضافة وتعديل العروض</span>
          </button>
          <button
            id="tab-ads"
            onClick={() => { setActiveTab('ads'); setSaveSuccess(''); }}
            className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'ads' ? 'bg-red-600 text-white shadow-lg shadow-red-600/10' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Settings size={14} />
            <span>إدارة الإعلانات والمonetization</span>
          </button>
          <button
            id="tab-maintenance"
            onClick={() => { setActiveTab('maintenance'); setSaveSuccess(''); }}
            className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'maintenance' ? 'bg-red-600 text-white shadow-lg shadow-red-600/10' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Hammer size={14} />
            <span>وضع الصيانة</span>
          </button>
        </div>

        {/* TAB 1: Items Manager */}
        {activeTab === 'items' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form column (Add / Edit) */}
            <div className="lg:col-span-1 bg-[#13111c] border border-white/5 p-6 rounded-2xl h-fit">
              <h2 className="text-base font-extrabold text-white mb-4 border-b border-white/5 pb-3">
                {isEditing ? 'تعديل عرض موجود' : 'إضافة عرض جديد'}
              </h2>

              <form onSubmit={handleItemSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">عنوان العمل (فيلم / مسلسل)</label>
                  <input
                    id="input-title"
                    type="text"
                    required
                    placeholder="مثال: فيلم الفارس الأسود"
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    className="w-full bg-[#1c1829] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:border-red-500 outline-none text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">وصف وقصة العمل</label>
                  <textarea
                    id="input-description"
                    required
                    rows={3}
                    placeholder="اكتب وصفاً أو قصة العمل المختصرة هنا..."
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    className="w-full bg-[#1c1829] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:border-red-500 outline-none text-right resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5">النوع</label>
                    <select
                      id="select-type"
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value as 'movie' | 'series')}
                      className="w-full bg-[#1c1829] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:border-red-500 outline-none text-right"
                    >
                      <option value="movie">فيلم</option>
                      <option value="series">مسلسل</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5">التقييم (من 10)</label>
                    <input
                      id="input-rating"
                      type="number"
                      step="0.1"
                      min="1"
                      max="10"
                      required
                      value={itemRating}
                      onChange={(e) => setItemRating(parseFloat(e.target.value) || 8.0)}
                      className="w-full bg-[#1c1829] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:border-red-500 outline-none text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">رابط صورة البوستر</label>
                  <input
                    id="input-poster-url"
                    type="url"
                    required
                    placeholder="أدخل رابط صورة البوستر المباشر"
                    value={itemPosterUrl}
                    onChange={(e) => setItemPosterUrl(e.target.value)}
                    className="w-full bg-[#1c1829] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:border-red-500 outline-none text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">رابط التشغيل الرئيسي (iframe / embed)</label>
                  <input
                    id="input-iframe-url"
                    type="url"
                    required
                    placeholder="مثال: https://vidsrc.to/embed/movie/..."
                    value={itemIframeUrl}
                    onChange={(e) => setItemIframeUrl(e.target.value)}
                    className="w-full bg-[#1c1829] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:border-red-500 outline-none text-right ltr"
                  />
                </div>

                {/* Alternative Servers config */}
                <div className="border border-white/5 p-3 rounded-xl bg-white/5">
                  <span className="block text-xs font-extrabold text-white mb-2">إضافة سيرفرات تشغيل بديلة (اختياري)</span>
                  
                  <div className="flex flex-col gap-2 mb-3">
                    <input
                      id="alt-server-name"
                      type="text"
                      placeholder="اسم السيرفر (مثال: سيرفر Fembed)"
                      value={newServerName}
                      onChange={(e) => setNewServerName(e.target.value)}
                      className="w-full bg-[#1c1829] border border-white/5 rounded-lg px-2.5 py-2 text-xs text-white outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        id="alt-server-url"
                        type="url"
                        placeholder="رابط السيرفر البديل"
                        value={newServerUrl}
                        onChange={(e) => setNewServerUrl(e.target.value)}
                        className="flex-1 bg-[#1c1829] border border-white/5 rounded-lg px-2.5 py-2 text-xs text-white outline-none ltr"
                      />
                      <button
                        id="add-alt-server-btn"
                        type="button"
                        onClick={addServerHelper}
                        className="px-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-bold"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>

                  {/* Added alternative servers badge list */}
                  {alternativeServers.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {alternativeServers.map((srv, index) => (
                        <div key={index} className="flex items-center justify-between bg-black/40 p-2 rounded-lg text-[10px] text-gray-300">
                          <span className="truncate max-w-[150px]">{srv.name}</span>
                          <button
                            type="button"
                            onClick={() => removeServerHelper(index)}
                            className="text-red-500 hover:text-red-400"
                          >
                            حذف
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    id="submit-item-btn"
                    type="submit"
                    disabled={isSubmittingItem}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/15 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isSubmittingItem ? (
                      <Loader size={12} className="animate-spin" />
                    ) : (
                      <Save size={12} />
                    )}
                    <span>{isEditing ? 'حفظ التعديلات' : 'إضافة العرض'}</span>
                  </button>

                  {isEditing && (
                    <button
                      id="cancel-edit-btn"
                      type="button"
                      onClick={resetItemForm}
                      className="px-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all"
                    >
                      إلغاء
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Existing Items Table/List column */}
            <div className="lg:col-span-2 bg-[#13111c] border border-white/5 p-6 rounded-2xl h-fit">
              <h2 className="text-base font-extrabold text-white mb-4 border-b border-white/5 pb-3">العروض المضافة حالياً ({mediaItems.length})</h2>
              
              {mediaItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  لا توجد أفلام أو مسلسلات مضافة حالياً. ابدأ بإضافة أول عمل!
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[75vh] overflow-y-auto pr-1">
                  {mediaItems.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between gap-4 bg-[#1c1829] border border-white/5 p-3 rounded-xl hover:border-red-500/20 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="w-10 h-14 object-cover rounded-lg bg-[#272138] shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-white truncate max-w-[200px] md:max-w-xs">{item.title}</h3>
                          <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{item.description}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="px-1.5 py-0.5 bg-red-600/10 text-red-500 text-[9px] rounded-md font-bold">
                              {item.type === 'movie' ? 'فيلم' : 'مسلسل'}
                            </span>
                            <span className="text-[10px] text-yellow-500 font-bold">★ {item.rating}</span>
                            {item.alternativeServers && item.alternativeServers.length > 0 && (
                              <span className="text-[9px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded-md">
                                {item.alternativeServers.length} سيرفر بديل
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          id={`edit-item-btn-${item.id}`}
                          onClick={() => triggerEdit(item)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                          title="تعديل"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          id={`delete-item-btn-${item.id}`}
                          onClick={() => handleDeleteItem(item.id || '')}
                          className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                          title="حذف"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: Ads configuration panel */}
        {activeTab === 'ads' && (
          <div className="max-w-3xl mx-auto bg-[#13111c] border border-white/5 p-6 rounded-2xl">
            <div className="border-b border-white/5 pb-3 mb-6">
              <h2 className="text-base font-extrabold text-white">إدارة الإعلانات وتفعيل المonetization</h2>
              <p className="text-gray-400 text-xs mt-1">تتيح لك هذه اللوحة وضع رموز إعلانات البانر أو الـ Pop-under المربوطة بقاعدة البيانات.</p>
            </div>

            <form onSubmit={handleSaveAds} className="flex flex-col gap-6">
              {/* Section: Popunder ad */}
              <div className="border border-white/5 p-5 rounded-2xl bg-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-white">إعلانات النوافذ المنبثقة (Pop-under Ad Code)</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">سيتم فتح الإعلان تلقائياً فور ضغط الزائر على زر تشغيل الفيلم للمرة الأولى.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPopunderActive(!popunderActive)}
                    className="text-red-500"
                  >
                    {popunderActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-gray-600" />}
                  </button>
                </div>
                
                <textarea
                  id="textarea-popunder"
                  rows={3}
                  placeholder="ألصق كود الـ Pop-under هنا (مثال: رابط الإعلان أو كود سكريبت جافا سكريبت)"
                  value={popunderCode}
                  onChange={(e) => setPopunderCode(e.target.value)}
                  className="w-full bg-[#1c1829] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:border-red-500 outline-none text-right resize-none font-mono"
                />
              </div>

              {/* Section: Banner Above Video player */}
              <div className="border border-white/5 p-5 rounded-2xl bg-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-white">إعلان البانر العلوي (Banner Above Video Player)</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">يظهر مباشرة فوق مشغل الفيديو الرئيسي.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBannerAboveActive(!bannerAboveActive)}
                    className="text-red-500"
                  >
                    {bannerAboveActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-gray-600" />}
                  </button>
                </div>
                
                <textarea
                  id="textarea-banner-above"
                  rows={3}
                  placeholder="ألصق كود إعلان البانر العلوي HTML أو سكريبت الإعلان"
                  value={bannerAboveCode}
                  onChange={(e) => setBannerAboveCode(e.target.value)}
                  className="w-full bg-[#1c1829] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:border-red-500 outline-none text-right resize-none font-mono"
                />
              </div>

              {/* Section: Banner Below Video player */}
              <div className="border border-white/5 p-5 rounded-2xl bg-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-white">إعلان البانر السفلي (Banner Below Video Player)</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">يظهر مباشرة أسفل مشغل الفيديو الرئيسي وسيرفرات المشاهدة.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBannerBelowActive(!bannerBelowActive)}
                    className="text-red-500"
                  >
                    {bannerBelowActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-gray-600" />}
                  </button>
                </div>
                
                <textarea
                  id="textarea-banner-below"
                  rows={3}
                  placeholder="ألصق كود إعلان البانر السفلي HTML أو سكريبت الإعلان"
                  value={bannerBelowCode}
                  onChange={(e) => setBannerBelowCode(e.target.value)}
                  className="w-full bg-[#1c1829] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:border-red-500 outline-none text-right resize-none font-mono"
                />
              </div>

              <button
                id="submit-ads-btn"
                type="submit"
                disabled={isSubmittingAds}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/15 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmittingAds ? (
                  <Loader size={12} className="animate-spin" />
                ) : (
                  <Save size={12} />
                )}
                <span>حفظ وتفعيل الإعلانات</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: Maintenance Mode Configuration */}
        {activeTab === 'maintenance' && (
          <div className="max-w-2xl mx-auto bg-[#13111c] border border-white/5 p-6 rounded-2xl">
            <div className="border-b border-white/5 pb-3 mb-6">
              <h2 className="text-base font-extrabold text-white">وضع صيانة الموقع الرئيسي (Maintenance Mode)</h2>
              <p className="text-gray-400 text-xs mt-1">تفعيل هذا الخيار سيغلق واجهة العرض العامة للزوار ويوجههم لصفحة صيانة أنيقة، بينما تظل لوحة التحكم متاحة لك للتحديث والتحرير.</p>
            </div>

            <form onSubmit={handleSaveMaintenance} className="flex flex-col gap-4">
              <div className="flex items-center justify-between border border-white/5 p-5 rounded-2xl bg-white/5 mb-2">
                <div>
                  <h3 className="text-xs font-bold text-white">حالة وضع الصيانة حالياً</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {maintenanceActive ? 'الموقع مغلق للصيانة ومحمي حالياً' : 'الموقع متاح للجميع حالياً'}
                  </p>
                </div>
                <button
                  id="toggle-maintenance-btn"
                  type="button"
                  onClick={() => setMaintenanceActive(!maintenanceActive)}
                  className="text-red-500"
                >
                  {maintenanceActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-gray-600" />}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">رسالة الصيانة للزوار</label>
                <textarea
                  id="textarea-maintenance-message"
                  required
                  rows={4}
                  placeholder="الموقع يخضع لبعض التحديثات الدورية وسنعود للعمل خلال دقائق..."
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  className="w-full bg-[#1c1829] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:border-red-500 outline-none text-right resize-none"
                />
              </div>

              <button
                id="submit-maintenance-btn"
                type="submit"
                disabled={isSubmittingMaintenance}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/15 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                {isSubmittingMaintenance ? (
                  <Loader size={12} className="animate-spin" />
                ) : (
                  <Save size={12} />
                )}
                <span>حفظ وتعديل وضع الصيانة</span>
              </button>
            </form>
          </div>
        )}

      </main>

    </div>
  );
}
