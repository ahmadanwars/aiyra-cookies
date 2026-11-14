'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../../lib/storeContext';
import {
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  Send,
  Code2,
  Sparkles,
  Cookie,
  Upload,
  Phone,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';

export default function SettingsTab({ onOpenBannerModal, setToast }) {
  const {
    settings,
    updateSettings,
    syncFromGoogleSheets,
    isSyncingSheet
  } = useStore();

  const [storeForm, setStoreForm] = useState({
    adminWhatsApp: settings?.adminWhatsApp || '',
    storeName: settings?.storeName || '',
    storeTagline: settings?.storeTagline || '',
    logoUrl: settings?.logoUrl || '',
    bannerBadge: settings?.bannerBadge || '',
    bannerTitle: settings?.bannerTitle || '',
    bannerDesc: settings?.bannerDesc || '',
    bannerButtonText: settings?.bannerButtonText || '',
    adminPin: settings?.adminPin || '123456',
    spreadsheetId: settings?.spreadsheetId || '1qNF4XHN3vjB91rjluYgVLJRJMC971dgVsXsGIppB9wg',
    googleScriptUrl: settings?.googleScriptUrl || ''
  });

  const [showSettingsPin, setShowSettingsPin] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isTestingSheet, setIsTestingSheet] = useState(false);
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    if (settings) {
      setStoreForm({
        adminWhatsApp: settings.adminWhatsApp || '',
        storeName: settings.storeName || '',
        storeTagline: settings.storeTagline || '',
        logoUrl: settings.logoUrl || '',
        bannerBadge: settings.bannerBadge || '',
        bannerTitle: settings.bannerTitle || '',
        bannerDesc: settings.bannerDesc || '',
        bannerButtonText: settings.bannerButtonText || '',
        adminPin: settings.adminPin || '123456',
        spreadsheetId: settings.spreadsheetId || '1qNF4XHN3vjB91rjluYgVLJRJMC971dgVsXsGIppB9wg',
        googleScriptUrl: settings.googleScriptUrl || ''
      });
    }
  }, [settings]);

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
    let cleanedWa = String(storeForm.adminWhatsApp || '').replace(/[^0-9]/g, '');
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
      logoUrl: (storeForm.logoUrl || '').trim(),
      bannerBadge: (storeForm.bannerBadge || '').trim(),
      bannerTitle: (storeForm.bannerTitle || '').trim(),
      bannerDesc: (storeForm.bannerDesc || '').trim(),
      bannerButtonText: (storeForm.bannerButtonText || '').trim(),
      adminPin: storeForm.adminPin.trim() || '123456',
      spreadsheetId: storeForm.spreadsheetId.trim() || '1qNF4XHN3vjB91rjluYgVLJRJMC971dgVsXsGIppB9wg',
      googleScriptUrl: storeForm.googleScriptUrl.trim()
    });

    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleAdminLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setStoreForm((prev) => ({ ...prev, logoUrl: dataUrl }));
      };
    };
  };

  const appsScriptCode = `// KODE GOOGLE APPS SCRIPT DATABASE TERPUSAT AIYRA COOKIES
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

// Menerima kiriman via GET (untuk tarik data & uji coba langsung)
function doGet(e) {
  var params = e ? (e.parameter || {}) : {};
  if (!params.action) {
    params.action = 'getAllData';
  }
  return handleRequest(params);
}

// Fungsi Utama Pengelola Database Cloud
function handleRequest(params) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var action = params.action;

    // 0. AMBIL SEMUA DATA (SYNC MULTI-DEVICE 2 ARAH)
    if (action === 'getAllData') {
      var orders = [];
      var orderSheet = ss.getSheetByName('Pesanan');
      if (orderSheet && orderSheet.getLastRow() > 1) {
        var oRows = orderSheet.getRange(2, 1, orderSheet.getLastRow() - 1, 8).getValues();
        for (var i = 0; i < oRows.length; i++) {
          var r = oRows[i];
          if (r[0]) {
            orders.push({
              invoiceId: String(r[0]),
              date: String(r[1] || ''),
              customer: {
                name: String(r[2] || 'Pelanggan'),
                phone: String(r[3] || ''),
                address: String(r[4] || '')
              },
              itemsSummary: String(r[5] || ''),
              totalPrice: Number(r[6]) || 0,
              status: String(r[7] || 'Waiting List')
            });
          }
        }
      }

      var users = [];
      var userSheet = ss.getSheetByName('Users');
      if (userSheet && userSheet.getLastRow() > 1) {
        var uRows = userSheet.getRange(2, 1, userSheet.getLastRow() - 1, 8).getValues();
        for (var j = 0; j < uRows.length; j++) {
          var u = uRows[j];
          if (u[0] || u[2]) {
            users.push({
              id: String(u[0] || ('usr-' + j)),
              fullName: String(u[1] || ''),
              phone: String(u[2] || ''),
              password: String(u[3] || ''),
              address: String(u[4] || ''),
              role: String(u[5] || 'user'),
              status: String(u[6] || 'approved'),
              registeredAt: String(u[7] || '')
            });
          }
        }
      }

      var products = [];
      var productSheet = ss.getSheetByName('Produk');
      if (productSheet && productSheet.getLastRow() > 1) {
        var pRows = productSheet.getRange(2, 1, productSheet.getLastRow() - 1, 9).getValues();
        for (var p = 0; p < pRows.length; p++) {
          var pr = pRows[p];
          if (pr[0]) {
            products.push({
              id: String(pr[0]),
              name: String(pr[1] || 'Kue Tanpa Nama'),
              category: String(pr[2] || 'Klasik'),
              price: Number(pr[3]) || 0,
              weight: String(pr[4] || 'Toples 500gr'),
              badge: String(pr[5] || ''),
              image: String(pr[6] || ''),
              description: String(pr[7] || ''),
              isAvailable: String(pr[8]).toUpperCase() !== 'FALSE'
            });
          }
        }
      }

      var settings = {};
      var settingsSheet = ss.getSheetByName('Settings');
      if (settingsSheet && settingsSheet.getLastRow() > 1) {
        var sRows = settingsSheet.getRange(2, 1, settingsSheet.getLastRow() - 1, 2).getValues();
        for (var s = 0; s < sRows.length; s++) {
          var k = String(sRows[s][0] || '').trim();
          var v = sRows[s][1];
          if (k) {
            if (k === 'bannerSlides') {
              try {
                settings[k] = JSON.parse(v);
              } catch (e) {
                settings[k] = v;
              }
            } else if (k === 'showBannerText') {
              settings[k] = v === true || v === 'true' || v === 'TRUE';
            } else {
              settings[k] = String(v || '');
            }
          }
        }
      }

      return jsonResponse({ success: true, orders: orders, users: users, products: products, settings: settings });
    }

    // 1. SIMPAN PESANAN (saveOrder)
    if (action === 'saveOrder') {
      var sheet = ss.getSheetByName('Pesanan') || ss.insertSheet('Pesanan');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['invoiceId', 'date', 'customerName', 'customerPhone', 'address', 'items', 'totalPrice', 'status']);
      }
      var existingRow = -1;
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var k = 0; k < ids.length; k++) {
          if (String(ids[k][0]) === String(params.invoiceId)) {
            existingRow = k + 2;
            break;
          }
        }
      }

      var rowData = [
        params.invoiceId || ('AYR-' + Date.now().toString().slice(-6)),
        params.date || new Date().toLocaleString('id-ID'),
        params.customerName || '-',
        params.customerPhone || '-',
        params.address || '-',
        params.itemsSummary || '-',
        Number(params.totalPrice) || 0,
        params.status || 'Waiting List'
      ];

      if (existingRow > 0) {
        sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
      }
      return jsonResponse({ success: true });
    }

    // 2. UPDATE STATUS PESANAN (updateOrderStatus)
    if (action === 'updateOrderStatus') {
      var sheet = ss.getSheetByName('Pesanan');
      if (sheet && sheet.getLastRow() > 1) {
        var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
        for (var i = 0; i < rows.length; i++) {
          if (String(rows[i][0]) === String(params.invoiceId)) {
            sheet.getRange(i + 2, 8).setValue(params.status);
            break;
          }
        }
      }
      return jsonResponse({ success: true });
    }

    // 3. UPDATE RINCIAN PESANAN (updateOrderDetails)
    if (action === 'updateOrderDetails') {
      var sheet = ss.getSheetByName('Pesanan');
      if (sheet && sheet.getLastRow() > 1) {
        var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
        for (var i = 0; i < rows.length; i++) {
          if (String(rows[i][0]) === String(params.invoiceId)) {
            if (params.itemsSummary) sheet.getRange(i + 2, 6).setValue(params.itemsSummary);
            if (params.totalPrice !== undefined) sheet.getRange(i + 2, 7).setValue(Number(params.totalPrice) || 0);
            if (params.address) sheet.getRange(i + 2, 5).setValue(params.address);
            break;
          }
        }
      }
      return jsonResponse({ success: true });
    }

    // 4. HAPUS PESANAN (deleteOrder)
    if (action === 'deleteOrder') {
      var sheet = ss.getSheetByName('Pesanan');
      if (sheet && sheet.getLastRow() > 1) {
        var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
        for (var i = 0; i < rows.length; i++) {
          if (String(rows[i][0]) === String(params.invoiceId)) {
            sheet.deleteRow(i + 2);
            break;
          }
        }
      }
      return jsonResponse({ success: true });
    }

    // 5. SIMPAN PENDAFTAR AKUN BARU (registerUser)
    if (action === 'registerUser') {
      var sheet = ss.getSheetByName('Users') || ss.insertSheet('Users');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['id', 'fullName', 'phone', 'password', 'address', 'role', 'status', 'registeredAt']);
      }
      sheet.appendRow([
        params.id || ('usr-' + Date.now()),
        params.fullName || '-',
        params.phone || '-',
        params.password || '-',
        params.address || '-',
        params.role || 'user',
        params.status || 'pending',
        new Date().toISOString()
      ]);
      return jsonResponse({ success: true });
    }

    // 6. UPDATE STATUS / ROLE USER (updateUser)
    if (action === 'updateUser') {
      var sheet = ss.getSheetByName('Users');
      if (sheet && sheet.getLastRow() > 1) {
        var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
        var cleanTargetPhone = params.phone ? String(params.phone).replace(/[^0-9]/g, '') : '';
        for (var i = 0; i < rows.length; i++) {
          var rowId = String(rows[i][0]);
          var rowPhone = rows[i][2] ? String(rows[i][2]).replace(/[^0-9]/g, '') : '';
          var matchId = params.id && rowId === String(params.id);
          var matchPhone = cleanTargetPhone && rowPhone === cleanTargetPhone;
          if (matchId || matchPhone) {
            if (params.role) sheet.getRange(i + 2, 6).setValue(params.role);
            if (params.status) sheet.getRange(i + 2, 7).setValue(params.status);
            break;
          }
        }
      }
      return jsonResponse({ success: true });
    }

    // 7. HAPUS AKUN USER (deleteUser)
    if (action === 'deleteUser') {
      var sheet = ss.getSheetByName('Users');
      if (sheet && sheet.getLastRow() > 1) {
        var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
        var cleanTargetPhone = params.phone ? String(params.phone).replace(/[^0-9]/g, '') : '';
        for (var i = 0; i < rows.length; i++) {
          var rowId = String(rows[i][0]);
          var rowPhone = rows[i][2] ? String(rows[i][2]).replace(/[^0-9]/g, '') : '';
          var matchId = params.id && rowId === String(params.id);
          var matchPhone = cleanTargetPhone && rowPhone === cleanTargetPhone;
          if (matchId || matchPhone) {
            sheet.deleteRow(i + 2);
            break;
          }
        }
      }
      return jsonResponse({ success: true });
    }

    // 8. SIMPAN / EDIT PRODUK (saveProduct)
    if (action === 'saveProduct') {
      var sheet = ss.getSheetByName('Produk') || ss.insertSheet('Produk');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['id', 'name', 'category', 'price', 'weight', 'badge', 'image', 'description', 'isAvailable']);
      }
      var existingRow = -1;
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var p = 0; p < ids.length; p++) {
          if (String(ids[p][0]) === String(params.id)) {
            existingRow = p + 2;
            break;
          }
        }
      }

      var rowData = [
        params.id || ('ck-' + Date.now().toString().slice(-6)),
        params.name || 'Kue Tanpa Nama',
        params.category || 'Klasik',
        Number(params.price) || 0,
        params.weight || 'Toples 500gr',
        params.badge || '',
        params.image || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80',
        params.description || '',
        params.isAvailable === false ? 'FALSE' : 'TRUE'
      ];

      if (existingRow > 0) {
        sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
      }
      return jsonResponse({ success: true });
    }

    // 9. HAPUS PRODUK (deleteProduct)
    if (action === 'deleteProduct') {
      var sheet = ss.getSheetByName('Produk');
      if (sheet && sheet.getLastRow() > 1) {
        var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
        for (var i = 0; i < rows.length; i++) {
          if (String(rows[i][0]) === String(params.id)) {
            sheet.deleteRow(i + 2);
            break;
          }
        }
      }
      return jsonResponse({ success: true });
    }

    // 10. TOGGLE KETERSEDIAAN PRODUK (toggleProduct)
    if (action === 'toggleProduct') {
      var sheet = ss.getSheetByName('Produk');
      if (sheet && sheet.getLastRow() > 1) {
        var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
        for (var i = 0; i < rows.length; i++) {
          if (String(rows[i][0]) === String(params.id)) {
            var currentVal = sheet.getRange(i + 2, 9).getValue();
            var newVal = (String(currentVal).toUpperCase() === 'FALSE') ? 'TRUE' : 'FALSE';
            sheet.getRange(i + 2, 9).setValue(newVal);
            break;
          }
        }
      }
      return jsonResponse({ success: true });
    }

    // 11. SIMPAN SETTINGS & BANNER SLIDES (saveSettings)
    if (action === 'saveSettings') {
      var sheet = ss.getSheetByName('Settings') || ss.insertSheet('Settings');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['key', 'value', 'updatedAt']);
      }
      var existingData = sheet.getLastRow() > 1
        ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues()
        : [];
      
      var keyMap = {};
      for (var k = 0; k < existingData.length; k++) {
        if (existingData[k][0]) {
          keyMap[String(existingData[k][0])] = k + 2;
        }
      }

      var settingsToSave = params.settings || params;
      var allowedKeys = ['bannerSlides', 'logoUrl', 'bannerBadge', 'bannerTitle', 'bannerDesc', 'bannerButtonText', 'bannerFit', 'bannerOverlay', 'showBannerText', 'storeName', 'storeTagline', 'adminWhatsApp', 'adminPin'];
      
      for (var i = 0; i < allowedKeys.length; i++) {
        var key = allowedKeys[i];
        if (settingsToSave[key] !== undefined) {
          var val = settingsToSave[key];
          if (typeof val === 'object') {
            val = JSON.stringify(val);
          } else {
            val = String(val);
          }
          if (keyMap[key]) {
            sheet.getRange(keyMap[key], 2, 1, 2).setValues([[val, new Date().toISOString()]]);
          } else {
            sheet.appendRow([key, val, new Date().toISOString()]);
          }
        }
      }
      return jsonResponse({ success: true });
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  return (
    <div className="space-y-6">
      {/* 2. GOOGLE SPREADSHEET INTEGRATION CARD */}
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
              File spreadsheet: <strong className="text-amber-300 font-mono">{storeForm.spreadsheetId || '1qNF4XHN3vjB91rjluYgVLJRJMC971dgVsXsGIppB9wg'}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`https://docs.google.com/spreadsheets/d/${storeForm.spreadsheetId || '1qNF4XHN3vjB91rjluYgVLJRJMC971dgVsXsGIppB9wg'}/edit`}
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

      {/* 5. CONFIGURATION SETTINGS */}
      <div className="bg-white rounded-3xl p-6 border border-cookie-100 shadow-xs space-y-6">
        {/* BRANDING: LOGO & BANNER SLIDES MANAGEMENT */}
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-200/60 text-amber-900">
                <Sparkles className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-cookie-950">
                  Logo Toko & Foto Slide Banner Coklat
                </h4>
                <p className="text-xs text-neutral-600">
                  Ubah logo toko (muncul di navbar & admin) serta kelola foto slide yang tampil bergantian pada banner coklat.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenBannerModal}
              className="bg-cookie-800 hover:bg-cookie-900 text-amber-200 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-cookie-700 shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Buka Pengelola Slide & Logo</span>
            </button>
          </div>

          {/* Quick Logo Preview & URL */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2 border-t border-amber-200/60">
            {/* Logo Preview */}
            <div className="md:col-span-4 flex items-center gap-3 bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cookie-800 to-cookie-500 flex items-center justify-center text-white shadow-md overflow-hidden border border-cookie-200 shrink-0">
                {storeForm.logoUrl ? (
                  <img src={storeForm.logoUrl} alt="Logo Toko" className="w-full h-full object-cover" />
                ) : (
                  <Cookie className="w-7 h-7" />
                )}
              </div>
              <div className="text-xs">
                <p className="font-bold text-cookie-950">Logo Saat Ini</p>
                <p className="text-[11px] text-neutral-500">
                  {storeForm.logoUrl ? 'Logo Kustom Aktif' : 'Ikon Default (Kue)'}
                </p>
                {storeForm.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setStoreForm((prev) => ({ ...prev, logoUrl: '' }))}
                    className="text-[11px] text-red-600 hover:underline font-bold mt-0.5"
                  >
                    Hapus Logo
                  </button>
                )}
              </div>
            </div>

            {/* Upload or Input URL */}
            <div className="md:col-span-8 space-y-2">
              <label className="block text-xs font-bold text-neutral-700">
                Ubah Logo: Upload File Gambar atau Tempel Link URL
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <label className="bg-cookie-700 hover:bg-cookie-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih File Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAdminLogoUpload}
                  />
                </label>
                <input
                  type="text"
                  value={storeForm.logoUrl}
                  onChange={(e) => setStoreForm({ ...storeForm, logoUrl: e.target.value })}
                  placeholder="Atau tempel Link URL Logo (https://...)"
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-neutral-300 font-mono focus:ring-1 focus:ring-cookie-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Quick Edit Banner Text Inputs */}
          <div className="pt-3 border-t border-amber-200/60 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-xs text-cookie-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Tulisan pada Banner Coklat Depan (Tampilan Utama):</span>
              </h5>
              <button
                type="button"
                onClick={onOpenBannerModal}
                className="text-cookie-700 hover:text-cookie-900 font-bold text-[11px] underline"
              >
                Atur Foto Slide & Preview Lengkap
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                  1. Label Badge Promo
                </label>
                <input
                  type="text"
                  value={storeForm.bannerBadge}
                  onChange={(e) => setStoreForm({ ...storeForm, bannerBadge: e.target.value })}
                  placeholder="Edisi Spesial Kue Kering & Hampers Premium"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 bg-white shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                  2. Teks Tombol Menu Katalog
                </label>
                <input
                  type="text"
                  value={storeForm.bannerButtonText}
                  onChange={(e) => setStoreForm({ ...storeForm, bannerButtonText: e.target.value })}
                  placeholder="Lihat Menu Katalog"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 bg-white shadow-2xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                  3. Judul Utama Banner (Heading Besar)
                </label>
                <input
                  type="text"
                  value={storeForm.bannerTitle}
                  onChange={(e) => setStoreForm({ ...storeForm, bannerTitle: e.target.value })}
                  placeholder="Kelezatan Gurih & Renyah di Setiap Gigitan"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 font-serif font-bold text-cookie-950 bg-white shadow-2xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                  4. Deskripsi / Subtitle Banner
                </label>
                <textarea
                  rows={2}
                  value={storeForm.bannerDesc}
                  onChange={(e) => setStoreForm({ ...storeForm, bannerDesc: e.target.value })}
                  placeholder="Pilih aneka toples kue favorit Anda, tentukan jumlahnya, dan pesanan akan otomatis terkirim rapi ke WhatsApp kami!"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 bg-white shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-cookie-100">
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
    </div>
  );
}
