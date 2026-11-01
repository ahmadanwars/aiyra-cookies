'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/storeContext';
import {
  X,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Upload,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Cookie,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { INITIAL_SETTINGS } from '../lib/initialData';

// Utility to compress an image file to Base64 data URL using canvas
const compressImageFile = (file, maxWidth, maxHeight, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function BannerSlideModal({ isOpen, onClose }) {
  const { settings, updateSettings } = useStore();

  const [activeTab, setActiveTab] = useState('slides'); // 'slides' | 'logo'
  const [slides, setSlides] = useState([]);
  const [logoUrl, setLogoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const logoFileInputRef = useRef(null);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      const currentSlides = (settings.bannerSlides && settings.bannerSlides.length > 0)
        ? JSON.parse(JSON.stringify(settings.bannerSlides))
        : JSON.parse(JSON.stringify(INITIAL_SETTINGS.bannerSlides));
      setSlides(currentSlides);
      setLogoUrl(settings.logoUrl || '');
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  // Slide actions
  const handleAddSlide = () => {
    const newSlide = {
      id: 'slide-' + Date.now(),
      title: 'Varian Kue Spesial Baru',
      subtitle: 'Dibuat dengan bahan-bahan premium dan cita rasa otentik.',
      image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
      badge: 'Spesial'
    };
    setSlides([...slides, newSlide]);
  };

  const handleUpdateSlideField = (index, field, value) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: value };
    setSlides(updated);
  };

  const handleRemoveSlide = (index) => {
    if (slides.length <= 1) {
      setErrorMsg('Banner minimal harus memiliki 1 foto slide!');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    const updated = [...slides];
    updated.splice(index, 1);
    setSlides(updated);
  };

  const handleMoveSlide = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSlides(updated);
  };

  const handleSlideImageUpload = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compress to max 1000px, quality 0.82
      const compressed = await compressImageFile(file, 1000, 750, 0.82);
      handleUpdateSlideField(index, 'image', compressed);
    } catch (err) {
      console.error('Failed to process image', err);
      alert('Gagal memproses gambar foto slide.');
    }
  };

  // Logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compress logo to max 320x320
      const compressed = await compressImageFile(file, 320, 320, 0.9);
      setLogoUrl(compressed);
    } catch (err) {
      console.error('Failed to process logo', err);
      alert('Gagal memproses logo.');
    }
  };

  const handleSaveAll = () => {
    if (slides.length === 0) {
      setErrorMsg('Minimal harus ada 1 slide banner aktif!');
      return;
    }

    setIsSaving(true);
    updateSettings({
      bannerSlides: slides,
      logoUrl: logoUrl.trim()
    });

    setSuccessMsg('Pengaturan Slide Foto & Logo Toko berhasil disimpan!');
    setTimeout(() => {
      setIsSaving(false);
      setSuccessMsg('');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity" />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 border border-cookie-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-cookie-950 via-cookie-900 to-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg">
                Pengelola Banner Slide & Logo Toko
              </h3>
              <p className="text-xs text-amber-200/80">
                Atur foto slider pada banner coklat dan ubah logo identitas Aiyra Cookies
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-cookie-100 bg-cookie-50/50 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('slides')}
            className={`px-4 py-2.5 rounded-t-2xl transition border-b-2 flex items-center gap-2 ${
              activeTab === 'slides'
                ? 'border-cookie-700 bg-white text-cookie-950 shadow-2xs'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-cookie-700" />
            <span>Foto Slide Banner ({slides.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logo')}
            className={`px-4 py-2.5 rounded-t-2xl transition border-b-2 flex items-center gap-2 ${
              activeTab === 'logo'
                ? 'border-cookie-700 bg-white text-cookie-950 shadow-2xs'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Cookie className="w-4 h-4 text-cookie-700" />
            <span>Ubah Logo Toko / Admin</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mx-4 mt-3 p-3 bg-red-100 border border-red-300 rounded-xl text-red-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-4 mt-3 p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: SLIDES MANAGEMENT */}
          {activeTab === 'slides' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-cookie-950">Daftar Foto Slide Banner</h4>
                  <p className="text-xs text-neutral-500">
                    Foto-foto ini akan tampil bergantian secara otomatis pada bagian kanan banner coklat di halaman utama.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="bg-cookie-800 hover:bg-cookie-900 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Slide</span>
                </button>
              </div>

              {/* List of slides */}
              <div className="space-y-3">
                {slides.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    className="p-3.5 sm:p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row gap-3 items-start">
                      
                      {/* Image Thumbnail & Upload */}
                      <div className="relative w-full sm:w-36 h-28 sm:h-24 rounded-xl overflow-hidden bg-neutral-200 border border-neutral-300 shrink-0 group">
                        {slide.image ? (
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        
                        {/* Overlay Upload Button */}
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer p-1 text-center">
                          <Upload className="w-4 h-4 mb-1" />
                          <span>Ganti Gambar</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleSlideImageUpload(idx, e)}
                          />
                        </label>
                      </div>

                      {/* Inputs for Title, Subtitle, Badge */}
                      <div className="flex-1 space-y-2 w-full text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-cookie-900 flex items-center gap-1">
                            <span>Slide #{idx + 1}</span>
                          </span>

                          {/* Reorder and Delete actions */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveSlide(idx, -1)}
                              disabled={idx === 0}
                              className="p-1 rounded-lg hover:bg-neutral-200 text-neutral-600 disabled:opacity-30"
                              title="Pindah ke Atas"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSlide(idx, 1)}
                              disabled={idx === slides.length - 1}
                              className="p-1 rounded-lg hover:bg-neutral-200 text-neutral-600 disabled:opacity-30"
                              title="Pindah ke Bawah"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSlide(idx)}
                              className="p-1 rounded-lg hover:bg-red-100 text-red-600 ml-1"
                              title="Hapus Slide Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Badge */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-2">
                            <input
                              type="text"
                              value={slide.title || ''}
                              onChange={(e) => handleUpdateSlideField(idx, 'title', e.target.value)}
                              placeholder="Judul Slide (cth: Nastar Wisman Spesial)"
                              className="w-full px-2.5 py-1.5 rounded-xl border border-neutral-300 font-semibold text-neutral-900 focus:ring-1 focus:ring-cookie-500 bg-white"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={slide.badge || ''}
                              onChange={(e) => handleUpdateSlideField(idx, 'badge', e.target.value)}
                              placeholder="Badge (cth: Best Seller)"
                              className="w-full px-2.5 py-1.5 rounded-xl border border-neutral-300 text-neutral-800 focus:ring-1 focus:ring-cookie-500 bg-white"
                            />
                          </div>
                        </div>

                        {/* Subtitle */}
                        <input
                          type="text"
                          value={slide.subtitle || ''}
                          onChange={(e) => handleUpdateSlideField(idx, 'subtitle', e.target.value)}
                          placeholder="Deskripsi singkat / caption slide"
                          className="w-full px-2.5 py-1.5 rounded-xl border border-neutral-300 text-neutral-700 focus:ring-1 focus:ring-cookie-500 bg-white"
                        />

                        {/* Image URL input or upload trigger */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={slide.image || ''}
                            onChange={(e) => handleUpdateSlideField(idx, 'image', e.target.value)}
                            placeholder="Atau tempel Link URL Foto di sini..."
                            className="flex-1 px-2.5 py-1.5 rounded-xl border border-neutral-300 text-[11px] font-mono text-neutral-600 bg-white"
                          />
                          <label className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer shrink-0 flex items-center gap-1 transition">
                            <Upload className="w-3 h-3" />
                            <span>Pilih File</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleSlideImageUpload(idx, e)}
                            />
                          </label>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: LOGO MANAGEMENT */}
          {activeTab === 'logo' && (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-sm text-cookie-950">Pengaturan Logo Toko</h4>
                <p className="text-neutral-500">
                  Logo ini akan ditampilkan di navbar atas situs pembeli, halaman admin, dan header branding.
                </p>
              </div>

              {/* Logo Preview & Upload Box */}
              <div className="p-5 rounded-2xl border border-cookie-100 bg-cookie-50/50 flex flex-col sm:flex-row items-center gap-5">
                
                {/* Logo Live Preview */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cookie-800 to-cookie-500 flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-white ring-2 ring-cookie-200">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Toko" className="w-full h-full object-cover" />
                    ) : (
                      <Cookie className="w-12 h-12" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-cookie-800">
                    {logoUrl ? 'Logo Kustom Aktif' : 'Ikon Default (Kue)'}
                  </span>
                </div>

                {/* Controls */}
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Upload File Logo Baru (PNG/JPG/SVG/WEBP)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="bg-cookie-800 hover:bg-cookie-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo dari Perangkat</span>
                      </button>
                      <input
                        ref={logoFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                      {logoUrl && (
                        <button
                          type="button"
                          onClick={() => setLogoUrl('')}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold px-3 py-2 rounded-xl text-xs transition"
                        >
                          Hapus Logo
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Atau Tempel Link URL Foto Logo
                    </label>
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://.../logo.png"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-mono text-xs focus:ring-1 focus:ring-cookie-500 bg-white"
                    />
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Rekomendasi rasio gambar 1:1 (persegi/lingkaran) dengan latar belakang transparan atau warna selaras.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-neutral-50 border-t border-cookie-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
