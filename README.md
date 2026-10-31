# 🍪 Aiyra Cookies - Next.js Multi-Role Catalog with WhatsApp Checkout

Aplikasi Katalog Penjualan Kue Modern berbasis **Next.js (App Router)** & **Tailwind CSS**. Dilengkapi dengan **Sistem Autentikasi Pengguna (Login & Daftar)**, **Role Admin**, **Keranjang Belanja**, **Histori Transaksi**, dan **Checkout Langsung ke WhatsApp**.

---

## 👥 Dua Role Pengguna

### 1. 👤 Role Pembeli / Customer (Autentikasi Akun)
- **URL**: [http://localhost:3000](http://localhost:3000)
- **Alur Akses**:
  - Pengunjung wajib login terlebih dahulu sebelum masuk ke katalog.
  - Jika belum memiliki akun, tersedia tab **"Daftar Baru"** dengan formulir:
    1. **Nama Lengkap**
    2. **Nomor WhatsApp** (sekaligus sebagai ID akun)
    3. **Password**
    4. **Alamat Lengkap Pengiriman**
  - Akun demo yang langsung bisa dicoba:
    - **No. WhatsApp**: `081234567890`
    - **Password**: `user123`
- **Fitur Setelah Masuk**:
  - Menjelajahi katalog kue dengan filter kategori (*Klasik, Cokelat, Modern, Hampers*) dan live search.
  - Tambah kue ke keranjang belanja & ubah kuantitas (+ / -).
  - **Form Data Otomatis**: Saat membuka keranjang, Nama, Nomor WhatsApp, dan Alamat Pengiriman sudah **otomatis terisi dari profil akun**!
  - **Checkout WhatsApp**: Mengirim format pesanan rapi ke WhatsApp toko.
  - **Riwayat Pesanan**: Melihat histori pesanan dan tombol *Pesan Lagi* (Re-order).
  - Tombol **Keluar / Logout** di navbar atas.

---

### 2. 🛡️ Role Admin (Pengelola Katalog)
- **URL**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Autentikasi**: Dilindungi oleh **PIN Admin** (Default: `123456`).
- **Fitur**:
  - **Tambah Menu Kue Baru**: Nama, kategori, harga, toples/berat, link foto, badge, dan deskripsi.
  - **Edit & Hapus Kue**: Mengubah data atau menghapus produk dari katalog.
  - **Toggle Stok (Tersedia / Habis)**: Menonaktifkan pesanan sementara jika stok toples sedang kosong.
  - **Pengaturan WhatsApp Toko**: Mengganti nomor WhatsApp admin yang menerima pesanan.
  - **Statistik Cepat**: Total menu, produk aktif, produk habis, dan total transaksi.

---

## 🚀 Cara Menjalankan

Server Next.js sedang berjalan di background:
- **Katalog Pembeli & Login**: [http://localhost:3000](http://localhost:3000)
- **Panel Admin**: [http://localhost:3000/admin](http://localhost:3000/admin) *(PIN: `123456`)*

*(Jika ingin menjalankan ulang di kemudian hari, cukup klik 2x file `start.bat` atau ketik `npm run dev`).*
