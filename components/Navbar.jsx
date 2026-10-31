'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '../lib/storeContext';
import {
  Cookie,
  ShoppingBag,
  History,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  Clock
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');
  const {
    settings,
    isAdmin,
    currentUser,
    logoutUser,
    cartTotalQty,
    cartTotalPrice,
    orders,
    waitingListCount,
    setIsCartOpen,
    setIsHistoryOpen,
    setIsWaitingListOpen,
    logoutAdmin,
    formatRupiah
  } = useStore();

  const cleanUserPhone = currentUser?.phone ? currentUser.phone.replace(/[^0-9]/g, '') : '';
  const myOrdersCount = orders.filter((o) => {
    if (!currentUser) return false;
    if (o.userId && o.userId === currentUser.id) return true;
    if (cleanUserPhone && o.userPhone && o.userPhone === cleanUserPhone) return true;
    const cleanOrderPhone = o.customer?.phone ? o.customer.phone.replace(/[^0-9]/g, '') : '';
    if (cleanUserPhone && cleanOrderPhone && cleanUserPhone === cleanOrderPhone) return true;
    return false;
  }).length;

  return (
    <>
      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cookie-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cookie-800 to-cookie-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Cookie className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-xl md:text-2xl text-cookie-900 tracking-tight leading-none">
                  {settings.storeName}
                </h1>
                {isAdmin && (
                  <span className="hidden sm:inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                    <ShieldCheck className="w-3 h-3 text-amber-600" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] text-cookie-600 font-medium">
                {settings.storeTagline}
              </p>
            </div>
          </Link>

          {/* Action Navigation */}
          <div className="flex items-center gap-2 md:gap-3">
            
            {/* User Account / Login Status */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-cookie-50/80 border border-cookie-200 px-2.5 py-1.5 rounded-2xl">
                <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-bold ${
                  currentUser.role === 'reseller' ? 'bg-emerald-600' : 'bg-cookie-700'
                }`}>
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] text-neutral-400 leading-none">Masuk sebagai</p>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      currentUser.role === 'reseller'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {currentUser.role === 'reseller' ? '🤝 Reseller' : '👤 Pembeli'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-cookie-900 max-w-[110px] truncate leading-tight">
                    {currentUser.fullName}
                  </p>
                </div>
                <button
                  onClick={logoutUser}
                  title="Keluar dari akun"
                  className="p-1 text-neutral-400 hover:text-red-500 rounded-lg transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}

            {/* Waiting List Antrean (Bisa dilihat semua user) */}
            <button
              onClick={() => setIsWaitingListOpen(true)}
              className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 transition flex items-center gap-1.5 text-xs font-bold shadow-2xs"
              title="Lihat daftar antrean pesanan seluruh pembeli"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Waiting List</span>
              {waitingListCount > 0 && (
                <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold animate-pulse">
                  {waitingListCount}
                </span>
              )}
            </button>

            {/* If on Admin page, show link to public catalog */}
            {isAdminPage ? (
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-cookie-800 bg-cookie-50 hover:bg-cookie-100 border border-cookie-200 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Katalog Pembeli</span>
              </Link>
            ) : (
              /* Public page: Admin link is hidden from public, only shown if already logged in as Admin */
              isAdmin && (
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Panel Admin</span>
                  </Link>
                  <button
                    onClick={logoutAdmin}
                    title="Keluar dari Admin"
                    className="p-2 text-neutral-400 hover:text-red-500 rounded-xl hover:bg-gray-100 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )
            )}

            {/* Riwayat Pesanan Pribadi (Personal Order History) */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="relative p-2.5 rounded-xl hover:bg-cookie-50 text-cookie-800 border border-cookie-200 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Lihat riwayat pesanan saya"
            >
              <History className="w-4 h-4" />
              <span className="hidden lg:inline">Pesanan Saya</span>
              {myOrdersCount > 0 && (
                <span className="bg-cookie-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {myOrdersCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-cookie-700 hover:bg-cookie-800 text-white px-3.5 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition flex items-center gap-2 text-xs md:text-sm"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartTotalQty > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                    {cartTotalQty}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Keranjang</span>
              <span className="font-bold border-l border-cookie-600 pl-2">
                {formatRupiah(cartTotalPrice)}
              </span>
            </button>

          </div>

        </div>
      </header>
    </>
  );
}
