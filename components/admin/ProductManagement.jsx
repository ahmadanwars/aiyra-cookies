'use client';

import React, { useState } from 'react';
import { useStore } from '../../lib/storeContext';
import {
  Search,
  Plus,
  RotateCcw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function ProductManagement({ onOpenAdd, onOpenEdit }) {
  const {
    products,
    deleteProduct,
    toggleProductAvailability,
    resetProductsToDefault,
    formatRupiah
  } = useStore();

  const [adminSearch, setAdminSearch] = useState('');

  // Filtered products for admin (excludes internal system config records)
  const filteredProducts = products
    .filter((p) => p && !String(p.id || '').startsWith('cfg-'))
    .filter((p) =>
      p.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(adminSearch.toLowerCase())
    );

  const handleDeleteProduct = (product) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kue "${product.name}" dari katalog?`)) {
      deleteProduct(product.id);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-cookie-100 shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-6 border-b border-cookie-100 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-cookie-50/40">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-cookie-950">
            Daftar Produk Katalog
          </h3>
          <p className="text-xs text-neutral-500">
            Tambah, perbarui harga & foto, atau hapus kue dari menu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-60">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              placeholder="Filter nama kue..."
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-cookie-500"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={onOpenAdd}
            className="bg-cookie-700 hover:bg-cookie-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kue Baru</span>
          </button>

          {/* Reset to Default */}
          <button
            onClick={() => {
              if (confirm('Kembalikan seluruh katalog ke contoh data awal Aiyra Cookies?')) {
                resetProductsToDefault();
              }
            }}
            title="Kembalikan contoh menu awal"
            className="p-2 text-neutral-400 hover:text-cookie-800 rounded-xl hover:bg-white border border-neutral-200 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Kue / Produk</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4">Harga Normal</th>
              <th className="py-3 px-4 text-emerald-800">Harga Reseller</th>
              <th className="py-3 px-4">Kemasan</th>
              <th className="py-3 px-4 text-center">Status Stok</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-neutral-400">
                  Tidak ada produk yang cocok dengan pencarian.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const isAvailable = p.isAvailable !== false;
                return (
                  <tr key={p.id} className="hover:bg-cookie-50/50 transition">
                    {/* Product Name & Photo */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover bg-cookie-50 border border-neutral-100 shrink-0"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&q=80';
                          }}
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-cookie-900 text-xs sm:text-sm">
                            {p.name}
                          </h4>
                          {p.badge && (
                            <span className="inline-block mt-0.5 text-[9px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                              {p.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 font-semibold text-neutral-700">
                      {p.category}
                    </td>

                    {/* Normal Price */}
                    <td className="py-3 px-4 font-bold text-cookie-800">
                      {formatRupiah(p.price)}
                    </td>

                    {/* Reseller Price */}
                    <td className="py-3 px-4 font-bold text-emerald-800">
                      <div className="flex items-center gap-1">
                        <span>{formatRupiah(p.resellerPrice || Math.round(p.price * 0.85))}</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">Mitra</span>
                      </div>
                    </td>

                    {/* Weight */}
                    <td className="py-3 px-4 text-neutral-500">
                      {p.weight || '-'}
                    </td>

                    {/* Availability Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleProductAvailability(p.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold transition ${
                          isAvailable
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {isAvailable ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Tersedia</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Habis</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenEdit(p)}
                          className="p-2 text-cookie-700 hover:bg-cookie-100 rounded-xl transition"
                          title="Edit kue ini"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                          title="Hapus kue ini"
                        >
                          <Trash2 className="w-4 h-4" />
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
