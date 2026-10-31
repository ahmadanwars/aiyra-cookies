'use client';

import React from 'react';
import { useStore } from '../lib/storeContext';
import { History, X, Trash2, RotateCw, CheckCircle2, Clock, PackageCheck, AlertCircle } from 'lucide-react';

export default function OrderHistoryModal() {
  const {
    orders,
    currentUser,
    isHistoryOpen,
    setIsHistoryOpen,
    reorder,
    formatRupiah
  } = useStore();

  if (!isHistoryOpen) return null;

  // Filter orders to ONLY show the currently logged in user's orders
  const cleanUserPhone = currentUser?.phone ? currentUser.phone.replace(/[^0-9]/g, '') : '';
  const userOrders = orders.filter((order) => {
    if (!currentUser) return false;

    // 1. Match by explicit userId
    if (order.userId && order.userId === currentUser.id) return true;

    // 2. Match by userPhone
    if (cleanUserPhone && order.userPhone && order.userPhone === cleanUserPhone) return true;

    // 3. Match by customer phone
    const cleanOrderPhone = order.customer?.phone ? order.customer.phone.replace(/[^0-9]/g, '') : '';
    if (cleanUserPhone && cleanOrderPhone && cleanUserPhone === cleanOrderPhone) return true;

    return false;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Waiting List':
      case 'Terkirim ke WhatsApp':
        return {
          label: 'Menunggu Konfirmasi',
          className: 'bg-amber-100 text-amber-950 border border-amber-300',
          icon: Clock
        };
      case 'Disetujui':
      case 'Sedang Diproses':
        return {
          label: 'Sedang Diproses',
          className: 'bg-blue-100 text-blue-900 border border-blue-300',
          icon: PackageCheck
        };
      case 'Selesai':
        return {
          label: 'Pesanan Selesai',
          className: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
          icon: CheckCircle2
        };
      case 'Dibatalkan':
        return {
          label: 'Dibatalkan',
          className: 'bg-red-100 text-red-700 border border-red-200',
          icon: AlertCircle
        };
      default:
        return {
          label: status || 'Waiting List',
          className: 'bg-neutral-100 text-neutral-800 border border-neutral-200',
          icon: Clock
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={() => setIsHistoryOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10 border border-cookie-100">
        
        {/* Modal Header */}
        <div className="p-4 bg-cookie-50 border-b border-cookie-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cookie-200 text-cookie-800">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-cookie-900 text-base">Pesanan Saya</h3>
              <p className="text-xs text-neutral-500">
                Akun: <strong>{currentUser?.fullName || 'Pengguna'}</strong> ({currentUser?.phone || '-'})
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsHistoryOpen(false)}
            className="p-2 text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {userOrders.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 space-y-3">
              <div className="w-16 h-16 bg-cookie-50 rounded-full flex items-center justify-center mx-auto text-cookie-300">
                <History className="w-8 h-8 stroke-1" />
              </div>
              <div>
                <p className="font-bold text-sm text-cookie-950">Belum ada riwayat pesanan</p>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
                  Halo <strong>{currentUser?.fullName}</strong>, Anda belum melakukan pemesanan kue. Silakan pilih aneka toples kue di katalog dan checkout ke WhatsApp kami.
                </p>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="mt-2 text-xs font-bold bg-cookie-700 hover:bg-cookie-800 text-white px-4 py-2 rounded-xl transition"
              >
                Mulai Belanja Sekarang
              </button>
            </div>
          ) : (
            userOrders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={order.invoiceId}
                  className="bg-white border border-cookie-100 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs hover:border-cookie-300 transition"
                >
                  {/* Header item: Invoice & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cookie-50 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-extrabold text-cookie-950">
                          #{order.invoiceId}
                        </span>
                        {order.customer?.role === 'reseller' && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                            Reseller
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-400 block mt-0.5">{order.date}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full ${statusInfo.className}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{statusInfo.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Items Breakdown */}
                  <div className="space-y-2 text-xs bg-cookie-50/40 p-3 rounded-xl border border-cookie-100/50">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-cookie-800/70">
                      Rincian Menu Kue ({order.totalQty || order.items?.reduce((s, i) => s + i.qty, 0)} toples):
                    </p>
                    {order.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-neutral-700">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-cookie-950">{it.name}</span>
                          <span className="text-neutral-400 font-bold text-[11px]">x{it.qty}</span>
                        </div>
                        <span className="font-bold text-cookie-900">
                          {formatRupiah(it.subtotal || it.price * it.qty)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer: Total Price & Reorder Button */}
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <div>
                      <span className="text-neutral-400 text-[11px] block leading-none">Total Tagihan:</span>
                      <span className="font-extrabold text-cookie-900 text-sm sm:text-base mt-0.5 block">
                        {formatRupiah(order.totalPrice)}
                      </span>
                    </div>

                    <button
                      onClick={() => reorder(order)}
                      className="bg-cookie-100 hover:bg-cookie-200 text-cookie-900 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition text-xs shadow-2xs"
                      title="Masukkan menu dari pesanan ini kembali ke keranjang"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-cookie-700" />
                      <span>Pesan Lagi</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-cookie-50/50 border-t border-cookie-100 flex items-center justify-between text-xs">
          <p className="text-[11px] text-neutral-400">
            Total pesanan Anda: <strong>{userOrders.length} transaksi</strong>
          </p>
          <button
            onClick={() => setIsHistoryOpen(false)}
            className="bg-cookie-700 text-white px-5 py-2 rounded-xl font-bold hover:bg-cookie-800 transition shadow-xs"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}

