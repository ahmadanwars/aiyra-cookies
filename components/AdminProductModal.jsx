'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon } from 'lucide-react';
import { CATEGORIES } from '../lib/initialData';

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
      image: formData.image.trim() || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80'
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

          {/* URL Gambar */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center justify-between">
              <span>Link URL Foto Kue *</span>
              <span className="text-[11px] text-neutral-400 font-normal">Unsplash / Image URL</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-cookie-500 shadow-xs"
              />
              {formData.image && (
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-neutral-200">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
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
              className="bg-cookie-700 hover:bg-cookie-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition"
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

