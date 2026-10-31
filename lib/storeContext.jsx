'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_USERS, INITIAL_ORDERS } from './initialData';
import { fetchSheetData, sendToGoogleAppsScript } from './googleSheets';

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

  // Load from LocalStorage on mount & Sync Sheet
  useEffect(() => {
    let currentSettings = INITIAL_SETTINGS;

    try {
      // Load products
      const savedProducts = localStorage.getItem('aiyra_products');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        const withReseller = parsed.map(p => ({
          ...p,
          resellerPrice: p.resellerPrice !== undefined ? Number(p.resellerPrice) : Math.round((Number(p.price) || 0) * 0.85)
        }));
        setProducts(withReseller);
      } else {
        localStorage.setItem('aiyra_products', JSON.stringify(INITIAL_PRODUCTS));
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
        currentSettings = { ...INITIAL_SETTINGS, ...JSON.parse(savedSettings) };
        setSettings(currentSettings);
      } else {
        localStorage.setItem('aiyra_settings', JSON.stringify(INITIAL_SETTINGS));
      }

      // Load registered users
      const savedUsers = localStorage.getItem('aiyra_users');
      if (savedUsers) {
        let parsedUsers = JSON.parse(savedUsers).map(u => ({
          ...u,
          role: u.role || 'user'
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
          const formatted = sheetProducts.map((p, idx) => ({
            id: p.id ? String(p.id) : `ck-sheet-${idx + 1}`,
            name: p.name || 'Kue Tanpa Nama',
            category: p.category || 'Klasik',
            price: Number(p.price) || 0,
            weight: p.weight || 'Toples 500gr',
            badge: p.badge || '',
            image: p.image || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80',
            description: p.description || '',
            isAvailable: p.isAvailable === true || p.isAvailable === 'TRUE' || p.isAvailable === 'true' || p.isAvailable === 1 || p.isAvailable === undefined
          }));
          updateProductsState(formatted);
        }
      }).catch((e) => console.log('Spreadsheet Produk belum terisi, menggunakan katalog bawaan.'));
    }
  }, []);

  // Helper to persist products
  const updateProductsState = (newProducts) => {
    setProducts(newProducts);
    try {
      localStorage.setItem('aiyra_products', JSON.stringify(newProducts));
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
        const formatted = sheetProducts.map((p, idx) => ({
          id: p.id ? String(p.id) : `ck-sheet-${idx + 1}`,
          name: p.name || 'Kue Tanpa Nama',
          category: p.category || 'Klasik',
          price: Number(p.price) || 0,
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

  // ================= USER & RESELLER AUTHENTICATION =================
  const registerUser = async ({ fullName, phone, password, address, role = 'user' }) => {
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    
    // Check if user already exists
    const existing = users.find(
      (u) => u.phone.replace(/[^0-9]/g, '') === cleanPhone
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
      registeredAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    updateUsersState(updatedUsers);

    // Auto login registered user
    setCurrentUser(newUser);
    try {
      localStorage.setItem('aiyra_current_user', JSON.stringify(newUser));
    } catch (e) {}

    // Send to Google Spreadsheet Web App (if Script URL is set)
    if (settings.googleScriptUrl) {
      sendToGoogleAppsScript(settings.googleScriptUrl, {
        action: 'registerUser',
        ...newUser
      });
    }

    return { success: true, user: newUser };
  };

  const updateUserRole = (userId, newRole) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    updateUsersState(updated);
    if (currentUser && currentUser.id === userId) {
      const updatedCurrent = { ...currentUser, role: newRole };
      setCurrentUser(updatedCurrent);
      try {
        localStorage.setItem('aiyra_current_user', JSON.stringify(updatedCurrent));
      } catch (e) {}
    }
  };

  const deleteUser = (userId) => {
    const updated = users.filter((u) => u.id !== userId);
    updateUsersState(updated);
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(null);
      try {
        localStorage.removeItem('aiyra_current_user');
      } catch (e) {}
    }
  };

  const loginUser = (phoneOrName, password) => {
    const cleanInput = phoneOrName.trim();
    const cleanDigits = cleanInput.replace(/[^0-9]/g, '');

    const found = users.find((u) => {
      const matchPhone = cleanDigits && u.phone.replace(/[^0-9]/g, '') === cleanDigits;
      const matchName = u.fullName.toLowerCase() === cleanInput.toLowerCase();
      return (matchPhone || matchName) && u.password === password.trim();
    });

    if (found) {
      const userWithRole = { ...found, role: found.role || 'user' };
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
  const addProduct = (productData) => {
    const priceNum = Number(productData.price) || 0;
    const resellerNum = productData.resellerPrice !== undefined && productData.resellerPrice !== ''
      ? Number(productData.resellerPrice)
      : Math.round(priceNum * 0.85);

    const newProduct = {
      id: 'ck-' + Date.now().toString().slice(-6),
      isAvailable: true,
      ...productData,
      price: priceNum,
      resellerPrice: resellerNum
    };
    const updated = [newProduct, ...products];
    updateProductsState(updated);
    return newProduct;
  };

  const updateProduct = (id, updatedFields) => {
    const updated = products.map((p) => {
      if (p.id === id) {
        const newPrice = Number(updatedFields.price !== undefined ? updatedFields.price : p.price) || 0;
        const newResellerPrice = updatedFields.resellerPrice !== undefined && updatedFields.resellerPrice !== ''
          ? Number(updatedFields.resellerPrice)
          : (p.resellerPrice !== undefined ? Number(p.resellerPrice) : Math.round(newPrice * 0.85));

        return {
          ...p,
          ...updatedFields,
          price: newPrice,
          resellerPrice: newResellerPrice
        };
      }
      return p;
    });
    updateProductsState(updated);
  };

  const deleteProduct = (id) => {
    const updated = products.filter((p) => p.id !== id);
    updateProductsState(updated);
    const updatedCart = cart.filter((item) => item.product.id !== id);
    updateCartState(updatedCart);
  };

  const toggleProductAvailability = (id) => {
    const updated = products.map((p) => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p));
    updateProductsState(updated);
  };

  const resetProductsToDefault = () => {
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
  const updateSettings = (newSettings) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    try {
      localStorage.setItem('aiyra_settings', JSON.stringify(merged));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  const loginAdmin = (pin) => {
    const validPin = (settings.adminPin && settings.adminPin.trim()) || '123456';
    if (pin && pin.trim() === validPin) {
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
        cartTotalQty,
        cartTotalPrice,
        waitingListCount,
        setIsCartOpen,
        setIsHistoryOpen,
        setIsWaitingListOpen,
        formatRupiah,
        getProductPrice,
        sortOrdersEarliestFirst,
        // Google Sheets Sync
        syncFromGoogleSheets,
        // User Auth Actions
        registerUser,
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
