import React from 'react';

/**
 * Komponen untuk menampilkan pesan selamat datang yang dipersonalisasi.
 * @param {object} props - Props komponen.
 * @param {string} props.name - Nama pengguna yang akan ditampilkan.
 * @param {string} [props.className] - Kelas CSS tambahan untuk styling.
 */
export default function WelcomeMessage({ name, className }) {
  return (
    <span className={`font-semibold ${className}`}>
      Selamat Datang, {name}!
    </span>
  );
}