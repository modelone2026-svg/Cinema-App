/// <reference types="vite/client" />
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { MediaItem, AdsConfig, MaintenanceConfig } from '../types';

// =========================================================================
// ⚙️ Google Drive + KVDB Sync Engine (100% Free & Unlimited)
// =========================================================================
const BUCKET_ID = "cinema_db_a4eb0635_824d_434d";
const KVDB_URL = `https://kvdb.io/${BUCKET_ID}/movies`;

// Indication that we are configured (always true since it's zero-config)
export const isSupabaseConfigured = true;

// In-memory access token cache (security constraint)
let cachedAccessToken: string | null = null;

// Standard seed movies for initial load
const SEED_DATA: MediaItem[] = [
  {
    title: "فيلم المارنز العظيم: بطل الصحراء",
    description: "قصة مشوقة عن بطل حرب يسعى لإنقاذ كتيبته العسكرية العالقة في قلب الصحراء الكبرى تحت ظروف مناخية صعبة وحصار عسكري محكم.",
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80",
    iframeUrl: "https://www.youtube.com/embed/sfM7_JLk-84",
    type: "movie",
    rating: 9.1,
    alternativeServers: [
      { name: "سيرفر الاحتياط 1", url: "https://www.youtube.com/embed/sfM7_JLk-84" },
      { name: "سيرفر سريع HD", url: "https://player.vimeo.com/video/502163294" }
    ]
  },
  {
    title: "مسلسل الأسرار الغامضة: مدينة المفقودين",
    description: "تدور الأحداث في بلدة صغيرة منعزلة، حيث يبدأ المحققون في تتبع خيوط جريمة اختفاء غامضة تقودهم إلى اكتشاف نفق سري قديم وتكنولوجيا مفقودة.",
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
    iframeUrl: "https://www.youtube.com/embed/sfM7_JLk-84",
    type: "series",
    rating: 8.8,
    alternativeServers: [
      { name: "سيرفر الدقة العالية", url: "https://player.vimeo.com/video/733979450" }
    ]
  },
  {
    title: "فيلم رحلة عبر الكون والزمن",
    description: "مغامرة علمية فريدة تأخذ رواد فضاء في رحلة مصيرية عبر ثقب أسود هائل بحثاً عن كوكب بديل لإنقاذ البشرية الآخذة في الفناء.",
    posterUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=500&auto=format&fit=crop&q=80",
    iframeUrl: "https://www.youtube.com/embed/sfM7_JLk-84",
    type: "movie",
    rating: 9.3,
    alternativeServers: []
  },
  {
    title: "مسلسل صراع الممالك والتنين الأحمر",
    description: "ملحمة درامية تاريخية خيالية عن ملوك وأمراء يتقاتلون في سبيل العرش الذهبي، بينما يهددهم خطر جليدي غامض قادم من أقصى الشمال البارد.",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
    iframeUrl: "https://www.youtube.com/embed/sfM7_JLk-84",
    type: "series",
    rating: 9.4,
    alternativeServers: [
      { name: "مشغل سريع 4K", url: "https://player.vimeo.com/video/502163294" }
    ]
  },
  {
    title: "فيلم هارب من العدالة",
    description: "مطاردة شرسة تخوضها أجهزة الأمن الفيدرالية للقبض على جراح شهير اتهم زيفاً بقتل زوجته، فيحاول إثبات براءته بكل الطرق الممكنة.",
    posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=80",
    iframeUrl: "https://www.youtube.com/embed/sfM7_JLk-84",
    type: "movie",
    rating: 8.5,
    alternativeServers: []
  }
];

const DEFAULT_ADS: AdsConfig = {
  popunderCode: "https://www.google.com",
  popunderActive: false,
  bannerAboveCode: "<div class='text-center text-xs text-gray-500 py-3 bg-[#13111c]/80 border border-white/5 rounded-xl'>مساحة إعلانية علوية مخصصة - يمكنك تعديلها من لوحة التحكم</div>",
  bannerAboveActive: true,
  bannerBelowCode: "<div class='text-center text-xs text-gray-500 py-3 bg-[#13111c]/80 border border-white/5 rounded-xl'>مساحة إعلانية سفلية مخصصة - يمكنك تعديلها من لوحة التحكم</div>",
  bannerBelowActive: true,
};

const DEFAULT_MAINTENANCE: MaintenanceConfig = {
  active: false,
  message: "الموقع في صيانة مؤقتة للتحديث والتحسينات، سنعود للعمل قريباً جداً!"
};

// ----------------- GOOGLE DRIVE API HELPERS -----------------

async function searchDriveFile(token: string): Promise<string | null> {
  try {
    const resp = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='cinema_db.json' and trashed=false&fields=files(id, name)`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  } catch (err) {
    console.error("Error searching file in Drive:", err);
  }
  return null;
}

async function uploadDriveFile(token: string, content: string, fileId?: string): Promise<string> {
  const metadata = {
    name: 'cinema_db.json',
    mimeType: 'application/json'
  };

  if (fileId) {
    const resp = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: content
      }
    );
    if (!resp.ok) throw new Error('Failed to update Google Drive file');
    return fileId;
  } else {
    const boundary = 'foo_bar_baz';
    const multipartBody = 
      `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}` +
      `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${content}` +
      `\r\n--${boundary}--`;

    const resp = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
      }
    );
    if (!resp.ok) throw new Error('Failed to create Google Drive file');
    const data = await resp.json();
    
    // Set file permission to public so anyone can view
    try {
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${data.id}/permissions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            role: 'reader',
            type: 'anyone'
          })
        }
      );
    } catch (e) {
      console.warn("Failed to set public permission:", e);
    }

    return data.id;
  }
}

// ----------------- LOCAL ENGINE INITIALIZER -----------------

// Load the complete DB state from memory / public store
let dbState = {
  items: SEED_DATA,
  ads: DEFAULT_ADS,
  maintenance: DEFAULT_MAINTENANCE
};

// Seed LocalStorage
if (!localStorage.getItem('cinema_items')) {
  localStorage.setItem('cinema_items', JSON.stringify(SEED_DATA));
}
if (!localStorage.getItem('cinema_config_ads')) {
  localStorage.setItem('cinema_config_ads', JSON.stringify(DEFAULT_ADS));
}
if (!localStorage.getItem('cinema_config_maintenance')) {
  localStorage.setItem('cinema_config_maintenance', JSON.stringify(DEFAULT_MAINTENANCE));
}

// Load cached state
try {
  const localItems = localStorage.getItem('cinema_items');
  const localAds = localStorage.getItem('cinema_config_ads');
  const localMaint = localStorage.getItem('cinema_config_maintenance');

  if (localItems) dbState.items = JSON.parse(localItems);
  if (localAds) dbState.ads = JSON.parse(localAds);
  if (localMaint) dbState.maintenance = JSON.parse(localMaint);
} catch (e) {
  console.error("Failed to parse local cached state:", e);
}

// Synchronize memory state to public KVDB + LocalStorage + Google Drive
async function syncAndSaveState() {
  // Update LocalStorage
  localStorage.setItem('cinema_items', JSON.stringify(dbState.items));
  localStorage.setItem('cinema_config_ads', JSON.stringify(dbState.ads));
  localStorage.setItem('cinema_config_maintenance', JSON.stringify(dbState.maintenance));

  const jsonString = JSON.stringify(dbState);

  // 1. Save to KVDB (Public Delivery Network)
  try {
    await fetch(KVDB_URL, {
      method: 'POST',
      body: jsonString
    });
    console.log("Successfully synchronized state to KVDB.");
  } catch (err) {
    console.warn("KVDB sync offline fallback:", err);
  }

  // 2. Save to Google Drive (if token is available)
  if (cachedAccessToken) {
    try {
      let fileId = localStorage.getItem('cinema_drive_file_id');
      if (!fileId) {
        fileId = await searchDriveFile(cachedAccessToken);
      }
      const savedId = await uploadDriveFile(cachedAccessToken, jsonString, fileId || undefined);
      localStorage.setItem('cinema_drive_file_id', savedId);
      console.log("Successfully synchronized state to Google Drive. File ID:", savedId);
    } catch (err) {
      console.error("Google Drive sync failed:", err);
    }
  }
}

// Load state from cloud on boot
export async function loadStateFromCloud() {
  try {
    const resp = await fetch(KVDB_URL);
    if (resp.ok) {
      const cloudData = await resp.json();
      if (cloudData && typeof cloudData === 'object') {
        if (Array.isArray(cloudData.items)) dbState.items = cloudData.items;
        if (cloudData.ads) dbState.ads = cloudData.ads;
        if (cloudData.maintenance) dbState.maintenance = cloudData.maintenance;

        // Save local copies
        localStorage.setItem('cinema_items', JSON.stringify(dbState.items));
        localStorage.setItem('cinema_config_ads', JSON.stringify(dbState.ads));
        localStorage.setItem('cinema_config_maintenance', JSON.stringify(dbState.maintenance));
        console.log("State loaded successfully from KVDB Cloud.");
        return;
      }
    }
  } catch (err) {
    console.warn("Could not load state from KVDB cloud, using local cache:", err);
  }
}

// Auth State Callback Management
type AuthCallback = (isAdmin: boolean) => void;
const authListeners = new Set<AuthCallback>();

function notifyAuthChange(isAdmin: boolean) {
  authListeners.forEach(listener => listener(isAdmin));
}

// ----------------- EXPORTED DATABASE ACTIONS -----------------

export async function dbGetItems(): Promise<MediaItem[]> {
  await loadStateFromCloud();
  return dbState.items;
}

export async function dbSaveItem(item: Omit<MediaItem, 'id'> & { id?: string }): Promise<MediaItem> {
  const savedItem: MediaItem = {
    ...item,
    id: item.id || `item-${Date.now()}`
  };

  if (item.id) {
    dbState.items = dbState.items.map(itm => itm.id === item.id ? savedItem : itm);
  } else {
    dbState.items = [savedItem, ...dbState.items];
  }

  await syncAndSaveState();
  return savedItem;
}

export async function dbDeleteItem(id: string): Promise<void> {
  dbState.items = dbState.items.filter(itm => itm.id !== id);
  await syncAndSaveState();
}

export async function dbGetAdsConfig(): Promise<AdsConfig> {
  return dbState.ads;
}

export async function dbSaveAdsConfig(config: AdsConfig): Promise<void> {
  dbState.ads = config;
  await syncAndSaveState();
}

export async function dbGetMaintenanceConfig(): Promise<MaintenanceConfig> {
  return dbState.maintenance;
}

export async function dbSaveMaintenanceConfig(config: MaintenanceConfig): Promise<void> {
  dbState.maintenance = config;
  await syncAndSaveState();
}

export async function dbTriggerManualRefreshAndSeed(): Promise<void> {
  dbState = {
    items: SEED_DATA,
    ads: DEFAULT_ADS,
    maintenance: DEFAULT_MAINTENANCE
  };
  await syncAndSaveState();
}

// ----------------- EXPORTED AUTH ACTIONS -----------------

export function subscribeToAuth(callback: AuthCallback) {
  authListeners.add(callback);
  
  // Initial check
  const initialLoggedIn = localStorage.getItem('cinema_admin_session_active') === 'true';
  callback(initialLoggedIn);

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    const isAdmin = !!(user && user.email === 'modelone2026@gmail.com');
    localStorage.setItem('cinema_admin_session_active', isAdmin ? 'true' : 'false');
    
    // If not logged in, clear access token
    if (!user) {
      cachedAccessToken = null;
    }
    notifyAuthChange(isAdmin);
  });

  return () => {
    authListeners.delete(callback);
    unsubscribe();
  };
}

export async function authLoginAdmin(email: string, password?: string): Promise<boolean> {
  // Support standard Email/Password simulation fallback or trigger GoogleAuthProvider
  if (email !== 'modelone2026@gmail.com') {
    throw new Error('عذراً! البريد الإلكتروني المدخل ليس بريد الأدمن المعتمد.');
  }

  // If password is provided, we can simulate or authenticate. But Google Sign-In is highly preferred!
  if (password && password === 'website2026') {
    localStorage.setItem('cinema_admin_session_active', 'true');
    notifyAuthChange(true);
    return true;
  }

  throw new Error('الرجاء استخدام زر تسجيل الدخول باستخدام حساب Google لتفعيل الربط التلقائي بـ Google Drive.');
}

// Google Sign In trigger with scopes
export async function authLoginWithGoogle(): Promise<boolean> {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive.file');

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (result.user.email !== 'modelone2026@gmail.com') {
      await signOut(auth);
      cachedAccessToken = null;
      localStorage.setItem('cinema_admin_session_active', 'false');
      notifyAuthChange(false);
      throw new Error('هذا الحساب ليس بريد الأدمن المعتمد: modelone2026@gmail.com');
    }

    cachedAccessToken = credential?.accessToken || null;
    localStorage.setItem('cinema_admin_session_active', 'true');
    notifyAuthChange(true);

    // Run first sync automatically
    await syncAndSaveState();
    return true;
  } catch (err: any) {
    console.error("Google login failed:", err);
    throw err;
  }
}

export async function authLogoutAdmin(): Promise<void> {
  await signOut(auth);
  cachedAccessToken = null;
  localStorage.setItem('cinema_admin_session_active', 'false');
  notifyAuthChange(false);
}
