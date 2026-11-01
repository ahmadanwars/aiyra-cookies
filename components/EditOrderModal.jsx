'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/storeContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Save,
  Package,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Edit3,
  MapPin,
  User,
  Phone
} from 'lucide-react';

export default function EditOrderModal({ isOpen, onClose, order, onSaved }) {
  const { products, updateOrder, formatRupiah, settings } = useStore();

  const [items, setItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [sendWaNotice, setSendWaNotice] = useState(true);

  // Sync state whenever order prop changes
  useEffect(() => {
    if (order) {
      const initialItems = order.items && order.items.length > 0
        ? order.items.map((it) => ({
            id: it.id,
            name: it.name,
            price: Number(it.price) || 0,
            qty: Number(it.qty) || 1,
            weight: it.weight || 'Toples 500gr',
            subtotal: (Number(it.price) || 0) * (Number(it.qty) || 1)
          }))
        : [];
      setItems(initialItems);
      setCustomerName(order.customer?.name || '');
      setCustomerPhone(order.customer?.phone || '');
      setCustomerAddress(order.customer?.address || '');
      setErrorMsg('');
      setSelectedProductId('');
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const isResellerOrder = order.customer?.role === 'reseller' || order.isReseller;

  // Real-time calculations
  const totalQty = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
  const totalPrice = items.reduce((sum, it) => sum + ((Number(it.price) || 0) * (Number(it.qty) || 0)), 0);

  // Quantity controllers
  const handleUpdateQty = (index, delta) => {
    setErrorMsg('');
    const updated = [...items];
    const newQty = (updated[index].qty || 1) + delta;

    if (newQty <= 0) {
      // Remove item if qty reaches 0
      updated.splice(index, 1);
    } else {
      updated[index].qty = newQty;
      updated[index].subtotal = updated[index].price * newQty;
    }
    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    setErrorMsg('');
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  // Add new product from catalog to this order
  const handleAddProduct = () => {
    setErrorMsg('');
    if (!selectedProductId) return;

    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const unitPrice = isResellerOrder
      ? Number(prod.resellerPrice) || Math.round((Number(prod.price) || 0) * 0.85)
      : Number(prod.price) || 0;

    const existingIdx = items.findIndex((it) => it.id === prod.id || it.name === prod.name);

    let updated = [...items];
    if (existingIdx > -1) {
      updated[existingIdx].qty += 1;
      updated[existingIdx].subtotal = updated[existingIdx].price * updated[existingIdx].qty;
    } else {
      updated.push({
        id: prod.id,
        name: prod.name,
        price: unitPrice,
        qty: 1,
        weight: prod.weight || 'Toples 500gr',
        subtotal: unitPrice
      });
    }

    setItems(updated);
    setSelectedProductId('');
  };

  // Save changes
  const handleSave = () => {
    if (items.length === 0) {
      setErrorMsg('Pesanan harus memiliki minimal 1 produk. Jika ingin membatalkan pesanan ini, silakan gunakan tombol Tolak.');
      return;
    }

    const itemsSummary = items.map((it) => `${it.name} (${it.qty}x)`).join(', ');

    const updatedData = {
      customer: {
        ...order.customer,
        name: customerName.trim() || order.customer?.name || 'Pelanggan',
        phone: customerPhone.trim() || order.customer?.phone || '',
        address: customerAddress.trim() || order.customer?.address || 'Diambil di toko'
      },
      items,
      totalQty,
      totalPrice,
      itemsSummary
    };

    updateOrder(order.invoiceId, updatedData);

    // If WhatsApp notice is checked and customer phone exists
    const cleanPhone = (customerPhone || order.customer?.phone || '').replace(/[^0-9]/g, '');
    if (sendWaNotice && cleanPhone) {
      const waText = encodeURIComponent(
        `Halo Kak *${customerName || order.customer?.name}*, berikut konfirmasi pembaruan rincian pesanan Anda di *${settings.storeName || 'Aiyra Cookies'}*:\n\n` +
        `🔖 *No. Invoice:* #${order.invoiceId}\n` +
        `📅 *Tanggal:* ${order.date}\n\n` +
        `📦 *Rincian Pesanan yang Telah Diperbarui:*\n` +
        items.map((it, idx) => `${idx + 1}. ${it.name} (${it.qty}x) = ${formatRupiah(it.price * it.qty)}`).join('\n') +
        `\n\n` +
        `💰 *Total Pembayaran Baru: ${formatRupiah(totalPrice)}*\n` +
        `📍 *Alamat / Catatan:* ${customerAddress || '-'}\n\n` +
        `Pesanan Anda telah kami perbarui dalam sistem antrean dan sedang diproses. Terima kasih! 🙏✨`
      );
      window.open(`https://wa.me/${cleanPhone}?text=${waText}`, '_blank');
    }

    if (onSaved) onSaved(updatedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 border border-cookie-100 animate-fade-in">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-cookie-950 via-cookie-900 to-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-300/30">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg">
                  Edit Produk & Rincian Pesanan
                </h3>
                <span className="font-mono bg-white/20 text-amber-200 text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border border-white/10">
                  #{order.invoiceId}
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Ubah jumlah, kurangi atau tambah varian kue tanpa perlu membuat pesanan ulang
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          
          {/* Customer Info Box */}
          <div className="p-3.5 bg-cookie-50/60 rounded-2xl border border-cookie-100 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-neutral-600 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-cookie-700" />
                  <span>Nama Pemesan:</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nama pemesan"
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 bg-white font-semibold text-cookie-950 focus:ring-1 focus:ring-cookie-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-600 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-cookie-700" />
                  <span>No. WhatsApp:</span>
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 bg-white font-mono text-neutral-800 focus:ring-1 focus:ring-cookie-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-600 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cookie-700" />
                <span>Alamat / Catatan Pengiriman:</span>
              </label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Alamat lengkap atau catatan pesanan"
                className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 bg-white text-neutral-800 focus:ring-1 focus:ring-cookie-500"
              />
            </div>
          </div>

          {/* Section: Items Table */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-cookie-950 text-xs sm:text-sm flex items-center gap-1.5">
                <Package className="w-4 h-4 text-cookie-600" />
                <span>Daftar Kue dalam Pesanan ({totalQty} toples)</span>
              </h4>
              {isResellerOrder && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  🤝 Harga Mitra Reseller
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="text-center py-6 text-neutral-400 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                  <p className="font-semibold text-xs">Belum ada kue di pesanan ini.</p>
                  <p className="text-[11px]">Gunakan pilihan di bawah untuk menambahkan produk kue.</p>
                </div>
              ) : (
                items.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-neutral-200 hover:border-cookie-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition shadow-2xs"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-cookie-950 text-xs sm:text-sm">{it.name}</p>
                      <p className="text-[11px] text-neutral-500">
                        {formatRupiah(it.price)} / toples {it.weight ? `• ${it.weight}` : ''}
                      </p>
                    </div>

                    {/* Quantity & Subtotal Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      {/* Qty +/- */}
                      <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(idx, -1)}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-cookie-100 text-cookie-800 flex items-center justify-center font-bold text-xs transition shadow-2xs"
                          title="Kurangi toples"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-bold font-mono text-xs">
                          {it.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(idx, 1)}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-cookie-100 text-cookie-800 flex items-center justify-center font-bold text-xs transition shadow-2xs"
                          title="Tambah toples"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="w-24 text-right">
                        <span className="font-extrabold text-cookie-900 text-xs sm:text-sm">
                          {formatRupiah(it.price * it.qty)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                        title="Hapus produk ini dari pesanan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Product Dropdown */}
            <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2 mt-2">
              <label className="text-[11px] font-bold text-amber-950 block">
                + Tambah Menu Kue Lain ke Pesanan Ini:
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 bg-white text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-cookie-500"
                >
                  <option value="">-- Pilih Varian Kue untuk Ditambahkan --</option>
                  {products
                    .filter((p) => p.isAvailable !== false)
                    .map((p) => {
                      const pPrice = isResellerOrder
                        ? Number(p.resellerPrice) || Math.round((Number(p.price) || 0) * 0.85)
                        : Number(p.price) || 0;
                      return (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.weight || '500gr'}) — {formatRupiah(pPrice)}
                        </option>
                      );
                    })}
                </select>

                <button
                  type="button"
                  onClick={handleAddProduct}
                  disabled={!selectedProductId}
                  className="bg-cookie-800 hover:bg-cookie-900 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>
            </div>

          </div>

          {/* Real-time Order Summary */}
          <div className="p-4 bg-cookie-50 rounded-2xl border border-cookie-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-neutral-500 block">Total Pembayaran Baru:</span>
              <span className="font-serif font-extrabold text-cookie-950 text-base sm:text-lg">
                {formatRupiah(totalPrice)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-neutral-500 block">Total Jumlah:</span>
              <span className="font-extrabold text-neutral-800 text-sm">
                {totalQty} Toples
              </span>
            </div>
          </div>

          {/* Option: Notify via WhatsApp */}
          {customerPhone && (
            <label className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 cursor-pointer hover:bg-neutral-100 transition">
              <input
                type="checkbox"
                checked={sendWaNotice}
                onChange={(e) => setSendWaNotice(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-neutral-300 focus:ring-emerald-500"
              />
              <span className="text-xs text-neutral-700 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Otomatis kirim rincian pesanan baru ke WhatsApp pemesan setelah disimpan</span>
              </span>
            </label>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-cookie-50/50 border-t border-cookie-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-bold text-xs transition"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="bg-cookie-800 hover:bg-cookie-900 text-white font-bold px-6 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Pesanan</span>
          </button>
        </div>

      </div>
    </div>
  );
}

