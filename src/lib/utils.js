import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Menggabungkan class name Tailwind dengan aman tanpa konflik.
 * @param {...(string|Object|Array)} inputs - Kelas-kelas yang akan digabungkan.
 * @returns {string} String class name yang sudah digabungkan.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Menghitung masa kerja dari tanggal bergabung hingga saat ini.
 * @param {string} joinDateString - Tanggal bergabung dalam format 'YYYY-MM-DD'.
 * @returns {string} String yang mendeskripsikan masa kerja (contoh: "3 tahun, 5 bulan").
 */
export function calculateMasaKerja(joinDateString) {
  if (!joinDateString) return "N/A";
  const joinDate = new Date(joinDateString);
  const now = new Date();
  if (joinDate > now) return "Tanggal tidak valid";

  let years = now.getFullYear() - joinDate.getFullYear();
  let months = now.getMonth() - joinDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years === 0 && months === 0) return "Kurang dari 1 bulan";

  const yearText = years > 0 ? `${years} tahun` : '';
  const monthText = months > 0 ? `${months} bulan` : '';

  return [yearText, monthText].filter(Boolean).join(', ');
}

/**
 * Mendapatkan grade selanjutnya dari daftar grade yang ada.
 * @param {string} currentGrade - Grade saat ini (misal: 'M1').
 * @param {string[]} allGrades - Array semua grade yang tersedia (misal: ['M1', 'M2', 'M3']).
 * @returns {string} Grade selanjutnya atau teks default.
 */
export function getNextGrade(currentGrade, allGrades) {
  const gradeIndex = allGrades.indexOf(currentGrade);
  if (gradeIndex > -1 && gradeIndex < allGrades.length - 1) {
    return allGrades[gradeIndex + 1];
  }
  return "ke jenjang selanjutnya";
}