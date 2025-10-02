/** @type {import('tailwindcss').Config} */
export default {
  // `content` memberitahu Tailwind file mana yang menggunakan class-nya.
  // Ini penting agar Tailwind tahu CSS apa yang harus dibuat.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  // `theme` adalah tempat untuk mengkustomisasi desain sistem Tailwind.
  theme: {
    extend: {
      // Kita menambahkan font 'Inter' di sini agar bisa digunakan di seluruh aplikasi.
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  
  // `plugins` adalah tempat untuk menambahkan plugin tambahan.
  // Untuk saat ini, kita tidak memerlukan plugin apa pun.
  plugins: [],
}