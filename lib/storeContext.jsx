'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_USERS, INITIAL_ORDERS } from './initialData';
import { fetchSheetData, sendToGoogleAppsScript, fetchCloudDatabase } from './googleSheets';

const StoreContext = createContext(null);

const MONTH_MAP = {
  jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5,
  jul: 6, agu: 7, ags: 7, sep: 8, okt: 9, nov: 10, des: 11
};

export function getOrderTimestamp(order) {
  if (!order) return 0;
  if (order.createdAt) {
    const t = new Date(order.createdAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (order.date) {
    const match = String(order.date).match(/(\d+)\s+([a-zA-Z]+)\s+(\d{4})[,\s]+(\d+)[:.](\d+)/);
    if (match) {
      const [_, d, m, y, h, min] = match;
      const month = MONTH_MAP[m.toLowerCase().slice(0, 3)] ?? 0;
      return new Date(Number(y), month, Number(d), Number(h), Number(min)).getTime();
    }
    const t = new Date(order.date).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (order.timestamp && order.timestamp > 1000000000000) {
    return order.timestamp;
  }
  return 0;
}

export function sortOrdersEarliestFirst(orderList, rawOrders = []) {
  return [...orderList].sort((a, b) => {
    const timeA = getOrderTimestamp(a);
    const timeB = getOrderTimestamp(b);
    if (timeA !== timeB && timeA > 0 && timeB > 0) {
      return timeA - timeB; // Pesanan terdahulu (angka timestamp lebih kecil) tampil lebih awal
    }
    // Jika waktu sama persis (misal menit sama):
    // Pada rawOrders, pesanan yang dibuat lebih dulu berada di indeks yang lebih besar
    const indexA = rawOrders.findIndex((o) => o.invoiceId === a.invoiceId);
    const indexB = rawOrders.findIndex((o) => o.invoiceId === b.invoiceId);
    if (indexA !== -1 && indexB !== -1) {
      return indexB - indexA;
    }
    return (a.invoiceId || '').localeCompare(b.invoiceId || '');
  });
}

export function StoreProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  // User Authentication State
  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState(null);
  
  // UI States
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWaitingListOpen, setIsWaitingListOpen] = useState(false);
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState(null);

  // Tombstone helpers to prevent deleted products from being resurrected by cloud sync
  const getDeletedProductIds = () => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('aiyra_deleted_product_ids');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  };

  const markDeletedProductId = (id) => {
    if (!id || typeof window === 'undefined') return;
    try {
      const current = getDeletedProductIds();
      if (!current.includes(id)) {
        const updated = [...current, id];
        localStorage.setItem('aiyra_deleted_product_ids', JSON.stringify(updated));
      }
    } catch (e) {}
  };

  const unmarkDeletedProductId = (id) => {
    if (!id || typeof window === 'undefined') return;
    try {
      const current = getDeletedProductIds();
      const updated = current.filter((d) => d !== id);
      localStorage.setItem('aiyra_deleted_product_ids', JSON.stringify(updated));
    } catch (e) {}
  };

  // Load from LocalStorage on mount & Sync Sheet
  useEffect(() => {
    let currentSettings = INITIAL_SETTINGS;

    try {
      // Load products (filter out any deleted IDs)
      const deletedIds = getDeletedProductIds();
      const savedProducts = localStorage.getItem('aiyra_products');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        const withReseller = parsed
          .filter((p) => p && !deletedIds.includes(p.id))
          .map((p) => ({
            ...p,
            resellerPrice: p.resellerPrice !== undefined ? Number(p.resellerPrice) : Math.round((Number(p.price) || 0) * 0.85)
          }));
        setProducts(withReseller);
      } else {
        const initialFiltered = INITIAL_PRODUCTS.filter((p) => !deletedIds.includes(p.id));
        setProducts(initialFiltered);
        localStorage.setItem('aiyra_products', JSON.stringify(initialFiltered));
      }

      // Load cart
      const savedCart = localStorage.getItem('aiyra_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      // Load orders (sanitize timestamp by real order.date/createdAt)
      const savedOrders = localStorage.getItem('aiyra_orders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders)
          .filter((o) => o.invoiceId !== 'AYR-20261031-098' && o.invoiceId !== 'AYR-20261031-101')
          .map((o) => ({
            ...o,
            timestamp: getOrderTimestamp(o) || o.timestamp
          }));
        setOrders(parsedOrders);
        localStorage.setItem('aiyra_orders', JSON.stringify(parsedOrders));
      } else {
        setOrders([]);
        localStorage.setItem('aiyra_orders', JSON.stringify([]));
      }

      // Load settings
      const savedSettings = localStorage.getItem('aiyra_settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          currentSettings = {
            ...INITIAL_SETTINGS,
            ...parsed,
            googleScriptUrl: (parsed.googleScriptUrl && !parsed.googleScriptUrl.includes('AKfycbwNayax'))
              ? parsed.googleScriptUrl
              : (INITIAL_SETTINGS.googleScriptUrl || ''),
            spreadsheetId: parsed.spreadsheetId || INITIAL_SETTINGS.spreadsheetId || '',
            logoUrl: parsed.logoUrl !== undefined ? parsed.logoUrl : (INITIAL_SETTINGS.logoUrl || ''),
            bannerBadge: parsed.bannerBadge || INITIAL_SETTINGS.bannerBadge,
            bannerTitle: parsed.bannerTitle || INITIAL_SETTINGS.bannerTitle,
            bannerDesc: parsed.bannerDesc || INITIAL_SETTINGS.bannerDesc,
            bannerButtonText: parsed.bannerButtonText || INITIAL_SETTINGS.bannerButtonText,
            bannerFit: parsed.bannerFit || INITIAL_SETTINGS.bannerFit || 'full',
            bannerOverlay: parsed.bannerOverlay || INITIAL_SETTINGS.bannerOverlay || 'subtle',
            showBannerText: parsed.showBannerText !== undefined ? parsed.showBannerText : (INITIAL_SETTINGS.showBannerText !== undefined ? INITIAL_SETTINGS.showBannerText : true),
            bannerSlides: (parsed.bannerSlides && Array.isArray(parsed.bannerSlides) && parsed.bannerSlides.length > 0)
              ? parsed.bannerSlides
              : INITIAL_SETTINGS.bannerSlides
          };
          setSettings(currentSettings);
          try {
            localStorage.setItem('aiyra_settings', JSON.stringify(currentSettings));
          } catch (e) {}
        } catch (e) {
          console.error('Failed to parse settings', e);
          currentSettings = INITIAL_SETTINGS;
          setSettings(INITIAL_SETTINGS);
        }
      } else {
        localStorage.setItem('aiyra_settings', JSON.stringify(INITIAL_SETTINGS));
      }

      // Load registered users
      const savedUsers = localStorage.getItem('aiyra_users');
      if (savedUsers) {
        let parsedUsers = JSON.parse(savedUsers).map(u => ({
          ...u,
          role: u.role || 'user',
          status: u.status || 'approved'
        }));
        setUsers(parsedUsers);
        localStorage.setItem('aiyra_users', JSON.stringify(parsedUsers));
      } else {
        setUsers(INITIAL_USERS);
        localStorage.setItem('aiyra_users', JSON.stringify(INITIAL_USERS));
      }

      // Load active logged-in user
      const savedCurrentUser = localStorage.getItem('aiyra_current_user');
      if (savedCurrentUser) {
        const parsedCurrent = JSON.parse(savedCurrentUser);
        setCurrentUser({ ...parsedCurrent, role: parsedCurrent.role || 'user' });
      }

      // Load admin session
      const savedAdminAuth = sessionStorage.getItem('aiyra_admin_logged');
      if (savedAdminAuth === 'true') setIsAdmin(true);
    } catch (err) {
      console.error('Error loading data from localStorage', err);
    } finally {
      setIsLoaded(true);
    }

    // Attempt live sync with Google Sheet if configured
    if (currentSettings.spreadsheetId && currentSettings.syncWithSpreadsheet) {
      fetchSheetData('Produk', currentSettings.spreadsheetId).then((sheetProducts) => {
        if (sheetProducts && sheetProducts.length > 0) {
          const deletedIds = getDeletedProductIds();
          const cleanSheetProds = sheetProducts.filter((p) => p && !String(p.id || '').startsWith('cfg-') && !deletedIds.includes(String(p.id)));
          if (cleanSheetProds.length > 0) {
            setProducts((prev) => {
              const productMap = new Map();
              cleanSheetProds.forEach((p, idx) => {
                const prodId = p.id ? String(p.id) : `ck-sheet-${idx + 1}`;
                if (deletedIds.includes(prodId)) return;
                productMap.set(prodId, {
                  id: prodId,
                  name: p.name || 'Kue Tanpa Nama',
                  category: p.category || 'Klasik',
                  price: Number(p.price) || 0,
                  resellerPrice: p.resellerPrice !== undefined ? Number(p.resellerPrice) : Math.round((Number(p.price) || 0) * 0.85),
                  weight: p.weight || 'Toples 500gr',
                  badge: p.badge || '',
                  image: p.image || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80',
                  description: p.description || '',
                  isAvailable: p.isAvailable === true || p.isAvailable === 'TRUE' || p.isAvailable === 'true' || p.isAvailable === 1 || p.isAvailable === undefined
                });
              });
              // Hanya pertahankan produk lokal yang baru saja dibuat (< 45 detik)
              const recentLocal = prev.filter(
                (lp) => lp._createdAt && (Date.now() - lp._createdAt < 45000) && !productMap.has(lp.id)
              );
              const merged = [...recentLocal, ...Array.from(productMap.values())];
              try { localStorage.setItem('aiyra_products', JSON.stringify(merged)); } catch (e) {}
              return merged;
            });
          }
        }
      }).catch((e) => console.log('Spreadsheet Produk belum terisi, menggunakan katalog bawaan.'));
    }

    // Auto-sync Cloud Database (Orders & Users) for multi-device synchronization
    if (currentSettings.googleScriptUrl || currentSettings.spreadsheetId) {
      fetchCloudDatabase(currentSettings.googleScriptUrl, currentSettings.spreadsheetId).then((res) => {
        if (res && res.success) {
          if (res.orders && Array.isArray(res.orders) && res.orders.length > 0) {
            setOrders((prev) => {
              const map = new Map();
              prev.forEach((o) => o.invoiceId && map.set(o.invoiceId, o));
              res.orders.forEach((co) => {
                if (!co.invoiceId) return;
                const ex = map.get(co.invoiceId);
                map.set(co.invoiceId, ex ? { ...ex, ...co } : { ...co, timestamp: getOrderTimestamp(co) || Date.now() });
              });
              const sorted = sortOrdersEarliestFirst(Array.from(map.values()), Array.from(map.values()));
              try { localStorage.setItem('aiyra_orders', JSON.stringify(sorted)); } catch (e) {}
              return sorted;
            });
          }
          if (res.users && Array.isArray(res.users)) {
            setUsers(() => {
              const map = new Map();
              INITIAL_USERS.forEach((u) => {
                const k = (u.phone ? String(u.phone).replace(/[^0-9]/g, '') : '') || u.id;
                if (k) map.set(k, u);
              });
              res.users.forEach((cu) => {
                const k = (cu.phone ? String(cu.phone).replace(/[^0-9]/g, '') : '') || cu.id;
                if (!k) return;
                const ex = map.get(k);
                map.set(k, ex ? { ...ex, ...cu } : { ...cu, status: cu.status || 'approved', role: cu.role || 'user' });
              });
              const merged = Array.from(map.values());
              try { localStorage.setItem('aiyra_users', JSON.stringify(merged)); } catch (e) {}
              return merged;
            });
          }
          let incomingSettings = (res.settings && typeof res.settings === 'object') ? { ...res.settings } : {};
          if (res.products && Array.isArray(res.products)) {
            const cfg = res.products.find((p) => p.id === 'cfg-system-settings');
            if (cfg) {
              if (cfg.description) {
                try {
                  const parsed = JSON.parse(cfg.description);
                  incomingSettings = { ...incomingSettings, ...parsed };
                } catch (e) {}
              }
              if (!incomingSettings.adminPin && cfg.badge) {
                incomingSettings.adminPin = String(cfg.badge).trim();
              }
            }
          }

          if (Object.keys(incomingSettings).length > 0) {
            setSettings((prev) => {
              const localPinTime = prev._pinUpdatedAt || 0;
              const cloudPinTime = incomingSettings._pinUpdatedAt || 0;
              const isLocalPinNewer = localPinTime > 0 && localPinTime > cloudPinTime && (Date.now() - localPinTime < 60000);

              const mergedPin = isLocalPinNewer
                ? prev.adminPin
                : (incomingSettings.adminPin ? String(incomingSettings.adminPin).trim() : prev.adminPin);

              const merged = {
                ...prev,
                ...incomingSettings,
                adminPin: mergedPin,
                _pinUpdatedAt: isLocalPinNewer ? prev._pinUpdatedAt : (cloudPinTime || prev._pinUpdatedAt),
                bannerSlides: (Array.isArray(incomingSettings.bannerSlides) && incomingSettings.bannerSlides.length > 0)
                  ? incomingSettings.bannerSlides
                  : prev.bannerSlides
              };

              if (
                prev.adminPin === merged.adminPin &&
                prev.storeName === merged.storeName &&
                prev.adminWhatsApp === merged.adminWhatsApp &&
                prev.logoUrl === merged.logoUrl &&
                JSON.stringify(prev.bannerSlides) === JSON.stringify(merged.bannerSlides)
              ) {
                return prev;
              }

              try { localStorage.setItem('aiyra_settings', JSON.stringify(merged)); } catch (e) {}
              return merged;
            });
          }

          // Sync real products from Cloud Google Sheet on mount
          if (res.products && Array.isArray(res.products)) {
            const deletedIds = getDeletedProductIds();
            const cloudRealProds = res.products.filter(
              (p) => p && !String(p.id || '').startsWith('cfg-') && !deletedIds.includes(String(p.id))
            );
            if (cloudRealProds.length > 0) {
              setProducts((prev) => {
                const cloudFormatted = cloudRealProds.map((p, idx) => ({
                  id: p.id ? String(p.id) : `ck-sheet-${idx + 1}`,
                  name: p.name || 'Kue Tanpa Nama',
                  category: p.category || 'Klasik',
                  price: Number(p.price) || 0,
                  resellerPrice: p.resellerPrice !== undefined ? Number(p.resellerPrice) : Math.round((Number(p.price) || 0) * 0.85),
                  weight: p.weight || 'Toples 500gr',
                  badge: p.badge || '',
                  image: p.image || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80',
                  description: p.description || '',
                  isAvailable: p.isAvailable === true || p.isAvailable === 'TRUE' || p.isAvailable === 'true' || p.isAvailable === 1 || p.isAvailable === undefined
                }));
                const recentLocal = prev.filter(
                  (lp) => lp._createdAt && (Date.now() - lp._createdAt < 45000) && !cloudFormatted.some((cp) => cp.id === lp.id)
                );
                const finalProds = [...recentLocal, ...cloudFormatted];
                try { localStorage.setItem('aiyra_products', JSON.stringify(finalProds)); } catch (e) {}
                return finalProds;
              });
            }
          }

          const now = new Date();
          setLastCloudSyncTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        }
      }).catch((err) => console.log('Auto cloud sync skipped:', err));
    }
  }, []);

  // Real-time Background Auto-Polling (Multi-device synchronization every 12 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        const activeScriptUrl = settings.googleScriptUrl || INITIAL_SETTINGS.googleScriptUrl;
        const activeSheetId = settings.spreadsheetId || INITIAL_SETTINGS.spreadsheetId;
        if (activeScriptUrl || activeSheetId) {
          syncCloudData().catch(() => {});
        }
      }
    }, 12000);

    return () => clearInterval(timer);
  }, [settings.googleScriptUrl, settings.spreadsheetId]);

  // Helper to persist products (excludes internal system config records)
  const updateProductsState = (newProducts) => {
    const cleanProducts = Array.isArray(newProducts)
      ? newProducts.filter((p) => p && !String(p.id || '').startsWith('cfg-'))
      : [];
    setProducts(cleanProducts);
    try {
      localStorage.setItem('aiyra_products', JSON.stringify(cleanProducts));
    } catch (e) {
      console.error('Failed to save products', e);
    }
  };

  // Helper to persist cart
  const updateCartState = (newCart) => {
    setCart(newCart);
    try {
      localStorage.setItem('aiyra_cart', JSON.stringify(newCart));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  };

  // Helper to persist users
  const updateUsersState = (newUsers) => {
    setUsers(newUsers);
    try {
      localStorage.setItem('aiyra_users', JSON.stringify(newUsers));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  };

  // ================= GOOGLE SHEETS SYNC =================
  const syncFromGoogleSheets = async () => {
    setIsSyncingSheet(true);
    try {
      const sheetId = settings.spreadsheetId || '1qNF4XHN3vjB91rjluYgVLJRJMC971dgVsXsGIppB9wg';
      const sheetProducts = await fetchSheetData('Produk', sheetId);
      
      if (sheetProducts && sheetProducts.length > 0) {
        const cleanProducts = sheetProducts.filter((p) => p && !String(p.id || '').startsWith('cfg-'));
        const formatted = cleanProducts.map((p, idx) => ({
          id: p.id ? String(p.id) : `ck-sheet-${idx + 1}`,
          name: p.name || 'Kue Tanpa Nama',
          category: p.category || 'Klasik',
          price: Number(p.price) || 0,
          resellerPrice: p.resellerPrice !== undefined ? Number(p.resellerPrice) : Math.round((Number(p.price) || 0) * 0.85),
          weight: p.weight || 'Toples 500gr',
          badge: p.badge || '',
          image: p.image || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80',
          description: p.description || '',
          isAvailable: p.isAvailable === true || p.isAvailable === 'TRUE' || p.isAvailable === 'true' || p.isAvailable === 1 || p.isAvailable === undefined
        }));
        updateProductsState(formatted);
        return { success: true, count: formatted.length };
      } else {
        return {
          success: false,
          message: 'Sheet "Produk" masih kosong atau belum dibuat di Google Spreadsheet Anda.'
        };
      }
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setIsSyncingSheet(false);
    }
  };

  // ================= 2-WAY CLOUD SYNC (MULTI-DEVICE ORDERS & USERS) =================
  const syncCloudData = async () => {
    setIsSyncingCloud(true);
    try {
      const scriptUrl = settings.googleScriptUrl || INITIAL_SETTINGS.googleScriptUrl;
      const sheetId = settings.spreadsheetId || INITIAL_SETTINGS.spreadsheetId;
      const res = await fetchCloudDatabase(scriptUrl, sheetId);

      if (res && res.success) {
        let orderCount = 0;
        let userCount = 0;
        let syncedUsersList = null;

        // 1. Merge & Sync Orders
        if (res.orders && Array.isArray(res.orders)) {
          setOrders((prevOrders) => {
            const orderMap = new Map();
            prevOrders.forEach((o) => {
              if (o.invoiceId) orderMap.set(o.invoiceId, o);
            });

            res.orders.forEach((co) => {
              if (!co.invoiceId) return;
              const existing = orderMap.get(co.invoiceId);
              if (existing) {
                orderMap.set(co.invoiceId, {
                  ...existing,
                  ...co,
                  status: co.status || existing.status,
                  customer: {
                    ...existing.customer,
                    ...co.customer
                  },
                  totalPrice: Number(co.totalPrice) || existing.totalPrice,
                  itemsSummary: co.itemsSummary || existing.itemsSummary
                });
              } else {
                orderMap.set(co.invoiceId, {
                  ...co,
                  timestamp: getOrderTimestamp(co) || Date.now()
                });
              }
            });

            const mergedList = Array.from(orderMap.values());
            const sorted = sortOrdersEarliestFirst(mergedList, mergedList);
            try {
              localStorage.setItem('aiyra_orders', JSON.stringify(sorted));
            } catch (e) {}
            orderCount = sorted.length;
            return sorted;
          });
        }

        // 2. Merge & Sync Users (Google Sheets is the source of truth)
        if (res.users && Array.isArray(res.users)) {
          setUsers(() => {
            const userMap = new Map();
            INITIAL_USERS.forEach((u) => {
              const k = (u.phone ? String(u.phone).replace(/[^0-9]/g, '') : '') || u.id;
              if (k) userMap.set(k, u);
            });

            res.users.forEach((cu) => {
              const k = (cu.phone ? String(cu.phone).replace(/[^0-9]/g, '') : '') || cu.id;
              if (!k) return;
              const existing = userMap.get(k);
              userMap.set(k, existing ? { ...existing, ...cu } : { ...cu, status: cu.status || 'approved', role: cu.role || 'user' });
            });

            const mergedUsers = Array.from(userMap.values());
            syncedUsersList = mergedUsers;
            try {
              localStorage.setItem('aiyra_users', JSON.stringify(mergedUsers));
            } catch (e) {}
            userCount = mergedUsers.length;
            return mergedUsers;
          });
        }

        // 3. Extract & Merge System Settings (from cfg-system-settings or res.settings)
        let incomingSettings = (res.settings && typeof res.settings === 'object') ? { ...res.settings } : {};
        if (res.products && Array.isArray(res.products)) {
          const cfg = res.products.find((p) => p.id === 'cfg-system-settings');
          if (cfg) {
            if (cfg.description) {
              try {
                const parsed = JSON.parse(cfg.description);
                incomingSettings = { ...incomingSettings, ...parsed };
              } catch (e) {}
            }
            if (!incomingSettings.adminPin && cfg.badge) {
              incomingSettings.adminPin = String(cfg.badge).trim();
            }
          }
        }

        if (Object.keys(incomingSettings).length > 0) {
          setSettings((prev) => {
            const localPinTime = prev._pinUpdatedAt || 0;
            const cloudPinTime = incomingSettings._pinUpdatedAt || 0;
            const isLocalPinNewer = localPinTime > 0 && localPinTime > cloudPinTime && (Date.now() - localPinTime < 60000);

            const mergedPin = isLocalPinNewer
              ? prev.adminPin
              : (incomingSettings.adminPin ? String(incomingSettings.adminPin).trim() : prev.adminPin);

            const merged = {
              ...prev,
              ...incomingSettings,
              adminPin: mergedPin,
              _pinUpdatedAt: isLocalPinNewer ? prev._pinUpdatedAt : (cloudPinTime || prev._pinUpdatedAt),
              bannerSlides: (Array.isArray(incomingSettings.bannerSlides) && incomingSettings.bannerSlides.length > 0)
                ? incomingSettings.bannerSlides
                : prev.bannerSlides
            };

            if (
              prev.adminPin === merged.adminPin &&
              prev.storeName === merged.storeName &&
              prev.adminWhatsApp === merged.adminWhatsApp &&
              prev.logoUrl === merged.logoUrl &&
              JSON.stringify(prev.bannerSlides) === JSON.stringify(merged.bannerSlides)
            ) {
              return prev;
            }

            try { localStorage.setItem('aiyra_settings', JSON.stringify(merged)); } catch (e) {}
            return merged;
          });
        }

        // 4. Merge & Sync Real Products from Google Spreadsheet (excluding system config records & deleted tombstones)
        if (res.products && Array.isArray(res.products)) {
          const deletedIds = getDeletedProductIds();
          const cloudRealProds = res.products.filter(
            (p) => p && !String(p.id || '').startsWith('cfg-') && !deletedIds.includes(String(p.id))
          );

          if (cloudRealProds.length > 0) {
            setProducts((prev) => {
              const cloudFormatted = cloudRealProds.map((p, idx) => {
                const prodId = p.id ? String(p.id) : `ck-sheet-${idx + 1}`;
                return {
                  id: prodId,
                  name: p.name || 'Kue Tanpa Nama',
                  category: p.category || 'Klasik',
                  price: Number(p.price) || 0,
                  resellerPrice: p.resellerPrice !== undefined ? Number(p.resellerPrice) : Math.round((Number(p.price) || 0) * 0.85),
                  weight: p.weight || 'Toples 500gr',
                  badge: p.badge || '',
                  image: p.image || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80',
                  description: p.description || '',
                  isAvailable: p.isAvailable === true || p.isAvailable === 'TRUE' || p.isAvailable === 'true' || p.isAvailable === 1 || p.isAvailable === undefined
                };
              });

              // Jangan bangkitkan produk lama yang sudah dihapus dari Google Sheets!
              // Hanya pertahankan produk lokal yang baru saja ditambahkan admin dalam 45 detik terakhir
              const recentLocal = prev.filter(
                (lp) => lp._createdAt && (Date.now() - lp._createdAt < 45000) && !cloudFormatted.some((cp) => cp.id === lp.id)
              );

              const mergedList = [...recentLocal, ...cloudFormatted];
              try {
                localStorage.setItem('aiyra_products', JSON.stringify(mergedList));
              } catch (e) {}
              return mergedList;
            });
          }
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        setLastCloudSyncTime(timeStr);

        return {
          success: true,
          source: res.source,
          orderCount,
          userCount,
          time: timeStr,
          users: syncedUsersList
        };
      } else {
        return { success: false, message: res?.message || 'Gagal sinkron data cloud.' };
      }
    } catch (err) {
      console.error('[SyncCloudData] Error:', err);
      return { success: false, message: err.message };
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // ================= USER & RESELLER AUTHENTICATION =================
  const registerUser = ({ fullName, phone, password, address, role = 'user' }) => {
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    
    // Check if user already exists
    const existing = users.find(
      (u) => String(u.phone || '').replace(/[^0-9]/g, '') === cleanPhone
    );

    if (existing) {
      return {
        success: false,
        message: 'Nomor WhatsApp ini sudah terdaftar! Silakan langsung masuk (login).'
      };
    }

    const newUser = {
      id: 'usr-' + Date.now().toString(),
      fullName: fullName.trim(),
      phone: cleanPhone,
      password: password.trim(),
      address: address.trim(),
      role: role === 'reseller' ? 'reseller' : 'user',
      status: 'pending', // Menunggu persetujuan (approval) dari admin
      registeredAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    updateUsersState(updatedUsers);

    // Akun baru TIDAK langsung login, harus menunggu approval admin
    // Send to Google Spreadsheet Web App (if Script URL is set)
    const activeScriptUrl = settings.googleScriptUrl || INITIAL_SETTINGS.googleScriptUrl;
    if (activeScriptUrl) {
      sendToGoogleAppsScript(activeScriptUrl, {
        action: 'registerUser',
        ...newUser
      });
    }

    return {
      success: true,
      pendingApproval: true,
      message: 'Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan (Approval) dari Admin sebelum dapat masuk.',
      user: newUser
    };
  };

  const approveUser = (userId, roleOverride) => {
    const targetRole = roleOverride || 'user';
    const targetUser = users.find((u) => u.id === userId);
    const updated = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          status: 'approved',
          role: targetRole
        };
      }
      return u;
    });
    updateUsersState(updated);

    const activeScriptUrl = settings.googleScriptUrl || INITIAL_SETTINGS.googleScriptUrl;
    if (activeScriptUrl) {
      sendToGoogleAppsScript(activeScriptUrl, {
        action: 'updateUser',
        id: userId,
        phone: targetUser?.phone || '',
        status: 'approved',
        role: targetRole
      });
    }
  };

  const rejectUser = (userId) => {
    const targetUser = users.find((u) => u.id === userId);
    const updated = users.map((u) => (u.id === userId ? { ...u, status: 'rejected' } : u));
    updateUsersState(updated);
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(null);
      try {
        localStorage.removeItem('aiyra_current_user');
      } catch (e) {}
    }

    const activeScriptUrl = settings.googleScriptUrl || INITIAL_SETTINGS.googleScriptUrl;
    if (activeScriptUrl) {
      sendToGoogleAppsScript(activeScriptUrl, {
        action: 'updateUser',
        id: userId,
        phone: targetUser?.phone || '',
        status: 'rejected'
      });
    }
  };

  const updateUserRole = (userId, newRole) => {
    const targetUser = users.find((u) => u.id === userId);
    const updated = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    updateUsersState(updated);
    if (currentUser && currentUser.id === userId) {
      const updatedCurrent = { ...currentUser, role: newRole };
      setCurrentUser(updatedCurrent);
      try {
        localStorage.setItem('aiyra_current_user', JSON.stringify(updatedCurrent));
      } catch (e) {}
    }

    const activeScriptUrl = settings.googleScriptUrl || INITIAL_SETTINGS.googleScriptUrl;
    if (activeScriptUrl) {
      sendToGoogleAppsScript(activeScriptUrl, {
        action: 'updateUser',
        id: userId,
        phone: targetUser?.phone || '',
        role: newRole
      });
    }
  };

  const deleteUser = (userId) => {
    const targetUser = users.find((u) => u.id === userId);
    const updated = users.filter((u) => u.id !== userId);
    updateUsersState(updated);
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(null);
      try {
        localStorage.removeItem('aiyra_current_user');
      } catch (e) {}
    }

    const activeScriptUrl = settings.googleScriptUrl || INITIAL_SETTINGS.googleScriptUrl;
    if (activeScriptUrl) {
      sendToGoogleAppsScript(activeScriptUrl, {
        action: 'deleteUser',
        id: userId,
        phone: targetUser?.phone || ''
      });
    }
  };

  const loginUser = async (phoneOrName, password) => {
    const cleanInput = (phoneOrName || '').trim();
    const cleanDigits = cleanInput.replace(/[^0-9]/g, '');

    const checkMatch = (userList) => {
      if (!Array.isArray(userList)) return null;
      return userList.find((u) => {
        const uPhoneDigits = (u.phone || '').replace(/[^0-9]/g, '');
        const matchPhone = cleanDigits && uPhoneDigits === cleanDigits;
        const matchName = u.fullName && u.fullName.toLowerCase() === cleanInput.toLowerCase();
        return (matchPhone || matchName) && String(u.password).trim() === password.trim();
      });
    };

    let found = checkMatch(users);

    // If not found in local memory, sync from Cloud Google Spreadsheet automatically
    if (!found) {
      try {
        const syncRes = await syncCloudData();
        if (syncRes && Array.isArray(syncRes.users) && syncRes.users.length > 0) {
          found = checkMatch(syncRes.users);
        }
        if (!found) {
          let latestUsers = users;
          try {
            const stored = localStorage.getItem('aiyra_users');
            if (stored) latestUsers = JSON.parse(stored);
          } catch (e) {}
          found = checkMatch(latestUsers);
        }
      } catch (err) {
        console.warn('Cloud login lookup failed:', err);
      }
    }

    if (found) {
      const userStatus = found.status || 'approved';

      if (userStatus === 'pending') {
        return {
          success: false,
          pendingApproval: true,
          message: 'Akun Anda masih Menunggu Persetujuan (Approval) dari Admin. Silakan hubungi Admin toko untuk verifikasi akun Anda.'
        };
      }

      if (userStatus === 'rejected') {
        return {
          success: false,
          message: 'Pendaftaran akun Anda tidak disetujui oleh Admin. Silakan hubungi Admin toko untuk informasi lebih lanjut.'
        };
      }

      const userWithRole = { ...found, role: found.role || 'user', status: 'approved' };
      setCurrentUser(userWithRole);
      try {
        localStorage.setItem('aiyra_current_user', JSON.stringify(userWithRole));
      } catch (e) {}
      return { success: true, user: userWithRole };
    }

    return {
      success: false,
      message: 'Nomor WhatsApp atau password salah. Silakan coba lagi.'
    };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('aiyra_current_user');
    } catch (e) {}
  };

  // ================= ADMIN PRODUCT MANAGEMENT =================
  const addProduct = async (productData) => {
    const priceNum = Number(productData.price) || 0;
    const resellerNum = productData.resellerPrice !== undefined && productData.resellerPrice !== ''
      ? Number(productData.resellerPrice)
      : Math.round(priceNum * 0.85);

    const newProduct = {
      id: productData.id || ('ck-' + Date.now().toString().slice(-6)),
      isAvailable: true,
      ...productData,
      price: priceNum,
      resellerPrice: resellerNum,
      _createdAt: Date.now()
    };

    unmarkDeletedProductId(newProduct.id);
    const updated = [newProduct, ...products.filter((p) => p.id !== newProduct.id)];
    updateProductsState(updated);

    // Sync to Google Spreadsheet tab "Produk"
    const officialFallbackUrl = 'https://script.google.com/macros/s/AKfycbx0h4DMFI456YCncZMluMYKrYIa3mSSkasWgnqtgH5KaZGQfi9Q-JSRZ8za3hf72t6Rbw/exec';
    const activeScriptUrl = (settings.googleScriptUrl && settings.googleScriptUrl.startsWith('https://script.google.com'))
      ? settings.googleScriptUrl
      : (INITIAL_SETTINGS.googleScriptUrl || officialFallbackUrl);

    if (activeScriptUrl) {
      try {
        const res = await sendToGoogleAppsScript(activeScriptUrl, {
          action: 'saveProduct',
          ...newProduct
        });
        return { success: true, product: newProduct, cloudRes: res };
      } catch (err) {
        console.error('Error saving product to cloud:', err);
        return { success: false, product: newProduct, error: err.message };
      }
    }

    return { success: true, product: newProduct };
  };

  const updateProduct = async (id, updatedFields) => {
    let savedProd = null;
    const updated = products.map((p) => {
      if (p.id === id) {
        const newPrice = Number(updatedFields.price !== undefined ? updatedFields.price : p.price) || 0;
        const newResellerPrice = updatedFields.resellerPrice !== undefined && updatedFields.resellerPrice !== ''
          ? Number(updatedFields.resellerPrice)
          : (p.resellerPrice !== undefined ? Number(p.resellerPrice) : Math.round(newPrice * 0.85));

        savedProd = {
          ...p,
          ...updatedFields,
          price: newPrice,
          resellerPrice: newResellerPrice
        };
        return savedProd;
      }
      return p;
    });
    updateProductsState(updated);

    const officialFallbackUrl = 'https://script.google.com/macros/s/AKfycbx0h4DMFI456YCncZMluMYKrYIa3mSSkasWgnqtgH5KaZGQfi9Q-JSRZ8za3hf72t6Rbw/exec';
    const activeScriptUrl = (settings.googleScriptUrl && settings.googleScriptUrl.startsWith('https://script.google.com'))
      ? settings.googleScriptUrl
      : (INITIAL_SETTINGS.googleScriptUrl || officialFallbackUrl);

    if (activeScriptUrl && savedProd) {
      try {
        const res = await sendToGoogleAppsScript(activeScriptUrl, {
          action: 'saveProduct',
          ...savedProd
        });
        return { success: true, product: savedProd, cloudRes: res };
      } catch (err) {
        console.error('Error updating product in cloud:', err);
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  const deleteProduct = async (id, productName = '') => {
    markDeletedProductId(id);
    const targetProd = products.find((p) => p.id === id);
    const prodName = productName || targetProd?.name || '';
    const updated = products.filter((p) => p.id !== id);
    updateProductsState(updated);
    const updatedCart = cart.filter((item) => item.product?.id !== id);
    updateCartState(updatedCart);

    const officialFallbackUrl = 'https://script.google.com/macros/s/AKfycbx0h4DMFI456YCncZMluMYKrYIa3mSSkasWgnqtgH5KaZGQfi9Q-JSRZ8za3hf72t6Rbw/exec';
    const activeScriptUrl = (settings.googleScriptUrl && settings.googleScriptUrl.startsWith('https://script.google.com'))
      ? settings.googleScriptUrl
      : (INITIAL_SETTINGS.googleScriptUrl || officialFallbackUrl);

    if (activeScriptUrl) {
      try {
        const res = await sendToGoogleAppsScript(activeScriptUrl, {
          action: 'deleteProduct',
          id: id,
          name: prodName
        });
        return { success: true, cloudRes: res };
      } catch (err) {
        console.error('Error deleting product from cloud:', err);
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  const toggleProductAvailability = async (id) => {
    let targetAvail = true;
    const updated = products.map((p) => {
      if (p.id === id) {
        targetAvail = !p.isAvailable;
        return { ...p, isAvailable: targetAvail };
      }
      return p;
    });
    updateProductsState(updated);

    const officialFallbackUrl = 'https://script.google.com/macros/s/AKfycbx0h4DMFI456YCncZMluMYKrYIa3mSSkasWgnqtgH5KaZGQfi9Q-JSRZ8za3hf72t6Rbw/exec';
    const activeScriptUrl = (settings.googleScriptUrl && settings.googleScriptUrl.startsWith('https://script.google.com'))
      ? settings.googleScriptUrl
      : (INITIAL_SETTINGS.googleScriptUrl || officialFallbackUrl);

    if (activeScriptUrl) {
      try {
        await sendToGoogleAppsScript(activeScriptUrl, {
          action: 'toggleProduct',
          id,
          isAvailable: targetAvail
        });
      } catch (e) {}
    }
  };

  const resetProductsToDefault = () => {
    try {
      localStorage.removeItem('aiyra_deleted_product_ids');
    } catch (e) {}
    updateProductsState(INITIAL_PRODUCTS);
  };

  // ================= CART MANAGEMENT =================
  const addToCart = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !product.isAvailable) return;

    const existingIndex = cart.findIndex((item) => item.product.id === productId);
    let newCart = [...cart];

    if (existingIndex > -1) {
      newCart[existingIndex].qty += 1;
    } else {
      newCart.push({ product, qty: 1 });
    }

    updateCartState(newCart);
  };

  const updateCartQty = (productId, delta) => {
    const existingIndex = cart.findIndex((item) => item.product.id === productId);
    if (existingIndex === -1) return;

    let newCart = [...cart];
    newCart[existingIndex].qty += delta;

    if (newCart[existingIndex].qty <= 0) {
      newCart.splice(existingIndex, 1);
    }

    updateCartState(newCart);
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter((item) => item.product.id !== productId);
    updateCartState(newCart);
  };

  const clearCart = () => {
    updateCartState([]);
  };

  // ================= ORDERS & WAITING LIST MANAGEMENT =================
  const addOrder = (orderData) => {
    const now = new Date();
    // Default new order status is 'Waiting List'
    const formattedOrder = {
      ...orderData,
      status: orderData.status || 'Waiting List',
      createdAt: orderData.createdAt || now.toISOString(),
      timestamp: orderData.timestamp || now.getTime()
    };

    const newOrders = [formattedOrder, ...orders];
    setOrders(newOrders);
    try {
      localStorage.setItem('aiyra_orders', JSON.stringify(newOrders));
    } catch (e) {
      console.error('Failed to save orders', e);
    }

    // Send order to Google Spreadsheet Web App (if Script URL is set)
    if (settings.googleScriptUrl) {
      sendToGoogleAppsScript(settings.googleScriptUrl, {
        action: 'saveOrder',
        invoiceId: formattedOrder.invoiceId,
        date: formattedOrder.date,
        customerName: formattedOrder.customer?.name || '-',
        customerPhone: formattedOrder.customer?.phone || '-',
        address: formattedOrder.customer?.address || '-',
        itemsSummary: formattedOrder.items?.map(it => `${it.name} (${it.qty}x)`).join(', ') || '-',
        totalPrice: formattedOrder.totalPrice || 0,
        status: formattedOrder.status
      });
    }
  };

  // Admin Approval Action: Update Status (e.g. 'Waiting List' -> 'Disetujui' / 'Selesai' / 'Dibatalkan')
  const updateOrderStatus = (invoiceId, newStatus) => {
    const updated = orders.map((o) => (o.invoiceId === invoiceId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    try {
      localStorage.setItem('aiyra_orders', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update order status', e);
    }

    // Sync status change to Google Spreadsheet Web App
    if (settings.googleScriptUrl) {
      sendToGoogleAppsScript(settings.googleScriptUrl, {
        action: 'updateOrderStatus',
        invoiceId,
        status: newStatus
      });
    }
  };

  // Update Order Details (Items, Qty, Price, Address, etc.)
  const updateOrder = (invoiceId, updatedFields) => {
    const updated = orders.map((o) => {
      if (o.invoiceId === invoiceId) {
        const merged = { ...o, ...updatedFields };
        if (updatedFields.items) {
          const totalQty = updatedFields.items.reduce((s, it) => s + (Number(it.qty) || 0), 0);
          const totalPrice = updatedFields.items.reduce((s, it) => s + ((Number(it.price) || 0) * (Number(it.qty) || 0)), 0);
          const itemsSummary = updatedFields.items.map((it) => `${it.name} (${it.qty}x)`).join(', ');
          merged.totalQty = totalQty;
          merged.totalPrice = totalPrice;
          merged.itemsSummary = itemsSummary;
        }
        return merged;
      }
      return o;
    });

    setOrders(updated);
    try {
      localStorage.setItem('aiyra_orders', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update order', e);
    }

    // Sync updated order to Google Spreadsheet Web App (if Script URL is set)
    if (settings.googleScriptUrl) {
      const target = updated.find((o) => o.invoiceId === invoiceId);
      if (target) {
        sendToGoogleAppsScript(settings.googleScriptUrl, {
          action: 'updateOrderDetails',
          invoiceId,
          itemsSummary: target.itemsSummary,
          totalPrice: target.totalPrice,
          address: target.customer?.address || '-'
        });
      }
    }
  };

  const clearOrders = () => {
    setOrders([]);
    try {
      localStorage.removeItem('aiyra_orders');
    } catch (e) {
      console.error('Failed to clear orders', e);
    }
  };

  const deleteOrder = (invoiceId) => {
    const updated = orders.filter((o) => o.invoiceId !== invoiceId);
    setOrders(updated);
    try {
      localStorage.setItem('aiyra_orders', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete order', e);
    }

    if (settings.googleScriptUrl) {
      sendToGoogleAppsScript(settings.googleScriptUrl, {
        action: 'deleteOrder',
        invoiceId
      });
    }
  };

  const reorder = (order) => {
    let newCart = [...cart];
    order.items.forEach((orderItem) => {
      const liveProduct = products.find((p) => p.id === orderItem.id) || {
        id: orderItem.id,
        name: orderItem.name,
        price: orderItem.price,
        image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80',
        weight: '500gr',
        category: 'Klasik',
        isAvailable: true
      };

      const existingIndex = newCart.findIndex((c) => c.product.id === liveProduct.id);
      if (existingIndex > -1) {
        newCart[existingIndex].qty += orderItem.qty;
      } else {
        newCart.push({ product: liveProduct, qty: orderItem.qty });
      }
    });

    updateCartState(newCart);
    setIsHistoryOpen(false);
    setIsWaitingListOpen(false);
    setIsCartOpen(true);
  };

  // ================= SETTINGS & ADMIN AUTH =================
  const updateSettings = async (newSettings) => {
    const now = Date.now();
    const isPinChanged = newSettings.adminPin !== undefined && String(newSettings.adminPin).trim() !== String(settings.adminPin).trim();
    const merged = {
      ...settings,
      ...newSettings,
      _updatedAt: now,
      _pinUpdatedAt: isPinChanged ? now : (settings._pinUpdatedAt || now)
    };
    setSettings(merged);
    try {
      localStorage.setItem('aiyra_settings', JSON.stringify(merged));
    } catch (e) {
      console.error('Failed to save settings', e);
    }

    // Cloud Sync: Kirim ke Google Apps Script agar tersinkronisasi ke seluruh perangkat lain
    const officialFallbackUrl = 'https://script.google.com/macros/s/AKfycbx0h4DMFI456YCncZMluMYKrYIa3mSSkasWgnqtgH5KaZGQfi9Q-JSRZ8za3hf72t6Rbw/exec';
    const activeScriptUrl = (merged.googleScriptUrl && merged.googleScriptUrl.startsWith('https://script.google.com'))
      ? merged.googleScriptUrl
      : (settings.googleScriptUrl && settings.googleScriptUrl.startsWith('https://script.google.com')
        ? settings.googleScriptUrl
        : (INITIAL_SETTINGS.googleScriptUrl || officialFallbackUrl));

    if (activeScriptUrl) {
      // Sanitize config payload to prevent exceeding Google Sheets cell limit (50k chars)
      const sanitizedLogoUrl = (merged.logoUrl && merged.logoUrl.startsWith('data:')) ? '' : (merged.logoUrl || '');
      const sanitizedBannerSlides = Array.isArray(merged.bannerSlides)
        ? merged.bannerSlides.map((s) => ({
            ...s,
            image: (s.image && s.image.startsWith('data:')) ? '' : (s.image || '')
          }))
        : [];

      const configPayload = {
        adminPin: String(merged.adminPin || '123456'),
        _pinUpdatedAt: merged._pinUpdatedAt || Date.now(),
        bannerSlides: sanitizedBannerSlides,
        bannerTitle: merged.bannerTitle || '',
        bannerDesc: merged.bannerDesc || '',
        bannerBadge: merged.bannerBadge || '',
        bannerButtonText: merged.bannerButtonText || '',
        logoUrl: sanitizedLogoUrl,
        storeName: merged.storeName || '',
        storeTagline: merged.storeTagline || '',
        adminWhatsApp: merged.adminWhatsApp || ''
      };

      try {
        // Simpan langsung ke sheet Produk via cfg-system-settings (bekerja langsung 100% pada Apps Script user)
        const res = await sendToGoogleAppsScript(activeScriptUrl, {
          action: 'saveProduct',
          id: 'cfg-system-settings',
          name: 'SYSTEM_SETTINGS',
          category: 'Sistem',
          price: 0,
          weight: 'Config',
          badge: String(merged.adminPin || '123456'),
          image: '',
          description: JSON.stringify(configPayload),
          isAvailable: false
        });

        // Juga kirim ke saveSettings untuk versi baru Apps Script jika ada
        sendToGoogleAppsScript(activeScriptUrl, {
          action: 'saveSettings',
          settings: configPayload
        }).catch(() => {});

        return res || { success: true };
      } catch (err) {
        console.error('Error saving settings to cloud:', err);
        return { success: false, message: err.message };
      }
    }
    return { success: true };
  };

  const loginAdmin = async (pin) => {
    const inputPin = String(pin || '').trim();
    if (!inputPin) return false;

    let validPin = String(settings.adminPin || '123456').trim();

    // Selalu periksa dan sinkronkan dengan database cloud untuk memastikan PIN multi-device akurat
    try {
      const scriptUrl = settings.googleScriptUrl || INITIAL_SETTINGS.googleScriptUrl;
      const sheetId = settings.spreadsheetId || INITIAL_SETTINGS.spreadsheetId;
      const res = await fetchCloudDatabase(scriptUrl, sheetId);

      if (res && res.success) {
        let cloudPin = null;
        let cloudConfig = null;

        // 1. Cek dari tab Settings (jika script baru sudah dideploy)
        if (res.settings && res.settings.adminPin) {
          cloudPin = String(res.settings.adminPin).trim();
          cloudConfig = res.settings;
        }

        // 2. Cek dari cfg-system-settings di tab Produk (bekerja langsung pada script yang sedang aktif)
        if (res.products && Array.isArray(res.products)) {
          const cfg = res.products.find((p) => p.id === 'cfg-system-settings');
          if (cfg) {
            if (cfg.description) {
              try {
                const parsed = JSON.parse(cfg.description);
                if (parsed.adminPin) cloudPin = String(parsed.adminPin).trim();
                cloudConfig = { ...(cloudConfig || {}), ...parsed };
              } catch (e) {}
            }
            if (!cloudPin && cfg.badge) {
              cloudPin = String(cfg.badge).trim();
            }
          }
        }

        if (cloudPin) {
          validPin = cloudPin;
          const updated = {
            ...settings,
            ...(cloudConfig || {}),
            adminPin: validPin
          };
          setSettings(updated);
          try {
            localStorage.setItem('aiyra_settings', JSON.stringify(updated));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Cloud PIN check fallback to local:', err);
    }

    if (inputPin === validPin) {
      setIsAdmin(true);
      try {
        sessionStorage.setItem('aiyra_admin_logged', 'true');
      } catch (e) {}
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    try {
      sessionStorage.removeItem('aiyra_admin_logged');
    } catch (e) {}
  };

  // Helper: Get product price based on user role (Customer vs Reseller)
  const getProductPrice = (product) => {
    if (!product) return 0;
    if (currentUser?.role === 'reseller') {
      return Number(product.resellerPrice) || Math.round((Number(product.price) || 0) * 0.85);
    }
    return Number(product.price) || 0;
  };

  // Format IDR Helper
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(number || 0);
  };

  // Calculated Cart Totals
  const cartTotalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + item.qty * getProductPrice(item.product), 0);
  const waitingListCount = orders.filter((o) => o.status === 'Waiting List').length;
  const isReseller = currentUser?.role === 'reseller';

  return (
    <StoreContext.Provider
      value={{
        isLoaded,
        products,
        cart,
        orders,
        settings,
        users,
        currentUser,
        isAdmin,
        isReseller,
        isCartOpen,
        isHistoryOpen,
        isWaitingListOpen,
        isSyncingSheet,
        isSyncingCloud,
        lastCloudSyncTime,
        cartTotalQty,
        cartTotalPrice,
        waitingListCount,
        setIsCartOpen,
        setIsHistoryOpen,
        setIsWaitingListOpen,
        formatRupiah,
        getProductPrice,
        sortOrdersEarliestFirst,
        // Google Sheets & Cloud Sync
        syncFromGoogleSheets,
        syncCloudData,
        // User Auth Actions
        registerUser,
        approveUser,
        rejectUser,
        updateUserRole,
        deleteUser,
        loginUser,
        logoutUser,
        // Product Actions
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailability,
        resetProductsToDefault,
        // Cart Actions
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        // Orders & Waiting List Actions
        addOrder,
        updateOrderStatus,
        updateOrder,
        deleteOrder,
        clearOrders,
        reorder,
        // Settings & Auth
        updateSettings,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
