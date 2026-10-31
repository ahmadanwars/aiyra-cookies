import './globals.css';
import { StoreProvider } from '../lib/storeContext';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import OrderHistoryModal from '../components/OrderHistoryModal';
import WaitingListModal from '../components/WaitingListModal';
import Link from 'next/link';

export const metadata = {
  title: 'Aiyra Cookies - Katalog Kue Online & Pesan WhatsApp',
  description: 'Katalog kue kering homemade premium. Dilengkapi keranjang belanja, antrean waiting list, histori pesanan, dan checkout otomatis ke WhatsApp.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen flex flex-col justify-between selection:bg-cookie-500 selection:text-white bg-cookie-50/30">
        <StoreProvider>
          <div className="flex-1 flex flex-col">
            <Navbar />
            <main className="flex-1 pb-16">
              {children}
            </main>
            {/* Subtle Footer with Hidden Admin Entrance */}
            <footer className="py-5 border-t border-cookie-100 bg-white/70 text-center text-xs text-neutral-400">
              <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-1.5 text-[11px]">
                <span>© 2026 Aiyra Cookies. Artisan Homemade Delights.</span>
                <Link
                  href="/admin"
                  className="opacity-20 hover:opacity-100 transition-opacity p-1 text-cookie-800"
                  title="Akses Pengelola Toko"
                >
                  🔒
                </Link>
              </div>
            </footer>
          </div>
          <CartDrawer />
          <OrderHistoryModal />
          <WaitingListModal />
        </StoreProvider>
      </body>
    </html>
  );
}
