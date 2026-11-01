'use client';

import React, { useState } from 'react';
import { useStore } from '../lib/storeContext';
import { CATEGORIES } from '../lib/initialData';
import AuthForm from '../components/AuthForm';
import HeroBannerSlider from '../components/HeroBannerSlider';
import BannerSlideModal from '../components/BannerSlideModal';
import {
  Search,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  ArrowDown,
  Phone,
  PackageX,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const {
    isLoaded,
    currentUser,
    products,
    cart,
    addToCart,
    updateCartQty,
    setIsCartOpen,
    cartTotalQty,
    cartTotalPrice,
    settings,
    formatRupiah,
    getProductPrice,
    isReseller,
    isAdmin
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  // 1. Loading State
  if (!isLoaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-cookie-800">
          <div className="w-10 h-10 border-4 border-cookie-300 border-t-cookie-700 rounded-full animate-spin" />
          <p className="text-xs font-semibold">Memuat Katalog Aiyra Cookies...</p>
        </div>
      </div>
    );
  }

  // 2. User Authentication Required: Show Login / Register form if not logged in
  if (!currentUser) {
    return <AuthForm />;
  }

  // 3. User is Logged In: Show Catalog
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'Semua' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-cookie-950 via-cookie-900 to-amber-950 text-white p-6 sm:p-8 md:p-10 shadow-xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Title, Greeting & Actions */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md text-amber-200 border border-white/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  Edisi Spesial Kue Kering & Hampers Premium
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-xs ${
                  isReseller
                    ? 'bg-emerald-400 text-emerald-950 ring-2 ring-emerald-300/40'
                    : 'bg-amber-400 text-cookie-950'
                }`}>
                  <UserCheck className="w-3.5 h-3.5" />
                  Halo, {currentUser.fullName}! ({isReseller ? '🤝 Mitra Reseller' : '👤 Pembeli'})
                </span>
              </div>
              
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                Kelezatan Gurih & Renyah di Setiap Gigitan
              </h2>
              <p className="text-amber-100/90 text-xs sm:text-sm md:text-base leading-relaxed">
                {isReseller
                  ? 'Selamat datang Mitra Reseller! Seluruh harga katalog otomatis menerapkan harga grosir khusus reseller.'
                  : 'Pilih aneka toples kue favorit Anda, tentukan jumlahnya, dan pesanan akan otomatis terkirim rapi ke WhatsApp kami!'}
              </p>
              
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <a
                  href="#katalog"
                  className="bg-amber-400 hover:bg-amber-300 text-cookie-950 font-bold px-5 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center gap-2"
                >
                  <span>Lihat Menu Katalog</span>
                  <ArrowDown className="w-4 h-4" />
                </a>
                <a
                  href={`https://wa.me/${(settings.adminWhatsApp || '6281234567890').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-2xl text-xs font-medium border border-white/30 backdrop-blur-sm transition flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WA: +{settings.adminWhatsApp}</span>
                </a>

                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsBannerModalOpen(true)}
                      className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 px-3.5 py-2.5 rounded-2xl text-xs font-bold border border-amber-300/40 backdrop-blur-sm transition flex items-center gap-1.5"
                      title="Kelola foto slide dan logo toko"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Edit Slide & Logo</span>
                    </button>
                    <Link
                      href="/admin"
                      className="bg-cookie-800/80 hover:bg-cookie-800 text-amber-200 px-3.5 py-2 rounded-2xl text-xs font-semibold border border-amber-300/30 transition flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Panel Admin</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Hero Banner Photo Slider */}
            <div className="lg:col-span-6 xl:col-span-5 w-full">
              <HeroBannerSlider onOpenEditModal={() => setIsBannerModalOpen(true)} />
            </div>

          </div>
          
          {/* Subtle background glow */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/15 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* FILTER & SEARCH BAR */}
      <section id="katalog" className="max-w-7xl mx-auto px-4 space-y-4 pt-2">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-cookie-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nastar, kastengel, cokelat..."
              className="w-full bg-white pl-10 pr-4 py-2.5 rounded-2xl border border-cookie-200 focus:outline-none focus:ring-2 focus:ring-cookie-500 text-xs sm:text-sm shadow-xs"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
                  cat === selectedCategory
                    ? 'bg-cookie-700 text-white shadow-sm'
                    : 'bg-white text-cookie-900 border border-cookie-200 hover:bg-cookie-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="max-w-7xl mx-auto px-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-cookie-100 p-8 space-y-3">
            <div className="w-16 h-16 bg-cookie-50 rounded-full flex items-center justify-center mx-auto text-cookie-400">
              <PackageX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-cookie-900">Kue tidak ditemukan</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Tidak ada produk yang cocok dengan pencarian "{searchQuery}". Silakan coba kata kunci lain.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
              }}
              className="mt-2 text-xs font-bold text-cookie-800 bg-cookie-100 hover:bg-cookie-200 px-4 py-2 rounded-xl transition"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {filteredProducts.map((prod) => {
              const cartItem = cart.find((i) => i.product.id === prod.id);
              const qtyInCart = cartItem ? cartItem.qty : 0;
              const isAvailable = prod.isAvailable !== false;

              return (
                <div
                  key={prod.id}
                  className={`bg-white rounded-3xl border border-cookie-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group ${
                    !isAvailable ? 'opacity-70' : ''
                  }`}
                >
                  {/* Image & Badges */}
                  <div className="relative overflow-hidden aspect-square bg-cookie-50">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80';
                      }}
                    />
                    
                    {/* Badge */}
                    {prod.badge && (
                      <span className="absolute top-2.5 left-2.5 bg-cookie-950/80 backdrop-blur-md text-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {prod.badge}
                      </span>
                    )}

                    {/* Weight */}
                    {prod.weight && (
                      <span className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-cookie-800 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        {prod.weight}
                      </span>
                    )}

                    {/* Out of Stock Ribbon */}
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
                          Stok Habis
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-cookie-600 uppercase tracking-wider">
                        {prod.category}
                      </span>
                      <h3 className="font-bold text-cookie-900 text-xs sm:text-sm md:text-base leading-snug line-clamp-1 group-hover:text-cookie-600 transition">
                        {prod.name}
                      </h3>
                      <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-2 border-t border-cookie-50 flex items-center justify-between gap-2">
                      <div>
                        {isReseller ? (
                          <div>
                            <span className="text-[10px] text-emerald-700 font-bold block leading-none">
                              Harga Reseller
                            </span>
                            <div className="flex items-baseline gap-1.5 flex-wrap mt-0.5">
                              <span className="font-extrabold text-emerald-800 text-xs sm:text-sm md:text-base">
                                {formatRupiah(getProductPrice(prod))}
                              </span>
                              <span className="text-[10px] text-neutral-400 line-through">
                                {formatRupiah(prod.price)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="text-[10px] text-neutral-400 block leading-none">Harga</span>
                            <span className="font-extrabold text-cookie-800 text-xs sm:text-sm md:text-base mt-0.5 block">
                              {formatRupiah(prod.price)}
                            </span>
                          </div>
                        )}
                      </div>

                      {isAvailable ? (
                        qtyInCart === 0 ? (
                          <button
                            onClick={() => addToCart(prod.id)}
                            className="bg-cookie-700 hover:bg-cookie-800 text-white p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-1.5"
                            title="Tambah ke keranjang"
                          >
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Tambah</span>
                          </button>
                        ) : (
                          <div className="flex items-center bg-cookie-50 border border-cookie-200 rounded-xl overflow-hidden p-0.5">
                            <button
                              onClick={() => updateCartQty(prod.id, -1)}
                              className="w-6 h-6 flex items-center justify-center text-cookie-800 hover:bg-cookie-200 rounded-lg transition font-bold text-xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-bold text-xs text-cookie-900">
                              {qtyInCart}
                            </span>
                            <button
                              onClick={() => updateCartQty(prod.id, 1)}
                              className="w-6 h-6 flex items-center justify-center text-cookie-800 hover:bg-cookie-200 rounded-lg transition font-bold text-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )
                      ) : (
                        <span className="text-[11px] font-bold text-neutral-400 italic">
                          Habis
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MOBILE FLOATING CART BAR */}
      {cartTotalQty > 0 && (
        <div className="fixed bottom-4 inset-x-4 md:hidden z-30 animate-bounce-subtle">
          <div className="bg-cookie-950 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between border border-amber-300/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-amber-300" />
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartTotalQty}
                </span>
              </div>
              <div>
                <p className="text-[11px] text-amber-200">Total Belanja</p>
                <p className="font-bold text-sm">{formatRupiah(cartTotalPrice)}</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-cookie-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <span>Lihat Keranjang</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL KELOLA SLIDE & LOGO */}
      {isAdmin && (
        <BannerSlideModal
          isOpen={isBannerModalOpen}
          onClose={() => setIsBannerModalOpen(false)}
        />
      )}

    </div>
  );
}
