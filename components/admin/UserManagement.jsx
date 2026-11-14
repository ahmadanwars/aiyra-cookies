'use client';

import React, { useState } from 'react';
import { useStore } from '../../lib/storeContext';
import {
  Users,
  Search,
  Hourglass,
  XCircle,
  CheckCircle2,
  Check,
  RotateCcw,
  MessageCircle,
  Trash2
} from 'lucide-react';

export default function UserManagement({ setToast }) {
  const {
    users,
    approveUser,
    rejectUser,
    updateUserRole,
    deleteUser
  } = useStore();

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('Semua');

  const pendingUsersCount = users.filter((u) => u.status === 'pending').length;
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

  const handleApproveUser = (userId, role) => {
    approveUser(userId, role);
    const targetUser = users.find((u) => u.id === userId);
    const roleName = role === 'reseller' ? 'Mitra Reseller' : 'Pembeli Reguler';
    if (setToast) {
      setToast(`✅ Akun "${targetUser?.fullName || 'Pengguna'}" telah DISETUJUI sebagai ${roleName}!`);
    }
  };

  const handleRejectUser = (userId) => {
    const targetUser = users.find((u) => u.id === userId);
    if (confirm(`Apakah Anda yakin ingin menolak pendaftaran akun "${targetUser?.fullName}"?`)) {
      rejectUser(userId);
      if (setToast) {
        setToast(`❌ Pendaftaran "${targetUser?.fullName || 'Pengguna'}" telah DITOLAK.`);
      }
    }
  };

  const handleDeleteUser = (userToDelete) => {
    if (confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${userToDelete.fullName}" (${userToDelete.phone}) secara permanen?`)) {
      deleteUser(userToDelete.id);
      if (setToast) {
        setToast(`🗑️ Akun "${userToDelete.fullName}" telah berhasil dihapus.`);
      }
    }
  };

  return (
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
                                  if (setToast) {
                                    setToast(`Role ${u.fullName} diubah menjadi Pembeli Reguler.`);
                                  }
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
                                  if (setToast) {
                                    setToast(`Role ${u.fullName} diubah menjadi Mitra Reseller! Mendapatkan harga grosir.`);
                                  }
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
  );
}
