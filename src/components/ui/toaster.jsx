import React from 'react';
import { Toaster as HotToaster } from 'react-hot-toast';

// Komponen Toaster ini berfungsi sebagai "wadah" global untuk semua notifikasi 
// yang akan muncul di aplikasi Anda.
const Toaster = () => {
  return (
    <HotToaster
      position="top-right" // Posisi notifikasi muncul di pojok kanan atas
      reverseOrder={false}
      toastOptions={{
        // Gaya default untuk semua jenis notifikasi
        className: 'text-sm',
        duration: 4000, // Notifikasi akan hilang setelah 4 detik
        style: {
          background: '#ffffff',
          color: '#1f2937',
          border: '1px solid #e5e7eb',
        },
        
        // Pengaturan khusus untuk notifikasi "success" (sukses)
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#16a34a', // Warna ikon hijau
            secondary: '#ffffff',
          }
        },

        // Pengaturan khusus untuk notifikasi "error" (gagal)
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#dc2626', // Warna ikon merah
            secondary: '#ffffff',
          }
        },
      }}
    />
  );
};

export default Toaster;