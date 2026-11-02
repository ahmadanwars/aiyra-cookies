'use client';

import React, { useState } from 'react';
import { useStore } from '../lib/storeContext';
import {
  Cookie,
  User,
  Phone,
  Lock,
  MapPin,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function AuthForm() {
  const { loginUser, registerUser, settings } = useStore();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regRole, setRegRole] = useState('user'); // 'user' or 'reseller'

  // Error & Status feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingNotice, setPendingNotice] = useState(null);

  const cleanAdminWa = (settings.adminWhatsApp || '6281234567890').replace(/[^0-9]/g, '');

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setPendingNotice(null);

    if (!loginPhone.trim() || !loginPassword.trim()) {
      setErrorMessage('Nomor WhatsApp dan Password wajib diisi.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await loginUser(loginPhone, loginPassword);
      if (res.success) {
        setSuccessMessage(`Selamat datang kembali, ${res.user.fullName}!`);
      } else {
        if (res.pendingApproval) {
          setPendingNotice({
            type: 'login',
            phone: loginPhone,
            message: res.message
          });
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch (err) {
      setErrorMessage('Terjadi kendala saat memeriksa akun. Silakan coba lagi.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setPendingNotice(null);

    const name = regFullName.trim();
    const phone = regPhone.trim();
    const pass = regPassword.trim();
    const addr = regAddress.trim();

    if (!name) {
      setErrorMessage('Nama Lengkap wajib diisi.');
      return;
    }
    if (!phone) {
      setErrorMessage('Nomor WhatsApp wajib diisi.');
      return;
    }
    if (!pass || pass.length < 4) {
      setErrorMessage('Password minimal 4 karakter.');
      return;
    }
    if (!addr) {
      setErrorMessage('Alamat Lengkap wajib diisi untuk pengiriman.');
      return;
    }

    const res = await registerUser({
      fullName: name,
      phone: phone,
      password: pass,
      address: addr,
      role: regRole
    });

    if (res && res.success && res.pendingApproval) {
      setPendingNotice({
        type: 'register',
        name: name,
        phone: phone,
        role: regRole,
        message: res.message
      });
      setRegFullName('');
      setRegPhone('');
      setRegPassword('');
      setRegAddress('');
    } else if (res && res.success) {
      setSuccessMessage('Pendaftaran berhasil! Mengalihkan ke katalog...');
    } else {
      setErrorMessage(res?.message || 'Gagal mendaftar. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-cookie-100 overflow-hidden">
        
        {/* Card Header (Admin link removed to hide admin access from public) */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-cookie-950 via-cookie-900 to-amber-950 text-white text-center space-y-2 relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-cookie-500 text-cookie-950 flex items-center justify-center mx-auto shadow-lg mb-2">
            <Cookie className="w-8 h-8" />
          </div>
          <h2 className="font-serif font-extrabold text-2xl sm:text-3xl tracking-tight">
            {settings.storeName}
          </h2>
          <p className="text-xs sm:text-sm text-amber-200/90 font-medium max-w-sm mx-auto">
            Silakan masuk atau buat akun baru untuk mulai menjelajahi katalog kue dan memesan via WhatsApp.
          </p>
        </div>

        {/* Tab Switcher (Masuk vs Daftar) */}
        <div className="flex border-b border-cookie-100 bg-cookie-50/50 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'login'
                ? 'bg-white text-cookie-900 shadow-xs border border-cookie-200'
                : 'text-neutral-500 hover:text-cookie-800'
            }`}
          >
            <span>Masuk Akun</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'register'
                ? 'bg-white text-cookie-900 shadow-xs border border-cookie-200'
                : 'text-neutral-500 hover:text-cookie-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Daftar Baru</span>
          </button>
        </div>

        {/* Feedback Alert Messages */}
        <div className="px-6 pt-4 space-y-2">
          {pendingNotice && (
            <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl text-amber-950 space-y-2.5 text-xs shadow-xs animate-fade-in">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                <span>Akun Menunggu Persetujuan (Approval) Admin</span>
              </div>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                {pendingNotice.message || 'Pendaftaran akun Anda telah tercatat dan sedang menunggu verifikasi serta persetujuan dari Admin toko kami agar harga grosir/reseller terlindungi dengan aman.'}
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <a
                  href={`https://wa.me/${cleanAdminWa}?text=${encodeURIComponent(
                    `Halo Admin Aiyra Cookies, saya baru saja mendaftar akun (${pendingNotice.phone || loginPhone}). Mohon bantuannya untuk approval/aktivasi akun saya. Terima kasih!`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Konfirmasi ke Admin via WhatsApp</span>
                </a>
                {pendingNotice.type === 'register' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setLoginPhone(pendingNotice.phone);
                    }}
                    className="text-xs text-cookie-800 underline font-semibold px-2 py-1"
                  >
                    Buka Tab Masuk
                  </button>
                )}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* ================= TAB 1: FORM LOGIN ================= */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-4">
            
            {/* Input Nomor WA / Username */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Nomor WhatsApp atau Nama:
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-cookie-500 shadow-xs"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Password Akun:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Ketik password Anda"
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-cookie-500 shadow-xs"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full ${
                isLoggingIn ? 'bg-cookie-400 cursor-not-allowed' : 'bg-cookie-700 hover:bg-cookie-800'
              } text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 mt-2`}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memeriksa Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Katalog</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Footer switcher */}
            <div className="text-center pt-2">
              <p className="text-xs text-neutral-500">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage('');
                  }}
                  className="font-bold text-cookie-700 hover:underline"
                >
                  Daftar di sini
                </button>
              </p>
            </div>

          </form>
        )}

        {/* ================= TAB 2: FORM DAFTAR / REGISTER ================= */}
        {activeTab === 'register' && (
          pendingNotice && pendingNotice.type === 'register' ? (
            <div className="p-6 sm:p-8 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner border border-amber-200">
                <Clock className="w-8 h-8 animate-pulse text-amber-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-cookie-950">
                  Pendaftaran Berhasil Diajukan!
                </h3>
                <span className="text-xs text-amber-900 font-extrabold bg-amber-100/90 border border-amber-300 py-1 px-3.5 rounded-full inline-block">
                  ⏳ Menunggu Persetujuan (Approval) Admin
                </span>
              </div>
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-left text-xs space-y-1.5 text-neutral-700">
                <p>👤 <strong>Nama:</strong> {pendingNotice.name}</p>
                <p>📱 <strong>WhatsApp:</strong> {pendingNotice.phone}</p>
                <p>🤝 <strong>Tipe Akun:</strong> {pendingNotice.role === 'reseller' ? 'Mitra Reseller (Harga Grosir)' : 'Pembeli Reguler'}</p>
                <p className="text-[11px] text-amber-800 pt-1 font-medium border-t border-amber-200/60 mt-1">
                  Demi keamanan harga kue, akun Anda saat ini sedang menunggu verifikasi dari Admin toko sebelum dapat digunakan untuk masuk.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <a
                  href={`https://wa.me/${cleanAdminWa}?text=${encodeURIComponent(
                    `Halo Admin Aiyra Cookies, saya sudah mendaftar akun (${pendingNotice.phone} a.n ${pendingNotice.name}). Mohon bantuannya untuk approval akun saya agar bisa mulai berbelanja. Terima kasih!`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Konfirmasi via WhatsApp Admin</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setLoginPhone(pendingNotice.phone);
                    setPendingNotice(null);
                    setActiveTab('login');
                  }}
                  className="w-full bg-cookie-50 hover:bg-cookie-100 text-cookie-900 border border-cookie-200 font-bold py-2.5 px-4 rounded-2xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>Buka Halaman Masuk Akun</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-8 space-y-3.5">
            
            {/* Pilihan Tipe Akun (Role) */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Pilih Tipe Akun Pendaftaran *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('user')}
                  className={`p-2.5 rounded-2xl border text-left transition flex flex-col gap-1 ${
                    regRole === 'user'
                      ? 'border-cookie-600 bg-cookie-50/70 text-cookie-950 ring-2 ring-cookie-500/20'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <User className="w-3.5 h-3.5 text-cookie-700" />
                    <span>Pembeli Reguler</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 leading-tight">Harga eceran satuan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('reseller')}
                  className={`p-2.5 rounded-2xl border text-left transition flex flex-col gap-1 ${
                    regRole === 'reseller'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mitra Reseller</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold leading-tight">Harga khusus grosir</span>
                </button>
              </div>
            </div>

            {/* Input Nama Lengkap */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Nama Lengkap *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Contoh: Siti Rahma"
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-cookie-500 shadow-xs"
                />
              </div>
            </div>

            {/* Input Nomor WA */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Nomor WhatsApp *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-cookie-500 shadow-xs"
                />
              </div>
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                Nomor ini digunakan untuk login dan pengiriman via WhatsApp.
              </span>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-cookie-500 shadow-xs"
                />
              </div>
            </div>

            {/* Input Alamat Lengkap */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Alamat Pengiriman Lengkap *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                <textarea
                  rows={2}
                  required
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="Contoh: Jl. Anggrek No. 12 RT 03/04, Kel. Sukajadi, Kota Bandung"
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-cookie-500 shadow-xs resize-none"
                />
              </div>
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                Alamat otomatis terisi saat Anda checkout pesanan ke WhatsApp.
              </span>
            </div>

            {/* Register Submit Button */}
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 mt-2"
            >
              <span>Daftar & Mulai Belanja</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Footer switcher */}
            <div className="text-center pt-2">
              <p className="text-xs text-neutral-500">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage('');
                  }}
                  className="font-bold text-cookie-700 hover:underline"
                >
                  Masuk di sini
                </button>
              </p>
            </div>

          </form>
          )
        )}

      </div>
    </div>
  );
}

