'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Upload, Trash2, CheckCircle2 } from 'lucide-react';
import { CATEGORIES } from '../lib/initialData';

// Utility to compress image file using canvas (optimized to stay well below Google Sheets 50,000 char cell limit)
const compressImageFile = (file, maxWidth = 380, maxHeight = 380, quality = 0.65) => {
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

        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Google Sheets batas sel adalah 50.000 karakter. Pastikan dataUrl < 38.000 karakter!
        if (dataUrl.length > 38000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        }
        if (dataUrl.length > 38000) {
          canvas.width = Math.round(width * 0.7);
          canvas.height = Math.round(height * 0.7);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          dataUrl = canvas.toDataURL('image/jpeg', 0.45);
        }

        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function AdminProductModal({ isOpen, onClose, onSave, editingProduct }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Klasik',
    price: '',
    resellerPrice: '',
    weight: 'Toples 500gr',
    badge: 'Best Seller',
    image: '',
    description: '',
    isAvailable: true
  });

  const [isProcessingImage, setIsProcessingImage] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        category: editingProduct.category || 'Klasik',
        price: editingProduct.price || '',
        resellerPrice: editingProduct.resellerPrice || '',
        weight: editingProduct.weight || 'Toples 500gr',
        badge: editingProduct.badge || '',
        image: editingProduct.image || '',
        description: editingProduct.description || '',
        isAvailable: editingProduct.isAvailable !== false
      });
    } else {
      setFormData({
        name: '',
        category: 'Klasik',
        price: '',
        resellerPrice: '',
        weight: 'Toples 500gr',
        badge: 'Favorit',
        image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
        description: '',
        isAvailable: true
      });
    }
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Ukuran file foto terlalu besar. Maksimal 15 MB.');
      return;
    }

    setIsProcessingImage(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 800, 800, 0.85);
      setFormData((prev) => ({ ...prev, image: compressedDataUrl }));
    } catch (err) {
      console.error('Failed to compress image:', err);
      alert('Gagal memproses gambar foto. Silakan coba file gambar lain.');
    } finally {
      setIsProcessingImage(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama kue wajib diisi!');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      alert('Harga kue harus berupa angka yang valid!');
      return;
    }

    const priceNum = Number(formData.price);
    const resellerPriceNum = formData.resellerPrice
      ? Number(formData.resellerPrice)
      : Math.round(priceNum * 0.85);

    onSave({
      ...formData,
      price: priceNum,
      resellerPrice: resellerPriceNum,
      image: formData.image ? formData.image.trim() : 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80'
    });
  };

  const sampleBadges = ['Best Seller', 'Favorit', 'Populer', 'Baru', 'Promo', 'Gift Box', 'Tradisional'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" role="dialog">
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" />

      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden z-10 border border-cookie-100 my-8">
        
        {/* Modal Header */}
        <div className="p-4 bg-cookie-50 border-b border-cookie-200 flex items-center justify-between">
          <h3 className="font-bold text-cookie-900 text-base">
            {editingProduct ? '✏️ Edit Menu Kue' : '➕ Tambah Menu Kue Baru'}
          </h3>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          
          {/* Nama Produk */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Nama Kue / Produk *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Nastar Wisman Premium"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-cookie-500 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Kategori */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-cookie-500 shadow-xs bg-white"
              >
                {CATEGORIES.filter(c => c !== 'Semua').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Harga Normal */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Harga Normal *</label>
              <input
                type="number"
                required
                min="1000"
                step="500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Contoh: 85000"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-cookie-500 shadow-xs"
              />
            </div>

            {/* Harga Reseller */}
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1">
                Harga Reseller (Mitra)
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                value={formData.resellerPrice}
                onChange={(e) => setFormData({ ...formData, resellerPrice: e.target.value })}
                placeholder="Otomatis -15% jika kosong"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30 shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Berat / Kemasan */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Berat / Kemasan</label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="Toples 500gr / Box"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-cookie-500 shadow-xs"
              />
            </div>

            {/* Badge / Label */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Label Badge</label>
              <div className="space-y-1">
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="Best Seller / Favorit"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-cookie-500 shadow-xs"
                />
                <div className="flex flex-wrap gap-1 pt-1">
                  {sampleBadges.slice(0, 4).map((b) => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => setFormData({ ...formData, badge: b })}
                      className="text-[10px] bg-cookie-50 hover:bg-cookie-100 text-cookie-800 px-2 py-0.5 rounded-md border border-cookie-200"
                    >
                      +{b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FOTO PRODUK: UPLOAD FILE LOKAL (HP / LAPTOP) ATAU TEMPEL LINK */}
          <div className="space-y-2 p-4 bg-cookie-50/70 rounded-2xl border border-cookie-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-cookie-950 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-cookie-700" />
                <span>Foto Kue / Produk *</span>
              </label>
              <span className="text-[11px] text-cookie-700 font-semibold">
                Upload langsung dari galeri HP / Laptop
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              {/* Photo Preview Thumbnail */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 border-dashed border-cookie-300 bg-white flex items-center justify-center relative group shadow-2xs">
                {formData.image ? (
                  <>
                    <img
                      src={formData.image}
                      alt="Preview Foto Kue"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&q=80';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="absolute inset-0 bg-black/60 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1"
                      title="Hapus foto ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </>
                ) : (
                  <div className="text-center p-1 text-neutral-400">
                    <ImageIcon className="w-6 h-6 mx-auto mb-0.5" />
                    <span className="text-[9px] block leading-tight">Belum ada foto</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="bg-cookie-700 hover:bg-cookie-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isProcessingImage ? 'Memproses Foto...' : 'Pilih Foto dari Galeri / File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isProcessingImage}
                      className="hidden"
                      onChange={handleImageFileUpload}
                    />
                  </label>

                  {formData.image && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="text-xs text-red-600 hover:underline font-bold px-2 py-1"
                    >
                      Reset Foto
                    </button>
                  )}
                </div>

                {/* Optional toggle / manual link URL input */}
                <div className="pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <span>Atau tempel Link URL (opsional jika sudah upload):</span>
                  </div>
                  <input
                    type="text"
                    value={formData.image && formData.image.startsWith('data:') ? '' : (formData.image || '')}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder={
                      formData.image && formData.image.startsWith('data:')
                        ? '✅ Foto lokal (File gambar) tersimpan aktif'
                        : 'https://images.unsplash.com/photo-...'
                    }
                    className="w-full text-xs px-3 py-1.5 mt-1 rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-cookie-500 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Deskripsi Singkat</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jelaskan rasa, keistimewaan bahan, tekstur kue..."
              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-cookie-500 shadow-xs resize-none"
            />
          </div>

          {/* Status Ketersediaan */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              className="w-4 h-4 text-cookie-600 rounded border-gray-300 focus:ring-cookie-500"
            />
            <label htmlFor="isAvailable" className="text-xs font-bold text-neutral-800 cursor-pointer">
              Produk Siap Dipesan (Stok Tersedia)
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isProcessingImage}
              className="bg-cookie-700 hover:bg-cookie-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Simpan Produk
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
