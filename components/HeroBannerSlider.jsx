'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/storeContext';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowDown,
  Phone,
  ShieldCheck,
  UserCheck,
  Edit3
} from 'lucide-react';
import Link from 'next/link';
import { INITIAL_SETTINGS } from '../lib/initialData';

export default function HeroBannerSlider({ onOpenEditModal }) {
  const { settings, isAdmin, currentUser, isReseller } = useStore();
  const slides = (settings.bannerSlides && settings.bannerSlides.length > 0)
    ? settings.bannerSlides
    : INITIAL_SETTINGS.bannerSlides;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Safe index guard
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  // Autoplay timer (every 5 seconds, pauses on mouse hover)
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, isPaused]);

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex] || slides[0] || {};

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-cookie-950 text-white min-h-[460px] sm:min-h-[480px] md:min-h-[500px] flex flex-col justify-between select-none group border border-cookie-900/60"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ======================================================== */}
      {/* 1. BACKGROUND PHOTO SLIDES (FULL BANNER)                 */}
      {/* ======================================================== */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title || 'Foto Slide Banner Aiyra Cookies'}
                className={`w-full h-full object-cover object-center transition-transform duration-7000 ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            </div>
          );
        })}

        {/* DUAL GRADIENT SCRIM FOR HIGH CONTRAST & READABILITY */}
        {/* Left-to-right dark warm brown gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-cookie-950/80 to-black/35 z-20 pointer-events-none" />
        {/* Bottom-to-top subtle darkening */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent z-20 pointer-events-none" />
      </div>

      {/* ======================================================== */}
      {/* 2. FOREGROUND BANNER CONTENT (TEXT & ACTIONS)           */}
      {/* ======================================================== */}
      <div className="relative z-30 p-6 sm:p-10 md:p-12 flex-1 flex flex-col justify-between">
        
        {/* TOP ROW: BADGES & QUICK ADMIN EDIT BUTTON */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {/* Promo / Announcement Badge */}
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-amber-200 border border-white/25 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{settings.bannerBadge || 'Edisi Spesial Kue Kering & Hampers Premium'}</span>
            </span>

            {/* User Greeting Status Badge */}
            {currentUser && (
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs backdrop-blur-md ${
                isReseller
                  ? 'bg-emerald-500/90 text-emerald-950 ring-2 ring-emerald-300/40'
                  : 'bg-amber-400 text-cookie-950'
              }`}>
                <UserCheck className="w-3.5 h-3.5" />
                <span>Halo, {currentUser.fullName}! ({isReseller ? '🤝 Mitra Reseller' : '👤 Pembeli'})</span>
              </span>
            )}
          </div>

          {/* Quick Edit Button for Admin */}
          {isAdmin && onOpenEditModal && (
            <button
              type="button"
              onClick={onOpenEditModal}
              className="bg-black/60 hover:bg-cookie-700 text-amber-200 hover:text-white font-bold text-xs px-3.5 py-2 rounded-2xl border border-amber-300/40 backdrop-blur-md shadow-lg transition flex items-center gap-1.5 self-start"
              title="Ubah tulisan banner, foto slide penuh, dan logo toko"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              <span>Edit Banner & Teks</span>
            </button>
          )}
        </div>

        {/* CENTER ROW: HEADINGS, DESCRIPTION & BUTTONS */}
        <div className="max-w-2xl lg:max-w-3xl space-y-4 my-auto py-2">
          {/* Main Heading */}
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md">
            {settings.bannerTitle || 'Kelezatan Gurih & Renyah di Setiap Gigitan'}
          </h2>

          {/* Subtitle / Description */}
          <p className="text-amber-100/95 text-xs sm:text-sm md:text-base leading-relaxed drop-shadow-xs max-w-xl">
            {isReseller
              ? 'Selamat datang Mitra Reseller! Seluruh harga katalog otomatis menerapkan harga grosir khusus reseller.'
              : (settings.bannerDesc || 'Pilih aneka toples kue favorit Anda, tentukan jumlahnya, dan pesanan akan otomatis terkirim rapi ke WhatsApp kami!')}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {/* Catalog Button */}
            <a
              href="#katalog"
              className="bg-amber-400 hover:bg-amber-300 text-cookie-950 font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-lg transition flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{settings.bannerButtonText || 'Lihat Menu Katalog'}</span>
              <ArrowDown className="w-4 h-4" />
            </a>

            {/* WhatsApp Contact Button */}
            <a
              href={`https://wa.me/${(settings.adminWhatsApp || '6281234567890').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="bg-white/15 hover:bg-white/25 text-white px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold border border-white/30 backdrop-blur-md transition flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>WA: +{settings.adminWhatsApp || '6281234567890'}</span>
            </a>

            {/* Admin Panel Shortcut (if Admin) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="bg-cookie-800/80 hover:bg-cookie-800 text-amber-200 px-4 py-3 rounded-2xl text-xs font-semibold border border-amber-300/30 backdrop-blur-md transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Panel Admin</span>
              </Link>
            )}
          </div>
        </div>

        {/* BOTTOM ROW: SLIDER CONTROLS & CURRENT SLIDE CAPTION */}
        <div className="pt-6 mt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-8 bg-amber-400 shadow-md'
                    : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Pindah ke foto slide ${idx + 1}`}
              />
            ))}
            <span className="text-[11px] text-white/70 font-mono font-semibold ml-2">
              Slide {currentIndex + 1} dari {slides.length}
            </span>
          </div>

          {/* Current Slide Caption & Prev/Next Arrows */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* Slide title / badge pill */}
            {currentSlide.title && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-xs">
                {currentSlide.badge && (
                  <span className="bg-amber-400 text-cookie-950 font-bold px-2 py-0.5 rounded-md text-[10px]">
                    {currentSlide.badge}
                  </span>
                )}
                <span className="text-white/90 font-medium truncate max-w-[220px]">
                  {currentSlide.title}
                </span>
              </div>
            )}

            {/* Arrows */}
            {slides.length > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-9 h-9 rounded-2xl bg-white/15 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition shadow-md border border-white/20 active:scale-95"
                  aria-label="Foto slide sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-9 h-9 rounded-2xl bg-white/15 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition shadow-md border border-white/20 active:scale-95"
                  aria-label="Foto slide berikutnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Floating Desktop Side Chevrons on Hover */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-md items-center justify-center transition border border-white/10 opacity-0 group-hover:opacity-100 shadow-xl"
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-md items-center justify-center transition border border-white/10 opacity-0 group-hover:opacity-100 shadow-xl"
            aria-label="Slide berikutnya"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

    </div>
  );
}
