'use client';

import React, { useState } from 'react';
import { useStore } from '../lib/storeContext';
import {
  Clock,
  X,
  CheckCircle2,
  Hourglass,
  Truck,
  Sparkles,
  XCircle,
  Package,
  Search,
  Users
} from 'lucide-react';

export default function WaitingListModal() {
  const {
    orders,
    isWaitingListOpen,
    setIsWaitingListOpen,
    sortOrdersEarliestFirst,
    formatRupiah
  } = useStore();

  const [filterTab, setFilterTab] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isWaitingListOpen) return null;

  // Filter orders by tab and search
  const filteredOrders = orders.filter((order) => {
    const isWaiting = order.status === 'Waiting List' || order.status === 'Terkirim ke WhatsApp';
    const isApproved = order.status === 'Disetujui' || order.status === 'Sedang Diproses';
    const isCompleted = order.status === 'Selesai';

    const matchesTab =
      filterTab === 'Semua' ||
      (filterTab === 'Waiting List' && isWaiting) ||
      (filterTab === 'Disetujui' && isApproved) ||
      (filterTab === 'Selesai' && isCompleted);

    const customerName = order.customer?.name || '';
    const invoiceId = order.invoiceId || '';
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoiceId.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Sort orders: Urutkan dari yang pesan terdahulu baru yang baru pesan (Earliest First / FIFO)
  const sortedOrders = sortOrdersEarliestFirst(filteredOrders, orders);

  const waitingCount = orders.filter((o) => o.status === 'Waiting List' || o.status === 'Terkirim ke WhatsApp').length;
  const approvedCount = orders.filter((o) => o.status === 'Disetujui' || o.status === 'Sedang Diproses').length;
  const completedCount = orders.filter((o) => o.status === 'Selesai').length;

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Waiting List':
      case 'Terkirim ke WhatsApp':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full animate-pulse">
            <Hourglass className="w-3 h-3 text-amber-600" />
            <span>Waiting List</span>
          </span>
        );
      case 'Disetujui':
      case 'Sedang Diproses':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Disetujui (Diproses)</span>
          </span>
        );
      case 'Sedang Dikirim':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 border border-purple-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
            <Truck className="w-3 h-3 text-purple-600" />
            <span>Sedang Dikirim</span>
          </span>
        );
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Selesai</span>
          </span>
        );
      case 'Dibatalkan':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-900 border border-red-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
            <XCircle className="w-3 h-3 text-red-600" />
            <span>Dibatalkan</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
            <span>{status || 'Diproses'}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={() => setIsWaitingListOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] z-10 border border-cookie-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-cookie-950 via-cookie-900 to-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 text-amber-300 border border-white/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg sm:text-xl">
                  Daftar Antrean Pesanan (Waiting List)
                </h3>
                <span className="bg-amber-400 text-cookie-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  Publik
                </span>
              </div>
              <p className="text-xs text-amber-200/90 mt-0.5">
                Status antrean pesanan seluruh pelanggan secara live & transparan
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsWaitingListOpen(false)}
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls & Search */}
        <div className="p-4 bg-cookie-50/70 border-b border-cookie-100 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setFilterTab('Semua')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  filterTab === 'Semua'
                    ? 'bg-cookie-800 text-white shadow-xs'
                    : 'bg-white text-cookie-900 border border-cookie-200 hover:bg-cookie-100'
                }`}
              >
                Semua ({orders.length})
              </button>
              <button
                onClick={() => setFilterTab('Waiting List')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
                  filterTab === 'Waiting List'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-50'
                }`}
              >
                <span>⏳ Waiting List</span>
                <span className="bg-amber-200/60 text-amber-950 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                  {waitingCount}
                </span>
              </button>
              <button
                onClick={() => setFilterTab('Disetujui')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  filterTab === 'Disetujui'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-blue-900 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                ✅ Disetujui ({approvedCount})
              </button>
              <button
                onClick={() => setFilterTab('Selesai')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  filterTab === 'Selesai'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                ✨ Selesai ({completedCount})
              </button>
            </div>

            {/* Search Invoice or Name */}
            <div className="relative sm:w-56 shrink-0">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama / invoice..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-1 focus:ring-cookie-500"
              />
            </div>

          </div>
        </div>

        {/* Orders Queue List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {sortedOrders.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 space-y-2">
              <Package className="w-12 h-12 mx-auto stroke-1 text-cookie-300" />
              <p className="font-bold text-sm text-neutral-600">Tidak ada pesanan di kategori ini</p>
              <p className="text-xs max-w-sm mx-auto">
                Pesanan yang dibuat oleh pelanggan otomatis akan masuk ke antrean Waiting List dan ditampilkan di sini.
              </p>
            </div>
          ) : (
            sortedOrders.map((order, idx) => (
              <div
                key={order.invoiceId || idx}
                className={`p-4 rounded-2xl border transition space-y-3 ${
                  order.status === 'Waiting List'
                    ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                    : order.status === 'Disetujui' || order.status === 'Sedang Diproses'
                    ? 'bg-blue-50/40 border-blue-200 hover:border-blue-300'
                    : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200/70 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-cookie-800 text-amber-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-2xs">
                      Antrean #{idx + 1}
                    </span>
                    <span className="font-mono text-xs font-bold text-cookie-950 bg-white px-2 py-0.5 rounded-lg border border-neutral-200 shadow-2xs">
                      #{order.invoiceId}
                    </span>
                    <span className="text-xs font-bold text-neutral-800">
                      👤 {order.customer?.name || 'Pelanggan'}
                    </span>
                    <span className="text-[11px] text-neutral-400">• {order.date}</span>
                  </div>

                  <div>
                    {renderStatusBadge(order.status)}
                  </div>
                </div>

                {/* Items Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="text-neutral-600">
                    <span className="font-semibold text-neutral-700">Kue Dipesan: </span>
                    <span>
                      {order.items
                        ? order.items.map((it) => `${it.name} (${it.qty}x)`).join(', ')
                        : order.itemsSummary || '-'}
                    </span>
                  </div>
                </div>

                {/* Status Notice */}
                {order.status === 'Waiting List' && (
                  <div className="p-2 rounded-xl bg-amber-100/70 text-amber-900 text-[11px] flex items-center gap-1.5 font-medium">
                    <Hourglass className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Pesanan baru masuk dalam antrean, menunggu verifikasi & approval dari Admin.</span>
                  </div>
                )}
                {order.status === 'Disetujui' && (
                  <div className="p-2 rounded-xl bg-blue-100/70 text-blue-900 text-[11px] flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span>Pesanan telah disetujui Admin! Kue sedang dipanggang / disiapkan.</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
            <Users className="w-3.5 h-3.5 text-cookie-600" />
            <span>Antrean live diperbarui secara real-time</span>
          </div>
          <button
            onClick={() => setIsWaitingListOpen(false)}
            className="bg-cookie-700 hover:bg-cookie-800 text-white px-5 py-2 rounded-xl font-bold transition shadow-xs"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}

