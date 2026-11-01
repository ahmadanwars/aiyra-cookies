'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/storeContext';
import { ChevronLeft, ChevronRight, Sparkles, Edit3 } from 'lucide-react';
import { INITIAL_SETTINGS } from '../lib/initialData';

export default function HeroBannerSlider({ onOpenEditModal }) {
  const { settings, isAdmin } = useStore();
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

  // Autoplay timer
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);

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

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <div
      className="relative w-full group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Outer Card Frame with subtle glass styling */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-white/15 bg-black/40">
        
        {/* Images Layer */}
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 pointer-events-none scale-105'
              }`}
              style={{ transition: 'opacity 0.7s ease-in-out, transform 1.2s ease-out' }}
            >
              <img
                src={slide.image}
                alt={slide.title || 'Slide Foto Kue'}
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              {/* Gradient Scrim for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15" />
            </div>
          );
        })}

        {/* Top Badges & Quick Admin Edit Action */}
        <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-auto">
          {currentSlide.badge ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-400 text-cookie-950 shadow-md backdrop-blur-md">
              <Sparkles className="w-3 h-3" />
              {currentSlide.badge}
            </span>
          ) : <span />}

          {isAdmin && onOpenEditModal && (
            <button
              type="button"
              onClick={onOpenEditModal}
              className="bg-black/60 hover:bg-cookie-700 text-amber-200 hover:text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-amber-300/40 backdrop-blur-md shadow-lg transition flex items-center gap-1.5"
              title="Kelola foto slide banner & logo"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              <span>Edit Slide</span>
            </button>
          )}
        </div>

        {/* Bottom Captions & Dots */}
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-20 flex flex-col justify-end text-white">
          <div className="space-y-1 mb-3">
            <h4 className="font-serif font-bold text-base sm:text-lg md:text-xl text-white leading-tight drop-shadow-md">
              {currentSlide.title}
            </h4>
            {currentSlide.subtitle && (
              <p className="text-xs sm:text-sm text-amber-100/90 line-clamp-2 drop-shadow-xs font-normal">
                {currentSlide.subtitle}
              </p>
            )}
          </div>

          {/* Navigation Controls: Prev/Next & Dots */}
          <div className="flex items-center justify-between pt-1 border-t border-white/15">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-6 bg-amber-400'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Ke slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            {slides.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-white/60 font-mono font-medium mr-1">
                  {currentIndex + 1} / {slides.length}
                </span>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md flex items-center justify-center text-white transition shadow-xs"
                  aria-label="Slide sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md flex items-center justify-center text-white transition shadow-xs"
                  aria-label="Slide berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
