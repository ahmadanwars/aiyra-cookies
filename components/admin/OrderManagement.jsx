'use client';

import React, { useState } from 'react';
import { useStore } from '../../lib/storeContext';
import {
  Clock,
  Search,
  Trash2,
  Hourglass,
  CheckCircle2,
  Truck,
  Sparkles,
  MessageCircle,
  Edit2,
  User,
  X
} from 'lucide-react';

export default function OrderManagement({ onOpenEditOrder, setToast }) {
  const {
    orders,
    users,
    updateOrderStatus,
    deleteOrder,
    clearOrders,
    sortOrdersEarliestFirst,
    formatRupiah
  } = useStore();

  const [orderFilterTab, setOrderFilterTab] = useState('Waiting List');
  const [orderSearch, setOrderSearch] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');

  const waitingCount = orders.filter((o) => o.status === 'Waiting List' || o.status === 'Terkirim ke WhatsApp').length;
  const approvedCount = orders.filter((o) => o.status === 'Disetujui' || o.status === 'Sedang Diproses').length;

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

    // Filter by User ID (matches order.userId or registered user matching id/phone)
    let matchesUser = true;
    if (userIdFilter.trim()) {
      const targetId = userIdFilter.trim().toLowerCase();
      const directIdMatch = o.userId && o.userId.toLowerCase().includes(targetId);

      const matchingUser = users?.find((u) => u.id && u.id.toLowerCase().includes(targetId));
      const cleanOrderPhone = (o.customer?.phone || o.userPhone || '').replace(/[^0-9]/g, '');
      const userPhoneMatch = matchingUser && matchingUser.phone && cleanOrderPhone &&
        matchingUser.phone.replace(/[^0-9]/g, '') === cleanOrderPhone;

      matchesUser = directIdMatch || userPhoneMatch;
    }

    return matchesTab && matchesSearch && matchesUser;
  });

  // Sort orders: Urutkan dari yang pesan terdahulu baru yang baru pesan (Earliest First / FIFO)
  const sortedOrdersForAdmin = sortOrdersEarliestFirst(filteredOrders, orders);

  const handleApproveOrder = (invoiceId) => {
    updateOrderStatus(invoiceId, 'Disetujui');
    if (setToast) {
      setToast(`✅ Pesanan #${invoiceId} telah DISETUJUI & dipindahkan ke status diproses!`);
    }
  };

  const handleShipOrder = (invoiceId) => {
    updateOrderStatus(invoiceId, 'Sedang Dikirim');
    if (setToast) {
      setToast(`🚚 Pesanan #${invoiceId} ditandai SEDANG DIKIRIM!`);
    }
  };

  const handleCompleteOrder = (invoiceId) => {
    updateOrderStatus(invoiceId, 'Selesai');
    if (setToast) {
      setToast(`✨ Pesanan #${invoiceId} telah SELESAI!`);
    }
  };

  const handleCancelOrder = (invoiceId) => {
    if (confirm(`Apakah Anda yakin ingin membatalkan pesanan #${invoiceId}?`)) {
      updateOrderStatus(invoiceId, 'Dibatalkan');
      if (setToast) {
        setToast(`❌ Pesanan #${invoiceId} telah DIBATALKAN.`);
      }
    }
  };

  const handleDeleteSingleOrder = (invoiceId) => {
    if (confirm(`Hapus pesanan #${invoiceId} secara permanen?`)) {
      deleteOrder(invoiceId);
      if (setToast) {
        setToast(`🗑️ Pesanan #${invoiceId} telah dihapus.`);
      }
    }
  };

  const handleClearAllOrders = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan semua riwayat antrean pesanan? Tindakan ini akan menghapus semua pesanan saat ini.')) {
      clearOrders();
      if (setToast) {
        setToast('🧹 Semua riwayat pesanan telah berhasil dikosongkan.');
      }
    }
  };

  return (
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
          {/* Status Tab Filter */}
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

          {/* Search by Name / Invoice */}
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Cari nama / invoice..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-cookie-500"
            />
          </div>

          {/* Filter by ID User */}
          <div className="relative flex-1 sm:w-44">
            <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              list="order-user-id-suggestions"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              placeholder="Filter ID User (cth: usr-1)..."
              className="w-full text-xs pl-8 pr-7 py-1.5 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-cookie-500 font-mono shadow-2xs"
            />
            <datalist id="order-user-id-suggestions">
              {users && users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.phone})
                </option>
              ))}
            </datalist>
            {userIdFilter && (
              <button
                type="button"
                onClick={() => setUserIdFilter('')}
                className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-700 text-xs font-bold"
                title="Hapus filter ID User"
              >
                ✕
              </button>
            )}
          </div>

          {/* Clear Antrean Button */}
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

      {/* Active User ID Filter Notification Banner */}
      {userIdFilter && (
        <div className="px-4 sm:px-6 py-2 bg-cookie-50 border-b border-cookie-100 flex items-center justify-between text-xs text-cookie-900">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-cookie-700" />
            <span>
              Menampilkan riwayat pesanan khusus untuk User ID: <strong className="font-mono bg-white px-2 py-0.5 rounded border border-cookie-200 text-cookie-950">{userIdFilter}</strong>
              <span className="ml-2 text-neutral-500">({filteredOrders.length} pesanan ditemukan)</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setUserIdFilter('')}
            className="text-cookie-700 hover:text-cookie-950 font-bold underline flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filter ID</span>
          </button>
        </div>
      )}

      {/* Orders Approval List */}
      <div className="p-4 sm:p-6 space-y-3.5">
        {sortedOrdersForAdmin.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 space-y-1.5">
            <Hourglass className="w-10 h-10 mx-auto text-cookie-300" />
            <p className="font-bold text-sm text-neutral-600">Tidak ada antrean pesanan di filter ini</p>
            <p className="text-xs">
              {userIdFilter
                ? `Tidak ada pesanan yang cocok dengan ID User "${userIdFilter}".`
                : 'Pesanan yang dibuat oleh pembeli akan otomatis muncul di sini untuk di-approve.'}
            </p>
            {userIdFilter && (
              <button
                type="button"
                onClick={() => setUserIdFilter('')}
                className="mt-2 text-xs font-bold text-cookie-800 bg-cookie-100 hover:bg-cookie-200 px-3 py-1.5 rounded-xl transition"
              >
                Hapus Filter ID User
              </button>
            )}
          </div>
        ) : (
          sortedOrdersForAdmin.map((order, idx) => {
            const isWaiting = order.status === 'Waiting List' || order.status === 'Terkirim ke WhatsApp';
            const isApproved = order.status === 'Disetujui' || order.status === 'Sedang Diproses';
            const isShipped = order.status === 'Sedang Dikirim';
            const isCompleted = order.status === 'Selesai';
            const cleanWa = (order.customer?.phone || '').replace(/[^0-9]/g, '');

            // Match user ID from order or find in registered users
            const matchedUserId = order.userId || users?.find((u) => {
              const uClean = (u.phone || '').replace(/[^0-9]/g, '');
              const ordClean = (order.customer?.phone || order.userPhone || '').replace(/[^0-9]/g, '');
              return uClean && ordClean && uClean === ordClean;
            })?.id;

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

                    {/* Matched User ID Badge (Clickable to quick filter) */}
                    {matchedUserId && (
                      <button
                        type="button"
                        onClick={() => setUserIdFilter(matchedUserId)}
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border transition flex items-center gap-1 ${
                          userIdFilter.toLowerCase() === matchedUserId.toLowerCase()
                            ? 'bg-cookie-800 text-amber-200 border-cookie-700 shadow-xs'
                            : 'bg-white hover:bg-neutral-100 text-neutral-600 border-neutral-200'
                        }`}
                        title={`Klik untuk filter semua pesanan user: ${matchedUserId}`}
                      >
                        <User className="w-2.5 h-2.5" />
                        <span>ID: {matchedUserId}</span>
                      </button>
                    )}

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
                        onClick={() => onOpenEditOrder(order)}
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
                        onClick={() => onOpenEditOrder(order)}
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
  );
}
