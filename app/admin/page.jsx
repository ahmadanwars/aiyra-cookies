'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../../lib/storeContext';
import AdminProductModal from '../../components/AdminProductModal';
import EditOrderModal from '../../components/EditOrderModal';
import BannerSlideModal from '../../components/BannerSlideModal';
import ProductManagement from '../../components/admin/ProductManagement';
import OrderManagement from '../../components/admin/OrderManagement';
import UserManagement from '../../components/admin/UserManagement';
import SettingsTab from '../../components/admin/SettingsTab';
import {
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  RefreshCw,
  Hourglass,
  CheckCircle2,
  Users,
  Package,
  Layers,
  Cookie
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const {
    products,
    orders,
    settings,
    users,
    isAdmin,
    loginAdmin,
    addProduct,
    updateProduct,
    syncCloudData,
    isSyncingCloud,
    lastCloudSyncTime
  } = useStore();

  // Login PIN state
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);

  // Toast notification state
  const [approvalToast, setApprovalToast] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Handle PIN Login (Async multi-device verification)
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setPinError('');
    try {
      const success = await loginAdmin(pinInput.trim());
      if (success) {
        setPinError('');
        setPinInput('');
      } else {
        setPinError('PIN Admin salah. Silakan periksa kembali.');
      }
    } catch (err) {
      setPinError('Gagal memeriksa PIN. Silakan coba lagi.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Open Add Product Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = (productData) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Open Edit Order Modal
  const handleOpenEditOrder = (order) => {
    setEditingOrder(order);
    setIsEditOrderOpen(true);
  };

  // Trigger 2-Way Cloud Database Sync (Orders & Users across all devices)
  const handleTriggerCloudSync = async () => {
    const res = await syncCloudData();
    if (res.success) {
      setApprovalToast(`🔄 Sinkron Cloud Berhasil! (${res.orderCount} pesanan & ${res.userCount} pengguna dari Google Sheets)`);
    } else {
      setApprovalToast(`⚠️ ${res.message || 'Gagal sinkron cloud database'}`);
    }
    setTimeout(() => setApprovalToast(''), 4500);
  };

  // Auto-sync cloud data when Admin Page is opened (so latest PIN from another admin is loaded)
  useEffect(() => {
    syncCloudData();
  }, []);

  // Helper stats for overview (excludes internal system config records)
  const realProducts = products.filter((p) => p && !String(p.id || '').startsWith('cfg-'));
  const waitingCount = orders.filter((o) => o.status === 'Waiting List' || o.status === 'Terkirim ke WhatsApp').length;
  const approvedCount = orders.filter((o) => o.status === 'Disetujui' || o.status === 'Sedang Diproses').length;
  const availableCount = realProducts.filter((p) => p.isAvailable !== false).length;
  const customerCount = users.filter((u) => (u.status === 'approved' || !u.status) && u.role !== 'reseller').length;
  const resellerCount = users.filter((u) => (u.status === 'approved' || !u.status) && u.role === 'reseller').length;

  // ================= 1. LOGIN SCREEN IF NOT AUTHENTICATED =================
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-cookie-100 max-w-md w-full p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-cookie-100 text-cookie-800 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="font-serif font-bold text-2xl text-cookie-900">Akses Masuk Admin</h2>
            <p className="text-xs text-neutral-500">
              Masukkan PIN Admin untuk approval antrean dan kelola katalog.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                PIN Keamanan Admin:
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPinInput ? "text" : "password"}
                  required
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder="Masukkan PIN Admin"
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-cookie-500 text-sm shadow-xs tracking-widest font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPinInput(!showPinInput)}
                  className="absolute right-3.5 top-3 text-neutral-400 hover:text-cookie-800 transition p-0.5"
                  title={showPinInput ? "Sembunyikan PIN" : "Tampilkan PIN"}
                >
                  {showPinInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pinError && (
                <p className="text-xs text-red-500 font-medium mt-1.5">{pinError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-cookie-800 hover:bg-cookie-900 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memeriksa PIN...</span>
                </>
              ) : (
                <span>Buka Panel Admin</span>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-xs font-bold text-neutral-500 hover:text-cookie-800 transition inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Katalog Pembeli</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ================= 2. ADMIN DASHBOARD SCREEN =================
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Top Banner & Quick Controls */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-cookie-100 shadow-xs flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cookie-800 to-cookie-500 flex items-center justify-center text-white shadow-md overflow-hidden border border-cookie-200 shrink-0">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.storeName || 'Logo'}
                className="w-full h-full object-cover"
              />
            ) : (
              <Cookie className="w-6 h-6" />
            )}
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-cookie-900 leading-tight">
              {settings?.storeName || 'Aiyra Cookies'}
            </h2>
            <p className="text-xs text-cookie-600 font-medium">
              Panel Pengelola Toko & Antrean Pesanan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* SINKRON DATA CLOUD (MULTI-DEVICE) */}
          <button
            type="button"
            onClick={handleTriggerCloudSync}
            disabled={isSyncingCloud}
            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 rounded-2xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            title="Tarik data pesanan & akun terbaru dari Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
            <span>{isSyncingCloud ? 'Sinkron Cloud...' : 'Sinkron Cloud'}</span>
          </button>

          <Link
            href="/"
            className="flex-1 md:flex-none text-xs font-bold text-cookie-800 hover:bg-cookie-50 px-3.5 py-2.5 rounded-2xl border border-cookie-200 transition text-center"
          >
            Lihat Katalog Toko
          </Link>
        </div>
      </div>

      {/* CLOUD SYNC STATUS PILL (MULTI-DEVICE) */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-900">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-cookie-950">Database Cloud Google Sheets: </span>
          <span className="text-neutral-600">Terhubung & Aktif Otomatis Multi-Device</span>
        </div>
        <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
          <span>Terakhir sinkron:</span>
          <strong className="font-mono bg-white px-2 py-0.5 rounded-md border border-emerald-200">
            {lastCloudSyncTime || 'Baru saja'}
          </strong>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Waiting List Stats */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 sm:p-5 rounded-3xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-bold">Menunggu Approval</span>
            <Hourglass className="w-5 h-5 text-amber-600 animate-pulse" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-serif">
            {waitingCount}
          </p>
          <span className="text-[11px] text-amber-700 font-semibold">Dalam antrean Waiting List</span>
        </div>

        {/* Approved Stats */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-cookie-100 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold text-neutral-500">Pesanan Disetujui</span>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-800 font-serif">
            {approvedCount}
          </p>
          <span className="text-[11px] text-neutral-400">Sedang diproses</span>
        </div>

        {/* Users & Resellers Stats */}
        <div className="bg-emerald-50/70 p-4 sm:p-5 rounded-3xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-bold">Pengguna & Mitra</span>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-serif">
            {users.length}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold">
            {customerCount} Pembeli • {resellerCount} Reseller
          </span>
        </div>

        {/* Catalog Menu Stats */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-cookie-100 shadow-xs">
          <div className="flex items-center justify-between text-cookie-600 mb-2">
            <span className="text-xs font-bold text-neutral-500">Total Menu Kue</span>
            <Package className="w-5 h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-cookie-950 font-serif">
            {realProducts.length}
          </p>
          <span className="text-[11px] text-neutral-400">({availableCount} kue tersedia)</span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-cookie-100 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-cookie-700 mb-2">
            <span className="text-xs font-bold text-neutral-500">Total Semua Order</span>
            <Layers className="w-5 h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-cookie-800 font-serif">
            {orders.length}
          </p>
          <span className="text-[11px] text-neutral-400">Tercatat di sistem</span>
        </div>
      </div>

      {/* APPROVAL TOAST NOTIFICATION */}
      {approvalToast && (
        <div className="p-4 rounded-2xl bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center justify-between animate-fade-in border border-emerald-400/40">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{approvalToast}</span>
          </div>
          <button onClick={() => setApprovalToast('')} className="text-white/60 hover:text-white">✕</button>
        </div>
      )}

      {/* 1. ORDER WAITING LIST & APPROVAL SECTION */}
      <OrderManagement
        onOpenEditOrder={handleOpenEditOrder}
        setToast={(msg) => {
          setApprovalToast(msg);
          setTimeout(() => setApprovalToast(''), 3500);
        }}
      />

      {/* 2. PRODUCT CATALOG MANAGEMENT TABLE */}
      <ProductManagement
        onOpenAdd={handleOpenAdd}
        onOpenEdit={handleOpenEdit}
      />

      {/* 3. KELOLA PENGGUNA & RESELLER */}
      <UserManagement
        setToast={(msg) => {
          setApprovalToast(msg);
          setTimeout(() => setApprovalToast(''), 3500);
        }}
      />

      {/* 4. CONFIGURATION SETTINGS & SPREADSHEET INTEGRATION */}
      <SettingsTab
        onOpenBannerModal={() => setIsBannerModalOpen(true)}
        setToast={(msg) => {
          setApprovalToast(msg);
          setTimeout(() => setApprovalToast(''), 3500);
        }}
      />

      {/* PRODUCT MODAL (ADD / EDIT) */}
      <AdminProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />

      {/* EDIT ORDER MODAL (ADD/REMOVE ITEMS & ADJUST QTY) */}
      <EditOrderModal
        isOpen={isEditOrderOpen}
        onClose={() => {
          setIsEditOrderOpen(false);
          setEditingOrder(null);
        }}
        order={editingOrder}
        onSaved={(updated) => {
          setApprovalToast(`✅ Pesanan #${updated.invoiceId} berhasil diperbarui!`);
          setTimeout(() => setApprovalToast(''), 3500);
        }}
      />

      {/* BANNER SLIDE & LOGO MODAL */}
      <BannerSlideModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
      />
    </div>
  );
}
