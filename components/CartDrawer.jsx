'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/storeContext';
import { ShoppingBag, X, Trash2, Send, Plus, Minus, UserCheck, CheckCircle2 } from 'lucide-react';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    cartTotalQty,
    cartTotalPrice,
    updateCartQty,
    removeFromCart,
    clearCart,
    addOrder,
    settings,
    currentUser,
    formatRupiah,
    getProductPrice,
    isReseller
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto prefill from currentUser
  useEffect(() => {
    if (currentUser) {
      if (currentUser.fullName) setCustomerName(currentUser.fullName);
      if (currentUser.phone) setCustomerPhone(currentUser.phone);
      if (currentUser.address) setCustomerAddress(currentUser.address);
    }
  }, [currentUser, isCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckoutWhatsApp = () => {
    if (cart.length === 0) {
      alert('Keranjang belanja Anda masih kosong.');
      return;
    }

    if (!customerName.trim()) {
      alert('Mohon masukkan Nama Lengkap Pemesan.');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const invoiceId = 'AYR-' + now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') + '-' +
      Math.floor(100 + Math.random() * 900);

    // Save into Order History
    const newOrder = {
      invoiceId,
      userId: currentUser?.id || null,
      userPhone: (currentUser?.phone || customerPhone || '').replace(/[^0-9]/g, ''),
      createdAt: now.toISOString(),
      timestamp: now.getTime(),
      date: now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      customer: {
        name: customerName.trim(),
        phone: customerPhone.trim() || '-',
        address: customerAddress.trim() || 'Diambil di toko / Konfirmasi via chat',
        role: currentUser?.role || 'user'
      },
      items: cart.map(item => {
        const unitPrice = getProductPrice(item.product);
        return {
          id: item.product.id,
          name: item.product.name,
          price: unitPrice,
          regularPrice: item.product.price,
          qty: item.qty,
          subtotal: item.qty * unitPrice
        };
      }),
      totalQty: cartTotalQty,
      totalPrice: cartTotalPrice,
      status: 'Waiting List'
    };

    addOrder(newOrder);

    // Build Formatted WhatsApp Message
    let message = `*HALO ${settings.storeName.toUpperCase()}, SAYA MAU PESAN!* 🍪\n`;
    message += `No. Pesanan: *#${invoiceId}*\n`;
    if (isReseller) {
      message += `Tipe Akun: *🤝 MITRA RESELLER (Harga Khusus Reseller)*\n`;
    } else {
      message += `Tipe Akun: *👤 PEMBELI REGULER*\n`;
    }
    message += `----------------------------------------\n`;
    message += `*RINCIAN PESANAN:*\n`;

    cart.forEach((item, idx) => {
      const unitPrice = getProductPrice(item.product);
      message += `${idx + 1}. *${item.product.name}*\n`;
      message += `   ↳ ${item.qty} toples x ${formatRupiah(unitPrice)} = *${formatRupiah(item.qty * unitPrice)}*`;
      if (isReseller && item.product.resellerPrice) {
        message += ` _(Khusus Reseller)_\n`;
      } else {
        message += `\n`;
      }
    });

    message += `----------------------------------------\n`;
    message += `*Total Item:* ${cartTotalQty} toples\n`;
    message += `*TOTAL TAGIHAN:* *${formatRupiah(cartTotalPrice)}*\n`;
    message += `*STATUS:* ⏳ *Waiting List (Menunggu Konfirmasi Admin)*\n\n`;

    message += `*DATA PEMESAN:*\n`;
    message += `👤 Nama: *${customerName.trim()}*\n`;
    message += `🏷️ Status: *${isReseller ? 'Mitra Reseller' : 'Pembeli'}*\n`;
    if (customerPhone.trim()) {
      message += `📞 No. Kontak: ${customerPhone.trim()}\n`;
    }
    message += `📍 Alamat / Catatan:\n${customerAddress.trim() || 'Diambil langsung / Konfirmasi via WhatsApp'}\n\n`;
    message += `Mohon info ketersediaan stok & nomor rekening pembayaran ya. Terima kasih! 🙏`;

    const encodedMsg = encodeURIComponent(message);
    const targetWa = (settings.adminWhatsApp || '6281234567890').replace(/[^0-9]/g, '');
    const waUrl = `https://api.whatsapp.com/send?phone=${targetWa}&text=${encodedMsg}`;

    // Reset Form & Clear Cart
    clearCart();
    setIsSubmitting(false);
    setIsCartOpen(false);

    // Open WhatsApp
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 bg-cookie-50 border-b border-cookie-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cookie-700" />
              <h2 className="font-bold text-lg text-cookie-900">Keranjang Belanja</h2>
              <span className="text-xs bg-cookie-200 text-cookie-900 px-2 py-0.5 rounded-full font-bold">
                {cartTotalQty} item
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-neutral-800 rounded-lg hover:bg-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 bg-cookie-50 rounded-full flex items-center justify-center mx-auto text-cookie-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-bold text-neutral-700 text-sm">Keranjang Anda masih kosong</p>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                  Silakan pilih aneka kue favorit di katalog untuk menambahkannya ke keranjang.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 text-xs bg-cookie-700 hover:bg-cookie-800 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition"
                >
                  Mulai Belanja
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const unitPrice = getProductPrice(item.product);
                return (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-cookie-100 shadow-xs hover:border-cookie-200 transition"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover bg-cookie-50 shrink-0"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-cookie-900 truncate">
                          {item.product.name}
                        </h4>
                        {isReseller && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">
                            Reseller
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-cookie-600 font-medium">
                        {formatRupiah(unitPrice)}{' '}
                        <span className="text-neutral-400 font-normal">
                          / {item.product.weight || 'toples'}
                        </span>
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center bg-cookie-50 border border-cookie-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateCartQty(item.product.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-xs font-bold text-cookie-800 hover:bg-cookie-200 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-cookie-900">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateCartQty(item.product.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-xs font-bold text-cookie-800 hover:bg-cookie-200 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-extrabold text-cookie-800">
                          {formatRupiah(item.qty * unitPrice)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-neutral-300 hover:text-red-500 rounded-lg transition"
                      title="Hapus kue dari keranjang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Checkout Section & Customer Form */}
          {cart.length > 0 && (
            <div className="border-t border-cookie-100 p-4 bg-cookie-50/70 space-y-3">
              {/* Totals */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Total Produk</span>
                  <span>{cartTotalQty} toples</span>
                </div>
                <div className="flex justify-between text-base font-bold text-cookie-900">
                  <span>Total Tagihan</span>
                  <span className="text-cookie-700 font-extrabold text-lg">
                    {formatRupiah(cartTotalPrice)}
                  </span>
                </div>
              </div>

              {/* Customer Input */}
              <div className="border-t border-dashed border-cookie-200 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-cookie-800 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    Data Pemesan:
                  </p>
                  {currentUser && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Otomatis Terisi
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nama Lengkap Pemesan *"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-cookie-200 bg-white focus:outline-none focus:ring-2 focus:ring-cookie-500 shadow-xs"
                />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="No. WhatsApp Anda *"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-cookie-200 bg-white focus:outline-none focus:ring-2 focus:ring-cookie-500 shadow-xs"
                />
                <textarea
                  rows={2}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Alamat Pengiriman Lengkap & Catatan (cth: packing bubble wrap tebal)"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-cookie-200 bg-white focus:outline-none focus:ring-2 focus:ring-cookie-500 shadow-xs resize-none"
                />
              </div>

              {/* WhatsApp Checkout Button */}
              <button
                disabled={isSubmitting}
                onClick={handleCheckoutWhatsApp}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-600/30 transition text-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Pesan Sekarang via WhatsApp</span>
              </button>
              <p className="text-[10px] text-center text-neutral-400">
                Pesanan akan otomatis tercatat di histori & membuka WhatsApp penjual
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
