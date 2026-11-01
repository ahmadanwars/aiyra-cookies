'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../../lib/storeContext';
import AdminProductModal from '../../components/AdminProductModal';
import EditOrderModal from '../../components/EditOrderModal';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Store,
  KeyRound,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  ExternalLink,
  Package,
  Layers,
  Save,
  ArrowLeft,
  FileSpreadsheet,
  RefreshCw,
  Copy,
  Check,
  Code2,
  Send,
  AlertCircle,
  Hourglass,
  Clock,
  Truck,
  Sparkles,
  MessageCircle,
  UserCheck,
  Users,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const {
    products,
    orders,
    settings,
    users,
    approveUser,
    rejectUser,
    updateUserRole,
    deleteUser,
    isAdmin,
    loginAdmin,
    logoutAdmin,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    resetProductsToDefault,
    updateSettings,
    updateOrderStatus,
    deleteOrder,
    clearOrders,
    syncFromGoogleSheets,
    isSyncingSheet,
    sortOrdersEarliestFirst,
    formatRupiah
  } = useStore();

  // Login PIN state
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [showSettingsPin, setShowSettingsPin] = useState(false);

  // Admin Search & Filter
  const [adminSearch, setAdminSearch] = useState('');
  const [orderFilterTab, setOrderFilterTab] = useState('Waiting List');
  const [orderSearch, setOrderSearch] = useState('');
  const [approvalToast, setApprovalToast] = useState('');

  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('Semua');

  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Edit Order Modal State
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  // Settings Form State
  const [storeForm, setStoreForm] = useState({
    adminWhatsApp: settings.adminWhatsApp || '',
    storeName: settings.storeName || '',
    storeTagline: settings.storeTagline || '',
    adminPin: settings.adminPin || '123456',
    spreadsheetId: settings.spreadsheetId || '1qNF4XHN3vjB91rjluYgVLJRJMC971dgVsXsGIppB9wg',
    googleScriptUrl: settings.googleScriptUrl || ''
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Sync settings into storeForm if settings change
  useEffect(() => {
    if (settings) {
      setStoreForm({
        adminWhatsApp: settings.adminWhatsApp || '',
        storeName: settings.storeName || '',
        storeTagline: settings.storeTagline || '',
        adminPin: settings.adminPin || '123456',
        spreadsheetId: settings.spreadsheetId || '1qNF4XHN3vjB91rjluYgVLJRJMC971dgVsXsGIppB9wg',
        googleScriptUrl: settings.googleScriptUrl || ''
      });
    }
  }, [settings]);

  // Sheet Sync State
  const [syncMessage, setSyncMessage] = useState('');
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sheet Test Send State
  const [isTestingSheet, setIsTestingSheet] = useState(false);
  const [testResult, setTestResult] = useState('');

  // Handle PIN Login
  const handleLogin = (e) => {
    e.preventDefault();
    const success = loginAdmin(pinInput.trim());
    if (success) {
      setPinError('');
      setPinInput('');
      setStoreForm({
        adminWhatsApp: settings.adminWhatsApp || '',
        storeName: settings.storeName || '',
        storeTagline: settings.storeTagline || '',
        adminPin: settings.adminPin || '123456',
        spreadsheetId: settings.spreadsheetId || '1qNF4XHN3vjB91rjluYgVLJRJMC971dgVsXsGIppB9wg',
        googleScriptUrl: settings.googleScriptUrl || ''
      });
    } else {
      setPinError('PIN Admin salah. Silakan periksa kembali.');
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
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

  // Delete Product
  const handleDeleteProduct = (product) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kue "${product.name}" dari katalog?`)) {
      deleteProduct(product.id);
    }
  };

  // Order Approval Handlers
  const handleApproveOrder = (invoiceId) => {
    updateOrderStatus(invoiceId, 'Disetujui');
    setApprovalToast(`✅ Pesanan #${invoiceId} telah DISETUJUI & dipindahkan ke status diproses!`);
    setTimeout(() => setApprovalToast(''), 3500);
  };

  const handleShipOrder = (invoiceId) => {
    updateOrderStatus(invoiceId, 'Sedang Dikirim');
    setApprovalToast(`🚚 Pesanan #${invoiceId} ditandai SEDANG DIKIRIM!`);
    setTimeout(() => setApprovalToast(''), 3500);
  };

  const handleCompleteOrder = (invoiceId) => {
    updateOrderStatus(invoiceId, 'Selesai');
    setApprovalToast(`✨ Pesanan #${invoiceId} telah SELESAI!`);
    setTimeout(() => setApprovalToast(''), 3500);
  };

  const handleCancelOrder = (invoiceId) => {
    if (confirm(`Apakah Anda yakin ingin membatalkan pesanan #${invoiceId}?`)) {
      updateOrderStatus(invoiceId, 'Dibatalkan');
      setApprovalToast(`❌ Pesanan #${invoiceId} telah DIBATALKAN.`);
      setTimeout(() => setApprovalToast(''), 3500);
    }
  };

  const handleOpenEditOrder = (order) => {
    setEditingOrder(order);
    setIsEditOrderOpen(true);
  };

  const handleDeleteSingleOrder = (invoiceId) => {
    if (confirm(`Hapus pesanan #${invoiceId} secara permanen?`)) {
      deleteOrder(invoiceId);
      setApprovalToast(`🗑️ Pesanan #${invoiceId} telah dihapus.`);
      setTimeout(() => setApprovalToast(''), 3500);
    }
  };

  const handleClearAllOrders = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan semua riwayat antrean pesanan? Tindakan ini akan menghapus semua pesanan saat ini.')) {
      clearOrders();
      setApprovalToast('🧹 Semua riwayat pesanan telah berhasil dikosongkan.');
      setTimeout(() => setApprovalToast(''), 3500);
    }
  };

  // User Approval & Delete Handlers
  const handleApproveUser = (userId, role) => {
    approveUser(userId, role);
    const targetUser = users.find((u) => u.id === userId);
    const roleName = role === 'reseller' ? 'Mitra Reseller' : 'Pembeli Reguler';
    setApprovalToast(`✅ Akun "${targetUser?.fullName || 'Pengguna'}" telah DISETUJUI sebagai ${roleName}!`);
    setTimeout(() => setApprovalToast(''), 3500);
  };

  const handleRejectUser = (userId) => {
    const targetUser = users.find((u) => u.id === userId);
    if (confirm(`Apakah Anda yakin ingin menolak pendaftaran akun "${targetUser?.fullName}"?`)) {
      rejectUser(userId);
      setApprovalToast(`❌ Pendaftaran "${targetUser?.fullName || 'Pengguna'}" telah DITOLAK.`);
      setTimeout(() => setApprovalToast(''), 3500);
    }
  };

  const handleDeleteUser = (userToDelete) => {
    if (confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${userToDelete.fullName}" (${userToDelete.phone}) secara permanen?`)) {
      deleteUser(userToDelete.id);
      setApprovalToast(`🗑️ Akun "${userToDelete.fullName}" telah berhasil dihapus.`);
      setTimeout(() => setApprovalToast(''), 3500);
    }
  };

  // Trigger Sheet Sync
  const handleTriggerSync = async () => {
    setSyncMessage('');
    const res = await syncFromGoogleSheets();
    if (res.success) {
      setSyncMessage(`✅ Berhasil menyinkronkan ${res.count} produk dari Google Spreadsheet!`);
    } else {
      setSyncMessage(`⚠️ ${res.message}`);
    }
  };

  // Test Send Order to Sheet
  const handleTestSendOrder = async () => {
    if (!storeForm.googleScriptUrl.trim()) {
      alert('Mohon masukkan Google Apps Script Web App URL terlebih dahulu di bawah.');
      return;
    }
    setIsTestingSheet(true);
    setTestResult('');
    try {
      const res = await fetch('/api/sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptUrl: storeForm.googleScriptUrl.trim(),
          payload: {
            action: 'saveOrder',
            invoiceId: 'AYR-TEST-' + Math.floor(100 + Math.random() * 900),
            date: new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            customerName: 'Uji Coba Sistem',
            customerPhone: '081234567890',
            address: 'Pesanan Uji Coba Masuk ke Google Sheets',
            itemsSummary: 'Nastar Wisman (2x), Kastengel (1x)',
            totalPrice: 265000,
            status: 'Waiting List'
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setTestResult('🎉 Berhasil! 1 baris pesanan uji coba telah masuk ke tab "Pesanan" di spreadsheet Anda!');
      } else {
        setTestResult(`❌ Gagal: ${data.message || data.error || 'Periksa kembali URL Web App Anda'}`);
      }
    } catch (e) {
      setTestResult(`❌ Gagal: ${e.message}`);
    } finally {
      setIsTestingSheet(false);
    }
  };

  // Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    let cleanedWa = storeForm.adminWhatsApp.replace(/[^0-9]/g, '');
    if (cleanedWa.startsWith('0')) {
      cleanedWa = '62' + cleanedWa.substring(1);
    }
    if (!cleanedWa || cleanedWa.length < 9) {
      alert('Nomor WhatsApp tidak valid. Gunakan format seperti 6281234567890');
      return;
    }

    updateSettings({
      adminWhatsApp: cleanedWa,
      storeName: storeForm.storeName.trim() || 'Aiyra Cookies',
      storeTagline: storeForm.storeTagline.trim() || 'Artisan Homemade Delights',
      adminPin: storeForm.adminPin.trim() || '123456',
      spreadsheetId: storeForm.spreadsheetId.trim() || '1qNF4XHN3vjB91rjluYgVLJRJMC971dgVsXsGIppB9wg',
      googleScriptUrl: storeForm.googleScriptUrl.trim()
    });

    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const appsScriptCode = `// KODE GOOGLE APPS SCRIPT DATABASE AIYRA COOKIES
// SPREADSHEET ID: 1qNF4XHN3vjB91rjluYgVLJRJMC971dgVsXsGIppB9wg

var SPREADSHEET_ID = "1qNF4XHN3vjB91rjluYgVLJRJMC971dgVsXsGIppB9wg";

// Menerima kiriman via POST (dari website)
function doPost(e) {
  var params = {};
  try {
    if (e && e.postData && e.postData.contents) {
      params = JSON.parse(e.postData.contents);
    }
  } catch (err) {
    params = e ? (e.parameter || {}) : {};
  }
  return handleRequest(params);
}

// Menerima kiriman via GET (sebagai cadangan & uji coba langsung di browser)
function doGet(e) {
  var params = e ? (e.parameter || {}) : {};
  if (!params.action) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "ok",
      message: "API Aiyra Cookies Siap Menerima Pesanan!"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  return handleRequest(params);
}

// Fungsi Utama Penyimpan Data
function handleRequest(params) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // 1. SIMPAN PESANAN
    if (params.action === 'saveOrder') {
      var sheet = ss.getSheetByName('Pesanan') || ss.insertSheet('Pesanan');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['invoiceId', 'date', 'customerName', 'customerPhone', 'address', 'items', 'totalPrice', 'status']);
      }
      sheet.appendRow([
        params.invoiceId || ('AYR-' + Date.now().toString().slice(-6)),
        params.date || new Date().toLocaleString('id-ID'),
        params.customerName || '-',
        params.customerPhone || '-',
        params.address || '-',
        params.itemsSummary || '-',
        Number(params.totalPrice) || 0,
        params.status || 'Waiting List'
      ]);
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. UPDATE STATUS PESANAN (APPROVAL)
    if (params.action === 'updateOrderStatus') {
      var sheet = ss.getSheetByName('Pesanan');
      if (sheet) {
        var rows = sheet.getDataRange().getValues();
        for (var i = 1; i < rows.length; i++) {
          if (rows[i][0] === params.invoiceId) {
            sheet.getRange(i + 1, 8).setValue(params.status);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. SIMPAN PENDAFTAR AKUN BARU
    if (params.action === 'registerUser') {
      var sheet = ss.getSheetByName('Users') || ss.insertSheet('Users');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['id', 'fullName', 'phone', 'password', 'address', 'registeredAt']);
      }
      sheet.appendRow([
        params.id || ('usr-' + Date.now()),
        params.fullName || '-',
        params.phone || '-',
        params.password || '-',
        params.address || '-',
        new Date().toISOString()
      ]);
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

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
              className="w-full bg-cookie-800 hover:bg-cookie-900 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition"
            >
              Buka Panel Admin
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

  // Filtered orders for approval
  const filteredOrders = orders.filter((o) => {
    const isOrderWaiting = o.status === 'Waiting List' || o.status === 'Terkirim ke WhatsApp';
    const isOrderApproved = o.status === 'Disetujui' || o.status === 'Sedang Diproses';
    const isOrderComplete = o.status === 'Selesai';

    const matchesTab =
      orderFilterTab === 'Semua' ||
      (orderFilterTab === 'Waiting List' && isOrderWaiting) ||
      (orderFilterTab === 'Disetujui' && isOrderApproved) ||
      (orderFilterTab === 'Selesai' && isOrderComplete);

    const customerName = o.customer?.name || '';
    const invoiceId = o.invoiceId || '';
    const matchesSearch =
      customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      invoiceId.toLowerCase().includes(orderSearch.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Sort orders: Urutkan dari yang pesan terdahulu baru yang baru pesan (Earliest First / FIFO)
  const sortedOrdersForAdmin = sortOrdersEarliestFirst(filteredOrders, orders);

  const waitingCount = orders.filter((o) => o.status === 'Waiting List' || o.status === 'Terkirim ke WhatsApp').length;
  const approvedCount = orders.filter((o) => o.status === 'Disetujui' || o.status === 'Sedang Diproses').length;
  const completedCount = orders.filter((o) => o.status === 'Selesai').length;

  // Filtered products for admin
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const availableCount = products.filter((p) => p.isAvailable !== false).length;

  // Filtered users & Approval Stats for admin
  const pendingUsersCount = users.filter((u) => u.status === 'pending').length;
  const approvedUsersCount = users.filter((u) => u.status === 'approved' || !u.status).length;
  const customerCount = users.filter((u) => (u.status === 'approved' || !u.status) && u.role !== 'reseller').length;
  const resellerCount = users.filter((u) => (u.status === 'approved' || !u.status) && u.role === 'reseller').length;

  const filteredUsers = users.filter((u) => {
    const isPending = u.status === 'pending';
    const isApproved = u.status === 'approved' || !u.status;
    const isRejected = u.status === 'rejected';

    const matchesRole =
      userRoleFilter === 'Semua' ||
      (userRoleFilter === 'pending' && isPending) ||
      (userRoleFilter === 'reseller' && isApproved && u.role === 'reseller') ||
      (userRoleFilter === 'user' && isApproved && u.role !== 'reseller') ||
      (userRoleFilter === 'rejected' && isRejected);

    const term = userSearch.toLowerCase();
    const matchesSearch =
      (u.fullName && u.fullName.toLowerCase().includes(term)) ||
      (u.phone && u.phone.includes(term)) ||
      (u.address && u.address.toLowerCase().includes(term));

    return matchesRole && matchesSearch;
  });

  // ================= 2. ADMIN DASHBOARD SCREEN =================
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      
      {/* Top Banner & Quick Controls */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-cookie-100 shadow-xs flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-900">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </span>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-cookie-900">
              Panel Kelola Toko & Approval Pesanan
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Role: <strong>Admin / Pemilik Toko</strong>. Setujui antrean pesanan pembeli (Waiting List), kelola 3 peran (Admin, Pembeli, Reseller), dan kelola katalog.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="bg-cookie-50 hover:bg-cookie-100 text-cookie-800 border border-cookie-200 px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Lihat Tampilan Pembeli</span>
          </Link>
          <button
            onClick={logoutAdmin}
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2.5 rounded-2xl text-xs font-bold transition"
          >
            Keluar Admin
          </button>
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
            {products.length}
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

      {/* ======================================================== */}
      {/* 1. ORDER WAITING LIST & APPROVAL SECTION                */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-cookie-100 shadow-xs overflow-hidden space-y-0">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-cookie-100 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-cookie-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                <Clock className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-base sm:text-lg text-cookie-950">
                Kelola Antrean & Tombol Approval Pesanan
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Klik <strong>"Setujui (Approve)"</strong> untuk memproses pesanan pembeli yang masuk di Waiting List.
            </p>
          </div>

          {/* Filter Tabs & Search */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200">
              <button
                onClick={() => setOrderFilterTab('Waiting List')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  orderFilterTab === 'Waiting List'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span>⏳ Waiting List</span>
                <span className="bg-amber-100 text-amber-950 text-[10px] px-1.5 rounded-full font-extrabold">
                  {waitingCount}
                </span>
              </button>
              <button
                onClick={() => setOrderFilterTab('Disetujui')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  orderFilterTab === 'Disetujui'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                ✅ Disetujui ({approvedCount})
              </button>
              <button
                onClick={() => setOrderFilterTab('Semua')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  orderFilterTab === 'Semua'
                    ? 'bg-cookie-800 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Semua ({orders.length})
              </button>
            </div>

            <div className="relative flex-1 md:w-52">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Cari nama / invoice..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-cookie-500"
              />
            </div>

            {orders.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllOrders}
                className="px-2.5 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                title="Kosongkan Semua Riwayat Antrean Pesanan"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kosongkan Antrean</span>
              </button>
            )}
          </div>
        </div>

        {/* Orders Approval List */}
        <div className="p-4 sm:p-6 space-y-3.5">
          {sortedOrdersForAdmin.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 space-y-1.5">
              <Hourglass className="w-10 h-10 mx-auto text-cookie-300" />
              <p className="font-bold text-sm text-neutral-600">Tidak ada antrean pesanan di filter ini</p>
              <p className="text-xs">Pesanan yang dibuat oleh pembeli akan otomatis muncul di sini untuk di-approve.</p>
            </div>
          ) : (
            sortedOrdersForAdmin.map((order, idx) => {
              const isWaiting = order.status === 'Waiting List' || order.status === 'Terkirim ke WhatsApp';
              const isApproved = order.status === 'Disetujui' || order.status === 'Sedang Diproses';
              const isShipped = order.status === 'Sedang Dikirim';
              const isCompleted = order.status === 'Selesai';
              const cleanWa = (order.customer?.phone || '').replace(/[^0-9]/g, '');

              return (
                <div
                  key={order.invoiceId}
                  className={`p-4 rounded-2xl border transition space-y-3 ${
                    isWaiting
                      ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                      : isApproved
                      ? 'bg-blue-50/40 border-blue-200'
                      : isShipped
                      ? 'bg-purple-50/40 border-purple-200'
                      : isCompleted
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  {/* Top info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200/60 pb-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-cookie-800 text-amber-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-2xs">
                        Antrean #{idx + 1}
                      </span>
                      <span className="font-mono text-xs font-extrabold text-cookie-950 bg-white px-2.5 py-1 rounded-lg border border-neutral-200 shadow-2xs">
                        #{order.invoiceId}
                      </span>
                      <span className="text-xs font-bold text-neutral-900">
                        👤 {order.customer?.name || 'Pelanggan'}
                      </span>
                      {order.customer?.phone && (
                        <a
                          href={`https://wa.me/${cleanWa}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 transition"
                          title="Chat pembeli via WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>{order.customer.phone}</span>
                        </a>
                      )}
                      <span className="text-[11px] text-neutral-400">• {order.date}</span>
                    </div>

                    {/* Current Status Badge */}
                    <div>
                      {isWaiting ? (
                        <span className="bg-amber-500 text-white text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs animate-pulse">
                          <Hourglass className="w-3 h-3" />
                          <span>Waiting List (Menunggu Approval)</span>
                        </span>
                      ) : isApproved ? (
                        <span className="bg-blue-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Disetujui (Sedang Diproses)</span>
                        </span>
                      ) : isShipped ? (
                        <span className="bg-purple-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          <span>Sedang Dikirim</span>
                        </span>
                      ) : isCompleted ? (
                        <span className="bg-emerald-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Selesai</span>
                        </span>
                      ) : (
                        <span className="bg-neutral-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                          <span>{order.status}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Order Details & Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-neutral-500 text-[11px] block">Rincian Item:</span>
                        <button
                          type="button"
                          onClick={() => handleOpenEditOrder(order)}
                          className="text-cookie-700 hover:text-cookie-950 font-bold text-[11px] underline flex items-center gap-1 transition"
                          title="Ubah varian kue atau jumlah toples di pesanan ini"
                        >
                          <Edit2 className="w-3 h-3 text-cookie-700" />
                          <span>Edit Produk / Qty</span>
                        </button>
                      </div>
                      <p className="font-semibold text-neutral-800">
                        {order.items
                          ? order.items.map((it) => `${it.name} (${it.qty}x)`).join(', ')
                          : order.itemsSummary || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[11px] block">Alamat / Catatan Pengiriman:</span>
                      <p className="text-neutral-700 italic">
                        {order.customer?.address || 'Diambil di toko'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons / Approval Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-neutral-200/60">
                    <div>
                      <span className="text-[11px] text-neutral-400">Total Pembayaran: </span>
                      <span className="font-extrabold text-cookie-800 text-sm">
                        {formatRupiah(order.totalPrice)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* 1. TOMBOL SETUJU (Muncul jika belum disetujui & belum selesai) */}
                      {!isApproved && !isCompleted && order.status !== 'Dibatalkan' && (
                        <button
                          onClick={() => handleApproveOrder(order.invoiceId)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition"
                          title="Setujui pesanan ini"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Setuju</span>
                        </button>
                      )}

                      {/* 2. TOMBOL SELESAI (Bisa langsung diklik kapan saja untuk menandai selesai) */}
                      {!isCompleted && order.status !== 'Dibatalkan' && (
                        <button
                          onClick={() => handleCompleteOrder(order.invoiceId)}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition"
                          title="Tandai pesanan ini sudah selesai & lunas"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Selesai</span>
                        </button>
                      )}

                      {/* 3. TOMBOL KIRIM (Opsional jika pesanan siap dikirim kurir) */}
                      {isApproved && (
                        <button
                          onClick={() => handleShipOrder(order.invoiceId)}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition shadow-xs"
                          title="Kirim pesanan"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Kirim</span>
                        </button>
                      )}

                      {/* TOMBOL EDIT PESANAN */}
                      {order.status !== 'Dibatalkan' && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditOrder(order)}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition border border-amber-300 shadow-2xs"
                          title="Edit produk, tambah atau kurangi toples pesanan ini"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-amber-800" />
                          <span>Edit Pesanan</span>
                        </button>
                      )}

                      {/* 4. TOMBOL TOLAK / BATALKAN */}
                      {order.status !== 'Dibatalkan' && !isCompleted && (
                        <button
                          onClick={() => handleCancelOrder(order.invoiceId)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold px-3 py-2 rounded-xl text-xs transition"
                          title="Batalkan pesanan ini"
                        >
                          Tolak
                        </button>
                      )}

                      {/* 5. JIKA SUDAH SELESAI */}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Pesanan Selesai</span>
                        </span>
                      )}

                      {/* 6. TOMBOL HAPUS PESANAN PERMANEN */}
                      <button
                        onClick={() => handleDeleteSingleOrder(order.invoiceId)}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-200"
                        title="Hapus pesanan ini secara permanen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. GOOGLE SPREADSHEET INTEGRATION CARD                  */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-cookie-950 rounded-3xl p-5 sm:p-6 text-white shadow-lg space-y-4 border border-emerald-500/30">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-base sm:text-lg">
                Google Spreadsheet Database Terhubung!
              </h3>
            </div>
            <p className="text-xs text-emerald-100/80 max-w-2xl">
              File spreadsheet: <strong className="text-amber-300 font-mono">1qNF4XHN3vjB91rjluYgVLJRJMC971dgVsXsGIppB9wg</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://docs.google.com/spreadsheets/d/1qNF4XHN3vjB91rjluYgVLJRJMC971dgVsXsGIppB9wg/edit"
              target="_blank"
              rel="noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Google Sheets</span>
            </a>
            
            <button
              onClick={handleTriggerSync}
              disabled={isSyncingSheet}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheet ? 'animate-spin' : ''}`} />
              <span>{isSyncingSheet ? 'Menyinkronkan...' : 'Sinkronkan Dari Sheet'}</span>
            </button>

            <button
              onClick={handleTestSendOrder}
              disabled={isTestingSheet || !storeForm.googleScriptUrl}
              className="bg-white/20 hover:bg-white/30 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 border border-white/30 disabled:opacity-40"
              title="Kirim 1 baris pesanan tes untuk memeriksa koneksi"
            >
              <Send className={`w-3.5 h-3.5 ${isTestingSheet ? 'animate-pulse' : ''}`} />
              <span>{isTestingSheet ? 'Mengirim...' : 'Tes Kirim Pesanan'}</span>
            </button>

            <button
              onClick={() => setShowScriptModal(true)}
              className="bg-amber-400 hover:bg-amber-300 text-cookie-950 font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-md"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Update Script Sheet</span>
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-xs font-semibold animate-fade-in flex items-center justify-between">
            <span>{syncMessage}</span>
            <button onClick={() => setSyncMessage('')} className="text-white/60 hover:text-white">✕</button>
          </div>
        )}

        {testResult && (
          <div className={`p-3 rounded-xl border text-xs font-bold animate-fade-in flex items-center justify-between ${
            testResult.startsWith('🎉')
              ? 'bg-emerald-900/80 border-emerald-400/40 text-emerald-100'
              : 'bg-red-900/80 border-red-400/40 text-red-100'
          }`}>
            <span>{testResult}</span>
            <button onClick={() => setTestResult('')} className="text-white/60 hover:text-white">✕</button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. PRODUCT CATALOG MANAGEMENT TABLE                     */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-cookie-100 shadow-xs overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 sm:p-6 border-b border-cookie-100 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-cookie-50/40">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-cookie-950">
              Daftar Produk Katalog
            </h3>
            <p className="text-xs text-neutral-500">
              Tambah, perbarui harga & foto, atau hapus kue dari menu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-60">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Filter nama kue..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-cookie-500"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={handleOpenAdd}
              className="bg-cookie-700 hover:bg-cookie-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kue Baru</span>
            </button>

            {/* Reset to Default */}
            <button
              onClick={() => {
                if (confirm('Kembalikan seluruh katalog ke contoh data awal Aiyra Cookies?')) {
                  resetProductsToDefault();
                }
              }}
              title="Kembalikan contoh menu awal"
              className="p-2 text-neutral-400 hover:text-cookie-800 rounded-xl hover:bg-white border border-neutral-200 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Kue / Produk</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Harga Normal</th>
                <th className="py-3 px-4 text-emerald-800">Harga Reseller</th>
                <th className="py-3 px-4">Kemasan</th>
                <th className="py-3 px-4 text-center">Status Stok</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    Tidak ada produk yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isAvailable = p.isAvailable !== false;
                  return (
                    <tr key={p.id} className="hover:bg-cookie-50/50 transition">
                      
                      {/* Product Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover bg-cookie-50 border border-neutral-100 shrink-0"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-cookie-900 text-xs sm:text-sm">
                              {p.name}
                            </h4>
                            {p.badge && (
                              <span className="inline-block mt-0.5 text-[9px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                                {p.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 font-semibold text-neutral-700">
                        {p.category}
                      </td>

                      {/* Normal Price */}
                      <td className="py-3 px-4 font-bold text-cookie-800">
                        {formatRupiah(p.price)}
                      </td>

                      {/* Reseller Price */}
                      <td className="py-3 px-4 font-bold text-emerald-800">
                        <div className="flex items-center gap-1">
                          <span>{formatRupiah(p.resellerPrice || Math.round(p.price * 0.85))}</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">Mitra</span>
                        </div>
                      </td>

                      {/* Weight */}
                      <td className="py-3 px-4 text-neutral-500">
                        {p.weight || '-'}
                      </td>

                      {/* Availability Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleProductAvailability(p.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold transition ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {isAvailable ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Tersedia</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Habis</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-2 text-cookie-700 hover:bg-cookie-100 rounded-xl transition"
                            title="Edit kue ini"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                            title="Hapus kue ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. KELOLA PENGGUNA & RESELLER (3 ROLE: ADMIN, USER, RESELLER) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-cookie-100 shadow-xs overflow-hidden space-y-0">
        <div className="p-4 sm:p-6 border-b border-cookie-100 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-cookie-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cookie-800 text-white shadow-xs">
                <Users className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-base sm:text-lg text-cookie-950">
                Kelola Pengguna & Mitra Reseller
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Sistem memiliki 3 Role: <strong>Admin (Pemilik)</strong>, <strong>User (Pembeli Reguler)</strong>, dan <strong>Reseller (Mitra Grosir)</strong>. Ubah status peran akun di bawah ini.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200">
              <button
                type="button"
                onClick={() => setUserRoleFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  userRoleFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : pendingUsersCount > 0
                    ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 font-extrabold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span>⏳ Menunggu Approval</span>
                <span className={`text-[10px] px-1.5 rounded-full font-extrabold ${
                  pendingUsersCount > 0
                    ? 'bg-amber-200 text-amber-950 animate-pulse'
                    : 'bg-neutral-100 text-neutral-600'
                }`}>
                  {pendingUsersCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setUserRoleFilter('Semua')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  userRoleFilter === 'Semua' ? 'bg-cookie-800 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Semua ({users.length})
              </button>

              <button
                type="button"
                onClick={() => setUserRoleFilter('reseller')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  userRoleFilter === 'reseller' ? 'bg-emerald-700 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span>🤝 Reseller</span>
                <span className="bg-white/20 text-[10px] px-1.5 rounded-full font-bold">{resellerCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setUserRoleFilter('user')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  userRoleFilter === 'user' ? 'bg-amber-600 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span>👤 Pembeli</span>
                <span className="bg-white/20 text-[10px] px-1.5 rounded-full font-bold">{customerCount}</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Cari nama, WA, alamat..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-cookie-500 w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Table of Users */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Nama Pengguna</th>
                <th className="py-3 px-4">No. WhatsApp</th>
                <th className="py-3 px-4">Alamat Pengiriman</th>
                <th className="py-3 px-4 text-center">Status & Peran</th>
                <th className="py-3 px-4 text-right">Aksi & Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400 space-y-1">
                    <p className="font-bold text-sm text-neutral-500">Tidak ada akun pengguna di filter ini.</p>
                    <p className="text-xs">Akun pembeli/reseller baru yang mendaftar akan otomatis masuk ke sini untuk di-approve.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isPending = u.status === 'pending';
                  const isRejected = u.status === 'rejected';
                  const isApproved = u.status === 'approved' || !u.status;
                  const isUserReseller = u.role === 'reseller';
                  const cleanUserPhone = (u.phone || '').replace(/[^0-9]/g, '');

                  return (
                    <tr
                      key={u.id}
                      className={`transition ${
                        isPending
                          ? 'bg-amber-50/50 hover:bg-amber-50'
                          : isRejected
                          ? 'bg-red-50/30 hover:bg-red-50/50'
                          : 'hover:bg-cookie-50/40'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                            isPending
                              ? 'bg-amber-500 shadow-xs'
                              : isUserReseller
                              ? 'bg-emerald-600'
                              : 'bg-cookie-700'
                          }`}>
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-cookie-950 text-xs sm:text-sm">{u.fullName}</p>
                            <p className="text-[10px] text-neutral-400 font-mono">ID: {u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-neutral-700">
                        {u.phone}
                      </td>
                      <td className="py-3 px-4 text-neutral-600 max-w-xs truncate" title={u.address}>
                        {u.address || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isPending ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500 text-white shadow-2xs animate-pulse">
                              <Hourglass className="w-3 h-3" />
                              <span>Menunggu Approval</span>
                            </span>
                            <span className="text-[10px] text-neutral-500 font-medium">
                              Mengajukan: <strong>{isUserReseller ? 'Mitra Reseller' : 'Pembeli'}</strong>
                            </span>
                          </div>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-red-100 text-red-800 border border-red-300">
                            <XCircle className="w-3 h-3" />
                            <span>Ditolak</span>
                          </span>
                        ) : (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                              isUserReseller
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}>
                              {isUserReseller ? '🤝 Mitra Reseller' : '👤 Pembeli'}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Aktif Disetujui</span>
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* 1. JIKA STATUS PENDING: TOMBOL APPROVAL */}
                          {isPending && (
                            <>
                              {isUserReseller ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveUser(u.id, 'reseller')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] transition shadow-xs flex items-center gap-1"
                                    title="Setujui sebagai Mitra Reseller (Bisa melihat harga grosir)"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Setujui Reseller ✨</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveUser(u.id, 'user')}
                                    className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition"
                                    title="Setujui hanya sebagai Pembeli Biasa (harga reguler)"
                                  >
                                    sbg Pembeli
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveUser(u.id, 'user')}
                                    className="bg-cookie-800 hover:bg-cookie-900 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] transition shadow-xs flex items-center gap-1"
                                    title="Setujui akun pembeli"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Setujui Akun ✅</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveUser(u.id, 'reseller')}
                                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-1.5 rounded-xl font-bold text-[11px] transition"
                                    title="Langsung jadikan Mitra Reseller"
                                  >
                                    Jadikan Reseller ✨
                                  </button>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRejectUser(u.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition"
                                title="Tolak pendaftaran akun"
                              >
                                Tolak
                              </button>
                            </>
                          )}

                          {/* 2. JIKA STATUS DITOLAK */}
                          {isRejected && (
                            <button
                              type="button"
                              onClick={() => handleApproveUser(u.id, u.role || 'user')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] transition shadow-xs flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Setujui Ulang</span>
                            </button>
                          )}

                          {/* 3. JIKA STATUS SUDAH AKTIF: UBAH ROLE */}
                          {isApproved && (
                            <>
                              {isUserReseller ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateUserRole(u.id, 'user');
                                    setApprovalToast(`Role ${u.fullName} diubah menjadi Pembeli Reguler.`);
                                    setTimeout(() => setApprovalToast(''), 3500);
                                  }}
                                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl font-bold text-[11px] transition shadow-2xs"
                                >
                                  Ubah jadi Pembeli
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateUserRole(u.id, 'reseller');
                                    setApprovalToast(`Role ${u.fullName} diubah menjadi Mitra Reseller! Mendapatkan harga grosir.`);
                                    setTimeout(() => setApprovalToast(''), 3500);
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] transition shadow-xs"
                                >
                                  Jadikan Reseller ✨
                                </button>
                              )}
                            </>
                          )}

                          {/* Chat WA */}
                          {cleanUserPhone && (
                            <a
                              href={`https://wa.me/${cleanUserPhone}?text=${encodeURIComponent(
                                `Halo ${u.fullName}, akun Aiyra Cookies Anda telah kami verifikasi & aktifkan. Silakan login ke website kami. Terima kasih!`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-200"
                              title="Chat pengguna via WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Hapus Akun */}
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-200"
                            title={`Hapus akun "${u.fullName}" secara permanen`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. CONFIGURATION SETTINGS                                */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-6 border border-cookie-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-cookie-600" />
          <h3 className="font-bold text-base text-cookie-950">
            Pengaturan WhatsApp, Toko & Google Sheets
          </h3>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* WhatsApp Tujuan */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Nomor WhatsApp Toko (Format: 628xxxxxxxxxx) *
              </label>
              <input
                type="text"
                required
                value={storeForm.adminWhatsApp}
                onChange={(e) => setStoreForm({ ...storeForm, adminWhatsApp: e.target.value })}
                placeholder="6281234567890"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-cookie-500 font-mono shadow-xs"
              />
            </div>

            {/* Nama Toko */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Nama Toko / Brand
              </label>
              <input
                type="text"
                value={storeForm.storeName}
                onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                placeholder="Aiyra Cookies"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-cookie-500 shadow-xs"
              />
            </div>

            {/* Spreadsheet ID */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Google Spreadsheet ID
              </label>
              <input
                type="text"
                value={storeForm.spreadsheetId}
                onChange={(e) => setStoreForm({ ...storeForm, spreadsheetId: e.target.value })}
                placeholder="1qNF4XHN3vjB91rjluYgVLJRJMC971dgVsXsGIppB9wg"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-cookie-500 font-mono shadow-xs"
              />
            </div>

            {/* Google Apps Script Web App URL */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center justify-between">
                <span className="text-cookie-800 font-bold">Google Apps Script Web App URL *</span>
                <button
                  type="button"
                  onClick={() => setShowScriptModal(true)}
                  className="text-cookie-700 underline text-[11px] font-bold"
                >
                  Cara Ambil URL Ini
                </button>
              </label>
              <input
                type="url"
                value={storeForm.googleScriptUrl}
                onChange={(e) => setStoreForm({ ...storeForm, googleScriptUrl: e.target.value })}
                placeholder="https://script.google.com/macros/s/.../exec"
                className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl border font-mono shadow-xs ${
                  storeForm.googleScriptUrl
                    ? 'border-emerald-400 bg-emerald-50/30 text-emerald-950 focus:ring-emerald-500'
                    : 'border-amber-300 bg-amber-50/30 text-amber-950 focus:ring-amber-500'
                }`}
              />
            </div>

            {/* Ganti PIN Admin */}
            <div className="md:col-span-2 p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-cookie-950 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-cookie-700" />
                  <span>Ubah PIN Keamanan Admin</span>
                </label>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                  PIN Rahasia
                </span>
              </div>
              <p className="text-[11px] text-neutral-600">
                Ganti PIN untuk mengamankan akses ke halaman pengelola ini. Pastikan Anda mengingat atau mencatat PIN baru setelah menyimpannya.
              </p>
              <div className="relative max-w-sm">
                <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type={showSettingsPin ? "text" : "password"}
                  value={storeForm.adminPin}
                  onChange={(e) => setStoreForm({ ...storeForm, adminPin: e.target.value })}
                  placeholder="Ketik PIN Baru (contoh: 6 digit)"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-cookie-500 font-mono text-xs sm:text-sm bg-white shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowSettingsPin(!showSettingsPin)}
                  className="absolute right-3.5 top-2.5 text-neutral-400 hover:text-cookie-800 transition p-0.5"
                  title={showSettingsPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                >
                  {showSettingsPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>

          <div className="flex items-center justify-between pt-2">
            {settingsSaved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Pengaturan berhasil disimpan!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto bg-cookie-700 hover:bg-cookie-800 text-white font-bold px-6 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>

      {/* SCRIPT MODAL / PANDUAN DEPLOY */}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowScriptModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 z-10 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-cookie-950 text-base flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cookie-600" />
                Langkah Mengaktifkan Web App Agar Pesanan Masuk
              </h3>
              <button onClick={() => setShowScriptModal(false)} className="text-neutral-400 hover:text-neutral-700">✕</button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Google Apps Script mengharuskan Anda menerbitkan <strong>Versi Baru (New Version)</strong> setiap kali kode diperbarui:
            </p>

            <ol className="text-xs text-neutral-800 list-decimal list-inside space-y-2 bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <li>Salin kode script di bawah ini dan tempelkan ke <strong>Apps Script</strong> spreadsheet Anda (timpa isi yang lama).</li>
              <li>Klik ikon <strong>Save (Disket)</strong> untuk menyimpan script.</li>
              <li>Di pojok kanan atas, klik tombol biru <strong>Deploy</strong> ➜ pilih <strong>Manage deployments</strong>.</li>
              <li>Klik ikon <strong>Pensil (Edit)</strong>.</li>
              <li>Pada pilihan <strong>Version</strong>, pilih <strong>New version (Versi baru)</strong>.</li>
              <li>Pastikan <strong>Who has access</strong> adalah <strong>Anyone (Siapa saja)</strong>.</li>
              <li>Klik <strong>Deploy</strong>, lalu salin <strong>Web app URL</strong>.</li>
              <li>Tempelkan ke kolom <strong>Google Apps Script Web App URL</strong> di web ini dan klik <strong>Simpan</strong>.</li>
            </ol>

            <div className="relative flex-1 overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-900 text-neutral-100 font-mono text-[11px] p-4 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(appsScriptCode);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-sans transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Tersalin!' : 'Salin Kode Script Baru'}</span>
              </button>
              <pre>{appsScriptCode}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowScriptModal(false)}
                className="bg-cookie-700 text-white font-bold px-5 py-2 rounded-xl text-xs hover:bg-cookie-800 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

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

    </div>
  );
}
